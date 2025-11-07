@echo off
REM ===================================================================
REM DEPLOY BOT BUILDER MULTI-TENANT FIX
REM Connects Bot Builder configuration to OpenAI responses
REM ===================================================================

echo.
echo ========================================
echo   DEPLOYING BOT BUILDER FIX
echo ========================================
echo.
echo This will deploy the multi-tenant bot configuration fix:
echo - Bot Builder changes will immediately affect bot responses
echo - OpenAI will use your custom system prompts from database
echo - Knowledge base and Q&A will be properly loaded
echo.

pause

echo.
echo [1/3] Checking git status...
git status

echo.
echo [2/3] Committing changes...
git add .
git commit -m "Fix: Connect Bot Builder to OpenAI - Pass organization ID through conversation flow"

echo.
echo [3/3] Pushing to GitHub (triggers Vercel deployment)...
git push origin main

echo.
echo ========================================
echo   DEPLOYMENT INITIATED
echo ========================================
echo.
echo Vercel is now building and deploying your changes.
echo.
echo This usually takes 2-3 minutes.
echo.
echo After deployment completes:
echo 1. Go to Bot Builder
echo 2. Change your bot's system prompt
echo 3. Click Save
echo 4. Test in the preview chat - bot should use your custom config
echo.
echo Check deployment status at: https://vercel.com/dashboard
echo.

pause
