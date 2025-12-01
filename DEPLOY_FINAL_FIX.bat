@echo off
echo ========================================
echo  FINAL FIX - Auth Import Paths
echo ========================================
echo.

cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo [1/3] Staging files...
git add src/components/Integrations.jsx
git add src/components/ShopifyOAuthConfiguration.jsx  
git add src/services/shopifyService.js

echo.
echo [2/3] Committing...
git commit -m "Fix: Use correct useAuth.jsx import to get loading state"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo  DEPLOYED - Wait 1-2 minutes
echo ========================================
echo.
echo The issue was: Components were importing from useAuth.js
echo which re-exported from AuthContext that had undefined loading.
echo.
echo Fixed: Now importing from useAuth.jsx directly like App.jsx does.
echo.
echo After deployment completes, hard refresh: Ctrl+Shift+R
echo.
pause
