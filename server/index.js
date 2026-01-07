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
// IMPORTANT: require once and use properties from the module (so updates to pool/isReady are visible)
const db = require('./database/db');

// MySQL connection test endpoint (to see actual MySQL error)
app.get('/api/mysql-test', async (req, res) => {
  const mysql = require('mysql2/promise');
  const testConfig = {
    host: 'localhost',
    user: 'u718394065_furorsports',
    password: 'Iam@745678',
    database: 'u718394065_furorsports_db',
    connectTimeout: 5000
  };
  
  try {
    // Try TCP
    const connection = await mysql.createConnection(testConfig);
    await connection.query('SELECT 1');
    await connection.end();
    res.json({ success: true, method: 'TCP', message: 'Connection successful via TCP' });
  } catch (tcpError) {
    // Try socket
    const socketPaths = [
      '/var/run/mysqld/mysqld.sock',
      '/tmp/mysql.sock',
      '/var/lib/mysql/mysql.sock'
    ];
    
    let socketWorked = false;
    for (const socketPath of socketPaths) {
      try {
        const socketConfig = {
          socketPath: socketPath,
          user: testConfig.user,
          password: testConfig.password,
          database: testConfig.database
        };
        const conn = await mysql.createConnection(socketConfig);
        await conn.query('SELECT 1');
        await conn.end();
        res.json({ success: true, method: 'SOCKET', socket: socketPath, message: 'Connection successful via socket' });
        socketWorked = true;
        break;
      } catch (socketError) {
        // Try next socket
      }
    }
    
    if (!socketWorked) {
      res.json({
        success: false,
        tcp_error: {
          code: tcpError.code,
          message: tcpError.message,
          sqlState: tcpError.sqlState
        },
        message: 'Both TCP and socket connections failed'
      });
    }
  }
});

