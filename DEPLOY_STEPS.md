# 🚀 Step-by-Step Deployment Guide

## Choose Your Deployment Method

### Option 1: Vercel (Frontend) + Railway (Backend) - **RECOMMENDED** ⭐
Best for: Easy deployment, free tier available, automatic SSL

### Option 2: Single Server (VPS) with PM2
Best for: Full control, custom domain, lower cost

### Option 3: Docker
Best for: Containerized deployment, easy scaling

---

## 🎯 Option 1: Vercel + Railway (Easiest)

### Step 1: Deploy Backend to Railway

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Select your repository**
5. **Railway will auto-detect** Node.js project
6. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   CLIENT_URL=https://your-vercel-domain.vercel.app
   ```
7. **Railway will deploy automatically**
8. **Copy your Railway URL** (e.g., `https://your-app.up.railway.app`)

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click "Add New Project"**
4. **Import your GitHub repository**
5. **Configure Project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-railway-url.up.railway.app
   VITE_WHATSAPP_NUMBER=923008522576
   ```
7. **Update `vercel.json`**:
   ```json
   {
     "buildCommand": "cd client && npm install && npm run build",
     "outputDirectory": "client/dist",
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://YOUR-RAILWAY-URL.up.railway.app/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   Replace `YOUR-RAILWAY-URL` with your actual Railway URL
8. **Click "Deploy"**

### Step 3: Update Railway with Vercel URL

1. Go back to Railway dashboard
2. Update `CLIENT_URL` environment variable:
   ```
   CLIENT_URL=https://your-vercel-domain.vercel.app
   ```
3. Railway will automatically redeploy

### ✅ Done! Your website is live!

---

## 🖥️ Option 2: Single Server (VPS) with PM2

### Prerequisites
- VPS/Server with Ubuntu/Debian
- Domain name (optional but recommended)
- SSH access to server

### Step 1: Connect to Your Server

```bash
ssh root@your-server-ip
```

### Step 2: Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

### Step 3: Upload Your Project

**Option A: Using Git (Recommended)**
```bash
# Install Git
apt install -y git

# Clone your repository
cd /var/www
git clone https://github.com/your-username/your-repo.git ecommerce
cd ecommerce
```

**Option B: Using SCP/SFTP**
```bash
# From your local machine
scp -r /home/taskeen/Desktop/ecommerce root@your-server-ip:/var/www/ecommerce
```

### Step 4: Install Dependencies

```bash
cd /var/www/ecommerce

# Install root dependencies
npm install --production

# Install client dependencies
cd client
npm install
cd ..
```

### Step 5: Create Environment File

```bash
nano .env
```

Add these variables:
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com

# Optional: Email configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CONTACT_EMAIL=Furorsport1@gmail.com

# Optional: Admin password (default is 'admin123')
ADMIN_PASSWORD=your-secure-password
```

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Build Frontend

```bash
npm run build:prod
```

This creates optimized files in `client/dist/`

### Step 7: Install PM2

```bash
npm install -g pm2
```

### Step 8: Start Application with PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 9: Configure Nginx (Reverse Proxy)

```bash
# Install Nginx
apt install -y nginx

# Create Nginx configuration
nano /etc/nginx/sites-available/ecommerce
```

Add this configuration:
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
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl restart nginx
```

### Step 10: Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts and enter your email
```

### Step 11: Update Environment Variable

```bash
nano .env
```

Update `CLIENT_URL`:
```env
CLIENT_URL=https://yourdomain.com
```

Restart PM2:
```bash
pm2 restart all
```

### ✅ Done! Your website is live at https://yourdomain.com

---

## 🐳 Option 3: Docker Deployment

### Step 1: Install Docker

```bash
# On Ubuntu/Debian
apt update
apt install -y docker.io docker-compose
systemctl start docker
systemctl enable docker
```

### Step 2: Upload Project

Upload your project folder to the server

### Step 3: Create .env File

```bash
nano .env
```

Add environment variables (same as Option 2, Step 5)

### Step 4: Build and Run

```bash
docker-compose up -d --build
```

### Step 5: Check Status

```bash
docker-compose ps
docker-compose logs
```

### ✅ Done! Application running in Docker

---

## 🔍 Verify Deployment

### Test Your Website

1. **Homepage**: Visit your domain - should load
2. **Products**: Check `/products` page
3. **Cart**: Add product to cart
4. **WhatsApp Order**: Test checkout flow
5. **Admin Panel**: Login at `/admin/login`

### Test API

```bash
# Test products endpoint
curl https://yourdomain.com/api/products

# Should return JSON with products
```

### Check Logs

**PM2:**
```bash
pm2 logs
pm2 status
```

**Docker:**
```bash
docker-compose logs -f
```

**Railway:**
- Go to Railway dashboard → View logs

**Vercel:**
- Go to Vercel dashboard → View deployment logs

---

## 🛠️ Useful Commands

### PM2 Commands
```bash
pm2 list              # View all processes
pm2 logs              # View logs
pm2 restart all       # Restart application
pm2 stop all          # Stop application
pm2 delete all        # Delete all processes
pm2 monit             # Monitor in real-time
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild
npm run build:prod

# Restart
pm2 restart all
```

### Database Backup
```bash
# Backup database
cp server/database/ecommerce.db server/database/backup-$(date +%Y%m%d).db
```

---

## 🆘 Troubleshooting

### Website Not Loading
- Check if server is running: `pm2 status` or `docker-compose ps`
- Check logs: `pm2 logs` or `docker-compose logs`
- Verify port is open: `netstat -tulpn | grep 5000`
- Check firewall: `ufw status`

### API Not Working
- Verify environment variables are set
- Check CORS configuration
- Verify database exists: `ls -la server/database/`

### Build Errors
- Clear node_modules: `rm -rf node_modules client/node_modules`
- Reinstall: `npm install && cd client && npm install`
- Rebuild: `npm run build:prod`

---

## 📝 Quick Reference

### Environment Variables Summary
```env
NODE_ENV=production          # Required
PORT=5000                    # Required
CLIENT_URL=https://...       # Required (your domain)
ADMIN_PASSWORD=...            # Optional (default: admin123)
EMAIL_HOST=...               # Optional (for email notifications)
EMAIL_USER=...               # Optional
EMAIL_PASS=...               # Optional
```

### File Structure After Build
```
ecommerce/
├── server/              # Backend
├── client/
│   └── dist/           # Built frontend (created by build)
├── .env                 # Environment variables
└── package.json
```

---

## 🎯 Recommended: Vercel + Railway

**Why?**
- ✅ Free tier available
- ✅ Automatic SSL/HTTPS
- ✅ Easy updates (just push to GitHub)
- ✅ Automatic deployments
- ✅ No server management needed
- ✅ Built-in CDN for fast loading

**Time to Deploy**: 10-15 minutes

---

## 📞 Need Help?

1. Check logs for errors
2. Verify environment variables
3. Test API endpoints
4. Check database exists
5. Review deployment documentation files

**Good luck with your deployment! 🚀**

