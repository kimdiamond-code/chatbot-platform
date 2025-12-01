import React from 'react';
import ReactDOM from 'react-dom/client';
// Use the lightweight Router so direct navigations to callback paths
// (e.g. /shopify/callback or /auth/kustomer/callback) render the
// dedicated callback pages before the main SPA mounts.
import Router from './Router.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);