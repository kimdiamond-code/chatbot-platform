@echo off
echo 🔧 Fixing TypeScript Configuration Issues...
echo.

echo 📦 Installing missing TypeScript dependencies...
npm install typescript @types/react @types/react-dom @types/node --save-dev

echo.
echo 🧹 Clearing TypeScript and build cache...
if exist "node_modules/.cache" rmdir /s /q "node_modules/.cache"
if exist ".tsbuildinfo" del ".tsbuildinfo"
if exist "tsconfig.tsbuildinfo" del "tsconfig.tsbuildinfo"
if exist "dist" rmdir /s /q "dist"

echo.
echo ✅ TypeScript configuration files have been fixed:
echo    - tsconfig.json: Mixed JS/TS support enabled
echo    - tsconfig.node.json: Vite config support enabled
echo    - Dependencies: TypeScript types installed
echo.
echo 🔄 Ready to restart development server...
echo Run: npm run dev
echo.
echo 🎯 Both OpenAI and TypeScript issues should now be resolved!
echo.
pause