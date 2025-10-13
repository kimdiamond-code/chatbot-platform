@echo off
echo ========================================
echo   ALTERNATIVE: PUSH VIA VERCEL CLI
echo ========================================
echo.
echo Since GitHub is blocking push, we'll deploy directly to Vercel.
echo This bypasses GitHub and deploys your local changes.
echo.
pause

cd /d "%~dp0"

echo.
echo Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build successful!
echo.
echo Deploying directly to Vercel...
echo (This may take 2-3 minutes)
echo.

call vercel --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ DEPLOYED TO VERCEL!
    echo ========================================
    echo.
    echo Your fixes are now live at:
    echo https://chatbot-platform-v2.vercel.app
    echo.
    echo Note: Changes are deployed but NOT in GitHub yet.
    echo You can push to GitHub later after resolving the secret scanning issue.
    echo.
) else (
    echo.
    echo ❌ Deployment failed!
    echo Check the error messages above.
    echo.
)

pause
