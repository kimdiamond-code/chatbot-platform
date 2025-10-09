#!/bin/bash

# Kustomer OAuth Integration Setup Script
# This script helps set up the multi-user Kustomer OAuth integration

echo "🔐 Kustomer OAuth Integration Setup"
echo "===================================="
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
        print_error ".env.template not found. Please create .env file manually."
        exit 1
    fi
fi

echo ""
print_info "Checking Kustomer OAuth integration requirements..."

# Check for required OAuth environment variables
OAUTH_CONFIGURED=true

if ! grep -q "VITE_KUSTOMER_CLIENT_ID=" .env || grep -q "VITE_KUSTOMER_CLIENT_ID=your-kustomer-oauth-client-id" .env; then
    print_warning "VITE_KUSTOMER_CLIENT_ID not configured in .env"
    OAUTH_CONFIGURED=false
fi

if ! grep -q "KUSTOMER_CLIENT_SECRET=" .env || grep -q "KUSTOMER_CLIENT_SECRET=your-kustomer-oauth-client-secret" .env; then
    print_warning "KUSTOMER_CLIENT_SECRET not configured in .env"
    OAUTH_CONFIGURED=false
fi

if ! grep -q "VITE_APP_URL=" .env || grep -q "VITE_APP_URL=https://your-domain.com" .env; then
    print_warning "VITE_APP_URL not configured in .env"
    OAUTH_CONFIGURED=false
fi

if [ "$OAUTH_CONFIGURED" = true ]; then
    print_status "Kustomer OAuth environment variables are configured"
else
    echo ""
    print_warning "Kustomer OAuth integration is not fully configured"
    echo ""
    echo "To configure Kustomer OAuth integration:"
    echo "1. Create an OAuth app in your Kustomer admin panel:"
    echo "   - Go to Settings → Security → OAuth Applications"
    echo "   - Create new OAuth application"
    echo "   - Set redirect URI to: \$VITE_APP_URL/auth/kustomer/callback"
    echo "   - Grant required scopes: customers:*, conversations:*, messages:*, notes:*"
    echo "2. Copy the Client ID and Client Secret"
    echo "3. Update the values in your .env file"
    echo "4. Set your app's production URL in VITE_APP_URL"
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

# Check for OAuth integration files
echo ""
print_info "Checking Kustomer OAuth integration files..."

REQUIRED_FILES=(
    "src/services/integrations/kustomerOAuthService.js"
    "src/components/integrations/KustomerOAuthIntegration.jsx"
    "src/pages/KustomerOAuthCallback.jsx"
    "src/Router.jsx"
    "api/kustomer/oauth/token.js"
    "api/kustomer/oauth/refresh.js"
    "api/kustomer/test-connection.js"
    "api/kustomer/connections.js"
    "database_kustomer_oauth_schema.sql"
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
    print_error "Some Kustomer OAuth integration files are missing"
    echo "Please ensure all integration files are present before proceeding"
    exit 1
fi

# Check database schema
echo ""
print_info "Checking database requirements..."

if [ -f "database_kustomer_oauth_schema.sql" ]; then
    print_status "Database schema file found"
    echo ""
    print_warning "⚠️  DATABASE SETUP REQUIRED:"
    echo "You need to run the database migration to set up OAuth tables:"
    echo ""
    echo "For Supabase:"
    echo "1. Go to your Supabase dashboard"
    echo "2. Navigate to SQL Editor"
    echo "3. Copy and paste the contents of database_kustomer_oauth_schema.sql"
    echo "4. Run the query to create the required tables"
    echo ""
    echo "For other databases:"
    echo "psql -d your_database -f database_kustomer_oauth_schema.sql"
    echo ""
else
    print_error "Database schema file not found"
fi

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
    echo "- Import/export errors in OAuth files"
    echo "- Missing dependencies"
    exit 1
fi

# Final status report
echo ""
echo "===================================="
echo "🎯 OAuth Integration Setup Complete!"
echo "===================================="
echo ""

if [ "$OAUTH_CONFIGURED" = true ]; then
    print_status "Kustomer OAuth integration is ready to use"
    echo ""
    echo "Next steps:"
    echo "1. Deploy your database schema (see instructions above)"
    echo "2. Start the development server: npm run dev"
    echo "3. Go to Integrations page in your app"
    echo "4. Test the OAuth connection flow"
    echo "5. Deploy to production: npm run deploy"
else
    print_warning "Kustomer OAuth integration needs configuration"
    echo ""
    echo "Next steps:"
    echo "1. Create Kustomer OAuth app (see instructions above)"
    echo "2. Configure OAuth credentials in .env file"
    echo "3. Run this script again: ./setup-kustomer-oauth.sh"
    echo "4. Deploy database schema"
    echo "5. Test the integration in your app"
fi

echo ""
echo "📚 Documentation:"
echo "- OAuth setup guide: KUSTOMER_OAUTH_SETUP_GUIDE.md"
echo "- Environment variables: .env"
echo "- Database schema: database_kustomer_oauth_schema.sql"
echo ""

echo "🔐 OAuth Benefits:"
echo "- Secure per-user authentication"
echo "- No shared API keys"
echo "- Multi-tenant support"
echo "- Automatic token refresh"
echo "- Enterprise-grade security"
echo ""

print_status "Setup script completed!"
echo ""
