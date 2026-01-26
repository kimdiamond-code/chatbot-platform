@echo off
echo ============================================================================
echo PRODUCTION DEPLOYMENT - AgenStack.ai
echo ============================================================================
echo.
echo This script will deploy the production-ready chatbot platform to Vercel.
echo.
pause

REM Change to project directory
cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo.
echo Step 1: Checking Git status...
git status

echo.
echo Step 2: Running production cleanup...
powershell -ExecutionPolicy Bypass -File PRODUCTION_CLEANUP_COMPLETE.ps1

echo.
echo Step 3: Adding changes to Git...
git add .

echo.
echo Step 4: Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Production deployment - cleaned and optimized

git commit -m "%commit_msg%"

echo.
echo Step 5: Pushing to GitHub...
git push origin main

echo.
echo Step 6: Deploying to Vercel...
vercel --prod

echo.
echo ============================================================================
echo DEPLOYMENT COMPLETE!
echo ============================================================================
echo.
echo Next steps:
echo 1. Visit your production URL
echo 2. Test critical user paths
echo 3. Monitor error logs
echo 4. Check analytics
echo.
echo Production URL: https://chatbot-platform-v2.vercel.app
echo.
pause
