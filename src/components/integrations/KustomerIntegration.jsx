import React, { useState, useEffect } from 'react';

const KustomerIntegration = ({ isOpen, onClose, onConnect, currentConfig }) => {
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
    ...currentConfig
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [teams, setTeams] = useState([
    { id: 'team_1', name: 'Customer Support' },
    { id: 'team_2', name: 'Technical Support' },
    { id: 'team_3', name: 'Sales Team' }
  ]);

  useEffect(() => {
    if (currentConfig) {
      setConfig({ ...config, ...currentConfig });
    }
  }, [currentConfig]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus('testing');

    try {
      // Validate required fields
      if (!config.apiKey || !config.organizationId || !config.subdomain) {
        throw new Error('Missing required credentials');
      }

      // Test connection to Kustomer
      const testUrl = `https://${config.subdomain}.api.kustomerapp.com/v1/customer`;
      
      // Simulate API call (in real implementation, you'd make the actual call)
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (config.apiKey.startsWith('ey') && config.organizationId && config.subdomain) {
            resolve();
          } else {
            reject(new Error('Invalid API credentials'));
          }
        }, 2000);
      });

      setConnectionStatus('success');
      
      // Save configuration
      const kustomerConfig = {
        ...config,
        connectedAt: new Date().toISOString(),
        status: 'connected'
      };
      
      localStorage.setItem('kustomer_config', JSON.stringify(kustomerConfig));
      
      setTimeout(() => {
        onConnect(kustomerConfig);
        onClose();
      }, 1000);

    } catch (error) {
      setConnectionStatus('error');
      console.error('Kustomer connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎧</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kustomer Integration</h2>
              <p className="text-gray-600">Connect your Kustomer CRM for seamless customer support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Connection Status */}
        {connectionStatus && (
          <div className={`mb-6 p-4 rounded-lg ${
            connectionStatus === 'testing' ? 'bg-yellow-50 border border-yellow-200' :
            connectionStatus === 'success' ? 'bg-green-50 border border-green-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {connectionStatus === 'testing' && (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                  <span className="text-yellow-800">Testing connection...</span>
                </>
              )}
              {connectionStatus === 'success' && (
                <>
                  <span className="text-green-600">✅</span>
                  <span className="text-green-800">Connection successful! Kustomer integration is ready.</span>
                </>
              )}
              {connectionStatus === 'error' && (
                <>
                  <span className="text-red-600">❌</span>
                  <span className="text-red-800">Connection failed. Please check your credentials.</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Basic Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization ID
                </label>
                <input
                  type="text"
                  value={config.organizationId}
                  onChange={(e) => setConfig({...config, organizationId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Kustomer Organization ID"
                />
                <p className="text-xs text-gray-500 mt-1">Found in your Kustomer settings under Organization</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={config.subdomain}
                    onChange={(e) => setConfig({...config, subdomain: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your-subdomain"
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600 text-sm">
                    .api.kustomerapp.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your Kustomer API key (starts with 'ey')"
                />
              </div>
            </div>
          </div>

          {/* Ticket Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Settings</h3>
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
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
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
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Features Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Features</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Automatic Ticket Creation</h4>
                  <p className="text-sm text-gray-600">Create Kustomer tickets for escalated conversations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableTicketCreation}
                    onChange={(e) => setConfig({...config, enableTicketCreation: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Customer Lookup</h4>
                  <p className="text-sm text-gray-600">Automatically lookup customer information</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableCustomerLookup}
                    onChange={(e) => setConfig({...config, enableCustomerLookup: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Conversation Sync</h4>
                  <p className="text-sm text-gray-600">Sync chat conversations to Kustomer timeline</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableConversationSync}
                    onChange={(e) => setConfig({...config, enableConversationSync: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Auto Assignment</h4>
                  <p className="text-sm text-gray-600">Automatically assign tickets to team members</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableAutoAssignment}
                    onChange={(e) => setConfig({...config, enableAutoAssignment: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Setup Instructions</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><strong>1.</strong> Log into your Kustomer admin panel</p>
              <p><strong>2.</strong> Go to Settings → API Keys</p>
              <p><strong>3.</strong> Click "Create API Key" and name it "ChatBot Integration"</p>
              <p><strong>4.</strong> Grant permissions: customers:read, conversations:write, tickets:write</p>
              <p><strong>5.</strong> Copy the generated API key (starts with 'ey')</p>
              <p><strong>6.</strong> Find your Organization ID in Settings → Organization</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!config.apiKey || !config.organizationId || !config.subdomain || isConnecting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isConnecting && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>}
            <span>{isConnecting ? 'Connecting...' : 'Connect Kustomer'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KustomerIntegration;