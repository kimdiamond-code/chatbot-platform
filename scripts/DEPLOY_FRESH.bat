@echo off
echo ========================================
echo TRUE CITRUS CHATBOT - FRESH DEPLOYMENT
echo ========================================
echo.

echo [1/4] Cleaning old build files...
if exist dist rmdir /s /q dist
if exist .vercel\.output rmdir /s /q .vercel\.output
echo Done!
echo.

echo [2/4] Building fresh production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo [3/4] Deploying to Vercel (Production)...
call vercel --prod --yes
if errorlevel 1 (
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)
echo Done!
echo.

echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your updated platform is now live at:
echo https://chatbot-platform-v2.vercel.app
echo.
echo To verify:
echo 1. Visit the URL above
echo 2. Open browser console (F12)
echo 3. Look for: "True Citrus ChatBot Platform Loaded - v2.0"
echo.
pause
