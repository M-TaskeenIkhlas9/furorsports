const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const { isReady, getPool } = db;

// Middleware to check if database is ready
const checkDatabase = async (req, res, next) => {
  const pool = getPool();
  if (!pool) {
    return res.status(503).json({ 
      error: 'Database is not ready yet. Please wait a moment and try again.',
      status: 'database_initializing'
    });
  }
  
  if (!isReady()) {
    // Test if pool actually works even if isReady is false
    try {
      const pool = getPool();
      await pool.query('SELECT 1');
      // Pool works, continue
      next();
      return;
    } catch (err) {
      return res.status(503).json({ 
        error: 'Database is not ready yet. Please wait a moment and try again.',
        status: 'database_initializing'
      });
    }
  }
  
  next();
};

// Apply middleware to all routes (except upload-image which doesn't need DB)
router.use((req, res, next) => {
  if (req.path === '/upload-image') {
    return next(); // Skip DB check for image upload
  }
  checkDatabase(req, res, next);
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/images/products');
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
router.post('/login', async (req, res) => {
  try {
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }
    
    // Get admin password from database
    if (rows.length === 0) {
      return res.status(500).json({ success: false, error: 'Admin not configured' });
    }
    
    if (password === rows[0].password) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Middleware to check admin authentication (simple check)
// Note: This middleware is currently not used, but kept for future use
const checkAdmin = async (req, res, next) => {
  try {
    if (rows.length === 0 || password !== rows[0].password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// Get all products (admin view with all details)
router.get('/products', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new product
router.post('/products', async (req, res) => {
  try {
    const pool = getPool();
    const { name, description, price, sale_price, image, category, subcategory, stock, featured } = req.body;
    
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, sale_price, image, category, subcategory, stock, featured) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || '', price, sale_price || null, image || '', category, subcategory || '', stock || 100, featured ? 1 : 0]
    );
    
    res.json({ 
      success: true, 
      id: result.insertId, 
      message: 'Product added successfully' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { name, description, price, sale_price, image, category, subcategory, stock, featured } = req.body;
    
    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, sale_price = ?, image = ?, category = ?, subcategory = ?, stock = ?, featured = ?
       WHERE id = ?`,
      [name, description || '', price, sale_price || null, image || '', category, subcategory || '', stock || 100, featured ? 1 : 0, id]
    );
    
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT o.*, 
       (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o 
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single order with items
router.get('/orders/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    
    const order = orders[0];
    const [items] = await pool.query(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?
       ORDER BY oi.id`,
      [id]
    );
    
    res.json({ ...order, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order (only for delivered or cancelled orders)
router.delete('/orders/:id', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    
    // First check if order exists and its status
    const [orders] = await pool.query('SELECT status FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Only allow deletion of pending, delivered, or cancelled orders
    const statusLower = order.status?.toLowerCase();
    const allowedStatuses = ['pending', 'delivered', 'cancelled', 'canceled'];
    if (!allowedStatuses.includes(statusLower)) {
      return res.status(400).json({ 
        error: 'Only pending, delivered, or cancelled orders can be deleted' 
      });
    }
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete order items first (due to foreign key constraint)
      await connection.query('DELETE FROM order_items WHERE order_id = ?', [id]);
      
      // Delete admin notifications related to this order
      try {
        await connection.query('DELETE FROM admin_notifications WHERE order_id = ?', [id]);
      } catch (notifErr) {
        console.error('Error deleting notifications:', notifErr);
        // Continue even if notification deletion fails
      }
      
      // Delete the order
      const [result] = await connection.query('DELETE FROM orders WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Order not found' });
      }
      
      await connection.commit();
      res.json({ 
        success: true, 
        message: 'Order deleted successfully' 
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Get current order to check if we need to adjust revenue
    const [orders] = await pool.query('SELECT status, total_amount, payment_status FROM orders WHERE id = ?', [id]);
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order status
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // If order is canceled and was previously paid, revenue is already accounted for
    // Revenue calculation is based on payment_status = 'paid', so canceling doesn't affect it
    // The revenue will only count paid orders, so canceled orders won't be included
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get revenue analytics
router.get('/revenue/analytics', async (req, res) => {
  try {
    const pool = getPool();
    const { period = 'daily', month, year } = req.query; // daily, weekly, monthly, and optional month/year
    
    let dateFormat, groupBy;
    if (period === 'daily') {
      dateFormat = "DATE(created_at)";
      groupBy = "DATE(created_at)";
    } else if (period === 'weekly') {
      dateFormat = "CONCAT(YEAR(created_at), '-W', LPAD(WEEK(created_at), 2, '0'))";
      groupBy = "YEAR(created_at), WEEK(created_at)";
    } else if (period === 'monthly') {
      dateFormat = "DATE_FORMAT(created_at, '%Y-%m')";
      groupBy = "DATE_FORMAT(created_at, '%Y-%m')";
    } else {
      return res.status(400).json({ error: 'Invalid period. Use daily, weekly, or monthly' });
    }
    
    // Build date filter for selected month/year
    let dateFilter = '';
    const params = [];
    if (month && year) {
      dateFilter = `AND DATE_FORMAT(created_at, '%Y-%m') = ?`;
      params.push(`${year}-${String(month).padStart(2, '0')}`);
    }
    
    const query = `
      SELECT 
        ${dateFormat} as date,
        SUM(total_amount) as revenue,
        COUNT(*) as orders
      FROM orders
      WHERE status IN ('processing', 'shipped', 'delivered') 
        AND status != 'canceled' 
        AND status != 'cancelled'
      ${dateFilter}
      GROUP BY ${groupBy}
      ORDER BY date DESC
      LIMIT 30
    `;
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get revenue summary
router.get('/revenue/summary', async (req, res) => {
  try {
    const pool = getPool();
    const { month, year } = req.query; // Optional: month (1-12) and year (YYYY)
    
    const summary = {};
    
    // Build date filter for selected month/year or current month
    let monthFilter = '';
    const monthParams = [];
    if (month && year) {
      // Filter for specific month/year
      const monthStr = String(month).padStart(2, '0');
      monthFilter = `AND DATE_FORMAT(created_at, '%Y-%m') = ?`;
      monthParams.push(`${year}-${monthStr}`);
    } else {
      // Default to current month
      monthFilter = `AND created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')`;
    }
    
    // Today's revenue
    const [todayRows] = await pool.query(
      `SELECT SUM(total_amount) as total, COUNT(*) as orders 
       FROM orders 
       WHERE status IN ('processing', 'shipped', 'delivered') 
         AND status != 'canceled' 
         AND status != 'cancelled'
       AND DATE(created_at) = CURDATE()`
    );
    summary.today = {
      revenue: todayRows[0]?.total || 0,
      orders: todayRows[0]?.orders || 0
    };
    
    // This week's revenue
    const [weekRows] = await pool.query(
      `SELECT SUM(total_amount) as total, COUNT(*) as orders 
       FROM orders 
       WHERE status IN ('processing', 'shipped', 'delivered') 
         AND status != 'canceled' 
         AND status != 'cancelled'
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );
    summary.week = {
      revenue: weekRows[0]?.total || 0,
      orders: weekRows[0]?.orders || 0
    };
    
    // Selected month's revenue (or current month)
    const monthQuery = `
      SELECT SUM(total_amount) as total, COUNT(*) as orders 
      FROM orders 
      WHERE status IN ('processing', 'shipped', 'delivered') 
        AND status != 'canceled' 
        AND status != 'cancelled'
      ${monthFilter}
    `;
    const [monthRows] = await pool.query(monthQuery, monthParams);
    summary.month = {
      revenue: monthRows[0]?.total || 0,
      orders: monthRows[0]?.orders || 0
    };
    
    // Total revenue
    const [totalRows] = await pool.query(
      `SELECT SUM(total_amount) as total, COUNT(*) as orders 
       FROM orders 
       WHERE status IN ('processing', 'shipped', 'delivered') 
         AND status != 'canceled' 
         AND status != 'cancelled'`
    );
    summary.total = {
      revenue: totalRows[0]?.total || 0,
      orders: totalRows[0]?.orders || 0
    };
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
  try {
    const pool = getPool();
    const stats = {};
    
    // Total products
    const [productRows] = await pool.query('SELECT COUNT(*) as count FROM products');
    stats.totalProducts = productRows[0].count;
    
    // Total orders
    const [orderRows] = await pool.query('SELECT COUNT(*) as count FROM orders');
    stats.totalOrders = orderRows[0].count;
    
    // Total revenue (only confirmed orders: processing, shipped, delivered - not canceled)
    const [revenueRows] = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status IN ("processing", "shipped", "delivered") AND status != "canceled" AND status != "cancelled"');
    stats.totalRevenue = revenueRows[0]?.total || 0;
    
    // Low stock products
    const [lowStockRows] = await pool.query('SELECT COUNT(*) as count FROM products WHERE stock < 10');
    stats.lowStockProducts = lowStockRows[0].count;
    
    // Non-shipped orders (status is 'processing' - orders that haven't been shipped yet)
    const [nonShippedRows] = await pool.query(`SELECT COUNT(*) as count FROM orders WHERE status = 'processing'`);
    stats.nonShippedOrders = nonShippedRows[0].count;
    
    // Non-delivered orders (status is NOT 'delivered' and NOT cancelled)
    const [nonDeliveredRows] = await pool.query(`SELECT COUNT(*) as count FROM orders WHERE (status IS NULL OR status != 'delivered') AND (status IS NULL OR (status != 'cancelled' AND status != 'canceled'))`);
    stats.nonDeliveredOrders = nonDeliveredRows[0].count;
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
router.get('/categories', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT DISTINCT category, subcategory 
       FROM products 
       WHERE category IS NOT NULL 
       ORDER BY category, subcategory`
    );
    
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset admin password (for initial setup - use with caution)
router.post('/reset-password', async (req, res) => {
  try {
    const pool = getPool();
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ success: false, error: 'New password is required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }
    
    // Check if admin exists
    const [countRows] = await pool.query('SELECT COUNT(*) as count FROM admin');
    if (countRows[0].count === 0) {
      // Insert new password
      await pool.query('INSERT INTO admin (password) VALUES (?)', [newPassword]);
      res.json({ success: true, message: 'Password set successfully' });
    } else {
      // Update existing password
      await pool.query(
        'UPDATE admin SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM admin ORDER BY id LIMIT 1)',
        [newPassword]
      );
      res.json({ success: true, message: 'Password reset successfully' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Change admin password
router.post('/change-password', async (req, res) => {
  try {
    const pool = getPool();
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
    }
    
    // Verify current password
    const [rows] = await pool.query('SELECT password FROM admin ORDER BY id LIMIT 1');
    if (rows.length === 0) {
      return res.status(500).json({ success: false, error: 'Admin not configured' });
    }
    
    if (currentPassword !== rows[0].password) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    
    // Update password
    await pool.query(
      'UPDATE admin SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = (SELECT id FROM admin ORDER BY id LIMIT 1)',
      [newPassword]
    );
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Get admin notifications
router.get('/notifications', async (req, res) => {
  try {
    const pool = getPool();
    const [notifications] = await pool.query(
      `SELECT * FROM admin_notifications 
       ORDER BY created_at DESC 
       LIMIT 50`
    );
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread notifications count
router.get('/notifications/unread-count', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT COUNT(*) as count FROM admin_notifications WHERE read = 0`
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    await pool.query(
      `UPDATE admin_notifications SET read = 1 WHERE id = ?`,
      [id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', async (req, res) => {
  try {
    const pool = getPool();
    await pool.query(
      `UPDATE admin_notifications SET read = 1 WHERE read = 0`
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product image
router.post('/products/:id/images', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { imageUrl, displayOrder = 0 } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
      [id, imageUrl, displayOrder]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product image
router.delete('/products/:id/images/:imageId', async (req, res) => {
  try {
    const pool = getPool();
    const { id, imageId } = req.params;
    await pool.query(
      'DELETE FROM product_images WHERE id = ? AND product_id = ?',
      [imageId, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product variant (size/color)
router.post('/products/:id/variants', async (req, res) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const { size, color, stock = 0, priceAdjustment = 0 } = req.body;
    
    if (!size && !color) {
      return res.status(400).json({ error: 'Size or color is required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO product_variants (product_id, size, color, stock, price_adjustment) VALUES (?, ?, ?, ?, ?)',
      [id, size || null, color || null, stock, priceAdjustment]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update product variant
router.put('/products/:id/variants/:variantId', async (req, res) => {
  try {
    const pool = getPool();
    const { id, variantId } = req.params;
    const { size, color, stock, priceAdjustment } = req.body;
    
    await pool.query(
      'UPDATE product_variants SET size = ?, color = ?, stock = ?, price_adjustment = ? WHERE id = ? AND product_id = ?',
      [size || null, color || null, stock, priceAdjustment, variantId, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete product variant
router.delete('/products/:id/variants/:variantId', async (req, res) => {
  try {
    const pool = getPool();
    const { id, variantId } = req.params;
    await pool.query(
      'DELETE FROM product_variants WHERE id = ? AND product_id = ?',
      [variantId, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all customers with their order statistics
router.get('/customers', async (req, res) => {
  try {
    const pool = getPool();
    const [customers] = await pool.query(
      `SELECT 
        email,
        customer_name as name,
        phone,
        address,
        city,
        country,
        COUNT(*) as total_orders,
        SUM(total_amount) as total_spent,
        MAX(created_at) as last_order_date,
        MIN(created_at) as first_order_date
      FROM orders
      GROUP BY email, customer_name, phone, address, city, country
      ORDER BY total_spent DESC, last_order_date DESC`
    );
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer details with all orders
router.get('/customers/:email', async (req, res) => {
  try {
    const pool = getPool();
    const { email } = req.params;
    
    // Get customer info from first order
    const [customerRows] = await pool.query(
      `SELECT 
        customer_name, email, phone, address, city, country
       FROM orders
       WHERE email = ?
       LIMIT 1`,
      [email]
    );
    
    if (customerRows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customerInfo = customerRows[0];
    
    // Get all orders for this customer
    const [orders] = await pool.query(
      `SELECT 
        id,
        order_number,
        total_amount,
        status,
        payment_status,
        created_at
      FROM orders
      WHERE email = ?
      ORDER BY created_at DESC`,
      [email]
    );
    
    // Calculate statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const lastOrderDate = orders.length > 0 ? orders[0].created_at : null;
    const firstOrderDate = orders.length > 0 ? orders[orders.length - 1].created_at : null;
    
    res.json({
      ...customerInfo,
      total_orders: totalOrders,
      total_spent: totalSpent,
      last_order_date: lastOrderDate,
      first_order_date: firstOrderDate,
      orders: orders
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
