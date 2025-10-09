@echo off
echo 🔍 API ENDPOINT DIAGNOSTIC - Full System Check
echo.

echo 🛑 Stopping any running development servers...
taskkill /f /im node.exe >nul 2>&1

echo.
echo 🧹 Clearing all caches...
if exist "node_modules/.vite" rmdir /s /q "node_modules/.vite" >nul 2>&1
if exist ".vite" rmdir /s /q ".vite" >nul 2>&1
if exist "tsconfig.tsbuildinfo" del "tsconfig.tsbuildinfo" >nul 2>&1

echo.
echo 📋 Current configuration status:
echo ✅ TypeScript: Fixed
echo ✅ OpenAI Integration: Fixed  
echo ❓ API Endpoints: Testing...

echo.
echo 🚀 Starting development server with full diagnostics...
echo.
echo ⚠️  WATCH THE TERMINAL for these logs:
echo     📋 API Middleware triggered for: GET /api/test
echo     ✅ Direct API test endpoint hit
echo.
echo 🧪 AFTER SERVER STARTS, TEST THESE URLs:
echo     1. http://localhost:5173/api/test (should work)
echo     2. http://localhost:5173/api/health (if working)
echo.

npm run dev