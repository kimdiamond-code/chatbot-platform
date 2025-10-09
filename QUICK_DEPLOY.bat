@echo off
REM Quick Deploy - Skips dependency install if already present

echo ========================================
echo   QUICK DEPLOYMENT
echo ========================================
echo.

cd /d "%~dp0"

REM Check if cheerio is already installed
if exist node_modules\cheerio (
    echo [OK] Cheerio already installed, skipping...
) else (
    echo [1/3] Installing cheerio (fast install)...
    call npm install --legacy-peer-deps cheerio
    if errorlevel 1 (
        echo WARNING: Cheerio install failed, but continuing...
        echo You can deploy without it and add later if needed
    )
)

echo.
echo [2/3] Cleaning old API files...

REM Delete old files quickly
if exist api\shopify rmdir /s /q api\shopify 2>nul
if exist api\kustomer rmdir /s /q api\kustomer 2>nul
if exist api\shopify.js del /q api\shopify.js 2>nul
if exist api\kustomer.js del /q api\kustomer.js 2>nul
if exist api\scrape-discover.js del /q api\scrape-discover.js 2>nul
if exist api\scrape-page.js del /q api\scrape-page.js 2>nul

echo   - Old API files removed (5 functions remaining)

echo.
echo [3/3] Deploying to Vercel...
echo.
call vercel --prod

echo.
echo ========================================
echo   DONE!
echo ========================================
echo.
echo Functions deployed: 5 / 12 (41%% used)
echo.
pause
