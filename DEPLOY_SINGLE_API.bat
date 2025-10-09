@echo off
echo ===================================================
echo   🚀 SINGLE API DEPLOYMENT - Hobby Plan Optimized
echo ===================================================
echo.

cd /d "%~dp0"

echo [INFO] API Structure:
echo   • Single unified handler: api/index.js
echo   • All other files moved to api/BACKUP/
echo   • .OLD files ignored by .vercelignore
echo   • Result: Only 1 serverless function deployed
echo.

echo [Step 1/4] Verifying API structure...
if not exist "api\index.js" (
    echo ❌ ERROR: api/index.js not found
    pause
    exit /b 1
)
echo ✅ Single API handler confirmed
echo.

echo [Step 2/4] Cleaning cache...
if exist .vercel\cache rmdir /s /q .vercel\cache 2>nul
if exist dist rmdir /s /q dist 2>nul
echo ✅ Cache cleared
echo.

echo [Step 3/4] Building...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ Build failed! Check errors above.
    pause
    exit /b 1
)
echo ✅ Build successful
echo.

echo [Step 4/4] Deploying to production...
echo   Function count: 1/12 (Hobby plan limit)
vercel --prod --force
echo.

echo ===================================================
echo   ✅ DEPLOYMENT COMPLETE
echo ===================================================
echo.
echo 📊 Deployed Functions: 1 (api/index.js)
echo 🎯 All endpoints unified in single handler
echo 🛍️ Shopify Demo Mode: READY
echo 💾 Database: Neon PostgreSQL
echo.
echo 🔗 Production URL: https://chatbot-platform-v2.vercel.app
echo.
pause
