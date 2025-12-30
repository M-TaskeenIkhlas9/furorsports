#!/usr/bin/env node

/**
 * Script to update product image paths in the database
 * Usage: node update-image-paths.js
 * 
 * This script helps you update image paths for products in the database.
 * Run this if you've added new images and want to update the database paths.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const dbPath = path.join(__dirname, 'server/database/ecommerce.db');
const imagesPath = path.join(__dirname, 'client/public/images');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function getDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
}

async function listProducts(db, category = null) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT id, name, category, image FROM products';
    const params = [];
    
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY category, name';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function updateProductImage(db, productId, newImagePath) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE products SET image = ? WHERE id = ?',
      [newImagePath, productId],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      }
    );
  });
}

async function findImageFiles(category) {
  const imageFiles = [];
  
  // Check root images folder
  const rootImagesPath = imagesPath;
  if (fs.existsSync(rootImagesPath)) {
    const files = fs.readdirSync(rootImagesPath);
    files.forEach(file => {
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
        imageFiles.push({
          path: `/images/${file}`,
          file: file,
          location: 'root'
        });
      }
    });
  }
  
  // Check products folder
  const productsPath = path.join(imagesPath, 'products');
  if (fs.existsSync(productsPath)) {
    const walkDir = (dir, basePath = '') => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walkDir(fullPath, path.join(basePath, file));
        } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
          imageFiles.push({
            path: `/images/products/${basePath ? basePath + '/' : ''}${file}`,
            file: file,
            location: `products/${basePath || ''}`
          });
        }
      });
    };
    walkDir(productsPath);
  }
  
  return imageFiles;
}

async function main() {
  console.log('🖼️  Product Image Path Updater\n');
  
  try {
    const db = await getDb();
    console.log('✅ Connected to database\n');
    
    // Ask which category to update
    console.log('Which category do you want to update?');
    console.log('1. Sports Uniforms');
    console.log('2. Street Wears');
    console.log('3. Fitness Wears');
    console.log('4. All categories');
    console.log('5. Exit\n');
    
    const choice = await question('Enter choice (1-5): ');
    
    let category = null;
    switch(choice) {
      case '1':
        category = 'Sports Uniforms';
        break;
      case '2':
        category = 'Street Wears';
        break;
      case '3':
        category = 'Fitness Wears';
        break;
      case '4':
        category = null;
        break;
      case '5':
        console.log('Exiting...');
        db.close();
        rl.close();
        return;
      default:
        console.log('Invalid choice. Exiting...');
        db.close();
        rl.close();
        return;
    }
    
    // List products
    console.log(`\n📦 Products in ${category || 'all categories'}:\n`);
    const products = await listProducts(db, category);
    
    if (products.length === 0) {
      console.log('No products found.');
      db.close();
      rl.close();
      return;
    }
    
    products.forEach((p, index) => {
      console.log(`${index + 1}. [ID: ${p.id}] ${p.name}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Current image: ${p.image || 'None'}\n`);
    });
    
    // List available images
    console.log('\n📁 Available image files:\n');
    const images = await findImageFiles();
    if (images.length === 0) {
      console.log('No image files found in client/public/images/\n');
    } else {
      images.forEach((img, index) => {
        console.log(`${index + 1}. ${img.path} (${img.location})`);
      });
      console.log('');
    }
    
    // Ask which product to update
    const productChoice = await question(`\nEnter product ID to update (1-${products.length}), or 'q' to quit: `);
    
    if (productChoice.toLowerCase() === 'q') {
      db.close();
      rl.close();
      return;
    }
    
    const productIndex = parseInt(productChoice) - 1;
    if (productIndex < 0 || productIndex >= products.length) {
      console.log('Invalid product choice.');
      db.close();
      rl.close();
      return;
    }
    
    const selectedProduct = products[productIndex];
    
    // Ask for new image path
    console.log(`\nUpdating: ${selectedProduct.name}`);
    console.log(`Current image path: ${selectedProduct.image || 'None'}\n`);
    
    if (images.length > 0) {
      const imageChoice = await question(`Enter image number (1-${images.length}) or type custom path: `);
      const imageIndex = parseInt(imageChoice) - 1;
      
      let newPath;
      if (imageIndex >= 0 && imageIndex < images.length) {
        newPath = images[imageIndex].path;
      } else {
        newPath = imageChoice;
      }
      
      // Update database
      console.log(`\nUpdating image path to: ${newPath}`);
      await updateProductImage(db, selectedProduct.id, newPath);
      console.log('✅ Image path updated successfully!\n');
    } else {
      const newPath = await question('Enter new image path (e.g., /images/my-image.jpg): ');
      await updateProductImage(db, selectedProduct.id, newPath);
      console.log('✅ Image path updated successfully!\n');
    }
    
    db.close();
    rl.close();
    
    console.log('\n✨ Done! Restart your server to see the changes.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();

