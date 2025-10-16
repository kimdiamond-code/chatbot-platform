/**
 * Shopify Customer API Route
 * GET /api/shopify/customer
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

  const { email, customerId } = req.query;

  if (!email && !customerId) {
    return res.status(400).json({ error: 'Email or customer ID required' });
  }

  const accessToken = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
  const storeName = process.env.VITE_SHOPIFY_STORE_NAME;
  const baseUrl = `https://${storeName}.myshopify.com/admin/api/2024-10`;

  try {
    let customer = null;

    if (email) {
      // Search by email
      const searchUrl = `${baseUrl}/customers/search.json?query=email:${encodeURIComponent(email)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      customer = data.customers && data.customers.length > 0 ? data.customers[0] : null;
    } else if (customerId) {
      // Get by ID
      const customerUrl = `${baseUrl}/customers/${customerId}.json`;
      const response = await fetch(customerUrl, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      customer = data.customer;
    }

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Return customer data
    res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        ordersCount: customer.orders_count,
        totalSpent: customer.total_spent,
        createdAt: customer.created_at,
        verifiedEmail: customer.verified_email,
        tags: customer.tags
      }
    });

  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch customer data',
      message: error.message 
    });
  }
}
