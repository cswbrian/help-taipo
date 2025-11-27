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

# Check if public/data/locations.json exists or is older than 10 minutes
if [ ! -f "public/data/locations.json" ] || [ $(find public/data/locations.json -mmin +10 2>/dev/null | wc -l) -eq 1 ]; then
    echo "📥 Fetching latest data from Google Sheets..."
    curl -L "https://docs.google.com/spreadsheets/d/1W8A40TCVAY5prHNyVk-TqdSv2EumkVvN9l7LoUrY8-w/export?format=csv&gid=0" -o sheet.csv 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Data fetched successfully"
        echo "🔄 Parsing CSV and generating JSON..."
        node scripts/parse-sheet.js
        if [ $? -eq 0 ]; then
            echo "✅ JSON generated successfully"
        else
            echo "⚠️  Warning: Failed to parse CSV"
        fi
        rm -f sheet.csv
    else
        echo "⚠️  Warning: Failed to fetch data from Google Sheets"
        if [ ! -f "public/data/locations.json" ]; then
            echo "   No existing data file found. The app may show an error."
        else
            echo "   Using existing data file."
        fi
    fi
    echo ""
fi

echo "✨ Starting Vite dev server..."
echo "   Open http://localhost:5173 in your browser"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev
