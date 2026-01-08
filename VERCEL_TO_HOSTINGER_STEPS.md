# Step-by-Step: Remove Domain from Vercel → Point to Hostinger

## Step 1: Get Hostinger's IP Address

You need to find Hostinger's IP address first. You can:

1. **Check Hostinger hPanel:**
   - Go to **Websites** → **Your Frontend Site** → **Settings** or **Details**
   - Look for "IP Address" or "Server IP"
   
2. **Or contact Hostinger support** and ask for the IP address for your hosting account

3. **Or use a temporary method:**
   - Go to Hostinger hPanel → **Domains** → **Nameservers**
   - Note the nameservers (we'll use these in Option 1)

## Step 2A: Option 1 - Change Nameservers (Easiest)

### In Vercel:
1. Go to **Domains** → `furorsportspk.com` → **Settings** tab
2. Scroll down to **Nameservers** section
3. Click **"Change Nameservers"** or **"Use Custom Nameservers"**
4. Enter Hostinger's nameservers (get them from Hostinger hPanel):
   ```
   ns1.dns-parking.com
   ns2.dns-parking.com
   ```
   (Check Hostinger hPanel for exact nameservers)
5. Click **Save**

### In Hostinger:
1. Go to **Websites** → **Your Frontend Site** → **Settings** → **Domain**
2. Click **"Add Domain"** or **"Change Domain"**
3. Enter: `furorsportspk.com`
4. Set as **Primary Domain**
5. Click **Save**

### Result:
- All DNS management moves to Hostinger
- Vercel records will be ignored (but you can delete them later)
- Domain will point to Hostinger

---

## Step 2B: Option 2 - Update DNS Records in Vercel (Keep DNS at Vercel)

### In Vercel DNS Settings:

1. **Remove existing ALIAS records:**
   - Find the ALIAS records (the ones with `*` and lock icons)
   - Click the **three-dot menu** (⋯) next to each
   - Click **Delete** or **Remove**
   - Confirm deletion

2. **Add A Record for root domain:**
   - In the DNS form at the top:
     - **Name:** Leave blank or enter `@` (this means root domain)
     - **Type:** `A` (already selected)
     - **Value:** Enter Hostinger's IP address (e.g., `185.230.63.107` - get exact IP from Hostinger)
     - **TTL:** `3600` (or `60` if you prefer)
     - **Comment:** "Pointing to Hostinger frontend"
   - Click **Add**

3. **Keep the CAA record** (for SSL certificates) - don't delete it

### In Hostinger:
1. Go to **Websites** → **Your Frontend Site** → **Settings** → **Domain**
2. Click **"Add Domain"**
3. Enter: `furorsportspk.com`
4. Set as **Primary Domain**
5. Click **Save**

### Result:
- Domain points to Hostinger
- DNS still managed in Vercel
- Can remove domain from Vercel project later if needed

---

## Step 3: Enable SSL in Hostinger

1. Go to **Hostinger hPanel** → **SSL** → **Free SSL**
2. Find `furorsportspk.com` in the list
3. Click **Enable** or toggle SSL on
4. Wait 1-2 hours for SSL certificate to be issued automatically

---

## Step 4: Remove Domain from Vercel Project (Optional)

After DNS is updated and working:

1. In **Vercel** → **Domains** → `furorsportspk.com`
2. Click **Settings** tab
3. Scroll down to **Danger Zone**
4. Click **"Remove Domain"**
5. Confirm removal

**Note:** Only do this AFTER the domain is working on Hostinger (wait 24-48 hours for DNS to fully propagate).

---

## Step 5: Update Environment Variables

### Backend (Hostinger):
1. Go to **Deployments** → **Your Backend** → **Settings** → **Environment Variables**
2. Update:
   ```
   CLIENT_URL = https://furorsportspk.com
   ```
3. Click **Save** and **Redeploy**

### Frontend (Hostinger):
1. Go to **Deployments** → **Your Frontend** → **Settings** → **Environment Variables**
2. Ensure:
   ```
   VITE_API_URL = https://slategray-ape-705284.hostingersite.com/api
   ```
   (Or your backend URL)

---

## Timeline

- **DNS Changes**: Take effect immediately, but propagation takes 24-48 hours globally
- **SSL Certificate**: 1-2 hours after DNS is pointing to Hostinger
- **Full Setup**: 24-48 hours for everything to work worldwide

---

## Verify It's Working

After 24-48 hours:

1. Check: `https://furorsportspk.com` - should show your Hostinger site
2. Check: `https://furorsportspk.com/api/health` - should show backend health
3. Use: `nslookup furorsportspk.com` in terminal - should show Hostinger IP

---

## Troubleshooting

**Domain still shows Vercel site?**
- Wait longer (DNS can take up to 48 hours)
- Clear browser cache
- Try incognito/private window
- Check DNS propagation: https://www.whatsmydns.net/

**SSL not working?**
- Ensure DNS is pointing to Hostinger first
- Wait a few hours for SSL certificate
- Check SSL status in Hostinger hPanel

**404 or site not found?**
- Verify domain is added in Hostinger → Websites → Settings → Domain
- Check Hostinger deployment is active
- Verify environment variables are correct

