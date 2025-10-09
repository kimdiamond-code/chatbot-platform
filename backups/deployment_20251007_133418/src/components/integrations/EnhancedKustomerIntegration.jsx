import React, { useState, useEffect } from 'react';
import { realKustomerService } from '../../services/integrations/realKustomerService';

const EnhancedKustomerIntegration = ({ isOpen, onClose, onConnect, currentConfig }) => {
  const [config, setConfig] = useState({
    apiKey: '',
    organizationId: '',
    subdomain: '',
    enableTicketCreation: true,
    enableCustomerLookup: true,
    enableConversationSync: true,
    enableAutoAssignment: false,
    defaultPriority: 'medium',
    defaultTeam: '',
    enableDebugMode: false,
    webhookUrl: '',
    ...currentConfig
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [connectionMessage, setConnectionMessage] = useState('');
  const [teams, setTeams] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    if (currentConfig) {
      setConfig({ ...config, ...currentConfig });
    }
  }, [currentConfig]);

  const validateConfig = () => {
    const errors = [];
    
    if (!config.apiKey) {
      errors.push('API Key is required');
    } else if (!config.apiKey.startsWith('ey')) {
      errors.push('API Key should start with "ey"');
    }
    
    if (!config.organizationId) {
      errors.push('Organization ID is required');
    }
    
    if (!config.subdomain) {
      errors.push('Subdomain is required');
    } else if (config.subdomain.includes('.')) {
      errors.push('Subdomain should not include dots (e.g., use "yourcompany" not "yourcompany.kustomerapp.com")');
    }
    
    return errors;
  };

  const testConnection = async () => {
    const errors = validateConfig();
    if (errors.length > 0) {
      setConnectionStatus('error');
      setConnectionMessage(`Validation errors: ${errors.join(', ')}`);
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('testing');
    setConnectionMessage('Testing API connection...');

    try {
      // Temporarily update the service config for testing
      const tempService = Object.create(realKustomerService);
      tempService.config = {
        ...config,
        status: 'connected'
      };
      tempService.initializeConfig();

      // Test connection
      const connectionResult = await tempService.testConnection();
      
      // Test customer lookup
      setConnectionMessage('Testing customer lookup...');
      const testCustomer = await tempService.findCustomer('test@example.com');
      
      // Test team retrieval if enabled
      let teamData = [];
      if (config.enableAutoAssignment) {
        setConnectionMessage('Loading teams...');
        teamData = await tempService.getTeams();
        setTeams(teamData);
      }

      setTestResults({
        connection: connectionResult,
        customerLookup: { success: true, found: !!testCustomer },
        teams: teamData,
        timestamp: new Date().toISOString()
      });

      setConnectionStatus('success');
      setConnectionMessage(`✅ Connection successful! Connected as ${connectionResult.user.attributes.displayName || connectionResult.user.attributes.email}`);

    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage(`❌ Connection failed: ${error.message}`);
      setTestResults(null);
      console.error('Kustomer connection test failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    const errors = validateConfig();
    if (errors.length > 0) {
      setConnectionStatus('error');
      setConnectionMessage(`Please fix: ${errors.join(', ')}`);
      return;
    }

    if (!testResults) {
      setConnectionStatus('warning');
      setConnectionMessage('Please test the connection first');
      return;
    }

    setIsConnecting(true);

    try {
      // Save configuration
      const kustomerConfig = {
        ...config,
        connectedAt: new Date().toISOString(),
        status: 'connected',
        connectionTest: testResults
      };
      
      localStorage.setItem('kustomer_config', JSON.stringify(kustomerConfig));
      
      setConnectionStatus('success');
      setConnectionMessage('✅ Kustomer integration configured successfully!');
      
      setTimeout(() => {
        onConnect(kustomerConfig);
        onClose();
      }, 1500);

    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage(`Failed to save configuration: ${error.message}`);
      console.error('Kustomer configuration save failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', name: 'Basic Setup', icon: '🔧' },
    { id: 'features', name: 'Features', icon: '⚙️' },
    { id: 'advanced', name: 'Advanced', icon: '🚀' },
    { id: 'test', name: 'Test & Deploy', icon: '🧪' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎧</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kustomer CRM Integration</h2>
              <p className="text-gray-600">Enterprise customer support & ticketing system</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Connection Status Alert */}
        {connectionStatus && (
          <div className={`mx-6 mt-4 p-4 rounded-lg border ${
            connectionStatus === 'testing' ? 'bg-blue-50 border-blue-200' :
            connectionStatus === 'success' ? 'bg-green-50 border-green-200' :
            connectionStatus === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start space-x-2">
              {connectionStatus === 'testing' && (
                <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mt-0.5"></div>
              )}
              <div className="flex-1">
                <p className={`font-medium ${
                  connectionStatus === 'testing' ? 'text-blue-800' :
                  connectionStatus === 'success' ? 'text-green-800' :
                  connectionStatus === 'warning' ? 'text-yellow-800' :
                  'text-red-800'
                }`}>
                  {connectionMessage}
                </p>
                {testResults && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>✅ API Connection: Success</p>
                    <p>✅ Customer Lookup: {testResults.customerLookup.found ? 'Working' : 'Working (no test customer found)'}</p>
                    {testResults.teams.length > 0 && (
                      <p>✅ Teams Found: {testResults.teams.length}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-6 pt-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Basic Setup Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key *
                    </label>
                    <input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Starts with 'ey...' (e.g., eyJhbGciOiJIUzI1NiJ9...)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Your Kustomer API key from Settings → API Keys</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization ID *
                      </label>
                      <input
                        type="text"
                        value={config.organizationId}
                        onChange={(e) => setConfig({...config, organizationId: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="org_123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subdomain *
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={config.subdomain}
                          onChange={(e) => setConfig({...config, subdomain: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="yourcompany"
                        />
                        <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 text-sm whitespace-nowrap">
                          .api.kustomerapp.com
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">📋 Quick Setup Guide</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>1.</strong> Login to your Kustomer admin panel</p>
                  <p><strong>2.</strong> Go to Settings → API Keys → Create API Key</p>
                  <p><strong>3.</strong> Grant permissions: customers:*, conversations:*, messages:*, notes:*</p>
                  <p><strong>4.</strong> Copy the API key and Organization ID</p>
                  <p><strong>5.</strong> Your subdomain is the part before .kustomerapp.com in your URL</p>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Features</h3>
                <div className="space-y-4">
                  {[
                    {
                      key: 'enableCustomerLookup',
                      title: 'Customer Lookup',
                      description: 'Automatically find existing customers by email address',
                      icon: '🔍'
                    },
                    {
                      key: 'enableConversationSync',
                      title: 'Conversation Sync',
                      description: 'Sync all chat conversations to customer timeline in Kustomer',
                      icon: '🔄'
                    },
                    {
                      key: 'enableTicketCreation',
                      title: 'Ticket Creation',
                      description: 'Automatically create support tickets for escalated conversations',
                      icon: '🎫'
                    },
                    {
                      key: 'enableAutoAssignment',
                      title: 'Auto Assignment',
                      description: 'Automatically assign tickets to designated teams or agents',
                      icon: '👥'
                    }
                  ].map(feature => (
                    <div key={feature.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{feature.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config[feature.key]}
                          onChange={(e) => setConfig({...config, [feature.key]: e.target.checked})}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Priority
                    </label>
                    <select
                      value={config.defaultPriority}
                      onChange={(e) => setConfig({...config, defaultPriority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Team
                    </label>
                    <select
                      value={config.defaultTeam}
                      onChange={(e) => setConfig({...config, defaultTeam: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={teams.length === 0}
                    >
                      <option value="">Select Team (test connection first)</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.attributes.name}</option>
                      ))}
                    </select>
                    {teams.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Teams will be loaded after testing connection</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Configuration</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={config.webhookUrl}
                      onChange={(e) => setConfig({...config, webhookUrl: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://your-domain.com/api/webhooks/kustomer"
                    />
                    <p className="text-xs text-gray-500 mt-1">Receive real-time updates from Kustomer</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">Debug Mode</h4>
                      <p className="text-sm text-gray-600">Enable detailed logging for troubleshooting</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.enableDebugMode}
                        onChange={(e) => setConfig({...config, enableDebugMode: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">⚠️ API Rate Limits</h4>
                <div className="text-sm text-yellow-800 space-y-1">
                  <p><strong>Rate Limits:</strong> 100 requests/minute, 10,000/day</p>
                  <p><strong>Burst Limit:</strong> 10 requests/second</p>
                  <p><strong>Retry Logic:</strong> Automatic with exponential backoff</p>
                  <p><strong>Monitoring:</strong> Enable debug mode to track API usage</p>
                </div>
              </div>
            </div>
          )}

          {/* Test & Deploy Tab */}
          {activeTab === 'test' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Testing</h3>
                
                <div className="space-y-4">
                  <button
                    onClick={testConnection}
                    disabled={isConnecting}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isConnecting ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Testing Connection...</span>
                      </>
                    ) : (
                      <>
                        <span>🧪</span>
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>

                  {testResults && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-3">✅ Connection Test Results</h4>
                      <div className="space-y-2 text-sm text-green-800">
                        <div className="flex justify-between">
                          <span>API Connection:</span>
                          <span className="font-medium">✅ Success</span>
                        </div>
                        <div className="flex justify-between">
                          <span>User Info:</span>
                          <span className="font-medium">{testResults.connection.user.attributes.displayName || testResults.connection.user.attributes.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Customer Lookup:</span>
                          <span className="font-medium">✅ Working</span>
                        </div>
                        {testResults.teams.length > 0 && (
                          <div className="flex justify-between">
                            <span>Teams Available:</span>
                            <span className="font-medium">{testResults.teams.length} teams found</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Test Time:</span>
                          <span className="font-medium">{new Date(testResults.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {config.enableDebugMode && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">🔍 Debug Information</h4>
                      <div className="text-xs text-gray-600 font-mono">
                        <p>API Base URL: https://{config.subdomain}.api.kustomerapp.com/v1</p>
                        <p>Organization ID: {config.organizationId}</p>
                        <p>API Key: {config.apiKey ? `${config.apiKey.substring(0, 8)}...` : 'Not set'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">🚀 Ready to Deploy?</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>After testing successfully, click "Connect Kustomer" to activate the integration.</p>
                  <div className="space-y-1">
                    <p><strong>Enabled Features:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {config.enableCustomerLookup && <li>Customer lookup by email</li>}
                      {config.enableConversationSync && <li>Conversation synchronization</li>}
                      {config.enableTicketCreation && <li>Automatic ticket creation</li>}
                      {config.enableAutoAssignment && <li>Auto team assignment</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            {activeTab !== 'test' && (
              <button
                onClick={() => setActiveTab('test')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Test First
              </button>
            )}
            
            <button
              onClick={handleConnect}
              disabled={!testResults || isConnecting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isConnecting && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
              <span>{isConnecting ? 'Connecting...' : '🔌 Connect Kustomer'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedKustomerIntegration;