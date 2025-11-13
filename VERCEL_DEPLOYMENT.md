# 🚀 Deploy Furor Sport Ecommerce to Vercel

This guide will help you deploy your full-stack ecommerce website.

## Architecture

- **Frontend (React)**: Deploy to Vercel
- **Backend (Node.js/Express)**: Deploy to Railway or Render

---

## Step 1: Deploy Backend to Railway (Recommended)

### Why Railway First?
We need the backend URL to configure the frontend.

### Steps:

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `M-TaskeenIkhlas9/ecommerce`
6. **Railway will auto-detect** it's a Node.js project

### Configure Backend:

1. **Set Root Directory**: 
   - Go to Settings → Root Directory
   - Set to: `/` (root of repo)

2. **Add Environment Variables**:
   - Go to Variables tab
   - Add these variables:
     ```
     PORT=5000
     NODE_ENV=production
     STRIPE_SECRET_KEY=your_stripe_secret_key_here
     STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
     CLIENT_URL=https://your-vercel-url.vercel.app
     ADMIN_PASSWORD=admin123
     ```

3. **Update Build & Start Commands**:
   - Go to Settings → Deploy
   - Build Command: `npm install`
   - Start Command: `npm run start:prod`

4. **Get Your Backend URL**:
   - Railway will provide a URL like: `https://your-app.railway.app`
   - **Copy this URL** - you'll need it for Vercel!

---

## Step 2: Deploy Frontend to Vercel

### Steps:

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to project**:
   ```bash
   cd /home/taskeen/Desktop/ecommerce
   ```

4. **Deploy**:
   ```bash
   vercel
   ```

5. **Follow the prompts**:
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No** (first time)
   - Project name? **furor-sport-ecommerce** (or your choice)
   - Directory? **./client** (IMPORTANT!)
   - Override settings? **No**

### Configure Frontend:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Go to Settings → Environment Variables**
4. **Add**:
   ```
   VITE_API_URL=https://your-railway-backend.railway.app
   ```

5. **Update API Configuration**:
   - We need to update the frontend to use the Railway backend URL
   - This will be done in the next step

---

## Step 3: Update Frontend API Configuration

We need to update the frontend to use the production backend URL.

### Update `client/vite.config.js`:

The proxy configuration needs to be updated, or we can use environment variables.

### Create `client/.env.production`:

```env
VITE_API_URL=https://your-railway-backend.railway.app
```

### Update API calls in frontend:

We'll need to update all API calls to use `import.meta.env.VITE_API_URL` instead of relative paths.

---

## Step 4: Update CORS in Backend

Make sure your backend allows requests from your Vercel domain.

### Update `server/index.js`:

The CORS configuration should already handle this, but verify it includes your Vercel URL.

---

## Step 5: Redeploy

After making changes:

1. **Commit and push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for production deployment"
   git push origin main
   ```

2. **Railway will auto-deploy** (if connected to GitHub)
3. **Vercel will auto-deploy** (if connected to GitHub)

---

## Alternative: Deploy Backend to Render

If Railway doesn't work, use Render:

1. **Go to**: https://render.com
2. **Sign up/Login**
3. **New → Web Service**
4. **Connect GitHub repository**
5. **Configure**:
   - Name: `furor-sport-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm run start:prod`
   - Root Directory: `/` (leave empty)
6. **Add Environment Variables** (same as Railway)
7. **Deploy**

---

## Quick Deployment Checklist

- [ ] Backend deployed to Railway/Render
- [ ] Backend URL copied
- [ ] Environment variables set in backend
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Frontend API calls updated
- [ ] CORS configured in backend
- [ ] Test the deployed site!

---

## Need Help?

If you encounter issues, let me know and I'll help you troubleshoot!

