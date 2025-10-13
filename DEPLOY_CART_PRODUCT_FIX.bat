@echo off
echo ========================================
echo  DEPLOYING CART & PRODUCT QUERY FIX
echo ========================================
echo.
echo Changes:
echo - Added cart inquiry detection
echo - Added product detail questions
echo - Cart view shows draft orders  
echo - Product questions get detailed info
echo.
echo Deploying to production...
echo.

cd /d "%~dp0"
vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE
echo ========================================
echo.
echo Test the following:
echo 1. "show me my cart"
echo 2. "tell me about [product name]"
echo 3. "what is this product?"
echo.
pause
