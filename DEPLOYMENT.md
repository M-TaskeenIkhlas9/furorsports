# Production Deployment Guide

This guide will help you deploy the Toledo Exporters ecommerce website to a live server.

## Pre-Deployment Checklist

- [ ] Update Stripe keys to **live keys** (not test keys)
- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Update `CLIENT_URL` to your production domain
- [ ] Build the frontend (`npm run build`)
- [ ] Test the production build locally
- [ ] Backup your database

## Deployment Steps

### 1. Prepare Environment Variables

Create/update your `.env` file for production:

```env
NODE_ENV=production
PORT=5000

# Stripe Live Keys (NOT test keys!)
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here

# Your production domain
CLIENT_URL=https://yourdomain.com

# Optional: Webhook secret for Stripe webhooks
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Build the Frontend

```bash
npm run build:prod
```

This will:
- Build the React app for production
- Optimize and minify all assets
- Create production-ready files in `client/dist/`

### 3. Test Production Build Locally

Before deploying, test the production build:

```bash
NODE_ENV=production npm start
```

Then visit `http://localhost:5000` - you should see your website working.

### 4. Deploy to Server

#### Option A: Using PM2 (Recommended)

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Start the application:**
   ```bash
   NODE_ENV=production pm2 start server/index.js --name toledo-exporters
   ```

3. **Save PM2 configuration:**
   ```bash
   pm2 save
   pm2 startup
   ```

4. **Useful PM2 commands:**
   ```bash
   pm2 list              # View running processes
   pm2 logs              # View logs
   pm2 restart toledo-exporters  # Restart app
   pm2 stop toledo-exporters     # Stop app
   ```

#### Option B: Using systemd (Linux)

Create a service file `/etc/systemd/system/toledo-exporters.service`:

```ini
[Unit]
Description=Toledo Exporters Ecommerce
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/ecommerce
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable toledo-exporters
sudo systemctl start toledo-exporters
```

#### Option C: Direct Node.js

```bash
NODE_ENV=production node server/index.js
```

### 5. Set Up Reverse Proxy (Nginx)

If using Nginx, create a configuration file:

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

### 6. Set Up SSL/HTTPS

Use Let's Encrypt for free SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 7. Configure Stripe Webhooks (Optional but Recommended)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/payment/webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook signing secret to your `.env` file

## Server Requirements

- **Node.js**: v14 or higher
- **RAM**: Minimum 512MB (1GB recommended)
- **Storage**: 100MB+ for application and database
- **Port**: 5000 (or configure as needed)

## Database Backup

The SQLite database is located at: `server/database/ecommerce.db`

**Backup regularly:**
```bash
cp server/database/ecommerce.db server/database/ecommerce.db.backup
```

## Monitoring

### Check Application Status

```bash
# If using PM2
pm2 status
pm2 logs toledo-exporters

# If using systemd
sudo systemctl status toledo-exporters
```

### View Logs

```bash
# PM2
pm2 logs toledo-exporters

# systemd
sudo journalctl -u toledo-exporters -f
```

## Troubleshooting

### Application Won't Start

1. Check environment variables are set correctly
2. Verify Node.js version: `node --version`
3. Check port is not in use: `lsof -i :5000`
4. Review logs for errors

### Database Issues

1. Check file permissions on `server/database/ecommerce.db`
2. Ensure database directory exists
3. Verify SQLite is installed: `sqlite3 --version`

### Stripe Payments Not Working

1. Verify you're using **live keys** (not test keys)
2. Check `CLIENT_URL` matches your production domain
3. Review Stripe Dashboard for errors
4. Check server logs for Stripe API errors

## Post-Deployment

1. **Test all features:**
   - Browse products
   - Add to cart
   - Complete checkout with test payment
   - Newsletter subscription
   - Contact form

2. **Monitor performance:**
   - Check server resources
   - Monitor error logs
   - Review Stripe dashboard for payments

3. **Set up backups:**
   - Database backups (daily recommended)
   - Environment file backup
   - Code repository backup

## Security Checklist

- [ ] Use HTTPS (SSL certificate)
- [ ] Keep Node.js and dependencies updated
- [ ] Use strong environment variables
- [ ] Enable firewall (only allow ports 80, 443, and SSH)
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Don't commit `.env` file to version control
- [ ] Use PM2 or systemd for process management
- [ ] Set up log rotation

## Scaling Considerations

For high traffic:
- Consider migrating from SQLite to PostgreSQL or MySQL
- Use a process manager (PM2) with cluster mode
- Set up load balancing
- Use CDN for static assets
- Implement caching strategies

## Support

For deployment issues:
- Check server logs
- Review Stripe Dashboard
- Verify environment variables
- Test API endpoints: `curl https://yourdomain.com/api/products`

