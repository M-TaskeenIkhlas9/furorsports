const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

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
      const db = getDb();
      const metadata = session.metadata;
      
      // Generate order number
      const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const totalAmount = session.amount_total / 100; // Convert from cents

      // Get cart items from session
      const cartSessionId = metadata.sessionId;
      
      db.all(
        `SELECT c.*, p.name, p.price, p.description 
         FROM cart c 
         JOIN products p ON c.product_id = p.id 
         WHERE c.session_id = ?`,
        [cartSessionId],
        (err, cartItems) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          db.serialize(() => {
            // Insert order
            db.run(
              `INSERT INTO orders (
                order_number, customer_name, email, phone, address, city, country, 
                total_amount, status, payment_intent_id, payment_status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, 'paid')`,
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
              ],
              function(err) {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }

                const orderId = this.lastID;

                // Insert order items
                const stmt = db.prepare(
                  'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
                );

                let itemsProcessed = 0;
                let hasError = false;
                
                cartItems.forEach(item => {
                  stmt.run([orderId, item.product_id, item.quantity, item.price], (err) => {
                    if (err && !hasError) {
                      hasError = true;
                      stmt.finalize(() => {
                        return res.status(500).json({ error: err.message });
                      });
                      return;
                    }
                    if (!hasError) {
                      itemsProcessed++;
                      if (itemsProcessed === cartItems.length) {
                        stmt.finalize(() => {
                          // Clear cart
                          db.run('DELETE FROM cart WHERE session_id = ?', [cartSessionId], (err) => {
                            if (err) {
                              return res.status(500).json({ error: err.message });
                            }
                            res.json({
                              message: 'Order created successfully',
                              orderNumber,
                              orderId,
                              paymentStatus: 'paid'
                            });
                          });
                        });
                      }
                    }
                  });
                });
              }
            );
          });
        }
      );
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

