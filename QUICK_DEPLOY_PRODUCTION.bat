@echo off
echo ============================================
echo ChatBot Platform - Quick Deploy
echo ============================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and fill in your credentials
    echo.
    pause
    exit /b 1
)

echo [1/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/5] Building production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [3/5] Checking Vercel CLI...
where vercel >nul 2>nul
if errorlevel 1 (
    echo Vercel CLI not found. Installing...
    call npm install -g vercel
)

echo.
echo [4/5] Logging into Vercel...
call vercel login

echo.
echo [5/5] Deploying to production...
call vercel --prod

echo.
echo ============================================
echo Deployment Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Run SQL scripts in your Neon database
echo 3. Test your deployment
echo.
pause
