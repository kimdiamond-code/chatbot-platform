@echo off
echo 🔧 TROUBLESHOOTING GUIDE - Server Won't Start
echo.

echo 📋 COMMON ISSUES AND SOLUTIONS:
echo.

echo 1️⃣ PORT ALREADY IN USE:
echo    Error: "EADDRINUSE: address already in use :::5173"
echo    Solution: taskkill /f /im node.exe
echo             Then: npm run dev
echo.

echo 2️⃣ IMPORT/EXPORT ERRORS:
echo    Error: "Cannot resolve module" or "Failed to resolve import"
echo    Solution: Check our recent changes for syntax errors
echo             Restart: npm run dev
echo.

echo 3️⃣ TYPESCRIPT ERRORS:
echo    Error: TypeScript configuration issues
echo    Solution: copy tsconfig.simple.json tsconfig.json
echo             Then: npm run dev
echo.

echo 4️⃣ NODE MODULES ISSUES:
echo    Error: Module not found errors
echo    Solution: npm install
echo             Then: npm run dev
echo.

echo 5️⃣ CACHE ISSUES:
echo    Error: Vite cache corruption
echo    Solution: rmdir /s /q node_modules\.vite
echo             Then: npm run dev
echo.

echo 🚀 QUICK FIXES TO TRY:
echo.
echo Method 1 - Simple restart:
echo   npm run dev
echo.
echo Method 2 - Clear cache:
echo   rmdir /s /q node_modules\.vite
echo   npm run dev
echo.
echo Method 3 - Full reset:
echo   taskkill /f /im node.exe
echo   npm install
echo   npm run dev
echo.
echo Method 4 - Port change:
echo   npm run dev -- --port 5174
echo   (Then visit http://localhost:5174)
echo.

echo ❓ WHAT TO DO:
echo 1. Try Method 1 first (simple restart)
echo 2. If errors appear, note the exact error message
echo 3. Try the appropriate solution above
echo 4. Report any red error messages you can't fix
echo.

echo 🎯 TARGET: See "Local: http://localhost:5173/" message
echo.
pause