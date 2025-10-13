@echo off
echo ==========================================
echo  DEPLOYING ORDER TRACKING FIX
echo ==========================================
echo.
echo Changes:
echo - Extracts email from messages automatically
echo - Asks for email if missing
echo - Asks for order number if needed
echo - Shows full tracking details in chat
echo - Displays shipping address
echo - Removed broken tracking links
echo.
echo Deploying to production...
echo.

cd /d "%~dp0"
vercel --prod

echo.
echo ==========================================
echo DEPLOYMENT COMPLETE
echo ==========================================
echo.
echo Test: "track my order"
echo Then provide: email and order number
echo.
pause
