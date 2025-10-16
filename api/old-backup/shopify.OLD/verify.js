/**
 * Shopify Connection Verification
 * GET /api/shopify/verify
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const accessToken = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
  const storeName = process.env.VITE_SHOPIFY_STORE_NAME;

  if (!accessToken || !storeName) {
    return res.status(500).json({
      success: false,
      error: 'Shopify credentials not configured',
      configured: false
    });
  }

  const baseUrl = `https://${storeName}.myshopify.com/admin/api/2024-10`;

  try {
    // Test connection by fetching shop info
    const response = await fetch(`${baseUrl}/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`);
    }

    const data = await response.json();
    const shop = data.shop;

    res.status(200).json({
      success: true,
      configured: true,
      connected: true,
      shop: {
        name: shop.name,
        domain: shop.domain,
        email: shop.email,
        currency: shop.currency,
        timezone: shop.iana_timezone,
        planName: shop.plan_name,
        country: shop.country_name
      }
    });

  } catch (error) {
    console.error('Shopify verification failed:', error);
    res.status(500).json({
      success: false,
      configured: true,
      connected: false,
      error: 'Failed to connect to Shopify',
      message: error.message
    });
  }
}
