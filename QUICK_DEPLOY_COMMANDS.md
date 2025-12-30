# 🚀 Quick Deployment Commands

## Local Testing Before Deployment

```bash
# 1. Install all dependencies
npm run install-all

# 2. Build frontend for production
npm run build

# 3. Test production build locally
NODE_ENV=production npm start

# 4. Visit http://localhost:5000 to test
```

---

## Production Deployment Commands

### Option 1: PM2 (Recommended for VPS)

```bash
# Install PM2 globally
npm install -g pm2

# Build frontend
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Enable PM2 on startup
pm2 startup
```

### Option 2: Direct Node.js

```bash
# Build frontend
npm run build

# Start production server
npm run start:prod
```

### Option 3: Docker

```bash
# Build and start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Environment Variables Setup

```bash
# Create .env file from template
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

---

## Build Verification

```bash
# Check if build was successful
test -f client/dist/index.html && echo "✅ Build successful" || echo "❌ Build failed"

# Check build size
du -sh client/dist
```

---

## Quick Health Check

```bash
# Check if server is running
curl http://localhost:5000/api/products | head -20

# Check database exists
test -f server/database/ecommerce.db && echo "✅ Database exists" || echo "❌ Database missing"
```

---

## Deployment Platforms

### Railway (Backend)
- Build Command: `npm install`
- Start Command: `npm run start:prod`
- Root Directory: `/` (leave empty)

### Vercel (Frontend)
- Framework: Vite
- Root Directory: `client`
- Build Command: `npm run build` (auto-detected)
- Output Directory: `dist` (auto-detected)

---

**Remember:** Always set `NODE_ENV=production` and use strong passwords in production!

