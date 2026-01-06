const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const newsletterRoutes = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');
const sitemapRoutes = require('./routes/sitemap');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
// Hardcoded Hostinger frontend URL (since env vars aren't being passed)
const HOSTINGER_CLIENT_URL = 'https://aliceblue-rook-541622.hostingersite.com';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CLIENT_URL || HOSTINGER_CLIENT_URL)
    : '*',
  credentials: true
};
app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files for images (both dev and production)
// Use server/public/images for uploaded images, fallback to client/public/images for default images
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));

// Initialize database (will start server after init)
const db = require('./database/db');
const { pool, isReady } = require('./database/db');

// Environment test endpoint (to verify env vars reach the process)
// Using /api/env-test to avoid routing conflicts with sitemap
app.get('/api/env-test', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV || null,
    PORT: process.env.PORT || null,
    DB_HOST: process.env.DB_HOST || null,
    DB_NAME: process.env.DB_NAME || null,
    DB_USER: process.env.DB_USER || null,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : null,
    CLIENT_URL: process.env.CLIENT_URL || null,
    all_env_keys: Object.keys(process.env).filter(k => k.includes('DB_') || k.includes('NODE_') || k.includes('CLIENT_') || k === 'PORT'),
    total_env_vars: Object.keys(process.env).length
  });
});

// Health check endpoint (works even if database fails)
app.get('/api/health', (req, res) => {
  // Get all environment variables (for debugging)
  const allEnvVars = Object.keys(process.env)
    .filter(key => key.includes('DB_') || key.includes('NODE_') || key.includes('CLIENT_') || key.includes('PORT'))
    .reduce((obj, key) => {
      obj[key] = process.env[key];
      return obj;
    }, {});

  res.json({
    status: 'ok',
    server: 'running',
    database: isReady() ? 'ready' : (pool ? 'initializing' : 'not_connected'),
    timestamp: new Date().toISOString(),
    environment: {
      node_env: process.env.NODE_ENV,
      port: process.env.PORT || 5000,
      db_host: process.env.DB_HOST || 'localhost',
      db_name: process.env.DB_NAME || 'not set',
      db_user: process.env.DB_USER || 'not set',
      db_password_set: process.env.DB_PASSWORD ? 'yes (hidden)' : 'no',
      client_url: process.env.CLIENT_URL || 'not set'
    },
    all_db_env_vars: allEnvVars, // Show all DB-related env vars for debugging
    process_env_count: Object.keys(process.env).length // Total env vars available
  });
});

// API Routes (must come before static files)
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/', sitemapRoutes); // Sitemap at root level /sitemap.xml

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  
  // Handle React Router - all non-API routes should return index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Start server immediately (health check will work even without DB)
// But try to initialize database in background
console.log('Starting server initialization...');
console.log('Environment check:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT || 5000);
console.log('  DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('  DB_USER:', process.env.DB_USER || 'u718394065_furorsports');
console.log('  DB_NAME:', process.env.DB_NAME || 'u718394065_furorsports_db');
console.log('  CLIENT_URL:', process.env.CLIENT_URL || 'not set');

// Start server immediately so health check works
app.listen(PORT, () => {
  console.log(`✓✓✓ Server is running on port ${PORT} ✓✓✓`);
  console.log(`✓ Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`✓ API endpoints available at: http://localhost:${PORT}/api`);
  
  // Initialize database in background
  db.init().then(() => {
    console.log('✓✓✓ Database initialized successfully ✓✓✓');
    console.log(`✓ Using MySQL database: ${process.env.DB_NAME || 'u718394065_furorsports_db'}`);
    console.log(`✓ Database type: MySQL (NOT SQLite)`);
    console.log(`✓ Migration completed: SQLite -> MySQL`);
  }).catch(err => {
    console.error('✗✗✗ ERROR: Failed to initialize database ✗✗✗');
    console.error('✗ Database type: MySQL (NOT SQLite)');
    console.error('✗ If you see SQLite errors, old code is running.');
    console.error('✗ Error details:', err.message);
    console.error('✗ Full error:', err);
    console.error('✗ Server is running but database operations will fail');
    console.error('✗ Please check MySQL connection and restart deployment');
    console.error('✗ Check /api/health endpoint for status');
  });
});

