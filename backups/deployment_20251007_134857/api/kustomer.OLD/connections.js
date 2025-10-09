// Get User's Kustomer Connections Endpoint
// /api/kustomer/connections.js

import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('user_kustomer_connections')
      .select(`
        id,
        kustomer_user_id,
        kustomer_user_email,
        kustomer_user_name,
        subdomain,
        connection_type,
        status,
        permissions,
        created_at,
        updated_at,
        last_sync,
        token_expires_at
      `)
      .eq('user_id', user_id)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Database query failed: ${error.message}`);
    }

    // Add additional status info
    const connectionsWithStatus = data?.map(conn => ({
      ...conn,
      isExpired: conn.token_expires_at ? new Date(conn.token_expires_at) < new Date() : false,
      needsRefresh: conn.token_expires_at ? 
        (new Date(conn.token_expires_at).getTime() - new Date().getTime()) < (5 * 60 * 1000) : false
    })) || [];

    res.json({
      success: true,
      connections: connectionsWithStatus
    });

  } catch (error) {
    console.error('Error getting user connections:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}