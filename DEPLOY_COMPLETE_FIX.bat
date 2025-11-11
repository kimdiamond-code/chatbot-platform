@echo off
REM ===================================================================
REM COMPLETE BOT BUILDER FIX - ONE COMMAND DEPLOYMENT
REM Deploys all fixes and provides diagnostic test page
REM ===================================================================

echo.
echo ====================================================
echo   COMPLETE BOT BUILDER FIX DEPLOYMENT
echo ====================================================
echo.
echo This will:
echo 1. Deploy all bot builder fixes (save + load)
echo 2. Add diagnostic test page
echo 3. Provide test URL
echo.
echo AFTER DEPLOYMENT:
echo - Go to: https://your-site.vercel.app/bot-builder-test.html
echo - Run all 6 diagnostic tests
echo - Report which tests pass/fail
echo.

pause

echo.
echo [1/5] Checking git status...
git status

echo.
echo [2/5] Adding all changes...
git add .

echo.
echo [3/5] Committing fixes...
git commit -m "Fix: Complete bot builder save and load with diagnostic test"

echo.
echo [4/5] Pushing to GitHub...
git push origin main

echo.
echo [5/5] Deployment initiated!
echo.
echo ====================================================
echo   DEPLOYMENT IN PROGRESS
echo ====================================================
echo.
echo Vercel is building your changes (2-3 minutes)
echo.
echo CRITICAL: AFTER DEPLOYMENT COMPLETES
echo ====================================================
echo.
echo 1. Go to: https://chatbot-platform-v2.vercel.app/bot-builder-test.html
echo    (Replace with YOUR actual Vercel URL)
echo.
echo 2. Run ALL 6 diagnostic tests in order:
echo    - Test 1: API Connection
echo    - Test 2: Database Connection
echo    - Test 3: Load Config
echo    - Test 4: Save Config
echo    - Test 5: Verify Save
echo    - Test 6: Bot Response
echo.
echo 3. Check which tests PASS (green) vs FAIL (red)
echo.
echo 4. Copy the console logs from the page
echo.
echo 5. Report the results so we can fix specific issues
echo.
echo ====================================================
echo.
echo TROUBLESHOOTING:
echo.
echo If Test 1 or 2 fails:
echo   Problem: Database not connected
echo   Fix: Check Vercel environment variables
echo   - DATABASE_URL should be set
echo   - OPENAI_API_KEY should be set
echo.
echo If Test 4 fails:
echo   Problem: Save endpoint not working
echo   Fix: Check Vercel logs for errors
echo.
echo If Test 6 fails:
echo   Problem: Bot not loading config
echo   Fix: Check console for "Organization ID" logs
echo.
echo ====================================================
echo.
echo Deployment URL will be ready in 2-3 minutes
echo Check: https://vercel.com/dashboard
echo.

pause

echo.
echo Opening Vercel dashboard...
start https://vercel.com/dashboard

echo.
echo Once deployment is complete, test at:
echo https://your-site.vercel.app/bot-builder-test.html
echo.

pause
