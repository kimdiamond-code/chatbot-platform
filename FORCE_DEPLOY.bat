@echo off
echo Clearing Vercel cache and redeploying...
echo.

cd /d "%~dp0"

echo [1/2] Deleting Vercel cache...
if exist .vercel rmdir /s /q .vercel
echo   - Cache cleared

echo.
echo [2/2] Deploying fresh...
vercel --prod --force

echo.
echo Done!
pause
