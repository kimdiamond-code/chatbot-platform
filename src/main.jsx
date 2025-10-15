// Production Console Filter - Clean console for demos
if (import.meta.env.PROD || window.location.hostname.includes('vercel.app')) {
  const originalLog = console.log;
  const originalInfo = console.info;
  
  // Silent mode by default, enable with: localStorage.setItem('DEBUG_MODE', 'true')
  const isDebugEnabled = () => localStorage.getItem('DEBUG_MODE') === 'true';
  
  console.log = (...args) => {
    if (isDebugEnabled()) originalLog(...args);
  };
  
  console.info = (...args) => {
    if (isDebugEnabled()) originalInfo(...args);
  };
  
  // Keep errors and warnings visible
  // console.error and console.warn remain unchanged
  
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
