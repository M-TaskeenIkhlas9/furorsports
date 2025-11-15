const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

// Generate order number
const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Create order
router.post('/create', (req, res) => {
  const db = getDb();
  const { sessionId, customerInfo, items } = req.body;
  
  if (!sessionId || !customerInfo || !items || items.length === 0) {
    res.status(400).json({ error: 'Missing required information' });
    return;
  }
  
  const orderNumber = generateOrderNumber();
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  db.serialize(() => {
    // Insert order
    db.run(
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
      ],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        const orderId = this.lastID;
        
        // Insert order items
        const stmt = db.prepare(
          'INSERT INTO order_items (order_id, product_id, quantity, price, size, color) VALUES (?, ?, ?, ?, ?, ?)'
        );
        
        let itemsProcessed = 0;
        let hasError = false;
        
        items.forEach(item => {
          stmt.run([orderId, item.product_id, item.quantity, item.price, item.size || null, item.color || null], (err) => {
            if (err && !hasError) {
              hasError = true;
              stmt.finalize(() => {
                res.status(500).json({ error: err.message });
              });
              return;
            }
            if (!hasError) {
              itemsProcessed++;
              if (itemsProcessed === items.length) {
                stmt.finalize(() => {
                  // Clear cart
                  db.run('DELETE FROM cart WHERE session_id = ?', [sessionId], (err) => {
                    if (err) {
                      res.status(500).json({ error: err.message });
                      return;
                    }
                    res.json({
                      message: 'Order created successfully',
                      orderNumber,
                      orderId
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
});

// Get order by order number
router.get('/:orderNumber', (req, res) => {
  const db = getDb();
  const { orderNumber } = req.params;
  
  db.get(
    'SELECT * FROM orders WHERE order_number = ?',
    [orderNumber],
    (err, order) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      // Get order items
      db.all(
        `SELECT oi.*, p.name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id],
        (err, items) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ ...order, items });
        }
      );
    }
  );
});

module.exports = router;

