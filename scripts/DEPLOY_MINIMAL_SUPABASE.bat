@echo off
echo ========================================
echo FINAL SUPABASE FIX - MINIMAL CONFIG
echo ========================================
echo.

echo [1/5] Cleaning everything...
if exist node_modules\@supabase (
    echo Removing Supabase cache...
    rmdir /s /q node_modules\@supabase
)
if exist dist (
    rmdir /s /q dist
)
if exist .vite (
    rmdir /s /q .vite
)
echo.

echo [2/5] Reinstalling dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo.

echo [3/5] Building with minimal config...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo [4/5] Deploying to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo IMPORTANT: The OAuth flow should work even if dashboard shows demo mode!
echo.
echo TEST OAUTH NOW:
echo 1. Go to: https://chatbot-platform-v2.vercel.app
echo 2. Navigate to: Integrations -^> Shopify
echo 3. Click "OAuth (Best)" tab
echo 4. Enter your store name: truecitrus2
echo 5. Click "Connect with OAuth"
echo.
echo The OAuth backend runs independently and should work!
echo.
pause
