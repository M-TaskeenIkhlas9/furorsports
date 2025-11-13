# 🚀 Quick Deployment Guide

## Step 1: Deploy Backend to Railway (5 minutes)

1. **Go to**: https://railway.app
2. **Login with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select**: `M-TaskeenIkhlas9/ecommerce`
5. **Wait for Railway to detect** Node.js project

### Configure Railway:

1. **Settings → Root Directory**: Leave empty (uses root `/`)
2. **Settings → Deploy**:
   - Build Command: `npm install`
   - Start Command: `npm run start:prod`
3. **Variables Tab** → Add these:
   ```
   PORT=5000
   NODE_ENV=production
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   CLIENT_URL=https://your-vercel-url.vercel.app
   ADMIN_PASSWORD=admin123
   ```
4. **Wait for deployment** (2-3 minutes)
5. **Copy the Railway URL** (e.g., `https://your-app.up.railway.app`)

---

## Step 2: Deploy Frontend to Vercel (5 minutes)

### Option A: Using Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com
2. **Login with GitHub**
3. **Click "Add New Project"**
4. **Import**: `M-TaskeenIkhlas9/ecommerce`
5. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` (IMPORTANT!)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
6. **Environment Variables** → Add:
   ```
   VITE_API_URL=https://your-railway-backend.up.railway.app
   ```
   (Replace with your actual Railway URL from Step 1)
7. **Click "Deploy"**

### Option B: Using Vercel CLI

```bash
cd /home/taskeen/Desktop/ecommerce
npm install -g vercel
vercel login
vercel --prod
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **furor-sport-ecommerce**
- Directory? **./client**
- Override settings? **No**

Then add environment variable in Vercel dashboard:
- Go to your project → Settings → Environment Variables
- Add: `VITE_API_URL` = `https://your-railway-backend.up.railway.app`

---

## Step 3: Update Backend CORS

After getting your Vercel URL:

1. **Go back to Railway**
2. **Update `CLIENT_URL` variable**:
   ```
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
3. **Redeploy** (Railway will auto-redeploy)

---

## Step 4: Test!

1. Visit your Vercel URL
2. Test the website
3. Check if API calls work (add to cart, etc.)

---

## Troubleshooting

**API calls not working?**
- Check `VITE_API_URL` in Vercel environment variables
- Make sure Railway backend is running
- Check browser console for errors

**CORS errors?**
- Update `CLIENT_URL` in Railway with your Vercel URL
- Redeploy Railway

**Images not loading?**
- Make sure image paths are correct
- Check Railway static file serving

---

## That's it! 🎉

Your website should now be live on Vercel!

