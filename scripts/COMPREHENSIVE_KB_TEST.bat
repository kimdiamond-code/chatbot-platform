@echo off
echo 🔍 COMPREHENSIVE KNOWLEDGE BASE TEST
echo.

echo 📊 STEP 1: Check Knowledge Base Data
echo Visit: http://localhost:5173/api/debug/knowledge-base
echo Expected: 3 knowledge base items (Return Policy, Shipping, Warranty)
echo.

echo 📊 STEP 2: Test Specific Questions
echo.
echo Test these exact questions to verify knowledge base:
echo.
echo Question 1: "What is your return policy?"
echo Expected: Detailed return policy with 30-day information
echo.
echo Question 2: "How long does shipping take?"
echo Expected: Shipping options and timeframes
echo.
echo Question 3: "Do you offer warranty?"
echo Expected: Warranty coverage information
echo.
echo Question 4: "What are your business hours?"
echo Expected: Monday-Friday 9 AM to 6 PM EST (from Q&A database)
echo.
echo Question 5: "Random unrelated question about dinosaurs"
echo Expected: Generic AI response (no knowledge base match)
echo.

echo 📊 STEP 3: Watch Browser Console Logs
echo Press F12 → Console tab and look for:
echo.
echo ✅ GOOD SIGNS:
echo   📚 Setting knowledge base for conversation: [ID]
echo   📚 Knowledge items received: 3
echo   🔍 Searching knowledge base for: [your question]
echo   📚 Knowledge search complete. Results found: 1-3
echo   ✅ Found relevant content with score: [number]
echo   ✅ Adding knowledge base context to OpenAI prompt
echo   ✅ OpenAI response received: [response preview]
echo.
echo ❌ BAD SIGNS:
echo   📚 Knowledge items received: 0
echo   🔍 Knowledge search complete. Results found: 0
echo   ⚠️ No knowledge base found for conversation
echo   ⚠️ No knowledge base results found
echo.

echo 🎯 EXPECTED RESULTS:
echo.
echo WORKING CORRECTLY:
echo   • Questions about returns/shipping/warranty get specific answers
echo   • Bot responses reference company policies
echo   • Console shows knowledge base search activity
echo   • OpenAI receives enhanced prompts with knowledge context
echo.
echo STILL BROKEN:
echo   • All questions get generic/random responses
echo   • No knowledge base search logs
echo   • Bot acts like it has no uploaded content
echo.

echo 📋 WHAT TO REPORT:
echo   1. What you see at /api/debug/knowledge-base URL
echo   2. Exact responses to the test questions above
echo   3. Any console logs that appear (or don't appear)
echo   4. Whether bot uses uploaded content or gives generic answers
echo.

echo 🚀 NOW GO TEST - This will definitively show if knowledge base works!
echo.
pause