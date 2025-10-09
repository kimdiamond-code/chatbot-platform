@echo off
echo ===================================================
echo   🚀 FIXED API DEPLOYMENT - 2 Functions Only
echo ===================================================
echo.

cd /d "%~dp0"

echo [INFO] API Structure:
echo   • /api/index.js - Status endpoint
echo   • /api/database.js - Database operations  
echo   • Result: 2/12 serverless functions
echo.

echo [Step 1/3] Cleaning cache...
if exist .vercel\cache rmdir /s /q .vercel\cache 2>nul
if exist dist rmdir /s /q dist 2>nul
echo ✅ Cache cleared
echo.

echo [Step 2/3] Building...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed!
    pause
    exit /b 1
)
echo ✅ Build successful
echo.

echo [Step 3/3] Deploying...
vercel --prod --force
echo.

echo ===================================================
echo   ✅ DEPLOYMENT COMPLETE
echo ===================================================
echo.
echo 📊 Functions: 2/12 (17%% used)
echo 🔗 https://chatbot-platform-v2.vercel.app
echo.
echo 🧪 Test: Go to Live Chat and click Test Demo
echo.
pause
