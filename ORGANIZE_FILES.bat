@echo off
echo ========================================
echo ORGANIZING PROJECT FILES
echo ========================================
echo.

echo Moving BAT scripts to scripts folder...
move COMPLETE_ORDER_TRACKING_FIX.bat scripts\ 2>nul
move DEPLOY_FRESH.bat scripts\ 2>nul
move DEPLOY_MINIMAL_SUPABASE.bat scripts\ 2>nul
move DEPLOY_SHOPIFY_OAUTH.bat scripts\ 2>nul
move DIAGNOSE_AND_FIX.bat scripts\ 2>nul
move FIX_SHOPIFY_SCHEMA.bat scripts\ 2>nul
move FIX_SUPABASE_FINAL.bat scripts\ 2>nul
move IMMEDIATE_FIX_APPLIED.bat scripts\ 2>nul
move INSTALL_MISSING_DEPS.bat scripts\ 2>nul
move QUICK_FIX_SHOPIFY.bat scripts\ 2>nul
move REBUILD_AND_DEPLOY.bat scripts\ 2>nul
move REDEPLOY.bat scripts\ 2>nul
move RESTART_CLEAN.bat scripts\ 2>nul
move SETUP_MULTI_STORE_PLATFORM.bat scripts\ 2>nul
move SETUP_PROACTIVE_ENGAGEMENT.bat scripts\ 2>nul
move SIMPLE_FIX.bat scripts\ 2>nul
move START_AND_TEST.bat scripts\ 2>nul
move TEST_OPENAI_FIX.bat scripts\ 2>nul

echo Moving SQL files to sql folder...
move ADD_MISSING_COLUMN.sql sql\ 2>nul
move COMPLETE_DATABASE_SETUP.sql sql\ 2>nul
move COMPLETE_FIX.sql sql\ 2>nul
move database_analytics_schema.sql sql\ 2>nul
move database_complete_schema.sql sql\ 2>nul
move database_kustomer_connections.sql sql\ 2>nul
move database_kustomer_oauth_schema.sql sql\ 2>nul
move database_migration_fixed.sql sql\ 2>nul
move database_oauth_states.sql sql\ 2>nul
move database_simple_schema.sql sql\ 2>nul
move database_update_integrations.sql sql\ 2>nul
move DIAGNOSTIC_AND_FIX.sql sql\ 2>nul
move FIX_SCHEMA_AND_OAUTH.sql sql\ 2>nul
move INSERT_DEMO_DATA.sql sql\ 2>nul
move MULTI_STORE_DATABASE_SCHEMA.sql sql\ 2>nul
move STEP1_FIX_INTEGRATIONS.sql sql\ 2>nul
move STEP2_ADD_OAUTH_TABLES.sql sql\ 2>nul

echo Moving documentation to docs folder...
move ANALYTICS_IMPLEMENTATION_CHECKLIST.md docs\ 2>nul
move ANALYTICS_TRACKING_TESTING.md docs\ 2>nul
move ANALYTICS_USAGE_GUIDE.md docs\ 2>nul
move CUSTOMER_SETUP_GUIDE.md docs\ 2>nul
move IMPLEMENTATION_COMPLETE.md docs\ 2>nul
move KUSTOMER_INTEGRATION_GUIDE.md docs\ 2>nul
move KUSTOMER_OAUTH_SETUP_GUIDE.md docs\ 2>nul
move KUSTOMER_PRODUCTION_CHECKLIST.md docs\ 2>nul
move MONETIZABLE_SHOPIFY_INTEGRATION.md docs\ 2>nul
move MULTI_STORE_PLATFORM_GUIDE.md docs\ 2>nul
move MULTI_TENANT_SHOPIFY_COMPLETE.md docs\ 2>nul
move MULTI_TENANT_SHOPIFY_SETUP.md docs\ 2>nul
move OPENAI_FIX_VERIFICATION.md docs\ 2>nul
move ORDER_TRACKING_TEST_GUIDE.md docs\ 2>nul
move PROACTIVE_ENGAGEMENT_GUIDE.md docs\ 2>nul
move PRODUCTION_GUIDE.md docs\ 2>nul
move QUICK_START_OAUTH.md docs\ 2>nul
move SHOPIFY_INTEGRATION_COMPLETE.md docs\ 2>nul
move SHOPIFY_INTEGRATION_GUIDE.md docs\ 2>nul
move SHOPIFY_INTEGRATION_SUMMARY.md docs\ 2>nul
move SHOPIFY_OAUTH_COMPLETE.md docs\ 2>nul
move SHOPIFY_OAUTH_SETUP_GUIDE.md docs\ 2>nul
move SHOPIFY_SETUP_GUIDE.md docs\ 2>nul
move SUPABASE_AND_OAUTH_FIX.md docs\ 2>nul

echo Moving test files to scripts\tests folder...
move BROWSER_CONSOLE_TEST.js scripts\tests\ 2>nul
move BROWSER_TEST_ORDER_TRACKING.js scripts\tests\ 2>nul
move TRUE_CITRUS_DEMO_ORDERS.js scripts\tests\ 2>nul

echo Moving shell scripts to scripts folder...
move setup-kustomer-oauth.sh scripts\ 2>nul
move setup-kustomer.sh scripts\ 2>nul

echo Moving backup files to backups folder...
move .env.example backups\ 2>nul
move .env.saas backups\ 2>nul
move .env.template backups\ 2>nul
move vite.config.js.backup backups\ 2>nul

echo.
echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo Organized structure:
echo   /scripts       - All .bat and .sh scripts
echo   /scripts/tests - Test JavaScript files
echo   /sql           - All database SQL files
echo   /docs          - All documentation
echo   /backups       - Backup configuration files
echo.
pause
