@echo off
echo =====================================
echo STARTING ENHANCED CHATBOT PLATFORM
echo =====================================
echo.
echo This platform now includes:
echo.
echo ✅ Bot Builder Interface - AI-powered bot creation
echo ✅ Proactive Engagement - Exit intent, scroll triggers, UTM tracking
echo ✅ CRM ^& Customer Context - Complete customer management
echo ✅ E-Commerce Support - Cart recovery, product recommendations
echo ✅ Multi-Channel Support - Web, WhatsApp, SMS, Email, Facebook, Instagram
echo ✅ Knowledge Base - Web scraping, document management, AI training
echo ✅ Security ^& Compliance - GDPR/CCPA, SSO/2FA, RBAC
echo ✅ Analytics ^& Reporting - Advanced metrics and insights
echo ✅ Integrations - Shopify, Kustomer, Klaviyo, Webhooks
echo.
echo =====================================
echo CHECKING DEPENDENCIES...
echo =====================================
echo.

cd "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo =====================================
echo STARTING DEVELOPMENT SERVER...
echo =====================================
echo.
echo Platform Features:
echo - Dashboard: Overview of all metrics
echo - Bot Builder: Create and customize chatbots
echo - Live Chat: Real-time customer conversations
echo - Proactive: Behavior-based engagement triggers
echo - CRM: Customer profiles and history
echo - E-Commerce: Product recommendations and cart recovery
echo - Channels: Unified inbox for all communication channels
echo - Knowledge: Documentation and web scraping
echo - Analytics: Performance metrics and insights
echo - Integrations: Connect with external services
echo - Security: Compliance and access control
echo - Settings: Platform configuration
echo.
echo The platform will open at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo =====================================
echo.

npm run dev