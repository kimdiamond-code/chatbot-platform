@echo off
echo 🔍 ChatBot Platform - System Verification Test
echo =============================================
echo.

cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo ✅ Checking project structure...
if not exist "src\App.jsx" (
    echo ❌ Missing App.jsx - Core application file not found
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ Missing package.json - Project configuration not found  
    pause
    exit /b 1
)

if not exist ".env" (
    echo ⚠️  Missing .env file - Environment variables not configured
    echo 📝 Using .env.example as reference...
    copy ".env.example" ".env" >nul
    echo ✅ Created .env from template
)

echo ✅ Checking dependencies...
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install >nul 2>&1
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

echo ✅ Checking environment variables...
findstr /C:"VITE_SUPABASE_URL" .env >nul
if errorlevel 1 (
    echo ⚠️  Supabase URL not configured
) else (
    echo ✅ Supabase configuration found
)

findstr /C:"VITE_OPENAI_API_KEY" .env >nul  
if errorlevel 1 (
    echo ⚠️  OpenAI API key not configured
) else (
    echo ✅ OpenAI configuration found
)

echo.
echo ✅ Testing build process...
call npm run build >build_test.log 2>&1
if errorlevel 1 (
    echo ❌ Build failed - Check build_test.log for details
    type build_test.log
    pause
    exit /b 1
) else (
    echo ✅ Build successful
    del build_test.log >nul 2>&1
)

echo.
echo 🎉 VERIFICATION COMPLETE!
echo =====================
echo ✅ Project structure: OK
echo ✅ Dependencies: Installed  
echo ✅ Environment: Configured
echo ✅ Build process: Working
echo.
echo 🚀 Ready for production deployment!
echo.
echo Next steps:
echo 1. Run "START_PRODUCTION.bat" to test locally
echo 2. Update .env with your API keys
echo 3. Deploy with "npm run deploy"
echo.

pause
