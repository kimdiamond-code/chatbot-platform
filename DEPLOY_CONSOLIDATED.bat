@echo off
REM Complete API Consolidation & Deployment Script
REM Fixes Vercel Hobby plan serverless function limit

echo ========================================
echo   ChatBot Platform Deployment
echo   API Consolidation Fix
echo ========================================
echo.
echo This script will:
echo   1. Install cheerio dependency
echo   2. Clean old API files (14+ files ^> 5 files)
echo   3. Build the project
echo   4. Deploy to Vercel
echo.
pause

cd /d "%~dp0"

REM Step 1: Install dependencies
echo.
echo [1/4] Installing dependencies...
call npm install cheerio
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo   - Dependencies installed

REM Step 2: Clean old API files
echo.
echo [2/4] Cleaning old API files...

REM Delete old Shopify API files
if exist api\shopify\cart.js del /q api\shopify\cart.js
if exist api\shopify\customer.js del /q api\shopify\customer.js
if exist api\shopify\inventory.js del /q api\shopify\inventory.js
if exist api\shopify\orders.js del /q api\shopify\orders.js
if exist api\shopify\products.js del /q api\shopify\products.js
if exist api\shopify\verify.js del /q api\shopify\verify.js
if exist api\shopify\oauth\auth.js del /q api\shopify\oauth\auth.js
if exist api\shopify\oauth\token.js del /q api\shopify\oauth\token.js
if exist api\shopify\oauth rmdir /s /q api\shopify\oauth
if exist api\shopify rmdir /s /q api\shopify

REM Delete old Kustomer API files
if exist api\kustomer\connections.js del /q api\kustomer\connections.js
if exist api\kustomer\test-connection.js del /q api\kustomer\test-connection.js
if exist api\kustomer\oauth rmdir /s /q api\kustomer\oauth
if exist api\kustomer rmdir /s /q api\kustomer

REM Delete old standalone API files
if exist api\shopify.js del /q api\shopify.js
if exist api\kustomer.js del /q api\kustomer.js
if exist api\scrape-discover.js del /q api\scrape-discover.js
if exist api\scrape-page.js del /q api\scrape-page.js

echo   - Old API files removed
echo   - New API structure: 5 serverless functions (under 12 limit)

REM Step 3: Build project
echo.
echo [3/4] Building project...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo   - Build successful

REM Step 4: Deploy to Vercel
echo.
echo [4/4] Deploying to Vercel...
echo   Make sure you're logged in to Vercel CLI!
echo.
call vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo API Structure:
echo   1. /api/index.js (router)
echo   2. /api/database.js (database ops)
echo   3. /api/shopify-unified.js (Shopify)
echo   4. /api/integrations-unified.js (Kustomer, Klaviyo, Messenger)
echo   5. /api/scraping-unified.js (Web scraping)
echo.
echo Total Functions: 5 / 12 allowed (41%% used)
echo.
echo IMPORTANT: Verify Environment Variables in Vercel Dashboard:
echo   - DATABASE_URL (Neon PostgreSQL)
echo   - VITE_OPENAI_API_KEY
echo   - SHOPIFY_CLIENT_ID
echo   - SHOPIFY_CLIENT_SECRET
echo   - SHOPIFY_REDIRECT_URI
echo   - SHOPIFY_SCOPES
echo.
echo Next: Update frontend service files to use unified endpoints
echo See: API_CONSOLIDATION_GUIDE.md
echo.
pause
