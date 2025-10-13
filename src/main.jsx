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
