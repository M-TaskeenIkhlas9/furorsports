const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'ecommerce.db');
let db;

const init = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        createTables().then(() => {
          seedData();
          resolve();
        }).catch(reject);
      }
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Products table
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image TEXT,
        category TEXT,
        subcategory TEXT,
        stock INTEGER DEFAULT 100,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      // Add featured column if it doesn't exist (for existing databases)
      db.run(`ALTER TABLE products ADD COLUMN featured INTEGER DEFAULT 0`, () => {});

      // Cart table
      db.run(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Orders table
      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_intent_id TEXT,
        payment_status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      // Add payment columns if they don't exist (for existing databases)
      db.run(`ALTER TABLE orders ADD COLUMN payment_intent_id TEXT`, () => {});
      db.run(`ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'`, () => {});

      // Order items table
      db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`, (err) => {
        if (err) reject(err);
      });

      // Newsletter table
      db.run(`CREATE TABLE IF NOT EXISTS newsletter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      // Contact messages table
      db.run(`CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      // Categories table
      db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      // Subcategories table
      db.run(`CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
        UNIQUE(category_id, name)
      )`, (err) => {
        if (err) reject(err);
      });

      // Admin table
      db.run(`CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        password TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
        
        // Initialize admin password if table is empty
        db.get("SELECT COUNT(*) as count FROM admin", (err, row) => {
          if (!err && row.count === 0) {
            const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
            db.run(
              "INSERT INTO admin (password) VALUES (?)",
              [defaultPassword],
              (err) => {
                if (err) {
                  console.error('Error initializing admin password:', err);
                } else {
                  console.log('Admin password initialized');
                }
                resolve();
              }
            );
          } else {
            resolve();
          }
        });
      });
    });
  });
};

const seedCategories = () => {
  // Seed categories if they don't exist
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

  categories.forEach(categoryName => {
    db.get("SELECT id FROM categories WHERE name = ?", [categoryName], (err, categoryRow) => {
      if (err) {
        console.error('Error checking category:', err);
        return;
      }

      if (!categoryRow) {
        // Category doesn't exist, add it
        db.run("INSERT INTO categories (name) VALUES (?)", [categoryName], function(catErr) {
          if (catErr) {
            console.error('Error adding category:', catErr);
            return;
          }
          
          const categoryId = this.lastID;
          const subcategories = subcategoriesData[categoryName] || [];
          
          // Add subcategories for this category
          subcategories.forEach(subName => {
            db.run(
              "INSERT INTO subcategories (category_id, name) VALUES (?, ?)",
              [categoryId, subName],
              (subErr) => {
                if (subErr && !subErr.message.includes('UNIQUE constraint')) {
                  console.error('Error adding subcategory:', subErr);
                }
              }
            );
          });
        });
      } else {
        // Category exists, check and add missing subcategories
        const categoryId = categoryRow.id;
        const subcategories = subcategoriesData[categoryName] || [];
        
        subcategories.forEach(subName => {
          db.get(
            "SELECT id FROM subcategories WHERE category_id = ? AND name = ?",
            [categoryId, subName],
            (err, subRow) => {
              if (err) {
                console.error('Error checking subcategory:', err);
                return;
              }
              
              if (!subRow) {
                db.run(
                  "INSERT INTO subcategories (category_id, name) VALUES (?, ?)",
                  [categoryId, subName],
                  (subErr) => {
                    if (subErr && !subErr.message.includes('UNIQUE constraint')) {
                      console.error('Error adding subcategory:', subErr);
                    }
                  }
                );
              }
            }
          );
        });
      }
    });
  });
};

const seedData = () => {
  // Seed categories first
  seedCategories();
  
  // First, seed initial products if database is empty
  db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
    if (err) {
      console.error('Error checking products:', err);
      return;
    }
    
    if (row.count === 0) {
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

      const stmt = db.prepare(`INSERT INTO products (name, description, price, image, category, subcategory) VALUES (?, ?, ?, ?, ?, ?)`);
      
      products.forEach(product => {
        stmt.run([product.name, product.description, product.price, product.image, product.category, product.subcategory]);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error seeding products:', err);
        } else {
          console.log('Products seeded successfully');
        }
      });
    } else {
      // Add FUROR SPORT products if they don't exist
      addFurorSportProducts();
    }
  });
};

const addFurorSportProducts = () => {
  const furorProducts = [
    { name: 'FUROR SPORT Black Compression Shirt - Short Sleeve', description: 'Black short-sleeved compression shirt with round neck. Features prominent flatlock stitching along seams for durability and comfort. Form-fitting athletic design with FUROR SPORT logo on chest. Perfect for training and fitness activities.', price: 34.99, image: '/images/products/furor-sport/furor-black-compression-short.png', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
    { name: 'FUROR SPORT Grey Compression Shirt - Long Sleeve', description: 'Grey long-sleeve compression shirt with crew neck. Features black flatlock stitching along raglan seams and sides. Tight, body-hugging fit designed for athletic performance. FUROR SPORT logo on chest.', price: 39.99, image: '/images/products/furor-sport/furor-grey-compression-long.jpeg', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
    { name: 'FUROR SPORT Wolf Design Athletic Shirt - Long Sleeve', description: 'Long-sleeved athletic rash guard featuring a fierce wolf graphic design. Bold wolf head with detailed fur texture, sharp fangs, and intense eyes. Abstract patterns with red accents on sleeves. Perfect for martial arts and intense training.', price: 44.99, image: '/images/products/furor-sport/furor-wolf-design.png', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
    { name: 'FUROR SPORT Dragon Design Athletic Shirt - Long Sleeve', description: 'Long-sleeved athletic shirt featuring a vibrant purple dragon design. Intricate dragon graphic with detailed scales, claws, and dynamic body wrapping around torso and sleeves. White outlines create a glowing effect. FUROR SPORT branding on chest and back.', price: 44.99, image: '/images/products/furor-sport/furor-dragon-design.jpeg', category: 'Fitness Wears', subcategory: 'Compression Shirts' },
    { name: 'FUROR SPORT Geometric Pattern T-Shirt - Black', description: 'Black short-sleeved athletic t-shirt with intricate white and grey geometric patterns. Features angular claw-like design around neckline, interlocking mesh pattern on body, and dynamic curved accents on sides. Form-fitting compression style with FUROR SPORT logo on chest. High-tech armored aesthetic perfect for street wear.', price: 29.99, image: '/images/products/furor-sport/furor-geometric-tshirt.jpeg', category: 'Street Wears', subcategory: 'T-Shirts' },
  ];

  furorProducts.forEach(product => {
    // Check if product already exists
    db.get(
      "SELECT id FROM products WHERE name = ?",
      [product.name],
      (err, row) => {
        if (err) {
          console.error('Error checking product:', err);
          return;
        }
        
        if (!row) {
          // Product doesn't exist, add it
          db.run(
            `INSERT INTO products (name, description, price, image, category, subcategory) VALUES (?, ?, ?, ?, ?, ?)`,
            [product.name, product.description, product.price, product.image, product.category, product.subcategory],
            (err) => {
              if (err) {
                console.error('Error adding FUROR SPORT product:', err);
              } else {
                console.log(`Added FUROR SPORT product: ${product.name}`);
              }
            }
          );
        }
      }
    );
  });
};

const getDb = () => db;

module.exports = { init, getDb };

