const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;
let isDatabaseReady = false;

const init = async () => {
  try {
    // Log database configuration (without password)
    console.log('Initializing MySQL database connection...');
    console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
    // Filter for custom DB_* variables only (as per Kodee's suggestion)
    const customDbKeys = Object.keys(process.env).filter(k => k.startsWith('DB_') || k === 'NODE_ENV' || k === 'PORT');
    console.log('Custom DB_* and NODE keys found:', customDbKeys.length > 0 ? customDbKeys.join(', ') : 'NONE');
    console.log('DB_HOST:', process.env.DB_HOST || 'localhost', '(env var exists:', !!process.env.DB_HOST + ')');
    console.log('DB_USER:', process.env.DB_USER || 'u718394065_furorsports', '(env var exists:', !!process.env.DB_USER + ')');
    console.log('DB_NAME:', process.env.DB_NAME || 'u718394065_furorsports_db', '(env var exists:', !!process.env.DB_NAME + ')');
    console.log('DB_PASSWORD exists:', !!process.env.DB_PASSWORD);
    console.log('NODE_ENV:', process.env.NODE_ENV, '(env var exists:', !!process.env.NODE_ENV + ')');
    console.log('PORT:', process.env.PORT || '5000', '(env var exists:', !!process.env.PORT + ')');
    console.log('===================================');
    
    // For Hostinger: Hardcode database credentials since Hostinger UI env vars aren't being passed
    // Environment variables are checked first (for local development), then fallback to hardcoded Hostinger values
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Hardcoded Hostinger MySQL credentials (used when env vars not available)
    // IMPORTANT: Hostinger requires socket connection, not TCP
    const HOSTINGER_DB_CONFIG = {
      socketPath: '/tmp/mysql.sock', // Hostinger uses socket connection
      user: 'u718394065_furorsports',
      password: 'Iam@745678',
      database: 'u718394065_furorsports_db'
    };
    
    // Use socket connection for Hostinger (proven to work via /api/mysql-test)
    // If env vars are set, use them; otherwise use hardcoded socket config
    const isProduction = process.env.NODE_ENV === 'production';
    let dbConfig;
    
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
      // Use environment variables (for local development with TCP)
      dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000
      };
    } else {
      // Use socket connection for Hostinger (production)
      dbConfig = {
        socketPath: HOSTINGER_DB_CONFIG.socketPath,
        user: HOSTINGER_DB_CONFIG.user,
        password: HOSTINGER_DB_CONFIG.password,
        database: HOSTINGER_DB_CONFIG.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 10000
      };
    }
    
    console.log('=== USING DATABASE CONFIG ===');
    if (dbConfig.socketPath) {
      console.log('Connection method: SOCKET');
      console.log('Socket path:', dbConfig.socketPath);
    } else {
      console.log('Connection method: TCP');
      console.log('Host:', dbConfig.host);
    }
    console.log('User:', dbConfig.user);
    console.log('Database:', dbConfig.database);
    console.log('Password set:', !!dbConfig.password, '(length:', dbConfig.password ? dbConfig.password.length : 0, ')');
    console.log('Using env vars:', !!(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME));
    console.log('Using socket (Hostinger):', !!dbConfig.socketPath);
    console.log('================================');
    
    // Create MySQL connection pool (using socket for Hostinger, TCP for local dev)
    console.log('Attempting MySQL connection...');
    pool = mysql.createPool(dbConfig);

    let connection;
    try {
      connection = await pool.getConnection();
      if (dbConfig.socketPath) {
        console.log('✓ Connected to MySQL database successfully via SOCKET:', dbConfig.socketPath);
      } else {
        console.log('✓ Connected to MySQL database successfully via TCP:', dbConfig.host);
      }
      
      // Test a simple query
      const [rows] = await connection.query('SELECT DATABASE() as current_db');
      console.log('✓ Current database:', rows[0].current_db);
      
      // Mark database as ready IMMEDIATELY after successful connection
      // This ensures the database is marked ready even if table creation fails
      isDatabaseReady = true;
      console.log('✓✓✓ Database connection confirmed - marking as ready ✓✓✓');
      
      connection.release();
    } catch (connError) {
      console.error('✗ Error getting connection:', connError.code, connError.message);
      if (connection) {
        connection.release();
      }
      throw connError;
    }

    // Create tables (non-blocking - won't fail if already exists)
    console.log('Creating database tables...');
    try {
      await createTables();
      console.log('✓ Tables created/verified successfully');
    } catch (tableError) {
      console.error('✗ ERROR creating tables:', tableError.code, tableError.message);
      console.error('Table error details:', tableError);
      // Continue anyway - tables might already exist or will be created on first use
      console.log('Continuing (tables will be created on first use if needed)...');
    }
    
    // Seed data (non-blocking)
    console.log('Seeding initial data...');
    try {
      await seedData();
      console.log('✓ Data seeded successfully');
    } catch (seedError) {
      console.error('✗ ERROR seeding data:', seedError.code, seedError.message);
      console.error('Seed error details:', seedError);
      // Continue anyway - data might already be seeded
      console.log('Continuing (data may already be seeded)...');
    }
    
    console.log('✓✓✓ Database initialization completed ✓✓✓');
    console.log('Database is ready for use');
    return Promise.resolve();
  } catch (error) {
    console.error('✗✗✗ ERROR: Failed to initialize MySQL database ✗✗✗');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error sqlState:', error.sqlState);
    console.error('\n=== Connection Details Used ===');
    console.error('Host:', process.env.DB_HOST || 'localhost');
    console.error('User:', process.env.DB_USER || 'u718394065_furorsports');
    console.error('Database:', process.env.DB_NAME || 'u718394065_furorsports_db');
    console.error('Password set:', !!process.env.DB_PASSWORD || 'Using fallback');
    console.error('\nPlease check:');
    console.error('1. MySQL database exists and is accessible');
    console.error('2. MySQL user has correct permissions');
    console.error('3. MySQL service is running');
    console.error('4. Database credentials are correct');
    return Promise.reject(error);
  }
};

