@echo off
echo ========================================
echo   GIT COMMIT & PUSH - DATABASE FIXES
echo ========================================
echo.
echo This will:
echo 1. Add all modified files to git
echo 2. Commit with message
echo 3. Push to GitHub (main branch)
echo 4. Vercel will auto-deploy from GitHub
echo.
pause

cd /d "%~dp0"

echo.
echo Checking git status...
git status

echo.
echo Adding files to git...
git add src/services/databaseService.js
git add api/consolidated.js
git add DEPLOY_FIXES.bat
git add FIXES_APPLIED_README.md

echo.
echo Committing changes...
git commit -m "Fix: Database API endpoints - GET requests for conversations/messages, add demo data fallback"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Commit failed! Check if there are changes to commit.
    pause
    exit /b 1
)

echo.
echo Pushing to GitHub (main branch)...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Push failed! Check your git credentials and network.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ PUSHED TO GITHUB!
echo ========================================
echo.
echo Vercel will now automatically deploy from GitHub.
echo.
echo Monitor deployment at:
echo https://vercel.com/kims-projects-6e623030/chatbot-platform-v2
echo.
echo Or check here in ~2 minutes:
echo https://chatbot-platform-v2.vercel.app
echo.
pause
