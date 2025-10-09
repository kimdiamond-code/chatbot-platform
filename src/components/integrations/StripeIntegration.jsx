import React, { useState, useEffect } from 'react';
import { stripeService } from '../../services/integrations/stripeService';

const StripeIntegration = ({ isOpen, onClose, onConnect, currentConfig }) => {
  const [config, setConfig] = useState({
    secretKey: '',
    publishableKey: '',
    webhookSecret: '',
    status: 'disconnected'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  // Feature toggles
  const [features, setFeatures] = useState({
    paymentTracking: true,
    subscriptionManagement: true,
    refundProcessing: true,
    invoiceManagement: true,
    customerBilling: true,
    webhookSetup: true
  });

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
      setActiveStep(currentConfig.status === 'connected' ? 3 : 1);
    } else {
      resetForm();
    }
  }, [currentConfig, isOpen]);

  const resetForm = () => {
    setConfig({
      secretKey: '',
      publishableKey: '',
      webhookSecret: '',
      status: 'disconnected'
    });
    setConnectionResult(null);
    setActiveStep(1);
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
    setConnectionResult(null);
  };

  const handleFeatureToggle = (feature) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const testConnection = async () => {
    if (!config.secretKey) {
      setConnectionResult({
        success: false,
        message: 'Please enter your Stripe Secret Key'
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      // Update service configuration
      const testConfig = { ...config, status: 'connected' };
      localStorage.setItem('stripe_config', JSON.stringify(testConfig));
      stripeService.config = testConfig;
      stripeService.initializeConfig();

      // Test the connection
      const result = await stripeService.testConnection();
      
      setConnectionResult({
        success: true,
        message: result.message,
        data: result
      });
      
      setActiveStep(2);
    } catch (error) {
      setConnectionResult({
        success: false,
        message: error.message || 'Connection failed. Please check your credentials.'
      });
      
      // Clean up on failure
      localStorage.removeItem('stripe_config');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      const finalConfig = {
        ...config,
        features: features,
        status: 'connected',
        connectedAt: new Date().toISOString()
      };

      // Save configuration
      localStorage.setItem('stripe_config', JSON.stringify(finalConfig));
      
      // Initialize service
      stripeService.config = finalConfig;
      stripeService.initializeConfig();

      onConnect(finalConfig);
      onClose();
    } catch (error) {
      setConnectionResult({
        success: false,
        message: 'Failed to save configuration'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect Stripe? This will stop all payment-related features.')) {
      localStorage.removeItem('stripe_config');
      resetForm();
      onConnect(null);
    }
  };

  const isFormValid = () => {
    return config.secretKey.trim() !== '' && config.publishableKey.trim() !== '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">💳</div>
              <div>
                <h2 className="text-2xl font-bold">Stripe Integration</h2>
                <p className="text-blue-100">Payment processing and billing management</p>
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
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${activeStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activeStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>1</div>
                <span className="font-medium">Credentials</span>
              </div>
              <div className={`w-8 h-0.5 ${activeStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center space-x-2 ${activeStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activeStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>2</div>
                <span className="font-medium">Features</span>
              </div>
              <div className={`w-8 h-0.5 ${activeStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`flex items-center space-x-2 ${activeStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activeStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>3</div>
                <span className="font-medium">Complete</span>
              </div>
            </div>
          </div>

          {/* Step 1: Credentials */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Stripe API Credentials</h3>
                <p className="text-gray-600 mb-6">
                  You'll need your Stripe API keys to connect. Get them from your Stripe Dashboard → Developers → API Keys.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secret Key (Required) *
                  </label>
                  <input
                    type="password"
                    value={config.secretKey}
                    onChange={(e) => handleInputChange('secretKey', e.target.value)}
                    placeholder="sk_live_... or sk_test_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for secure server-side API calls. Never share this key.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publishable Key (Required) *
                  </label>
                  <input
                    type="text"
                    value={config.publishableKey}
                    onChange={(e) => handleInputChange('publishableKey', e.target.value)}
                    placeholder="pk_live_... or pk_test_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for client-side operations like collecting payment methods.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Webhook Endpoint Secret (Optional)
                  </label>
                  <input
                    type="password"
                    value={config.webhookSecret}
                    onChange={(e) => handleInputChange('webhookSecret', e.target.value)}
                    placeholder="whsec_..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for webhook verification. Set up webhooks in your Stripe Dashboard.
                  </p>
                </div>
              </div>

              {/* Connection Result */}
              {connectionResult && (
                <div className={`p-4 rounded-lg ${
                  connectionResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg ${
                      connectionResult.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {connectionResult.success ? '✅' : '❌'}
                    </span>
                    <span className={`font-medium ${
                      connectionResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {connectionResult.message}
                    </span>
                  </div>
                </div>
              )}

              {/* Setup Instructions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">📋 Setup Instructions</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  <li>1. Log in to your <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Stripe Dashboard</a></li>
                  <li>2. Navigate to <strong>Developers → API Keys</strong></li>
                  <li>3. Copy your <strong>Secret key</strong> and <strong>Publishable key</strong></li>
                  <li>4. For webhooks, go to <strong>Developers → Webhooks</strong> and create an endpoint</li>
                  <li>5. Use this webhook URL: <code className="bg-white px-2 py-1 rounded text-xs">{window.location.origin}/webhooks/stripe</code></li>
                </ol>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={testConnection}
                  disabled={!isFormValid() || isTestingConnection}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {isTestingConnection && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>{isTestingConnection ? 'Testing Connection...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Features */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Feature Configuration</h3>
                <p className="text-gray-600 mb-6">
                  Choose which Stripe features to enable for your chatbot integration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    key: 'paymentTracking',
                    name: 'Payment Tracking',
                    description: 'Allow customers to check payment status and history',
                    icon: '💳'
                  },
                  {
                    key: 'subscriptionManagement',
                    name: 'Subscription Management',
                    description: 'View and manage recurring subscriptions',
                    icon: '🔄'
                  },
                  {
                    key: 'refundProcessing',
                    name: 'Refund Processing',
                    description: 'Handle refund requests and status inquiries',
                    icon: '💰'
                  },
                  {
                    key: 'invoiceManagement',
                    name: 'Invoice Management',
                    description: 'Access invoice information and payment due dates',
                    icon: '📄'
                  },
                  {
                    key: 'customerBilling',
                    name: 'Customer Billing',
                    description: 'Provide billing information and payment methods',
                    icon: '👤'
                  },
                  {
                    key: 'webhookSetup',
                    name: 'Webhook Integration',
                    description: 'Real-time updates from Stripe events',
                    icon: '🔗'
                  }
                ].map((feature) => (
                  <div key={feature.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{feature.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{feature.name}</h4>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={features[feature.key]}
                              onChange={() => handleFeatureToggle(feature.key)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-500 text-lg">💡</span>
                  <div>
                    <h4 className="font-medium text-blue-800">Integration Benefits</h4>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Reduce support tickets by providing instant payment information</li>
                      <li>• Improve customer experience with real-time transaction updates</li>
                      <li>• Automate refund processes and billing inquiries</li>
                      <li>• Enable proactive communication about payment issues</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {activeStep === 3 && (
            <div className="space-y-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {currentConfig?.status === 'connected' ? 'Stripe Integration Active' : 'Ready to Connect!'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {currentConfig?.status === 'connected' 
                    ? 'Your Stripe integration is working properly. You can modify settings or disconnect below.'
                    : 'Your Stripe integration is configured and ready to enhance your chatbot with payment capabilities.'
                  }
                </p>
              </div>

              {/* Integration Summary */}
              <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
                <h4 className="font-medium text-gray-900 mb-3">Integration Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className={`font-medium ${
                      currentConfig?.status === 'connected' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {currentConfig?.status === 'connected' ? 'Connected' : 'Ready'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Features Enabled:</span>
                    <span className="font-medium">
                      {Object.values(features).filter(Boolean).length} / {Object.keys(features).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Environment:</span>
                    <span className="font-medium">
                      {config.secretKey?.includes('test') ? 'Test Mode' : 'Live Mode'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                {currentConfig?.status === 'connected' ? (
                  <>
                    <button
                      onClick={() => setActiveStep(2)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Modify Settings
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConnect}
                      disabled={isConnecting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                    >
                      {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      <span>{isConnecting ? 'Connecting...' : 'Connect Stripe'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeIntegration;