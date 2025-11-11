@echo off
REM ===================================================================
REM DEPLOY BOT BUILDER SAVE FIX
REM Fixes double-stringification issue preventing saves
REM ===================================================================

echo.
echo ========================================
echo   BOT BUILDER SAVE FIX DEPLOYMENT
echo ========================================
echo.
echo This fixes the Bot Builder save issue:
echo - Fixed double-stringification of JSON data
echo - Added fallback_message support
echo - Added debug logging
echo - Bot Builder configurations will now save properly!
echo.

pause

echo.
echo [1/4] Checking current status...
git status

echo.
echo [2/4] Adding changes...
git add api/consolidated.js
git add BOT_BUILDER_SAVE_FIX.md
git add DEPLOY_SAVE_FIX.bat

echo.
echo [3/4] Committing fix...
git commit -m "Fix: Bot Builder save - Resolve double-stringification issue"

echo.
echo [4/4] Pushing to GitHub (triggers Vercel deploy)...
git push origin main

echo.
echo ========================================
echo   DEPLOYMENT INITIATED
echo ========================================
echo.
echo Vercel is building and deploying your fix.
echo This usually takes 2-3 minutes.
echo.
echo AFTER DEPLOYMENT:
echo.
echo 1. Open Bot Builder
echo 2. Make a change (e.g., change bot name)
echo 3. Click Save
echo 4. Watch for "Saved!" confirmation
echo 5. Refresh page - changes should persist!
echo.
echo Check deployment: https://vercel.com/dashboard
echo.
echo TESTING:
echo - Open browser console (F12)
echo - Look for: "💾 Saving bot config..."
echo - Look for: "✅ Bot config created/updated"
echo - No errors should appear
echo.

pause
