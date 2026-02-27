import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';

const Microsoft365Integration = ({ isOpen, onClose, onConnect }) => {
  const { user } = useAuth();
  const organizationId = user?.organizationId;
  const [step, setStep] = useState('connect');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [existingConfig, setExistingConfig] = useState(null);
  const [settings, setSettings] = useState({
    autoReply: true,
    notifyAgents: true,
    replyFromName: '',
    replySignature: ''
  });

  useEffect(() => {
    if (isOpen && organizationId) loadExisting();
  }, [isOpen, organizationId]);

  const loadExisting = async () => {
    try {
      const res = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'getIntegrationCredentials',
          organizationId,
          provider: 'microsoft365'
        })
      });
      const data = await res.json();
      if (data.success && data.credentials) {
        setExistingConfig(data.credentials);
        setStep('connected');
        if (data.credentials.settings) {
          setSettings(prev => ({ ...prev, ...data.credentials.settings }));
        }
      }
    } catch (e) {}
  };

  const handleOAuthConnect = async () => {
    setError('');
    setIsConnecting(true);
    try {
      const res = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'microsoft365_oauth_initiate',
          organizationId
        })
      });
      const data = await res.json();
      if (!data.success || !data.authUrl) throw new Error(data.error || 'Failed to start OAuth');
      window.location.href = data.authUrl;
    } catch (err) {
      setError(err.message);
      setIsConnecting(false);
    }
  };

  const saveSettings = async () => {
    setError('');
    setIsConnecting(true);
    try {
      const res = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'saveIntegrationCredentials',
          integration: 'microsoft365',
          organizationId,
          credentials: { ...existingConfig, settings }
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to save settings');
      setStep('connected');
      onConnect && onConnect({ provider: 'microsoft365', settings });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!confirm('Disconnect Microsoft 365? AI will stop auto-replying to emails.')) return;
    setIsConnecting(true);
    try {
      await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'saveIntegrationCredentials',
          integration: 'microsoft365',
          organizationId,
          credentials: { status: 'disconnected' }
        })
      });
      setExistingConfig(null);
      setStep('connect');
      onConnect && onConnect(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📬</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Microsoft 365 Email</h2>
              <p className="text-gray-500 text-sm">AI-powered email inbox for agents</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        {step === 'connect' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h3 className="font-semibold text-blue-900 mb-3">✉️ What this enables:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Incoming emails appear in your agent inbox</li>
                <li>• AI auto-replies instantly using your bot's directives and knowledge base</li>
                <li>• Agents can view threads and override with manual replies</li>
                <li>• Shopify order data included in AI context when available</li>
                <li>• Full email history synced per customer contact</li>
              </ul>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">🔐 How it works:</h3>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal ml-4">
                <li>Click Connect — you'll be redirected to Microsoft to authorize</li>
                <li>Approve read/send mail permissions</li>
                <li>Configure auto-reply settings</li>
                <li>AI begins monitoring your inbox and replying automatically</li>
              </ol>
            </div>
            <button
              onClick={handleOAuthConnect}
              disabled={isConnecting}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isConnecting
                ? <><div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />Redirecting to Microsoft...</>
                : <>🔗 Connect Microsoft 365</>}
            </button>
          </div>
        )}

        {step === 'inbox-settings' && (
          <div className="space-y-5">
            <h3 className="font-semibold text-gray-900 text-lg">Configure Email Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reply From Name</label>
              <input type="text" value={settings.replyFromName}
                onChange={e => setSettings(s => ({ ...s, replyFromName: e.target.value }))}
                placeholder="e.g. True Citrus Support"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Signature</label>
              <textarea value={settings.replySignature}
                onChange={e => setSettings(s => ({ ...s, replySignature: e.target.value }))}
                placeholder={"Best regards,\nThe Support Team"}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 text-sm">AI Auto-Reply</p>
                <p className="text-xs text-gray-500">Bot replies automatically to all incoming emails</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.autoReply}
                  onChange={e => setSettings(s => ({ ...s, autoReply: e.target.checked }))} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900 text-sm">Notify Agents</p>
                <p className="text-xs text-gray-500">Alert agents when new emails arrive</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={settings.notifyAgents}
                  onChange={e => setSettings(s => ({ ...s, notifyAgents: e.target.checked }))} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={saveSettings} disabled={isConnecting}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                {isConnecting ? 'Saving...' : 'Save & Activate'}
              </button>
            </div>
          </div>
        )}

        {step === 'connected' && (
          <div className="space-y-5">
            <div className="text-center py-4">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="text-xl font-bold text-green-600">Microsoft 365 Connected</h3>
              <p className="text-gray-500 text-sm mt-1">AI is monitoring your inbox and auto-replying</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2 text-sm text-green-800">
              <p>✉️ <strong>Auto-reply:</strong> {settings.autoReply ? 'Enabled' : 'Disabled'}</p>
              <p>🔔 <strong>Agent notifications:</strong> {settings.notifyAgents ? 'Enabled' : 'Disabled'}</p>
              <p>📬 <strong>Inbox:</strong> View emails in the <strong>Conversations</strong> tab → Email filter</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('inbox-settings')}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                ⚙️ Settings
              </button>
              <button onClick={disconnect} disabled={isConnecting}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium">
                {isConnecting ? 'Disconnecting...' : '🔌 Disconnect'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Microsoft365Integration;
