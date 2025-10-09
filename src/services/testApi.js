// Simple test API to verify the middleware works
export const handleApiRequest = async (method, url, body = null, query = {}) => {
  console.log('🧪 Test API called:', method, url);
  
  if (method === 'GET' && url === '/api/simple-test') {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: {
        success: true,
        message: 'Simple test API works!',
        timestamp: new Date().toISOString(),
        method: method,
        url: url
      }
    };
  }
  
  if (method === 'GET' && url === '/api/test-fix') {
    return {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: {
        success: true,
        message: 'Test fix endpoint works!',
        timestamp: new Date().toISOString()
      }
    };
  }
  
  return {
    status: 404,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: { 
      error: 'Test endpoint not found',
      availableEndpoints: ['/api/simple-test', '/api/test-fix'],
      requestedUrl: url,
      method: method
    }
  };
};
