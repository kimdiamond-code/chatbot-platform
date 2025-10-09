@echo off
echo Cleaning up old API files...

rmdir /s /q "api\shopify" 2>nul
rmdir /s /q "api\kustomer" 2>nul

echo.
echo Done! Consolidated to 3 API functions.
echo - api/database.js
echo - api/shopify.js  
echo - api/kustomer.js
echo.
pause
