import React, { useState, useEffect } from 'react';
import { emailMarketingService } from '../../services/integrations/emailMarketingService';

const EmailMarketingIntegration = ({ isOpen, onClose, onConnect, currentConfigs, selectedPlatform }) => {
  const [activeTab, setActiveTab] = useState(selectedPlatform || 'klaviyo');
  const [configs, setConfigs] = useState({
    klaviyo: {
      apiKey: '',
      status: 'disconnected'
    },
    mailchimp: {
      apiKey: '',
      server: '',
      status: 'disconnected'
    }
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResults, setConnectionResults] = useState({});

  // Feature settings for each platform
  const [features, setFeatures] = useState({
    klaviyo: {
      profileCreation: true,
      listSubscription: true,
      eventTracking: true,
      segmentation: true,
      emailCampaigns: true
    },
    mailchimp: {
      listManagement: true,
      audienceSync: true,
      campaignTriggers: true,
      tagManagement: true,
      automationSetup: true
    }
  });

  useEffect(() => {
    if (currentConfigs) {
      setConfigs({
        klaviyo: currentConfigs.klaviyo || { apiKey: '', status: 'disconnected' },
        mailchimp: currentConfigs.mailchimp || { apiKey: '', server: '', status: 'disconnected' }
      });
    }
    if (selectedPlatform) {
      setActiveTab(selectedPlatform);
    }
  }, [currentConfigs, selectedPlatform, isOpen]);

  const handleInputChange = (platform, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
    setConnectionResults(prev => ({
      ...prev,
      [platform]: null
    }));
  };

  const handleFeatureToggle = (platform, feature) => {
    setFeatures(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [feature]: !prev[platform][feature]
      }
    }));
  };

  const testConnection = async (platform) => {
    if (platform === 'klaviyo' && !configs.klaviyo.apiKey) {
      setConnectionResults(prev => ({
        ...prev,
        klaviyo: {
          success: false,
          message: 'Please enter your Klaviyo API Key'
        }
      }));
      return;
    }

    if (platform === 'mailchimp' && (!configs.mailchimp.apiKey || !configs.mailchimp.server)) {
      setConnectionResults(prev => ({
        ...prev,
        mailchimp: {
          success: false,
          message: 'Please enter your Mailchimp API Key and Server'
        }
      }));
      return;
    }

    setIsTestingConnection(true);
    setConnectionResults(prev => ({
      ...prev,
      [platform]: null
    }));

    try {
      // Update service configuration temporarily for testing
      const testConfig = { ...configs[platform], status: 'connected' };
      localStorage.setItem(`${platform}_config`, JSON.stringify(testConfig));
      emailMarketingService[`${platform}Config`] = testConfig;
      emailMarketingService.initializeConfigs();

      let result;
      if (platform === 'klaviyo') {
        result = await emailMarketingService.testKlaviyoConnection();
      } else if (platform === 'mailchimp') {
        result = await emailMarketingService.testMailchimpConnection();
      }

      setConnectionResults(prev => ({
        ...prev,
        [platform]: {
          success: true,
          message: result.message,
          data: result
        }
      }));
    } catch (error) {
      setConnectionResults(prev => ({
        ...prev,
        [platform]: {
          success: false,
          message: error.message || `${platform} connection failed. Please check your credentials.`
        }
      }));
      
      // Clean up on failure
      localStorage.removeItem(`${platform}_config`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleConnect = async (platform) => {
    setIsConnecting(true);

    try {
      const finalConfig = {
        ...configs[platform],
        features: features[platform],
        status: 'connected',
        connectedAt: new Date().toISOString()
      };

      // Save configuration
      localStorage.setItem(`${platform}_config`, JSON.stringify(finalConfig));
      
      // Initialize service
      emailMarketingService[`${platform}Config`] = finalConfig;
      emailMarketingService.initializeConfigs();

      onConnect(platform, finalConfig);
    } catch (error) {
      setConnectionResults(prev => ({
        ...prev,
        [platform]: {
          success: false,
          message: 'Failed to save configuration'
        }
      }));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = (platform) => {
    if (confirm(`Are you sure you want to disconnect ${platform}? This will stop all email marketing features for this platform.`)) {
      localStorage.removeItem(`${platform}_config`);
      setConfigs(prev => ({
        ...prev,
        [platform]: platform === 'klaviyo' 
          ? { apiKey: '', status: 'disconnected' }
          : { apiKey: '', server: '', status: 'disconnected' }
      }));
      onConnect(platform, null);
    }
  };

  const isFormValid = (platform) => {
    if (platform === 'klaviyo') {
      return configs.klaviyo.apiKey.trim() !== '';
    }
    if (platform === 'mailchimp') {
      return configs.mailchimp.apiKey.trim() !== '' && configs.mailchimp.server.trim() !== '';
    }
    return false;
  };

  if (!isOpen) return null;

  const klaviyoConnected = configs.klaviyo?.status === 'connected';
  const mailchimpConnected = configs.mailchimp?.status === 'connected';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">📧</div>
              <div>
                <h2 className="text-2xl font-bold">Email Marketing Integration</h2>
                <p className="text-pink-100">Connect with Klaviyo and Mailchimp for powerful email automation</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Platform Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setActiveTab('klaviyo')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'klaviyo'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-2xl">📧</span>
              <span>Klaviyo</span>
              {klaviyoConnected && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
            </button>
            <button
              onClick={() => setActiveTab('mailchimp')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'mailchimp'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-2xl">🐵</span>
              <span>Mailchimp</span>
              {mailchimpConnected && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
            </button>
          </div>

          {/* Klaviyo Configuration */}
          {activeTab === 'klaviyo' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Klaviyo Setup</h3>
                  <p className="text-gray-600">
                    Advanced email marketing with powerful segmentation and automation capabilities.
                  </p>
                </div>
                {klaviyoConnected && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Connected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Credentials */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">API Credentials</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klaviyo API Key *
                    </label>
                    <input
                      type="password"
                      value={configs.klaviyo.apiKey}
                      onChange={(e) => handleInputChange('klaviyo', 'apiKey', e.target.value)}
                      placeholder="pk_..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get your API key from Account → Settings → API Keys
                    </p>
                  </div>

                  {/* Setup Instructions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">📋 Setup Instructions</h5>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Log in to your <a href="https://www.klaviyo.com" target="_blank" rel="noopener noreferrer" className="text-pink-600 underline">Klaviyo account</a></li>
                      <li>2. Go to Account → Settings → API Keys</li>
                      <li>3. Create a new Private API Key with full access</li>
                      <li>4. Copy the API key and paste it above</li>
                    </ol>
                  </div>

                  {/* Connection Test */}
                  <div className="space-y-3">
                    <button
                      onClick={() => testConnection('klaviyo')}
                      disabled={!isFormValid('klaviyo') || isTestingConnection}
                      className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                    >
                      {isTestingConnection && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    {connectionResults.klaviyo && (
                      <div className={`p-3 rounded-lg ${
                        connectionResults.klaviyo.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${
                            connectionResults.klaviyo.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {connectionResults.klaviyo.success ? '✅' : '❌'}
                          </span>
                          <span className={`text-sm font-medium ${
                            connectionResults.klaviyo.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {connectionResults.klaviyo.message}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Features</h4>
                  
                  <div className="space-y-3">
                    {[
                      {
                        key: 'profileCreation',
                        name: 'Profile Creation',
                        description: 'Automatically create customer profiles',
                        icon: '👤'
                      },
                      {
                        key: 'listSubscription',
                        name: 'List Subscription',
                        description: 'Subscribe customers to email lists',
                        icon: '📝'
                      },
                      {
                        key: 'eventTracking',
                        name: 'Event Tracking',
                        description: 'Track customer interactions and behaviors',
                        icon: '📊'
                      },
                      {
                        key: 'segmentation',
                        name: 'Customer Segmentation',
                        description: 'Advanced audience segmentation',
                        icon: '🎯'
                      },
                      {
                        key: 'emailCampaigns',
                        name: 'Campaign Triggers',
                        description: 'Trigger email campaigns from chat',
                        icon: '📢'
                      }
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{feature.icon}</span>
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">{feature.name}</h5>
                            <p className="text-xs text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={features.klaviyo[feature.key]}
                            onChange={() => handleFeatureToggle('klaviyo', feature.key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                {klaviyoConnected ? (
                  <button
                    onClick={() => handleDisconnect('klaviyo')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect('klaviyo')}
                    disabled={!connectionResults.klaviyo?.success || isConnecting}
                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                  >
                    {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    <span>{isConnecting ? 'Connecting...' : 'Connect Klaviyo'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Mailchimp Configuration */}
          {activeTab === 'mailchimp' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Mailchimp Setup</h3>
                  <p className="text-gray-600">
                    Popular email marketing platform with easy-to-use campaign management and automation.
                  </p>
                </div>
                {mailchimpConnected && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Connected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Credentials */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">API Credentials</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mailchimp API Key *
                    </label>
                    <input
                      type="password"
                      value={configs.mailchimp.apiKey}
                      onChange={(e) => handleInputChange('mailchimp', 'apiKey', e.target.value)}
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Find your API key in Account → Extras → API keys
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Server Prefix *
                    </label>
                    <input
                      type="text"
                      value={configs.mailchimp.server}
                      onChange={(e) => handleInputChange('mailchimp', 'server', e.target.value)}
                      placeholder="us1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Server prefix from the end of your API key (e.g., "us1", "us2")
                    </p>
                  </div>

                  {/* Setup Instructions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">📋 Setup Instructions</h5>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Log in to your <a href="https://mailchimp.com" target="_blank" rel="noopener noreferrer" className="text-yellow-600 underline">Mailchimp account</a></li>
                      <li>2. Go to Account → Extras → API keys</li>
                      <li>3. Create a new API key</li>
                      <li>4. Copy the API key and server prefix</li>
                    </ol>
                  </div>

                  {/* Connection Test */}
                  <div className="space-y-3">
                    <button
                      onClick={() => testConnection('mailchimp')}
                      disabled={!isFormValid('mailchimp') || isTestingConnection}
                      className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                    >
                      {isTestingConnection && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    {connectionResults.mailchimp && (
                      <div className={`p-3 rounded-lg ${
                        connectionResults.mailchimp.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${
                            connectionResults.mailchimp.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {connectionResults.mailchimp.success ? '✅' : '❌'}
                          </span>
                          <span className={`text-sm font-medium ${
                            connectionResults.mailchimp.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {connectionResults.mailchimp.message}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Features</h4>
                  
                  <div className="space-y-3">
                    {[
                      {
                        key: 'listManagement',
                        name: 'List Management',
                        description: 'Manage subscriber lists and audiences',
                        icon: '📋'
                      },
                      {
                        key: 'audienceSync',
                        name: 'Audience Sync',
                        description: 'Sync customer data with Mailchimp',
                        icon: '🔄'
                      },
                      {
                        key: 'campaignTriggers',
                        name: 'Campaign Triggers',
                        description: 'Trigger email campaigns from chat events',
                        icon: '🚀'
                      },
                      {
                        key: 'tagManagement',
                        name: 'Tag Management',
                        description: 'Automatically tag subscribers',
                        icon: '🏷️'
                      },
                      {
                        key: 'automationSetup',
                        name: 'Automation Setup',
                        description: 'Set up email automation sequences',
                        icon: '⚙️'
                      }
                    ].map((feature) => (
                      <div key={feature.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xl">{feature.icon}</span>
                          <div>
                            <h5 className="text-sm font-medium text-gray-900">{feature.name}</h5>
                            <p className="text-xs text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={features.mailchimp[feature.key]}
                            onChange={() => handleFeatureToggle('mailchimp', feature.key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                {mailchimpConnected ? (
                  <button
                    onClick={() => handleDisconnect('mailchimp')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect('mailchimp')}
                    disabled={!connectionResults.mailchimp?.success || isConnecting}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                  >
                    {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    <span>{isConnecting ? 'Connecting...' : 'Connect Mailchimp'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Integration Benefits */}
          <div className="mt-8 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🎯</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Email Marketing Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <h5 className="font-medium mb-1">🚀 Lead Capture</h5>
                    <p>Automatically collect email addresses from chat interactions</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">📈 Customer Journey</h5>
                    <p>Track customer interactions and trigger relevant campaigns</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">🎯 Segmentation</h5>
                    <p>Create targeted audience segments based on chat behavior</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">⚡ Automation</h5>
                    <p>Set up automated email sequences based on chat events</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailMarketingIntegration;