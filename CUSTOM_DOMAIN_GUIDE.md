# 🌐 How to Change Your Vercel URL

## Change Project Name (Get a Custom Vercel URL)

### Current URL:
`https://ecommerce-lac-one-35.vercel.app`

### Desired URL:
`https://furorsport.vercel.app` (or similar)

---

## Step-by-Step Guide

### Method 1: Add Custom Domain in Vercel (Recommended)

**Note:** Changing the project name doesn't automatically change the deployment URL. You need to add a domain.

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: **"furorsport"**

2. **Go to Domains**
   - Click **"Settings"** tab (top navigation)
   - Click **"Domains"** in the left sidebar
   - OR click the **"Domains"** button on the Overview page

3. **Add Domain**
   - Click **"Add Domain"** button
   - Enter: `furorsport.vercel.app` (or any name you want)
   - Click **"Add"**
   - Vercel will automatically assign this domain

4. **Wait for Assignment**
   - Vercel will assign: `https://furorsport-xxxxx.vercel.app`
   - Or you can use the project name: `https://furorsport.vercel.app`
   - This might take a few minutes

5. **Update Railway Environment Variable**
   - Go to Railway dashboard
   - Go to your project → **"Variables"** tab
   - Find `CLIENT_URL` variable
   - Update it to your new Vercel domain
   - Click **"Update"**
   - Railway will automatically redeploy

### Method 2: Use Project Name as Domain

**Important:** Vercel deployment URLs are unique and don't automatically change. However:

1. **Check Available Domains**
   - Go to Vercel → Settings → Domains
   - Vercel might show: `furorsport.vercel.app` as available
   - Click **"Add"** if available

2. **If Not Available**
   - The deployment URL stays: `ecommerce-lac-one-35.vercel.app`
   - But you can add a custom domain (see Method 3)
   - Or use the current URL (it works fine!)

---

## Method 2: Add Custom Domain (Your Own Domain)

If you have your own domain (like `furorsport.com`):

### Step 1: Get a Domain
- Buy from: Namecheap, GoDaddy, Google Domains, etc.
- Example: `furorsport.com`

### Step 2: Add Domain in Vercel
1. Go to Vercel → Your Project → **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain: `furorsport.com`
4. Click **"Add"**

### Step 3: Configure DNS
Vercel will show you DNS records to add:
- **Type:** `A` or `CNAME`
- **Name:** `@` (or `www`)
- **Value:** Vercel's IP address or CNAME

### Step 4: Update DNS at Your Domain Provider
1. Go to your domain provider's DNS settings
2. Add the DNS records Vercel provided
3. Wait 24-48 hours for DNS to propagate

### Step 5: Update Railway
- Update `CLIENT_URL` in Railway to your new domain
- Example: `https://furorsport.com`

---

## Quick URL Options

### Option 1: Simple Vercel URL
- Change project name to: `furorsport`
- New URL: `https://furorsport.vercel.app`
- **Cost:** FREE ✅

### Option 2: Custom Domain
- Buy domain: `furorsport.com` (~$10-15/year)
- Connect to Vercel
- New URL: `https://furorsport.com`
- **Cost:** Domain price only (~$10-15/year) ✅

### Option 3: Keep Current URL
- Keep: `https://ecommerce-lac-one-35.vercel.app`
- **Cost:** FREE ✅
- Works perfectly fine!

---

## Important Notes

1. **Old URL Still Works**
   - When you change the project name, the old URL redirects to the new one
   - No broken links!

2. **Update All References**
   - Update `CLIENT_URL` in Railway
   - Update any documentation
   - Update social media links
   - Update business cards/emails

3. **SSL Certificate**
   - Vercel automatically provides free SSL/HTTPS
   - Works with both `.vercel.app` and custom domains

---

## Recommended: Change to `furorsport`

**Steps:**
1. Vercel → Settings → General → Change Project Name to `furorsport`
2. Railway → Variables → Update `CLIENT_URL` to `https://furorsport.vercel.app`
3. Done! Your new URL: `https://furorsport.vercel.app`

**Time:** 2 minutes ⏱️

---

## Need Help?

If you get stuck:
- Vercel automatically handles redirects
- Old URL will still work
- Just update Railway's `CLIENT_URL` after changing

**Your website will work with any of these URLs!** 🎉

