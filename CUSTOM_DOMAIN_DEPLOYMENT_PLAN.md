# 🚀 Custom Domain Deployment Plan: furorsportpk.com

## 📋 Overview

This plan will help you deploy your ecommerce website to the custom domain **furorsportpk.com** using:
- **Frontend**: Vercel (with custom domain)
- **Backend**: Railway (can use subdomain or custom domain)

---

## 🎯 Deployment Architecture

```
furorsportpk.com (Frontend - Vercel)
    ↓
    ├── /api/* → api.furorsportpk.com (Backend - Railway)
    └── /* → React App
```

**OR** (Simpler option):

```
furorsportpk.com (Frontend - Vercel)
    ↓
    ├── /api/* → railway-backend-url.up.railway.app
    └── /* → React App
```

---

## 📝 Step-by-Step Plan

### **Phase 1: Domain Setup** (You need to do this)

#### Option A: If you already own furorsportpk.com
1. ✅ Domain is ready
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Access DNS settings

#### Option B: If you need to purchase the domain
1. **Buy domain** from:
   - GoDaddy.com (~$12-15/year)
   - Namecheap.com (~$10-12/year)
   - Google Domains (~$12/year)
2. **Recommended**: Namecheap (easy DNS management)
3. After purchase, access DNS settings

---

### **Phase 2: Deploy Backend to Railway** (I can help with this)

#### Current Status:
- ✅ Backend already deployed to Railway
- Current URL: `https://ecommerce-production-5eb5.up.railway.app`

#### What we need to do:
1. **Option A: Keep Railway subdomain** (Easier, Free)
   - Keep using: `https://ecommerce-production-5eb5.up.railway.app`
   - No additional cost
   - Works perfectly with custom domain

2. **Option B: Custom subdomain** (Professional, May cost)
   - Use: `api.furorsportpk.com`
   - Requires Railway Pro plan ($20/month) OR
   - Use Railway's free custom domain feature (if available)

**Recommendation**: **Option A** (Keep Railway subdomain) - It's free and works perfectly!

---

### **Phase 3: Deploy Frontend to Vercel with Custom Domain** (I can help with this)

#### Steps:
1. **Deploy to Vercel** (if not already done)
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

2. **Add Custom Domain in Vercel**:
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add: `furorsportpk.com`
   - Add: `www.furorsportpk.com` (optional, for www version)
   - Vercel will provide DNS records to add

3. **Update vercel.json**:
   - Update API rewrites to point to Railway backend
   - Configure for custom domain

4. **Update Environment Variables**:
   - `VITE_API_URL` = Railway backend URL
   - `CLIENT_URL` = `https://furorsportpk.com`

---

### **Phase 4: DNS Configuration** (You need to do this)

#### DNS Records to Add (in your domain registrar):

**For Vercel (Frontend):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**OR** (Vercel will provide exact records):
- Vercel will show you the exact DNS records after you add the domain
- Copy those records to your domain registrar

**For Railway Backend (if using custom subdomain):**
```
Type: CNAME
Name: api
Value: your-railway-url.up.railway.app
TTL: 3600
```

**Note**: If keeping Railway subdomain, no DNS needed for backend!

---

### **Phase 5: SSL & Security** (Automatic)

✅ **Vercel**: Automatically provides SSL certificate (free)
✅ **Railway**: Automatically provides SSL certificate (free)
✅ **HTTPS**: Will work automatically on both

---

### **Phase 6: Update Code Configuration** (I can do this)

#### Files to Update:
1. **client/vercel.json**:
   - Update API rewrites
   - Configure for custom domain

2. **server/index.js**:
   - Update CORS to allow custom domain
   - Update CLIENT_URL environment variable

3. **Environment Variables**:
   - Railway: Update `CLIENT_URL`
   - Vercel: Update `VITE_API_URL` (if needed)

4. **SEO & Meta Tags**:
   - Update all URLs to use `furorsportpk.com`
   - Update sitemap URLs
   - Update structured data URLs

