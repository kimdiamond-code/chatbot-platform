@echo off
echo.
echo 🔍 QUICK API TEST
echo ================
echo.

cd /d "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform"

echo 📍 Current directory: %CD%
echo.

echo 🧪 Testing API endpoints...
echo.

echo 1. Testing health endpoint...
curl -s "http://localhost:5173/api/health" 2>nul && (
    echo ✅ Health endpoint responding
) || (
    echo ❌ Health endpoint not responding
)

echo.
echo 2. Testing OpenAI endpoint...
curl -s "http://localhost:5173/api/test-openai" 2>nul && (
    echo ✅ OpenAI endpoint responding
) || (
    echo ❌ OpenAI endpoint not responding
)

echo.
echo 3. Testing chat endpoint...
curl -X POST -H "Content-Type: application/json" -d "{\"message\":\"hello\",\"conversationId\":\"test123\"}" "http://localhost:5173/api/chat" -s 2>nul && (
    echo ✅ Chat endpoint responding
) || (
    echo ❌ Chat endpoint not responding
)

echo.
echo 📋 RESULTS:
echo If all tests show ✅ then API is working
echo If any show ❌ then there's an API configuration issue
echo.
echo 💡 Next step: Open http://localhost:5173/api-test.html for detailed results
echo.
pause
