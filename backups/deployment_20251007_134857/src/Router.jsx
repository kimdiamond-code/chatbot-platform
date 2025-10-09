import React from 'react';
import App from './App.jsx';
import KustomerOAuthCallback from './pages/KustomerOAuthCallback.jsx';
import ShopifyCallback from './pages/ShopifyCallback.jsx';

const Router = () => {
  const pathname = window.location.pathname;

  // Handle Kustomer OAuth callback
  if (pathname === '/auth/kustomer/callback') {
    return <KustomerOAuthCallback />;
  }

  // Handle Shopify OAuth callback
  if (pathname === '/shopify/callback') {
    return <ShopifyCallback />;
  }

  // Default to main app
  return <App />;
};

export default Router;
