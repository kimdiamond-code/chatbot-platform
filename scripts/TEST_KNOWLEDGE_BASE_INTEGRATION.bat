@echo off
echo 🔍 KNOWLEDGE BASE INTEGRATION DIAGNOSTIC
echo.

echo 📊 Testing Knowledge Base Integration...
echo.

echo 🧪 Step 1: Check if knowledge base data exists
echo Visit: http://localhost:5173/api/debug/knowledge-base
echo.

echo 🧪 Step 2: Test chatbot with knowledge question
echo   - Open your chat interface
echo   - Ask: "What is your return policy?"
echo   - Ask: "What are your shipping terms?"
echo   - Ask: "Tell me about your products"
echo.

echo 🧪 Step 3: Watch browser console for these logs:
echo   📚 Setting knowledge base for conversation: [conversation-id]
echo   📚 Knowledge items received: [number]
echo   🔍 Searching knowledge base for: [your question]
echo   📚 Knowledge search complete. Results found: [number]
echo.

echo 🧪 Step 4: Expected behavior:
echo   ✅ If knowledge base working: Specific answers from uploaded files
echo   ❌ If not working: Random generic responses
echo.

echo 🎯 TROUBLESHOOTING GUIDE:
echo.
echo IF NO KNOWLEDGE BASE LOGS:
echo   - Knowledge base not being set
echo   - Check Bot Builder → Knowledge Base section
echo   - Verify files are uploaded and enabled
echo.
echo IF LOGS SHOW "0 items received":
echo   - Files not being saved to bot configuration
echo   - Check localStorage or database storage
echo.
echo IF LOGS SHOW "0 results found":
echo   - Files uploaded but search not working
echo   - Try simpler keywords from your uploaded content
echo.
echo IF OPENAI NOT CALLED:
echo   - API key issue or client initialization failed
echo   - Check for OpenAI initialization logs
echo.

echo 📋 Please run these tests and report:
echo   1. What you see at /api/debug/knowledge-base
echo   2. What logs appear in browser console when asking questions
echo   3. What responses the bot gives vs what you expect
echo.
pause