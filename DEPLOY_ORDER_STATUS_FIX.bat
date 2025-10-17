@echo off
echo ========================================
echo DEPLOYING ORDER STATUS FIX
echo ========================================
echo.
echo This fixes the order status display to show actual Shopify data
echo instead of always saying "Processing"
echo.

cd /d "%~dp0"

echo [1/3] Staging changes...
git add src/services/chat/chatIntelligence.js
git commit -m "Fix: Improved order status detection to use actual Shopify fulfillment and shipment status"

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
echo - Enhanced getOrderStatus function to check shipment_status
echo - Added detailed logging for debugging
echo - Now shows: Delivered, Shipped, In Transit, Out for Delivery, etc.
echo.
echo Test by asking: "Where is my order?" with your email
echo.
pause
