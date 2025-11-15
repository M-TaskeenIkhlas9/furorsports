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

// Get single product by ID with images and variants
router.get('/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    // Get product images
    db.all('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order, id', [id], (err, images) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Get product variants (sizes and colors)
      db.all('SELECT * FROM product_variants WHERE product_id = ? ORDER BY size, color', [id], (err, variants) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Combine product with images and variants
        // Always include the main product image as the first image if it exists
        let allImages = [];
        
        // Add main product image first if it exists and is not already in the images array
        if (product.image) {
          const mainImageUrl = product.image;
          const mainImageExists = images.some(img => img.image_url === mainImageUrl);
          if (!mainImageExists) {
            allImages.push({ id: 0, image_url: mainImageUrl, display_order: -1 });
          }
        }
        
        // Add all additional images from product_images table
        allImages = [...allImages, ...images];
        
        // If no images at all, use empty array
        if (allImages.length === 0 && !product.image) {
          allImages = [];
        }
        
        const productData = {
          ...product,
          images: allImages.map(img => img.image_url),
          imageData: allImages, // Include full image data with IDs
          variants: variants,
          // Extract unique sizes and colors
          sizes: [...new Set(variants.filter(v => v.size).map(v => v.size))],
          colors: [...new Set(variants.filter(v => v.color).map(v => v.color))]
        };
        
        res.json(productData);
      });
    });
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

// Get featured products for hero section
router.get('/featured/hero', (req, res) => {
  const db = getDb();
  
  // Get up to 5 featured products, or newest products if none are featured
  db.all(`
    SELECT * FROM products 
    WHERE featured = 1 
    ORDER BY created_at DESC 
    LIMIT 5
  `, [], (err, featuredRows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // If no featured products, get 3 newest products
    if (featuredRows.length === 0) {
      db.all(`
        SELECT * FROM products 
        ORDER BY created_at DESC 
        LIMIT 3
      `, [], (err, newRows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(newRows);
      });
    } else {
      res.json(featuredRows);
    }
  });
});

module.exports = router;

