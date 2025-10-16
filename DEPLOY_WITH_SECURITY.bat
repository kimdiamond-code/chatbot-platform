@echo off
echo ========================================
echo   SECURE DEPLOYMENT SCRIPT
echo ========================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)

REM Check Vercel CLI
vercel --version >nul 2>&1
if errorlevel 1 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

echo Step 1: Security Check
echo ----------------------------------------
echo.

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Run GENERATE_SECURITY_KEYS.bat first
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

REM Check for security variables
findstr /C:"ENCRYPTION_SECRET" .env >nul 2>&1
if errorlevel 1 (
    echo WARNING: ENCRYPTION_SECRET not set in .env
    echo Run GENERATE_SECURITY_KEYS.bat to generate secure keys
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "%CONTINUE%"=="y" exit /b 1
)

echo ✓ Security configuration check passed
echo.

echo Step 2: Install Dependencies
echo ----------------------------------------
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

echo Step 3: Run Build
echo ----------------------------------------
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo ✓ Build successful
echo.

echo Step 4: Database Setup
echo ----------------------------------------
echo.
echo IMPORTANT: Run these SQL scripts in your Neon dashboard:
echo 1. sql/database_complete_schema.sql
echo 2. sql/add_proactive_triggers.sql  
echo 3. sql/add_security_tables.sql (NEW)
echo.
set /p DB_READY="Have you run the security SQL migration? (y/n): "
if /i not "%DB_READY%"=="y" (
    echo Please run sql/add_security_tables.sql in Neon before deploying
    pause
    exit /b 1
)
echo.

echo Step 5: Environment Variables Check
echo ----------------------------------------
echo.
echo Make sure these are set in Vercel:
echo - DATABASE_URL
echo - ENCRYPTION_SECRET (NEW - Required!)
echo - HASH_SALT (NEW - Required!)
echo - API_SECRET_KEY (NEW - Required!)
echo - VITE_OPENAI_API_KEY
echo - SHOPIFY_CLIENT_ID
echo - SHOPIFY_CLIENT_SECRET
echo - NEXT_PUBLIC_APP_URL
echo.
set /p ENV_READY="Are all environment variables set in Vercel? (y/n): "
if /i not "%ENV_READY%"=="y" (
    echo Please set all required environment variables in Vercel dashboard
    echo Especially the new security variables!
    pause
    exit /b 1
)
echo.

echo Step 6: Deploy to Production
echo ----------------------------------------
echo.
set /p DEPLOY_CONFIRM="Deploy to production with security features? (y/n): "
if /i not "%DEPLOY_CONFIRM%"=="y" (
    echo Deployment cancelled
    pause
    exit /b 0
)

echo Deploying with security features...
call vercel --prod

if errorlevel 1 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo Security features now active:
echo ✓ Data encryption (AES-256-GCM)
echo ✓ Input validation and sanitization
echo ✓ Rate limiting
echo ✓ Audit logging
echo ✓ API authentication
echo ✓ Security headers
echo ✓ CORS protection
echo ✓ IP blocking capability
echo.
echo NEXT STEPS:
echo 1. Test the deployment
echo 2. Verify encryption is working
echo 3. Check audit logs are being created
echo 4. Review security headers in browser DevTools
echo 5. Test rate limiting with multiple requests
echo.
echo Read SECURITY_IMPLEMENTATION.md for details
echo.

pause
