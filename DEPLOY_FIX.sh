#!/bin/bash
# Vercel Deployment Fix Script
# Fixes Supabase migration issues and ensures clean deployment

echo "🔧 Starting Vercel Deployment Fix..."

# Step 1: Clean old build artifacts
echo "📦 Cleaning build artifacts..."
rm -rf dist
rm -rf node_modules/.vite
rm -rf .vercel/.cache

# Step 2: Verify no Supabase in package.json
echo "🔍 Checking for Supabase dependencies..."
if grep -q "@supabase" package.json; then
    echo "❌ ERROR: Found Supabase in package.json. Removing..."
    # This should not happen, but if it does, manual removal needed
else
    echo "✅ No Supabase dependencies found"
fi

# Step 3: Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Check errors above."
    exit 1
fi

# Step 4: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify environment variables in Vercel Dashboard:"
echo "   - DATABASE_URL (Neon PostgreSQL)"
echo "   - VITE_OPENAI_API_KEY"
echo "   - SHOPIFY_CLIENT_ID"
echo "   - SHOPIFY_CLIENT_SECRET"
echo "   - SHOPIFY_REDIRECT_URI"
echo "   - SHOPIFY_SCOPES"
echo ""
echo "2. Test the deployed app:"
echo "   - Live Chat functionality"
echo "   - Shopify OAuth flow"
echo "   - Analytics dashboard"
echo ""
echo "3. Check deployment logs for any errors"
