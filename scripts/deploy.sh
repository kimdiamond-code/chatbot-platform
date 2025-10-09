#!/bin/bash

# ChatBot Platform Deployment Script
echo "🤖 ChatBot Platform Deployment"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Build the project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi
echo "✅ Build completed successfully"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy based on argument
if [ "$1" = "staging" ]; then
    echo "🚀 Deploying to staging..."
    vercel
elif [ "$1" = "production" ] || [ "$1" = "prod" ]; then
    echo "🚀 Deploying to production..."
    vercel --prod
else
    echo "🚀 Deploying to preview..."
    vercel
fi

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎉 Your ChatBot Platform is now live!"
    echo ""
    echo "Next steps:"
    echo "1. Open the deployment URL"
    echo "2. Navigate to 'Bot Builder' to configure your chatbot"
    echo "3. Test your bot using the test chat feature"
    echo "4. Deploy the widget to your website"
else
    echo "❌ Deployment failed"
    exit 1
fi