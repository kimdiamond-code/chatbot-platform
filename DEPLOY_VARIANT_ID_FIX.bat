@echo off
echo ========================================
echo  DEPLOYING VARIANT ID FIX
echo ========================================
echo.
echo Issue: Using product ID instead of variant ID
echo Fix: Now uses variantId from action data first
echo.
echo Deploying to production...
echo.

cd /d "%~dp0"
vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE
echo ========================================
echo.
echo Test: Click "Add to Cart" on products
echo Expected: Should work without "no longer available" error
echo.
pause