---

### **Phase 7: Testing** (I can help)

1. ✅ Test frontend: `https://furorsportpk.com`
2. ✅ Test API: `https://furorsportpk.com/api/products`
3. ✅ Test admin panel: `https://furorsportpk.com/admin/login`
4. ✅ Test checkout flow
5. ✅ Test WhatsApp ordering
6. ✅ Verify SSL certificates
7. ✅ Test on mobile devices

---

## 💰 Cost Breakdown

### **Domain** (One-time/Annual):
- **furorsportpk.com**: ~$10-15/year
- **Total**: ~$10-15/year

### **Hosting** (Monthly):
- **Vercel (Frontend)**: **FREE** ✅
  - Custom domain: FREE
  - SSL: FREE
  - Unlimited bandwidth: FREE
  
- **Railway (Backend)**: **FREE** ✅ (up to $5/month credit)
  - Your usage: ~$2-3/month
  - Free credit: $5/month
  - **You pay: $0/month** ✅

### **Total Monthly Cost**: **$0** 🎉
### **Total Annual Cost**: **~$10-15** (just domain)

---

## ⏱️ Timeline

- **Domain Setup**: 5-10 minutes (if you own it) or 15-30 minutes (if purchasing)
- **Backend Configuration**: 5 minutes (I can do this)
- **Frontend Deployment**: 10 minutes (I can do this)
- **DNS Configuration**: 5-10 minutes (you need to do this)
- **SSL Propagation**: 5-60 minutes (automatic)
- **Testing**: 10 minutes (I can help)

**Total Time**: ~30-60 minutes

---

## ✅ What I Can Do For You

1. ✅ Update all code files for custom domain
2. ✅ Configure Vercel deployment
3. ✅ Update Railway environment variables
4. ✅ Update API configurations
5. ✅ Update SEO and meta tags
6. ✅ Test the deployment
7. ✅ Provide exact DNS records needed

## ❌ What You Need To Do

1. ❌ Purchase domain (if not owned) - ~$10-15/year
2. ❌ Add DNS records in your domain registrar
3. ❌ Add custom domain in Vercel dashboard (I'll guide you)
4. ❌ Wait for DNS propagation (5-60 minutes)

---

## 🎯 Recommended Approach

### **Option 1: Full Custom Domain** (Most Professional)
- Frontend: `furorsportpk.com`
- Backend: `api.furorsportpk.com` (requires Railway Pro or alternative)

### **Option 2: Hybrid** (Recommended - Free & Professional) ⭐
- Frontend: `furorsportpk.com` (Vercel - FREE)
- Backend: `ecommerce-production-5eb5.up.railway.app` (Railway - FREE)
- API calls: `furorsportpk.com/api/*` → proxies to Railway

**This is the BEST option because:**
- ✅ Professional domain for customers
- ✅ No additional costs
- ✅ Easy to set up
- ✅ Works perfectly

---

## 📋 Next Steps

**Tell me which option you prefer:**

1. **Option A**: Hybrid (furorsportpk.com frontend + Railway subdomain backend) - **RECOMMENDED** ⭐
2. **Option B**: Full custom domain (furorsportpk.com + api.furorsportpk.com)

**Then I will:**
1. Update all code files
2. Configure deployments
3. Give you exact DNS records
4. Guide you through domain setup
5. Test everything

---

## 🔒 Security & Best Practices

✅ HTTPS/SSL: Automatic (free)
✅ CORS: Configured for custom domain
✅ Environment Variables: Secured
✅ API Security: Protected routes
✅ Admin Panel: Password protected

---

## 📞 Support

If you get stuck at any step, I'm here to help! Just let me know:
- Which step you're on
- What error you're seeing
- Screenshots (if helpful)

---

**Ready to proceed?** Let me know:
1. Do you own `furorsportpk.com` already? (Yes/No)
2. Which option do you prefer? (Option A - Hybrid / Option B - Full Custom)
3. Should I proceed with updating the code? (Yes/No)



