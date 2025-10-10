import React, { useState, useEffect } from 'react';
import emailMarketingService from '../../services/integrations/emailMarketingService';

const KlaviyoIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    apiKey: ''
  });
  const [testResult, setTestResult] = useState(null);
  const [lists, setLists] = useState([]);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const saved = localStorage.getItem('klaviyo_config');
    if (saved) {
      const savedConfig = JSON.parse(saved);
      setConfig(savedConfig);
      setIsConnected(savedConfig.status === 'connected');
      
      if (savedConfig.status === 'connected') {
        loadLists();
      }
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    if (!config.apiKey) {
      setTestResult({
        success: false,
        message: 'Please enter an API Key'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Save config temporarily for testing
      localStorage.setItem('klaviyo_config', JSON.stringify({
        ...config,
        status: 'connected'
      }));

      // Reload service to use new config
      const testService = new emailMarketingService.constructor();
      const result = await testService.testKlaviyoConnection();

      setTestResult({
        success: true,
        message: result.message,
        accountName: result.account?.attributes?.contact_information?.organization_name
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error.message}`
      });
      
      // Remove temporary config
      localStorage.removeItem('klaviyo_config');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLists = async () => {
    try {
      const lists = await emailMarketingService.klaviyoGetLists();
      setLists(lists);
    } catch (error) {
      console.error('Failed to load lists:', error);
    }
  };

  const saveConfig = async () => {
    if (!config.apiKey) {
      alert('Please enter an API Key');
      return;
    }

    const configToSave = {
      ...config,
      status: 'connected',
      connectedAt: new Date().toISOString()
    };

    localStorage.setItem('klaviyo_config', JSON.stringify(configToSave));
    setIsConnected(true);
    
    // Load lists after connecting
    await loadLists();
    
    alert('Klaviyo configuration saved successfully!');
  };

  const disconnect = () => {
    if (confirm('Are you sure you want to disconnect Klaviyo?')) {
      localStorage.removeItem('klaviyo_config');
      setIsConnected(false);
      setConfig({ apiKey: '' });
      setTestResult(null);
      setLists([]);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-violet-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">📧</div>
            <div>
              <h2 className="text-2xl font-bold">Klaviyo</h2>
              <p className="text-purple-100">Email marketing automation and customer segmentation</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-400 text-green-900' 
              : 'bg-purple-400 text-purple-900'
          }`}>
            {isConnected ? '✅ Connected' : '⚪ Disconnected'}
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {testResult && (
        <div className={`p-4 rounded-lg border ${
          testResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`font-medium ${
            testResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.success ? '✅' : '❌'} {testResult.message}
          </p>
          {testResult.accountName && (
            <p className="text-sm text-green-700 mt-1">
              Account: {testResult.accountName}
            </p>
          )}
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
          <p className="text-sm text-gray-600 mt-1">
            Set up your Klaviyo integration
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Private API Key *
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              placeholder="Enter your Klaviyo Private API Key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from Klaviyo → Settings → API Keys → Create Private API Key
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-xl">⚠️</div>
              <div>
                <h4 className="font-medium text-yellow-900">Important</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Make sure to use a <strong>Private API Key</strong>, not a Public API Key. 
                  Private keys have the required permissions for server-side operations.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={testConnection}
            disabled={isLoading || !config.apiKey}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={saveConfig}
            disabled={isLoading || !config.apiKey}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save Configuration
          </button>
          {isConnected && (
            <button
              onClick={disconnect}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Lists */}
      {isConnected && lists.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Lists</h3>
            <p className="text-sm text-gray-600 mt-1">
              {lists.length} list{lists.length !== 1 ? 's' : ''} available
            </p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {lists.map((list) => (
                <div key={list.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">{list.attributes.name}</h4>
                    <p className="text-sm text-gray-600">
                      ID: {list.id}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {list.attributes.profile_count || 0} profiles
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Features</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '📧', title: 'Email Campaigns', desc: 'Automated email sequences' },
              { icon: '👥', title: 'Segmentation', desc: 'Target specific customer groups' },
              { icon: '📊', title: 'Analytics', desc: 'Track email performance' },
              { icon: '🤖', title: 'Automation', desc: 'Trigger-based workflows' },
              { icon: '🎯', title: 'Event Tracking', desc: 'Monitor customer actions' },
              { icon: '💬', title: 'Chatbot Sync', desc: 'Sync chat interactions' }
            ].map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{feature.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Chat Integration Use Cases</h3>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {[
              {
                title: 'Newsletter Subscriptions',
                desc: 'Automatically add chat users to your email lists when they opt-in'
              },
              {
                title: 'Event Tracking',
                desc: 'Track chat interactions as Klaviyo events for segmentation'
              },
              {
                title: 'Cart Abandonment',
                desc: 'Trigger email flows based on chat conversations about products'
              },
              {
                title: 'Customer Profiles',
                desc: 'Enrich Klaviyo profiles with chat conversation data'
              }
            ].map((useCase, index) => (
              <div key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900">{useCase.title}</h4>
                <p className="text-sm text-purple-700 mt-1">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-medium text-blue-900">Need Help?</h4>
            <p className="text-sm text-blue-800 mt-1">
              Visit the{' '}
              <a
                href="https://developers.klaviyo.com/en/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                Klaviyo API Documentation
              </a>
              {' '}for detailed setup instructions and API reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KlaviyoIntegration;
