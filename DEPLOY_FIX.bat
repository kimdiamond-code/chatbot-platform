@echo off
REM Vercel Deployment Fix Script (Windows)
REM Fixes Supabase migration issues and ensures clean deployment

echo ========================================
echo   Vercel Deployment Fix
echo ========================================
echo.

REM Step 1: Clean old build artifacts
echo [1/4] Cleaning build artifacts...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vercel\.cache rmdir /s /q .vercel\.cache
echo   - Cleaned dist, .vite cache, and .vercel cache
echo.

REM Step 2: Verify environment
echo [2/4] Checking environment setup...
if not exist .env (
    echo   WARNING: .env file not found
    echo   Copy .env.example to .env and fill in values
    pause
    exit /b 1
)
echo   - Environment file exists
echo.

REM Step 3: Build the project
echo [3/4] Building project...
call npm run build
if errorlevel 1 (
    echo.
    echo   ERROR: Build failed
    echo   Check the error messages above
    pause
    exit /b 1
)
echo   - Build successful
echo.

REM Step 4: Deploy to Vercel
echo [4/4] Deploying to Vercel...
echo   Note: Make sure you're logged in to Vercel CLI
call vercel --prod
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo NEXT STEPS:
echo.
echo 1. Verify Vercel Environment Variables:
echo    Go to: https://vercel.com/dashboard
echo    Project Settings ^> Environment Variables
echo.
echo    Required variables:
echo    - DATABASE_URL (Neon PostgreSQL)
echo    - VITE_OPENAI_API_KEY
echo    - SHOPIFY_CLIENT_ID
echo    - SHOPIFY_CLIENT_SECRET
echo    - SHOPIFY_REDIRECT_URI
echo    - SHOPIFY_SCOPES
echo.
echo 2. Test deployed app features:
echo    - Live Chat (tests DB + OpenAI)
echo    - Shopify OAuth flow
echo    - Analytics dashboard
echo.
echo 3. Check Vercel deployment logs for errors
echo.
pause
