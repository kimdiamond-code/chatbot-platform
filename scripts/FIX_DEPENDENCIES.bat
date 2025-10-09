@echo off
echo 🔧 Fixing ChatBot Platform Dependencies...
echo ==========================================

echo.
echo 1. Stopping any running servers...
taskkill /F /IM node.exe 2>nul

echo.
echo 2. Cleaning up old installations...
if exist "node_modules" (
    echo Removing old node_modules...
    rmdir /s /q "node_modules"
)

if exist "package-lock.json" (
    echo Removing package-lock.json...
    del /f "package-lock.json"
)

echo.
echo 3. Installing fresh dependencies...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ❌ NPM install failed. Trying alternative...
    echo.
    call npm install --legacy-peer-deps
)

echo.
echo 4. Verifying installation...
if exist "node_modules\react" (
    echo ✅ React installed
) else (
    echo ❌ React missing
)

if exist "node_modules\vite" (
    echo ✅ Vite installed
) else (
    echo ❌ Vite missing
)

echo.
echo 5. Starting the platform...
echo 📊 Main app starting at: http://localhost:3000
echo.

timeout /t 2 /nobreak > nul
call npm run dev

echo.
echo 🎯 Platform should now be working!
pause