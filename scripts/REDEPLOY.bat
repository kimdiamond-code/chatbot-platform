@echo off
echo ========================================
echo QUICK REDEPLOY - ERROR FIX
echo ========================================
echo.

echo Cleaning build...
if exist dist rmdir /s /q dist

echo Building...
call npm run build

echo Deploying...
call vercel --prod --yes

echo.
echo ========================================
echo DONE! Check: https://chatbot-platform-v2.vercel.app
echo ========================================
pause
