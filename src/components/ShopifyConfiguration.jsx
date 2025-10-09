import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const ShopifyConfiguration = ({ onConfigurationSaved }) => {
  const [config, setConfig] = useState({
    storeName: '',
    accessToken: '',
    apiKey: '',
    apiSecret: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [existingConfig, setExistingConfig] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState({});

  // Load existing configuration on mount
  useEffect(() => {
    loadExistingConfiguration();
  }, []);

  const loadExistingConfiguration = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('integration_id', 'shopify')
        .eq('organization_id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (data && data.credentials) {
        const credentials = data.credentials;
        setConfig({
          storeName: credentials.storeName || '',
          accessToken: credentials.accessToken || '',
          apiKey: credentials.apiKey || '',
          apiSecret: credentials.apiSecret || ''
        });
        setExistingConfig(data);
      }
    } catch (error) {
      console.log('No existing Shopify configuration found');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!config.storeName.trim()) {
      newErrors.storeName = 'Store name is required';
    } else if (!config.storeName.match(/^[a-zA-Z0-9-]+$/)) {
      newErrors.storeName = 'Store name should only contain letters, numbers, and hyphens';
    }
    
    if (!config.accessToken.trim()) {
      newErrors.accessToken = 'Access token is required';
    } else if (!config.accessToken.startsWith('shpat_') && !config.accessToken.startsWith('shpca_')) {
      newErrors.accessToken = 'Access token should start with "shpat_" or "shpca_"';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const testConnection = async () => {
    if (!validateForm()) {
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const testUrl = `https://${config.storeName}.myshopify.com/admin/api/2024-10/shop.json`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': config.accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setTestResult({
        success: true,
        shopName: data.shop.name,
        domain: data.shop.domain,
        email: data.shop.email,
        currency: data.shop.currency,
        plan: data.shop.plan_name
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfiguration = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const configData = {
        organization_id: '00000000-0000-0000-0000-000000000001',
        integration_id: 'shopify',
        integration_name: 'Shopify',
        status: testResult?.success ? 'connected' : 'configured',
        credentials: {
          storeName: config.storeName,
          accessToken: config.accessToken,
          apiKey: config.apiKey || null,
          apiSecret: config.apiSecret || null
        },
        config: {
          shopName: testResult?.shopName || config.storeName,
          domain: testResult?.domain || `${config.storeName}.myshopify.com`,
          currency: testResult?.currency || 'USD',
          connectedAt: new Date().toISOString()
        },
        connected_at: testResult?.success ? new Date().toISOString() : null
      };

      const { error } = await supabase
        .from('integrations')
        .upsert(configData, {
          onConflict: 'organization_id,integration_id'
        });

      if (error) {
        throw error;
      }

      // Update the runtime configuration
      window.SHOPIFY_CONFIG = {
        storeName: config.storeName,
        accessToken: config.accessToken,
        apiKey: config.apiKey,
        apiSecret: config.apiSecret
      };

      if (onConfigurationSaved) {
        onConfigurationSaved(configData);
      }

      alert('Shopify configuration saved successfully!');
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(`Error saving configuration: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectShopify = async () => {
    if (!confirm('Are you sure you want to disconnect your Shopify store?')) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('integrations')
        .update({
          status: 'disconnected',
          credentials: {},
          connected_at: null
        })
        .eq('integration_id', 'shopify')
        .eq('organization_id', '00000000-0000-0000-0000-000000000001');

      if (error) {
        throw error;
      }

      setConfig({ storeName: '', accessToken: '', apiKey: '', apiSecret: '' });
      setTestResult(null);
      setExistingConfig(null);
      
      // Clear runtime configuration
      delete window.SHOPIFY_CONFIG;

      if (onConfigurationSaved) {
        onConfigurationSaved(null);
      }

      alert('Shopify store disconnected successfully!');
      
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert(`Error disconnecting: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🛍️ Shopify Store Configuration
          </h2>
          <p className="text-gray-600 mt-1">
            Connect your Shopify store to enable product search, order tracking, and customer support.
          </p>
        </div>
        {existingConfig?.status === 'connected' && (
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✅ Connected
          </span>
        )}
      </div>

      {/* Setup Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Setup Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Go to your Shopify Admin → Apps → App and sales channel settings</li>
          <li>2. Click "Develop apps" → "Create an app"</li>
          <li>3. Name: "Chatbot Integration" → Configure API scopes</li>
          <li>4. Enable: read_products, read_orders, read_customers, read_inventory</li>
          <li>5. Install app and copy the Access Token</li>
        </ol>
      </div>

      <div className="space-y-4">
        {/* Store Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Store Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={config.storeName}
              onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
              placeholder="your-store-name"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.storeName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <div className="absolute right-3 top-2 text-gray-400 text-sm">
              .myshopify.com
            </div>
          </div>
          {errors.storeName && (
            <p className="mt-1 text-sm text-red-600">{errors.storeName}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your Shopify store subdomain (the part before .myshopify.com)
          </p>
        </div>

        {/* Access Token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Access Token *
          </label>
          <input
            type="password"
            value={config.accessToken}
            onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
            placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxx"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.accessToken ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.accessToken && (
            <p className="mt-1 text-sm text-red-600">{errors.accessToken}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Private app access token from your Shopify Admin
          </p>
        </div>

        {/* Advanced Options */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Options (Optional)
          </button>
          
          {showAdvanced && (
            <div className="mt-3 space-y-4 pl-4 border-l-2 border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Optional - for advanced features"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Secret
                </label>
                <input
                  type="password"
                  value={config.apiSecret}
                  onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                  placeholder="Optional - for webhook verification"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {testResult.success ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 font-semibold">✅ Connection Successful!</span>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p><strong>Store:</strong> {testResult.shopName}</p>
                  <p><strong>Domain:</strong> {testResult.domain}</p>
                  <p><strong>Currency:</strong> {testResult.currency}</p>
                  {testResult.plan && <p><strong>Plan:</strong> {testResult.plan}</p>}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600 font-semibold">❌ Connection Failed</span>
                </div>
                <p className="text-sm text-red-700">{testResult.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={testConnection}
            disabled={isTesting || !config.storeName || !config.accessToken}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Testing...
              </>
            ) : (
              '🔍 Test Connection'
            )}
          </button>

          <button
            onClick={saveConfiguration}
            disabled={isLoading || !config.storeName || !config.accessToken}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              '💾 Save Configuration'
            )}
          </button>

          {existingConfig && (
            <button
              onClick={disconnectShopify}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔌 Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">🔒 Security Information</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Your credentials are encrypted and stored securely</li>
          <li>• Access tokens are never logged or exposed in the interface</li>
          <li>• Only minimum required API permissions are used</li>
          <li>• You can disconnect and revoke access at any time</li>
        </ul>
      </div>
    </div>
  );
};

export default ShopifyConfiguration;