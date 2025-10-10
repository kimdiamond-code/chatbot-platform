@echo off
echo ========================================
echo   DEPLOY SHOPIFY OAUTH FIX
echo ========================================
echo.
echo This will deploy the Shopify OAuth redirect URI fix
echo.
pause

echo.
echo [1/3] Adding changes to git...
git add .

echo.
echo [2/3] Committing changes...
git commit -m "Fix: Update Shopify OAuth redirect URI to main route"

echo.
echo [3/3] Pushing to GitHub (will trigger Vercel deployment)...
git push

echo.
echo ========================================
echo   DEPLOYMENT INITIATED
echo ========================================
echo.
echo Your changes are being deployed to Vercel!
echo.
echo IMPORTANT - Complete these steps:
echo.
echo 1. Update Vercel Environment Variables:
echo    - Go to: https://vercel.com/dashboard
echo    - Project: chatbot-platform-v2
echo    - Settings → Environment Variables
echo    - Update SHOPIFY_REDIRECT_URI to:
echo      https://chatbot-platform-v2.vercel.app/
echo.
echo 2. Update Shopify Partner Dashboard:
echo    - Go to: https://partners.shopify.com/
echo    - Apps → Your App → App setup
echo    - Update Allowed redirection URL to:
echo      https://chatbot-platform-v2.vercel.app/
echo.
echo See SHOPIFY_OAUTH_FIX.md for detailed instructions
echo.
pause
