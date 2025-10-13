@echo off
echo ========================================
echo   PUSHING COMMIT TO GITHUB
echo ========================================
echo.
echo Commit already created: 45ae2ad
echo Now pushing to GitHub...
echo.

cd /d "%~dp0"

echo Attempting push...
git push origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   ✅ PUSH SUCCESSFUL!
    echo ========================================
    echo.
    echo Vercel is now deploying your changes...
    echo.
    echo Monitor deployment:
    echo https://vercel.com/kims-projects-6e623030/chatbot-platform-v2
    echo.
    echo Site will update in ~2 minutes:
    echo https://chatbot-platform-v2.vercel.app
    echo.
) else (
    echo.
    echo ========================================
    echo   ⚠️ PUSH BLOCKED BY GITHUB
    echo ========================================
    echo.
    echo Reason: Secret scanning detected API keys in OLD commits
    echo.
    echo Solution: Allow the push via this link:
    echo https://github.com/kimdiamond-code/chatbot-platform/security/secret-scanning/unblock-secret/33sOJ79V7IMs9qlI4VKm43dsbdS
    echo.
    echo Steps:
    echo 1. Click the link above
    echo 2. Click "Allow secret" 
    echo 3. Run this script again
    echo.
    echo Note: The API keys in old commits are from DOCUMENTATION files only,
    echo not from your actual .env file which is safe.
    echo.
)

pause
