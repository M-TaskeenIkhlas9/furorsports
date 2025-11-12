# 🚀 Production Deployment - Quick Start

Your ecommerce website is **production-ready**! Follow these steps to deploy it live.

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] **Stripe Live Keys** (not test keys!)
  - Get from: https://dashboard.stripe.com/apikeys
  - Switch to "Live mode" in Stripe Dashboard
  - Copy `sk_live_...` and `pk_live_...` keys

- [ ] **Domain Name** (your website URL)
  - Example: `https://toledoexporters.com`

- [ ] **Server/VPS** with Node.js installed
  - Minimum: 1GB RAM, 10GB storage
  - Recommended: 2GB RAM, 20GB storage

## 🎯 Quick Deployment (3 Steps)

### Step 1: Update Environment Variables

Edit the `.env` file on your server:

```env
NODE_ENV=production
PORT=5000

# Stripe LIVE Keys (Important: Use live keys!)
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY

# Your production domain
CLIENT_URL=https://yourdomain.com
```

### Step 2: Build the Application

On your server, run:

```bash
npm run build:prod
```

Or use the build script:
```bash
chmod +x build.sh
./build.sh
```

### Step 3: Start the Server

**Option A: Using PM2 (Recommended)**
```bash
npm install -g pm2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**Option B: Direct Start**
```bash
npm run start:prod
```

**Option C: Using Docker**
```bash
docker-compose up -d
```

## 🌐 Setting Up Domain & SSL

### 1. Point Domain to Server

Update your domain's DNS:
- A Record: `@` → Your server IP
- A Record: `www` → Your server IP

### 2. Install Nginx (Reverse Proxy)

```bash
sudo apt update
sudo apt install nginx
```

### 3. Configure Nginx

Create `/etc/nginx/sites-available/toledo-exporters`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/toledo-exporters /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Install SSL Certificate (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## ✅ Verify Deployment

1. **Visit your website**: `https://yourdomain.com`
2. **Test products page**: Should show all products
3. **Test cart**: Add items to cart
4. **Test checkout**: Complete a test payment
5. **Check Stripe Dashboard**: Verify payments are being processed

## 📊 Monitoring

### View Logs

**PM2:**
```bash
pm2 logs toledo-exporters
```

**Direct:**
```bash
tail -f logs/out.log
```

### Check Status

```bash
pm2 status
```

## 🔒 Security Checklist

- [x] HTTPS enabled (SSL certificate)
- [x] Stripe live keys configured
- [x] Environment variables secured
- [ ] Firewall configured (ports 80, 443, SSH only)
- [ ] Regular backups scheduled
- [ ] Node.js and dependencies updated

## 📦 Database Backup

Backup your database regularly:

```bash
cp server/database/ecommerce.db server/database/ecommerce.db.backup.$(date +%Y%m%d)
```

## 🆘 Troubleshooting

### Website Not Loading
- Check if server is running: `pm2 status`
- Check Nginx: `sudo systemctl status nginx`
- Check logs: `pm2 logs`

### Payments Not Working
- Verify Stripe LIVE keys (not test keys)
- Check `CLIENT_URL` matches your domain
- Review Stripe Dashboard for errors

### Products Not Showing
- Check database exists: `ls server/database/`
- Verify API is working: `curl http://localhost:5000/api/products`

## 📚 Full Documentation

- **Detailed Guide**: See `DEPLOYMENT.md`
- **Quick Reference**: See `QUICK_DEPLOY.md`
- **Stripe Setup**: See `STRIPE_SETUP.md`

## 🎉 You're Ready!

Your ecommerce website is now production-ready. After deployment:

1. Test all features
2. Monitor for 24-48 hours
3. Set up regular backups
4. Monitor Stripe dashboard for payments

Good luck with your deployment! 🚀

