const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Get or create session ID
const getSessionId = (req) => {
  if (!req.sessionId) {
    req.sessionId = uuidv4();
  }
  return req.sessionId;
};

// Get cart items
router.get('/:sessionId', (req, res) => {
  const db = getDb();
  const { sessionId } = req.params;
  
  db.all(
    `SELECT c.*, p.name, 
     CASE 
       WHEN p.sale_price IS NOT NULL AND p.sale_price < p.price THEN p.sale_price 
       ELSE p.price 
     END as price,
     p.image, p.description, p.sale_price, p.price as original_price
     FROM cart c 
     JOIN products p ON c.product_id = p.id 
     WHERE c.session_id = ?
     ORDER BY c.created_at DESC`,
    [sessionId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Add item to cart
router.post('/add', (req, res) => {
  const db = getDb();
  const { sessionId, productId, quantity = 1, size = null, color = null } = req.body;
  
  if (!sessionId || !productId) {
    res.status(400).json({ error: 'Session ID and Product ID are required' });
    return;
  }
  
  // Check if item with same product, size, and color already exists in cart
  db.get(
    'SELECT * FROM cart WHERE session_id = ? AND product_id = ? AND (size = ? OR (size IS NULL AND ? IS NULL)) AND (color = ? OR (color IS NULL AND ? IS NULL))',
    [sessionId, productId, size, size, color, color],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (row) {
        // Update quantity
        db.run(
          'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
          [quantity, row.id],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: 'Cart updated', id: row.id });
          }
        );
      } else {
        // Insert new item
        db.run(
          'INSERT INTO cart (session_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)',
          [sessionId, productId, quantity, size, color],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: 'Item added to cart', id: this.lastID });
          }
        );
      }
    }
  );
});

// Update cart item quantity
router.put('/update', (req, res) => {
  const db = getDb();
  const { sessionId, cartItemId, quantity } = req.body;
  
  if (!cartItemId) {
    return res.status(400).json({ error: 'Cart item ID is required' });
  }
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    db.run(
      'DELETE FROM cart WHERE id = ? AND session_id = ?',
      [cartItemId, sessionId],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Item removed from cart' });
      }
    );
  } else {
    db.run(
      'UPDATE cart SET quantity = ? WHERE id = ? AND session_id = ?',
      [quantity, cartItemId, sessionId],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Cart updated' });
      }
    );
  }
});

// Remove item from cart
router.delete('/remove', (req, res) => {
  const db = getDb();
  const { sessionId, cartItemId } = req.body;
  
  if (!cartItemId) {
    return res.status(400).json({ error: 'Cart item ID is required' });
  }
  
  db.run(
    'DELETE FROM cart WHERE id = ? AND session_id = ?',
    [cartItemId, sessionId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Item removed from cart' });
    }
  );
});

// Clear cart
router.delete('/clear/:sessionId', (req, res) => {
  const db = getDb();
  const { sessionId } = req.params;
  
  db.run('DELETE FROM cart WHERE session_id = ?', [sessionId], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Cart cleared' });
  });
});

module.exports = router;

