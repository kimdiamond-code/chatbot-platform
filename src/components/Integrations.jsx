import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOrganizationId } from '../hooks/useOrganizationId';
import dbService from '../services/databaseService';
import { apiKeysService } from '../services/apiKeysService.js';
import ShopifyOAuthConfiguration from './ShopifyOAuthConfiguration.jsx';
import KustomerOAuthIntegration from './integrations/KustomerOAuthIntegration.jsx';

const FullIntegrations = () => {
  const { user, loading: authLoading } = useAuth();
  const { organizationId, loading: orgLoading, error: orgError } = useOrganizationId();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [connections, setConnections] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [connectionMessages, setConnectionMessages] = useState({});
  const [templateCopied, setTemplateCopied] = useState(false);
  const [showShopifyConfig, setShowShopifyConfig] = useState(false);
  const [showKustomerOAuth, setShowKustomerOAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  console.log('🏛️ Integrations - Using Organization ID:', organizationId);
  console.log('🔄 Auth loading:', authLoading, 'User:', user?.email);
  
  // Set currentUser directly from auth hook
  useEffect(() => {
    if (user) {
      console.log('👤 Using logged-in user:', user.email, 'org:', user.organizationId);
      setCurrentUser(user);
    } else {
      console.log('⚠️ No user logged in');
    }
  }, [user]);
  
  // Show loading screen while auth is initializing
  if (authLoading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading integrations...</p>
        </div>
      </div>
    );
  }

 
  // Show error if organization context failed
  if (orgError || !organizationId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            {orgError || 'Unable to load organization context. Please log out and log back in.'}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const copyEnvTemplate = async () => {
    try {
      await navigator.clipboard.writeText(apiKeysService.generateEnvTemplate());
      setTemplateCopied(true);
      setTimeout(() => setTemplateCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy template:', error);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = apiKeysService.generateEnvTemplate();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setTemplateCopied(true);
      setTimeout(() => setTemplateCopied(false), 3000);
    }
  };

  // Integration data with modern styling
  const integrations = [
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Connect your Shopify store for product search, order tracking, and customer support',
      category: 'ecommerce',
      icon: '🛍️',
      color: 'from-green-500 to-emerald-600',
      features: ['Product Search', 'Order Tracking', 'Customer Data', 'Inventory Status'],
      status: connections.shopify || 'disconnected',
      setupRequired: true,
      isShopify: true
    },
    {
      id: 'kustomer',
      name: 'Kustomer CRM',
      description: 'Connect with your personal Kustomer account for customer support integration',
      category: 'crm',
      icon: '👥',
      color: 'from-blue-500 to-cyan-600',
      features: ['Customer Profiles', 'OAuth Authentication', 'Chat History', 'Agent Assignment'],
      status: connections.kustomer || 'disconnected',
      setupRequired: true,
      isKustomerOAuth: true
    },
    {
      id: 'klaviyo',
      name: 'Klaviyo',
      description: 'Email marketing automation and customer segmentation',
      category: 'marketing',
      icon: '📧',
      color: 'from-purple-500 to-violet-600',
      features: ['Email Campaigns', 'Customer Segmentation', 'Analytics', 'Automation'],
      status: connections.klaviyo || 'disconnected',
      setupRequired: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'WhatsApp messaging integration via Twilio',
      category: 'messaging',
      icon: '💬',
      color: 'from-green-500 to-green-600',
      features: ['Message Templates', 'Media Support', 'Group Messaging', 'Status Updates'],
      status: connections.whatsapp || 'disconnected',
      setupRequired: true
    },
    {
      id: 'facebook',
      name: 'Facebook Messenger',
      description: 'Facebook Messenger integration for social customer support',
      category: 'messaging',
      icon: '💙',
      color: 'from-blue-600 to-blue-700',
      features: ['Instant Messaging', 'Rich Media', 'Quick Replies', 'Persistent Menu'],
      status: connections.facebook || 'disconnected',
      setupRequired: true
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 3000+ apps through automated workflows',
      category: 'automation',
      icon: '⚡',
      color: 'from-orange-500 to-red-600',
      features: ['Workflow Automation', '3000+ Apps', 'Trigger Events', 'Data Sync'],
      status: connections.zapier || 'disconnected',
      setupRequired: false
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team collaboration and internal notifications',
      category: 'communication',
      icon: '🔔',
      color: 'from-purple-600 to-pink-600',
      features: ['Channel Notifications', 'Direct Messages', 'Bot Commands', 'File Sharing'],
      status: connections.slack || 'disconnected',
      setupRequired: false
    },
    {
      id: 'webhooks',
      name: 'Custom Webhooks',
      description: 'Send data to your custom endpoints and APIs',
      category: 'automation',
      icon: '🔗',
      color: 'from-gray-500 to-gray-600',
      features: ['Real-time Data', 'Custom Headers', 'Retry Logic', 'Authentication'],
      status: connections.webhooks || 'connected',
      setupRequired: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All Integrations', icon: '🌟' },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛍️' },
    { id: 'crm', name: 'CRM & Support', icon: '👥' },
    { id: 'marketing', name: 'Marketing', icon: '📧' },
    { id: 'messaging', name: 'Messaging', icon: '💬' },
    { id: 'automation', name: 'Automation', icon: '⚡' },
    { id: 'communication', name: 'Communication', icon: '🔔' }
  ];

  // Filter integrations
  const filteredIntegrations = integrations.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Load connection status when BOTH organizationId AND user are ready
  useEffect(() => {
    if (organizationId && user) {
      console.log('📥 Loading integrations for org:', organizationId, 'user:', user.email);
      loadConnectionStatus();
    }
  }, [organizationId, user]);

  const loadConnectionStatus = async () => {
    if (!organizationId) {
      console.warn('⚠️ Cannot load integrations without organizationId');
      return;
    }
    
    setIsLoading(true);
    try {
      // Load integrations from database
      console.log('📥 Fetching integrations from database for org:', organizationId);
      const integrations = await dbService.getIntegrations(organizationId);
      
      const connectionMap = {
        webhooks: 'connected',
        shopify: 'disconnected',
        kustomer: 'disconnected',
        klaviyo: 'disconnected',
        whatsapp: 'disconnected',
        facebook: 'disconnected',
        zapier: 'disconnected',
        slack: 'disconnected'
      };
      
      integrations?.forEach(conn => {
        connectionMap[conn.integration_id] = conn.status;
      });
      
      setConnections(connectionMap);
    } catch (error) {
      console.warn('Failed to load connection status, using defaults:', error);
      // Fallback to default disconnected state
      setConnections({
        webhooks: 'connected',
        shopify: 'disconnected',
        kustomer: 'disconnected',
        klaviyo: 'disconnected',
        whatsapp: 'disconnected',
        facebook: 'disconnected',
        zapier: 'disconnected',
        slack: 'disconnected'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle integration with better UX (no annoying alerts)
  const toggleIntegration = async (integrationId) => {
    // Special handling for Shopify - open configuration modal
    if (integrationId === 'shopify') {
      setShowShopifyConfig(true);
      return;
    }
    
    // Special handling for Kustomer OAuth - open OAuth modal
    if (integrationId === 'kustomer') {
      setShowKustomerOAuth(true);
      return;
    }
    
    setIsLoading(true);
    const currentStatus = connections[integrationId] || 'disconnected';
    const newStatus = currentStatus === 'connected' ? 'disconnected' : 'connected';
    
    // Clear any previous messages
    setConnectionMessages(prev => ({ ...prev, [integrationId]: null }));
    
    try {
      // If connecting, test the real API first
      if (newStatus === 'connected') {
        console.log(`Testing ${integrationId} API connection...`);
        const testResult = await apiKeysService.testConnection(integrationId);
        
        if (!testResult.success) {
          // Show inline message instead of alert
          if (testResult.needsSetup) {
            setConnectionMessages(prev => ({ 
              ...prev, 
              [integrationId]: {
                type: 'info',
                message: `📝 ${testResult.message} The integration is marked as "configured" for demo purposes.`
              }
            }));
          } else {
            setConnectionMessages(prev => ({ 
              ...prev, 
              [integrationId]: {
                type: 'error',
                message: `⚠️ Connection test failed: ${testResult.message}`
              }
            }));
            setIsLoading(false);
            return; // Don't change status if connection test actually failed
          }
        } else {
          // Show success message
          setConnectionMessages(prev => ({ 
            ...prev, 
            [integrationId]: {
              type: 'success',
              message: `✅ ${testResult.message}`
            }
          }));
        }
      } else {
        // Disconnecting
        setConnectionMessages(prev => ({ 
          ...prev, 
          [integrationId]: {
            type: 'info',
            message: `🔌 ${integrationId.charAt(0).toUpperCase() + integrationId.slice(1)} disconnected`
          }
        }));
      }
      
      // Update local state immediately for better UX
      setConnections(prev => ({
        ...prev,
        [integrationId]: newStatus
      }));

      // Update database
      try {
        await dbService.upsertIntegration({
          organization_id: organizationId,
          integration_id: integrationId,
          integration_name: integrationId.charAt(0).toUpperCase() + integrationId.slice(1),
          status: newStatus,
          config: {},
          credentials_encrypted: '',
          connected_at: newStatus === 'connected' ? new Date().toISOString() : null
        });
      } catch (dbError) {
        console.warn('Database update failed, continuing with local state:', dbError);
        setConnectionMessages(prev => ({ 
          ...prev, 
          [integrationId]: {
            type: 'warning',
            message: `⚠️ Status updated locally. Database sync may have failed.`
          }
        }));
      }

      console.log(`${integrationId} ${newStatus === 'connected' ? 'connected' : 'disconnected'}`);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setConnectionMessages(prev => ({ ...prev, [integrationId]: null }));
      }, 5000);
      
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      
      // Show inline error message instead of alert
      setConnectionMessages(prev => ({ 
        ...prev, 
        [integrationId]: {
          type: 'error',
          message: `⚠️ Failed to ${newStatus === 'connected' ? 'connect' : 'disconnect'}: ${error.message}`
        }
      }));
      
      // Revert on error
      setConnections(prev => ({
        ...prev,
        [integrationId]: currentStatus
      }));
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setConnectionMessages(prev => ({ ...prev, [integrationId]: null }));
      }, 5000);
      
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Kustomer OAuth configuration
  const handleKustomerOAuthConnect = (connectionData) => {
    setShowKustomerOAuth(false);
    if (connectionData) {
      setConnections(prev => ({
        ...prev,
        kustomer: 'connected'
      }));
      setConnectionMessages(prev => ({
        ...prev,
        kustomer: {
          type: 'success',
          message: `✅ Connected to ${connectionData.user.name || connectionData.user.email} successfully!`
        }
      }));
    } else {
      setConnections(prev => ({
        ...prev,
        kustomer: 'disconnected'
      }));
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setConnectionMessages(prev => ({ ...prev, kustomer: null }));
    }, 5000);
  };

  // Handle Shopify configuration save
  const handleShopifyConfigSaved = (configData) => {
    setShowShopifyConfig(false);
    if (configData) {
      setConnections(prev => ({
        ...prev,
        shopify: configData.status || 'connected'
      }));
      setConnectionMessages(prev => ({
        ...prev,
        shopify: {
          type: 'success',
          message: '✅ Shopify store connected successfully!'
        }
      }));
    } else {
      setConnections(prev => ({
        ...prev,
        shopify: 'disconnected'
      }));
    }
    
    // Clear message after 5 seconds
    setTimeout(() => {
      setConnectionMessages(prev => ({ ...prev, shopify: null }));
    }, 5000);
  };

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce-subtle mb-4">🔌</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Integrations Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect your favorite tools and automate your workflows. Seamlessly integrate with popular platforms to enhance your customer support experience.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <div className="absolute left-4 top-3.5 text-gray-400 text-xl">🔍</div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex-shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-48"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* API Keys Status Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            🔑 API Keys Status
          </h2>
          <button
            onClick={copyEnvTemplate}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              templateCopied 
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
            }`}
          >
            {templateCopied ? '✅ Copied!' : '📋 Copy .env Template'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { key: 'openai', name: 'OpenAI', required: true },
            { key: 'shopify', name: 'Shopify', required: false },
            { key: 'kustomer', name: 'Kustomer', required: false },
            { key: 'klaviyo', name: 'Klaviyo', required: false },
            { key: 'whatsapp', name: 'WhatsApp', required: false },
            { key: 'facebook', name: 'Facebook', required: false },
            { key: 'slack', name: 'Slack', required: false },
            { key: 'zapier', name: 'Zapier', required: false }
          ].map(({ key, name, required }) => {
            const hasKey = apiKeysService.hasValidKey(key);
            return (
              <div key={key} className={`p-3 rounded-lg border ${hasKey ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm ${hasKey ? 'text-green-700' : 'text-gray-600'}`}>
                    {hasKey ? '✅' : '⚪'} {name}
                  </span>
                  {required && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      Required
                    </span>
                  )}
                </div>
                <p className={`text-xs ${hasKey ? 'text-green-600' : 'text-gray-500'}`}>
                  {hasKey ? 'Configured' : 'Not configured'}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> OpenAI API key is required for smart bot responses. Other integrations like Kustomer can be connected directly through the integration cards below - no environment variables needed!
          </p>
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map(integration => (
          <div
            key={integration.id}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${integration.color} rounded-xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                  {integration.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{integration.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    (connections[integration.id] || 'disconnected') === 'connected'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {(connections[integration.id] || 'disconnected') === 'connected' ? '✅ Connected' : '⚪ Disconnected'}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => toggleIntegration(integration.id)}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  (connections[integration.id] || 'disconnected') === 'connected'
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    (connections[integration.id] || 'disconnected') === 'connected'
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4">
              {integration.description}
            </p>

            {/* Features */}
            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-sm text-gray-900">Key Features:</h4>
              <div className="flex flex-wrap gap-1">
                {integration.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => toggleIntegration(integration.id)}
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-xl font-medium transition-all ${
                (connections[integration.id] || 'disconnected') === 'connected'
                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                  : `bg-gradient-to-r ${integration.color} text-white hover:opacity-90 shadow-md`
              } disabled:opacity-50`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                integration.isShopify
                  ? '⚙️ Configure Store'
                  : integration.isKustomerOAuth
                  ? '🔐 Connect Account'
                  : (connections[integration.id] || 'disconnected') === 'connected' ? 'Disconnect' : 'Connect'
              )}
            </button>

            {/* Connection Status Message */}
            {connectionMessages[integration.id] && (
              <div className={`mt-3 p-3 rounded-lg border text-sm ${
                connectionMessages[integration.id].type === 'success' ? 'border-green-200 bg-green-50 text-green-800' :
                connectionMessages[integration.id].type === 'error' ? 'border-red-200 bg-red-50 text-red-800' :
                connectionMessages[integration.id].type === 'warning' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' :
                'border-blue-200 bg-blue-50 text-blue-800'
              }`}>
                <p>{connectionMessages[integration.id].message}</p>
              </div>
            )}
            
            {/* Setup Required Notice - Make it less prominent */}
            {integration.setupRequired && (connections[integration.id] || 'disconnected') === 'disconnected' && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 flex items-center gap-1">
                  📝 Setup needed - API credentials required for full functionality
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No integrations found</h3>
          <p className="text-gray-600">
            Try adjusting your search terms or selecting a different category.
          </p>
        </div>
      )}

      {/* Status Footer */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Integration Status</h3>
            <p className="text-sm text-gray-600">
              {Object.values(connections).filter(status => status === 'connected').length} of {integrations.length} integrations connected
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-gray-600">Available</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Shopify Configuration Modal */}
      {showShopifyConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Shopify Store Configuration</h2>
              <button
                onClick={() => setShowShopifyConfig(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-0">
              <ShopifyOAuthConfiguration onConfigurationSaved={handleShopifyConfigSaved} />
            </div>
          </div>
        </div>
      )}
      
      {/* Kustomer OAuth Integration Modal */}
      {showKustomerOAuth && (
        <KustomerOAuthIntegration
          isOpen={showKustomerOAuth}
          onClose={() => setShowKustomerOAuth(false)}
          onConnect={handleKustomerOAuthConnect}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default FullIntegrations;