import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const MultiStoreOnboarding = ({ onStoreConnected, currentOrg = null }) => {
  const [step, setStep] = useState('store-info');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [storeData, setStoreData] = useState({
    businessName: '',
    storeDomain: '',
    storeType: 'shopify',
    contactEmail: '',
    plan: 'starter'
  });
  const [integrationMethod, setIntegrationMethod] = useState('oauth');
  const [manualCreds, setManualCreds] = useState({
    accessToken: '',
    apiKey: '',
    apiSecret: ''
  });

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$29/month',
      features: ['1 Store', 'Basic Chatbot', '1,000 messages/month', 'Email Support'],
      recommended: false
    },
    {
      id: 'pro',
      name: 'Professional', 
      price: '$79/month',
      features: ['3 Stores', 'Advanced AI', '10,000 messages/month', 'Phone Support', 'Custom Branding'],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited Stores', 'White Label', 'Unlimited Messages', 'Dedicated Support', 'Custom Integrations'],
      recommended: false
    }
  ];

  const extractStoreName = (domain) => {
    let cleaned = domain.toLowerCase().trim();
    cleaned = cleaned.replace(/^https?:\/\//, '');
    cleaned = cleaned.replace(/\/$/, '');
    
    if (cleaned.includes('.myshopify.com')) {
      return cleaned.split('.myshopify.com')[0];
    }
    
    // Handle custom domains - ask user to provide myshopify domain
    if (cleaned.includes('.') && !cleaned.includes('myshopify')) {
      return null; // Will trigger custom domain flow
    }
    
    return cleaned;
  };

  const validateStoreInfo = () => {
    if (!storeData.businessName.trim()) {
      setError('Business name is required');
      return false;
    }
    
    if (!storeData.storeDomain.trim()) {
      setError('Store domain is required');
      return false;
    }
    
    const storeName = extractStoreName(storeData.storeDomain);
    if (!storeName) {
      setError('Please provide your .myshopify.com domain (e.g., yourstore.myshopify.com)');
      return false;
    }
    
    if (!storeData.contactEmail.trim() || !storeData.contactEmail.includes('@')) {
      setError('Valid email address is required');
      return false;
    }
    
    return true;
  };

  const createOrganization = async () => {
    const storeName = extractStoreName(storeData.storeDomain);
    const slug = storeData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    try {
      // Check if organization already exists
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('slug', slug)
        .single();
      
      if (existingOrg) {
        return existingOrg;
      }
      
      // Create new organization
      const { data: newOrg, error } = await supabase
        .from('organizations')
        .insert({
          name: storeData.businessName,
          slug: slug,
          email: storeData.contactEmail,
          plan: storeData.plan,
          status: 'active',
          settings: {
            store_type: storeData.storeType,
            primary_domain: storeData.storeDomain,
            onboarding_completed: false
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Create default bot config
      await supabase
        .from('bot_configs')
        .insert({
          organization_id: newOrg.id,
          name: `${storeData.businessName} Assistant`,
          system_prompt: `You are a helpful customer service assistant for ${storeData.businessName}. You help customers with their orders, products, and general inquiries. Be professional, friendly, and helpful.`,
          personality: {
            tone: 'professional',
            style: 'helpful',
            brand_voice: 'friendly'
          },
          integrations_enabled: {
            shopify: true,
            email: true,
            live_chat: true
          },
          is_active: true
        });
      
      return newOrg;
      
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  };

  const connectShopifyStore = async (organization) => {
    const storeName = extractStoreName(storeData.storeDomain);
    
    try {
      let credentials = {};
      
      if (integrationMethod === 'manual') {
        if (!manualCreds.accessToken) {
          throw new Error('Access token is required for manual setup');
        }
        credentials = {
          storeName: storeName,
          accessToken: manualCreds.accessToken,
          connectionType: 'manual'
        };
      } else {
        // OAuth flow would go here
        credentials = {
          storeName: storeName,
          connectionType: 'oauth',
          setupPending: true
        };
      }
      
      // Create integration record
      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({
          organization_id: organization.id,
          integration_id: 'shopify',
          integration_name: 'Shopify',
          store_identifier: storeName,
          status: integrationMethod === 'manual' ? 'connected' : 'pending',
          config: {
            store_domain: storeData.storeDomain,
            business_name: storeData.businessName,
            features: ['order_tracking', 'product_search', 'customer_support']
          },
          credentials: credentials,
          connected_at: integrationMethod === 'manual' ? new Date().toISOString() : null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Test connection if manual setup
      if (integrationMethod === 'manual') {
        try {
          const testResponse = await fetch(`https://${storeName}.myshopify.com/admin/api/2024-10/shop.json`, {
            headers: {
              'X-Shopify-Access-Token': manualCreds.accessToken,
              'Content-Type': 'application/json'
            }
          });
          
          if (!testResponse.ok) {
            throw new Error('Failed to connect to Shopify store. Please check your access token.');
          }
          
          const shopData = await testResponse.json();
          
          // Update integration with shop data
          await supabase
            .from('integrations')
            .update({
              config: {
                ...integration.config,
                shop_data: {
                  name: shopData.shop.name,
                  domain: shopData.shop.domain,
                  currency: shopData.shop.currency,
                  country: shopData.shop.country_name
                }
              },
              last_sync_at: new Date().toISOString(),
              sync_status: 'success'
            })
            .eq('id', integration.id);
        } catch (testError) {
          // Update integration with error
          await supabase
            .from('integrations')
            .update({
              status: 'error',
              error_message: testError.message,
              sync_status: 'failed'
            })
            .eq('id', integration.id);
          
          throw testError;
        }
      }
      
      return integration;
      
    } catch (error) {
      console.error('Error connecting Shopify store:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      // Validate store info
      if (!validateStoreInfo()) {
        setIsLoading(false);
        return;
      }
      
      // Create organization
      setStep('creating-org');
      const organization = await createOrganization();
      
      // Connect Shopify store
      setStep('connecting-store');
      const integration = await connectShopifyStore(organization);
      
      // Mark onboarding complete
      await supabase
        .from('organizations')
        .update({
          settings: {
            ...organization.settings,
            onboarding_completed: true,
            primary_integration_id: integration.id
          }
        })
        .eq('id', organization.id);
      
      setStep('success');
      
      if (onStoreConnected) {
        onStoreConnected({
          organization,
          integration,
          storeName: extractStoreName(storeData.storeDomain)
        });
      }
      
    } catch (error) {
      setError(error.message);
      setStep('store-info');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStoreInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Connect Your Store</h2>
        <p className="text-gray-600">Get your chatbot up and running in minutes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            value={storeData.businessName}
            onChange={(e) => setStoreData({...storeData, businessName: e.target.value})}
            placeholder="Your Store Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            value={storeData.contactEmail}
            onChange={(e) => setStoreData({...storeData, contactEmail: e.target.value})}
            placeholder="hello@yourstore.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shopify Store Domain *
        </label>
        <input
          type="text"
          value={storeData.storeDomain}
          onChange={(e) => setStoreData({...storeData, storeDomain: e.target.value})}
          placeholder="yourstore.myshopify.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter your full Shopify domain (e.g., yourstore.myshopify.com)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Connection Method
        </label>
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${integrationMethod === 'oauth' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
               onClick={() => setIntegrationMethod('oauth')}>
            <h4 className="font-semibold text-gray-900 mb-1">🚀 Automatic Setup (Coming Soon)</h4>
            <p className="text-sm text-gray-600">One-click connection with OAuth</p>
          </div>
          
          <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${integrationMethod === 'manual' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
               onClick={() => setIntegrationMethod('manual')}>
            <h4 className="font-semibold text-gray-900 mb-1">⚙️ Manual Setup</h4>
            <p className="text-sm text-gray-600">Use private app access token</p>
          </div>
        </div>
      </div>

      {integrationMethod === 'manual' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Manual Setup Instructions</h4>
          <div className="text-sm text-yellow-800 space-y-2">
            <p><strong>1.</strong> Go to your Shopify Admin → Apps → "App and sales channel settings"</p>
            <p><strong>2.</strong> Click "Develop apps for your store" → "Create an app"</p>
            <p><strong>3.</strong> Enable Admin API access with scopes: read_orders, read_customers, read_products</p>
            <p><strong>4.</strong> Install the app and copy the Admin API access token</p>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-yellow-900 mb-2">
              Admin API Access Token
            </label>
            <input
              type="password"
              value={manualCreds.accessToken}
              onChange={(e) => setManualCreds({...manualCreds, accessToken: e.target.value})}
              placeholder="shpat_..."
              className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isLoading || (integrationMethod === 'manual' && !manualCreds.accessToken)}
        className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Setting up your store...
          </>
        ) : (
          <>
            🚀 Connect Store & Continue
          </>
        )}
      </button>
    </div>
  );

  const renderProgressStep = () => {
    const steps = {
      'creating-org': { icon: '🏢', title: 'Creating your organization...', desc: 'Setting up your workspace' },
      'connecting-store': { icon: '🔌', title: 'Connecting your Shopify store...', desc: 'Testing connection and syncing data' }
    };
    
    const currentStep = steps[step];
    
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-pulse">{currentStep.icon}</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentStep.title}</h3>
        <p className="text-gray-600 mb-6">{currentStep.desc}</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  };

  const renderSuccessStep = () => (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-2xl font-bold text-green-600 mb-2">Store Connected Successfully!</h3>
      <p className="text-gray-600 mb-6">
        Your {storeData.businessName} chatbot is now ready to help customers with orders, products, and support.
      </p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
        <h4 className="font-semibold text-green-900 mb-2">🤖 Your Chatbot Can Now:</h4>
        <ul className="text-sm text-green-800 space-y-1 text-left">
          <li>• Track customer orders in real-time</li>
          <li>• Answer product questions</li>
          <li>• Help with order status and shipping</li>
          <li>• Escalate complex issues to your team</li>
        </ul>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          🚀 Start Using Your Chatbot
        </button>
        
        <div className="text-sm text-gray-500">
          You can customize your bot's personality and add more features in the dashboard.
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {step === 'store-info' && renderStoreInfoStep()}
      {(step === 'creating-org' || step === 'connecting-store') && renderProgressStep()}
      {step === 'success' && renderSuccessStep()}
    </div>
  );
};

export default MultiStoreOnboarding;