# Image Storage Solution - Cloud Storage Setup

## Problem
Uploaded images are stored in the server filesystem (`server/public/images/products`), which gets wiped on every redeployment.

## Solution Options

### Option 1: Cloudinary (Recommended - Free Tier Available)
- Free tier: 25GB storage, 25GB bandwidth/month
- Easy setup, automatic image optimization
- CDN included

### Option 2: AWS S3
- Pay-as-you-go pricing
- Highly scalable
- Requires AWS account setup

### Option 3: Hostinger Persistent Storage (If Available)
- Check Hostinger File Manager for persistent directories
- May require contacting Hostinger support

## Recommended: Cloudinary Setup

1. **Sign up**: https://cloudinary.com/users/register/free
2. **Get credentials** from Cloudinary Dashboard
3. **Add to Hostinger Environment Variables**:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

4. **Install package**: `npm install cloudinary multer-storage-cloudinary`

The code will be updated to automatically use Cloudinary if credentials are available, otherwise fall back to local storage (for development).

