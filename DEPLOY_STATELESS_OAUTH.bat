@echo off
echo ========================================
echo DEPLOYING STATELESS OAUTH
echo ========================================
echo.
echo This version does NOT require Supabase!
echo OAuth will work immediately.
echo.

echo Deploying...
call vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo TEST NOW:
echo.
echo fetch('https://chatbot-platform-v2.vercel.app/api/shopify/oauth/auth', {
echo   method: 'POST',
echo   headers: { 'Content-Type': 'application/json' },
echo   body: JSON.stringify({ shop: 'truecitrus2' })
echo })
echo .then(r =^> r.json())
echo .then(d =^> console.log('Result:', d))
echo.
echo Should return an authUrl!
echo.
echo Then test the full flow:
echo 1. Go to Integrations -^> Shopify
echo 2. Click OAuth tab
echo 3. Enter: truecitrus2
echo 4. Click Connect
echo 5. Authorize on Shopify
echo 6. Done!
echo.
pause
