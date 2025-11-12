#!/bin/bash
# Production Build Script

echo "🚀 Building Toledo Exporters Ecommerce for Production..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install
cd client && npm install && cd ..

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Check if build was successful
if [ -d "client/dist" ]; then
    echo "✅ Build successful!"
    echo "📁 Production files are in: client/dist/"
    echo ""
    echo "To start production server:"
    echo "  npm run start:prod"
    echo ""
    echo "Or using PM2:"
    echo "  pm2 start ecosystem.config.js --env production"
else
    echo "❌ Build failed! Check for errors above."
    exit 1
fi

