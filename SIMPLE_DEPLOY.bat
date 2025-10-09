@echo off
echo Cleaning old API files...

cd /d "%~dp0"

if exist api\shopify rmdir /s /q api\shopify
if exist api\kustomer rmdir /s /q api\kustomer
if exist api\shopify.js del /q api\shopify.js
if exist api\kustomer.js del /q api\kustomer.js
if exist api\scrape-discover.js del /q api\scrape-discover.js
if exist api\scrape-page.js del /q api\scrape-page.js

echo Old API files removed
echo.
echo Deploying to Vercel...
echo.

vercel --prod

echo.
echo Deployment complete!
pause
