@echo off
echo.
echo ========================================
echo  DEPLOYING ANALYTICS + CUSTOMIZATION
echo ========================================
echo.
echo This will deploy BOTH new features:
echo  1. Analytics Tracking System
echo  2. Bot Builder Customization Tab
echo.
pause

echo.
echo 1. Adding all files to git...
git add .

echo.
echo 2. Committing changes...
git commit -m "Add: Comprehensive Analytics Tracking + Bot Customization Tab with Live Preview"

echo.
echo 3. Pushing to GitHub...
git push origin main

echo.
echo 4. Deploying to Vercel Production...
vercel --prod

echo.
echo ========================================
echo  DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo NEW FEATURES LIVE:
echo.
echo 1. ANALYTICS TRACKING
echo    - All chatbot interactions tracked
echo    - Sales metrics (conversions, revenue, AOV)
echo    - Engagement metrics (rate, customer types)
echo    - Shoppers intelligence (products, categories)
echo    - Missing info detection
echo    - AI recommendations
echo.
echo 2. BOT CUSTOMIZATION
echo    - Color scheme controls (6 colors)
echo    - Quick theme presets (8 themes)
echo    - Logo upload
echo    - Font customization (7 fonts, 3 sizes)
echo    - Widget positioning (4 corners, 3 sizes)
echo    - Live preview updates
echo.
echo TESTING:
echo 1. Test analytics by starting conversations
echo    - Check browser console for analytics events
echo    - View Analytics dashboard for metrics
echo.
echo 2. Test customization in Bot Builder
echo    - Try different color themes
echo    - Upload logo
echo    - Change fonts and positioning
echo    - Watch live preview update
echo.
pause
