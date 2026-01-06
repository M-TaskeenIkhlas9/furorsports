const express = require('express');
const router = express.Router();
const { pool, isReady } = require('../database/db');

// Middleware to check if database is ready
const checkDatabase = (req, res, next) => {
  if (!pool || !isReady()) {
    return res.status(503).json({ 
      error: 'Database is not ready yet. Please wait a moment and try again.',
      status: 'database_initializing'
    });
  }
  next();
};

// Apply middleware to all routes
router.use(checkDatabase);

// Get all categories with their subcategories
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id as category_id,
        c.name as category_name,
        s.id as subcategory_id,
        s.name as subcategory_name
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      ORDER BY c.name, s.name
    `);
    
    // Group by category
    const categoriesMap = {};
    rows.forEach(row => {
      if (!categoriesMap[row.category_name]) {
        categoriesMap[row.category_name] = {
          id: row.category_id,
          name: row.category_name,
          subcategories: []
        };
      }
      
      if (row.subcategory_name) {
        categoriesMap[row.category_name].subcategories.push({
          id: row.subcategory_id,
          name: row.subcategory_name
        });
      }
    });
    
    res.json(Object.values(categoriesMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all categories (names only)
router.get('/names', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get subcategories for a specific category
router.get('/:categoryId/subcategories', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const [rows] = await pool.query(
      'SELECT id, name FROM subcategories WHERE category_id = ? ORDER BY name',
      [categoryId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO categories (name) VALUES (?)',
      [name.trim()]
    );
    
    res.json({
      success: true,
      id: result.insertId,
      name: name.trim(),
      message: 'Category added successfully'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate entry')) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const [result] = await pool.query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name.trim(), id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({
      success: true,
      message: 'Category updated successfully'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate entry')) {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Subcategories are automatically deleted due to CASCADE
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add subcategory
router.post('/:categoryId/subcategories', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Subcategory name is required' });
    }
    
    // Check if category exists
    const [categoryRows] = await pool.query('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (categoryRows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO subcategories (category_id, name) VALUES (?, ?)',
      [categoryId, name.trim()]
    );
    
    res.json({
      success: true,
      id: result.insertId,
      name: name.trim(),
      message: 'Subcategory added successfully'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate entry')) {
      return res.status(400).json({ error: 'Subcategory already exists for this category' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update subcategory
router.put('/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Subcategory name is required' });
    }
    
    const [result] = await pool.query(
      'UPDATE subcategories SET name = ? WHERE id = ?',
      [name.trim(), id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    res.json({
      success: true,
      message: 'Subcategory updated successfully'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('Duplicate entry')) {
      return res.status(400).json({ error: 'Subcategory name already exists for this category' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete subcategory
router.delete('/subcategories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM subcategories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
