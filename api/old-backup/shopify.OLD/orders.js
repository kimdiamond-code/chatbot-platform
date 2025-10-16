/**
 * Shopify Orders API Route
 * GET /api/shopify/orders
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

  const { customerId, orderId, orderNumber, limit = '10' } = req.query;

  const accessToken = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
  const storeName = process.env.VITE_SHOPIFY_STORE_NAME;
  const baseUrl = `https://${storeName}.myshopify.com/admin/api/2024-10`;

  try {
    let orders = [];
    let singleOrder = null;

    if (orderId) {
      // Get specific order by ID
      const response = await fetch(`${baseUrl}/orders/${orderId}.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      singleOrder = data.order;

    } else if (orderNumber) {
      // Search by order number
      const response = await fetch(`${baseUrl}/orders.json?name=${encodeURIComponent('#' + orderNumber)}&status=any`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      singleOrder = data.orders && data.orders.length > 0 ? data.orders[0] : null;

    } else if (customerId) {
      // Get customer's orders
      const response = await fetch(`${baseUrl}/customers/${customerId}/orders.json?limit=${limit}&status=any`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      orders = data.orders || [];
    } else {
      return res.status(400).json({ error: 'Customer ID, order ID, or order number required' });
    }

    // Format response
    const formatOrder = (order) => ({
      id: order.id,
      orderNumber: order.order_number,
      name: order.name,
      email: order.email,
      financialStatus: order.financial_status,
      fulfillmentStatus: order.fulfillment_status,
      totalPrice: order.total_price,
      currency: order.currency,
      createdAt: order.created_at,
      cancelledAt: order.cancelled_at,
      items: order.line_items.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku,
        variantId: item.variant_id
      })),
      shippingAddress: order.shipping_address,
      fulfillments: order.fulfillments?.map(f => ({
        status: f.shipment_status,
        trackingCompany: f.tracking_company,
        trackingNumber: f.tracking_number,
        trackingUrl: f.tracking_url,
        createdAt: f.created_at
      })) || []
    });

    if (singleOrder) {
      res.status(200).json({
        success: true,
        order: formatOrder(singleOrder)
      });
    } else {
      res.status(200).json({
        success: true,
        orders: orders.map(formatOrder),
        count: orders.length
      });
    }

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch orders',
      message: error.message 
    });
  }
}
