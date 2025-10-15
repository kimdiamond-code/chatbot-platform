// Production Console Filter - Clean console for demos
if (import.meta.env.PROD || window.location.hostname.includes('vercel.app')) {
  const originalLog = console.log;
  const originalInfo = console.info;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Silent mode by default, enable with: localStorage.setItem('DEBUG_MODE', 'true')
  const isDebugEnabled = () => localStorage.getItem('DEBUG_MODE') === 'true';
  
  // Expected messages that shouldn't show in production
  const silencePatterns = [
    /analytics service/i,
    /connected to neon/i,
    /checking shopify/i,
    /organization id/i,
    /initializing enhanced bot/i,
    /loading dashboard data/i,
    /shopify integration/i,
    /failed to get shopify/i,
    /invalid action or endpoint/i,
    /integration orchestrator/i,
    /initialization timestamp/i,
    /neon database connected/i,
    /api response/i,
    /loaded conversations/i,
    /dashboard data loaded/i,
    /checking integrations/i,
    /kustomer:/i,
    /debug credentials/i,
    /POST.*\/api\/consolidated.*400/i,
    /HEAD.*\/api\/consolidated.*400/i,
    /getCredentials/,
    /verifyConnection/,
    /initializeIntegrations/,
    /checkOnlineStatus/,
    /testConnection/
  ];
  
  const shouldSilence = (...args) => {
    if (isDebugEnabled()) return false;
    
    // Convert all args to string for pattern matching
    const message = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message + '\n' + arg.stack;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    }).join(' ');
    
    return silencePatterns.some(pattern => pattern.test(message));
  };
  
  console.log = (...args) => {
    if (!shouldSilence(...args)) originalLog(...args);
  };
  
  console.info = (...args) => {
    if (!shouldSilence(...args)) originalInfo(...args);
  };
  
  console.error = (...args) => {
    if (!shouldSilence(...args)) originalError(...args);
  };
  
  console.warn = (...args) => {
    if (!shouldSilence(...args)) originalWarn(...args);
  };
  
  // Add helper to enable debug
  window.enableDebug = () => {
    localStorage.setItem('DEBUG_MODE', 'true');
    originalLog('✅ Debug mode enabled - all console logs now visible');
    originalLog('💡 Refresh the page to see startup logs');
  };
  
  window.disableDebug = () => {
    localStorage.removeItem('DEBUG_MODE');
    originalLog('🔇 Debug mode disabled - console is now clean');
  };
  
  // Show helpful message on load
  if (!isDebugEnabled()) {
    originalLog('%cagenstack.ai chat', 'font-weight: bold; font-size: 16px; color: #4F46E5;');
    originalLog('%cConsole logs hidden for clean demo. Type window.enableDebug() to see all logs.', 'color: #6B7280; font-style: italic;');
  }
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
