import React, { useState, useEffect } from 'react';
import { dbService } from '../services/databaseService.js';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Icon Components
const PhoneIcon = () => <span className="text-xl">📞</span>;
const PhoneIncoming = () => <span className="text-xl">📲</span>;
const PhoneOutgoing = () => <span className="text-xl">📤</span>;
const PhoneMissed = () => <span className="text-xl">📵</span>;
const Settings = () => <span className="text-xl">⚙️</span>;
const User = () => <span className="text-xl">👤</span>;
const Clock = () => <span className="text-xl">🕐</span>;
const PlayCircle = () => <span className="text-xl">▶️</span>;
const PauseCircle = () => <span className="text-xl">⏸️</span>;
const Download = () => <span className="text-xl">⬇️</span>;
const Mic = () => <span className="text-xl">🎤</span>;
const VolumeX = () => <span className="text-xl">🔇</span>;

const PhoneAgent = () => {
  const [callHistory, setCallHistory] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [phoneConfig, setPhoneConfig] = useState({
    enabled: false,
    provider: 'twilio',
    phoneNumber: '',
    voicemail: true,
    callRecording: true,
    callForwarding: {
      enabled: false,
      number: ''
    },
    businessHours: {
      enabled: false,
      timezone: 'UTC',
      start: '09:00',
      end: '17:00'
    },
    greeting: 'Thank you for calling. How may I help you today?',
    voicemailGreeting: 'Sorry we missed your call. Please leave a message after the tone.'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'incoming', 'outgoing', 'missed'

  useEffect(() => {
    loadPhoneConfig();
    loadCallHistory();
  }, []);

  const loadPhoneConfig = async () => {
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        const settings = JSON.parse(dbConfig.settings || '{}');
        if (settings.phoneAgent) {
          setPhoneConfig(settings.phoneAgent);
        }
      }
    } catch (error) {
      console.error('Error loading phone config:', error);
    }
  };

  const loadCallHistory = async () => {
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        const settings = JSON.parse(dbConfig.settings || '{}');
        setCallHistory(settings.callHistory || []);
      }
    } catch (error) {
      console.error('Error loading call history:', error);
    }
  };

  const savePhoneConfig = async () => {
    setSaveStatus('saving');
    try {
      const configs = await dbService.getBotConfigs(DEFAULT_ORG_ID);
      const dbConfig = configs && configs.length > 0 ? configs[0] : null;
      
      if (dbConfig) {
        const settings = JSON.parse(dbConfig.settings || '{}');
        settings.phoneAgent = phoneConfig;
        settings.callHistory = callHistory;
        
        await dbService.saveBotConfig({
          ...dbConfig,
          settings: JSON.stringify(settings)
        });
        
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Error saving phone config:', error);
      setSaveStatus('error');
    }
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (type, status) => {
    if (status === 'missed') return <PhoneMissed />;
    if (type === 'incoming') return <PhoneIncoming />;
    return <PhoneOutgoing />;
  };

  const getCallColor = (type, status) => {
    if (status === 'missed') return 'text-red-600';
    if (type === 'incoming') return 'text-green-600';
    return 'text-blue-600';
  };

  const filteredCalls = callHistory.filter(call => {
    if (activeTab === 'all') return true;
    if (activeTab === 'missed') return call.status === 'missed';
    return call.type === activeTab;
  });

  const downloadRecording = (recordingUrl) => {
    // In production, this would download the actual recording
    console.log('Downloading recording:', recordingUrl);
    alert('Recording download would start here');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      {/* Sidebar - Call History */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PhoneIcon /> Phone Agent
            </h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              title="Settings"
            >
              <Settings />
            </button>
          </div>

          {/* Status Indicator */}
          <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg mb-4 ${
            phoneConfig.enabled 
              ? 'bg-green-50 text-green-800' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              phoneConfig.enabled ? 'bg-green-600 animate-pulse' : 'bg-gray-400'
            }`}></div>
            {phoneConfig.enabled ? 'Phone Active' : 'Phone Inactive'}
            {phoneConfig.enabled && phoneConfig.phoneNumber && (
              <span className="ml-auto text-xs">{formatPhoneNumber(phoneConfig.phoneNumber)}</span>
            )}
          </div>

          {/* Call Type Filter */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'all', label: 'All', count: callHistory.length },
              { id: 'incoming', label: 'In', count: callHistory.filter(c => c.type === 'incoming').length },
              { id: 'outgoing', label: 'Out', count: callHistory.filter(c => c.type === 'outgoing').length },
              { id: 'missed', label: 'Missed', count: callHistory.filter(c => c.status === 'missed').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500'}`}>
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Call History List */}
        <div className="flex-1 overflow-y-auto">
          {filteredCalls.length === 0 ? (
            <div className="text-center py-12 px-4">
              <PhoneIcon />
              <p className="text-gray-600 mt-2 text-sm">
                No {activeTab !== 'all' ? activeTab : ''} calls yet
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Configure phone settings to start
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredCalls.map((call) => (
                <button
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedCall?.id === call.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`text-2xl ${getCallColor(call.type, call.status)}`}>
                        {getCallIcon(call.type, call.status)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {call.customerName || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatPhoneNumber(call.phoneNumber)}
                        </div>
                      </div>
                    </div>
                    {call.duration && (
                      <span className="text-xs text-gray-600">
                        {formatDuration(call.duration)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Clock />
                    {new Date(call.timestamp).toLocaleString([], { 
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                    {call.recordingUrl && (
                      <span className="ml-auto text-blue-600">🎙️ Recorded</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {showSettings ? (
          /* Settings Panel */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Phone Agent Settings</h2>
              
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                {/* Enable/Disable */}
                <div>
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <h3 className="font-semibold text-gray-900">Enable Phone Agent</h3>
                      <p className="text-sm text-gray-600">Allow customers to reach you via phone</p>
                    </div>
                    <button
                      onClick={() => setPhoneConfig({ ...phoneConfig, enabled: !phoneConfig.enabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        phoneConfig.enabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          phoneConfig.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </label>
                </div>

                {/* Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Voice Provider
                  </label>
                  <select
                    value={phoneConfig.provider}
                    onChange={(e) => setPhoneConfig({ ...phoneConfig, provider: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="twilio">Twilio Voice</option>
                    <option value="vonage">Vonage</option>
                    <option value="bandwidth">Bandwidth</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneConfig.phoneNumber}
                    onChange={(e) => setPhoneConfig({ ...phoneConfig, phoneNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Greeting Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Greeting Message
                  </label>
                  <textarea
                    value={phoneConfig.greeting}
                    onChange={(e) => setPhoneConfig({ ...phoneConfig, greeting: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Thank you for calling..."
                  />
                </div>

                {/* Call Features */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={phoneConfig.voicemail}
                      onChange={(e) => setPhoneConfig({ ...phoneConfig, voicemail: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">Enable Voicemail</span>
                  </label>

                  {phoneConfig.voicemail && (
                    <div className="pl-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Voicemail Greeting
                      </label>
                      <textarea
                        value={phoneConfig.voicemailGreeting}
                        onChange={(e) => setPhoneConfig({ ...phoneConfig, voicemailGreeting: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={phoneConfig.callRecording}
                      onChange={(e) => setPhoneConfig({ ...phoneConfig, callRecording: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">Record Calls</span>
                  </label>
                </div>

                {/* Call Forwarding */}
                <div>
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={phoneConfig.callForwarding.enabled}
                      onChange={(e) => setPhoneConfig({
                        ...phoneConfig,
                        callForwarding: { ...phoneConfig.callForwarding, enabled: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span className="font-semibold text-gray-900">Enable Call Forwarding</span>
                  </label>

                  {phoneConfig.callForwarding.enabled && (
                    <div className="pl-6">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Forward to Number
                      </label>
                      <input
                        type="tel"
                        value={phoneConfig.callForwarding.number}
                        onChange={(e) => setPhoneConfig({
                          ...phoneConfig,
                          callForwarding: { ...phoneConfig.callForwarding, number: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                  )}
                </div>

                {/* Business Hours */}
                <div>
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={phoneConfig.businessHours.enabled}
                      onChange={(e) => setPhoneConfig({
                        ...phoneConfig,
                        businessHours: { ...phoneConfig.businessHours, enabled: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span className="font-semibold text-gray-900">Enable Business Hours</span>
                  </label>

                  {phoneConfig.businessHours.enabled && (
                    <div className="grid grid-cols-3 gap-4 pl-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timezone
                        </label>
                        <select
                          value={phoneConfig.businessHours.timezone}
                          onChange={(e) => setPhoneConfig({
                            ...phoneConfig,
                            businessHours: { ...phoneConfig.businessHours, timezone: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern</option>
                          <option value="America/Chicago">Central</option>
                          <option value="America/Denver">Mountain</option>
                          <option value="America/Los_Angeles">Pacific</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={phoneConfig.businessHours.start}
                          onChange={(e) => setPhoneConfig({
                            ...phoneConfig,
                            businessHours: { ...phoneConfig.businessHours, start: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={phoneConfig.businessHours.end}
                          onChange={(e) => setPhoneConfig({
                            ...phoneConfig,
                            businessHours: { ...phoneConfig.businessHours, end: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <button
                  onClick={savePhoneConfig}
                  disabled={saveStatus === 'saving'}
                  className={`w-full px-4 py-3 rounded-lg font-medium ${
                    saveStatus === 'saved' ? 'bg-green-600 text-white' :
                    saveStatus === 'error' ? 'bg-red-600 text-white' :
                    saveStatus === 'saving' ? 'bg-blue-400 text-white cursor-not-allowed' :
                    'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saveStatus === 'saved' ? '✅ Saved!' : 
                   saveStatus === 'error' ? '❌ Error' :
                   saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        ) : selectedCall ? (
          /* Call Details */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Call Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      selectedCall.status === 'missed' ? 'bg-red-100' :
                      selectedCall.type === 'incoming' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {getCallIcon(selectedCall.type, selectedCall.status)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedCall.customerName || 'Unknown Caller'}
                      </h2>
                      <p className="text-gray-600">
                        {formatPhoneNumber(selectedCall.phoneNumber)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Settings />
                  </button>
                </div>

                {/* Call Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Call Type</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {selectedCall.type} {selectedCall.status === 'missed' && '(Missed)'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900">
                      {selectedCall.duration ? formatDuration(selectedCall.duration) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedCall.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-semibold text-gray-900 capitalize">
                      {selectedCall.status}
                    </p>
                  </div>
                </div>

                {/* Recording */}
                {selectedCall.recordingUrl && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-900 flex items-center gap-2">
                        <Mic /> Call Recording
                      </h3>
                      <button
                        onClick={() => downloadRecording(selectedCall.recordingUrl)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Download /> Download
                      </button>
                    </div>
                    <div className="flex items-center gap-3 bg-white rounded-lg p-3">
                      <button className="text-2xl text-blue-600 hover:text-blue-700">
                        <PlayCircle />
                      </button>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div className="h-full w-1/3 bg-blue-600 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDuration(selectedCall.duration || 0)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Transcription */}
                {selectedCall.transcription && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Call Transcription</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                      {selectedCall.transcription}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                  <textarea
                    value={selectedCall.notes || ''}
                    onChange={(e) => {
                      const updated = callHistory.map(call => 
                        call.id === selectedCall.id ? { ...call, notes: e.target.value } : call
                      );
                      setCallHistory(updated);
                      setSelectedCall({ ...selectedCall, notes: e.target.value });
                    }}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this call..."
                  />
                  <button
                    onClick={savePhoneConfig}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No Call Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <PhoneIcon />
              <h3 className="text-xl font-semibold text-gray-900 mt-4">
                Select a call
              </h3>
              <p className="text-gray-600 mt-2">
                Choose a call from the history to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneAgent;
