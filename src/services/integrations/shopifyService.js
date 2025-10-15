/**
 * Shopify Service - Product & Cart Operations  
 * Uses consolidated API with OAuth credentials from database
 */

const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001';

export const shopifyService = {
  /**
   * Get Shopify integration credentials from database
   */
  async getCredentials(organizationId = ORGANIZATION_ID) {
    try {
      // First try to get credentials from the database
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'getIntegrationCredentials',
          integration: 'shopify',
          organizationId: organizationId
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to get Shopify credentials from database:', data.error);
        return null;
      }

      if (!data.credentials || !data.credentials.shopDomain || !data.credentials.accessToken) {
        console.warn('Invalid or missing Shopify credentials in database');
        return null;
      }

      // Verify the credentials are still valid
      const verifyResponse = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'shopify_verifyCredentials',
          store_url: data.credentials.shopDomain,
          access_token: data.credentials.accessToken
        })
      });

      const verifyData = await verifyResponse.json();
      
      if (!verifyData.success) {
        console.error('Shopify credentials are no longer valid:', verifyData.error);
        return null;
      }

      // Extract credentials - handle different formats
      const shopDomain = credentials.shopDomain || credentials.shop;
      const accessToken = credentials.accessToken || credentials.access_token;
      
      if (!shopDomain || !accessToken) {
        console.warn('Missing required Shopify credentials:', { shopDomain: !!shopDomain, accessToken: !!accessToken });
        return null;
      }

      console.log('✅ Shopify credentials found:', { shopDomain, hasToken: !!accessToken });
      return {
        shopDomain,
        accessToken,
        connected: true
      };
    } catch (error) {
      console.error('Error getting Shopify credentials:', error);
      return null;
    }
  },

  /**
   * Get products list
   */
  async getProducts(limit = 50, organizationId = ORGANIZATION_ID) {
    try {
      const credentials = await this.getCredentials(organizationId);
      
      if (!credentials) {
        console.warn('No Shopify connection - using demo mode');
        return this._getDemoProducts();
      }

      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'shopify_getProducts',
          store_url: credentials.shopDomain,
          access_token: credentials.accessToken,
          limit
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        console.error('Failed to fetch products:', data.error);
        return this._getDemoProducts();
      }

      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return this._getDemoProducts();
    }
  },

  /**
   * Search products by query
   */
  async searchProducts(query, organizationId = ORGANIZATION_ID) {
    try {
      const products = await this.getProducts(50, organizationId);
      
      if (!query) return products;

      // Filter products by query
      const lowerQuery = query.toLowerCase();
      return products.filter(product => {
        const title = (product.title || '').toLowerCase();
        const description = (product.body_html || '').toLowerCase();
        const tags = (product.tags || '').toLowerCase();
        const vendor = (product.vendor || '').toLowerCase();
        
        return title.includes(lowerQuery) || 
               description.includes(lowerQuery) ||
               tags.includes(lowerQuery) ||
               vendor.includes(lowerQuery);
      });
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  /**
   * Find customer by email
   */
  async findCustomerByEmail(email, organizationId = ORGANIZATION_ID) {
    try {
      const credentials = await this.getCredentials(organizationId);
      
      if (!credentials) {
        return null;
      }

      // Use Shopify API to find customer
      // This would be implemented in the backend API
      return null;
    } catch (error) {
      console.error('Error finding customer:', error);
      return null;
    }
  },

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId, limit = 10, organizationId = ORGANIZATION_ID) {
    try {
      const credentials = await this.getCredentials(organizationId);
      
      if (!credentials) {
        return [];
      }

      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'shopify_getOrders',
          store_url: credentials.shopDomain,
          access_token: credentials.accessToken,
          customer_email: customerId // Assuming customerId is actually email for now
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        return [];
      }

      return data.orders || [];
    } catch (error) {
      console.error('Error getting customer orders:', error);
      return [];
    }
  },
  
  /**
   * Get draft orders (cart items) for a customer
   */
  async getDraftOrders(customerEmail, limit = 10, organizationId = ORGANIZATION_ID) {
    try {
      const credentials = await this.getCredentials(organizationId);
      
      if (!credentials) {
        console.log('⚠️ No Shopify credentials for draft orders');
        return [];
      }

      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'shopify_getDraftOrders',
          store_url: credentials.shopDomain,
          access_token: credentials.accessToken,
          customer_email: customerEmail,
          limit
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        console.log('⚠️ Failed to get draft orders:', data.error);
        return [];
      }

      console.log('✅ Retrieved', data.draft_orders?.length || 0, 'draft orders');
      return data.draft_orders || [];
    } catch (error) {
      console.error('Error getting draft orders:', error);
      return [];
    }
  },

  /**
   * Find order by number
   */
  async findOrderByNumber(orderNumber, organizationId = ORGANIZATION_ID) {
    try {
      const credentials = await this.getCredentials(organizationId);
      
      if (!credentials) {
        return null;
      }

      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'shopify_getOrder',
          store_url: credentials.shopDomain,
          access_token: credentials.accessToken,
          order_number: orderNumber
        })
      });

      const data = await response.json();
      
      if (!data.success || !data.order) {
        console.warn('Order not found:', orderNumber);
        return null;
      }

      return data.order;
    } catch (error) {
      console.error('Error finding order:', error);
      return null;
    }
  },

  /**
   * Verify Shopify connection
   */
  async verifyConnection(organizationId = ORGANIZATION_ID) {
    try {
      const credentials = await this.getCredentials(organizationId);
      return !!credentials;
    } catch (error) {
      console.error('Error verifying connection:', error);
      return false;
    }
  },

  /**
   * Create draft order (acts as cart)
   */
  async createDraftOrder(cartData, organizationId = ORGANIZATION_ID) {
    try {
      const credentials = await this.getCredentials(organizationId);
      
      if (!credentials) {
        throw new Error('Shopify not connected. Please connect Shopify in Integrations.');
      }

      const { product, quantity = 1, customerEmail, variantId: providedVariantId } = cartData;
      
      if (!product && !providedVariantId) {
        throw new Error('Product data or variant ID is required');
      }
      
      console.log('🛍️ Creating draft order:', {
        productId: product?.id,
        productTitle: product?.title,
        providedVariantId: providedVariantId,
        hasVariants: !!(product?.variants && product.variants.length > 0),
        variantsCount: product?.variants?.length || 0,
        quantity,
        fullProduct: JSON.stringify(product, null, 2)
      });
      
      // Extract variant ID with comprehensive error handling
      let variantId = null;
      let variantPrice = '0.00';
      
      // PRIORITY 1: Use variantId if directly provided in cartData
      if (providedVariantId) {
        variantId = providedVariantId;
        variantPrice = product?.price || product?.variants?.[0]?.price || '0.00';
        console.log('✅ Using provided variant ID:', { id: variantId, type: typeof variantId });
      }
      // PRIORITY 2: Try to get from variants array
      else if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
        const variant = product.variants[0];
        variantId = variant.id || variant.variant_id;
        variantPrice = variant.price || '0.00';
        console.log('✅ Found variant in variants array:', { 
          id: variantId, 
          price: variantPrice,
          type: typeof variantId 
        });
      } 
      // Try admin_graphql_api_id if present
      else if (product.admin_graphql_api_id) {
        variantId = product.admin_graphql_api_id;
        variantPrice = product.price || '0.00';
        console.log('⚠️ Using admin_graphql_api_id:', variantId);
      }
      // Fallback to product ID
      else if (product.id) {
        variantId = product.id;
        variantPrice = product.price || '0.00';
        console.log('⚠️ Using product ID as variant ID:', variantId);
      } else {
        console.error('❌ Product structure:', JSON.stringify(product, null, 2));
        throw new Error('Cannot find valid variant ID in product. Product may be misconfigured.');
      }
      
      // Clean up variant ID - handle GraphQL format
      if (typeof variantId === 'string') {
        // Handle GraphQL ID format: gid://shopify/ProductVariant/12345
        if (variantId.includes('gid://')) {
          const parts = variantId.split('/');
          variantId = parts[parts.length - 1];
          console.log('🔄 Converted GraphQL ID to numeric:', variantId);
        }
        // Handle string numbers
        else if (/^\d+$/.test(variantId)) {
          console.log('✅ Variant ID is numeric string:', variantId);
        }
      }
      
      // Final conversion to number
      const numericVariantId = parseInt(variantId, 10);
      
      if (isNaN(numericVariantId) || numericVariantId <= 0) {
        console.error('❌ Invalid variant ID:', { 
          original: variantId, 
          converted: numericVariantId,
          type: typeof variantId
        });
        throw new Error(`Invalid variant ID: "${variantId}". Cannot convert to number.`);
      }
      
      console.log('✅ Final variant ID:', numericVariantId, '(type:', typeof numericVariantId, ')');
      
      // Build draft order with proper structure
      const lineItem = {
        variant_id: numericVariantId,
        quantity: parseInt(quantity, 10) || 1
      };
      
      const draftOrder = {
        draft_order: {
          line_items: [lineItem],
          note: 'Created via chatbot',
          email: customerEmail || 'guest@example.com',
          use_customer_default_address: false
        }
      };
      
      console.log('📦 Draft order payload:', JSON.stringify(draftOrder, null, 2));

      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'shopify_createDraftOrder',
          store_url: credentials.shopDomain,
          access_token: credentials.accessToken,
          draft_order: draftOrder
        })
      });

      const data = await response.json();
      
      console.log('📨 Draft order response:', {
        success: data.success,
        hasError: !!data.error,
        hasDraftOrder: !!data.draft_order
      });
      
      if (!data.success) {
        console.error('❌ Draft order failed:', {
          success: data.success,
          error: data.error,
          details: data.details,
          fullResponse: data
        });
        
        // Provide detailed, actionable error messages
        let errorMessage = data.error || 'Failed to create draft order';
        const detailsStr = JSON.stringify(data.details || {});
        
        // Check for specific Shopify API errors
        if (detailsStr.includes('write_draft_orders') || detailsStr.includes('permission')) {
          errorMessage = '⚠️ Missing Shopify permissions. Go to Integrations → Shopify → Disconnect, then reconnect to grant draft order permissions.';
        } else if (detailsStr.includes('variant') || detailsStr.includes('Variant')) {
          errorMessage = `Product variant not found (ID: ${numericVariantId}). This product may have been deleted or is unavailable.`;
        } else if (detailsStr.includes('401') || detailsStr.includes('Unauthorized')) {
          errorMessage = 'Shopify access expired. Please reconnect Shopify in Integrations.';
        } else if (detailsStr.includes('shop') || detailsStr.includes('store')) {
          errorMessage = 'Cannot connect to Shopify store. Please verify store URL in Integrations.';
        } else if (data.details) {
          // Include Shopify's actual error message
          const shopifyError = data.details.errors || data.details.error || '';
          if (shopifyError) {
            errorMessage = `Shopify error: ${JSON.stringify(shopifyError)}`;
          }
        }
        
        console.error('💡 Error details:', errorMessage);
        throw new Error(errorMessage);
      }
      
      console.log('✅ Draft order created successfully:', data.draft_order?.id);
      return data.draft_order;
    } catch (error) {
      console.error('❌ Error creating draft order:', error);
      console.error('❌ Full error:', error.message);
      throw error;
    }
  },

  /**
   * Demo products for testing (when no Shopify connection)
   */
  _getDemoProducts() {
    return [
      {
        id: 'demo_1',
        title: 'Sample Product 1',
        body_html: '<p>This is a demo product for testing</p>',
        vendor: 'Demo Store',
        type: 'Sample',
        tags: 'demo, test',
        images: [{ src: 'https://via.placeholder.com/300', alt: 'Demo Product' }],
        variants: [
          {
            id: 'demo_var_1',
            title: 'Default',
            price: '29.99',
            available: true
          }
        ]
      },
      {
        id: 'demo_2',
        title: 'Sample Product 2',
        body_html: '<p>Another demo product for testing</p>',
        vendor: 'Demo Store',
        type: 'Sample',
        tags: 'demo, test',
        images: [{ src: 'https://via.placeholder.com/300', alt: 'Demo Product 2' }],
        variants: [
          {
            id: 'demo_var_2',
            title: 'Default',
            price: '39.99',
            available: true
          }
        ]
      },
      {
        id: 'demo_3',
        title: 'Sample Product 3',
        body_html: '<p>Third demo product for testing</p>',
        vendor: 'Demo Store',
        type: 'Sample',
        tags: 'demo, test',
        images: [{ src: 'https://via.placeholder.com/300', alt: 'Demo Product 3' }],
        variants: [
          {
            id: 'demo_var_3',
            title: 'Default',
            price: '49.99',
            available: true
          }
        ]
      }
    ];
  }
};

export default shopifyService;
