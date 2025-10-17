@echo off
echo.
echo ================================
echo Deploying Conversations Feature
echo ================================
echo.

cd /d "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo Adding changes to git...
git add .

echo Committing changes...
git commit -m "Feature: Rename Live Chat to Conversations + Add edit, multi-select, bulk delete + Widget-style preview"

echo Pushing to GitHub...
git push origin main

echo.
echo ✅ Changes pushed to GitHub
echo ⏳ Vercel will auto-deploy
echo.
pause
