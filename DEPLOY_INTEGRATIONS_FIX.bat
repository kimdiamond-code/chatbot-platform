@echo off
REM Quick Deploy Script - Fix Integrations Issues
echo.
echo ================================================
echo  DEPLOYING INTEGRATIONS FIX
echo ================================================
echo.

cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo [1/3] Adding files to git...
git add src/components/Integrations.jsx
git add FIXES_APPLIED.md

echo.
echo [2/3] Committing changes...
git commit -m "Fix integrations blank screen - move useEffect before returns"

echo.
echo [3/3] Deploying to Vercel...
vercel --prod

echo.
echo ================================================
echo  DEPLOYMENT COMPLETE
echo ================================================
echo.
echo Changes deployed:
echo - Fixed ReferenceError in Integrations component
echo - Moved currentUser useEffect before early returns
echo.
echo Check: https://chatbot-platform-v2.vercel.app/
echo.
pause
