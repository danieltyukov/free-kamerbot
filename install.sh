#!/bin/bash

echo "📦 Installing FreeKamerBot dependencies..."

# Avoid Puppeteer downloading Chromium during install (can be slow/hang in some environments)
export PUPPETEER_SKIP_DOWNLOAD=1
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
echo "⏭️  Skipping Chromium download for Puppeteer (will use system Chrome/Chromium)."

# Install root dependencies
echo "Installing server dependencies..."
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
cd ..

echo "✅ All dependencies installed!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your settings"
echo "2. Run ./start.sh (Linux/Mac) or start.bat (Windows) to launch the app"
