# Adding Home Page Category Images

## Location
Add your three category images to:
```
client/public/images/home/
```

## Required Files
1. **fitness-wear.jpg** - Fitness wear image (teal/mint green activewear)
2. **sports-wear.jpg** - Sports wear image (basketball player)
3. **street-wear.jpg** - Street wear image (dark grey tracksuit)

## How It Works

### Development
- Images in `client/public/` are automatically served by Vite at the root path
- Accessible at: `http://localhost:3000/images/home/fitness-wear.jpg`

### Production Build
- When you run `npm run build`, Vite copies everything from `client/public/` to `client/dist/`
- Images will be in `client/dist/images/home/` after build
- These are included in your deployment automatically

### Deployment (Vercel/Railway)
- The `dist` folder (including all images) is deployed
- Images are accessible at: `https://yourdomain.com/images/home/fitness-wear.jpg`
- No additional configuration needed!

## Image Requirements
- **Format**: JPG, JPEG, or PNG
- **Recommended Size**: 1920x1200px or larger
- **Aspect Ratio**: Landscape (wider than tall)
- **File Size**: Keep under 2MB for fast loading

## Steps to Add Images

1. **Copy your images** to the folder:
   ```bash
   cp /path/to/your/fitness-wear.jpg client/public/images/home/
   cp /path/to/your/sports-wear.jpg client/public/images/home/
   cp /path/to/your/street-wear.jpg client/public/images/home/
   ```

2. **Verify the files exist**:
   ```bash
   ls -la client/public/images/home/
   ```

3. **Test locally**:
   - Restart your dev server if running
   - Visit `http://localhost:3000`
   - Check the "Core Values" section

4. **Deploy**:
   - Images will automatically be included in the build
   - No additional steps needed!

## Fallback Images
If the images are not found, the CSS will use fallback images from Unsplash. Once you add your images, they will automatically replace the fallbacks.

## Troubleshooting

### Images not showing locally?
- Make sure files are in `client/public/images/home/` (not `client/src/`)
- Check file names match exactly: `fitness-wear.jpg`, `sports-wear.jpg`, `street-wear.jpg`
- Restart the dev server: `npm run dev`

### Images not showing in production?
- Make sure you ran `npm run build` before deploying
- Check that files are in `client/dist/images/home/` after build
- Verify the file paths in browser DevTools Network tab



