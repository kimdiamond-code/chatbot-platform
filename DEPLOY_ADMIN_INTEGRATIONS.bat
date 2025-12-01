@echo off
echo ========================================
echo  ADMIN PANEL - INTEGRATIONS SETUP
echo ========================================
echo.

cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo [1/3] Staging files...
git add src/components/AdminPanel.jsx

echo.
echo [2/3] Committing...
git commit -m "Add Integrations section to Admin Panel for org-level config"

echo.
echo [3/3] Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo  ARCHITECTURE CHANGE DEPLOYED
echo ========================================
echo.
echo NEW WORKFLOW:
echo.
echo 1. ADMINS configure integrations in Admin Panel
echo    - Navigate to Admin Panel
echo    - Click "Integrations" 
echo    - Configure Shopify, Klaviyo, Kustomer for the org
echo.
echo 2. AGENTS just use the integrations
echo    - No configuration needed
echo    - Authenticate via OAuth when needed
echo.
echo After deployment (1-2 min), hard refresh: Ctrl+Shift+R
echo Then navigate to Admin Panel to see the new Integrations section!
echo.
pause
