import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useOrganizationId } from '../../hooks/useOrganizationId';

const ShopifyIntegration = ({ isOpen, onClose, onConnect }) => {
  const { user } = useAuth();
  const { organizationId, loading: orgLoading, error: orgError } = useOrganizationId();
  const [config, setConfig] = useState({
    storeName: '',
    accessToken: '',
    apiKey: '',
    apiSecret: '',
    enableOrderTracking: true,
    enableProductSearch: true,
    enableCustomerSync: true,
    enableInventoryAlerts: false
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus('testing');
    setErrorMessage('');

    try {
      // ✅ CRITICAL FIX: Validate organization ID before proceeding
      if (!organizationId) {
        throw new Error(orgError || 'Authentication required. Please log out and log back in.');
      }

      // Validate inputs
      if (!config.storeName.trim()) {
        throw new Error('Store name is required');
      }

      if (!config.accessToken.trim()) {
        throw new Error('Access token is required');
      }

      // Validate store name format
      if (!config.storeName.match(/^[a-zA-Z0-9-]+$/)) {
        throw new Error('Invalid store name format. Use only letters, numbers, and hyphens (e.g., "mystore")');
      }

      console.log(`🔌 Connecting to Shopify store: ${config.storeName}`);
      console.log(`🏛️ Using organization ID: ${organizationId}`);

      // Clean store name (remove .myshopify.com if user included it)
      const cleanStoreName = config.storeName.trim().replace('.myshopify.com', '');

      // First verify the connection works
      const verifyResponse = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'shopify_verifyCredentials',
          store_url: cleanStoreName,
          access_token: config.accessToken.trim()
        })
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        throw new Error(verifyData.error || 'Failed to connect to Shopify. Please check your credentials.');
      }

      console.log('✅ Shopify credentials verified:', verifyData.shop);

      // ✅ CRITICAL FIX: Save credentials with validated organization ID (no fallback)
      const saveResponse = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'saveIntegrationCredentials',
          integration: 'shopify',
          organizationId: organizationId, // No fallback - validated above
          credentials: {
            shopDomain: cleanStoreName,
            accessToken: config.accessToken.trim(),
            apiKey: config.apiKey.trim() || null,
            apiSecret: config.apiSecret.trim() || null,
            shopName: verifyData.shop?.name,
            shopEmail: verifyData.shop?.email,
            shopCurrency: verifyData.shop?.currency
          }
        })
      });

      const saveData = await saveResponse.json();

      if (!saveData.success) {
        throw new Error(saveData.error || 'Failed to save Shopify connection');
      }

      setConnectionStatus('success');
      
      console.log('✅ Shopify store connected successfully!');

      // Notify parent component
      setTimeout(() => {
        onConnect(saveData.data);
        onClose();
      }, 1500);

    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error.message);
      console.error('❌ Shopify connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  // Show loading state while organization context is loading
  if (orgLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization context...</p>
        </div>
      </div>
    );
  }

  // Show error state if organization context failed to load
  if (orgError || !organizationId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">
              {orgError || 'Unable to load organization context. Please log out and log back in.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🛍️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Connect Your Shopify Store</h2>
              <p className="text-gray-600">Enter your store details to enable e-commerce features</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Connection Status */}
        {connectionStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            connectionStatus === 'testing' ? 'bg-yellow-50 border border-yellow-200' :
            connectionStatus === 'success' ? 'bg-green-50 border border-green-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'testing' && (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                  <span className="text-yellow-800">Testing connection to Shopify...</span>
                </>
              )}
              {connectionStatus === 'success' && (
                <>
                  <span className="text-green-600">✅</span>
                  <span className="text-green-800">Connected successfully! Your Shopify store is ready.</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <span className="text-red-600">❌</span>
                  <div>
                    <span className="text-red-800 font-semibold">Connection failed</span>
                    {errorMessage && (
                      <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Store Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={config.storeName}
                    onChange={(e) => setConfig({...config, storeName: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="your-store-name"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 text-sm">
                    .myshopify.com
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Enter your Shopify store subdomain (e.g., "your-store")</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin API Access Token <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={config.accessToken}
                  onChange={(e) => setConfig({...config, accessToken: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                  placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
                />
                <p className="text-xs text-gray-500 mt-1">Your Shopify Admin API access token (starts with "shpat_")</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={config.apiKey}
                    onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    placeholder="API Key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Secret <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={config.apiSecret}
                    onChange={(e) => setConfig({...config, apiSecret: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                    placeholder="API Secret"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Enable Features</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Order Tracking</h4>
                  <p className="text-sm text-gray-600">Let customers track orders through chat</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableOrderTracking}
                    onChange={(e) => setConfig({...config, enableOrderTracking: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Product Search</h4>
                  <p className="text-sm text-gray-600">Enable product search in conversations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableProductSearch}
                    onChange={(e) => setConfig({...config, enableProductSearch: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Customer Data Sync</h4>
                  <p className="text-sm text-gray-600">Sync customer data for personalized support</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableCustomerSync}
                    onChange={(e) => setConfig({...config, enableCustomerSync: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Inventory Alerts</h4>
                  <p className="text-sm text-gray-600">Notify about product availability</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableInventoryAlerts}
                    onChange={(e) => setConfig({...config, enableInventoryAlerts: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <span>📚</span> How to Get Your Access Token
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>1.</strong> Go to your Shopify Admin → <strong>Settings</strong></p>
              <p><strong>2.</strong> Click <strong>Apps and sales channels</strong></p>
              <p><strong>3.</strong> Click <strong>Develop apps</strong></p>
              <p><strong>4.</strong> Click <strong>Create an app</strong> and name it "ChatBot Integration"</p>
              <p><strong>5.</strong> Click <strong>Configure Admin API scopes</strong> and select:</p>
              <ul className="ml-6 mt-1 space-y-1">
                <li>• read_orders, write_orders</li>
                <li>• read_customers, write_customers</li>
                <li>• read_products</li>
                <li>• read_inventory</li>
              </ul>
              <p><strong>6.</strong> Click <strong>Install app</strong></p>
              <p><strong>7.</strong> Copy the <strong>Admin API access token</strong> (starts with "shpat_")</p>
              <p className="mt-3 font-semibold">⚠️ Keep your access token secure - never share it publicly!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!config.storeName || !config.accessToken || isConnecting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isConnecting && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
            <span>{isConnecting ? 'Connecting...' : 'Connect Store'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopifyIntegration;
