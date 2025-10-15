@echo off
echo ====================================
echo Deploying Landing Page Update to Vercel
echo ====================================

echo.
echo Step 1: Adding changes to git...
git add -A

echo.
echo Step 2: Committing changes...
git commit -m "Add comprehensive landing page with features showcase, pricing, and demo request"

echo.
echo Step 3: Pushing to GitHub (this will trigger Vercel deployment)...
git push origin main

echo.
echo ====================================
echo Deployment initiated!
echo Check your Vercel dashboard for deployment progress
echo ====================================
pause
