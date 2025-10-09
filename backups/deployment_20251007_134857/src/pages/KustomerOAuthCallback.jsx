import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { kustomerOAuthService } from '../services/integrations/kustomerOAuthService';

const KustomerOAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your Kustomer authentication...');
  const [error, setError] = useState(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Extract parameters from URL
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      // Check for OAuth errors
      if (error) {
        setStatus('error');
        setMessage(`Authentication failed: ${errorDescription || error}`);
        setError(error);
        return;
      }

      // Check for required parameters
      if (!code || !state) {
        setStatus('error');
        setMessage('Missing required OAuth parameters. Please try connecting again.');
        setError('missing_parameters');
        return;
      }

      setMessage('Verifying authentication with Kustomer...');

      // Handle the OAuth callback
      const result = await kustomerOAuthService.handleOAuthCallback(code, state);

      if (result.success) {
        setStatus('success');
        setMessage('✅ Successfully connected to your Kustomer account!');
        
        // Store success info for the parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'kustomer_oauth_success',
            connection: result.connection,
            user: result.user
          }, window.location.origin);
        }

        // Redirect to integrations page after a short delay
        setTimeout(() => {
          if (window.opener) {
            window.close();
          } else {
            navigate('/integrations?kustomer=connected');
          }
        }, 3000);

      } else {
        setStatus('error');
        setMessage(`Authentication failed: ${result.error}`);
        setError(result.error);
      }

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(`An error occurred during authentication: ${error.message}`);
      setError(error.message);
    }
  };

  const handleRetry = () => {
    if (window.opener) {
      window.opener.postMessage({
        type: 'kustomer_oauth_retry'
      }, window.location.origin);
      window.close();
    } else {
      navigate('/integrations');
    }
  };

  const handleClose = () => {
    if (window.opener) {
      window.opener.postMessage({
        type: 'kustomer_oauth_closed'
      }, window.location.origin);
      window.close();
    } else {
      navigate('/integrations');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
            {status === 'processing' && (
              <div className="animate-spin w-8 h-8 border-3 border-white border-t-transparent rounded-full"></div>
            )}
            {status === 'success' && (
              <span className="text-white text-2xl">✅</span>
            )}
            {status === 'error' && (
              <span className="text-white text-2xl">❌</span>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kustomer Authentication
          </h1>
        </div>

        {/* Status Message */}
        <div className="mb-8">
          <div className={`p-4 rounded-lg border-2 ${
            status === 'processing' ? 'border-blue-200 bg-blue-50' :
            status === 'success' ? 'border-green-200 bg-green-50' :
            'border-red-200 bg-red-50'
          }`}>
            <p className={`font-medium ${
              status === 'processing' ? 'text-blue-800' :
              status === 'success' ? 'text-green-800' :
              'text-red-800'
            }`}>
              {message}
            </p>
            
            {status === 'processing' && (
              <div className="flex items-center justify-center mt-4 space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-4">
                <p className="text-sm text-green-700">
                  You will be redirected automatically, or you can close this window.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="mt-4">
                <p className="text-sm text-red-700 mb-3">
                  Please try connecting again or contact support if the issue persists.
                </p>
                
                {error && (
                  <details className="text-left">
                    <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                      Technical Details
                    </summary>
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800 font-mono">
                      Error: {error}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {status === 'success' && (
            <button
              onClick={handleClose}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continue to Integrations
            </button>
          )}

          {status === 'error' && (
            <div className="space-y-2">
              <button
                onClick={handleRetry}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {status === 'processing' && (
            <button
              onClick={handleClose}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Check your popup blocker settings or contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KustomerOAuthCallback;