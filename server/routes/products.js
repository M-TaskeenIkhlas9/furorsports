const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

// Get all products
router.get('/', (req, res) => {
  const db = getDb();
  const { category, subcategory, search, limit } = req.query;
  
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (subcategory) {
    query += ' AND subcategory = ?';
    params.push(subcategory);
  }
  
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  // Always order by newest first (created_at DESC)
  query += ' ORDER BY created_at DESC';
  
  // Add LIMIT if specified
  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      query += ' LIMIT ?';
      params.push(limitNum);
    }
  }
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single product by ID
router.get('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(row);
  });
});

// Get products by category
router.get('/category/:category', (req, res) => {
  const db = getDb();
  const { category } = req.params;
  
  db.all('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC', [category], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all categories
router.get('/meta/categories', (req, res) => {
  const db = getDb();
  
  db.all('SELECT DISTINCT category FROM products ORDER BY category', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => row.category));
  });
});

module.exports = router;

