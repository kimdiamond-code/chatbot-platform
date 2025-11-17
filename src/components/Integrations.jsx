import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import dbService from '../services/databaseService';
import { apiKeysService } from '../services/apiKeysService.js';
import rbacService, { PERMISSIONS } from '../services/rbacService';
import ShopifyOAuthConfiguration from './ShopifyOAuthConfiguration.jsx';
import KustomerOAuthIntegration from './integrations/KustomerOAuthIntegration.jsx';
import MessengerIntegration from './integrations/MessengerIntegration.jsx';
import KlaviyoIntegration from './integrations/KlaviyoIntegration.jsx';

const FullIntegrations = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [connections, setConnections] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [connectionMessages, setConnectionMessages] = useState({});
  const [templateCopied, setTemplateCopied] = useState(false);
  const [showShopifyConfig, setShowShopifyConfig] = useState(false);
  const [showKustomerOAuth, setShowKustomerOAuth] = useState(false);
  const [showMessengerConfig, setShowMessengerConfig] = useState(false);
  const [showKlaviyoConfig, setShowKlaviyoConfig] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // ✅ FIX: Get actual user's organization ID from auth hook
  const organizationId = user?.organization_id;
  
  console.log('🏛️ Integrations - Using Organization ID:', organizationId);
  
  // Require authentication
  if (!organizationId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🔐</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to manage your integrations.</p>
            <a 
              href="/login" 
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Go to Login
            </a>
          </div>
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
      setupRequired: true,
      isKlaviyo: true
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
      setupRequired: true,
      isMessenger: true
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

  // ✅ FIX: Load connection status when component mounts or organization changes
  useEffect(() => {
    loadConnectionStatus();
    loadCurrentUser();
  }, [organizationId]); // Re-load when organization changes

  const loadCurrentUser = async () => {
    if (user) {
      console.log('👤 Loaded current user:', user.email);
      setCurrentUser({
        id: user.id,
        email: user.email,
        organizationId: user.organization_id
      });
    }
  };

  const loadConnectionStatus = async () => {
    setIsLoading(true);
    try {
      console.log('📡 Loading integrations for org:', organizationId);
      // ✅ FIX: Use actual organization ID
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
      console.log('✅ Loaded integration statuses:', connectionMap);
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
      // Make sure currentUser is loaded before opening modal
      if (!currentUser) {
        await loadCurrentUser();
      }
      setShowKustomerOAuth(true);
      return;
    }
    
    // Special handling for Messenger - open configuration modal
    if (integrationId === 'facebook') {
      setShowMessengerConfig(true);
      return;
    }
    
    // Special handling for Klaviyo - open configuration modal
    if (integrationId === 'klaviyo') {
      setShowKlaviyoConfig(true);
      return;
    }
    
    // For other integrations, use standard toggle logic
    if (!rbacService.canModifyIntegration(integrationId)) {
      setConnectionMessages({
        ...connectionMessages,
        [integrationId]: {
          type: 'error',
          message: 'You do not have permission to modify this integration'
        }
      });
      setTimeout(() => {
        setConnectionMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[integrationId];
          return newMessages;
        });
      }, 3000);
      return;
    }

    setIsLoading(true);
    try {
      const newStatus = connections[integrationId] === 'connected' ? 'disconnected' : 'connected';
      
      // ✅ FIX: Pass organization ID to integration save
      await dbService.saveIntegration({
        organization_id: organizationId,
        integration_id: integrationId,
        status: newStatus,
        config: {}
      });
      
      setConnections({
        ...connections,
        [integrationId]: newStatus
      });
      
      // Show success message
      setConnectionMessages({
        ...connectionMessages,
        [integrationId]: {
          type: 'success',
          message: `Successfully ${newStatus === 'connected' ? 'connected' : 'disconnected'}`
        }
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setConnectionMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[integrationId];
          return newMessages;
        });
      }, 3000);
    } catch (error) {
      console.error('Failed to toggle integration:', error);
      
      // Show error message
      setConnectionMessages({
        ...connectionMessages,
        [integrationId]: {
          type: 'error',
          message: 'Failed to update integration'
        }
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setConnectionMessages(prev => {
          const newMessages = { ...prev };
          delete newMessages[integrationId];
          return newMessages;
        });
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopifySuccess = () => {
    setShowShopifyConfig(false);
    loadConnectionStatus();
  };

  const handleKustomerSuccess = () => {
    setShowKustomerOAuth(false);
    loadConnectionStatus();
  };

  const handleMessengerSuccess = () => {
    setShowMessengerConfig(false);
    loadConnectionStatus();
  };

  const handleKlaviyoSuccess = () => {
    setShowKlaviyoConfig(false);
    loadConnectionStatus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Integrations Hub
              </h1>
              <p className="text-gray-600 text-lg">
                Connect your favorite tools and streamline your workflow
              </p>
              {currentUser && (
                <p className="text-sm text-gray-500 mt-1">
                  Organization: {currentUser.organizationId || 'Not set'}
                </p>
              )}
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search integrations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 pr-12 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                  🔍
                </span>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-3 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        {isLoading && !Object.keys(connections).length ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading integrations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              >
                {/* Card Header with Gradient */}
                <div className={`bg-gradient-to-r ${integration.color} p-6 text-white`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-5xl">{integration.icon}</span>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      integration.status === 'connected'
                        ? 'bg-green-500 bg-opacity-20'
                        : 'bg-white bg-opacity-20'
                    }`}>
                      {integration.status === 'connected' ? '✓ Connected' : 'Not Connected'}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold">{integration.name}</h3>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4 min-h-[48px]">
                    {integration.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    {integration.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Connection Message */}
                  {connectionMessages[integration.id] && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      connectionMessages[integration.id].type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {connectionMessages[integration.id].message}
                    </div>
                  )}

                  {/* Connect Button */}
                  <button
                    onClick={() => toggleIntegration(integration.id)}
                    disabled={isLoading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${
                      integration.status === 'connected'
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {integration.status === 'connected' ? 'Configure' : 'Connect Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No integrations found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Modals */}
        {showShopifyConfig && (
          <ShopifyOAuthConfiguration
            onClose={() => setShowShopifyConfig(false)}
            onSuccess={handleShopifySuccess}
          />
        )}

        {showKustomerOAuth && currentUser && (
          <KustomerOAuthIntegration
            isOpen={showKustomerOAuth}
            onClose={() => setShowKustomerOAuth(false)}
            onSuccess={handleKustomerSuccess}
            currentUser={currentUser}
          />
        )}

        {showMessengerConfig && (
          <MessengerIntegration
            isOpen={showMessengerConfig}
            onClose={() => setShowMessengerConfig(false)}
            onSuccess={handleMessengerSuccess}
          />
        )}

        {showKlaviyoConfig && (
          <KlaviyoIntegration
            isOpen={showKlaviyoConfig}
            onClose={() => setShowKlaviyoConfig(false)}
            onSuccess={handleKlaviyoSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default FullIntegrations;
