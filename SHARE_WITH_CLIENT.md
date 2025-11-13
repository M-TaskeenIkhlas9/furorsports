# How to Share Your Website with Client for Review

This guide provides multiple options to share your Furor Sport ecommerce website with your client for design review and feedback.

---

## Option 1: Quick Sharing with ngrok (Recommended for Quick Review)

**Best for:** Immediate sharing, testing, and getting quick feedback

### Steps:

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or install via package manager:
   sudo snap install ngrok
   # Or download the binary and add to PATH
   ```

2. **Start your development server:**
   ```bash
   cd /home/taskeen/Desktop/ecommerce
   npm run dev
   ```

3. **In a new terminal, start ngrok:**
   ```bash
   ngrok http 3000
   # If your frontend runs on a different port, use that port instead
   ```

4. **Share the ngrok URL:**
   - ngrok will provide a URL like: `https://abc123.ngrok.io`
   - Share this URL with your client
   - The URL will forward to your local server

**Note:** Free ngrok URLs change each time you restart. For a stable URL, consider ngrok's paid plan or use Option 2.

---

## Option 2: Deploy to Vercel (Frontend) + Railway/Render (Backend)

**Best for:** Permanent, professional URL for client review

### Frontend (Vercel) - Free:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

3. **Deploy:**
   ```bash
   vercel
   # Follow the prompts
   ```

4. **Update API URLs:**
   - After deployment, update your API calls to point to your backend URL

### Backend (Railway/Render) - Free tier available:

**Railway:**
1. Go to https://railway.app
2. Connect your GitHub repository
3. Add environment variables from your `.env` file
4. Deploy

**Render:**
1. Go to https://render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm run start:prod`
6. Add environment variables

---

## Option 3: Deploy to a VPS (DigitalOcean, AWS, etc.)

**Best for:** Full control, production-ready deployment

### Quick Setup:

1. **Get a VPS** (DigitalOcean Droplet, AWS EC2, etc.)
2. **SSH into your server**
3. **Clone your repository:**
   ```bash
   git clone https://github.com/M-TaskeenIkhlas9/ecommerce.git
   cd ecommerce
   ```

4. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

5. **Build for production:**
   ```bash
   npm run build:prod
   ```

6. **Set up PM2:**
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

7. **Set up Nginx** (reverse proxy):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

---

## Option 4: Use LocalTunnel (Alternative to ngrok)

**Best for:** Quick sharing without installation

1. **Install localtunnel:**
   ```bash
   npm install -g localtunnel
   ```

2. **Start your server:**
   ```bash
   npm run dev
   ```

3. **Create tunnel:**
   ```bash
   lt --port 3000
   # Or for backend:
   lt --port 5000
   ```

4. **Share the provided URL**

---

## Option 5: Build and Share Static Files (Limited - Frontend Only)

**Best for:** Design-only review (no backend functionality)

1. **Build the frontend:**
   ```bash
   cd client
   npm run build
   ```

2. **Share the `client/dist` folder:**
   - Upload to a static hosting service (Netlify, Vercel, GitHub Pages)
   - Or zip and send to client (they can open `index.html` locally)

**Note:** This won't work for full functionality (cart, checkout, admin panel) as it requires the backend.

---

## Recommended Approach for Client Review:

### For Quick Initial Review:
1. Use **ngrok** or **localtunnel** to share immediately
2. Get initial feedback
3. Make changes locally
4. Share updated URL

### For Professional Presentation:
1. Deploy to **Vercel** (frontend) + **Railway** (backend)
2. Get a permanent URL
3. Share with client for thorough review

---

## Important Notes:

1. **Environment Variables:**
   - Make sure to set all environment variables in your hosting platform
   - Don't commit `.env` file to GitHub

2. **Database:**
   - For production, consider migrating from SQLite to PostgreSQL
   - Or ensure SQLite database is included in deployment

3. **CORS:**
   - Update CORS settings in `server/index.js` to allow your production domain

4. **Stripe:**
   - Use test keys for review
   - Switch to live keys only when going live

---

## Quick Start Commands:

### For ngrok (if installed):
```bash
# Terminal 1: Start your app
cd /home/taskeen/Desktop/ecommerce
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

### For localtunnel:
```bash
# Terminal 1: Start your app
cd /home/taskeen/Desktop/ecommerce
npm run dev

# Terminal 2: Start tunnel
lt --port 3000
```

---

## Need Help?

If you need assistance with any of these options, let me know which one you'd like to use and I can help you set it up!

