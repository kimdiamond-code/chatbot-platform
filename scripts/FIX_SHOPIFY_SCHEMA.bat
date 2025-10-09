@echo off
echo.
echo ================================================================
echo  🛍️ SHOPIFY INTEGRATION SCHEMA FIX
echo ================================================================
echo.
echo This will fix the database schema issues and enable OAuth.
echo.
echo ✅ What this does:
echo   - Fixes missing 'credentials' column error
echo   - Adds OAuth security tables  
echo   - Creates proper indexes and policies
echo   - Enables customer-friendly app installation
echo.
echo 📋 Steps to complete the fix:
echo.
echo 1. Run this to open your Supabase dashboard:
echo    https://supabase.com/dashboard/projects
echo.
echo 2. Navigate to: SQL Editor
echo.
echo 3. Copy and run the SQL from: FIX_SCHEMA_AND_OAUTH.sql
echo.
echo 4. Create Shopify Partner app at: https://partners.shopify.com/
echo.
echo 5. Update your .env file with the OAuth credentials
echo.
echo ================================================================
echo.
echo Opening Supabase dashboard...
start https://supabase.com/dashboard/projects
echo.
echo Opening SQL migration file...
start notepad "FIX_SCHEMA_AND_OAUTH.sql"
echo.
echo ✅ Follow the steps above to complete the Shopify OAuth setup!
echo.
pause