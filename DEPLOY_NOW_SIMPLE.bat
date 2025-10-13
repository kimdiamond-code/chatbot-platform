@echo off
echo ========================================
echo   DEPLOY CURRENT CODE TO VERCEL
echo ========================================
echo.
echo Your fixes are already in the code.
echo This will build and deploy what you have now.
echo.
pause

cd /d "%~dp0"

echo.
echo Step 1: Building...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo   ❌ BUILD FAILED
    echo ========================================
    echo.
    echo Please share the error message above.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo Step 2: Deploying to Vercel...
echo (This may take 2-3 minutes)
echo.

call vercel --prod --yes --force

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ DEPLOYED!
    echo ========================================
    echo.
    echo Your site: https://chatbot-platform-v2.vercel.app
    echo.
    echo Go test Live Chat:
    echo 1. Click "Live Chat" in menu
    echo 2. Conversations should load
    echo 3. Type message and click "Send"
    echo 4. Bot should respond
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ VERCEL DEPLOYMENT FAILED
    echo ========================================
    echo.
    echo Try this instead:
    echo.
    echo 1. Go to: https://vercel.com/dashboard
    echo 2. Find: chatbot-platform-v2
    echo 3. Click: Deployments tab
    echo 4. Click: "..." menu on latest deployment
    echo 5. Click: "Redeploy"
    echo.
    echo This will deploy your current code.
    echo.
)

pause
