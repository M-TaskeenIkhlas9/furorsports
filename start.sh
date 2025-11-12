#!/bin/bash
# Production Start Script

echo "🚀 Starting Toledo Exporters Ecommerce..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "Please create .env file with your configuration."
    exit 1
fi

# Check if build exists
if [ ! -d "client/dist" ]; then
    echo "📦 Building frontend first..."
    npm run build
fi

# Start server
echo "✅ Starting production server..."
NODE_ENV=production node server/index.js

