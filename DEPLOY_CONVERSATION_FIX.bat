@echo off
echo ========================================
echo   QUICK FIX: Conversation Loading Issue
echo ========================================
echo.
echo Fix: Better API response parsing
echo Issue: Conversations not loading in Live Chat
echo.

cd /d "%~dp0"

echo.
echo [1/2] Committing fix...
git add src/services/databaseService.js
git commit -m "Fix: Better API response parsing for conversations and messages"

if %ERRORLEVEL% NEQ 0 (
    echo No changes to commit or commit failed
)

echo.
echo [2/2] Deploying directly to Vercel...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
call vercel --prod

echo.
echo ========================================
echo   ✅ DEPLOYED!
echo ========================================
echo.
echo Changes will be live in ~2 minutes
echo Test at: https://chatbot-platform-v2.vercel.app
echo.
pause
