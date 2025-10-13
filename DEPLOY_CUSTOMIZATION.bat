@echo off
echo.
echo ========================================
echo  DEPLOYING BOT CUSTOMIZATION TAB
echo ========================================
echo.

echo 1. Adding files to git...
git add .

echo.
echo 2. Committing changes...
git commit -m "Add: Bot Builder Customization Tab - Colors, Logo, Fonts, Live Preview"

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
echo 1. Go to Bot Builder
echo 2. Click Customization tab
echo 3. Test:
echo    - Color themes
echo    - Logo upload
echo    - Font changes
echo    - Widget positioning
echo    - Live preview updates
echo 4. Click Save to persist settings
echo.
pause
