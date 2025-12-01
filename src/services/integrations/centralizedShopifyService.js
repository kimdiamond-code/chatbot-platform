// ===================================================================
// CENTRALIZED SHOPIFY SERVICE
// Uses admin credentials + user's store name
// ===================================================================

import integrationService from './integrationService.js';

class CentralizedShopifyService {
  
  // ==================== CONNECTION ====================
  
  async testConnection(storeName) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        '/shop.json',
        { method: 'GET' },
        storeName
      );
      return {
        success: true,
        shop: result.shop,
        message: `Connected to ${result.shop.name}`
      };
    } catch (error) {
      throw new Error(`Connection test failed: ${error.message}`);
    }
  }

  // ==================== PRODUCTS ====================

  async searchProducts(storeName, query, limit = 10) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        `/products.json?title=${encodeURIComponent(query)}&limit=${limit}`,
        { method: 'GET' },
        storeName
      );
      return result.products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getProduct(storeName, productId) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        `/products/${productId}.json`,
        { method: 'GET' },
        storeName
      );
      return result.product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async getProductByHandle(storeName, handle) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        `/products.json?handle=${handle}`,
        { method: 'GET' },
        storeName
      );
      return result.products && result.products.length > 0 ? result.products[0] : null;
    } catch (error) {
      console.error('Error fetching product by handle:', error);
      throw error;
    }
  }

  // ==================== CUSTOMERS ====================

  async getCustomer(storeName, email) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        `/customers/search.json?query=email:${encodeURIComponent(email)}`,
        { method: 'GET' },
        storeName
      );
      return result.customers && result.customers.length > 0 ? result.customers[0] : null;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  async getCustomerOrders(storeName, customerId, limit = 10) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        `/customers/${customerId}/orders.json?limit=${limit}&status=any`,
        { method: 'GET' },
        storeName
      );
      return result.orders || [];
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  // ==================== ORDERS ====================

  async getOrder(storeName, orderId) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        `/orders/${orderId}.json`,
        { method: 'GET' },
        storeName
      );
      return result.order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async getOrderByName(storeName, orderName) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        `/orders.json?name=${encodeURIComponent(orderName)}&status=any`,
        { method: 'GET' },
        storeName
      );
      return result.orders && result.orders.length > 0 ? result.orders[0] : null;
    } catch (error) {
      console.error('Error fetching order by name:', error);
      throw error;
    }
  }

  // ==================== INVENTORY ====================

  async getInventoryLevel(storeName, inventoryItemId, locationId) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        `/inventory_levels.json?inventory_item_ids=${inventoryItemId}&location_ids=${locationId}`,
        { method: 'GET' },
        storeName
      );
      return result.inventory_levels && result.inventory_levels.length > 0 
        ? result.inventory_levels[0] 
        : null;
    } catch (error) {
      console.error('Error fetching inventory level:', error);
      throw error;
    }
  }

  async getLocations(storeName) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        '/locations.json',
        { method: 'GET' },
        storeName
      );
      return result.locations || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  // ==================== DRAFT ORDERS ====================

  async createDraftOrder(storeName, draftOrderData) {
    try {
      const result = await integrationService.makeRequest(
        'shopify',
        '/draft_orders.json',
        {
          method: 'POST',
          body: JSON.stringify({ draft_order: draftOrderData })
        },
        storeName
      );
      return result.draft_order;
    } catch (error) {
      console.error('Error creating draft order:', error);
      throw error;
    }
  }

  // ==================== CART LINKS ====================

  generateAddToCartUrl(storeName, variantId, quantity = 1) {
    return `https://${storeName}.myshopify.com/cart/${variantId}:${quantity}`;
  }

  generateProductUrl(storeName, handle) {
    return `https://${storeName}.myshopify.com/products/${handle}`;
  }

  generateCheckoutUrl(storeName, variantIds) {
    // variantIds should be array of {id, quantity}
    const cartString = variantIds.map(item => `${item.id}:${item.quantity}`).join(',');
    return `https://${storeName}.myshopify.com/cart/${cartString}`;
  }
}

const centralizedShopifyService = new CentralizedShopifyService();
export default centralizedShopifyService;
