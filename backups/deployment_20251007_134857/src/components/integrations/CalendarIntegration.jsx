import React, { useState, useEffect } from 'react';
import { calendarService } from '../../services/integrations/calendarService';

const CalendarIntegration = ({ isOpen, onClose, onConnect, currentConfigs, selectedPlatform }) => {
  const [activeTab, setActiveTab] = useState(selectedPlatform || 'google_calendar');
  const [configs, setConfigs] = useState({
    google_calendar: {
      accessToken: '',
      refreshToken: '',
      calendarId: 'primary',
      status: 'disconnected'
    },
    calendly: {
      accessToken: '',
      organizationUri: '',
      bookingUrl: '',
      status: 'disconnected'
    }
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResults, setConnectionResults] = useState({});

  // Feature settings for each platform
  const [features, setFeatures] = useState({
    google_calendar: {
      meetingScheduling: true,
      availabilityCheck: true,
      eventCreation: true,
      calendarSync: true,
      reminderSetup: true,
      timeZoneHandling: true
    },
    calendly: {
      appointmentBooking: true,
      meetingLinks: true,
      eventTypeManagement: true,
      availabilitySync: true,
      customization: true,
      integrationWebhooks: true
    }
  });

  useEffect(() => {
    if (currentConfigs) {
      setConfigs({
        google_calendar: currentConfigs.google_calendar || { 
          accessToken: '', refreshToken: '', calendarId: 'primary', status: 'disconnected' 
        },
        calendly: currentConfigs.calendly || { 
          accessToken: '', organizationUri: '', bookingUrl: '', status: 'disconnected' 
        }
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

  const initiateGoogleOAuth = () => {
    // In a real implementation, this would redirect to Google OAuth
    const clientId = 'your-google-client-id';
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/google/callback`);
    const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar');
    const authUrl = `https://accounts.google.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;
    
    // For demo purposes, we'll simulate the OAuth flow
    alert('In a real implementation, this would redirect you to Google OAuth. For demo purposes, enter a mock access token.');
  };

  const initiateCalendlyOAuth = () => {
    // In a real implementation, this would redirect to Calendly OAuth
    const clientId = 'your-calendly-client-id';
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/calendly/callback`);
    const authUrl = `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
    
    // For demo purposes, we'll simulate the OAuth flow
    alert('In a real implementation, this would redirect you to Calendly OAuth. For demo purposes, enter a mock access token.');
  };

  const testConnection = async (platform) => {
    if (platform === 'google_calendar' && !configs.google_calendar.accessToken) {
      setConnectionResults(prev => ({
        ...prev,
        google_calendar: {
          success: false,
          message: 'Please provide a Google Calendar access token'
        }
      }));
      return;
    }

    if (platform === 'calendly' && !configs.calendly.accessToken) {
      setConnectionResults(prev => ({
        ...prev,
        calendly: {
          success: false,
          message: 'Please provide a Calendly access token'
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
      calendarService[platform === 'google_calendar' ? 'googleConfig' : 'calendlyConfig'] = testConfig;
      calendarService.initializeConfigs();

      let result;
      if (platform === 'google_calendar') {
        result = await calendarService.testGoogleConnection();
      } else if (platform === 'calendly') {
        result = await calendarService.testCalendlyConnection();
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
      calendarService[platform === 'google_calendar' ? 'googleConfig' : 'calendlyConfig'] = finalConfig;
      calendarService.initializeConfigs();

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
    const platformName = platform === 'google_calendar' ? 'Google Calendar' : 'Calendly';
    if (confirm(`Are you sure you want to disconnect ${platformName}? This will stop all calendar features for this platform.`)) {
      localStorage.removeItem(`${platform}_config`);
      setConfigs(prev => ({
        ...prev,
        [platform]: platform === 'google_calendar' 
          ? { accessToken: '', refreshToken: '', calendarId: 'primary', status: 'disconnected' }
          : { accessToken: '', organizationUri: '', bookingUrl: '', status: 'disconnected' }
      }));
      onConnect(platform, null);
    }
  };

  const isFormValid = (platform) => {
    if (platform === 'google_calendar') {
      return configs.google_calendar.accessToken.trim() !== '';
    }
    if (platform === 'calendly') {
      return configs.calendly.accessToken.trim() !== '';
    }
    return false;
  };

  if (!isOpen) return null;

  const googleConnected = configs.google_calendar?.status === 'connected';
  const calendlyConnected = configs.calendly?.status === 'connected';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">📅</div>
              <div>
                <h2 className="text-2xl font-bold">Calendar Integration</h2>
                <p className="text-blue-100">Connect with Google Calendar and Calendly for seamless scheduling</p>
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
              onClick={() => setActiveTab('google_calendar')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'google_calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-2xl">📅</span>
              <span>Google Calendar</span>
              {googleConnected && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
            </button>
            <button
              onClick={() => setActiveTab('calendly')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'calendly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-2xl">🗓️</span>
              <span>Calendly</span>
              {calendlyConnected && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
            </button>
          </div>

          {/* Google Calendar Configuration */}
          {activeTab === 'google_calendar' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Google Calendar Setup</h3>
                  <p className="text-gray-600">
                    Connect with Google Calendar to enable meeting scheduling, availability checking, and event management.
                  </p>
                </div>
                {googleConnected && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Connected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* OAuth Setup */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Authentication</h4>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 text-xl">🔐</span>
                      <div>
                        <h5 className="font-medium text-blue-800">OAuth 2.0 Setup</h5>
                        <p className="text-sm text-blue-700 mt-1">
                          Google Calendar requires OAuth 2.0 authentication for secure access to your calendar data.
                        </p>
                        <button
                          onClick={initiateGoogleOAuth}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Authenticate with Google
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Token (For Demo) *
                    </label>
                    <input
                      type="password"
                      value={configs.google_calendar.accessToken}
                      onChange={(e) => handleInputChange('google_calendar', 'accessToken', e.target.value)}
                      placeholder="ya29.a0AfH6SMC..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      In production, this would be handled automatically via OAuth
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calendar ID
                    </label>
                    <select
                      value={configs.google_calendar.calendarId}
                      onChange={(e) => handleInputChange('google_calendar', 'calendarId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="primary">Primary Calendar</option>
                      <option value="business">Business Calendar</option>
                      <option value="meetings">Meetings Calendar</option>
                    </select>
                  </div>

                  {/* Setup Instructions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">📋 Setup Instructions</h5>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Cloud Console</a></li>
                      <li>2. Create a new project or select existing project</li>
                      <li>3. Enable the Google Calendar API</li>
                      <li>4. Create OAuth 2.0 credentials</li>
                      <li>5. Add your domain to authorized origins</li>
                    </ol>
                  </div>

                  {/* Connection Test */}
                  <div className="space-y-3">
                    <button
                      onClick={() => testConnection('google_calendar')}
                      disabled={!isFormValid('google_calendar') || isTestingConnection}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                    >
                      {isTestingConnection && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    {connectionResults.google_calendar && (
                      <div className={`p-3 rounded-lg ${
                        connectionResults.google_calendar.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${
                            connectionResults.google_calendar.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {connectionResults.google_calendar.success ? '✅' : '❌'}
                          </span>
                          <span className={`text-sm font-medium ${
                            connectionResults.google_calendar.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {connectionResults.google_calendar.message}
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
                        key: 'meetingScheduling',
                        name: 'Meeting Scheduling',
                        description: 'Schedule meetings through chat interactions',
                        icon: '📋'
                      },
                      {
                        key: 'availabilityCheck',
                        name: 'Availability Check',
                        description: 'Check available time slots automatically',
                        icon: '⏰'
                      },
                      {
                        key: 'eventCreation',
                        name: 'Event Creation',
                        description: 'Create calendar events from chat',
                        icon: '📅'
                      },
                      {
                        key: 'calendarSync',
                        name: 'Calendar Sync',
                        description: 'Real-time calendar synchronization',
                        icon: '🔄'
                      },
                      {
                        key: 'reminderSetup',
                        name: 'Reminder Setup',
                        description: 'Automatic meeting reminders',
                        icon: '⏰'
                      },
                      {
                        key: 'timeZoneHandling',
                        name: 'Time Zone Handling',
                        description: 'Smart time zone management',
                        icon: '🌍'
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
                            checked={features.google_calendar[feature.key]}
                            onChange={() => handleFeatureToggle('google_calendar', feature.key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                {googleConnected ? (
                  <button
                    onClick={() => handleDisconnect('google_calendar')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect('google_calendar')}
                    disabled={!connectionResults.google_calendar?.success || isConnecting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                  >
                    {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    <span>{isConnecting ? 'Connecting...' : 'Connect Google Calendar'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Calendly Configuration */}
          {activeTab === 'calendly' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Calendly Setup</h3>
                  <p className="text-gray-600">
                    Connect with Calendly to enable appointment booking, meeting links, and automated scheduling workflows.
                  </p>
                </div>
                {calendlyConnected && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                    Connected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* API Setup */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">API Configuration</h4>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-orange-500 text-xl">🔐</span>
                      <div>
                        <h5 className="font-medium text-orange-800">OAuth Setup Required</h5>
                        <p className="text-sm text-orange-700 mt-1">
                          Calendly requires OAuth 2.0 authentication for API access.
                        </p>
                        <button
                          onClick={initiateCalendlyOAuth}
                          className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          Authenticate with Calendly
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Token (For Demo) *
                    </label>
                    <input
                      type="password"
                      value={configs.calendly.accessToken}
                      onChange={(e) => handleInputChange('calendly', 'accessToken', e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Personal Access Token from your Calendly integrations page
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization URI
                    </label>
                    <input
                      type="text"
                      value={configs.calendly.organizationUri}
                      onChange={(e) => handleInputChange('calendly', 'organizationUri', e.target.value)}
                      placeholder="https://api.calendly.com/organizations/AAAAAAAAAAAAAAAA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Page URL
                    </label>
                    <input
                      type="text"
                      value={configs.calendly.bookingUrl}
                      onChange={(e) => handleInputChange('calendly', 'bookingUrl', e.target.value)}
                      placeholder="https://calendly.com/your-username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  {/* Setup Instructions */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">📋 Setup Instructions</h5>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Log in to your <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">Calendly account</a></li>
                      <li>2. Go to Integrations → API & Webhooks</li>
                      <li>3. Create a Personal Access Token</li>
                      <li>4. Copy your Organization URI from the API docs</li>
                      <li>5. Enter your public booking page URL</li>
                    </ol>
                  </div>

                  {/* Connection Test */}
                  <div className="space-y-3">
                    <button
                      onClick={() => testConnection('calendly')}
                      disabled={!isFormValid('calendly') || isTestingConnection}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                    >
                      {isTestingConnection && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      <span>{isTestingConnection ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    {connectionResults.calendly && (
                      <div className={`p-3 rounded-lg ${
                        connectionResults.calendly.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${
                            connectionResults.calendly.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {connectionResults.calendly.success ? '✅' : '❌'}
                          </span>
                          <span className={`text-sm font-medium ${
                            connectionResults.calendly.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {connectionResults.calendly.message}
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
                        key: 'appointmentBooking',
                        name: 'Appointment Booking',
                        description: 'Direct booking links in chat responses',
                        icon: '📅'
                      },
                      {
                        key: 'meetingLinks',
                        name: 'Meeting Links',
                        description: 'Dynamic meeting link generation',
                        icon: '🔗'
                      },
                      {
                        key: 'eventTypeManagement',
                        name: 'Event Types',
                        description: 'Manage different types of meetings',
                        icon: '📋'
                      },
                      {
                        key: 'availabilitySync',
                        name: 'Availability Sync',
                        description: 'Real-time availability checking',
                        icon: '⏰'
                      },
                      {
                        key: 'customization',
                        name: 'Custom Branding',
                        description: 'Branded booking experience',
                        icon: '🎨'
                      },
                      {
                        key: 'integrationWebhooks',
                        name: 'Webhook Integration',
                        description: 'Real-time booking notifications',
                        icon: '🔔'
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
                            checked={features.calendly[feature.key]}
                            onChange={() => handleFeatureToggle('calendly', feature.key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                {calendlyConnected ? (
                  <button
                    onClick={() => handleDisconnect('calendly')}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect('calendly')}
                    disabled={!connectionResults.calendly?.success || isConnecting}
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                  >
                    {isConnecting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-span"></div>}
                    <span>{isConnecting ? 'Connecting...' : 'Connect Calendly'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Integration Benefits */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🗓️</div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Calendar Integration Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <h5 className="font-medium mb-1">⚡ Instant Scheduling</h5>
                    <p>Book meetings directly from chat conversations</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">📊 Smart Availability</h5>
                    <p>Real-time availability checking across platforms</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">🔄 Automatic Sync</h5>
                    <p>Keep all calendars synchronized and up-to-date</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">🎯 Reduced Friction</h5>
                    <p>Eliminate back-and-forth scheduling emails</p>
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

export default CalendarIntegration;