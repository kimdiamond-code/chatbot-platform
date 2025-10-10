@echo off
cls
echo ============================================
echo   GitHub Setup for Chatbot Platform
echo ============================================
echo.
echo Version: 2.0.8
echo.

cd /d "%~dp0"

REM Check if Git is initialized
if not exist ".git" (
    echo [STEP 1] Initializing Git repository...
    git init
    echo   ✓ Git initialized
) else (
    echo [STEP 1] ✓ Git repository already exists
)

echo.
echo [STEP 2] Checking for GitHub connection...
git remote -v > temp_remote.txt
findstr /C:"github.com" temp_remote.txt >nul
if %errorlevel% equ 0 (
    echo   ✓ GitHub remote already connected!
    type temp_remote.txt
    del temp_remote.txt
    echo.
    echo   Your project is already connected to GitHub.
    goto :commit_and_push
) else (
    del temp_remote.txt
    echo   ⚠ No GitHub remote found
    echo.
    goto :setup_github
)

:setup_github
echo ============================================
echo   SETUP REQUIRED: Connect to GitHub
echo ============================================
echo.
echo Please follow these steps:
echo.
echo 1. Go to https://github.com/new
echo 2. Create a new repository named: chatbot-platform
echo 3. Do NOT initialize with README
echo 4. Copy the repository URL (looks like: https://github.com/YOUR_USERNAME/chatbot-platform.git)
echo.
set /p GITHUB_URL="Enter your GitHub repository URL: "

echo.
echo Adding GitHub remote...
git remote add origin %GITHUB_URL%
if %errorlevel% equ 0 (
    echo   ✓ GitHub remote added successfully!
) else (
    echo   ✗ Failed to add remote
    pause
    exit /b 1
)

:commit_and_push
echo.
echo [STEP 3] Staging all files...
git add .
if %errorlevel% equ 0 (
    echo   ✓ Files staged
) else (
    echo   ✗ Failed to stage files
    pause
    exit /b 1
)

echo.
echo [STEP 4] Creating commit...
git commit -m "Version 2.0.8 - Baseline with all features"
if %errorlevel% equ 0 (
    echo   ✓ Commit created
) else (
    echo   ⚠ No changes to commit or commit failed
)

echo.
echo [STEP 5] Pushing to GitHub...
git push -u origin main
if %errorlevel% equ 0 (
    echo   ✓ Successfully pushed to GitHub!
    goto :connect_vercel
) else (
    echo   ⚠ Push failed. Trying 'master' branch...
    git branch -M main
    git push -u origin main
    if %errorlevel% equ 0 (
        echo   ✓ Successfully pushed to GitHub!
        goto :connect_vercel
    ) else (
        echo   ✗ Failed to push
        pause
        exit /b 1
    )
)

:connect_vercel
echo.
echo ============================================
echo   NEXT: Connect Vercel to GitHub
echo ============================================
echo.
echo Your code is now on GitHub!
echo.
echo To enable auto-deployments:
echo.
echo 1. Go to https://vercel.com/dashboard
echo 2. Click your project: chatbot-platform
echo 3. Go to Settings ^> Git
echo 4. Click "Connect Git Repository"
echo 5. Select your GitHub repository
echo.
echo After connecting:
echo   - Every git push = automatic deployment
echo   - No more manual deployments
echo   - Version history preserved forever
echo.
echo ============================================
echo   ✓ GITHUB SETUP COMPLETE
echo ============================================
echo.
echo REMEMBER: Always use this workflow:
echo.
echo   git add .
echo   git commit -m "Description of changes"
echo   git push
echo.
echo Vercel will automatically deploy your changes!
echo.
pause
