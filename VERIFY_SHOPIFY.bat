@echo off
echo ========================================
echo   VERIFYING SHOPIFY CONNECTION
echo ========================================
echo.
echo Opening browser console diagnostics...
echo.
echo In the browser console, run:
echo.
echo   // Check Shopify connection
echo   const shopifyService = await import('./src/services/integrations/shopifyService.js')
echo   const creds = await shopifyService.shopifyService.getCredentials()
echo   console.log('Shopify Credentials:', creds)
echo.
echo   // Check integration orchestrator
echo   const orch = await import('./src/services/chat/integrationOrchestrator.js')
echo   await orch.integrationOrchestrator.refreshIntegrations()
echo   console.log('Status:', orch.integrationOrchestrator.getIntegrationStatus())
echo.
echo   // Test product fetch
echo   const products = await shopifyService.shopifyService.getProducts(5)
echo   console.log('Products:', products)
echo.
pause
