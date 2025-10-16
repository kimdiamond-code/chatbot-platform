@echo off
echo ========================================
echo   SECURITY SETUP HELPER
echo ========================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Generating secure environment variables...
echo.

REM Generate ENCRYPTION_SECRET
echo Generating ENCRYPTION_SECRET...
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set ENCRYPTION_SECRET=%%i
echo ENCRYPTION_SECRET=%ENCRYPTION_SECRET%
echo.

REM Generate HASH_SALT
echo Generating HASH_SALT...
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set HASH_SALT=%%i
echo HASH_SALT=%HASH_SALT%
echo.

REM Generate API_SECRET_KEY
echo Generating API_SECRET_KEY...
for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"') do set API_SECRET_KEY=%%i
echo API_SECRET_KEY=%API_SECRET_KEY%
echo.

echo ========================================
echo   ADD THESE TO YOUR .env FILE
echo ========================================
echo.
echo ENCRYPTION_SECRET=%ENCRYPTION_SECRET%
echo HASH_SALT=%HASH_SALT%
echo API_SECRET_KEY=%API_SECRET_KEY%
echo.

REM Ask if user wants to append to .env
set /p APPEND="Would you like to append these to your .env file? (y/n): "

if /i "%APPEND%"=="y" (
    echo. >> .env
    echo # Security variables generated on %date% %time% >> .env
    echo ENCRYPTION_SECRET=%ENCRYPTION_SECRET% >> .env
    echo HASH_SALT=%HASH_SALT% >> .env
    echo API_SECRET_KEY=%API_SECRET_KEY% >> .env
    echo.
    echo ✓ Security variables added to .env file
) else (
    echo.
    echo Please manually add these variables to your .env file
)

echo.
echo IMPORTANT SECURITY NOTES:
echo - Never commit .env to version control
echo - Use different values for dev/staging/production
echo - Rotate these secrets every 90 days
echo - Keep these values secure and confidential
echo.

pause
