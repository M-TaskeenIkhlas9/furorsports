const express = require('express');
const router = express.Router();
const { pool } = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Middleware to check if database is ready
const checkDatabase = (req, res, next) => {
  if (!pool) {
    return res.status(503).json({ 
      error: 'Database is not ready yet. Please wait a moment and try again.' 
    });
  }
  next();
};

// Apply middleware to all routes
router.use(checkDatabase);

// Get or create session ID
const getSessionId = (req) => {
  if (!req.sessionId) {
    req.sessionId = uuidv4();
  }
  return req.sessionId;
};

// Get cart items
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const [rows] = await pool.query(
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
      [sessionId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { sessionId, productId, quantity = 1, size = null, color = null } = req.body;
    
    if (!sessionId || !productId) {
      res.status(400).json({ error: 'Session ID and Product ID are required' });
      return;
    }
    
    // Check if item with same product, size, and color already exists in cart
    const [existingRows] = await pool.query(
      'SELECT * FROM cart WHERE session_id = ? AND product_id = ? AND (size = ? OR (size IS NULL AND ? IS NULL)) AND (color = ? OR (color IS NULL AND ? IS NULL))',
      [sessionId, productId, size, size, color, color]
    );
    
    if (existingRows.length > 0) {
      // Update quantity
      const row = existingRows[0];
      await pool.query(
        'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
        [quantity, row.id]
      );
      res.json({ message: 'Cart updated', id: row.id });
    } else {
      // Insert new item
      const [result] = await pool.query(
        'INSERT INTO cart (session_id, product_id, quantity, size, color) VALUES (?, ?, ?, ?, ?)',
        [sessionId, productId, quantity, size, color]
      );
      res.json({ message: 'Item added to cart', id: result.insertId });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update cart item quantity
router.put('/update', async (req, res) => {
  try {
    const { sessionId, cartItemId, quantity } = req.body;
    
    if (!cartItemId) {
      return res.status(400).json({ error: 'Cart item ID is required' });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await pool.query(
        'DELETE FROM cart WHERE id = ? AND session_id = ?',
        [cartItemId, sessionId]
      );
      res.json({ message: 'Item removed from cart' });
    } else {
      await pool.query(
        'UPDATE cart SET quantity = ? WHERE id = ? AND session_id = ?',
        [quantity, cartItemId, sessionId]
      );
      res.json({ message: 'Cart updated' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete('/remove', async (req, res) => {
  try {
    const { sessionId, cartItemId } = req.body;
    
    if (!cartItemId) {
      return res.status(400).json({ error: 'Cart item ID is required' });
    }
    
    await pool.query(
      'DELETE FROM cart WHERE id = ? AND session_id = ?',
      [cartItemId, sessionId]
    );
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear cart
router.delete('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    await pool.query('DELETE FROM cart WHERE session_id = ?', [sessionId]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
