#!/bin/bash

# Script to share your website with client using localtunnel
# Make sure your development server is running first!

echo "🚀 Setting up client sharing..."
echo ""
echo "Step 1: Make sure your development server is running:"
echo "   cd /home/taskeen/Desktop/ecommerce && npm run dev"
echo ""
echo "Step 2: Install localtunnel (if not already installed):"
echo "   npm install -g localtunnel"
echo "   OR (if permission denied):"
echo "   sudo npm install -g localtunnel"
echo ""
echo "Step 3: In a NEW terminal, run:"
echo "   lt --port 3000"
echo ""
echo "Step 4: Share the URL provided by localtunnel with your client"
echo ""
echo "Alternative: Use ngrok (more stable URLs):"
echo "   1. Download from https://ngrok.com/download"
echo "   2. Extract and run: ./ngrok http 3000"
echo ""
echo "For production deployment, see SHARE_WITH_CLIENT.md"

