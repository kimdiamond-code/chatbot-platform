import React from 'react';
import App from './App.jsx';
import ShopifyCallback from './pages/ShopifyCallback.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import DataProcessingAgreement from './pages/DataProcessingAgreement.jsx';

const LEGAL_ROUTES = {
  '/privacy': PrivacyPolicy,
  '/terms': TermsOfService,
  '/dpa': DataProcessingAgreement,
};

const AppRouter = () => {
  const path = window.location.pathname;

  if (path === '/shopify/callback') {
    return <ShopifyCallback />;
  }

  const LegalPage = LEGAL_ROUTES[path];
  if (LegalPage) {
    return <LegalPage onBack={() => window.history.back()} />;
  }

  return <App />;
};

export default AppRouter;
