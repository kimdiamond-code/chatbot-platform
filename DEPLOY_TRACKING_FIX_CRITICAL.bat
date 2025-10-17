@echo off
echo ========================================
echo DEPLOYING ORDER TRACKING FIX
echo ========================================
echo.
echo Fixing critical bugs:
echo 1. Duplicate getConversationContext functions causing crash
echo 2. Improved order status detection
echo.

cd /d "%~dp0"

echo [1/3] Staging changes...
git add src/services/chat/chatIntelligence.js
git commit -m "Fix: Critical bug - duplicate getConversationContext causing TypeError + improved order status"

echo.
echo [2/3] Pushing to repository...
git push

echo.
echo [3/3] Deploying to Vercel...
call vercel --prod

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Changes deployed:
echo - Fixed TypeError: e.forEach is not a function
echo - Renamed conflicting function to analyzeConversationHistory
echo - Enhanced getOrderStatus to use shipment_status
echo - Added detailed logging for order status detection
echo.
echo The bot should now:
echo 1. Not crash when analyzing messages
echo 2. Show accurate order status from Shopify
echo.
pause
