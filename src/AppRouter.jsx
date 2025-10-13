import React from 'react';
import App from './App.jsx';
import ShopifyCallback from './pages/ShopifyCallback.jsx';

// Router component that doesn't use hooks
const AppRouter = () => {
  // Check the pathname BEFORE any component renders
  const isShopifyCallback = window.location.pathname === '/shopify/callback';
  
  if (isShopifyCallback) {
    return <ShopifyCallback />;
  }
  
  return <App />;
};

export default AppRouter;
