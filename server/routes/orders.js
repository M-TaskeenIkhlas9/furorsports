const express = require('express');
const router = express.Router();
const { pool } = require('../database/db');
const { sendAdminOrderNotification } = require('../utils/emailService');

// Middleware to check if database is ready
const checkDatabase = (req, res, next) => {
  if (!pool) {
    return res.status(503).json({ 
      error: 'Database is not ready yet. Please wait a moment and try again.' 
    });
  }
  next();
};

router.use(checkDatabase);

// Generate order number
const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Create order
router.post('/create', async (req, res) => {
  try {
    const { sessionId, customerInfo, items } = req.body;
    
    if (!sessionId || !customerInfo || !items || items.length === 0) {
      res.status(400).json({ error: 'Missing required information' });
      return;
    }
    
    const orderNumber = generateOrderNumber();
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert order
      const [orderResult] = await connection.query(
        `INSERT INTO orders (order_number, customer_name, email, phone, address, city, country, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing')`,
        [
          orderNumber,
          customerInfo.name,
          customerInfo.email,
          customerInfo.phone || '',
          customerInfo.address,
          customerInfo.city,
          customerInfo.country,
          totalAmount
        ]
      );
      
      const orderId = orderResult.insertId;
      
      // Insert order items
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price, size, color) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price, item.size || null, item.color || null]
        );
      }
      
      // Clear cart
      await connection.query('DELETE FROM cart WHERE session_id = ?', [sessionId]);
      
      await connection.commit();
      
      res.json({
        message: 'Order created successfully',
        orderNumber,
        orderId
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create WhatsApp order (pending status, no payment)
router.post('/create-whatsapp', async (req, res) => {
  try {
    const { sessionId, customerInfo, items } = req.body;
    
    if (!sessionId || !customerInfo || !items || items.length === 0) {
      res.status(400).json({ error: 'Missing required information' });
      return;
    }
    
    // Validate items array
    if (!Array.isArray(items)) {
      res.status(400).json({ error: 'Items must be an array' });
      return;
    }
    
    // Calculate total amount - ensure we're using the correct price
    const totalAmount = items.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity) || 0;
      return sum + (itemPrice * itemQuantity);
    }, 0);
    
    // Validate total amount
    if (totalAmount <= 0 || isNaN(totalAmount)) {
      res.status(400).json({ error: 'Invalid order total amount' });
      return;
    }
    
    const orderNumber = generateOrderNumber();
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert order with pending status
      const [orderResult] = await connection.query(
        `INSERT INTO orders (order_number, customer_name, email, phone, address, city, country, total_amount, status, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
        [
          orderNumber,
          customerInfo.name,
          customerInfo.email,
          customerInfo.phone || '',
          customerInfo.address,
          customerInfo.city,
          customerInfo.country,
          totalAmount
        ]
      );
      
      const orderId = orderResult.insertId;
      
      // Insert order items
      for (const item of items) {
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price, size, color) VALUES (?, ?, ?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price, item.size || null, item.color || null]
        );
      }
      
      // Get full order details with items for WhatsApp message
      const [orderItems] = await connection.query(
        `SELECT oi.*, p.name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [orderId]
      );
      
      // Clear cart BEFORE sending response to prevent duplicate orders
      await connection.query('DELETE FROM cart WHERE session_id = ?', [sessionId]);
      console.log('Cart cleared for session:', sessionId, '- Order:', orderNumber);
      
      // Create admin notification
      try {
        await connection.query(
          `INSERT INTO admin_notifications (type, title, message, order_id, order_number)
           VALUES (?, ?, ?, ?, ?)`,
          [
            'new_order',
            'New WhatsApp Order Received',
            `New order ${orderNumber} from ${customerInfo.name} - Please provide pricing via WhatsApp`,
            orderId,
            orderNumber
          ]
        );
      } catch (notifErr) {
        console.error('Error creating admin notification:', notifErr);
      }
      
      await connection.commit();
      
      // Send email notification to admin (non-blocking)
      const adminOrderData = {
        orderNumber,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone || '',
        address: customerInfo.address,
        city: customerInfo.city,
        country: customerInfo.country,
        totalAmount,
        items: orderItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size || null,
          color: item.color || null
        }))
      };
      
      sendAdminOrderNotification(adminOrderData).then(result => {
        if (result.success) {
          console.log('Admin email notification sent for order:', orderNumber);
        } else {
          console.log('Admin email notification failed (email service may not be configured):', result.error);
        }
      }).catch(err => {
        console.error('Error sending admin email notification:', err);
      });
      
      res.json({
        message: 'Order created successfully',
        orderNumber,
        orderId,
        order: {
          order_number: orderNumber,
          customer_name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone || '',
          address: customerInfo.address,
          city: customerInfo.city,
          country: customerInfo.country,
          total_amount: totalAmount,
          status: 'pending',
          payment_status: 'pending',
          items: orderItems
        }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order by order number
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE order_number = ?',
      [orderNumber]
    );
    
    if (orders.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    const order = orders[0];
    
    // Get order items
    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [order.id]
    );
    
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
