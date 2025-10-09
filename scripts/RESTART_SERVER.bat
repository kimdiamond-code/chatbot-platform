@echo off
echo 🚨 DEVELOPMENT SERVER RESTART - FULL DIAGNOSTIC
echo.

echo 🛑 Step 1: Stop any running servers
echo Killing any existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Previous servers stopped
echo.

echo 🧹 Step 2: Clear all caches
echo Clearing Vite cache...
if exist "node_modules/.vite" rmdir /s /q "node_modules/.vite" >nul 2>&1
if exist ".vite" rmdir /s /q ".vite" >nul 2>&1
echo ✅ Cache cleared
echo.

echo 📋 Step 3: Check for any file errors
echo Verifying configuration files...
if exist "vite.config.js" (
    echo ✅ vite.config.js exists
) else (
    echo ❌ vite.config.js missing!
)

if exist "package.json" (
    echo ✅ package.json exists
) else (
    echo ❌ package.json missing!
)

if exist "src\services\apiRoutes.js" (
    echo ✅ apiRoutes.js exists
) else (
    echo ❌ apiRoutes.js missing!
)
echo.

echo 🚀 Step 4: Starting development server
echo This will show any startup errors...
echo.
echo ⚠️  WATCH FOR THESE STARTUP MESSAGES:
echo   ✅ "Local: http://localhost:5173/"
echo   ✅ "📋 API Middleware: Attempting to load apiRoutes.js..."
echo   ❌ Any red error messages
echo.
echo If you see errors, press Ctrl+C and report them!
echo.

npm run dev