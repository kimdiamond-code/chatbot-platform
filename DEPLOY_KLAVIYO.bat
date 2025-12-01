@echo off
echo ========================================
echo  DEPLOYING KLAVIYO INTEGRATION
echo ========================================
echo.

cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo [1/3] Staging files...
git add src/components/Integrations.jsx

echo.
echo [2/3] Committing...
git commit -m "Add Klaviyo email marketing integration modal"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo  DEPLOYED - Klaviyo Integration Added
echo ========================================
echo.
echo What was added:
echo - Klaviyo configuration modal
echo - Email marketing integration UI
echo - API key management
echo - List management
echo.
echo After deployment (1-2 min), hard refresh: Ctrl+Shift+R
echo Then click on the Klaviyo card to configure!
echo.
pause
