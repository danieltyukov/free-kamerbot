#!/bin/bash

echo "🚀 Starting FreeKamerBot..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your credentials."
fi

# Create data directory
mkdir -p data

# Start the application
echo "🎉 Launching FreeKamerBot..."
echo "📊 Dashboard will open at: http://localhost:3000"
echo "🔧 API server at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm start
