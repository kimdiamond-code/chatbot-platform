import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useOrganizationId } from '../hooks/useOrganizationId';
import { Store, Mail, MessageCircle, Phone, CreditCard, Headphones, Check, X, Loader, ExternalLink, Settings, Zap } from 'lucide-react';
import centralizedShopifyService from '../services/integrations/centralizedShopifyService';
import centralizedKlaviyoService from '../services/integrations/centralizedKlaviyoService';
import centralizedKustomerService from '../services/integrations/centralizedKustomerService';
import centralizedMessengerService from '../services/integrations/centralizedMessengerService';
import integrationService from '../services/integrations/integrationService';

const CentralizedIntegrations = () => {
  const { user, loading: authLoading } = useAuth();
  const { organizationId, loading: orgLoading } = useOrganizationId();
  
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null);

  // Integration definitions
  const availableIntegrations = [
    {
      provider: 'shopify',
      name: 'Shopify',
      description: 'E-commerce platform integration for products, orders, and customer data',
      icon: Store,
      color: 'from-green-500 to-emerald-600',
      fields: [], // OAuth - no manual fields
      usesOAuth: true,
      configured: integrationService.isProviderConfigured('shopify'),
      features: ['Product Search', 'Order Tracking', 'Customer Lookup', 'Add to Cart Links']
    },
    {
      provider: 'klaviyo',
      name: 'Klaviyo',
      description: 'Email marketing automation and customer engagement',
      icon: Mail,
      color: 'from-purple-500 to-pink-600',
      fields: [
        { name: 'companyId', label: 'Company ID', placeholder: 'Found in Klaviyo account settings', required: true }
      ],
      configured: integrationService.isProviderConfigured('klaviyo'),
      features: ['Email Lists', 'Subscriber Management', 'Event Tracking', 'Campaign Triggers']
    },
    {
      provider: 'kustomer',
      name: 'Kustomer',
      description: 'Customer service CRM for support tickets and conversations',
      icon: Headphones,
      color: 'from-blue-500 to-cyan-600',
      fields: [
        { name: 'subdomain', label: 'Organization Subdomain', placeholder: 'mycompany (from mycompany.kustomerapp.com)', required: true }
      ],
      configured: integrationService.isProviderConfigured('kustomer'),
      features: ['Ticket Creation', 'Conversation History', 'Customer Notes', 'Tags']
    },
    {
      provider: 'messenger',
      name: 'Facebook Messenger',
      description: 'Connect to Facebook Messenger for chat communications',
      icon: MessageCircle,
      color: 'from-blue-600 to-indigo-700',
      fields: [], // OAuth - no manual fields
      usesOAuth: true,
      configured: integrationService.isProviderConfigured('messenger'),
      features: ['Send/Receive Messages', 'Rich Media', 'Quick Replies', 'Button Templates']
    },
    {
      provider: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'WhatsApp messaging via Twilio integration',
      icon: Phone,
      color: 'from-green-600 to-teal-600',
      fields: [
        { name: 'phoneNumber', label: 'WhatsApp Business Number', placeholder: '+1234567890', required: true }
      ],
      configured: integrationService.isProviderConfigured('twilio'),
      features: ['WhatsApp Messages', 'Media Support', 'Template Messages', 'Business Verification']
    }
  ];

  // Load integrations from database
  useEffect(() => {
    if (organizationId) {
      loadIntegrations();
      
      // Handle OAuth callbacks
      const params = new URLSearchParams(window.location.search);
      
      if (params.get('shopify') === 'connected') {
        setMessage({ type: 'success', text: 'Shopify connected successfully!' });
        // Clean URL
        window.history.replaceState({}, '', '/dashboard/integrations');
      } else if (params.get('messenger') === 'connected') {
        const pageName = params.get('page');
        setMessage({ type: 'success', text: `Facebook Page "${pageName}" connected successfully!` });
        window.history.replaceState({}, '', '/dashboard/integrations');
      } else if (params.get('shopify') === 'error' || params.get('messenger') === 'error') {
        const errorMsg = params.get('message') || 'Connection failed';
        setMessage({ type: 'error', text: `Error: ${errorMsg}` });
        window.history.replaceState({}, '', '/dashboard/integrations');
      }
    }
  }, [organizationId]);

  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/consolidated?endpoint=integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getIntegrations',
          organization_id: organizationId
        })
      });

      const data = await response.json();
      if (data.success) {
        setIntegrations(data.integrations || []);
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntegrationStatus = (provider) => {
    const integration = integrations.find(i => i.provider === provider);
    return integration?.status || 'disconnected';
  };

  const getIntegrationData = (provider) => {
    return integrations.find(i => i.provider === provider);
  };

  const handleConnect = (provider) => {
    // OAuth providers redirect directly
    if (provider === 'shopify') {
      const shopName = prompt("Enter your Shopify store name (e.g., mystore):");
      if (shopName) {
        window.location.href = `/api/consolidated?endpoint=shopify-oauth-redirect&organization_id=${organizationId}&shop=${shopName}`;
      }
      return;
    }
    
    if (provider === 'messenger') {
      window.location.href = `/api/consolidated?endpoint=messenger-oauth-redirect&organization_id=${organizationId}`;
      return;
    }
    
    // Other providers use manual form
    setSelectedProvider(provider);
    setFormData({});
    setMessage(null);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/consolidated?endpoint=integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'saveIntegration',
          organization_id: organizationId,
          provider: selectedProvider,
          account_identifier: formData,
          status: 'connected'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await loadIntegrations();
        setSelectedProvider(null);
        setFormData({});
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to connect integration' });
      }
    } catch (error) {
      console.error('Error saving integration:', error);
      setMessage({ type: 'error', text: 'Failed to save integration' });
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async (provider) => {
    setTestingProvider(provider);
    setMessage(null);

    const integration = getIntegrationData(provider);
    if (!integration) {
      setMessage({ type: 'error', text: 'Integration not configured' });
      setTestingProvider(null);
      return;
    }

    try {
      let result;
      const identifier = integration.account_identifier;

      switch (provider) {
        case 'shopify':
          result = await centralizedShopifyService.testConnection(identifier.storeName);
          break;
        case 'klaviyo':
          result = await centralizedKlaviyoService.testConnection();
          break;
        case 'kustomer':
          result = await centralizedKustomerService.testConnection(identifier.subdomain);
          break;
        case 'messenger':
          result = await centralizedMessengerService.testConnection(identifier.pageId);
          break;
        default:
          throw new Error('Test not implemented for this provider');
      }

      setMessage({ 
        type: 'success', 
        text: result.message || `${provider} connection successful!` 
      });
    } catch (error) {
      console.error(`Error testing ${provider}:`, error);
      setMessage({ 
        type: 'error', 
        text: `Connection test failed: ${error.message}` 
      });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/consolidated?endpoint=integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnectIntegration',
          organization_id: organizationId,
          provider
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await loadIntegrations();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      setMessage({ type: 'error', text: 'Failed to disconnect integration' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Organization Required</h2>
          <p className="text-gray-600">Please log in to access integrations.</p>
        </div>
      </div>
    );
  }

  const getProviderConfig = (provider) => {
    return availableIntegrations.find(i => i.provider === provider);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
          <p className="text-gray-600">Connect your tools and services to enhance your chatbot capabilities</p>
        </div>

        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Admin Configuration Status */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Admin Configuration Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableIntegrations.map(integration => (
              <div key={integration.provider} className="flex items-center gap-2">
                {integration.configured ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-sm ${integration.configured ? 'text-gray-900' : 'text-gray-400'}`}>
                  {integration.name}
                </span>
              </div>
            ))}
          </div>
          {!integrationService.isProviderConfigured('klaviyo') && (
            <p className="mt-3 text-sm text-amber-600 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Some integrations need admin API keys. See QUICK_SETUP_INTEGRATIONS.md
            </p>
          )}
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableIntegrations.map(integration => {
            const Icon = integration.icon;
            const status = getIntegrationStatus(integration.provider);
            const isConnected = status === 'connected';
            const integrationData = getIntegrationData(integration.provider);

            return (
              <div key={integration.provider} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header with gradient */}
                <div className={`h-2 bg-gradient-to-r ${integration.color}`}></div>
                
                <div className="p-6">
                  {/* Icon and Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${integration.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {isConnected ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="w-3 h-3" />
                              Connected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              <X className="w-3 h-3" />
                              Not Connected
                            </span>
                          )}
                          {!integration.configured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Admin Setup Needed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                  {/* Connected Info */}
                  {isConnected && integrationData && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Connected Account:</p>
                      <p className="text-sm font-medium text-gray-900">
                        {Object.values(integrationData.account_identifier)[0]}
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!integration.configured ? (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm font-medium"
                      >
                        Admin Setup Required
                      </button>
                    ) : isConnected ? (
                      <>
                        <button
                          onClick={() => handleTest(integration.provider)}
                          disabled={testingProvider === integration.provider}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {testingProvider === integration.provider ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            'Test Connection'
                          )}
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration.provider)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.provider)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Connection Modal */}
        {selectedProvider && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Connect {getProviderConfig(selectedProvider)?.name}
                </h3>
                <button
                  onClick={() => setSelectedProvider(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {getProviderConfig(selectedProvider)?.fields.map(field => (
                  <div key={field.name} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleFormChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setSelectedProvider(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CentralizedIntegrations;
