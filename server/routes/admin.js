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
  const { name, description, price, sale_price, image, category, subcategory, stock, featured } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }
  
  db.run(
    `INSERT INTO products (name, description, price, sale_price, image, category, subcategory, stock, featured) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, description || '', price, sale_price || null, image || '', category, subcategory || '', stock || 100, featured ? 1 : 0],
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
  const { name, description, price, sale_price, image, category, subcategory, stock, featured } = req.body;
  
  db.run(
    `UPDATE products 
     SET name = ?, description = ?, price = ?, sale_price = ?, image = ?, category = ?, subcategory = ?, stock = ?, featured = ?
     WHERE id = ?`,
    [name, description || '', price, sale_price || null, image || '', category, subcategory || '', stock || 100, featured ? 1 : 0, id],
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
       WHERE oi.order_id = ?
       ORDER BY oi.id`,
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
  
  // Get current order to check if we need to adjust revenue
  db.get('SELECT status, total_amount, payment_status FROM orders WHERE id = ?', [id], (err, order) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order status
    db.run(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Order not found' });
        }
        
        // If order is canceled and was previously paid, revenue is already accounted for
        // Revenue calculation is based on payment_status = 'paid', so canceling doesn't affect it
        // The revenue will only count paid orders, so canceled orders won't be included
        res.json({ success: true, message: 'Order status updated' });
      }
    );
  });
});

