# Domain Setup: Vercel Domain → Hostinger

## Your Current Setup
- **Domain**: `furorsportspk.com` (bought from Vercel)
- **Frontend**: Deployed on Vercel (currently using the domain)
- **Backend**: Deployed on Hostinger (`slategray-ape-705284.hostingersite.com`)

## Option 1: Move Frontend to Hostinger (Recommended)

This moves everything to Hostinger and uses your custom domain for the main site.

### Step 1: Transfer Frontend to Hostinger

1. **Build your frontend for Hostinger deployment:**
   ```bash
   cd client
   npm run build
   ```
   This creates a `dist` folder with production build.

2. **In Hostinger hPanel:**
   - Go to **Deployments** → **Your Frontend Site**
   - Make sure it's connected to your GitHub repo
   - Or upload the `dist` folder contents to your frontend deployment

### Step 2: Update DNS in Vercel

1. **Log into Vercel Dashboard**
2. Go to your project → **Settings** → **Domains**
3. Find `furorsportspk.com`
4. **Remove the domain** from Vercel (or just update DNS records)

### Step 3: Point Domain to Hostinger

You have two options:

#### Option A: Change Nameservers (Easiest)
1. In **Vercel** → **Domains** → `furorsportspk.com` → **DNS Settings**
2. Note the current nameservers (usually `ns1.vercel-dns.com`, etc.)
3. **OR** go to your domain registrar (if Vercel isn't the registrar)
4. Change nameservers to Hostinger's:
   - Get nameservers from **Hostinger hPanel** → **Domains** → **Nameservers**
   - Usually something like:
     ```
     ns1.dns-parking.com
     ns2.dns-parking.com
     ```
   - Or check what Hostinger shows in hPanel

#### Option B: Update DNS Records in Vercel (Keep DNS at Vercel)
1. In **Vercel** → **Domains** → `furorsportspk.com` → **DNS Settings**
2. **Add/Update A Record:**
   - Type: `A`
   - Name: `@` (or `furorsportspk.com`)
   - Value: Hostinger's IP address
     - Find this in **Hostinger hPanel** → **Websites** → **Your Site** → **Details**
     - Or use: `185.230.63.107` (check Hostinger for exact IP)
   - TTL: `3600`
3. **Remove any existing A/CNAME records** pointing to Vercel

### Step 4: Configure Domain in Hostinger

1. **In Hostinger hPanel:**
   - Go to **Websites** → **Your Frontend Site** → **Settings** → **Domain**
   - Click **"Add Domain"** or **"Change Domain"**
   - Enter: `furorsportspk.com`
   - Set it as primary domain
   - Save

### Step 5: Update Backend CORS

The backend code is already updated to accept `furorsportspk.com`. Make sure:
1. **Hostinger Backend** → **Settings** → **Environment Variables**:
   ```
   CLIENT_URL = https://furorsportspk.com
   ```
2. **Redeploy backend** after updating env var

### Step 6: Update Frontend API URL

1. **Hostinger Frontend** → **Settings** → **Environment Variables**:
   ```
   VITE_API_URL = https://slategray-ape-705284.hostingersite.com/api
   ```
   (Keep backend URL pointing to Hostinger backend)

### Step 7: Enable SSL in Hostinger

1. In **Hostinger hPanel** → **SSL** → **Free SSL**
2. Enable SSL for `furorsportspk.com`
3. Wait for certificate to be issued (automatic, usually 1-2 hours)

---

## Option 2: Keep Frontend on Vercel, Use Subdomain for Backend

This keeps your frontend on Vercel but uses a subdomain for the Hostinger backend.

### Step 1: Keep Frontend on Vercel

- No changes needed, keep `furorsportspk.com` pointing to Vercel

### Step 2: Add Subdomain for Backend

1. **In Vercel** → **Domains** → `furorsportspk.com` → **DNS Settings**
2. **Add CNAME Record:**
   - Type: `CNAME`
   - Name: `api` (for `api.furorsportspk.com`)
   - Value: `slategray-ape-705284.hostingersite.com`
   - TTL: `3600`

3. **In Hostinger hPanel:**
   - Go to **Websites** → **Your Backend Site** → **Settings** → **Domain**
   - Add domain: `api.furorsportspk.com`
   - Save

### Step 3: Update Backend CORS

1. **Hostinger Backend** → **Settings** → **Environment Variables**:
   ```
   CLIENT_URL = https://furorsportspk.com
   ```
   (Keep pointing to Vercel frontend)

2. **Redeploy backend**

### Step 4: Update Frontend to Use Subdomain

1. **Vercel Frontend** → **Settings** → **Environment Variables**:
   ```
   VITE_API_URL = https://api.furorsportspk.com/api
   ```

2. **Redeploy frontend** on Vercel

---

## Recommended: Option 1 (Everything on Hostinger)

**Pros:**
- Everything in one place (Hostinger)
- Simpler to manage
- Lower costs (no Vercel usage)
- Better integration with backend

**Cons:**
- Need to migrate frontend deployment

## Timeline

- **DNS Propagation**: 24-48 hours
- **SSL Certificate**: 1-2 hours after DNS is set
- **Total Setup Time**: ~2-3 hours (plus DNS propagation wait)

## Troubleshooting

**Domain not resolving to Hostinger?**
- Check DNS records in Vercel are updated
- Wait longer for DNS propagation (can take up to 48 hours)
- Use `nslookup furorsportspk.com` to check DNS
- Verify nameservers are pointing to Hostinger

**SSL not working?**
- Ensure DNS is pointing to Hostinger first
- Wait a few hours for SSL certificate to be issued
- Check SSL status in Hostinger hPanel → SSL

**Frontend can't reach backend?**
- Check `VITE_API_URL` is correct in frontend env vars
- Check `CLIENT_URL` is correct in backend env vars
- Verify CORS settings allow the frontend domain

---

## Quick Checklist (Option 1)

- [ ] Frontend built and deployed to Hostinger
- [ ] DNS updated in Vercel (A record or nameservers changed)
- [ ] Domain added in Hostinger hPanel
- [ ] Backend `CLIENT_URL` env var updated
- [ ] Frontend `VITE_API_URL` env var updated
- [ ] SSL enabled in Hostinger
- [ ] Wait 24-48 hours for DNS propagation
- [ ] Test `https://furorsportspk.com`

