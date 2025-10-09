@echo off
echo ================================================================
echo    📚 ChatBot Platform - Knowledge Base Testing Guide
echo ================================================================
echo.
echo Your Knowledge Base system is now FULLY FUNCTIONAL! 
echo Here's how to test the complete file upload and AI integration:
echo.
echo ================================================================
echo    🚀 SETUP INSTRUCTIONS:
echo ================================================================
echo.
echo 1. Install new dependencies:
echo    npm install
echo.
echo 2. Start CORS proxy (for webpage scraping):
echo    cd cors-proxy
echo    npm install
echo    npm run dev
echo    (Leave this running in separate terminal)
echo.
echo 3. Start development server:
echo    cd ..
echo    npm run dev
echo.
echo 4. Open browser: http://localhost:5173
echo.
echo ================================================================
echo    🧪 TESTING THE KNOWLEDGE BASE:
echo ================================================================
echo.
echo 🤖 Step 1: Access Bot Builder
echo    - Click "🤖 Bot Builder" in sidebar
echo    - Go to "📚 Knowledge Base" tab
echo.
echo 📤 Step 2: Test File Upload
echo    - Drag ^& drop a PDF, DOC, or TXT file
echo    - Watch real-time processing with progress bar
echo    - See word count and chunks generated
echo    - View extracted keywords
echo.
echo 🌐 Step 3: Test Webpage Scraping  
echo    - Enter a URL (e.g. https://example.com)
echo    - Click "Add URL" button
echo    - Watch scraping progress
echo    - See processed webpage content
echo.
echo 💬 Step 4: Test AI Integration
echo    - Go to "Live Chat" tab
echo    - Create demo conversation
echo    - Ask questions related to uploaded content:
echo      * "What are your business hours?"
echo      * "What's your return policy?"
echo      * "How do I contact support?"
echo.
echo ================================================================
echo    ✨ NEW FEATURES NOW WORKING:
echo ================================================================
echo.
echo ✅ Drag ^& Drop File Upload (PDF, DOC, TXT)
echo ✅ Real-time Processing with Progress Indicators  
echo ✅ Text Extraction from Documents
echo ✅ Automatic Text Chunking for AI Processing
echo ✅ Keyword Extraction from Documents
echo ✅ Webpage Content Scraping via CORS Proxy
echo ✅ AI Integration - Bot Uses Knowledge Base
echo ✅ Smart Search through Uploaded Content
echo ✅ Source Attribution in AI Responses
echo ✅ Confidence Scoring (Higher with KB)
echo ✅ Knowledge Base Management Interface
echo.
echo ================================================================
echo    🎯 WHAT TO LOOK FOR:
echo ================================================================
echo.
echo 📊 AI Response Indicators:
echo    🧠 AI+KB = OpenAI using Knowledge Base
echo    🤖 AI = OpenAI without Knowledge Base  
echo    📚 KB = Knowledge Base only response
echo    💬 FB = Fallback response
echo.
echo 📄 Source Attribution:
echo    - Bot shows which documents it used
echo    - Higher confidence scores (95%% vs 80%%)
echo    - More accurate, specific answers
echo.
echo 🔍 Knowledge Search:
echo    - Bot searches through uploaded content
echo    - Matches keywords and content relevance
echo    - Provides context-aware responses
echo.
echo ================================================================
echo    🐛 TROUBLESHOOTING:
echo ================================================================
echo.
echo ❌ File upload fails:
echo    - Check file size (max 10MB)
echo    - Supported formats: PDF, DOC, DOCX, TXT
echo    - Clear browser cache and retry
echo.
echo ❌ Webpage scraping fails:
echo    - Ensure CORS proxy is running on port 3001
echo    - Check URL is accessible and valid
echo    - Some sites block scraping
echo.
echo ❌ AI not using knowledge:
echo    - Verify OpenAI API key is configured
echo    - Try questions more closely related to content
echo    - Check console for any errors
echo.
echo ================================================================
echo    🎉 SUCCESS INDICATORS:
echo ================================================================
echo.
echo You'll know everything is working when:
echo ✅ Files upload with progress bar
echo ✅ Word count and chunks are displayed
echo ✅ Webpages scrape successfully  
echo ✅ AI responses show "🧠 AI+KB" indicator
echo ✅ Sources are listed under bot messages
echo ✅ Bot gives specific answers from your content
echo.
echo Your Knowledge Base system is production-ready! 🚀
echo.
pause