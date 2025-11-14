# 🚀 Deploy Furor Sport Ecommerce - Complete Guide

This guide will help you deploy your website to production in 15 minutes!

## Architecture

- **Frontend (React)**: Deploy to **Vercel** (Free)
- **Backend (Node.js)**: Deploy to **Railway** (Free tier available) or **Render**

---

## Step 1: Deploy Backend to Railway (5 minutes)

### 1.1 Sign up for Railway

1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended)
4. Authorize Railway to access your repositories

### 1.2 Deploy Your Backend

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: `M-TaskeenIkhlas9/ecommerce`
4. Railway will auto-detect it's a Node.js project

### 1.3 Configure Backend Settings

1. Go to your project → **Settings**
2. **Root Directory**: Leave empty (uses root `/`)
3. **Build Command**: `npm install`
4. **Start Command**: `npm run start:prod`

### 1.4 Add Environment Variables

Go to **Variables** tab and add:

```env
PORT=5000
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
CLIENT_URL=https://your-vercel-url.vercel.app
```

**Note**: 
- Replace Stripe keys with your actual keys (get from https://dashboard.stripe.com/apikeys)
- For `CLIENT_URL`, we'll update this after deploying frontend

### 1.5 Get Your Backend URL

1. Railway will automatically deploy
2. Go to **Settings** → **Domains**
3. Railway provides a URL like: `https://your-app.up.railway.app`
4. **Copy this URL** - you'll need it for Vercel!

---

## Step 2: Deploy Frontend to Vercel (5 minutes)

### 2.1 Sign up for Vercel

1. Go to: https://vercel.com
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended)
4. Authorize Vercel to access your repositories

### 2.2 Deploy Your Frontend

#### Option A: Using Vercel Dashboard (Easiest)

1. Click **"Add New Project"**
2. **Import Git Repository**: Select `M-TaskeenIkhlas9/ecommerce`
3. **Configure Project**:
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: `client` ⚠️ **IMPORTANT!**
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Environment Variables** → Add:
   ```
   VITE_API_URL=https://your-railway-backend.up.railway.app
   ```
   (Replace with your actual Railway URL from Step 1)

5. Click **"Deploy"**

#### Option B: Using Vercel CLI

```bash
cd /home/taskeen/Desktop/ecommerce
npm install -g vercel
vercel login
vercel
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **furor-sport-ecommerce**
- Directory? **./client** ⚠️ **IMPORTANT!**
- Override settings? **No**

Then add environment variable in Vercel dashboard:
- Go to project → **Settings** → **Environment Variables**
- Add: `VITE_API_URL` = `https://your-railway-backend.up.railway.app`

### 2.3 Configure Vercel Rewrites

We need to proxy API calls to Railway. Update `vercel.json`:

The file should already exist with this content:
```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-railway-backend.up.railway.app/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Important**: Replace `your-railway-backend.up.railway.app` with your actual Railway URL!

---

## Step 3: Update Backend CORS (2 minutes)

After getting your Vercel URL:

1. **Go back to Railway**
2. **Update `CLIENT_URL` variable**:
   ```
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
   (Replace with your actual Vercel URL)
3. Railway will **auto-redeploy** when you save

---

## Step 4: Update vercel.json with Railway URL

1. **Update `vercel.json`** with your Railway backend URL
2. **Commit and push**:
   ```bash
   git add vercel.json
   git commit -m "Configure Vercel rewrites for Railway backend"
   git push origin main
   ```
3. Vercel will **auto-redeploy**

---

## Step 5: Test Your Deployment! 🎉

1. Visit your Vercel URL
2. Test the website:
   - Browse products ✅
   - Add to cart ✅
   - Checkout ✅
   - Admin login ✅

---

## Alternative: Deploy Backend to Render

If Railway doesn't work, use Render:

1. Go to: https://render.com
2. Sign up/Login with GitHub
3. **New** → **Web Service**
4. **Connect GitHub repository**: `M-TaskeenIkhlas9/ecommerce`
5. **Configure**:
   - **Name**: `furor-sport-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Root Directory**: `/` (leave empty)
6. **Add Environment Variables** (same as Railway)
7. **Deploy**
8. Get your Render URL and use it in Vercel instead of Railway

---

## Troubleshooting

### API calls not working?
- ✅ Check `VITE_API_URL` in Vercel environment variables
- ✅ Make sure Railway backend is running
- ✅ Check browser console for errors
- ✅ Verify `vercel.json` has correct Railway URL

### CORS errors?
- ✅ Update `CLIENT_URL` in Railway with your Vercel URL
- ✅ Redeploy Railway

### Images not loading?
- ✅ Make sure image paths are correct
- ✅ Check if images are in `client/public/images/`

### 404 errors on page refresh?
- ✅ Vercel rewrites should handle this (already configured)

---

## Quick Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Backend URL copied
- [ ] Environment variables set in backend (Stripe keys, CLIENT_URL)
- [ ] Frontend deployed to Vercel
- [ ] Root directory set to `client` in Vercel
- [ ] `vercel.json` updated with Railway URL
- [ ] Environment variables set in Vercel (VITE_API_URL)
- [ ] CORS configured in backend (CLIENT_URL updated)
- [ ] Test the deployed site!

---

## Your Live URLs

After deployment, you'll have:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.up.railway.app`

---

## Need Help?

If you encounter any issues during deployment, let me know and I'll help you troubleshoot!

