/**
 * API utility functions
 */

/**
 * Get the API base URL
 * Works in development and production
 */
export function getApiUrl(endpoint = '') {
  // In production on Vercel, use relative paths
  if (import.meta.env.PROD) {
    return endpoint;
  }
  
  // In development, check if we have a custom API URL
  const apiBase = import.meta.env.VITE_API_URL || '';
  
  return apiBase ? `${apiBase}${endpoint}` : endpoint;
}

/**
 * Make an API request with proper error handling
 */
export async function apiRequest(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Re-throw with more context
    if (error.message === 'Failed to fetch') {
      throw new Error(`Cannot reach API at ${url}. Please check your connection.`);
    }
    throw error;
  }
}
