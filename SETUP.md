# Quick Setup Guide

## Installation Steps

1. **Install Root Dependencies**
   ```bash
   npm install
   ```

2. **Install Client Dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

   Or use the convenience command:
   ```bash
   npm run install-all
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API server on `http://localhost:5000`
   - Frontend React app on `http://localhost:3000`

4. **Open in Browser**
   Navigate to: `http://localhost:3000`

## First Run

On first run, the database will be automatically created and seeded with sample products including:
- American Football Uniforms
- Basketball Uniforms
- Soccer Uniforms
- Martial Arts/Karate Uniforms
- Street Wears (Hoodies, T-Shirts, Polo Shirts, Track Suits)
- Fitness Wears (Compression Wear, Leggings, Sports Bras)

## Testing the Application

1. **Browse Products**: Navigate to Products page
2. **View Product Details**: Click on any product
3. **Add to Cart**: Add products to shopping cart
4. **Checkout**: Complete an order with your information
5. **Newsletter**: Subscribe to newsletter from home page
6. **Contact**: Send a message via contact form

## Troubleshooting

- **Port conflicts**: Change ports in `.env` (backend) and `client/vite.config.js` (frontend)
- **Database issues**: Delete `server/database/ecommerce.db` and restart
- **Module errors**: Run `npm install` in both root and client directories

## Production Build

```bash
npm run build
NODE_ENV=production npm start
```

