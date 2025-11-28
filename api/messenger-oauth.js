// ===================================================================
// MESSENGER OAUTH ENDPOINTS
// Handles OAuth flow for users to connect their Facebook Pages
// ===================================================================

import { getDatabase } from './database-config.js';
import tokenEncryptionService from './tokenEncryptionService.js';
import crypto from 'crypto';

let sql;
try {
  sql = getDatabase();
} catch (error) {
  console.error('❌ Database initialization failed:', error);
}

const MESSENGER_APP_ID = process.env.VITE_MESSENGER_APP_ID;
const MESSENGER_APP_SECRET = process.env.VITE_MESSENGER_APP_SECRET;
const REDIRECT_URI = process.env.MESSENGER_REDIRECT_URI || 'https://chatbot-platform-v2.vercel.app/api/oauth/messenger/callback';

export default async function handler(req, res) {
  const { method, query, url } = req;
  
  // Detect action from URL path
  const isRedirect = url.includes('/redirect');
  const isCallback = url.includes('/callback');

  // ============================================================
  // INITIATE OAUTH (Redirect to Facebook)
  // ============================================================
  if (isRedirect && method === 'GET') {
    const { organization_id } = query;

    if (!organization_id) {
      return res.status(400).json({ error: 'organization_id required' });
    }

    try {
      // Generate state token
      const state = Buffer.from(JSON.stringify({
        organization_id,
        timestamp: Date.now(),
        random: crypto.randomBytes(16).toString('hex')
      })).toString('base64');

      // Facebook OAuth permissions
      const scope = 'pages_messaging,pages_manage_metadata,pages_read_engagement';

      // Build Facebook OAuth URL
      const authUrl = 'https://www.facebook.com/v18.0/dialog/oauth?' +
        `client_id=${MESSENGER_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `state=${state}&` +
        `scope=${scope}`;

      console.log('🔀 Redirecting to Facebook OAuth');

      return res.redirect(authUrl);

    } catch (error) {
      console.error('❌ OAuth redirect failed:', error);
      return res.status(500).json({ error: 'Failed to initiate OAuth' });
    }
  }

  // ============================================================
  // OAUTH CALLBACK (Handle Facebook redirect)
  // ============================================================
  if (isCallback && method === 'GET') {
    const { code, state, error, error_description } = query;

    // Check for OAuth error
    if (error) {
      console.error('❌ Facebook OAuth error:', error, error_description);
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?messenger=error&message=${encodeURIComponent(error_description || error)}`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing OAuth parameters' });
    }

    try {
      // Decode state
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      const { organization_id } = stateData;

      console.log('✅ OAuth callback received for org:', organization_id);

      // Exchange code for user access token
      const tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token?' +
        `client_id=${MESSENGER_APP_ID}&` +
        `client_secret=${MESSENGER_APP_SECRET}&` +
        `code=${code}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

      const tokenResponse = await fetch(tokenUrl);
      
      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenResponse.status}`);
      }

      const tokenData = await tokenResponse.json();
      const userAccessToken = tokenData.access_token;

      console.log('🔑 User access token received');

      // Get user's pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`
      );

      if (!pagesResponse.ok) {
        throw new Error('Failed to fetch pages');
      }

      const pagesData = await pagesResponse.json();
      const pages = pagesData.data || [];

      if (pages.length === 0) {
        throw new Error('No Facebook Pages found. Create a page first.');
      }

      // For now, use the first page
      // TODO: Let user select which page to connect
      const page = pages[0];
      const pageAccessToken = page.access_token;
      const pageId = page.id;
      const pageName = page.name;

      console.log('📄 Connected to page:', pageName, pageId);

      // Exchange for long-lived token
      const longLivedUrl = 'https://graph.facebook.com/v18.0/oauth/access_token?' +
        `grant_type=fb_exchange_token&` +
        `client_id=${MESSENGER_APP_ID}&` +
        `client_secret=${MESSENGER_APP_SECRET}&` +
        `fb_exchange_token=${pageAccessToken}`;

      const longLivedResponse = await fetch(longLivedUrl);
      const longLivedData = await longLivedResponse.json();
      const longLivedToken = longLivedData.access_token || pageAccessToken;

      // Encrypt the token
      const encryptedToken = tokenEncryptionService.encrypt(longLivedToken);

      // Subscribe app to page (for webhooks)
      await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/subscribed_apps?` +
        `subscribed_fields=messages,messaging_postbacks&` +
        `access_token=${longLivedToken}`,
        { method: 'POST' }
      );

      // Store in database
      const existing = await sql`
        SELECT id FROM integrations 
        WHERE organization_id = ${organization_id} AND provider = 'messenger'
      `;

      if (existing.length > 0) {
        // Update existing
        await sql`
          UPDATE integrations 
          SET 
            access_token = ${encryptedToken},
            account_identifier = ${JSON.stringify({ pageId, pageName })},
            status = 'connected',
            connected_at = NOW(),
            updated_at = NOW()
          WHERE organization_id = ${organization_id} AND provider = 'messenger'
        `;
      } else {
        // Insert new
        await sql`
          INSERT INTO integrations 
            (organization_id, provider, access_token, account_identifier, status, connected_at)
          VALUES 
            (${organization_id}, 'messenger', ${encryptedToken}, ${JSON.stringify({ pageId, pageName })}, 'connected', NOW())
        `;
      }

      console.log('✅ Messenger integration saved for org:', organization_id);

      // Redirect back to frontend
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?messenger=connected&page=${encodeURIComponent(pageName)}`);

    } catch (error) {
      console.error('❌ OAuth callback failed:', error);
      
      const redirectUrl = process.env.FRONTEND_URL || 'https://chatbot-platform-v2.vercel.app';
      return res.redirect(`${redirectUrl}/dashboard/integrations?messenger=error&message=${encodeURIComponent(error.message)}`);
    }
  }

  return res.status(400).json({ error: 'Invalid action' });
}
