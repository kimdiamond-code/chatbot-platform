/**
 * Shopify Products API Route
 * GET /api/shopify/products
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { productId, search, limit = '50', collection } = req.query;

  const accessToken = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
  const storeName = process.env.VITE_SHOPIFY_STORE_NAME;
  const baseUrl = `https://${storeName}.myshopify.com/admin/api/2024-10`;

  try {
    let products = [];
    let singleProduct = null;

    if (productId) {
      // Get specific product
      const response = await fetch(`${baseUrl}/products/${productId}.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      singleProduct = data.product;

    } else if (search) {
      // Search products by title
      const response = await fetch(`${baseUrl}/products.json?title=${encodeURIComponent(search)}&limit=${limit}&status=active`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      products = data.products || [];

    } else if (collection) {
      // Get products from collection
      const response = await fetch(`${baseUrl}/collections/${collection}/products.json?limit=${limit}`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      products = data.products || [];

    } else {
      // Get all active products
      const response = await fetch(`${baseUrl}/products.json?limit=${limit}&status=active`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      products = data.products || [];
    }

    // Format product data
    const formatProduct = (product) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.body_html,
      vendor: product.vendor,
      productType: product.product_type,
      tags: product.tags,
      status: product.status,
      createdAt: product.created_at,
      url: `https://${storeName}.myshopify.com/products/${product.handle}`,
      images: product.images?.map(img => ({
        id: img.id,
        src: img.src,
        alt: img.alt
      })) || [],
      variants: product.variants?.map(v => ({
        id: v.id,
        title: v.title,
        price: v.price,
        compareAtPrice: v.compare_at_price,
        sku: v.sku,
        inventoryQuantity: v.inventory_quantity,
        inventoryPolicy: v.inventory_policy,
        available: v.inventory_quantity > 0
      })) || []
    });

    if (singleProduct) {
      res.status(200).json({
        success: true,
        product: formatProduct(singleProduct)
      });
    } else {
      res.status(200).json({
        success: true,
        products: products.map(formatProduct),
        count: products.length
      });
    }

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch products',
      message: error.message 
    });
  }
}
