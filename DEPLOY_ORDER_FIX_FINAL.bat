@echo off
echo ========================================
echo DEPLOYING ORDER TRACKING IMPROVEMENTS
echo ========================================
echo.
echo Changes:
echo 1. Fixed TypeError (function name collision)
echo 2. Enhanced order status detection
echo 3. Added detailed Shopify API logging
echo 4. Improved no-orders-found response
echo.

cd /d "%~dp0"

echo [1/2] Committing changes...
git add -A
git commit -m "Fix: Order tracking with better logging and order number fallback"

echo.
echo [2/2] Deploying to Vercel...
vercel --prod --yes

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo After deployment, check the Vercel logs to see:
echo - Shopify API URL being called
echo - Number of orders returned
echo - Email address in first order
echo.
echo This will help diagnose why 0 orders are being found.
echo.
pause
