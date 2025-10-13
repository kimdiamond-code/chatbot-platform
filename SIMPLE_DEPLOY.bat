@echo off
echo ========================================
echo   SIMPLE DEPLOYMENT - STEP BY STEP
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Testing build locally...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo.
    echo Check the error messages above.
    echo Common issues:
    echo - Syntax error in JavaScript files
    echo - Missing dependencies
    echo - TypeScript/ESLint errors
    echo.
    echo Press any key to see the full error log...
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo Step 2: Verifying files...
git status

echo.
echo Step 3: Do you want to deploy to Vercel? (Y/N)
set /p CONFIRM="Continue with deployment? (Y/N): "

if /i "%CONFIRM%" NEQ "Y" (
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo Step 4: Deploying to Vercel...
call vercel --prod --yes

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo Your site: https://chatbot-platform-v2.vercel.app
    echo.
) else (
    echo.
    echo ========================================
    echo   ❌ VERCEL DEPLOYMENT FAILED
    echo ========================================
    echo.
    echo Try these alternatives:
    echo.
    echo Option 1: Deploy via Vercel Dashboard
    echo   1. Go to https://vercel.com/dashboard
    echo   2. Click your project
    echo   3. Click "Deployments" tab
    echo   4. Click "Redeploy" on latest deployment
    echo.
    echo Option 2: Push to GitHub (auto-deploy)
    echo   Run: GIT_PUSH_SECURE.bat
    echo   (Vercel will deploy automatically)
    echo.
)

pause
