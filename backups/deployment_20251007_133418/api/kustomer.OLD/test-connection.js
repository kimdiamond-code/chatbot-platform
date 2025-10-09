// Test Manual Kustomer Connection Endpoint
// /api/kustomer/test-connection.js

import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subdomain, apiKey, userId } = req.body;

    if (!subdomain || !apiKey || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain, API key, and user ID are required'
      });
    }

    // Test API connection
    const testResponse = await fetch(`https://${subdomain}.api.kustomerapp.com/v1/users/me`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}));
      
      let errorMessage = 'Invalid credentials';
      if (testResponse.status === 401) {
        errorMessage = 'Invalid API key or insufficient permissions';
      } else if (testResponse.status === 404) {
        errorMessage = 'Invalid subdomain or organization not found';
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      throw new Error(`Connection test failed: ${testResponse.status} - ${errorMessage}`);
    }

    const userData = await testResponse.json();
    const user = userData.data;
    const organizationId = user.relationships?.organization?.data?.id;

    // Encrypt the API key for storage
    const encryptedApiKey = encryptSensitiveData(apiKey);

    res.json({
      success: true,
      message: `Connected as ${user.attributes.displayName || user.attributes.email}`,
      kustomerUser: user,
      organizationId: organizationId,
      encryptedApiKey: encryptedApiKey
    });

  } catch (error) {
    console.error('Manual connection test error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

// Simple encryption for demo (use proper encryption in production)
function encryptSensitiveData(data) {
  // In production, use proper encryption like AES with environment key
  // const crypto = require('crypto');
  // const key = process.env.ENCRYPTION_KEY;
  // const cipher = crypto.createCipher('aes-256-cbc', key);
  // let encrypted = cipher.update(data, 'utf8', 'hex');
  // encrypted += cipher.final('hex');
  // return encrypted;
  
  // For demo purposes, using base64 encoding
  return Buffer.from(data).toString('base64');
}