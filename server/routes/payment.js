const express = require('express');
const router = express.Router();
const { pool } = require('../database/db');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// Initialize Stripe with error handling
let stripe;
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('WARNING: STRIPE_SECRET_KEY is not set in environment variables');
  }
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    // Check if Stripe is properly initialized
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is missing from environment variables');
      return res.status(500).json({ 
        error: 'Payment service is not configured. Please contact support.' 
      });
    }

    if (!stripe) {
      stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }

    const { items, customerInfo, sessionId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    // Calculate total amount (convert to cents for Stripe)
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const amountInCents = Math.round(totalAmount * 100);

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || '',
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/checkout?canceled=true`,
      customer_email: customerInfo.email,
      metadata: {
        sessionId: sessionId,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone || '',
        customerAddress: customerInfo.address,
        customerCity: customerInfo.city,
        customerCountry: customerInfo.country,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment and create order
router.post('/verify-payment', async (req, res) => {
  try {
    // Check if Stripe is properly initialized
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is missing from environment variables');
      return res.status(500).json({ 
        error: 'Payment service is not configured. Please contact support.' 
      });
    }

    if (!stripe) {
      stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    }

    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const metadata = session.metadata;
      
      // Generate order number
      const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const totalAmount = session.amount_total / 100; // Convert from cents

      // Get cart items from session
      const cartSessionId = metadata.sessionId;
      
      const [cartItems] = await pool.query(
        `SELECT c.*, p.name, p.price, p.description 
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         WHERE c.session_id = ?`,
        [cartSessionId]
      );

      const connection = await pool.getConnection();
      await connection.beginTransaction();
      
      try {
        // Insert order
        const [orderResult] = await connection.query(
          `INSERT INTO orders (
            order_number, customer_name, email, phone, address, city, country, 
            total_amount, status, payment_intent_id, payment_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing', ?, 'paid')`,
          [
            orderNumber,
            metadata.customerName,
            metadata.customerEmail,
            metadata.customerPhone,
            metadata.customerAddress,
            metadata.customerCity,
            metadata.customerCountry,
            totalAmount,
            session.payment_intent
          ]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of cartItems) {
          await connection.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price, size, color) VALUES (?, ?, ?, ?, ?, ?)',
            [orderId, item.product_id, item.quantity, item.price, item.size || null, item.color || null]
          );
        }

        // Clear cart
        await connection.query('DELETE FROM cart WHERE session_id = ?', [cartSessionId]);
        
        // Create admin notification (non-blocking)
        try {
          await connection.query(
            `INSERT INTO admin_notifications (type, title, message, order_id, order_number)
             VALUES (?, ?, ?, ?, ?)`,
            [
              'new_order',
              'New Order Received',
              `New order ${orderNumber} from ${metadata.customerName} - Total: $${totalAmount.toFixed(2)}`,
              orderId,
              orderNumber
            ]
          );
          console.log('Admin notification created for order:', orderNumber);
        } catch (notifErr) {
          console.error('Error creating admin notification:', notifErr);
        }
        
        await connection.commit();
        
        // Send order confirmation email to customer (non-blocking)
        const shippingAddress = `${metadata.customerAddress}, ${metadata.customerCity}, ${metadata.customerCountry}`;
        const orderEmailData = {
          orderNumber,
          customerName: metadata.customerName,
          customerEmail: metadata.customerEmail,
          totalAmount,
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress
        };
        
        sendOrderConfirmationEmail(orderEmailData).then(result => {
          if (result.success) {
            console.log('Order confirmation email sent to customer');
          } else {
            console.log('Order confirmation email failed:', result.error);
          }
        }).catch(err => {
          console.error('Error sending order confirmation email:', err);
        });
        
        res.json({
          message: 'Order created successfully',
          orderNumber,
          orderId,
          paymentStatus: 'paid'
        });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Note: Webhook endpoint should be added to server/index.js with raw body parser
// This is handled separately because webhooks need raw body, not JSON

module.exports = router;
