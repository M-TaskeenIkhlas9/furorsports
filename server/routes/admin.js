const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../database/db');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../client/public/images/products');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, name + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
  }
});

// Admin login
router.post('/login', (req, res) => {
  const { password } = req.body;
  const db = getDb();
  
  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required' });
  }
  
  // Get admin password from database
  db.get('SELECT password FROM admin ORDER BY id LIMIT 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (!row) {
      return res.status(500).json({ success: false, error: 'Admin not configured' });
    }
    
    if (password === row.password) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid password' });
    }
  });
});

// Middleware to check admin authentication (simple check)
// Note: This middleware is currently not used, but kept for future use
const checkAdmin = (req, res, next) => {
  const { password } = req.body;
  const db = getDb();
  
  db.get('SELECT password FROM admin ORDER BY id LIMIT 1', [], (err, row) => {
    if (err || !row || password !== row.password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  });
};

// Get all products (admin view with all details)
router.get('/products', (req, res) => {
  const db = getDb();
  
  db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single product
router.get('/products/:id', (req, res) => {
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

// Add new product
router.post('/products', (req, res) => {
  const db = getDb();
  const { name, description, price, image, category, subcategory, stock } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }
  
  db.run(
    `INSERT INTO products (name, description, price, image, category, subcategory, stock) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, description || '', price, image || '', category, subcategory || '', stock || 100],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ 
        success: true, 
        id: this.lastID, 
        message: 'Product added successfully' 
      });
    }
  );
});

// Update product
router.put('/products/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { name, description, price, image, category, subcategory, stock } = req.body;
  
  db.run(
    `UPDATE products 
     SET name = ?, description = ?, price = ?, image = ?, category = ?, subcategory = ?, stock = ?
     WHERE id = ?`,
    [name, description, price, image, category, subcategory, stock, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.json({ success: true, message: 'Product updated successfully' });
    }
  );
});

// Delete product
router.delete('/products/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  });
});

// Get all orders
router.get('/orders', (req, res) => {
  const db = getDb();
  
  db.all(
    `SELECT o.*, 
     (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
     FROM orders o 
     ORDER BY o.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Get single order with items
router.get('/orders/:id', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    db.all(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [id],
      (err, items) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ ...order, items });
      }
    );
  });
});

// Update order status
router.put('/orders/:id/status', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }
  
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.json({ success: true, message: 'Order status updated' });
    }
  );
});

// Get dashboard statistics
router.get('/dashboard/stats', (req, res) => {
  const db = getDb();
  
  const stats = {};
  
  // Total products
  db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    stats.totalProducts = row.count;
    
    // Total orders
    db.get('SELECT COUNT(*) as count FROM orders', [], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      stats.totalOrders = row.count;
      
      // Total revenue
      db.get('SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "paid"', [], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        stats.totalRevenue = row.total || 0;
        
        // Low stock products
        db.get('SELECT COUNT(*) as count FROM products WHERE stock < 10', [], (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          stats.lowStockProducts = row.count;
          
          // Pending orders
          db.get('SELECT COUNT(*) as count FROM orders WHERE status = "pending"', [], (err, row) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            stats.pendingOrders = row.count;
            
            res.json(stats);
          });
        });
      });
    });
  });
});

// Upload image endpoint
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Return the path that will be used in the frontend
    const imagePath = `/images/products/${req.file.filename}`;
    res.json({ 
      success: true, 
      imagePath: imagePath,
      filename: req.file.filename 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all categories and subcategories
router.get('/categories', (req, res) => {
  const db = getDb();
  
  db.all(
    `SELECT DISTINCT category, subcategory 
     FROM products 
     WHERE category IS NOT NULL 
     ORDER BY category, subcategory`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const categories = {};
      rows.forEach(row => {
        if (!categories[row.category]) {
          categories[row.category] = [];
        }
        if (row.subcategory && !categories[row.category].includes(row.subcategory)) {
          categories[row.category].push(row.subcategory);
        }
      });
      
      res.json(categories);
    }
  );
});

// Change admin password
router.post('/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = getDb();
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current password and new password are required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
  }
  
  // Verify current password
  db.get('SELECT password FROM admin ORDER BY id LIMIT 1', [], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    
    if (!row) {
      return res.status(500).json({ success: false, error: 'Admin not configured' });
    }
    
    if (currentPassword !== row.password) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    
    // Update password
    db.run(
      'UPDATE admin SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM admin ORDER BY id LIMIT 1)',
      [newPassword],
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, error: 'Failed to update password' });
        }
        
        res.json({ success: true, message: 'Password changed successfully' });
      }
    );
  });
});

module.exports = router;

