#!/bin/bash

# Kustomer Integration Setup Script
# This script helps set up the Kustomer integration for production deployment

echo "🎧 Kustomer Integration Setup"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f .env.template ]; then
        cp .env.template .env
        print_status ".env file created from template"
    else
        print_error ".env.template not found. Creating basic .env file..."
        cat > .env << EOF
# Basic Environment Variables
NODE_ENV=production
VITE_APP_NAME=ChatBot Platform

# OpenAI Configuration (Required)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Kustomer Integration (Optional)
KUSTOMER_API_KEY=your_kustomer_api_key_here
KUSTOMER_ORGANIZATION_ID=your_kustomer_org_id_here
KUSTOMER_SUBDOMAIN=your_kustomer_subdomain_here
KUSTOMER_DEFAULT_TEAM_ID=your_default_team_id_here
KUSTOMER_ENABLE_SYNC=true
KUSTOMER_DEBUG=false

# Other Integrations (Optional)
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_secret_here
KLAVIYO_API_KEY=your_klaviyo_api_key_here
WHATSAPP_TOKEN=your_whatsapp_token_here
FACEBOOK_ACCESS_TOKEN=your_facebook_token_here
SLACK_BOT_TOKEN=your_slack_bot_token_here
ZAPIER_WEBHOOK_URL=your_zapier_webhook_url_here
EOF
        print_status "Basic .env file created"
    fi
fi

echo ""
print_info "Checking Kustomer integration requirements..."

# Check for required Kustomer environment variables
KUSTOMER_CONFIGURED=true

if ! grep -q "KUSTOMER_API_KEY=" .env || grep -q "KUSTOMER_API_KEY=your_kustomer_api_key_here" .env; then
    print_warning "KUSTOMER_API_KEY not configured in .env"
    KUSTOMER_CONFIGURED=false
fi

if ! grep -q "KUSTOMER_ORGANIZATION_ID=" .env || grep -q "KUSTOMER_ORGANIZATION_ID=your_kustomer_org_id_here" .env; then
    print_warning "KUSTOMER_ORGANIZATION_ID not configured in .env"
    KUSTOMER_CONFIGURED=false
fi

if ! grep -q "KUSTOMER_SUBDOMAIN=" .env || grep -q "KUSTOMER_SUBDOMAIN=your_kustomer_subdomain_here" .env; then
    print_warning "KUSTOMER_SUBDOMAIN not configured in .env"
    KUSTOMER_CONFIGURED=false
fi

if [ "$KUSTOMER_CONFIGURED" = true ]; then
    print_status "Kustomer environment variables are configured"
else
    echo ""
    print_warning "Kustomer integration is not fully configured"
    echo ""
    echo "To configure Kustomer integration:"
    echo "1. Get your API key from Kustomer Settings → API Keys"
    echo "2. Find your Organization ID in Settings → Organization"
    echo "3. Your subdomain is the part before .kustomerapp.com in your URL"
    echo "4. Update the values in your .env file"
    echo ""
fi

# Check for Node modules
echo ""
print_info "Checking dependencies..."

if [ ! -d "node_modules" ]; then
    print_warning "Node modules not found. Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        print_status "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
else
    print_status "Dependencies are installed"
fi

# Check for Kustomer service files
echo ""
print_info "Checking Kustomer integration files..."

REQUIRED_FILES=(
    "src/services/integrations/kustomerService.js"
    "src/services/integrations/realKustomerService.js"
    "src/components/integrations/KustomerIntegration.jsx"
)

ALL_FILES_EXIST=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "$file exists"
    else
        print_error "$file is missing"
        ALL_FILES_EXIST=false
    fi
done

if [ "$ALL_FILES_EXIST" = false ]; then
    print_error "Some Kustomer integration files are missing"
    echo "Please ensure all integration files are present before proceeding"
    exit 1
fi

# Create a quick test script
echo ""
print_info "Creating Kustomer test script..."

cat > test-kustomer.js << 'EOF'
// Quick test script for Kustomer integration
import { realKustomerService } from './src/services/integrations/realKustomerService.js';

async function testKustomerIntegration() {
    console.log('🧪 Testing Kustomer Integration...');
    
    try {
        // Load config from localStorage (simulating browser environment)
        const mockConfig = {
            apiKey: process.env.KUSTOMER_API_KEY,
            organizationId: process.env.KUSTOMER_ORGANIZATION_ID,
            subdomain: process.env.KUSTOMER_SUBDOMAIN,
            status: 'connected'
        };
        
        if (!mockConfig.apiKey || mockConfig.apiKey === 'your_kustomer_api_key_here') {
            console.log('❌ KUSTOMER_API_KEY not configured');
            return;
        }
        
        if (!mockConfig.organizationId || mockConfig.organizationId === 'your_kustomer_org_id_here') {
            console.log('❌ KUSTOMER_ORGANIZATION_ID not configured');
            return;
        }
        
        if (!mockConfig.subdomain || mockConfig.subdomain === 'your_kustomer_subdomain_here') {
            console.log('❌ KUSTOMER_SUBDOMAIN not configured');
            return;
        }
        
        // Simulate localStorage for testing
        global.localStorage = {
            getItem: () => JSON.stringify(mockConfig),
            setItem: () => {},
        };
        
        // Test connection
        const service = Object.create(realKustomerService);
        service.config = mockConfig;
        service.initializeConfig();
        
        if (service.isConnected()) {
            console.log('✅ Kustomer service configuration is valid');
            console.log(`   Base URL: https://${mockConfig.subdomain}.api.kustomerapp.com/v1`);
            console.log(`   Organization: ${mockConfig.organizationId}`);
            console.log('   API Key: Configured ✓');
        } else {
            console.log('❌ Kustomer service configuration is invalid');
        }
        
    } catch (error) {
        console.log('❌ Error testing Kustomer integration:', error.message);
    }
}

testKustomerIntegration();
EOF

print_status "Test script created (test-kustomer.js)"

# Build the project
echo ""
print_info "Building the project..."

npm run build
if [ $? -eq 0 ]; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    echo ""
    echo "Common build issues:"
    echo "- Missing environment variables"
    echo "- Import/export errors in Kustomer files"
    echo "- Missing dependencies"
    exit 1
fi

# Final status report
echo ""
echo "================================="
echo "🎯 Setup Complete!"
echo "================================="
echo ""

if [ "$KUSTOMER_CONFIGURED" = true ]; then
    print_status "Kustomer integration is ready to use"
    echo ""
    echo "Next steps:"
    echo "1. Start the development server: npm run dev"
    echo "2. Go to Integrations page in your app"
    echo "3. Configure Kustomer integration with your credentials"
    echo "4. Test the connection"
    echo "5. Deploy to production: npm run deploy"
else
    print_warning "Kustomer integration needs configuration"
    echo ""
    echo "Next steps:"
    echo "1. Configure Kustomer credentials in .env file"
    echo "2. Run this script again: ./setup-kustomer.sh"
    echo "3. Start the development server: npm run dev"
    echo "4. Test the integration in your app"
fi

echo ""
echo "📚 Documentation:"
echo "- Integration guide: KUSTOMER_INTEGRATION_GUIDE.md"
echo "- Environment variables: .env"
echo "- Test script: test-kustomer.js"
echo ""

# Cleanup
rm -f test-kustomer.js

print_status "Setup script completed!"
echo ""
