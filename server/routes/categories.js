const express = require('express');
const router = express.Router();
const { getDb } = require('../database/db');

// Get all categories with their subcategories
router.get('/', (req, res) => {
  const db = getDb();
  
  db.all(`
    SELECT 
      c.id as category_id,
      c.name as category_name,
      s.id as subcategory_id,
      s.name as subcategory_name
    FROM categories c
    LEFT JOIN subcategories s ON c.id = s.category_id
    ORDER BY c.name, s.name
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
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
  });
});

// Get all categories (names only)
router.get('/names', (req, res) => {
  const db = getDb();
  
  db.all('SELECT id, name FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get subcategories for a specific category
router.get('/:categoryId/subcategories', (req, res) => {
  const db = getDb();
  const { categoryId } = req.params;
  
  db.all(
    'SELECT id, name FROM subcategories WHERE category_id = ? ORDER BY name',
    [categoryId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Add new category
router.post('/', (req, res) => {
  const db = getDb();
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }
  
  db.run(
    'INSERT INTO categories (name) VALUES (?)',
    [name.trim()],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Category already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        success: true,
        id: this.lastID,
        name: name.trim(),
        message: 'Category added successfully'
      });
    }
  );
});

// Update category
router.put('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }
  
  db.run(
    'UPDATE categories SET name = ? WHERE id = ?',
    [name.trim(), id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Category name already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json({
        success: true,
        message: 'Category updated successfully'
      });
    }
  );
});

// Delete category
router.delete('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    // Subcategories are automatically deleted due to CASCADE
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  });
});

// Add subcategory
router.post('/:categoryId/subcategories', (req, res) => {
  const db = getDb();
  const { categoryId } = req.params;
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Subcategory name is required' });
  }
  
  // Check if category exists
  db.get('SELECT id FROM categories WHERE id = ?', [categoryId], (err, category) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    db.run(
      'INSERT INTO subcategories (category_id, name) VALUES (?, ?)',
      [categoryId, name.trim()],
      function(subErr) {
        if (subErr) {
          if (subErr.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Subcategory already exists for this category' });
          }
          return res.status(500).json({ error: subErr.message });
        }
        
        res.json({
          success: true,
          id: this.lastID,
          name: name.trim(),
          message: 'Subcategory added successfully'
        });
      }
    );
  });
});

// Update subcategory
router.put('/subcategories/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Subcategory name is required' });
  }
  
  db.run(
    'UPDATE subcategories SET name = ? WHERE id = ?',
    [name.trim(), id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Subcategory name already exists for this category' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Subcategory not found' });
      }
      
      res.json({
        success: true,
        message: 'Subcategory updated successfully'
      });
    }
  );
});

// Delete subcategory
router.delete('/subcategories/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  db.run('DELETE FROM subcategories WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    
    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  });
});

module.exports = router;

