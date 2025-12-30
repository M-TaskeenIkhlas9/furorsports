# 🖼️ How to Change Product Images - Complete Guide

## The Problem Explained

Your database has product records with image paths like:
- `/images/american-football-1.jpg`
- `/images/basketball-1.jpg`
- `/images/hoodie-1.jpg`
- etc.

These paths point to files that should be in: `client/public/images/`

**When images get "replaced":**
- ❌ You're editing files in `client/dist/` (which gets rebuilt on server start)
- ✅ You should edit files in `client/public/` (this is the source)

---

## ✅ Solution: Add Images to Correct Location

### Step 1: Create/Place Your Images

**Location:** `client/public/images/`

**Required filenames** (must match exactly):

#### Sports Uniforms:
```
american-football-1.jpg
american-football-2.jpg
american-football-3.jpg
basketball-1.jpg
basketball-2.jpg
soccer-1.jpg
goalkeeper-1.jpg
volleyball-1.jpg
```

#### Street Wears:
```
hoodie-1.jpg
hoodie-2.jpg
tshirt-1.jpg
tshirt-2.jpg
polo-1.jpg
tracksuit-1.jpg
```

#### Fitness Wears:
```
compression-shirt-1.jpg
compression-shorts-1.jpg
compression-suit-1.jpg
leggings-1.jpg
sports-bra-1.jpg
```

**Note:** You can use `.jpg`, `.jpeg`, or `.png` - just make sure the extension matches what you put in the database (currently `.jpg`)

### Step 2: Copy Your Images

```bash
# Navigate to project root
cd /home/taskeen/Desktop/ecommerce

# Copy your images (example)
cp /path/to/your/basketball-image.jpg client/public/images/basketball-1.jpg
cp /path/to/your/hoodie-image.jpg client/public/images/hoodie-1.jpg
# ... etc
```

### Step 3: Verify Files Exist

```bash
ls -la client/public/images/*.jpg
```

You should see your files listed.

### Step 4: Restart Server (if needed)

The dev server should pick up new files automatically, but if images don't appear:

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 5: Check in Browser

Visit: http://localhost:3000/products

---

## 🔧 Alternative: Update Database Paths

If you want to use different filenames, you need to update the database.

### Option A: Use Admin Panel (Easiest)

1. Go to http://localhost:3000/admin/login
2. Login (password: `admin123`)
3. Go to **Products**
4. Click **Edit** on the product
5. Update the image path or upload new image
6. Save

### Option B: Update Database Directly

You can use the script I created:
```bash
node update-image-paths.js
```

Or update via SQL (if you know SQL):
```bash
sqlite3 server/database/ecommerce.db
UPDATE products SET image = '/images/your-new-image.jpg' WHERE id = 1;
```

---

## ⚠️ Important Notes

### 1. NEVER Edit `client/dist/`
- ❌ `client/dist/` gets rebuilt every time you run `npm run build`
- ✅ Always edit `client/public/` (this is the source)

### 2. Database Won't Reset
- The seeding code ONLY runs when database is empty
- Once products exist, your images and paths will persist
- If database resets, check if `server/database/ecommerce.db` is being deleted

### 3. File Naming
- Must match exactly (case-sensitive)
- Database expects: `basketball-1.jpg`
- Your file: `basketball-1.jpg` ✅ (not `Basketball-1.jpg` or `basketball1.jpg`)

---

## 📋 Quick Checklist

- [ ] Images are in `client/public/images/` (NOT `client/dist/`)
- [ ] Filenames match exactly what database expects
- [ ] File extensions are correct (.jpg, .jpeg, or .png)
- [ ] Server has been restarted (if needed)
- [ ] Checked browser console for 404 errors
- [ ] Verified images appear at http://localhost:3000/products

---

## 🆘 Still Not Working?

1. **Check browser console** (F12 → Console tab) for 404 errors
2. **Check network tab** (F12 → Network tab) to see if images are loading
3. **Verify file exists:**
   ```bash
   ls -la client/public/images/basketball-1.jpg
   ```
4. **Check database path:**
   - Login to admin panel
   - Edit product
   - See what image path is stored
5. **Try accessing image directly:**
   - http://localhost:3000/images/basketball-1.jpg
   - Should show the image if it exists

---

## 💡 Pro Tip: Use Admin Panel for Uploads

The **easiest way** is to use the Admin Panel:
- Automatically handles file naming
- Saves to correct location
- Updates database paths
- No manual file management needed

Just go to Admin → Products → Edit → Upload Image → Save!

