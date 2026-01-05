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
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL || '*'
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

// Start server after database initialization
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`✓ Server is running on port ${PORT}`);
    console.log(`✓ Using MySQL database: ${process.env.DB_NAME || 'u718394065_furorsports_db'}`);
    console.log(`✓ Database type: MySQL (NOT SQLite)`);
    console.log(`✓ Migration completed: SQLite -> MySQL`);
  });
}).catch(err => {
  console.error('✗ FATAL: Failed to initialize database. Server cannot start.');
  console.error('✗ Database type: MySQL');
  console.error('✗ This error should NOT mention SQLite. If you see SQLite errors, old code is running.');
  console.error(err);
  process.exit(1);
});

