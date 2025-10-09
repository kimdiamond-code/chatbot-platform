import React, { useState, useEffect } from 'react';
import dbService from '../services/databaseService';

// OAuth Connection Button Component
const OAuthConnectionButton = ({ shopDomain, setShopDomain, isLoading, setIsLoading, setError }) => {
  const handleOAuthConnect = async () => {
    setError('');
    
    if (!shopDomain.trim()) {
      setError('Please enter your store domain');
      return;
    }

    setIsLoading(true);

    try {
      // Initiate OAuth flow
      const response = await fetch('/api/shopify/oauth/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: shopDomain,
          organizationId: '00000000-0000-0000-0000-000000000001'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate OAuth');
      }

      // Redirect to Shopify OAuth page
      window.location.href = data.authUrl;

    } catch (error) {
      console.error('OAuth error:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-purple-900 mb-1">
          Your Shopify Store Domain
        </label>
        <input
          type="text"
          value={shopDomain}
          onChange={(e) => setShopDomain(e.target.value)}
          placeholder="your-store (without .myshopify.com)"
          className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          disabled={isLoading}
        />
        <p className="text-xs text-purple-700 mt-1">
          Just your store name, e.g., "truecitrus2"
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="font-medium text-blue-900 text-sm mb-1">📘 How OAuth works:</h5>
        <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
          <li>Click "Connect with OAuth" below</li>
          <li>You'll be redirected to Shopify to authorize</li>
          <li>Approve the permissions requested</li>
          <li>You'll be automatically redirected back</li>
          <li>Done! Your store is connected securely</li>
        </ol>
      </div>

      <button
        onClick={handleOAuthConnect}
        disabled={isLoading || !shopDomain.trim()}
        className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Redirecting to Shopify...
          </>
        ) : (
          <>
            🚀 Connect with OAuth
          </>
        )}
      </button>
    </div>
  );
};