// Get revenue analytics
router.get('/revenue/analytics', (req, res) => {
  const db = getDb();
  const { period = 'daily', month, year } = req.query; // daily, weekly, monthly, and optional month/year
  
  let dateFormat, groupBy;
  if (period === 'daily') {
    dateFormat = "date(created_at)";
    groupBy = "date(created_at)";
  } else if (period === 'weekly') {
    dateFormat = "strftime('%Y-W%W', created_at)";
    groupBy = "strftime('%Y-W%W', created_at)";
  } else if (period === 'monthly') {
    dateFormat = "strftime('%Y-%m', created_at)";
    groupBy = "strftime('%Y-%m', created_at)";
  } else {
    return res.status(400).json({ error: 'Invalid period. Use daily, weekly, or monthly' });
  }
  
  // Build date filter for selected month/year
  let dateFilter = '';
  if (month && year) {
    dateFilter = `AND strftime('%Y-%m', created_at) = '${year}-${String(month).padStart(2, '0')}'`;
  }
  
  const query = `
    SELECT 
      ${dateFormat} as date,
      SUM(total_amount) as revenue,
      COUNT(*) as orders
    FROM orders
    WHERE payment_status = 'paid' AND (status IS NULL OR (status != 'canceled' AND status != 'cancelled'))
    ${dateFilter}
    GROUP BY ${groupBy}
    ORDER BY date DESC
    LIMIT 30
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get revenue summary
router.get('/revenue/summary', (req, res) => {
  const db = getDb();
  const { month, year } = req.query; // Optional: month (1-12) and year (YYYY)
  
  const summary = {};
  
  // Build date filter for selected month/year or current month
  let monthFilter = '';
  if (month && year) {
    // Filter for specific month/year
    const monthStr = String(month).padStart(2, '0');
    monthFilter = `AND strftime('%Y-%m', created_at) = '${year}-${monthStr}'`;
  } else {
    // Default to current month
    monthFilter = `AND created_at >= date('now', 'start of month')`;
  }
  
      // Today's revenue
      db.get(
        `SELECT SUM(total_amount) as total, COUNT(*) as orders 
         FROM orders 
         WHERE payment_status = 'paid' AND (status IS NULL OR (status != 'canceled' AND status != 'cancelled')) 
         AND date(created_at) = date('now')`,
        [],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      summary.today = {
        revenue: row.total || 0,
        orders: row.orders || 0
      };
      
      // This week's revenue
      db.get(
        `SELECT SUM(total_amount) as total, COUNT(*) as orders 
         FROM orders 
         WHERE payment_status = 'paid' AND (status IS NULL OR (status != 'canceled' AND status != 'cancelled')) 
         AND created_at >= date('now', '-7 days')`,
        [],
        (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          summary.week = {
            revenue: row.total || 0,
            orders: row.orders || 0
          };
          
          // Selected month's revenue (or current month)
          db.get(
            `SELECT SUM(total_amount) as total, COUNT(*) as orders 
             FROM orders 
             WHERE payment_status = 'paid' AND (status IS NULL OR (status != 'canceled' AND status != 'cancelled')) 
             ${monthFilter}`,
            [],
            (err, row) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              summary.month = {
                revenue: row.total || 0,
                orders: row.orders || 0
              };
              
              // Total revenue
              db.get(
                `SELECT SUM(total_amount) as total, COUNT(*) as orders 
                 FROM orders 
                 WHERE payment_status = 'paid' AND (status IS NULL OR (status != 'canceled' AND status != 'cancelled'))`,
                [],
                (err, row) => {
                  if (err) {
                    return res.status(500).json({ error: err.message });
                  }
                  summary.total = {
                    revenue: row.total || 0,
                    orders: row.orders || 0
                  };
                  
                  res.json(summary);
                }
              );
            }
          );
        }
      );
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
      
      // Total revenue (only paid and not canceled)
      db.get('SELECT SUM(total_amount) as total FROM orders WHERE payment_status = "paid" AND (status IS NULL OR (status != "canceled" AND status != "cancelled"))', [], (err, row) => {
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
            
            // Non-shipped orders (status is 'processing' - orders that haven't been shipped yet)
            db.get(`SELECT COUNT(*) as count FROM orders 
                    WHERE status = 'processing'`, [], (err, row) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }
              stats.nonShippedOrders = row.count;
              
              // Non-delivered orders (status is NOT 'delivered' and NOT cancelled)
              db.get(`SELECT COUNT(*) as count FROM orders 
                      WHERE (status IS NULL OR status != 'delivered')
                      AND (status IS NULL OR (status != 'cancelled' AND status != 'canceled'))`, [], (err, row) => {
                if (err) {
                  return res.status(500).json({ error: err.message });
                }
                stats.nonDeliveredOrders = row.count;
                
                res.json(stats);
              });
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

// Get admin notifications
router.get('/notifications', (req, res) => {
  const db = getDb();
  
  db.all(
    `SELECT * FROM admin_notifications 
     ORDER BY created_at DESC 
     LIMIT 50`,
    [],
    (err, notifications) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(notifications);
    }
  );
});

// Get unread notifications count
router.get('/notifications/unread-count', (req, res) => {
  const db = getDb();
  
  db.get(
    `SELECT COUNT(*) as count FROM admin_notifications WHERE read = 0`,
    [],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ count: row.count });
    }
  );
});

// Mark notification as read
router.put('/notifications/:id/read', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  
  db.run(
    `UPDATE admin_notifications SET read = 1 WHERE id = ?`,
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

// Mark all notifications as read
router.put('/notifications/read-all', (req, res) => {
  const db = getDb();
  
  db.run(
    `UPDATE admin_notifications SET read = 1 WHERE read = 0`,
    [],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

// Add product image
router.post('/products/:id/images', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { imageUrl, displayOrder = 0 } = req.body;
  
  if (!imageUrl) {
    return res.status(400).json({ error: 'Image URL is required' });
  }
  
  db.run(
    'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
    [id, imageUrl, displayOrder],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Delete product image
router.delete('/products/:id/images/:imageId', (req, res) => {
  const db = getDb();
  const { id, imageId } = req.params;
  
  db.run(
    'DELETE FROM product_images WHERE id = ? AND product_id = ?',
    [imageId, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Add product variant (size/color)
router.post('/products/:id/variants', (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { size, color, stock = 0, priceAdjustment = 0 } = req.body;
  
  if (!size && !color) {
    return res.status(400).json({ error: 'Size or color is required' });
  }
  
  db.run(
    'INSERT INTO product_variants (product_id, size, color, stock, price_adjustment) VALUES (?, ?, ?, ?, ?)',
    [id, size || null, color || null, stock, priceAdjustment],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Update product variant
router.put('/products/:id/variants/:variantId', (req, res) => {
  const db = getDb();
  const { id, variantId } = req.params;
  const { size, color, stock, priceAdjustment } = req.body;
  
  db.run(
    'UPDATE product_variants SET size = ?, color = ?, stock = ?, price_adjustment = ? WHERE id = ? AND product_id = ?',
    [size || null, color || null, stock, priceAdjustment, variantId, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

// Delete product variant
router.delete('/products/:id/variants/:variantId', (req, res) => {
  const db = getDb();
  const { id, variantId } = req.params;
  
  db.run(
    'DELETE FROM product_variants WHERE id = ? AND product_id = ?',
    [variantId, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ success: true });
    }
  );
});

module.exports = router;

