@echo off
echo ========================================
echo COMPLETE REBUILD AND REDEPLOY
echo ========================================
echo.

echo [1/6] Cleaning node_modules and cache...
if exist node_modules (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist .vite (
    echo Removing .vite cache...
    rmdir /s /q .vite
)
if exist dist (
    echo Removing dist...
    rmdir /s /q dist
)
echo.

echo [2/6] Fresh npm install...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [3/6] Building the application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo [4/6] Deploying to Vercel...
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
echo CRITICAL: Add/Verify these environment variables in Vercel:
echo.
echo Go to: https://vercel.com/dashboard
echo Select: chatbot-platform-v2
echo Settings -^> Environment Variables
echo.
echo Add these 4 variables:
echo 1. SHOPIFY_CLIENT_ID = 1209816bfe4d73b67e9d90c19dc984d9
echo 2. SHOPIFY_CLIENT_SECRET = 749dc6236bfa6f6948ee4c39e0d52c37
echo 3. SHOPIFY_REDIRECT_URI = https://chatbot-platform-v2.vercel.app/shopify/callback
echo 4. SHOPIFY_SCOPES = read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_inventory,read_locations
echo.
echo After adding variables, click "Redeploy" from Deployments tab
echo.
echo Then test at: https://chatbot-platform-v2.vercel.app
echo.
pause
