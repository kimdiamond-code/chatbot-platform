@echo off
echo ========================================
echo INSTALLING CROSS-FETCH POLYFILL
echo ========================================
echo.

echo Installing cross-fetch...
call npm install cross-fetch
if %errorlevel% neq 0 (
    echo ERROR: Failed to install cross-fetch
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Now rebuilding and deploying...
echo ========================================
echo.

echo Cleaning old build...
if exist dist (
    rmdir /s /q dist
)

echo Building...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo Deploying to Vercel...
call vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Test at: https://chatbot-platform-v2.vercel.app
echo.
pause
