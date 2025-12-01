@echo off
echo ========================================
echo  DEPLOYING FIXES TO GITHUB
echo ========================================
echo.

cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo [1/3] Staging files...
git add src/components/Integrations.jsx
git add src/components/ShopifyOAuthConfiguration.jsx
git add src/services/shopifyService.js

echo.
echo [2/3] Committing...
git commit -m "Fix: Auth loading states and Shopify config timing"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo  DONE - Vercel will auto-deploy
echo ========================================
echo.
echo Check: https://vercel.com/kims-projects-6e623030/chatbot-platform-v2
echo Wait 1-2 minutes for deployment to complete
echo.
pause
