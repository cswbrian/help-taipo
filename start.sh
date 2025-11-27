#!/bin/bash

# Start script for Disaster Help PWA

echo "🚀 Starting Disaster Help PWA development server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Check if public/data/locations.json exists
if [ ! -f "public/data/locations.json" ]; then
    echo "⚠️  Warning: public/data/locations.json not found"
    echo "   The app will work but may show an error until data is loaded"
    echo ""
fi

echo "✨ Starting Vite dev server..."
echo "   Open http://localhost:5173 in your browser"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev

