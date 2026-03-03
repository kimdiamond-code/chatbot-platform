// ============================================================
// SENTRY - Frontend Error Tracking
// ============================================================
import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Only initialize if DSN is configured
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE, // 'production' or 'development'
    
    // Capture 100% of errors, 10% of performance traces
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,

    // Don't send PII
    sendDefaultPii: false,

    // Ignore known non-critical noise
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Loading chunk \d+ failed/,
      /NetworkError when attempting to fetch resource/,
    ],

    beforeSend(event) {
      // Strip any tokens or credentials from breadcrumbs
      if (event.breadcrumbs?.values) {
        event.breadcrumbs.values = event.breadcrumbs.values.map(b => {
          if (b.data?.url) {
            b.data.url = b.data.url.replace(/access_token=[^&]+/, 'access_token=REDACTED');
          }
          return b;
        });
      }
      return event;
    },
  });
}

export { Sentry };
