@echo off
REM ===================================================================
REM Deploy Bot Instructions Save Test & Diagnostics
REM ===================================================================

echo.
echo ========================================
echo   Bot Save Test - Quick Deploy
echo ========================================
echo.

cd /d "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo [1/4] Adding changes to git...
git add -A

echo [2/4] Committing changes...
git commit -m "Add: Bot Builder save diagnostic test component"

echo [3/4] Pushing to GitHub...
git push origin main

echo [4/4] Deploying to Vercel...
call vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Go to https://chatbot-platform-v2.vercel.app
echo 2. Login as admin
echo 3. Navigate to "Save Test" in menu
echo 4. Open browser console (F12)
echo 5. Run the diagnostic tests
echo.
echo See DIAGNOSTIC_BOT_SAVE.md for details
echo.
pause
