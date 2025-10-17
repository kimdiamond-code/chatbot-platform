@echo off
echo =====================================================
echo DEPLOYING MESSAGE CREATION FIX
echo =====================================================
echo.
echo ✅ Changes:
echo - Fixed create_message API with validation
echo - Fixed create_conversation with organization_id
echo - Fixed customer profile with non-blocking logging
echo - Enhanced error messages for debugging
echo.
echo 🔒 Multi-Tenant Status: PRESERVED
echo - No hardcoded values
echo - Each user connects their own store
echo - Full data isolation maintained
echo.
echo =====================================================

cd /d "%~dp0"

echo.
echo [1/4] Checking Git status...
git status

echo.
echo [2/4] Adding changes...
git add api/consolidated.js
git add src/services/customer/customerProfileService.js
git add MULTI_TENANT_FIX_SUMMARY.md
git add DEPLOY_NOW.md

echo.
echo [3/4] Committing...
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

echo.
echo [4/4] Pushing to Vercel...
git push

echo.
echo =====================================================
echo ✅ DEPLOYMENT COMPLETE!
echo.
echo 📨 Next Steps:
echo 1. Wait for Vercel deployment (check dashboard)
echo 2. Test Live Chat - send messages
echo 3. Test Order Tracking with REAL customer emails
echo 4. Verify no 500 errors in console
echo.
echo 📝 Documentation:
echo - MULTI_TENANT_FIX_SUMMARY.md - Technical details
echo - DEPLOY_NOW.md - Quick reference
echo.
echo Monitor: https://vercel.com/dashboard
echo =====================================================
pause
