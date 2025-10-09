import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ShopifyDiagnostic = () => {
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnosticResults = {
      shopifyConnection: { status: 'testing', message: 'Checking...' },
      productSearch: { status: 'testing', message: 'Checking...' },
      intentDetection: { status: 'testing', message: 'Checking...' },
      integration: { status: 'testing', message: 'Checking...' }
    };
    setResults({ ...diagnosticResults });

    // Test 1: Shopify Connection
    try {
      const { shopifyService } = await import('../../services/integrations/shopifyService');
      
      if (!shopifyService.accessToken) {
        diagnosticResults.shopifyConnection = {
          status: 'error',
          message: 'No access token found. Please configure Shopify in Settings → Integrations'
        };
      } else {
        diagnosticResults.shopifyConnection = {
          status: 'success',
          message: `Connected to: ${shopifyService.storeName}.myshopify.com`
        };
      }
    } catch (error) {
      diagnosticResults.shopifyConnection = {
        status: 'error',
        message: `Error: ${error.message}`
      };
    }
    setResults({ ...diagnosticResults });

    // Test 2: Product Search
    try {
      const { shopifyService } = await import('../../services/integrations/shopifyService');
      const products = await shopifyService.searchProducts('headphone', 3);
      
      if (products && products.length > 0) {
        diagnosticResults.productSearch = {
          status: 'success',
          message: `Found ${products.length} products. First product: ${products[0].title}`
        };
      } else {
        diagnosticResults.productSearch = {
          status: 'warning',
          message: 'Product search works but returned 0 results. Try different search term or add products to Shopify.'
        };
      }
    } catch (error) {
      diagnosticResults.productSearch = {
        status: 'error',
        message: `Error: ${error.message}`
      };
    }
    setResults({ ...diagnosticResults });

    // Test 3: Intent Detection
    try {
      const { chatIntelligenceService } = await import('../../services/chat/chatIntelligence');
      const analysis = chatIntelligenceService.analyzeMessage('I need some good headphones');
      
      if (analysis.intents.includes('productSearch')) {
        diagnosticResults.intentDetection = {
          status: 'success',
          message: `Intent detected correctly. Detected intents: ${analysis.intents.join(', ')}`
        };
      } else {
        diagnosticResults.intentDetection = {
          status: 'warning',
          message: `Intent detection working but didn't detect productSearch. Detected: ${analysis.intents.join(', ') || 'none'}`
        };
      }
    } catch (error) {
      diagnosticResults.intentDetection = {
        status: 'error',
        message: `Error: ${error.message}`
      };
    }
    setResults({ ...diagnosticResults });

    // Test 4: Integration Orchestrator
    try {
      const { integrationOrchestrator } = await import('../../services/chat/integrationOrchestrator');
      const status = integrationOrchestrator.getIntegrationStatus();
      
      if (status.shopify.connected) {
        diagnosticResults.integration = {
          status: 'success',
          message: 'Integration orchestrator has Shopify connected'
        };
      } else {
        diagnosticResults.integration = {
          status: 'warning',
          message: 'Integration orchestrator shows Shopify as disconnected. Try reconnecting in Settings.'
        };
      }
    } catch (error) {
      diagnosticResults.integration = {
        status: 'error',
        message: `Error: ${error.message}`
      };
    }
    
    setResults({ ...diagnosticResults });
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Shopify Product Integration Diagnostic
        </h2>
        
        <p className="text-gray-600 mb-6">
          This tool will test your Shopify product integration to identify any issues.
        </p>

        <button
          onClick={runDiagnostics}
          disabled={testing}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mb-6"
        >
          <Play className="w-5 h-5" />
          <span>{testing ? 'Running Tests...' : 'Run Diagnostics'}</span>
        </button>

        {results && (
          <div className="space-y-4">
            {/* Shopify Connection */}
            <div className={`p-4 rounded-lg border ${getStatusColor(results.shopifyConnection.status)}`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(results.shopifyConnection.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    1. Shopify Connection
                  </h3>
                  <p className="text-sm text-gray-700">
                    {results.shopifyConnection.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Search */}
            <div className={`p-4 rounded-lg border ${getStatusColor(results.productSearch.status)}`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(results.productSearch.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    2. Product Search API
                  </h3>
                  <p className="text-sm text-gray-700">
                    {results.productSearch.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Intent Detection */}
            <div className={`p-4 rounded-lg border ${getStatusColor(results.intentDetection.status)}`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(results.intentDetection.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    3. Intent Detection
                  </h3>
                  <p className="text-sm text-gray-700">
                    {results.intentDetection.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Integration Orchestrator */}
            <div className={`p-4 rounded-lg border ${getStatusColor(results.integration.status)}`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(results.integration.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    4. Integration Orchestrator
                  </h3>
                  <p className="text-sm text-gray-700">
                    {results.integration.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary and Actions */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {results.shopifyConnection.status === 'error' && (
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Go to <strong>Settings → Integrations</strong> and connect your Shopify store</span>
                  </li>
                )}
                {results.productSearch.status === 'warning' && (
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Add products to your Shopify store or check product status (should be "active")</span>
                  </li>
                )}
                {results.integration.status === 'warning' && (
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Try reconnecting Shopify in Settings, or reload the page</span>
                  </li>
                )}
                {Object.values(results).every(r => r.status === 'success') && (
                  <li className="flex items-start text-green-700">
                    <span className="mr-2">✓</span>
                    <span><strong>All systems operational!</strong> Go to Live Chat and try: "I need some good headphones"</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Test Commands */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Test Commands for Chat:</h3>
              <div className="space-y-1 text-sm font-mono text-gray-700">
                <div>"looking for headphones"</div>
                <div>"show me speakers"</div>
                <div>"I need some wireless earbuds"</div>
                <div>"recommend some products"</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopifyDiagnostic;
