@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   DEPLOYMENT WITH VERSION CHECK
echo   Prevents version conflicts
echo ============================================
echo.

REM Check if VERSION file exists
if not exist VERSION (
    echo ERROR: VERSION file not found!
    echo Creating VERSION file with 2.0.0
    echo 2.0.0 > VERSION
)

REM Read current version
set /p CURRENT_VERSION=<VERSION

echo Current Version: %CURRENT_VERSION%
echo.

REM Ask user to confirm version
set /p CONFIRM="Is this the correct version? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo Deployment cancelled.
    pause
    exit /b 1
)

echo.
echo [1/7] Checking for conflicts...

REM Check if there are uncommitted changes
git status > nul 2>&1
if errorlevel 1 (
    echo WARNING: Git not initialized. Skipping conflict check.
) else (
    git diff --quiet
    if errorlevel 1 (
        echo WARNING: You have uncommitted changes!
        set /p CONTINUE="Continue anyway? (y/n): "
        if /i not "!CONTINUE!"=="y" (
            echo Deployment cancelled. Please commit your changes first.
            pause
            exit /b 1
        )
    )
)

echo.
echo [2/7] Creating deployment snapshot...

REM Create snapshot
set TIMESTAMP=%date:~-4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
set SNAPSHOT_DIR=backups\deployment_%TIMESTAMP%

if not exist backups mkdir backups
mkdir "%SNAPSHOT_DIR%"

echo Backing up current state to %SNAPSHOT_DIR%
xcopy /E /I /Q src "%SNAPSHOT_DIR%\src" > nul
xcopy /E /I /Q api "%SNAPSHOT_DIR%\api" > nul
copy package.json "%SNAPSHOT_DIR%\" > nul
copy VERSION "%SNAPSHOT_DIR%\" > nul
copy vercel.json "%SNAPSHOT_DIR%\" > nul

echo ✓ Snapshot created

echo.
echo [3/7] Running verification...
call npm run verify
if errorlevel 1 (
    echo WARNING: Verification found issues
    set /p CONTINUE="Continue with deployment? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo Deployment cancelled.
        pause
        exit /b 1
    )
)

echo.
echo [4/7] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [5/7] Building production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    echo Restore from snapshot: %SNAPSHOT_DIR%
    pause
    exit /b 1
)

echo.
echo [6/7] Checking Vercel CLI...
where vercel >nul 2>&1
if errorlevel 1 (
    echo Installing Vercel CLI...
    call npm install -g vercel
)

echo.
echo [7/7] Deploying to Vercel...
echo.
echo IMPORTANT REMINDERS:
echo - Database URL is set in Vercel environment variables
echo - Proactive triggers table must exist in database
echo - Version %CURRENT_VERSION% will be deployed
echo.

call vercel --prod --yes

if errorlevel 1 (
    echo.
    echo ============================================
    echo   DEPLOYMENT FAILED
    echo ============================================
    echo.
    echo Snapshot available at: %SNAPSHOT_DIR%
    echo You can restore from this snapshot if needed.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   DEPLOYMENT SUCCESSFUL!
echo ============================================
echo.
echo Version: %CURRENT_VERSION%
echo Snapshot: %SNAPSHOT_DIR%
echo Time: %TIMESTAMP%
echo.
echo NEXT STEPS:
echo 1. Test the deployment: https://chatbot-platform-v2.vercel.app
echo 2. Verify proactive templates work
echo 3. Check database connection
echo 4. Update VERSION file for next deployment
echo.
echo To increment version:
echo   echo 2.0.X ^> VERSION
echo   (where X is the next number)
echo.

REM Create deployment log
echo Version: %CURRENT_VERSION% >> deployment_log.txt
echo Time: %TIMESTAMP% >> deployment_log.txt
echo Status: SUCCESS >> deployment_log.txt
echo Snapshot: %SNAPSHOT_DIR% >> deployment_log.txt
echo ---------------------------------------- >> deployment_log.txt

echo Deployment logged to deployment_log.txt
echo.
pause
