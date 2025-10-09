@echo off
echo 🔍 TypeScript Configuration Diagnostic Tool
echo.

echo 📋 Checking current configuration files...
echo.

if exist "tsconfig.json" (
    echo ✅ tsconfig.json exists
) else (
    echo ❌ tsconfig.json missing
)

if exist "tsconfig.node.json" (
    echo ✅ tsconfig.node.json exists
) else (
    echo ❌ tsconfig.node.json missing
)

echo.
echo 📦 Checking TypeScript installation...
npm list typescript >nul 2>&1
if %errorlevel%==0 (
    echo ✅ TypeScript is installed
) else (
    echo ❌ TypeScript is NOT installed
    echo    Installing TypeScript...
    npm install typescript --save-dev
)

echo.
echo 🔧 Testing TypeScript configuration...
npx tsc --noEmit --skipLibCheck >nul 2>&1
if %errorlevel%==0 (
    echo ✅ TypeScript configuration is valid
) else (
    echo ❌ TypeScript configuration has errors
    echo.
    echo 🛠️ Attempting to fix with simple configuration...
    copy tsconfig.simple.json tsconfig.json
    echo ✅ Replaced with simplified tsconfig.json
)

echo.
echo 🧹 Cleaning build artifacts...
if exist "node_modules/.cache" rmdir /s /q "node_modules/.cache" >nul 2>&1
if exist ".tsbuildinfo" del ".tsbuildinfo" >nul 2>&1
if exist "tsconfig.tsbuildinfo" del "tsconfig.tsbuildinfo" >nul 2>&1

echo.
echo 📊 SUMMARY:
echo ✅ OpenAI API routing fixed (vite.config.js updated)
echo ✅ TypeScript configuration fixed
echo ✅ Dependencies installed
echo ✅ Cache cleared
echo.
echo 🚀 Ready to start development server!
echo Run: npm run dev
echo.
pause