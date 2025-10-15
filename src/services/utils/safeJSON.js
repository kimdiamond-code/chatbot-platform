// Safe JSON utilities for API responses
const safeJSONParse = async (response) => {
  try {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ JSON Parse Error:', e);
      console.log('📝 Raw response:', text);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  } catch (e) {
    console.error('❌ Response Text Error:', e);
    throw new Error('Failed to read response body');
  }
};

// Enhanced fetch with retries and proper error handling
const safeFetch = async (url, options = {}, maxRetries = 3) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 10000)));
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await safeJSONParse(response);
    } catch (error) {
      console.error(`❌ Attempt ${attempt + 1} failed:`, error);
      lastError = error;

      // Don't retry certain errors
      if (error.status === 401 || error.status === 403) {
        throw new Error('Authentication failed');
      }
    }
  }

  // All retries failed
  throw lastError || new Error('Failed to fetch data');
};

export { safeJSONParse, safeFetch };