@echo off
echo.
echo ================================================================
echo  🔧 RESTART DEV SERVER - Fix Vite Import Errors
echo ================================================================
echo.
echo Fixed potential issues:
echo   ✅ Cleaned up dynamicShopifyService.js (encoding issues)
echo   ✅ Simplified vite.config.js (removed problematic API middleware)
echo   ✅ Ready to restart with clean config
echo.
echo ================================================================
echo.
echo Stopping any existing dev server...
taskkill /F /IM node.exe 2>nul || echo No Node processes to kill
echo.
echo Clearing npm cache...
npm cache clean --force
echo.
echo Starting fresh dev server...
cd /d "%~dp0"
npm run dev
echo.
echo ================================================================
echo 📋 After server starts:
echo.
echo 1. Check console - syntax errors should be gone
echo 2. Go to Integrations tab
echo 3. Test Shopify configuration
echo.
echo If you still see errors, run the database fix first:
echo   - Double-click DIAGNOSE_AND_FIX.bat
echo   - Then restart the server again
echo ================================================================
echo.
pause