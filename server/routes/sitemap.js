const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { getPool } = db;

// Middleware to check if database is ready
const checkDatabase = async (req, res, next) => {
  // Only check database for sitemap.xml route
  if (req.path === '/sitemap.xml') {
    const pool = getPool();
    if (!pool) {
      // For sitemap, return basic sitemap if DB not ready
      return res.status(503).set('Content-Type', 'application/xml').send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>');
    }
  }
  next();
};

router.use(checkDatabase);

// Generate sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'https://furorsport-lac-one-35.vercel.app';
    
    // Static pages
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: '/products', changefreq: 'daily', priority: '0.9' },
      { url: '/about', changefreq: 'monthly', priority: '0.8' },
      { url: '/contact', changefreq: 'monthly', priority: '0.8' },
      { url: '/how-to-order', changefreq: 'monthly', priority: '0.7' }
    ];

    // Get all products from database
    const pool = getPool();
    let products = [];
    try {
      const [productRows] = await pool.query('SELECT id, updated_at, created_at FROM products ORDER BY created_at DESC');
      products = productRows;
    } catch (err) {
      console.error('Error fetching products for sitemap:', err);
      // Return sitemap with just static pages if products query fails
      return generateSitemapXML(staticPages, baseUrl, res);
    }

    // Add product pages
    const productPages = products.map(product => ({
      url: `/product/${product.id}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: product.updated_at || product.created_at
    }));

    // Combine all pages
    const allPages = [...staticPages, ...productPages];

    generateSitemapXML(allPages, baseUrl, res);
  } catch (err) {
    console.error('Error generating sitemap:', err);
    // Return basic sitemap on error
    const baseUrl = process.env.CLIENT_URL || 'https://furorsport-lac-one-35.vercel.app';
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: '/products', changefreq: 'daily', priority: '0.9' },
      { url: '/about', changefreq: 'monthly', priority: '0.8' },
      { url: '/contact', changefreq: 'monthly', priority: '0.8' },
      { url: '/how-to-order', changefreq: 'monthly', priority: '0.7' }
    ];
    generateSitemapXML(staticPages, baseUrl, res);
  }
});

function generateSitemapXML(pages, baseUrl, res) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  pages.forEach(page => {
    const fullUrl = `${baseUrl}${page.url}`;
    const lastmod = page.lastmod 
      ? new Date(page.lastmod).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    xml += '  <url>\n';
    xml += `    <loc>${fullUrl}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq || 'weekly'}</changefreq>\n`;
    xml += `    <priority>${page.priority || '0.5'}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  res.set('Content-Type', 'application/xml');
  res.send(xml);
}

module.exports = router;
