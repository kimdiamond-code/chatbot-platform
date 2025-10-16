/**
 * Shopify Cart & Checkout API Route
 * GET /api/shopify/cart - Get abandoned checkouts
 * POST /api/shopify/cart - Create draft order
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const accessToken = process.env.VITE_SHOPIFY_ACCESS_TOKEN;
  const storeName = process.env.VITE_SHOPIFY_STORE_NAME;
  const baseUrl = `https://${storeName}.myshopify.com/admin/api/2024-10`;

  // GET - Retrieve abandoned checkouts
  if (req.method === 'GET') {
    const { limit = '10', sinceId, email } = req.query;

    try {
      let endpoint = `${baseUrl}/checkouts.json?limit=${limit}&status=open`;
      if (sinceId) {
        endpoint += `&since_id=${sinceId}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json();
      let checkouts = data.checkouts || [];

      // Filter by email if provided
      if (email) {
        checkouts = checkouts.filter(c => c.email === email);
      }

      // Format checkout data
      const formattedCheckouts = checkouts.map(checkout => ({
        id: checkout.id,
        token: checkout.token,
        email: checkout.email,
        phone: checkout.phone,
        createdAt: checkout.created_at,
        updatedAt: checkout.updated_at,
        abandonedCheckoutUrl: checkout.abandoned_checkout_url,
        totalPrice: checkout.total_price,
        currency: checkout.currency,
        lineItems: checkout.line_items?.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          variantId: item.variant_id
        })) || [],
        customer: checkout.customer ? {
          id: checkout.customer.id,
          email: checkout.customer.email,
          firstName: checkout.customer.first_name,
          lastName: checkout.customer.last_name
        } : null
      }));

      res.status(200).json({
        success: true,
        checkouts: formattedCheckouts,
        count: formattedCheckouts.length
      });

    } catch (error) {
      console.error('Error fetching checkouts:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch abandoned checkouts',
        message: error.message 
      });
    }
  }

  // POST - Create draft order (for assisted sales/cart recovery)
  else if (req.method === 'POST') {
    const { customerEmail, lineItems, note, customDiscount, sendInvoice } = req.body;

    if (!customerEmail || !lineItems || lineItems.length === 0) {
      return res.status(400).json({ 
        error: 'Customer email and line items are required' 
      });
    }

    try {
      // Create draft order
      const draftOrder = {
        draft_order: {
          line_items: lineItems.map(item => ({
            variant_id: item.variantId,
            quantity: item.quantity,
            title: item.title || undefined
          })),
          customer: {
            email: customerEmail
          },
          note: note || '',
          use_customer_default_address: true
        }
      };

      // Add discount if provided
      if (customDiscount) {
        draftOrder.draft_order.applied_discount = {
          description: customDiscount.description || 'Cart Recovery Discount',
          value_type: customDiscount.type || 'percentage',
          value: customDiscount.value,
          amount: customDiscount.amount || undefined
        };
      }

      const response = await fetch(`${baseUrl}/draft_orders.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draftOrder)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const createdDraftOrder = data.draft_order;

      // Send invoice if requested
      if (sendInvoice) {
        const invoiceData = {
          draft_order_invoice: {
            to: customerEmail,
            custom_message: note || 'Complete your order'
          }
        };

        await fetch(`${baseUrl}/draft_orders/${createdDraftOrder.id}/send_invoice.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invoiceData)
        });
      }

      res.status(200).json({
        success: true,
        draftOrder: {
          id: createdDraftOrder.id,
          name: createdDraftOrder.name,
          status: createdDraftOrder.status,
          invoiceUrl: createdDraftOrder.invoice_url,
          totalPrice: createdDraftOrder.total_price,
          currency: createdDraftOrder.currency,
          createdAt: createdDraftOrder.created_at
        },
        invoiceSent: sendInvoice || false
      });

    } catch (error) {
      console.error('Error creating draft order:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create draft order',
        message: error.message 
      });
    }
  }

  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
