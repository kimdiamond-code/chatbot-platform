// Production Console Filter - Clean console for demos
if (import.meta.env.PROD || window.location.hostname.includes('vercel.app')) {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Silent mode by default, enable with: localStorage.setItem('DEBUG_MODE', 'true')
  const isDebugEnabled = () => localStorage.getItem('DEBUG_MODE') === 'true';
  
  // Expected errors/warnings that shouldn't show in production
  const expectedMessages = [
    'Failed to get Shopify credentials',
    'Invalid action or endpoint',
    'POST https://chatbot-platform-v2.vercel.app/api/consolidated 400',
    'HEAD https://chatbot-platform-v2.vercel.app/api/consolidated?check=1 400',
    'Failed to load resource: the server responded with a status of 400',
    'Shopify integration inactive',
    'API server',
    'Integration check',
    'Enhanced bot'
  ];
  
  const shouldSilence = (args) => {
    if (isDebugEnabled()) return false;
    const message = args.join(' ');
    return expectedMessages.some(expected => message.includes(expected));
  };
  
  console.log = (...args) => {
    if (!shouldSilence(args)) originalLog(...args);
  };
  
  console.info = (...args) => {
    if (!shouldSilence(args)) originalInfo(...args);
  };
  
  console.error = (...args) => {
    if (!shouldSilence(args)) originalError(...args);
  };
  
  console.warn = (...args) => {
    if (!shouldSilence(args)) originalWarn(...args);
  };
  
  // Add helper to enable debug
  window.enableDebug = () => {
    localStorage.setItem('DEBUG_MODE', 'true');
    originalLog('✅ Debug mode enabled - console logs now visible');
    originalLog('💡 Refresh the page to see all startup logs');
  };
  
  window.disableDebug = () => {
    localStorage.removeItem('DEBUG_MODE');
    originalLog('🔇 Debug mode disabled - console logs hidden');
  };
}

// Polyfill fetch FIRST - before anything else
import 'cross-fetch/polyfill'

import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './AppRouter.jsx'
import './index.css'

// ✅ Import QueryClient and Provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ✅ Create a single client instance
const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ✅ Wrap App in QueryClientProvider */}
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </React.StrictMode>,
)
