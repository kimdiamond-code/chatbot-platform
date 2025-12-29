# OAuth Multi-Tenant Fix - Deployment Script
# Run this from the chatbot-platform directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OAuth Multi-Tenant Fix Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the chatbot-platform directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Correct directory confirmed" -ForegroundColor Green
Write-Host ""

# Step 2: Remind about database migration
Write-Host "[WARNING] CRITICAL REMINDER:" -ForegroundColor Yellow
Write-Host "Have you run the database migration in Neon?" -ForegroundColor Yellow
Write-Host "File: sql/oauth_schema_migration.sql" -ForegroundColor Yellow
Write-Host ""
$response = Read-Host "Type 'yes' to confirm you've run the migration"

if ($response -ne "yes") {
    Write-Host ""
    Write-Host "[CANCELLED] DEPLOYMENT CANCELLED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please complete these steps first:" -ForegroundColor Yellow
    Write-Host "1. Go to https://console.neon.tech" -ForegroundColor White
    Write-Host "2. Select your database: agentstack_ai_chatbot" -ForegroundColor White
    Write-Host "3. Open SQL Editor" -ForegroundColor White
    Write-Host "4. Copy contents of sql/oauth_schema_migration.sql" -ForegroundColor White
    Write-Host "5. Execute the script" -ForegroundColor White
    Write-Host "6. Verify success message" -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "[OK] Database migration confirmed" -ForegroundColor Green
Write-Host ""

# Step 3: Check if changes exist
Write-Host "[INFO] Checking for changes..." -ForegroundColor Cyan
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host "[OK] Changes detected:" -ForegroundColor Green
    Write-Host $gitStatus
    Write-Host ""
} else {
    Write-Host "[INFO] No changes detected" -ForegroundColor Yellow
    Write-Host "This is expected if you already committed the changes" -ForegroundColor White
    Write-Host ""
}

# Step 4: Show what will be deployed
Write-Host "[INFO] Files that were updated:" -ForegroundColor Cyan
Write-Host "  - src/components/ShopifyOAuthConfiguration.jsx (OAuth fix)" -ForegroundColor White
Write-Host "  - sql/oauth_schema_migration.sql (database migration)" -ForegroundColor White
Write-Host ""

# Step 5: Confirm deployment
Write-Host "[CONFIRM] Ready to deploy to Vercel production?" -ForegroundColor Yellow
$deploy = Read-Host "Type 'deploy' to proceed"

if ($deploy -ne "deploy") {
    Write-Host ""
    Write-Host "[CANCELLED] Deployment cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying to Vercel Production..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 6: Deploy
try {
    vercel --prod
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "[SUCCESS] Deployment Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "[NEXT] Testing Steps:" -ForegroundColor Cyan
    Write-Host "1. Visit: https://chatbot-platform-v2.vercel.app/dashboard/integrations" -ForegroundColor White
    Write-Host "2. Click on Shopify integration" -ForegroundColor White
    Write-Host "3. Click 'Connect with OAuth'" -ForegroundColor White
    Write-Host "4. Enter your store domain (e.g., 'truecitrus2')" -ForegroundColor White
    Write-Host "5. Click 'Connect with OAuth' button" -ForegroundColor White
    Write-Host "6. Authorize on Shopify" -ForegroundColor White
    Write-Host "7. Verify you're redirected back with success message" -ForegroundColor White
    Write-Host ""
    
    Write-Host "[DATABASE] Verify in Database:" -ForegroundColor Cyan
    Write-Host "SELECT organization_id, provider, status, account_identifier" -ForegroundColor White
    Write-Host "FROM integrations WHERE provider = 'shopify';" -ForegroundColor White
    Write-Host ""
    
    Write-Host "[DOCS] For detailed testing checklist, see:" -ForegroundColor Cyan
    Write-Host "  - OAUTH_FIX_DEPLOYMENT_GUIDE.md" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "[ERROR] Deployment failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "[HELP] Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're logged in to Vercel: vercel login" -ForegroundColor White
    Write-Host "2. Check your internet connection" -ForegroundColor White
    Write-Host "3. Try running: vercel --prod (manually)" -ForegroundColor White
    exit 1
}