const createTables = async () => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(500),
        category VARCHAR(100),
        subcategory VARCHAR(100),
        stock INT DEFAULT 100,
        featured INT DEFAULT 0,
        sale_price DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add columns if they don't exist (for existing databases)
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN featured INT DEFAULT 0`);
    } catch (e) {
      // Column already exists, ignore
    }
    try {
      await connection.query(`ALTER TABLE products ADD COLUMN sale_price DECIMAL(10,2)`);
    } catch (e) {
      // Column already exists, ignore
    }

    // Product images table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        display_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Product variants table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        size VARCHAR(50),
        color VARCHAR(50),
        stock INT DEFAULT 0,
        price_adjustment DECIMAL(10,2) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Cart table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        size VARCHAR(50),
        color VARCHAR(50),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Add size and color columns if they don't exist
    try {
      await connection.query(`ALTER TABLE cart ADD COLUMN size VARCHAR(50)`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE cart ADD COLUMN color VARCHAR(50)`);
    } catch (e) {}

    // Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'processing',
        payment_intent_id VARCHAR(255),
        payment_status VARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add payment columns if they don't exist
    try {
      await connection.query(`ALTER TABLE orders ADD COLUMN payment_intent_id VARCHAR(255)`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending'`);
    } catch (e) {}

    // Order items table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        size VARCHAR(50),
        color VARCHAR(50),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    // Add size and color columns if they don't exist
    try {
      await connection.query(`ALTER TABLE order_items ADD COLUMN size VARCHAR(50)`);
    } catch (e) {}
    try {
      await connection.query(`ALTER TABLE order_items ADD COLUMN color VARCHAR(50)`);
    } catch (e) {}

    // Newsletter table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS newsletter (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Contact messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Subcategories table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subcategories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE KEY unique_category_subcategory (category_id, name)
      )
    `);

    // Admin notifications table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        order_id INT,
        order_number VARCHAR(100),
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    // Admin table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Initialize admin password if table is empty
    const [adminRows] = await connection.query('SELECT COUNT(*) as count FROM admin');
    if (adminRows[0].count === 0) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      await connection.query('INSERT INTO admin (password) VALUES (?)', [defaultPassword]);
      console.log('Admin password initialized');
    }

    await connection.commit();
    console.log('Database tables created successfully');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const seedCategories = async () => {
  const categories = [
    'Martial Arts/Karate Uniforms',
    'Sports Uniforms',
    'Street Wears',
    'Fitness Wears'
  ];

  const subcategoriesData = {
    'Martial Arts/Karate Uniforms': [],
    'Sports Uniforms': [
      'American Football Uniforms',
      'Basketball Uniforms',
      'Goal Keeper Uniforms',
      'Soccer Uniforms',
      'Volleyball Uniforms'
    ],
    'Street Wears': [
      'Hoodies',
      'Jackets',
      'Polo Shirts',
      'T-Shirts',
      'Track Suits',
      'Training Vests'
    ],
    'Fitness Wears': [
      'Compression Shirts',
      'Compression Shorts',
      'Compression Suit',
      'Leggings',
      'Sports Bras'
    ]
  };

  for (const categoryName of categories) {
    const [rows] = await pool.query('SELECT id FROM categories WHERE name = ?', [categoryName]);
    
    let categoryId;
    if (rows.length === 0) {
      const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [categoryName]);
      categoryId = result.insertId;
      
      const subcategories = subcategoriesData[categoryName] || [];
      for (const subName of subcategories) {
        try {
          await pool.query('INSERT INTO subcategories (category_id, name) VALUES (?, ?)', [categoryId, subName]);
        } catch (err) {
          // Ignore duplicate errors
        }
      }
    } else {
      categoryId = rows[0].id;
      const subcategories = subcategoriesData[categoryName] || [];
      
      for (const subName of subcategories) {
        const [subRows] = await pool.query('SELECT id FROM subcategories WHERE category_id = ? AND name = ?', [categoryId, subName]);
        if (subRows.length === 0) {
          try {
            await pool.query('INSERT INTO subcategories (category_id, name) VALUES (?, ?)', [categoryId, subName]);
          } catch (err) {
            // Ignore duplicate errors
          }
        }
      }
    }
  }
};

const seedData = async () => {
  // Seed categories first
  await seedCategories();
  
  // Check if products exist
  const [productRows] = await pool.query('SELECT COUNT(*) as count FROM products');
  
  if (productRows[0].count === 0) {
    const products = [
      // American Football Uniforms
      { name: 'American Football Uniform - Pro Series', description: 'Professional grade American football uniform with moisture-wicking fabric', price: 89.99, image: '/images/american-football-1.jpg', category: 'Sports Uniforms', subcategory: 'American Football Uniforms' },
      { name: 'American Football Uniform - Elite', description: 'Elite performance American football uniform', price: 119.99, image: '/images/american-football-2.jpg', category: 'Sports Uniforms', subcategory: 'American Football Uniforms' },
      { name: 'American Football Uniform - Classic', description: 'Classic design American football uniform', price: 69.99, image: '/images/american-football-3.jpg', category: 'Sports Uniforms', subcategory: 'American Football Uniforms' },
      
      // Basketball Uniforms
      { name: 'Basketball Uniform - Pro', description: 'Professional basketball uniform with breathable mesh', price: 79.99, image: '/images/basketball-1.jpg', category: 'Sports Uniforms', subcategory: 'Basketball Uniforms' },
      { name: 'Basketball Uniform - Street', description: 'Street style basketball uniform', price: 59.99, image: '/images/basketball-2.jpg', category: 'Sports Uniforms', subcategory: 'Basketball Uniforms' },
      
      // Soccer Uniforms
      { name: 'Soccer Uniform - Professional', description: 'Professional soccer uniform with advanced fabric technology', price: 89.99, image: '/images/soccer-1.jpg', category: 'Sports Uniforms', subcategory: 'Soccer Uniforms' },
      { name: 'Goal Keeper Uniform', description: 'Specialized goalkeeper uniform with extra padding', price: 99.99, image: '/images/goalkeeper-1.jpg', category: 'Sports Uniforms', subcategory: 'Goal Keeper Uniforms' },
      
      // Volleyball Uniforms
      { name: 'Volleyball Uniform - Competition', description: 'Competition grade volleyball uniform', price: 74.99, image: '/images/volleyball-1.jpg', category: 'Sports Uniforms', subcategory: 'Volleyball Uniforms' },
      
      // Martial Arts/Karate Uniforms
      { name: 'Karate Uniform - Traditional', description: 'Traditional karate uniform (Gi)', price: 49.99, image: '/images/karate-1.jpg', category: 'Martial Arts/Karate Uniforms', subcategory: 'Karate Uniforms' },
      { name: 'Martial Arts Uniform - Premium', description: 'Premium martial arts uniform', price: 69.99, image: '/images/martial-arts-1.jpg', category: 'Martial Arts/Karate Uniforms', subcategory: 'Martial Arts Uniforms' },
      
      // Street Wears - Hoodies
      { name: 'Premium Hoodie - Black', description: 'Comfortable premium hoodie perfect for street wear', price: 39.99, image: '/images/hoodie-1.jpg', category: 'Street Wears', subcategory: 'Hoodies' },
      { name: 'Premium Hoodie - Gray', description: 'Stylish gray hoodie', price: 39.99, image: '/images/hoodie-2.jpg', category: 'Street Wears', subcategory: 'Hoodies' },
      
      // Street Wears - T-Shirts
      { name: 'FUROR SPORT Geometric Pattern T-Shirt - Black', description: 'Black short-sleeved athletic t-shirt with intricate white and grey geometric patterns. Features angular claw-like design around neckline, interlocking mesh pattern on body, and dynamic curved accents on sides. Form-fitting compression style with FUROR SPORT logo on chest. High-tech armored aesthetic perfect for street wear.', price: 29.99, image: '/images/products/furor-sport/furor-geometric-tshirt.jpeg', category: 'Street Wears', subcategory: 'T-Shirts' },
      { name: 'Classic T-Shirt - White', description: 'Classic white t-shirt', price: 19.99, image: '/images/tshirt-1.jpg', category: 'Street Wears', subcategory: 'T-Shirts' },
      { name: 'Classic T-Shirt - Black', description: 'Classic black t-shirt', price: 19.99, image: '/images/tshirt-2.jpg', category: 'Street Wears', subcategory: 'T-Shirts' },
      
      // Street Wears - Polo Shirts
      { name: 'Polo Shirt - Navy', description: 'Professional polo shirt', price: 29.99, image: '/images/polo-1.jpg', category: 'Street Wears', subcategory: 'Polo Shirts' },
      
      // Street Wears - Track Suits
      { name: 'Track Suit - Complete Set', description: 'Complete track suit set', price: 59.99, image: '/images/tracksuit-1.jpg', category: 'Street Wears', subcategory: 'Track Suits' },
      
      // Fitness Wears - Compression
      { name: 'FUROR SPORT Black Compression Shirt - Short Sleeve', description: 'Black short-sleeved compression shirt with round neck. Features prominent flatlock stitching along seams for durability and comfort. Form-fitting athletic design with FUROR SPORT logo on chest. Perfect for training and fitness activities.', price: 34.99, image: '/images/products/furor-sport/furor-black-compression-short.png', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
      { name: 'FUROR SPORT Grey Compression Shirt - Long Sleeve', description: 'Grey long-sleeve compression shirt with crew neck. Features black flatlock stitching along raglan seams and sides. Tight, body-hugging fit designed for athletic performance. FUROR SPORT logo on chest.', price: 39.99, image: '/images/products/furor-sport/furor-grey-compression-long.jpeg', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
      { name: 'FUROR SPORT Wolf Design Athletic Shirt - Long Sleeve', description: 'Long-sleeved athletic rash guard featuring a fierce wolf graphic design. Bold wolf head with detailed fur texture, sharp fangs, and intense eyes. Abstract patterns with red accents on sleeves. Perfect for martial arts and intense training.', price: 44.99, image: '/images/products/furor-sport/furor-wolf-design.png', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
      { name: 'FUROR SPORT Dragon Design Athletic Shirt - Long Sleeve', description: 'Long-sleeved athletic shirt featuring a vibrant purple dragon design. Intricate dragon graphic with detailed scales, claws, and dynamic body wrapping around torso and sleeves. White outlines create a glowing effect. FUROR SPORT branding on chest and back.', price: 44.99, image: '/images/products/furor-sport/furor-dragon-design.jpeg', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
      { name: 'Compression Shirt - Performance', description: 'High-performance compression shirt', price: 34.99, image: '/images/compression-shirt-1.jpg', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
      { name: 'Compression Shorts', description: 'Athletic compression shorts', price: 29.99, image: '/images/compression-shorts-1.jpg', category: 'Fitness Wears', subcategory: 'Compression Shorts' },
      { name: 'Compression Suit', description: 'Full body compression suit', price: 79.99, image: '/images/compression-suit-1.jpg', category: 'Fitness Wears', subcategory: 'Compression Suit' },
      
      // Fitness Wears - Leggings
      { name: 'Athletic Leggings', description: 'Comfortable athletic leggings', price: 39.99, image: '/images/leggings-1.jpg', category: 'Fitness Wears', subcategory: 'Leggings' },
      
      // Fitness Wears - Sports Bras
      { name: 'Sports Bra - High Support', description: 'High support sports bra', price: 24.99, image: '/images/sports-bra-1.jpg', category: 'Fitness Wears', subcategory: 'Sports Bras' },
    ];

    for (const product of products) {
      await pool.query(
        'INSERT INTO products (name, description, price, image, category, subcategory) VALUES (?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.image, product.category, product.subcategory]
      );
    }
    
    console.log('Products seeded successfully');
  } else {
    // Add FUROR SPORT products if they don't exist
    await addFurorSportProducts();
  }
};

const addFurorSportProducts = async () => {
  const furorProducts = [
    { name: 'FUROR SPORT Black Compression Shirt - Short Sleeve', description: 'Black short-sleeved compression shirt with round neck. Features prominent flatlock stitching along seams for durability and comfort. Form-fitting athletic design with FUROR SPORT logo on chest. Perfect for training and fitness activities.', price: 34.99, image: '/images/products/furor-sport/furor-black-compression-short.png', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
    { name: 'FUROR SPORT Grey Compression Shirt - Long Sleeve', description: 'Grey long-sleeve compression shirt with crew neck. Features black flatlock stitching along raglan seams and sides. Tight, body-hugging fit designed for athletic performance. FUROR SPORT logo on chest.', price: 39.99, image: '/images/products/furor-sport/furor-grey-compression-long.jpeg', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
    { name: 'FUROR SPORT Wolf Design Athletic Shirt - Long Sleeve', description: 'Long-sleeved athletic rash guard featuring a fierce wolf graphic design. Bold wolf head with detailed fur texture, sharp fangs, and intense eyes. Abstract patterns with red accents on sleeves. Perfect for martial arts and intense training.', price: 44.99, image: '/images/products/furor-sport/furor-wolf-design.png', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
    { name: 'FUROR SPORT Dragon Design Athletic Shirt - Long Sleeve', description: 'Long-sleeved athletic shirt featuring a vibrant purple dragon design. Intricate dragon graphic with detailed scales, claws, and dynamic body wrapping around torso and sleeves. White outlines create a glowing effect. FUROR SPORT branding on chest and back.', price: 44.99, image: '/images/products/furor-sport/furor-dragon-design.jpeg', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
    { name: 'FUROR SPORT Geometric Pattern T-Shirt - Black', description: 'Black short-sleeved athletic t-shirt with intricate white and grey geometric patterns. Features angular claw-like design around neckline, interlocking mesh pattern on body, and dynamic curved accents on sides. Form-fitting compression style with FUROR SPORT logo on chest. High-tech armored aesthetic perfect for street wear.', price: 29.99, image: '/images/products/furor-sport/furor-geometric-tshirt.jpeg', category: 'Street Wears', subcategory: 'T-Shirts' },
  ];

  for (const product of furorProducts) {
    const [rows] = await pool.query('SELECT id FROM products WHERE name = ?', [product.name]);
    
    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO products (name, description, price, image, category, subcategory) VALUES (?, ?, ?, ?, ?, ?)',
        [product.name, product.description, product.price, product.image, product.category, product.subcategory]
      );
      console.log(`Added FUROR SPORT product: ${product.name}`);
    }
  }
};

// Helper function to get database connection (for compatibility with existing code)
const getDb = () => pool;

// Helper functions to mimic SQLite API for easier migration
const dbHelpers = {
  // Convert db.run() to MySQL
  run: async (query, params = []) => {
    const [result] = await pool.query(query, params);
    return {
      lastID: result.insertId,
      changes: result.affectedRows
    };
  },
  
  // Convert db.get() to MySQL
  get: async (query, params = []) => {
    const [rows] = await pool.query(query, params);
    return rows[0] || null;
  },
  
  // Convert db.all() to MySQL
  all: async (query, params = []) => {
    const [rows] = await pool.query(query, params);
    return rows;
  }
};

const isReady = () => isDatabaseReady;

module.exports = { init, getDb, pool, dbHelpers, isReady };
