#!/bin/bash

# NEV Daily Deployment Script
# Helper script to deploy the latest reports to Cloudflare Pages

echo "🚀 Starting deployment process..."

# Ensure we are in the project root
cd "$(dirname "$0")"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if wrangler is installed locally
if [ ! -f "./node_modules/.bin/wrangler" ]; then
    echo "📦 Wrangler not found locally. Installing dependencies..."
    npm install
fi

# Run the deployment
echo "📤 Deploying to Cloudflare Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌍 Live URL: https://nev-daily-news.pages.dev"
else
    echo "❌ Deployment failed."
    exit 1
fi
