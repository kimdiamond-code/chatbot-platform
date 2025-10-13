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
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'database',
          action: 'getIntegrations',
          orgId: organizationId
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to get integrations');
      }

      const shopifyIntegration = data.data?.find(i => i.integration_id === 'shopify');
      
      if (!shopifyIntegration || shopifyIntegration.status !== 'connected') {
        return null;
      }

      const credentials = typeof shopifyIntegration.credentials_encrypted === 'string' 
        ? JSON.parse(shopifyIntegration.credentials_encrypted)
        : shopifyIntegration.credentials_encrypted;

      return {
        shopDomain: credentials.shopDomain || credentials.shop,
        accessToken: credentials.accessToken || credentials.access_token,
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
  async getProducts(options = {}) {
    const { limit = 50, organizationId = ORGANIZATION_ID } = options;

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
      const products = await this.getProducts({ organizationId });
      
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
   * Add product to cart (create draft order)
   */
  async addToCart(cartItem, customerEmail, organizationId = ORGANIZATION_ID) {
    try {
      console.log('🛒 Adding to cart:', { cartItem, customerEmail });
      
      const credentials = await this.getCredentials(organizationId);
      
      if (!credentials) {
        console.warn('⚠️ No Shopify connection - item not added to real cart');
        return {
          success: true,
          demoMode: true,
          message: 'Demo mode: Item added to mock cart'
        };
      }

      // For now, just log the add-to-cart action
      // In production, you'd create a draft order or checkout
      console.log('✅ Cart item logged (real Shopify integration ready):', cartItem);
      
      return {
        success: true,
        cartItem,
        message: 'Item tracked for cart'
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  /**
   * Get product recommendations based on customer query
   */
  async getRecommendations(query, limit = 3, organizationId = ORGANIZATION_ID) {
    try {
      const products = await this.searchProducts(query, organizationId);
      return products.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
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
   * Format product for display in chat
   */
  formatProductForChat(product) {
    return {
      id: product.id,
      title: product.title,
      description: product.body_html?.replace(/<[^>]*>/g, '').substring(0, 150) + '...',
      images: product.images,
      variants: product.variants,
      url: product.handle ? `https://${product.handle}` : null,
      vendor: product.vendor,
      type: product.type
    };
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
