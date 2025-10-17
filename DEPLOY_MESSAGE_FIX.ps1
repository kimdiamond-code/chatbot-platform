# PowerShell Deployment Script - Fixed
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "DEPLOYING MESSAGE CREATION FIX" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Changes Applied:" -ForegroundColor Green
Write-Host "- Fixed create_message API with validation"
Write-Host "- Fixed customer profile with non-blocking logging"
Write-Host "- Enhanced error messages for debugging"
Write-Host ""
Write-Host "Multi-Tenant Status: PRESERVED" -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan

# Change to script directory
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "[1/4] Checking Git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "[2/4] Adding changes..." -ForegroundColor Yellow
git add api/consolidated.js
git add src/services/customer/customerProfileService.js
git add MULTI_TENANT_FIX_SUMMARY.md
git add DEPLOY_NOW.md
git add README_FIX_DEPLOYED.md
git add .env.example
git add DEPLOY_MESSAGE_FIX.ps1

Write-Host ""
Write-Host "[3/4] Committing..." -ForegroundColor Yellow
git commit -m "fix: Resolve 500 errors in message and customer operations

- Add comprehensive validation in create_message endpoint
- Check conversation exists before creating messages
- Fix conversation creation to include organization_id
- Enhance upsertCustomer with try-catch error handling
- Make privacy logging non-blocking to prevent failures
- Return detailed error messages for debugging

Multi-tenant architecture fully preserved.
No hardcoded store names or values.
Each user connects their own Shopify store."

Write-Host ""
Write-Host "[4/4] Pushing to Vercel..." -ForegroundColor Yellow
git push

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Wait for Vercel deployment (check dashboard)"
Write-Host "2. Test Live Chat - privacy logging 500 should be gone"
Write-Host "3. Test Order Tracking with REAL customer emails"
Write-Host "4. Verify no 500 errors in console"
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "- MULTI_TENANT_FIX_SUMMARY.md - Technical details"
Write-Host "- DEPLOY_NOW.md - Quick reference"
Write-Host ""
Write-Host "Monitor: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
