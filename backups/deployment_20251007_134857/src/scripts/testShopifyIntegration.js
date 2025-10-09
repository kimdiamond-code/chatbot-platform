// Shopify Integration Test Script
// Run this in the browser console to test the True Citrus Shopify integration

class ShopifyIntegrationTester {
  constructor() {
    this.results = [];
    this.shopifyService = null;
  }

  log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, data };
    this.results.push(logEntry);
    console.log(`🧪 [${timestamp}] ${message}`, data || '');
  }

  async runAllTests() {
    console.log('🚀 Starting True Citrus Shopify Integration Tests...');
    this.results = [];

    await this.testServiceImport();
    await this.testEnvironmentVariables();
    await this.testConnectionStatus();
    await this.testProductSearch();
    await this.testVeganQuestions();
    await this.testOrderTracking();
    await this.testIngredientQuestions();
    await this.testChatbotIntegration();

    this.displayResults();
    return this.results;
  }

  async testServiceImport() {
    try {
      this.log('Testing service import...');
      const module = await import('./src/services/integrations/trueCitrusShopifyService.js');
      this.shopifyService = module.trueCitrusShopifyService;
      
      if (this.shopifyService) {
        this.log('✅ Service imported successfully', {
          hasService: true,
          isConnected: this.shopifyService.isConnected()
        });
      } else {
        this.log('❌ Service import failed - no service found');
      }
    } catch (error) {
      this.log('❌ Service import failed', { error: error.message });
    }
  }

  async testEnvironmentVariables() {
    this.log('Testing environment variables...');
    
    const envVars = {
      VITE_SHOPIFY_STORE_NAME: import.meta.env.VITE_SHOPIFY_STORE_NAME,
      VITE_SHOPIFY_ACCESS_TOKEN: import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
      VITE_SHOPIFY_API_KEY: import.meta.env.VITE_SHOPIFY_API_KEY,
      VITE_SHOPIFY_API_SECRET: import.meta.env.VITE_SHOPIFY_API_SECRET
    };

    const results = {
      hasStoreName: !!envVars.VITE_SHOPIFY_STORE_NAME,
      hasAccessToken: !!envVars.VITE_SHOPIFY_ACCESS_TOKEN,
      hasApiKey: !!envVars.VITE_SHOPIFY_API_KEY,
      hasApiSecret: !!envVars.VITE_SHOPIFY_API_SECRET,
      storeNameValue: envVars.VITE_SHOPIFY_STORE_NAME,
      tokenFormat: envVars.VITE_SHOPIFY_ACCESS_TOKEN?.substring(0, 10) + '...'
    };

    if (results.hasStoreName && results.hasAccessToken) {
      this.log('✅ Environment variables configured', results);
    } else {
      this.log('⚠️ Missing environment variables', results);
    }
  }

  async testConnectionStatus() {
    if (!this.shopifyService) {
      this.log('❌ Cannot test connection - service not available');
      return;
    }

    try {
      this.log('Testing Shopify API connection...');
      const result = await this.shopifyService.testConnection();
      
      if (result.success) {
        this.log('✅ Shopify connection successful', result);
      } else {
        this.log('⚠️ Shopify connection failed', result);
      }
    } catch (error) {
      this.log('❌ Connection test error', { error: error.message });
    }
  }

  async testProductSearch() {
    if (!this.shopifyService || !this.shopifyService.isConnected()) {
      this.log('⏭️ Skipping product search test - not connected');
      return;
    }

    try {
      this.log('Testing product search...');
      
      const searchTerms = ['lemon', 'crystal light', 'citrus'];
      
      for (const term of searchTerms) {
        try {
          const products = await this.shopifyService.searchProducts(term, 3);
          this.log(`✅ Product search for "${term}"`, {
            term,
            resultsCount: products.length,
            products: products.map(p => ({
              title: p.title,
              category: p.trueCitrusCategory?.name,
              benefits: p.benefits
            }))
          });
        } catch (error) {
          this.log(`❌ Product search failed for "${term}"`, { error: error.message });
        }
      }
    } catch (error) {
      this.log('❌ Product search test error', { error: error.message });
    }
  }

  async testVeganQuestions() {
    if (!this.shopifyService) {
      this.log('⏭️ Skipping vegan questions test - service not available');
      return;
    }

    try {
      this.log('Testing vegan question responses...');
      
      const veganQuestions = [
        'Are your products vegan?',
        'Do you have any animal products?',
        'Is Crystal Light vegan-friendly?'
      ];

      for (const question of veganQuestions) {
        try {
          const response = await this.shopifyService.handleCustomerInquiry(question);
          
          if (response && response.type === 'product_info') {
            this.log(`✅ Vegan question handled: "${question}"`, {
              type: response.type,
              category: response.category,
              confidence: response.confidence,
              responseLength: response.response.length
            });
          } else {
            this.log(`⚠️ Vegan question not recognized: "${question}"`, response);
          }
        } catch (error) {
          this.log(`❌ Vegan question error: "${question}"`, { error: error.message });
        }
      }
    } catch (error) {
      this.log('❌ Vegan questions test error', { error: error.message });
    }
  }

  async testOrderTracking() {
    if (!this.shopifyService || !this.shopifyService.isConnected()) {
      this.log('⏭️ Skipping order tracking test - not connected');
      return;
    }

    try {
      this.log('Testing order tracking functionality...');
      
      const orderQuestions = [
        'Track my order',
        'Where is my shipment?',
        'Order status update'
      ];

      for (const question of orderQuestions) {
        try {
          const response = await this.shopifyService.handleCustomerInquiry(question);
          
          this.log(`✅ Order question processed: "${question}"`, {
            type: response?.type,
            hasResponse: !!response?.response,
            responseLength: response?.response?.length || 0
          });
        } catch (error) {
          this.log(`❌ Order question error: "${question}"`, { error: error.message });
        }
      }
    } catch (error) {
      this.log('❌ Order tracking test error', { error: error.message });
    }
  }

  async testIngredientQuestions() {
    if (!this.shopifyService) {
      this.log('⏭️ Skipping ingredient questions test - service not available');
      return;
    }

    try {
      this.log('Testing ingredient question responses...');
      
      const ingredientQuestions = [
        'What ingredients are in True Orange?',
        'Are there any allergens in your products?',
        'What\'s in Crystal Light packets?'
      ];

      for (const question of ingredientQuestions) {
        try {
          const response = await this.shopifyService.handleCustomerInquiry(question);
          
          this.log(`✅ Ingredient question processed: "${question}"`, {
            type: response?.type,
            hasResponse: !!response?.response,
            responseLength: response?.response?.length || 0
          });
        } catch (error) {
          this.log(`❌ Ingredient question error: "${question}"`, { error: error.message });
        }
      }
    } catch (error) {
      this.log('❌ Ingredient questions test error', { error: error.message });
    }
  }

  async testChatbotIntegration() {
    try {
      this.log('Testing chatbot service integration...');
      
      // Import the main chatbot service
      const chatBotModule = await import('./src/services/openaiService.js');
      const chatBotService = chatBotModule.chatBotService;

      if (chatBotService) {
        // Test a vegan question through the chatbot
        const testMessage = 'Are your products vegan?';
        const conversationId = 'test-shopify-integration';
        
        try {
          const response = await chatBotService.generateResponse(testMessage, conversationId);
          
          this.log('✅ Chatbot integration test', {
            message: testMessage,
            source: response.source,
            hasResponse: !!response.response,
            confidence: response.confidence,
            isShopifyResponse: response.source === 'shopify'
          });
        } catch (error) {
          this.log('❌ Chatbot integration error', { error: error.message });
        }
      } else {
        this.log('❌ Could not import chatbot service');
      }
    } catch (error) {
      this.log('❌ Chatbot integration test error', { error: error.message });
    }
  }

  displayResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('==========================');
    
    const passedTests = this.results.filter(r => r.message.startsWith('✅')).length;
    const failedTests = this.results.filter(r => r.message.startsWith('❌')).length;
    const warningTests = this.results.filter(r => r.message.startsWith('⚠️')).length;
    const skippedTests = this.results.filter(r => r.message.startsWith('⏭️')).length;
    
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⚠️ Warnings: ${warningTests}`);
    console.log(`⏭️ Skipped: ${skippedTests}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    if (failedTests === 0 && passedTests > 0) {
      console.log('\n🎉 All tests passed! Shopify integration is working correctly.');
    } else if (failedTests > 0) {
      console.log('\n⚠️ Some tests failed. Check the detailed results above.');
    } else {
      console.log('\n❓ Tests completed but may need review.');
    }
    
    // Show specific recommendations
    if (this.results.find(r => r.message.includes('Missing environment variables'))) {
      console.log('\n💡 Next Steps:');
      console.log('1. Configure Shopify credentials in .env file');
      console.log('2. Get access token from Shopify Admin');
      console.log('3. Restart development server');
      console.log('4. Run tests again');
    }
  }

  // Export results for further analysis
  exportResults() {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.message.startsWith('✅')).length,
        failed: this.results.filter(r => r.message.startsWith('❌')).length,
        warnings: this.results.filter(r => r.message.startsWith('⚠️')).length,
        skipped: this.results.filter(r => r.message.startsWith('⏭️')).length
      },
      details: this.results
    };
  }
}

// Make tester available globally for easy use
window.testShopifyIntegration = () => {
  const tester = new ShopifyIntegrationTester();
  return tester.runAllTests();
};

// Auto-run basic test if called directly
if (typeof window !== 'undefined') {
  console.log('🧪 Shopify Integration Tester Loaded');
  console.log('📋 Run: testShopifyIntegration() to start tests');
}

export default ShopifyIntegrationTester;