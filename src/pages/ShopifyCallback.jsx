import React, { useEffect, useState } from 'react';

const ShopifyCallback = () => {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Processing your Shopify connection...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const shop = urlParams.get('shop');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      // Check for OAuth errors
      if (error) {
        setStatus('error');
        setMessage(`Authorization failed: ${error}`);
        setTimeout(() => window.location.href = '/?shopify=error', 5000);
        return;
      }

      // Validate required parameters
      if (!code || !shop || !state) {
        setStatus('error');
        setMessage('Missing required OAuth parameters');
        setTimeout(() => window.location.href = '/?shopify=error', 5000);
        return;
      }

      setMessage('Exchanging authorization code for access token...');

      // Exchange code for access token
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'shopify_oauth_callback',
          shop: shop,
          code: code,
          state: state,
          organizationId: '00000000-0000-0000-0000-000000000001'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete OAuth flow');
      }

      // Store credentials in localStorage (since database isn't working)
      const shopifyConfig = {
        shopDomain: data.shopDomain,
        accessToken: data.accessToken,
        scope: data.scope,
        shopInfo: data.shopInfo,
        connectedAt: new Date().toISOString(),
        connectionType: 'oauth'
      };
      
      localStorage.setItem('shopify_credentials', JSON.stringify(shopifyConfig));
      
      setStatus('success');
      setMessage('Successfully connected your Shopify store!');
      
      // Redirect back to integrations page
      setTimeout(() => {
        window.location.href = '/?shopify=connected';
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(`Connection failed: ${error.message}`);
      setTimeout(() => window.location.href = '/?shopify=error', 5000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return '🔄';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '🔄';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-200">
        <div className="text-6xl mb-6 animate-pulse">
          {getStatusIcon()}
        </div>
        
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'processing' && 'Connecting...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Connection Failed'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {status === 'processing' && (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-500">Please wait...</span>
          </div>
        )}
        
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              🎉 Your Shopify store is now connected! Redirecting you back to the integrations page...
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Don't worry - you can try connecting again from the integrations page.
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = '/?shopify=error'}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Integrations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopifyCallback;