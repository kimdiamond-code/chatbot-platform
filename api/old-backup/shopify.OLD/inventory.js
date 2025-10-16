/**
 * Shopify Inventory API Route
 * GET /api/shopify/inventory
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

  const { variantId, productId } = req.query;

  if (!variantId && !productId) {
    return res.status(400).json({ error: 'Variant ID or product ID required' });
  }

  const accessToken = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
  const storeName = process.env.VITE_SHOPIFY_STORE_NAME;
  const baseUrl = `https://${storeName}.myshopify.com/admin/api/2024-10`;

  try {
    let inventoryData = [];

    if (variantId) {
      const response = await fetch(`${baseUrl}/variants/${variantId}.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const variant = data.variant;

      inventoryData = [{
        variantId: variant.id,
        sku: variant.sku,
        price: variant.price,
        inventoryQuantity: variant.inventory_quantity,
        available: variant.inventory_quantity > 0
      }];

    } else if (productId) {
      const response = await fetch(`${baseUrl}/products/${productId}.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      inventoryData = data.product.variants.map(v => ({
        variantId: v.id,
        sku: v.sku,
        price: v.price,
        inventoryQuantity: v.inventory_quantity,
        available: v.inventory_quantity > 0
      }));
    }

    res.status(200).json({
      success: true,
      inventory: inventoryData
    });

  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch inventory',
      message: error.message 
    });
  }
}
