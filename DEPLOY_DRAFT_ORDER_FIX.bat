@echo off
echo ====================================
echo  DEPLOYING DRAFT ORDER FIX
echo ====================================
echo.
echo Changes:
echo - Enhanced variant ID extraction
echo - Better error handling
echo - Detailed logging
echo - Actionable error messages
echo.
echo Deploying to Vercel...
echo.

cd /d "%~dp0"
vercel --prod

echo.
echo ====================================
echo DEPLOYMENT COMPLETE
echo ====================================
echo.
echo Next steps:
echo 1. Test add-to-cart in demo mode
echo 2. Test with real Shopify (if connected)
echo 3. Check console for detailed logs
echo 4. If you see permission errors, reconnect Shopify
echo.
pause
