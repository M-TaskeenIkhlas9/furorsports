# 🚀 Quick Guide: Share Website with Client

## Super Easy Method (2 Steps!)

### Step 1: Start Your Development Server
Open Terminal 1 and run:
```bash
cd /home/taskeen/Desktop/ecommerce
npm run dev
```

Wait until you see:
- `Server is running on port 5000`
- `Local: http://localhost:3000/` (or 3001, 3002, etc.)

### Step 2: Share the Website
Open Terminal 2 (keep Terminal 1 running!) and run:
```bash
cd /home/taskeen/Desktop/ecommerce
npm run share
```

You'll see a URL like:
```
🌐 Share this URL with your client:
   https://random-name.loca.lt
```

**That's it!** Share that URL with your client. They can access your website from anywhere!

---

## Important Notes:

1. **Keep both terminals open** while sharing
2. **The URL changes** each time you restart the tunnel (free version)
3. **If frontend runs on a different port** (like 3001 or 3002), update `share-tunnel.js` or run:
   ```bash
   PORT=3001 npm run share
   ```

---

## To Stop Sharing:
Press `Ctrl+C` in Terminal 2 (the one running `npm run share`)

---

## Troubleshooting:

**"Error creating tunnel"**
- Make sure `npm run dev` is running first
- Check which port your frontend is using (look at the Vite output)
- If it's not 3000, use: `PORT=3001 npm run share` (replace 3001 with your port)

**Client can't access the site**
- Make sure both terminals are still running
- Check your internet connection
- Try restarting the tunnel: `Ctrl+C` then `npm run share` again

---

That's it! Super simple! 🎉

