# 🖼️ Quick Fix: Update Product Images

## The Problem

When you add images and restart the server, they get replaced because:
- You're probably editing files in `client/dist/` (which gets rebuilt) instead of `client/public/`
- The database has hardcoded image paths that need to match your image filenames

## ✅ The Solution (Simple Steps)

### Step 1: Add Your Images to the CORRECT Location

**IMPORTANT:** Always edit images in `client/public/images/` - NEVER edit `client/dist/` (it gets rebuilt)

1. **Copy your images** to:
   ```
   client/public/images/
   ```

2. **Name them EXACTLY as the database expects**:
   
   For **Sports Uniforms**:
   - `american-football-1.jpg`
   - `american-football-2.jpg`
   - `american-football-3.jpg`
   - `basketball-1.jpg`
   - `basketball-2.jpg`
   - `soccer-1.jpg`
   - `goalkeeper-1.jpg`
   - `volleyball-1.jpg`
   
   For **Street Wears**:
   - `hoodie-1.jpg`
   - `hoodie-2.jpg`
   - `tshirt-1.jpg`
   - `tshirt-2.jpg`
   - `polo-1.jpg`
   - `tracksuit-1.jpg`
   
   For **Fitness Wears**:
   - `compression-shirt-1.jpg`
   - `compression-shorts-1.jpg`
   - `compression-suit-1.jpg`
   - `leggings-1.jpg`
   - `sports-bra-1.jpg`

### Step 2: Verify Files Are in the Right Place

Run this command to check:
```bash
ls -la client/public/images/*.jpg
```

You should see your image files listed.

### Step 3: Restart Server

```bash
# Stop current server (Ctrl+C if running)
npm run dev
```

### Step 4: Check in Browser

Go to http://localhost:3000/products and verify images appear.

---

## 🔍 Troubleshooting

### Images still not showing?

**Check 1:** Make sure you're NOT editing `client/dist/` folder
- ✅ Edit: `client/public/images/`
- ❌ Don't edit: `client/dist/images/` (this gets rebuilt)

**Check 2:** Verify filenames match EXACTLY (case-sensitive)
- Database expects: `basketball-1.jpg`
- Your file must be: `basketball-1.jpg` (not `Basketball-1.jpg` or `basketball1.jpg`)

**Check 3:** Check if database file persists
```bash
ls -la server/database/ecommerce.db
```
If this file keeps getting deleted, that's why images reset. Make sure it's not in `.gitignore` for your local setup.

**Check 4:** Use Admin Panel to verify/update image paths
1. Go to http://localhost:3000/admin/login
2. Login with password: `admin123`
3. Go to Products → Edit product
4. Check the image path shown
5. Update it if needed

---

## 💡 Alternative: Use Admin Panel to Upload Images

**EASIEST METHOD:** Use the Admin Panel to upload images directly:

1. Start server: `npm run dev`
2. Login: http://localhost:3000/admin/login (password: `admin123`)
3. Go to Products
4. Click "Edit" on any product
5. Use the image upload feature
6. Save

This automatically:
- ✅ Saves images to correct location
- ✅ Updates database paths
- ✅ Handles file naming
- ✅ No manual file management needed

---

## 📝 Summary

- **Add images to**: `client/public/images/` (NOT `client/dist/`)
- **Name them exactly** as shown above
- **Database won't reset** once products exist (seeding only runs on empty DB)
- **Use Admin Panel** for easiest image management

