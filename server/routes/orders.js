const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { sendAdminOrderNotification } = require('../utils/emailService');

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

// Create WhatsApp order (pending status, no payment)
router.post('/create-whatsapp', (req, res) => {
  const db = getDb();
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
  
  db.serialize(() => {
    // Insert order with pending status
    db.run(
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
                  // Get full order details with items for WhatsApp message
                  db.all(
                    `SELECT oi.*, p.name, p.image 
                     FROM order_items oi 
                     JOIN products p ON oi.product_id = p.id 
                     WHERE oi.order_id = ?`,
                    [orderId],
                    (err, orderItems) => {
                      if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                      }
                      
                      // Clear cart BEFORE sending response to prevent duplicate orders
                      db.run('DELETE FROM cart WHERE session_id = ?', [sessionId], (err) => {
                        if (err) {
                          console.error('Error clearing cart:', err);
                        } else {
                          console.log('Cart cleared for session:', sessionId, '- Order:', orderNumber);
                        }
                        
                        // Create admin notification
                        db.run(
                          `INSERT INTO admin_notifications (type, title, message, order_id, order_number)
                           VALUES (?, ?, ?, ?, ?)`,
                          [
                            'new_order',
                            'New WhatsApp Order Received',
                            `New order ${orderNumber} from ${customerInfo.name} - Please provide pricing via WhatsApp`,
                            orderId,
                            orderNumber
                          ],
                          (notifErr) => {
                            if (notifErr) {
                              console.error('Error creating admin notification:', notifErr);
                            }
                          }
                        );
                        
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
                      });
                    }
                  );
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

