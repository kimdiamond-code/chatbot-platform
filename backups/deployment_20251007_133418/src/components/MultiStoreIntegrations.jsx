import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '../services/supabase';
import { apiKeysService } from '../services/apiKeysService.js';
import MultiStoreOnboarding from './MultiStoreOnboarding.jsx';

const MultiStoreIntegrations = () => {
  const [activeView, setActiveView] = useState('overview');
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [connectedStores, setConnectedStores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setIsLoading(true);
    try {
      if (!isSupabaseAvailable()) {
        // Demo mode
        setOrganizations([
          { id: 'demo-1', name: 'Demo Store', slug: 'demo-store', plan: 'pro', email: 'demo@store.com' }
        ]);
        setCurrentOrg(organizations[0]);
        setIsLoading(false);
        return;
      }

      const { data: orgs, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrganizations(orgs || []);
      
      // Set current org to first one or demo
      if (orgs && orgs.length > 0) {
        setCurrentOrg(orgs[0]);
        await loadConnectedStores(orgs[0].id);
      }

    } catch (error) {
      console.error('Error loading organizations:', error);
      // Fallback to demo data
      setOrganizations([
        { id: 'demo-1', name: 'Demo Organization', slug: 'demo', plan: 'enterprise' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConnectedStores = async (organizationId) => {
    try {
      const { data: integrations, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('integration_id', 'shopify');

      if (error) throw error;

      setConnectedStores(integrations || []);
    } catch (error) {
      console.error('Error loading connected stores:', error);
      setConnectedStores([]);
    }
  };

  const handleStoreConnected = async (storeData) => {
    setShowOnboarding(false);
    await loadOrganizations();
    if (storeData.organization) {
      setCurrentOrg(storeData.organization);
      await loadConnectedStores(storeData.organization.id);
    }
  };

  const handleDisconnectStore = async (integrationId, storeName) => {
    if (!confirm(`Are you sure you want to disconnect ${storeName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('integrations')
        .update({ 
          status: 'disconnected',
          credentials: {},
          connected_at: null 
        })
        .eq('id', integrationId);

      if (error) throw error;

      await loadConnectedStores(currentOrg.id);
    } catch (error) {
      console.error('Error disconnecting store:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="text-6xl animate-bounce-subtle mb-4">🏪</div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Multi-Store Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Connect multiple Shopify stores and manage them all from one powerful chatbot platform.
        </p>
      </div>

      {/* Current Organization */}
      {currentOrg && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Current Organization</h2>
              <p className="text-gray-600">Managing stores for this organization</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{connectedStores.filter(s => s.status === 'connected').length}</div>
              <div className="text-sm text-gray-500">Connected Stores</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{currentOrg.name}</h3>
                <p className="text-sm text-gray-600">{currentOrg.email}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                  currentOrg.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                  currentOrg.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {currentOrg.plan?.toUpperCase()} Plan
                </span>
              </div>
              <button
                onClick={() => setActiveView('organizations')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Switch Organization
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connected Stores */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Connected Stores</h2>
            <p className="text-gray-600">Shopify stores connected to this organization</p>
          </div>
          <button
            onClick={() => setShowOnboarding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Connect New Store
          </button>
        </div>

        {connectedStores.length > 0 ? (
          <div className="space-y-4">
            {connectedStores.map(store => (
              <div key={store.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🛍️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{store.store_identifier}</h3>
                      <p className="text-sm text-gray-600">{store.config?.shop_data?.name || store.integration_name}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          store.status === 'connected' ? 'bg-green-100 text-green-800' :
                          store.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {store.status === 'connected' ? '✅ Connected' :
                           store.status === 'pending' ? '⏳ Pending' :
                           '⚪ Disconnected'}
                        </span>
                        {store.last_sync_at && (
                          <span className="text-xs text-gray-500">
                            Last sync: {new Date(store.last_sync_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {store.status === 'connected' && (
                      <button
                        onClick={() => testStoreConnection(store)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                      >
                        Test Connection
                      </button>
                    )}
                    <button
                      onClick={() => handleDisconnectStore(store.id, store.store_identifier)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
                
                {store.config?.shop_data && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Domain:</span>
                        <p className="font-medium">{store.config.shop_data.domain}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Currency:</span>
                        <p className="font-medium">{store.config.shop_data.currency}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Country:</span>
                        <p className="font-medium">{store.config.shop_data.country}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Connected:</span>
                        <p className="font-medium">{new Date(store.connected_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores connected yet</h3>
            <p className="text-gray-600 mb-6">
              Connect your first Shopify store to start using the chatbot platform.
            </p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Your First Store
            </button>
          </div>
        )}
      </div>

      {/* Platform Features */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🔄</div>
            <h3 className="font-semibold text-gray-900 mb-1">Multi-Store Support</h3>
            <p className="text-sm text-gray-600">Connect unlimited Shopify stores</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-1">Smart Order Tracking</h3>
            <p className="text-sm text-gray-600">Real-time order lookup across all stores</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="font-semibold text-gray-900 mb-1">Unified Dashboard</h3>
            <p className="text-sm text-gray-600">Manage all stores from one place</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-1">Cross-Store Search</h3>
            <p className="text-sm text-gray-600">Find orders and products across stores</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">🏷️</div>
            <h3 className="font-semibold text-gray-900 mb-1">Custom Branding</h3>
            <p className="text-sm text-gray-600">White-label for each organization</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">Performance metrics per store</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrganizations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
          <p className="text-gray-600">Switch between different organizations or create new ones</p>
        </div>
        <button
          onClick={() => setActiveView('overview')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          ← Back to Overview
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map(org => (
          <div key={org.id} className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            currentOrg?.id === org.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
               onClick={() => {
                 setCurrentOrg(org);
                 loadConnectedStores(org.id);
                 setActiveView('overview');
               }}>
            <div className="text-center">
              <div className="text-4xl mb-3">🏢</div>
              <h3 className="font-semibold text-gray-900">{org.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{org.email}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                org.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                org.plan === 'pro' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {org.plan?.toUpperCase()}
              </span>
              {currentOrg?.id === org.id && (
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Current</span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 cursor-pointer transition-colors"
             onClick={() => setShowOnboarding(true)}>
          <div className="text-4xl mb-3">➕</div>
          <h3 className="font-semibold text-gray-900">Add New Organization</h3>
          <p className="text-sm text-gray-600">Connect a new store or business</p>
        </div>
      </div>
    </div>
  );

  const testStoreConnection = async (store) => {
    try {
      const { multiStoreShopifyService } = await import('../services/integrations/multiStoreShopifyService.js');
      
      multiStoreShopifyService.setOrganization(currentOrg.id);
      const result = await multiStoreShopifyService.testStoreConnection(store.store_identifier, currentOrg.id);
      
      if (result.success) {
        alert(`✅ Connection successful!\nStore: ${result.data.shopName}\nDomain: ${result.data.domain}`);
      } else {
        alert(`❌ Connection failed: ${result.message}`);
      }
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {showOnboarding ? (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Connect New Store</h2>
              <button
                onClick={() => setShowOnboarding(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <MultiStoreOnboarding 
              onStoreConnected={handleStoreConnected}
              currentOrg={currentOrg}
            />
          </div>
        </div>
      ) : (
        <>
          {/* Navigation */}
          <div className="max-w-6xl mx-auto mb-6">
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('organizations')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === 'organizations' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Organizations
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="max-w-6xl mx-auto">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'organizations' && renderOrganizations()}
          </div>
        </>
      )}
    </div>
  );
};

export default MultiStoreIntegrations;