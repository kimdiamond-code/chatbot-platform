@echo off
echo ============================================
echo PRE-DEPLOYMENT CHECK
echo ============================================
echo.

REM Check if git is initialized
if not exist .git (
    echo [ERROR] Git repository not found!
    echo Please run: git init
    echo Then follow VERSION_CONTROL_SETUP.md
    pause
    exit /b 1
)

echo [OK] Git repository found

REM Check for uncommitted changes
git diff --quiet
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] You have uncommitted changes:
    git status --short
    echo.
    set /p commit="Do you want to commit these changes? (y/n): "
    if /i "%commit%"=="y" (
        set /p message="Enter commit message: "
        git add .
        git commit -m "%message%"
        git push
        echo [OK] Changes committed and pushed
    ) else (
        echo [SKIPPED] Continuing without committing
    )
) else (
    echo [OK] No uncommitted changes
)

REM Check current version
if exist VERSION (
    set /p current_version=<VERSION
    echo [INFO] Current version: %current_version%
) else (
    echo [WARNING] VERSION file not found
)

REM Check last commit
echo.
echo [INFO] Last commit:
git log -1 --oneline

REM Check remote connection
echo.
git remote -v | findstr origin
if %errorlevel% equ 0 (
    echo [OK] Git remote configured
) else (
    echo [WARNING] No git remote configured
    echo Please connect to GitHub following VERSION_CONTROL_SETUP.md
)

echo.
echo ============================================
echo Pre-deployment check complete
echo ============================================
echo.
echo If connected to GitHub, Vercel will auto-deploy
echo Otherwise, run: vercel --prod
echo.
pause
