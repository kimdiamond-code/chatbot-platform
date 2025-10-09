// Add this test endpoint to your apiRoutes.js
// Simple OpenAI test endpoint

'GET /test-openai': async (req, res) => {
  try {
    console.log('🧪 Testing OpenAI integration...');
    
    // Import OpenAI 
    const OpenAI = (await import('openai')).default;
    
    // Get API key
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    console.log('API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length,
      format: apiKey?.startsWith('sk-proj-') ? 'Valid' : 'Invalid'
    });
    
    if (!apiKey) {
      return {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: { 
          success: false, 
          error: 'No API key found',
          debug: 'VITE_OPENAI_API_KEY not set'
        }
      };
    }
    
    // Create client
    const openai = new OpenAI({ apiKey });
    
    // Make test call
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Respond with exactly: "OpenAI is working correctly!"' },
        { role: 'user', content: 'test' }
      ],
      max_tokens: 20,
      temperature: 0
    });
    
    const result = response.choices[0].message.content;
    
    return {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: { 
        success: true, 
        message: result,
        debug: 'OpenAI API working correctly'
      }
    };
    
  } catch (error) {
    console.error('OpenAI test failed:', error);
    return {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: { 
        success: false, 
        error: error.message,
        debug: error.code || 'Unknown error'
      }
    };
  }
},
