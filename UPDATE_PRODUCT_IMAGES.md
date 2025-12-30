# How to Update Product Images

## Understanding the Problem

The database stores image paths for each product. When you add new images, you need to ensure:
1. The image files exist in the correct location
2. The database points to the correct image paths
3. Images are NOT in `.gitignore` so they persist

## Solution: Two Methods

### Method 1: Update Images via Admin Panel (Recommended)

The easiest way is to use the Admin Panel:

1. **Start the servers** (if not running):
   ```bash
   npm run dev
   ```

2. **Login to Admin Panel**: 
   - Go to http://localhost:3000/admin/login
   - Use password: `admin123` (or your configured password)

3. **Update Product Images**:
   - Go to "Products" section
   - Click "Edit" on the product you want to update
   - Upload new images using the image upload feature
   - Save the product

This method automatically:
- Saves images to the correct location
- Updates the database with the new image paths
- Handles file naming correctly

### Method 2: Manual Image Replacement

If you want to manually replace images:

#### Step 1: Find the Current Image Paths

Check what image paths are stored in the database for your products. You can do this by:
- Looking at the product in the admin panel
- Or checking the product detail page source

#### Step 2: Identify Image Location

Based on the database seed data, images should be in:
- **Root images**: `client/public/images/` for seed products
- **Product images**: `client/public/images/products/` for uploaded products

#### Step 3: Add Your Images

1. **For Sports Uniforms, Street Wears, Fitness Wears** (seed products):
   
   Place images in: `client/public/images/`
   
   Required filenames (from seed data):
   - Sports Uniforms:
     - `american-football-1.jpg`
     - `american-football-2.jpg`
     - `american-football-3.jpg`
     - `basketball-1.jpg`
     - `basketball-2.jpg`
     - `soccer-1.jpg`
     - `goalkeeper-1.jpg`
     - `volleyball-1.jpg`
   
   - Street Wears:
     - `hoodie-1.jpg`
     - `hoodie-2.jpg`
     - `tshirt-1.jpg`
     - `tshirt-2.jpg`
     - `polo-1.jpg`
     - `tracksuit-1.jpg`
   
   - Fitness Wears:
     - `compression-shirt-1.jpg`
     - `compression-shorts-1.jpg`
     - `compression-suit-1.jpg`
     - `leggings-1.jpg`
     - `sports-bra-1.jpg`

2. **For FUROR SPORT products**:
   
   Place images in: `client/public/images/products/furor-sport/`
   
   Required filenames:
   - `furor-black-compression-short.png`
   - `furor-grey-compression-long.jpeg`
   - `furor-wolf-design.png`
   - `furor-dragon-design.jpeg`
   - `furor-geometric-tshirt.jpeg`

#### Step 4: Update Database (if using different filenames)

If you're using different filenames, you need to update the database. The easiest way is via the Admin Panel.

## Important Notes

⚠️ **The database seeding ONLY runs when the database is EMPTY**. Once products exist, the seed data won't overwrite your products.

⚠️ **If images keep getting replaced**, it might be because:
1. The database file is being deleted/reset (check if `server/database/ecommerce.db` persists)
2. You're looking at `client/dist/` folder (this gets rebuilt - use `client/public/`)
3. Git is resetting files (make sure images are not in `.gitignore`)

## Quick Fix Script

If you want to update multiple products at once, you can use the Admin Panel's bulk edit feature, or manually update via the database (not recommended unless you know SQL).

## Verification

After adding images:

1. **Check files exist**:
   ```bash
   ls -la client/public/images/*.jpg
   ls -la client/public/images/products/furor-sport/
   ```

2. **Restart servers** (if needed):
   ```bash
   # Stop current servers (Ctrl+C)
   npm run dev
   ```

3. **Check in browser**:
   - Visit http://localhost:3000/products
   - Click on products to see if images load

## Troubleshooting

### Images not showing?
- ✅ Check file paths match exactly (case-sensitive)
- ✅ Check files are in `client/public/images/` (not `client/src/` or `client/dist/`)
- ✅ Restart the dev server after adding images
- ✅ Check browser console for 404 errors
- ✅ Verify database has correct image paths

### Images get replaced on restart?
- ✅ Make sure you're editing files in `client/public/` not `client/dist/`
- ✅ Check if database file is being deleted
- ✅ Verify images are committed to git (if using git)
- ✅ Check if any build scripts are copying/resetting images

