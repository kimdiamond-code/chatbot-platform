/**
 * Shopify Service - Product & Cart Operations
 * Uses the unified Shopify API endpoint
 */

const ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001'; // Default org ID

export const shopifyService = {
  /**
   * Get products list
   */
  async getProducts(options = {}) {
    const { limit = 10, search = '', organizationId = ORGANIZATION_ID } = options;

    try {
      const response = await fetch('/api/shopify-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: search ? 'products:search' : 'products:list',
          organizationId,
          limit,
          query: search
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get single product by ID
   */
  async getProduct(productId, organizationId = ORGANIZATION_ID) {
    try {
      const response = await fetch('/api/shopify-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'products:get',
          organizationId,
          productId
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch product');
      }

      return data.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Search products by query
   */
  async searchProducts(query, organizationId = ORGANIZATION_ID) {
    try {
      return await this.getProducts({ search: query, organizationId });
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  /**
   * Add product to cart (create draft order)
   */
  async addToCart(cartItem, customerEmail, organizationId = ORGANIZATION_ID) {
    try {
      const response = await fetch('/api/shopify-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cart:create',
          organizationId,
          customerEmail,
          lineItems: [
            {
              variantId: cartItem.variantId,
              quantity: cartItem.quantity,
              title: cartItem.product?.title
            }
          ],
          note: `Added via ChatBot - ${new Date().toISOString()}`,
          sendInvoice: false // Set to true if you want to email the customer
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      return data.draftOrder;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  /**
   * Get abandoned carts
   */
  async getAbandonedCarts(organizationId = ORGANIZATION_ID) {
    try {
      const response = await fetch('/api/shopify-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cart:abandoned',
          organizationId,
          limit: 10
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch abandoned carts');
      }

      return data.checkouts || [];
    } catch (error) {
      console.error('Error fetching abandoned carts:', error);
      throw error;
    }
  },

  /**
   * Verify Shopify connection
   */
  async verifyConnection(organizationId = ORGANIZATION_ID) {
    try {
      const response = await fetch('/api/shopify-unified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'oauth:verify',
          organizationId
        })
      });

      const data = await response.json();
      return data.connected || false;
    } catch (error) {
      console.error('Error verifying connection:', error);
      return false;
    }
  },

  /**
   * Get product recommendations based on customer query
   * This uses simple keyword matching - can be enhanced with AI later
   */
  async getRecommendations(query, limit = 3, organizationId = ORGANIZATION_ID) {
    try {
      // Extract keywords from query
      const keywords = query.toLowerCase().match(/\b\w{3,}\b/g) || [];
      
      // Try exact search first
      let products = await this.searchProducts(query, organizationId);
      
      // If no results, try individual keywords
      if (products.length === 0 && keywords.length > 0) {
        products = await this.searchProducts(keywords[0], organizationId);
      }
      
      // Return limited number
      return products.slice(0, limit);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  },

  /**
   * Format product for display in chat
   */
  formatProductForChat(product) {
    return {
      id: product.id,
      title: product.title,
      description: product.description?.substring(0, 150) + '...',
      images: product.images,
      variants: product.variants,
      url: product.handle ? `https://your-store.myshopify.com/products/${product.handle}` : null,
      vendor: product.vendor,
      type: product.type
    };
  }
};

export default shopifyService;