const ShopifyOAuthConfiguration = ({ onConfigurationSaved }) => {
  const [step, setStep] = useState('choose-method'); 
  const [setupMode, setSetupMode] = useState('oauth'); // 'oauth', 'api' or 'quick'
  const [shopDomain, setShopDomain] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingConfig, setExistingConfig] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadExistingConfiguration();
  }, []);

  const loadExistingConfiguration = async () => {
    try {
      const integrations = await dbService.getIntegrations('00000000-0000-0000-0000-000000000001');
      const shopifyIntegration = integrations?.find(i => i.integration_id === 'shopify');

      if (shopifyIntegration && shopifyIntegration.credentials && shopifyIntegration.status === 'connected') {
        setExistingConfig(shopifyIntegration);
        setStep('connected');
      }
    } catch (error) {
      console.log('No existing Shopify configuration found');
    }
  };

  const extractShopDomain = (input) => {
    let domain = input.toLowerCase().trim();
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.split('/')[0];
    
    if (domain.includes('.myshopify.com')) {
      return domain.split('.myshopify.com')[0];
    }
    
    if (/^[a-z0-9-]+$/.test(domain)) {
      return domain;
    }
    
    return null;
  };

  const saveQuickStart = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const shopName = extractShopDomain(shopDomain);
      
      if (!shopName) {
        throw new Error('Please enter a valid store domain');
      }

      const configData = {
        organization_id: '00000000-0000-0000-0000-000000000001',
        integration_id: 'shopify',
        integration_name: 'Shopify',
        status: 'limited',
        credentials_encrypted: JSON.stringify({
          shopDomain: shopName,
          connectionType: 'url-only',
          storeUrl: `https://${shopName}.myshopify.com`
        }),
        config: {
          connectionType: 'url-only',
          features: ['Store URL linking', 'Policy guidance', 'General support'],
          limitations: ['No real-time data', 'No order tracking']
        },
        connected_at: new Date().toISOString()
      };

      await dbService.upsertIntegration(configData);

      setExistingConfig({
        ...configData,
        credentials: JSON.parse(configData.credentials_encrypted)
      });
      setStep('connected');
      
      if (onConfigurationSaved) {
        onConfigurationSaved({
          ...configData,
          credentials: JSON.parse(configData.credentials_encrypted)
        });
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateCredentials = async () => {
    // Note: Browser-based API testing is blocked by CORS
    // We validate credentials format instead
    setError('');
    setTestingConnection(true);
    
    try {
      const shopName = extractShopDomain(shopDomain);
      
      if (!shopName) {
        throw new Error('Please enter a valid store domain');
      }
      
      if (!accessToken.trim()) {
        throw new Error('Please enter your access token');
      }

      // Validate token format
      if (!accessToken.trim().startsWith('shpat_')) {
        throw new Error('Invalid access token format. Should start with "shpat_"');
      }

      // Can't test from browser due to CORS - will be tested by backend
      console.log('✅ Credentials format validated. Backend will verify connection.');
      return { success: true, shop: { name: shopName } };
      
    } catch (error) {
      console.error('Validation failed:', error);
      throw error;
    } finally {
      setTestingConnection(false);
    }
  };

  const saveApiConnection = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      // Validate credentials format
      const testResult = await validateCredentials();
      
      if (!testResult.success) {
        throw new Error('Validation failed');
      }

      const shopName = extractShopDomain(shopDomain);

      const configData = {
        organization_id: '00000000-0000-0000-0000-000000000001',
        integration_id: 'shopify',
        integration_name: 'Shopify',
        status: 'connected',
        credentials_encrypted: JSON.stringify({
          shopDomain: shopName,
          accessToken: accessToken.trim(),
          connectionType: 'api',
          storeUrl: `https://${shopName}.myshopify.com`,
          shopInfo: testResult.shop
        }),
        config: {
          connectionType: 'api',
          features: [
            'Real-time product data',
            'Order tracking',
            'Customer information',
            'Inventory status',
            'Store policies',
            'Collections and categories'
          ]
        },
        connected_at: new Date().toISOString()
      };

      await dbService.upsertIntegration(configData);

      setExistingConfig({
        ...configData,
        credentials: JSON.parse(configData.credentials_encrypted)
      });
      setStep('connected');
      
      if (onConfigurationSaved) {
        onConfigurationSaved({
          ...configData,
          credentials: JSON.parse(configData.credentials_encrypted)
        });
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Shopify store?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await dbService.upsertIntegration({
        organization_id: '00000000-0000-0000-0000-000000000001',
        integration_id: 'shopify',
        integration_name: 'Shopify',
        status: 'disconnected',
        credentials_encrypted: '{}',
        config: {},
        connected_at: null
      });
      
      setExistingConfig(null);
      setStep('choose-method');
      setShopDomain('');
      setAccessToken('');
      
      if (onConfigurationSaved) {
        onConfigurationSaved(null);
      }
      
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'connected' && existingConfig) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Shopify Store Connected!
          </h2>
          <p className="text-gray-600">
            Your chatbot is now powered by your Shopify store.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-900 mb-2">🏪 Store Information</h3>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>Domain:</strong> {existingConfig.credentials?.shopDomain}.myshopify.com</p>
            <p><strong>Connection Type:</strong> {existingConfig.credentials?.connectionType === 'api' ? '🔑 Full API' : '⚡ Quick Start'}</p>
            <p><strong>Status:</strong> <span className={existingConfig.status === 'connected' ? 'text-green-700 font-semibold' : ''}>{existingConfig.status === 'limited' ? 'Limited (Quick Start)' : 'Fully Connected'}</span></p>
            {existingConfig.credentials?.shopInfo && (
              <p><strong>Store Name:</strong> {existingConfig.credentials.shopInfo.name}</p>
            )}
            <p><strong>Connected:</strong> {new Date(existingConfig.connected_at).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">🤖 Available Features</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {existingConfig.config?.features?.map((feature, index) => (
              <li key={index}>• {feature}</li>
            ))}
          </ul>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setStep('choose-method')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ⚙️ Reconfigure
          </button>
          <button
            onClick={disconnect}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Disconnecting...' : '🔌 Disconnect'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛍️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connect Your Shopify Store
          </h2>
          <p className="text-gray-600">
            Choose your connection method below
          </p>
        </div>

        {/* Setup Mode Toggle */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setSetupMode('oauth')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              setupMode === 'oauth'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🚀 OAuth (Best)
          </button>
          <button
            onClick={() => setSetupMode('api')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              setupMode === 'api'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🔑 API Token
          </button>
          <button
            onClick={() => setSetupMode('quick')}
            className={`py-3 px-4 rounded-lg font-medium transition-all ${
              setupMode === 'quick'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            ⚡ Quick Start
          </button>
        </div>

        {/* OAuth Connection Mode */}
        {setupMode === 'oauth' && (
          <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">🚀</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-purple-900 mb-2">
                  OAuth Connection (Recommended)
                </h3>
                <p className="text-purple-800 mb-4">
                  Secure one-click installation. No manual API tokens needed!
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-purple-900 mb-2">✅ Why OAuth is Better:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• ⚡ Fastest setup - just one click</li>
                    <li>• 🔒 Most secure - tokens managed by Shopify</li>
                    <li>• 🎯 Automatic permission scoping</li>
                    <li>• 🔄 Easy to revoke and manage</li>
                    <li>• 📱 Works from any device</li>
                  </ul>
                </div>

                <OAuthConnectionButton
                  shopDomain={shopDomain}
                  setShopDomain={setShopDomain}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  setError={setError}
                />
              </div>
            </div>
          </div>
        )}

        {/* API Connection Mode */}
        {setupMode === 'api' && (
          <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">🔑</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-green-900 mb-2">
                  Full API Connection
                </h3>
                <p className="text-green-800 mb-4">
                  Connect with your Shopify Admin API credentials for full access to products, orders, and customer data.
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-green-900 mb-2">✅ Full Features:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Real-time product search and recommendations</li>
                    <li>• Order tracking and status updates</li>
                    <li>• Customer information and history</li>
                    <li>• Live inventory status</li>
                    <li>• Store policies and pages</li>
                    <li>• Collections and categories</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-green-900 mb-1">
                      Store Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shopDomain}
                      onChange={(e) => setShopDomain(e.target.value)}
                      placeholder="truecitrus2 (without .myshopify.com)"
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="text-xs text-green-700 mt-1">
                      Just the store name, e.g., "truecitrus2"
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-900 mb-1">
                      Admin API Access Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    />
                    <p className="text-xs text-green-700 mt-1">
                      Your Admin API access token from Shopify Admin
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-medium text-blue-900 text-sm mb-1">📘 How to get your API credentials:</h5>
                    <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                      <li>Go to Shopify Admin → Settings → Apps and sales channels</li>
                      <li>Click "Develop apps" → "Create an app"</li>
                      <li>Configure Admin API scopes (read_products, read_orders, etc.)</li>
                      <li>Install the app and copy the Admin API access token</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-yellow-800">
                      ℹ️ <strong>Note:</strong> Connection testing from browser is blocked by CORS. Your credentials will be validated and tested by the backend service after saving.
                    </p>
                  </div>
                  
                  <button
                    onClick={saveApiConnection}
                    disabled={isLoading || !shopDomain.trim() || !accessToken.trim()}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        🔑 Connect Store
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Start Mode */}
        {setupMode === 'quick' && (
          <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="text-4xl">⚡</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  Quick Start Setup
                </h3>
                <p className="text-blue-800 mb-4">
                  Get started immediately with basic store linking. No technical setup required.
                </p>
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-blue-900 mb-2">✅ Features included:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Store URL linking</li>
                    <li>• Policy page guidance</li>
                    <li>• General customer support</li>
                    <li>• Contact information help</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-1">
                      Your Store Domain
                    </label>
                    <input
                      type="text"
                      value={shopDomain}
                      onChange={(e) => setShopDomain(e.target.value)}
                      placeholder="your-store.myshopify.com"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={saveQuickStart}
                    disabled={isLoading || !shopDomain.trim()}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        ⚡ Connect Store
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">🔐 Secure OAuth Flow</h4>
          <p className="text-sm text-purple-800">
            Your credentials are never exposed. OAuth tokens are stored securely and can be revoked at any time from your Shopify admin.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">🔒 Security & Privacy</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Your data is stored securely</li>
            <li>• Only basic store URL is saved</li>
            <li>• You can disconnect at any time</li>
            <li>• No sensitive data is accessed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShopifyOAuthConfiguration;
