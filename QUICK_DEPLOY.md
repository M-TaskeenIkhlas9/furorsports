# Quick Deployment Guide

## For Quick Deployment (5 Minutes)

### Step 1: Update Environment Variables

Edit `.env` file:
```env
NODE_ENV=production
PORT=5000
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
CLIENT_URL=https://yourdomain.com
```

### Step 2: Build and Start

```bash
# Build frontend
npm run build:prod

# Start production server
npm run start:prod
```

### Step 3: Deploy to Your Server

**Option 1: Simple Upload**
1. Upload entire project folder to server
2. Run `npm install --production` on server
3. Run `npm run build:prod`
4. Run `npm run start:prod`

**Option 2: Using PM2 (Recommended)**
```bash
npm install -g pm2
npm run build:prod
pm2 start ecosystem.config.js --env production
pm2 save
```

**Option 3: Using Docker**
```bash
docker-compose up -d
```

## Important Notes

1. **Stripe Keys**: Must use LIVE keys (sk_live_... and pk_live_...)
2. **Domain**: Update CLIENT_URL to your actual domain
3. **HTTPS**: Set up SSL certificate (Let's Encrypt recommended)
4. **Database**: The SQLite database will be created automatically

## Verify Deployment

1. Visit your domain
2. Test adding products to cart
3. Test checkout with Stripe
4. Check server logs for any errors

## Need Help?

See `DEPLOYMENT.md` for detailed deployment instructions.

