@echo off
echo ========================================
echo   DEPLOYING SHOPIFY CALLBACK FIX
echo ========================================
echo.
echo Installing Vercel CLI if needed...
call npm install -g vercel
echo.
echo Deploying to production...
call vercel --prod
echo.
echo ========================================
echo   DEPLOYMENT COMPLETE
echo ========================================
echo.
echo Now test the Shopify OAuth connection!
echo.
pause
