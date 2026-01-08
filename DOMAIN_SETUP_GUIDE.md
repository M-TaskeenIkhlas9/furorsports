# Domain Setup Guide: furorsportspk.com

## Step 1: Add Domain in Hostinger

1. **Log into Hostinger hPanel**
2. Go to **Domains** → **Manage**
3. Click **"Add Domain"** or **"Connect Domain"**
4. Enter your domain: `furorsportspk.com`
5. Follow the prompts to connect it

## Step 2: Configure DNS Records

### Option A: Use Hostinger Nameservers (Recommended)

1. Go to your domain registrar (where you bought the domain - Vercel, Namecheap, etc.)
2. Find **DNS Settings** or **Nameservers**
3. Change nameservers to Hostinger's:
   ```
   ns1.dns-parking.com
   ns2.dns-parking.com
   ```
   (Or the nameservers Hostinger provides in hPanel → Domains)

### Option B: Keep Your Current DNS Provider

If you want to keep your current DNS provider, add these DNS records:

**For Frontend (Main Website):**
- Type: **A Record**
- Name: `@` (or `furorsportspk.com`)
- Value: `185.230.63.107` (or Hostinger's IP - check in Hostinger hPanel)
- TTL: `3600`

**For Backend API (if on subdomain):**
- Type: **A Record**
- Name: `api` (for api.furorsportspk.com)
- Value: `185.230.63.107` (same IP or check Hostinger)
- TTL: `3600`

**OR Use CNAME (if Hostinger provides a hostname):**
- Type: **CNAME**
- Name: `@`
- Value: `aliceblue-rook-541622.hostingersite.com` (your current Hostinger URL)

## Step 3: Point Domain to Your Deployment

1. In Hostinger hPanel, go to **Websites** → **Your Frontend Site**
2. Click **"Settings"** or **"Domain"**
3. Click **"Change Domain"** or **"Add Domain"**
4. Select `furorsportspk.com` as the primary domain
5. Save changes

**For Backend (if separate deployment):**
1. Go to **Websites** → **Your Backend Site**
2. Click **"Settings"** → **"Domain"**
3. Add `api.furorsportspk.com` (or your preferred subdomain)

## Step 4: Update Environment Variables

### Backend Environment Variables (Hostinger)
1. Go to **Deployments** → **Your Backend** → **Settings** → **Environment Variables**
2. Update or add:
   ```
   CLIENT_URL = https://furorsportspk.com
   ```
3. Click **Save** and **Redeploy**

### Frontend Environment Variables (Hostinger)
1. Go to **Deployments** → **Your Frontend** → **Settings** → **Environment Variables**
2. Update or add:
   ```
   VITE_API_URL = https://slategray-ape-705284.hostingersite.com/api
   ```
   (Keep backend URL as is, or update if backend has its own domain)

## Step 5: Update Code (Hardcoded URLs)

After DNS propagates (can take 24-48 hours), we'll update the hardcoded URL in the code.

## Step 6: Enable SSL Certificate

1. In Hostinger hPanel, go to **SSL** → **Free SSL**
2. Enable SSL for `furorsportspk.com`
3. Wait for SSL certificate to be issued (usually automatic with Let's Encrypt)

## Step 7: Verify Domain is Working

1. Wait 24-48 hours for DNS to propagate
2. Check: `https://furorsportspk.com`
3. Test: `https://furorsportspk.com/api/health`

## Important Notes

- **DNS Propagation**: Can take 24-48 hours to fully propagate
- **SSL Certificate**: Usually issued automatically within a few hours
- **Keep Current URLs Working**: Your current Hostinger URLs will continue to work even after adding custom domain
- **Environment Variables**: Hostinger might not pass env vars, so we have hardcoded fallbacks in code

## Troubleshooting

**Domain not resolving?**
- Check DNS records are correct
- Use `nslookup furorsportspk.com` to verify DNS
- Wait longer for DNS propagation

**SSL not working?**
- Ensure DNS is pointing to Hostinger
- Wait a few hours for SSL certificate to be issued
- Check SSL status in Hostinger hPanel

**CORS errors?**
- Update `CLIENT_URL` environment variable
- Update hardcoded `HOSTINGER_CLIENT_URL` in code
- Redeploy backend