// Cloudinary test endpoint
app.get('/api/cloudinary-test', (req, res) => {
  try {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    
    const CLOUDINARY_FALLBACK = {
      cloud_name: 'dmrygp1fm',
      api_key: '395448217797185',
      api_secret: 'ByPFqQvOwtZVHskQ7I1u2K-3A70'
    };
    
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_FALLBACK.cloud_name;
    const apiKey = process.env.CLOUDINARY_API_KEY || CLOUDINARY_FALLBACK.api_key;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || CLOUDINARY_FALLBACK.api_secret;
    
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });
    
    const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'furorsports/products'
      }
    });
    
    res.json({
      success: true,
      message: 'Cloudinary packages loaded successfully',
      cloud_name: cloudName,
      using_fallback: !process.env.CLOUDINARY_CLOUD_NAME,
      storage_type: storage.constructor.name
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

// Environment test endpoint (to verify env vars reach the process)
// Using /api/env-test to avoid routing conflicts with sitemap
app.get('/api/env-test', (req, res) => {
  // Filter for custom DB_* variables only (as per Kodee's suggestion)
  const customDbKeys = Object.keys(process.env).filter(k => k.startsWith('DB_') || k === 'NODE_ENV' || k === 'PORT' || k === 'CLIENT_URL' || k.startsWith('CLOUDINARY_'));
  
  res.json({
    NODE_ENV: process.env.NODE_ENV || null,
    PORT: process.env.PORT || null,
    DB_HOST: process.env.DB_HOST || null,
    DB_NAME: process.env.DB_NAME || null,
    DB_USER: process.env.DB_USER || null,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***SET***' : null,
    CLIENT_URL: process.env.CLIENT_URL || null,
    // Cloudinary variables
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || null,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || null,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '***SET***' : null,
    // Custom keys only (filtered as Kodee suggested)
    custom_keys_found: customDbKeys,
    custom_keys_count: customDbKeys.length,
    // All env keys (including Hostinger internal ones)
    all_env_keys: Object.keys(process.env).filter(k => k.includes('DB_') || k.includes('NODE_') || k.includes('CLIENT_') || k === 'PORT' || k.startsWith('LSNODE_') || k.startsWith('CLOUDINARY_')),
    total_env_vars: Object.keys(process.env).length
  });
});

// Database health endpoint (shows initialization steps and errors) - Kodee's suggestion
app.get('/api/db-health', async (req, res) => {
  const steps = [];
  const mysql = require('mysql2/promise');
  
  try {
    steps.push('=== Starting database initialization ===');
    
    // Hostinger MySQL TCP connection (not socket!)
    // FORCE 127.0.0.1 for internal connections (same server) - matches phpMyAdmin: "Server: 127.0.0.1:3306"
    // Ignore DB_HOST env var if it points to external hostname (which resolves to IPv6)
    const dbConfig = {
      host: '127.0.0.1', // ALWAYS use 127.0.0.1 for internal connection on same server
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'u718394065_furorsports',
      password: process.env.DB_PASSWORD || 'Iam@745678',
      database: process.env.DB_NAME || 'u718394065_furorsports_db',
      connectTimeout: 10000,
      family: 4 // Force IPv4 to avoid IPv6 connection issues
    };
    
    steps.push('=== STEP 1: Creating MySQL connection pool ===');
    steps.push(`Using TCP connection - host: ${dbConfig.host}, port: ${dbConfig.port}`);
    
    const pool = mysql.createPool(dbConfig);
    steps.push('✓ Connection pool created');

    steps.push('=== STEP 2: Getting connection from pool ===');
    const conn = await pool.getConnection();
    steps.push('✓ Connection obtained');

    steps.push('=== STEP 3: Testing database query ===');
    const [rows] = await conn.query('SELECT DATABASE() as current_db, NOW() as db_time');
    steps.push(`✓ Query successful - Database: ${rows[0].current_db}, Time: ${rows[0].db_time}`);
    
    conn.release();
    await pool.end();
    
    steps.push('=== STEP 4: Connection test successful ===');
    
    res.json({ 
      ok: true, 
      steps,
      message: 'Database connection works via TCP',
      config: {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        user: dbConfig.user
      }
    });
  } catch (err) {
    steps.push(`ERROR: ${err.code} ${err.message}`);
    steps.push(`Error details: ${JSON.stringify(err)}`);
    
    res.status(500).json({ 
      ok: false, 
      steps, 
      error: { 
        code: err.code, 
        message: err.message,
        sqlState: err.sqlState
      },
      suggestion: 'If connection fails, check MySQL host in Hostinger hPanel → Databases → MySQL'
    });
  }
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
    database: db.isReady() ? 'ready' : (db.pool ? 'initializing' : 'not_connected'),
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
app.get('/api/debug/db-test', async (req, res) => {
  // Try both getter and function
  const poolFromGetter = db.pool;
  const poolFromFunction = db.getPool();
  const results = {
    pool_exists_getter: !!poolFromGetter,
    pool_exists_function: !!poolFromFunction,
    pool_type_getter: typeof poolFromGetter,
    pool_type_function: typeof poolFromFunction,
    is_ready: db.isReady(),
    tests: {}
  };
  
  const pool = poolFromGetter || poolFromFunction;
  
  results.debug = {
    poolFromGetter_is_truthy: !!poolFromGetter,
    poolFromFunction_is_truthy: !!poolFromFunction,
    pool_is_truthy: !!pool,
    pool_value: pool ? 'exists' : 'null/undefined'
  };
  
  if (!pool || !db.isReady()) {
    results.message = 'Pool not available or database not ready';
    return res.json(results);
  }
  
  try {
    // Test 1: Simple query
    const [test1] = await pool.query('SELECT COUNT(*) as count FROM products');
    results.tests.products_count = test1[0]?.count || 0;
    
    // Test 2: Get products
    const [test2] = await pool.query('SELECT * FROM products LIMIT 3');
    results.tests.products_rows = test2?.length || 0;
    results.tests.products_sample = test2;
    
    // Test 3: Get categories
    const [test3] = await pool.query('SELECT * FROM categories LIMIT 5');
    results.tests.categories_rows = test3?.length || 0;
    results.tests.categories_sample = test3;
    
    // Test 4: Get subcategories
    const [test4] = await pool.query('SELECT * FROM subcategories LIMIT 5');
    results.tests.subcategories_rows = test4?.length || 0;
    
    res.json(results);
  } catch (err) {
    results.error = {
      message: err.message,
      code: err.code,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    };
    res.json(results);
  }
});

app.use('/api/categories', categoryRoutes);

// Handle sitemap route (before React Router catch-all but after API routes)
app.use('/', sitemapRoutes); // Sitemap at root level /sitemap.xml

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  
  // Handle React Router - all non-API, non-image routes should return index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/images') && req.path !== '/sitemap.xml') {
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
  console.log('=== Starting database initialization ===');
  db.init().then(() => {
    console.log('✓✓✓ Database initialized successfully ✓✓✓');
    console.log(`✓ Using MySQL database: ${process.env.DB_NAME || 'u718394065_furorsports_db'}`);
    console.log(`✓ Database type: MySQL (NOT SQLite)`);
    console.log(`✓ Migration completed: SQLite -> MySQL`);
    console.log(`✓ Database is ready - isDatabaseReady: ${isReady()}`);
    console.log(`✓ You can now use /api/health to verify status`);
  }).catch(err => {
    console.error('✗✗✗ ERROR: Failed to initialize database ✗✗✗');
    console.error('✗ Database type: MySQL (NOT SQLite)');
    console.error('✗ If you see SQLite errors, old code is running.');
    console.error('✗ Error code:', err.code);
    console.error('✗ Error message:', err.message);
    console.error('✗ Error sqlState:', err.sqlState);
    console.error('✗ Full error object:', err);
    console.error('✗ Error stack:', err.stack);
    console.error('✗ Server is running but database operations will fail');
    console.error('✗ Please check MySQL connection and restart deployment');
    console.error('✗ Check /api/health endpoint for status');
    console.error('✗ Check /api/mysql-test endpoint to verify connection');
    console.error('✗ Try /api/db-init to manually initialize');
  });
});

