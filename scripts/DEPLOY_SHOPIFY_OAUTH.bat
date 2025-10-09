@echo off
echo ========================================
echo SHOPIFY OAUTH SETUP AND DEPLOYMENT
echo ========================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [2/4] Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo [3/4] Deploying to Vercel...
call vercel --prod
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Run the database migration in Supabase SQL Editor:
echo    - Copy the contents of database_oauth_states.sql
echo    - Paste in Supabase Dashboard ^> SQL Editor
echo    - Execute the script
echo.
echo 2. Update your Shopify App settings:
echo    - Go to: https://partners.shopify.com
echo    - Select your app
echo    - Under "App setup" ^> "URLs"
echo    - Set Allowed redirection URL(s) to:
echo      https://chatbot-platform-v2.vercel.app/shopify/callback
echo.
echo 3. Test the OAuth flow:
echo    - Go to: https://chatbot-platform-v2.vercel.app
echo    - Navigate to Integrations ^> Shopify
echo    - Click "OAuth (Best)" tab
echo    - Enter your store name and click "Connect with OAuth"
echo.
echo ========================================
pause
