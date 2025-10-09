import React, { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';

const BotHealthCheck = () => {
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runHealthCheck = async () => {
    setTesting(true);
    const health = {
      environment: { status: 'testing', message: '' },
      openai: { status: 'testing', message: '' },
      botService: { status: 'testing', message: '' },
      messageFlow: { status: 'testing', message: '' }
    };
    setResults({ ...health });

    // Test 1: Environment
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const dbUrl = import.meta.env.DATABASE_URL;
      
      health.environment = {
        status: 'success',
        message: `Environment: ${import.meta.env.MODE} | OpenAI Key: ${apiKey ? '✅ Present' : '❌ Missing'} | Database: ${dbUrl ? '✅ Connected' : '❌ Missing'}`
      };
    } catch (error) {
      health.environment = {
        status: 'error',
        message: `Environment check failed: ${error.message}`
      };
    }
    setResults({ ...health });

    // Test 2: OpenAI Service
    try {
      const { chatBotService } = await import('../../services/openaiService');
      await chatBotService.getOpenAIClient();
      
      health.openai = {
        status: 'success',
        message: 'OpenAI service initialized successfully'
      };
    } catch (error) {
      health.openai = {
        status: 'warning',
        message: `OpenAI unavailable (will use fallbacks): ${error.message}`
      };
    }
    setResults({ ...health });

    // Test 3: Bot Service Response
    try {
      const { chatBotService } = await import('../../services/openaiService');
      const testResponse = await chatBotService.generateResponse('test', 'health-check-test');
      
      if (testResponse && testResponse.response) {
        health.botService = {
          status: 'success',
          message: `Bot responding: "${testResponse.response.substring(0, 50)}..." (Source: ${testResponse.source})`
        };
      } else {
        health.botService = {
          status: 'warning',
          message: 'Bot service returned empty response'
        };
      }
    } catch (error) {
      health.botService = {
        status: 'error',
        message: `Bot service failed: ${error.message}`
      };
    }
    setResults({ ...health });

    // Test 4: Full Message Flow
    try {
      const { enhancedBotService } = await import('../../services/enhancedBotService');
      const messageResult = await enhancedBotService.processMessage(
        'Hello, this is a test message',
        'health-check-conv',
        'test@example.com'
      );
      
      if (messageResult && messageResult.response) {
        health.messageFlow = {
          status: 'success',
          message: `Full flow working: "${messageResult.response.substring(0, 50)}..." (Source: ${messageResult.source})`
        };
      } else {
        health.messageFlow = {
          status: 'error',
          message: 'Message flow returned no response'
        };
      }
    } catch (error) {
      health.messageFlow = {
        status: 'error',
        message: `Message flow failed: ${error.message}`
      };
    }
    
    setResults({ ...health });
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'testing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'testing':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Bot Health Check
        </h2>
        
        <p className="text-gray-600 mb-6">
          Test if the chatbot is working on this deployed environment.
        </p>

        <button
          onClick={runHealthCheck}
          disabled={testing}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mb-6"
        >
          <Play className="w-5 h-5" />
          <span>{testing ? 'Running Health Check...' : 'Run Health Check'}</span>
        </button>

        {results && (
          <div className="space-y-4">
            {/* Environment */}
            <div className={`p-4 rounded-lg border ${getStatusColor(results.environment.status)}`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(results.environment.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    1. Environment Check
                  </h3>
                  <p className="text-sm text-gray-700">
                    {results.environment.message}
                  </p>
                </div>
              </div>
            </div>

            {/* OpenAI */}
            <div className={`p-4 rounded-lg border ${getStatusColor(results.openai.status)}`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(results.openai.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    2. OpenAI Service
                  </h3>
                  <p className="text-sm text-gray-700">
                    {results.openai.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Bot Service */}
            <div className={`p-4 rounded-lg border ${getStatusColor(results.botService.status)}`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(results.botService.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    3. Bot Service Test
                  </h3>
                  <p className="text-sm text-gray-700">
                    {results.botService.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Message Flow */}
            <div className={`p-4 rounded-lg border ${getStatusColor(results.messageFlow.status)}`}>
              <div className="flex items-start space-x-3">
                {getStatusIcon(results.messageFlow.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    4. Full Message Flow
                  </h3>
                  <p className="text-sm text-gray-700">
                    {results.messageFlow.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Diagnosis:</h3>
              <div className="text-sm text-gray-700 space-y-2">
                {results.messageFlow.status === 'success' ? (
                  <div className="text-green-700 font-medium">
                    ✅ Bot is fully functional! You should be able to chat normally.
                  </div>
                ) : results.messageFlow.status === 'error' ? (
                  <div>
                    <div className="text-red-700 font-medium mb-2">
                      ❌ Bot is not responding. Possible issues:
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {results.environment.status === 'error' && (
                        <li>Check environment variables in Vercel dashboard</li>
                      )}
                      {results.openai.status === 'error' && (
                        <li>OpenAI API key may be invalid or missing</li>
                      )}
                      {results.botService.status === 'error' && (
                        <li>Bot service initialization failed - check console logs</li>
                      )}
                      <li>Open browser console (F12) and look for red errors</li>
                      <li>Try redeploying the application</li>
                    </ul>
                  </div>
                ) : (
                  <div className="text-yellow-700">
                    ⚠️ Bot may have limited functionality. Check warnings above.
                  </div>
                )}
              </div>
            </div>

            {/* Browser Console Reminder */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">🔍 Next Steps:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>1. Open browser console (Press F12)</li>
                <li>2. Go to Live Chat tab</li>
                <li>3. Send a test message: "Hello"</li>
                <li>4. Watch console for any errors or logs</li>
                <li>5. Share the console output if issues persist</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BotHealthCheck;
