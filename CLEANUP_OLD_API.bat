@echo off
REM API Cleanup Script - Removes old fragmented API files
REM Run this after consolidating to unified API handlers

echo ========================================
echo   API Consolidation Cleanup
echo ========================================
echo.
echo This will DELETE old API files that have been
echo consolidated into unified handlers:
echo   - database.js (KEPT)
echo   - shopify-unified.js (NEW)
echo   - integrations-unified.js (NEW)
echo   - scraping-unified.js (NEW)
echo   - index.js (NEW)
echo.
echo Old files will be DELETED:
echo   - api/shopify/ folder (all subfiles)
echo   - api/kustomer/ folder (all subfiles)
echo   - api/scrape-*.js files
echo   - api/shopify.js (old version)
echo   - api/kustomer.js (old version)
echo.
pause

cd /d "%~dp0"

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

echo.
echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo Remaining API files (5 total - under Vercel limit):
echo   1. api/index.js (router)
echo   2. api/database.js (database operations)
echo   3. api/shopify-unified.js (Shopify OAuth + Products + Cart)
echo   4. api/integrations-unified.js (Kustomer + Klaviyo + Messenger)
echo   5. api/scraping-unified.js (Web scraping + Site discovery)
echo.
echo Total Serverless Functions: 5 (well under 12 limit!)
echo.
pause
