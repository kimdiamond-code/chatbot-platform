import React, { useState, useEffect } from 'react';
import messengerService from '../../services/integrations/messengerService';

const MessengerIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    pageAccessToken: '',
    pageId: '',
    verifyToken: '',
    appSecret: ''
  });
  const [testResult, setTestResult] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState('');

  useEffect(() => {
    loadConfig();
    setWebhookUrl(messengerService.getWebhookUrl());
  }, []);

  const loadConfig = () => {
    const saved = localStorage.getItem('messenger_config');
    if (saved) {
      const savedConfig = JSON.parse(saved);
      setConfig(savedConfig);
      setIsConnected(savedConfig.status === 'connected');
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const testConnection = async () => {
    if (!config.pageAccessToken) {
      setTestResult({
        success: false,
        message: 'Please enter a Page Access Token'
      });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Save config temporarily for testing
      localStorage.setItem('messenger_config', JSON.stringify({
        ...config,
        status: 'connected'
      }));

      // Reload service to use new config
      const testService = new messengerService.constructor();
      const result = await testService.testConnection();

      setTestResult({
        success: true,
        message: result.message,
        pageName: result.pageName,
        pageId: result.pageId
      });

      // Update page ID if not set
      if (!config.pageId && result.pageId) {
        setConfig(prev => ({ ...prev, pageId: result.pageId }));
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error.message}`
      });
      
      // Remove temporary config
      localStorage.removeItem('messenger_config');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = () => {
    if (!config.pageAccessToken) {
      alert('Please enter a Page Access Token');
      return;
    }

    const configToSave = {
      ...config,
      status: 'connected',
      connectedAt: new Date().toISOString()
    };

    localStorage.setItem('messenger_config', JSON.stringify(configToSave));
    setIsConnected(true);
    
    alert('Facebook Messenger configuration saved successfully!');
  };

  const disconnect = () => {
    if (confirm('Are you sure you want to disconnect Facebook Messenger?')) {
      localStorage.removeItem('messenger_config');
      setIsConnected(false);
      setConfig({
        pageAccessToken: '',
        pageId: '',
        verifyToken: '',
        appSecret: ''
      });
      setTestResult(null);
    }
  };

  const generateVerifyToken = () => {
    const token = messengerService.generateVerifyToken();
    setConfig(prev => ({ ...prev, verifyToken: token }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-5xl">💙</div>
            <div>
              <h2 className="text-2xl font-bold">Facebook Messenger</h2>
              <p className="text-blue-100">Connect your Facebook Page for customer messaging</p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-400 text-green-900' 
              : 'bg-blue-400 text-blue-900'
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
          {testResult.pageName && (
            <p className="text-sm text-green-700 mt-1">
              Page: {testResult.pageName} (ID: {testResult.pageId})
            </p>
          )}
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Configuration</h3>
          <p className="text-sm text-gray-600 mt-1">
            Set up your Facebook Messenger integration
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Page Access Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Access Token *
            </label>
            <input
              type="password"
              value={config.pageAccessToken}
              onChange={(e) => handleInputChange('pageAccessToken', e.target.value)}
              placeholder="Enter your Page Access Token"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from your Facebook App Dashboard under Messenger → Settings
            </p>
          </div>

          {/* Page ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page ID (Optional)
            </label>
            <input
              type="text"
              value={config.pageId}
              onChange={(e) => handleInputChange('pageId', e.target.value)}
              placeholder="Will be auto-detected"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-detected during connection test
            </p>
          </div>

          {/* Verify Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verify Token
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={config.verifyToken}
                onChange={(e) => handleInputChange('verifyToken', e.target.value)}
                placeholder="Generate or enter verify token"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={generateVerifyToken}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Generate
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Used for webhook verification. Generate one or create your own.
            </p>
          </div>

          {/* App Secret (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App Secret (Optional)
            </label>
            <input
              type="password"
              value={config.appSecret}
              onChange={(e) => handleInputChange('appSecret', e.target.value)}
              placeholder="For webhook signature verification"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended for security - validates webhook requests
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={testConnection}
            disabled={isLoading || !config.pageAccessToken}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Testing...' : 'Test Connection'}
          </button>
          <button
            onClick={saveConfig}
            disabled={isLoading || !config.pageAccessToken}
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

      {/* Webhook Setup */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Webhook Setup</h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure your Facebook App webhook to receive messages
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Callback URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={webhookUrl}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={() => copyToClipboard(webhookUrl)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verify Token
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={config.verifyToken || 'Generate a verify token first'}
                readOnly
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              {config.verifyToken && (
                <button
                  onClick={() => copyToClipboard(config.verifyToken)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Copy
                </button>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Go to your Facebook App Dashboard</li>
              <li>Navigate to Messenger → Settings</li>
              <li>In the Webhooks section, click "Add Callback URL"</li>
              <li>Paste the Callback URL above</li>
              <li>Paste the Verify Token above</li>
              <li>Subscribe to webhook fields: messages, messaging_postbacks, messaging_optins</li>
              <li>Click "Verify and Save"</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Features</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: '💬', title: 'Direct Messaging', desc: 'Send and receive messages' },
              { icon: '⚡', title: 'Quick Replies', desc: 'Interactive button responses' },
              { icon: '🎯', title: 'Templates', desc: 'Button and carousel templates' },
              { icon: '👤', title: 'User Profiles', desc: 'Access user information' },
              { icon: '✍️', title: 'Typing Indicators', desc: 'Show bot is typing' },
              { icon: '🎨', title: 'Rich Media', desc: 'Images, videos, and files' }
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

      {/* Help */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-medium text-yellow-900">Need Help?</h4>
            <p className="text-sm text-yellow-800 mt-1">
              Visit the{' '}
              <a
                href="https://developers.facebook.com/docs/messenger-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-900"
              >
                Facebook Messenger Platform Documentation
              </a>
              {' '}for detailed setup instructions and API reference.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessengerIntegration;
