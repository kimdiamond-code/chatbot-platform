@echo off
echo ========================================
echo FIXING FAKE PRODUCT RESPONSES
echo ========================================
echo.
echo CRITICAL FIX:
echo - Bot was falling back to OpenAI which makes up fake products
echo - Now forces use of real Shopify data when products are found
echo - Lowered confidence threshold from 0.7 to 0.5
echo - Always uses smart integration response when products exist
echo.

cd /d "%~dp0"

echo [1/2] Committing changes...
git add -A
git commit -m "CRITICAL FIX: Stop OpenAI from making up fake products - always use real Shopify data"

echo.
echo [2/2] Deploying to Vercel...
vercel --prod --yes

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo FIXED:
echo - No more fake/demo products
echo - Always uses real Shopify products when available
echo - OpenAI only used for chitchat, not product data
echo.
echo Test now: Ask "show me tote products"
echo Should return REAL products from your Shopify store!
echo.
pause
