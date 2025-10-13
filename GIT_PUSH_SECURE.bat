@echo off
echo ========================================
echo   GIT PUSH - SANITIZED SECRETS + FIXES
echo ========================================
echo.
echo Step 1: Removing exposed API keys from docs
echo Step 2: Pushing database fixes
echo Step 3: Vercel auto-deploy
echo.
pause

cd /d "%~dp0"

echo.
echo [1/3] Adding sanitized documentation files...
git add DEPLOYMENT_STATUS.md
git add VERCEL_ENV_CHECKLIST.md

echo.
echo [2/3] Adding database fix files...
git add src/services/databaseService.js
git add api/consolidated.js
git add FIXES_APPLIED_README.md

echo.
echo Creating commit...
git commit -m "Security: Remove exposed API keys from docs + Fix: Database API endpoints"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Commit failed! 
    echo.
    echo This might mean:
    echo - No changes to commit (already committed?)
    echo - Git credentials issue
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Pushing to GitHub...
git push origin main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Push failed!
    echo.
    echo Possible issues:
    echo - Check network connection
    echo - Verify git credentials
    echo - Repository permissions
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✅ SUCCESS! PUSHED TO GITHUB
echo ========================================
echo.
echo Changes pushed:
echo  ✅ Removed API keys from documentation
echo  ✅ Fixed database API endpoints
echo  ✅ Added demo data fallback
echo  ✅ Improved error handling
echo.
echo Vercel is now deploying...
echo.
echo Monitor at:
echo https://vercel.com/kims-projects-6e623030/chatbot-platform-v2
echo.
echo Your site will update in ~2 minutes at:
echo https://chatbot-platform-v2.vercel.app
echo.
pause
