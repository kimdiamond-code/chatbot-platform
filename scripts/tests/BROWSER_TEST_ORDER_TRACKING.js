// IMMEDIATE TEST: Copy and paste this into your browser console
// This will test the new order tracking response behavior

async function testOrderTrackingFix() {
  console.log('🧪 Testing Order Tracking Fix...');
  console.log('=====================================');
  
  try {
    // Test the chatbot service directly
    const testMessages = [
      "I want to track my order #12345",
      "Where is my order?", 
      "Can you look up my order status?",
      "My package hasn't arrived",
      "I need to check on order #67890"
    ];
    
    console.log('📝 Testing ' + testMessages.length + ' order tracking messages...');
    
    for (let i = 0; i < testMessages.length; i++) {
      const message = testMessages[i];
      console.log(`\n🧪 Test ${i+1}: "${message}"`);
      
      try {
        // Import the chatbot service
        const { chatBotService } = await import('./src/services/openaiService.js');
        
        // Generate response
        const response = await chatBotService.generateResponse(message, 'test-tracking-fix');
        
        console.log('🤖 Bot Response:', response.response);
        console.log('📊 Response Info:', {
          source: response.source,
          confidence: response.confidence,
          shouldEscalate: response.shouldEscalate
        });
        
        // Check if response contains problematic promises
        const responseText = response.response.toLowerCase();
        const badPhrases = [
          'let me check',
          'i\'ll look it up',
          'i\'ll get back to you',
          'please give me a moment',
          'let me search',
          'i\'ll find that'
        ];
        
        const foundBadPhrases = badPhrases.filter(phrase => responseText.includes(phrase));
        
        if (foundBadPhrases.length > 0) {
          console.log('❌ WARNING: Response still contains problematic promises:', foundBadPhrases);
        } else {
          console.log('✅ GOOD: No false promises detected in response');
        }
        
        // Check for helpful alternatives
        const goodPhrases = [
          'connect you with',
          'specialist',
          'i can guide you',
          'alternative',
          'help you track',
          'show you how'
        ];
        
        const foundGoodPhrases = goodPhrases.filter(phrase => responseText.includes(phrase));
        
        if (foundGoodPhrases.length > 0) {
          console.log('✅ GREAT: Response offers helpful alternatives:', foundGoodPhrases);
        } else {
          console.log('⚠️ NOTE: Could offer more specific alternatives');
        }
        
      } catch (error) {
        console.log('❌ Test failed:', error.message);
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎯 TEST SUMMARY:');
    console.log('================');
    console.log('✅ If responses offer "connect with specialist" or similar = FIXED');
    console.log('❌ If responses say "let me check" without follow-up = STILL BROKEN');
    console.log('\n💡 The fix prevents the bot from making promises it cannot keep!');
    
  } catch (error) {
    console.log('❌ Test setup failed:', error.message);
    console.log('💡 Make sure your app is running and try refreshing the page');
  }
}

// Run the test
testOrderTrackingFix();