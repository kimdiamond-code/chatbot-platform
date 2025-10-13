@echo off
echo.
echo ========================================
echo  DEPLOYING ANALYTICS TRACKING
echo ========================================
echo.

echo 1. Adding files to git...
git add .

echo.
echo 2. Committing changes...
git commit -m "Add: Comprehensive Analytics Tracking - Sales, Engagement, Insights"

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
echo Next steps:
echo 1. Test the chatbot and check console for analytics events
echo 2. Check Analytics dashboard for real-time metrics
echo 3. Verify database analytics_events table is populating
echo.
pause
