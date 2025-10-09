@echo off
echo ========================================
echo DEPLOYING OAUTH WITH CORS FIX
echo ========================================
echo.

echo Building...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Deploying to Vercel...
call vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Now test the OAuth endpoint again with:
echo.
echo fetch('https://chatbot-platform-v2.vercel.app/api/shopify/oauth/auth', {
echo   method: 'POST',
echo   headers: { 'Content-Type': 'application/json' },
echo   body: JSON.stringify({ 
echo     shop: 'truecitrus2',
echo     organizationId: '00000000-0000-0000-0000-000000000001'
echo   })
echo })
echo .then(r =^> r.json())
echo .then(d =^> console.log('Result:', d))
echo.
echo Should return an authUrl now!
echo.
pause
