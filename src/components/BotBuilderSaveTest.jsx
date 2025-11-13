import React, { useState, useEffect } from 'react';

/**
 * Bot Builder Save Test Component
 * Minimal test to verify save functionality works
 */
const BotBuilderSaveTest = () => {
  const [instructions, setInstructions] = useState('');
  const [savedData, setSavedData] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const ORG_ID = '00000000-0000-0000-0000-000000000001';

  // Load current config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      console.log('📥 Loading bot config...');
      
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'getBotConfigs',
          orgId: ORG_ID
        })
      });

      const result = await response.json();
      console.log('📦 Load result:', result);

      if (result.success && result.data && result.data.length > 0) {
        const config = result.data[0];
        setInstructions(config.instructions || '');
        setSavedData(config);
        setStatus('✅ Loaded existing config');
        console.log('✅ Current instructions:', config.instructions);
      } else {
        setStatus('⚠️ No config found');
        console.log('⚠️ No bot config found');
      }
    } catch (error) {
      console.error('❌ Load error:', error);
      setStatus('❌ Load failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testSave = async () => {
    try {
      setLoading(true);
      setStatus('💾 Saving...');
      console.log('💾 Attempting save with instructions:', instructions);

      const payload = {
        endpoint: 'database',
        action: 'saveBotConfig',
        organization_id: ORG_ID,
        name: 'Test Bot',
        instructions: instructions,
        personality: JSON.stringify({ tone: 'friendly', avatar: '🤖' }),
        settings: JSON.stringify({ responseDelay: 1500 }),
        greeting_message: 'Hello! Test greeting.',
        fallback_message: 'I am not sure about that.'
      };

      // If updating existing config, include ID
      if (savedData?.id) {
        payload.id = savedData.id;
      }

      console.log('📤 Sending payload:', payload);

      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);

      const result = await response.json();
      console.log('📦 Save result:', result);

      if (result.success) {
        setSavedData(result.data);
        setStatus('✅ Saved successfully! ID: ' + result.data.id);
        console.log('✅ Save successful');
        
        // Reload to verify
        setTimeout(loadConfig, 1000);
      } else {
        setStatus('❌ Save failed: ' + (result.error || 'Unknown error'));
        console.error('❌ Save failed:', result);
      }
    } catch (error) {
      console.error('❌ Save error:', error);
      setStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      setLoading(true);
      setStatus('🔌 Testing connection...');
      
      const response = await fetch('/api/consolidated?check=1');
      const result = await response.json();
      
      console.log('🔌 Connection test:', result);
      setStatus(result.connected ? '✅ Database connected' : '❌ Database offline');
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setStatus('❌ Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">🧪 Bot Builder Save Test</h1>
        <p className="text-gray-600 mb-6">
          Minimal test component to verify bot instructions save functionality
        </p>

        {/* Status Display */}
        <div className={`p-4 rounded-lg mb-6 ${
          status.includes('✅') ? 'bg-green-50 text-green-800' :
          status.includes('❌') ? 'bg-red-50 text-red-800' :
          status.includes('⚠️') ? 'bg-yellow-50 text-yellow-800' :
          status.includes('💾') ? 'bg-blue-50 text-blue-800' :
          'bg-gray-50 text-gray-800'
        }`}>
          <p className="font-mono text-sm">{status || 'Ready to test'}</p>
        </div>

        {/* Saved Data Display */}
        {savedData && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Current Saved Config:</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">ID:</span> {savedData.id}</p>
              <p><span className="font-medium">Name:</span> {savedData.name}</p>
              <p><span className="font-medium">Instructions Length:</span> {savedData.instructions?.length || 0} chars</p>
              <p><span className="font-medium">Updated:</span> {new Date(savedData.updated_at).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Instructions Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bot Instructions (System Prompt)
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter bot instructions here..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Current length: {instructions.length} characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={testSave}
            disabled={loading || !instructions}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '⏳ Processing...' : '💾 Test Save'}
          </button>
          
          <button
            onClick={loadConfig}
            disabled={loading}
            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            🔄 Reload Config
          </button>
          
          <button
            onClick={testConnection}
            disabled={loading}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            🔌 Test Connection
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Steps:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Open browser console (F12)</li>
            <li>Click "Test Connection" to verify database</li>
            <li>Enter some text in the instructions field</li>
            <li>Click "Test Save"</li>
            <li>Check console logs for detailed output</li>
            <li>Click "Reload Config" to verify save persisted</li>
          </ol>
        </div>

        {/* Console Log Helper */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Expected Console Logs:</h3>
          <pre className="text-xs bg-white p-3 rounded overflow-x-auto">
{`✅ Successful Save Flow:
📥 Loading bot config...
📦 Load result: { success: true, data: [...] }
💾 Attempting save with instructions: [your text]
📤 Sending payload: { endpoint: 'database', action: 'saveBotConfig', ... }
📡 Response status: 200
📦 Save result: { success: true, data: { id: '...', ... } }
✅ Save successful

❌ Failed Save Flow:
📥 Loading bot config...
❌ Load error: [error details]
or
💾 Attempting save...
❌ Save error: [error details]`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default BotBuilderSaveTest;
