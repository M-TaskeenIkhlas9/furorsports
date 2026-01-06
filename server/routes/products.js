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

// Get all products
router.get('/', async (req, res) => {
  try {
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
    
    const [rows] = await pool.query(query, params);
    res.json(rows || []);
  } catch (err) {
    console.error('Error in GET /api/products:', err);
    res.status(500).json({ 
      error: err.message,
      details: 'Failed to fetch products. Please check database connection.'
    });
  }
});

// Get single product by ID with images and variants
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const product = products[0];
    
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    
    // Get product images
    const [images] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order, id', [id]);
    
    // Get product variants (sizes and colors)
    const [variants] = await pool.query('SELECT * FROM product_variants WHERE product_id = ? ORDER BY size, color', [id]);
    
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE category = ? ORDER BY created_at DESC', [category]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all categories
router.get('/meta/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(rows.map(row => row.category));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get featured products for hero section
router.get('/featured/hero', async (req, res) => {
  try {
    // Get up to 5 featured products, or newest products if none are featured
    const [featuredRows] = await pool.query(`
      SELECT * FROM products 
      WHERE featured = 1 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    // If no featured products, get 3 newest products
    if (featuredRows.length === 0) {
      const [newRows] = await pool.query(`
        SELECT * FROM products 
        ORDER BY created_at DESC 
        LIMIT 3
      `);
      res.json(newRows);
    } else {
      res.json(featuredRows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
