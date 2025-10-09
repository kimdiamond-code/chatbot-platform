// 🧪 OpenAI API Key Test Utility
// Use this to verify your API key is working

export const testOpenAIKey = async () => {
  console.log('🧪 Testing OpenAI API Key...');
  
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  console.log('🔍 API Key Status:', {
    exists: !!apiKey,
    length: apiKey?.length || 0,
    prefix: apiKey?.substring(0, 7) || 'none',
    isDemoMode: apiKey === 'demo-mode',
    isPlaceholder: apiKey?.includes('your-') || false
  });
  
  if (!apiKey || apiKey === 'demo-mode' || apiKey.includes('your-')) {
    return {
      success: false,
      mode: 'demo',
      message: '🎮 Demo Mode Active - No OpenAI API key configured',
      instructions: [
        '1. Get API key from: https://platform.openai.com/api-keys',
        '2. Replace VITE_OPENAI_API_KEY=demo-mode in .env file',
        '3. Use format: VITE_OPENAI_API_KEY=sk-proj-your-key-here',
        '4. Restart server: npm run dev'
      ]
    };
  }
  
  if (!apiKey.startsWith('sk-')) {
    return {
      success: false,
      mode: 'error',
      message: '❌ Invalid API key format',
      details: 'OpenAI API keys should start with "sk-"',
      currentFormat: apiKey.substring(0, 10) + '...'
    };
  }
  
  // Test the API key with a simple request
  try {
    // Browser compatibility - OpenAI should be used server-side only
    console.log('⚠️ OpenAI API testing should be done server-side');
    return {
      success: false,
      mode: 'browser_limitation',
      message: '🌐 Browser Testing Limited',
      details: 'OpenAI API calls should be made from server-side for security',
      instructions: [
        'Use the chat interface to test OpenAI integration',
        'Check server logs for API call results',
        'API key validation happens server-side for security'
      ]
    };
    // Note: Actual API testing happens server-side
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    
    let errorMessage = 'API test failed';
    let instructions = [];
    
    if (error.status === 401) {
      errorMessage = '🔐 Invalid API key';
      instructions = [
        'Your API key is not valid or has been revoked',
        'Generate a new key at: https://platform.openai.com/api-keys',
        'Replace the key in your .env file'
      ];
    } else if (error.status === 429) {
      errorMessage = '💰 Rate limit or quota exceeded';
      instructions = [
        'Your API key has hit rate limits or ran out of credits',
        'Check your usage at: https://platform.openai.com/usage',
        'Add billing info if needed: https://platform.openai.com/account/billing'
      ];
    } else if (error.code === 'insufficient_quota') {
      errorMessage = '💳 No credits remaining';
      instructions = [
        'Your OpenAI account has no remaining credits',
        'Add payment method: https://platform.openai.com/account/billing',
        'Or use demo mode until you add credits'
      ];
    }
    
    return {
      success: false,
      mode: 'error',
      message: errorMessage,
      error: error.message,
      status: error.status,
      instructions
    };
  }
};

// Quick test function you can run in console
export const quickTest = async () => {
  const result = await testOpenAIKey();
  console.log('🧪 OpenAI Test Result:', result);
  return result;
};

export default { testOpenAIKey, quickTest };