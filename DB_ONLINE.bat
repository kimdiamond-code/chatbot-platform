@echo off
echo ========================================
echo  DEPLOYING TO VERCEL - Database Online
echo ========================================
echo.

echo [1/4] Stopping local dev server...
echo     Press Ctrl+C if running, or press Enter to continue
pause

echo.
echo [2/4] Building production version...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo [3/4] Deploying to Vercel...
call vercel --prod

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo  ✅ DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Database is now ONLINE at:
echo https://chatbot-platform-v2.vercel.app
echo.
echo API Endpoint:
echo https://chatbot-platform-v2.vercel.app/api/consolidated
echo.
echo ========================================
echo  NEXT STEPS
echo ========================================
echo.
echo 1. Open: https://chatbot-platform-v2.vercel.app
echo 2. Go to Proactive Engagement
echo 3. Yellow banner should be GONE
echo 4. Click "Browse Templates" - Activate one
echo 5. Should save to DATABASE (not localStorage)
echo.
pause
