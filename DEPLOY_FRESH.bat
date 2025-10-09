@echo off
echo ===================================================
echo   🚀 FRESH DEPLOYMENT - Shopify Demo Mode Ready
echo ===================================================
echo.

cd /d "%~dp0"

echo [Step 1/3] Cleaning build cache...
if exist .vercel\cache rmdir /s /q .vercel\cache 2>nul
if exist dist rmdir /s /q dist 2>nul
if exist node_modules\.vite rmdir /s /q node_modules\.vite 2>nul
echo ✅ Cache cleared
echo.

echo [Step 2/3] Building fresh...
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ Build failed! Check errors above.
    pause
    exit /b 1
)
echo ✅ Build successful
echo.

echo [Step 3/3] Deploying to Vercel production...
vercel --prod --force
echo.

echo ===================================================
echo   ✅ DEPLOYMENT COMPLETE
echo ===================================================
echo.
echo 📝 Features included:
echo   • Shopify Demo Mode with 3 products
echo   • Product display in chat with add-to-cart
echo   • Analytics tracking for demo mode
echo   • Database working with Neon PostgreSQL
echo.
pause
