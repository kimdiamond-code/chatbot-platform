@echo off
echo ============================================
echo   COMPLETE PRODUCTION DEPLOYMENT
echo   Chatbot Platform v2.0
echo ============================================
echo.

REM Stop on error
setlocal enabledelayedexpansion

REM Check Node version
echo [Step 1/8] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js first.
    pause
    exit /b 1
)
echo ✓ Node.js found

echo.
echo [Step 2/8] Checking environment variables...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please copy .env.example to .env and configure:
    echo   - DATABASE_URL (your Neon PostgreSQL connection string)
    echo   - VITE_OPENAI_API_KEY (your OpenAI API key)
    pause
    exit /b 1
)
echo ✓ .env file found

REM Check if DATABASE_URL is configured
findstr /C:"DATABASE_URL=postgresql://" .env >nul 2>&1
if errorlevel 1 (
    echo WARNING: DATABASE_URL may not be configured properly
    echo Make sure you've added your Neon database connection string
    pause
)

echo.
echo [Step 3/8] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [Step 4/8] Running verification...
call npm run verify
if errorlevel 1 (
    echo WARNING: Verification found issues
    echo You can continue but deployment may fail
    pause
)

echo.
echo [Step 5/8] Building production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    echo Check the error messages above
    pause
    exit /b 1
)
echo ✓ Build successful

echo.
echo [Step 6/8] Checking Vercel CLI...
where vercel >nul 2>&1
if errorlevel 1 (
    echo Vercel CLI not found. Installing globally...
    call npm install -g vercel
    if errorlevel 1 (
        echo ERROR: Failed to install Vercel CLI
        pause
        exit /b 1
    )
)
echo ✓ Vercel CLI ready

echo.
echo [Step 7/8] Deploying to Vercel...
echo.
echo IMPORTANT: Make sure you've set these environment variables in Vercel:
echo   1. DATABASE_URL (from your Neon dashboard)
echo   2. VITE_OPENAI_API_KEY (from OpenAI)
echo   3. SHOPIFY_CLIENT_ID (if using Shopify)
echo   4. SHOPIFY_CLIENT_SECRET (if using Shopify)
echo.
echo Press any key to continue with deployment...
pause >nul

call vercel --prod --yes
if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)
echo ✓ Deployed successfully

echo.
echo [Step 8/8] Post-Deployment Checklist...
echo.
echo ============================================
echo   DEPLOYMENT COMPLETE!
echo ============================================
echo.
echo ✓ Code deployed to production
echo.
echo NEXT STEPS:
echo.
echo 1. DATABASE SETUP (if not done):
echo    - Go to your Neon dashboard (https://neon.tech)
echo    - Open SQL Editor
echo    - Run: sql/database_complete_schema.sql
echo    - Run: sql/add_proactive_triggers.sql
echo.
echo 2. VERCEL ENVIRONMENT VARIABLES:
echo    - Go to Vercel dashboard
echo    - Select your project
echo    - Settings → Environment Variables
echo    - Add: DATABASE_URL
echo    - Add: VITE_OPENAI_API_KEY
echo    - (Optional) Add Shopify credentials
echo    - Redeploy if you add new variables
echo.
echo 3. TEST YOUR DEPLOYMENT:
echo    - Visit your production URL
echo    - Go to Proactive tab
echo    - Click "Browse Templates"
echo    - Verify templates load correctly
echo    - Test bot builder customization
echo    - Check analytics dashboard
echo.
echo 4. FEATURES TO VERIFY:
echo    ✓ 10 Proactive Templates available
echo    ✓ Bot Builder with customization
echo    ✓ Analytics dashboard working
echo    ✓ Database persistence active
echo    ✓ No "True Citrus" branding
echo.
echo ============================================
echo.
pause
