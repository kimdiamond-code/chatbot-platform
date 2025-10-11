@echo off
echo ========================================
echo   DEPLOYING DATABASE FIXES TO VERCEL
echo ========================================
echo.
echo Changes included:
echo - Fixed API endpoints for conversations/messages
echo - Added demo data for offline mode
echo - Improved error handling
echo.
pause

cd /d "%~dp0"
echo.
echo Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo Deploying to Vercel...
call vercel --prod
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your changes are now live at:
echo https://chatbot-platform-v2.vercel.app
echo.
echo Next steps:
echo 1. Test the dashboard - check if conversations load
echo 2. Go to Integrations and connect Shopify via OAuth
echo 3. Verify conversations are saving to database
echo.
pause
