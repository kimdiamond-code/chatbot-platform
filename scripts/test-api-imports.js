// Simple test to verify API system works
console.log('🧪 Testing API Routes Import...');

try {
  // Test imports
  import('./src/services/botConfigService.js')
    .then(() => console.log('✅ botConfigService.js imports OK'))
    .catch(err => console.error('❌ botConfigService.js import failed:', err));

  import('./src/services/openaiService.js')
    .then(() => console.log('✅ openaiService.js imports OK'))
    .catch(err => console.error('❌ openaiService.js import failed:', err));

  import('./src/services/knowledgeBaseService.js')
    .then(() => console.log('✅ knowledgeBaseService.js imports OK'))
    .catch(err => console.error('❌ knowledgeBaseService.js import failed:', err));

  import('./src/services/operatingHoursService.js')
    .then(() => console.log('✅ operatingHoursService.js imports OK'))
    .catch(err => console.error('❌ operatingHoursService.js import failed:', err));

  // Test main API routes
  import('./src/services/apiRoutes.js')
    .then((module) => {
      console.log('✅ apiRoutes.js imports OK');
      console.log('🔍 Available exports:', Object.keys(module));
      
      if (module.handleApiRequest) {
        console.log('✅ handleApiRequest function found');
        
        // Test the function
        module.handleApiRequest('GET', '/api/health')
          .then(result => {
            console.log('✅ API test successful:', result);
          })
          .catch(err => {
            console.error('❌ API test failed:', err);
          });
      } else {
        console.error('❌ handleApiRequest function not found in exports');
      }
    })
    .catch(err => {
      console.error('❌ apiRoutes.js import failed:', err);
      console.error('Full error:', err.stack);
    });

} catch (error) {
  console.error('❌ Test script error:', error);
}

export const testComplete = true;