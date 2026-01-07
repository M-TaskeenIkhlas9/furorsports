# Cloudinary Debug Guide

## Why Images Are Still Being Lost

If images are still being saved locally (`/images/products/...`) instead of Cloudinary URLs (`https://res.cloudinary.com/...`), check these:

## 1. Check Hostinger Deployment Logs

After redeploying, check the server startup logs. You should see one of these messages:

✅ **SUCCESS:**
```
✓ Cloudinary configured - images will be stored in cloud storage
✓ Using Cloudinary storage for image uploads
```

❌ **FAILURE:**
```
⚠ Cloudinary not configured - using local storage (images will be lost on redeploy)
  To enable cloud storage, set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

OR

```
⚠ Cloudinary package not installed - using local storage
  Run: npm install cloudinary multer-storage-cloudinary
```

## 2. Verify Environment Variables in Hostinger

1. Go to **Hostinger → Deployments → Your Backend → Settings → Environment Variables**
2. Make sure these EXACT names are set (case-sensitive):
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. Values should be:
   - `CLOUDINARY_CLOUD_NAME = dmrygp1fm`
   - `CLOUDINARY_API_KEY = 395448217797185`
   - `CLOUDINARY_API_SECRET = ByPFqQvOwtZVHskQ7I1u2K-3A70`

## 3. Verify Packages Are Installed

Check if `cloudinary` and `multer-storage-cloudinary` are in `package.json`:
- They should be listed in `dependencies`

## 4. Test After Redeploy

1. Redeploy the backend (or wait for auto-redeploy)
2. Upload a NEW image in admin panel
3. Check the upload response - it should return:
   ```json
   {
     "success": true,
     "imagePath": "https://res.cloudinary.com/dmrygp1fm/image/upload/...",
     "cloudinary": true
   }
   ```
4. If it returns `/images/products/...` instead, Cloudinary is NOT being used

## 5. Check Server Logs for Upload Debug Info

After uploading an image, check server logs for:
- "✓ Image uploaded to Cloudinary: ..." (Cloudinary working)
- "⚠ Image saved to local storage..." (Cloudinary NOT working)

The logs will show:
- Whether environment variables are detected
- Whether Cloudinary packages are loaded
- What properties `req.file` has

## Common Issues

### Issue 1: Environment Variables Not Being Passed
**Symptom:** Logs show "Cloudinary not configured"
**Fix:** Re-add environment variables in Hostinger and redeploy

### Issue 2: Packages Not Installed
**Symptom:** Logs show "Cloudinary package not installed"
**Fix:** Packages should auto-install on deploy. If not, contact Hostinger support.

### Issue 3: Old Images Still Using Local Paths
**Symptom:** New uploads work but old images still broken
**Fix:** Old images in database have local paths. You'll need to:
- Re-upload those images (they'll be saved to Cloudinary)
- OR migrate existing images to Cloudinary (more complex)

