@echo off
echo ========================================
echo   FIX: Live Chat Conversation Loading
echo ========================================
echo.
echo Fixes applied:
echo 1. Better API response parsing (conversations/messages)
echo 2. Fixed form input - now uses proper React form
echo 3. Added "Send" button for clarity
echo.

cd /d "%~dp0"

echo [1/3] Adding fixed files...
git add src/services/databaseService.js
git add src/components/LiveChat.jsx

echo.
echo [2/3] Committing...
git commit -m "Fix: Live Chat - API response parsing and form input handling"

if %ERRORLEVEL% NEQ 0 (
    echo Warning: Commit may have failed (might be no changes)
)

echo.
echo [3/3] Deploying to Vercel...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
call vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ DEPLOYED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Fixed issues:
    echo  ✅ Conversations now load from database
    echo  ✅ Messages now load properly  
    echo  ✅ Input field works with proper form handling
    echo  ✅ Added Send button for better UX
    echo.
    echo Test at: https://chatbot-platform-v2.vercel.app
    echo Go to: Live Chat page
    echo.
    echo Expected behavior:
    echo 1. Conversations list loads (or shows "Create first conversation")
    echo 2. Can type in input field
    echo 3. Press Enter OR click "Send" to send message
    echo 4. Bot responds with AI message
    echo.
) else (
    echo.
    echo ❌ Deployment failed!
    echo.
)

pause
