# ✅ Deployment Checklist

## Pre-Deployment

- [x] ✅ Application fully built and tested
- [x] ✅ Stripe payment integration working
- [x] ✅ Production build script created
- [x] ✅ PM2 configuration ready
- [x] ✅ Docker configuration ready
- [x] ✅ Environment variable templates created
- [x] ✅ Static file serving configured
- [x] ✅ CORS configured for production
- [x] ✅ All routes working
- [x] ✅ Database schema ready

## Before Deploying to Live Server

### 1. Environment Setup
- [ ] Get Stripe **LIVE** keys from dashboard
- [ ] Create `.env` file on production server
- [ ] Set `NODE_ENV=production`
- [ ] Set `CLIENT_URL` to your production domain
- [ ] Add Stripe live keys (sk_live_... and pk_live_...)

### 2. Build Process
- [ ] Run `npm install --production` on server
- [ ] Run `cd client && npm install && cd ..`
- [ ] Run `npm run build:prod`
- [ ] Verify `client/dist/` folder exists

### 3. Server Setup
- [ ] Install Node.js (v14+)
- [ ] Install PM2 (optional but recommended)
- [ ] Configure firewall (ports 80, 443, SSH)
- [ ] Set up Nginx reverse proxy (optional)
- [ ] Install SSL certificate (Let's Encrypt)

### 4. Start Application
- [ ] Start with PM2: `pm2 start ecosystem.config.js --env production`
- [ ] Or start directly: `npm run start:prod`
- [ ] Verify server is running: `pm2 status` or `curl http://localhost:5000/api/products`

### 5. Domain Configuration
- [ ] Point domain DNS to server IP
- [ ] Configure Nginx (if using)
- [ ] Set up SSL/HTTPS
- [ ] Test website loads at your domain

### 6. Testing
- [ ] Test homepage loads
- [ ] Test products page shows items
- [ ] Test adding to cart
- [ ] Test checkout with Stripe
- [ ] Test newsletter subscription
- [ ] Test contact form
- [ ] Verify orders are created

### 7. Monitoring
- [ ] Set up log monitoring
- [ ] Configure database backups
- [ ] Monitor Stripe dashboard
- [ ] Set up uptime monitoring (optional)

## Post-Deployment

- [ ] Monitor for 24-48 hours
- [ ] Check error logs regularly
- [ ] Verify payments are processing
- [ ] Set up automated backups
- [ ] Document any custom configurations

## Quick Commands Reference

```bash
# Build
npm run build:prod

# Start Production
npm run start:prod

# PM2 Start
pm2 start ecosystem.config.js --env production

# PM2 Monitor
pm2 logs toledo-exporters
pm2 status

# Backup Database
cp server/database/ecommerce.db server/database/backup-$(date +%Y%m%d).db
```

## Support Files

- `DEPLOYMENT.md` - Full deployment guide
- `QUICK_DEPLOY.md` - 5-minute quick start
- `README_DEPLOYMENT.md` - Deployment overview
- `PRODUCTION_READY.md` - Production readiness summary

