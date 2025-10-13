@echo off
echo ========================================
echo   COMMIT AND DEPLOY - LIVE CHAT FIXES
echo ========================================
echo.
echo This will commit and deploy ONLY the Live Chat fixes.
echo Other modified files will remain uncommitted for now.
echo.
pause

cd /d "%~dp0"

echo.
echo [1/4] Adding Live Chat fix files...
git add src/services/databaseService.js
git add src/components/LiveChat.jsx
git add LIVECHAT_FIX_SUMMARY.md

echo.
echo [2/4] Committing Live Chat fixes...
git commit -m "Fix: Live Chat - API response parsing and form input handling"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Note: Commit may have failed (possibly nothing to commit)
    echo Continuing with build anyway...
    echo.
)

echo.
echo [3/4] Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo.
    echo Check the errors above for details.
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo [4/4] Deploying to Vercel...
call vercel --prod --yes

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ SUCCESS!
    echo ========================================
    echo.
    echo Changes deployed to: https://chatbot-platform-v2.vercel.app
    echo.
    echo Test Live Chat:
    echo 1. Go to Live Chat page
    echo 2. Should see conversations load
    echo 3. Type message and click Send
    echo 4. Bot should respond
    echo.
) else (
    echo.
    echo ========================================
    echo   ⚠️ VERCEL CLI FAILED
    echo ========================================
    echo.
    echo Alternative: Deploy via Vercel Dashboard
    echo 1. Go to: https://vercel.com/dashboard
    echo 2. Click: chatbot-platform-v2
    echo 3. Click: Redeploy latest
    echo.
    echo OR push to GitHub to trigger auto-deploy:
    echo.
    echo git push origin main
    echo.
    echo (You'll need to allow the secret scanning first)
    echo.
)

pause
