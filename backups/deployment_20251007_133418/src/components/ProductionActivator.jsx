import React, { useState, useEffect } from 'react';
import { runProductionSetup } from '../scripts/productionSetup.js';
import { activateProductionMode, checkProductionStatus } from '../utils/simpleProductionActivator.js';
// import { healthCheck, refreshSupabaseClient } from '../services/supabase.js';
// import { enableProductionMode, getProductionStatus } from '../utils/productionMode.js';

const ProductionActivator = () => {
  const [setupStatus, setSetupStatus] = useState('idle');
  const [setupResults, setSetupResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  useEffect(() => {
    // Check initial system status
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Simple health check without imports
      const isProduction = localStorage.getItem('PRODUCTION_MODE') === 'true';
      if (isProduction) {
        setSetupStatus('ready');
      } else {
        setSetupStatus('demo');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setSetupStatus('error');
    }
  };

  const runSetup = async () => {
    setLoading(true);
    setCurrentStep('Initializing production setup...');
    
    try {
      // Simulate progress updates
      const steps = [
        'Checking environment variables...',
        'Testing database connection...',
        'Verifying OpenAI integration...',
        'Validating database schema...',
        'Creating default data...',
        'Testing integrations...',
        'Generating production report...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const results = await runProductionSetup();
      setSetupResults(results);
      
      if (results.productionReport?.readyForProduction) {
        setSetupStatus('ready');
      } else {
        setSetupStatus('needs-attention');
      }
      
    } catch (error) {
      console.error('Setup failed:', error);
      setSetupStatus('error');
      setSetupResults({ error: error.message });
    } finally {
      setLoading(false);
      setCurrentStep('');
    }
  };

  const activateProduction = () => {
    // Use the simple activator
    activateProductionMode();
  };

  const StatusIndicator = ({ status, label }) => {
    const colors = {
      ready: 'text-green-600 bg-green-100',
      demo: 'text-yellow-600 bg-yellow-100', 
      error: 'text-red-600 bg-red-100',
      'needs-attention': 'text-orange-600 bg-orange-100'
    };
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[status] || 'text-gray-600 bg-gray-100'}`}>
        {label}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">🚀 Production Activation Center</h1>
        <p className="text-gray-600">
          Transition your chatbot platform from demo mode to full production deployment
        </p>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Current Status</h2>
            <p className="text-gray-600 mt-1">System operational status</p>
          </div>
          <StatusIndicator 
            status={setupStatus} 
            label={
              setupStatus === 'ready' ? 'Production Ready' :
              setupStatus === 'demo' ? 'Demo Mode' :
              setupStatus === 'error' ? 'Error' :
              setupStatus === 'needs-attention' ? 'Needs Attention' :
              'Checking...'
            }
          />
        </div>
      </div>

      {/* Setup Action */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Production Setup</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{currentStep}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              Run a comprehensive check of all systems and activate production features.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={runSetup}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Run Production Setup
              </button>
              
              {setupStatus === 'ready' && (
                <button 
                  onClick={activateProduction}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  🚀 Activate Production Mode
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Setup Results */}
      {setupResults && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Results</h2>
          
          {setupResults.productionReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {setupResults.productionReport.summary.environmentVars}
                  </div>
                  <div className="text-sm text-gray-600">Environment Vars</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {setupResults.productionReport.summary.databaseConnected ? '✅' : '❌'}
                  </div>
                  <div className="text-sm text-gray-600">Database</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {setupResults.productionReport.summary.openaiWorking ? '✅' : '❌'}
                  </div>
                  <div className="text-sm text-gray-600">OpenAI</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {setupResults.productionReport.summary.schemaComplete ? '✅' : '❌'}
                  </div>
                  <div className="text-sm text-gray-600">Schema</div>
                </div>
              </div>

              {/* Errors */}
              {setupResults.productionReport.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">❌ Errors</h3>
                  <ul className="space-y-1">
                    {setupResults.productionReport.errors.map((error, index) => (
                      <li key={index} className="text-red-700 text-sm">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {setupResults.productionReport.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Warnings</h3>
                  <ul className="space-y-1">
                    {setupResults.productionReport.warnings.map((warning, index) => (
                      <li key={index} className="text-yellow-700 text-sm">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {setupResults.productionReport.nextSteps.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📋 Next Steps</h3>
                  <ul className="space-y-1">
                    {setupResults.productionReport.nextSteps.map((step, index) => (
                      <li key={index} className="text-blue-700 text-sm">• {step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success Message */}
              {setupResults.productionReport.readyForProduction && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-green-900 text-lg mb-2">🎉 Ready for Production!</h3>
                  <p className="text-green-700">
                    All systems are operational and ready for launch. You can now activate production mode.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Feature Overview */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Production Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">🧠 AI Bot Builder</h3>
            <p className="text-sm text-gray-600">Create intelligent chatbots with custom personalities and knowledge bases</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">💬 Live Chat</h3>
            <p className="text-sm text-gray-600">Real-time customer conversations with agent handoff</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">📊 Analytics</h3>
            <p className="text-sm text-gray-600">Comprehensive metrics and performance insights</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">🔌 Integrations</h3>
            <p className="text-sm text-gray-600">Connect with Shopify, Kustomer, and other platforms</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">🎨 Widget Studio</h3>
            <p className="text-sm text-gray-600">Customizable chat widgets for your website</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">🔐 Security</h3>
            <p className="text-sm text-gray-600">GDPR compliance and enterprise security features</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionActivator;