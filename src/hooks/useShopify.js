/**
 * Custom React Hook for Shopify Integration
 * Usage: const shopify = useShopify();
 */

import { useState, useCallback } from 'react';

const API_BASE = '/api/shopify';

export function useShopify() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequest = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Request failed');
      }

      setLoading(false);
      return data;

    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Verify connection
  const verifyConnection = useCallback(async () => {
    return await handleRequest(`${API_BASE}/verify`);
  }, [handleRequest]);

  // Customer operations
  const findCustomer = useCallback(async (email) => {
    return await handleRequest(`${API_BASE}/customer?email=${encodeURIComponent(email)}`);
  }, [handleRequest]);

  const getCustomer = useCallback(async (customerId) => {
    return await handleRequest(`${API_BASE}/customer?customerId=${customerId}`);
  }, [handleRequest]);

  // Order operations
  const getCustomerOrders = useCallback(async (customerId, limit = 10) => {
    return await handleRequest(`${API_BASE}/orders?customerId=${customerId}&limit=${limit}`);
  }, [handleRequest]);

  const getOrder = useCallback(async (orderId) => {
    return await handleRequest(`${API_BASE}/orders?orderId=${orderId}`);
  }, [handleRequest]);

  const findOrderByNumber = useCallback(async (orderNumber) => {
    return await handleRequest(`${API_BASE}/orders?orderNumber=${orderNumber}`);
  }, [handleRequest]);

  // Product operations
  const getProducts = useCallback(async (limit = 50) => {
    return await handleRequest(`${API_BASE}/products?limit=${limit}`);
  }, [handleRequest]);

  const getProduct = useCallback(async (productId) => {
    return await handleRequest(`${API_BASE}/products?productId=${productId}`);
  }, [handleRequest]);

  const searchProducts = useCallback(async (query) => {
    return await handleRequest(`${API_BASE}/products?search=${encodeURIComponent(query)}`);
  }, [handleRequest]);

  // Inventory operations
  const checkInventory = useCallback(async (variantId) => {
    return await handleRequest(`${API_BASE}/inventory?variantId=${variantId}`);
  }, [handleRequest]);

  const checkProductInventory = useCallback(async (productId) => {
    return await handleRequest(`${API_BASE}/inventory?productId=${productId}`);
  }, [handleRequest]);

  // Cart & checkout operations
  const getAbandonedCarts = useCallback(async (limit = 10, email = null) => {
    let url = `${API_BASE}/cart?limit=${limit}`;
    if (email) url += `&email=${encodeURIComponent(email)}`;
    return await handleRequest(url);
  }, [handleRequest]);

  const createDraftOrder = useCallback(async (customerEmail, lineItems, options = {}) => {
    return await handleRequest(`${API_BASE}/cart`, {
      method: 'POST',
      body: JSON.stringify({
        customerEmail,
        lineItems,
        note: options.note || '',
        customDiscount: options.discount || null,
        sendInvoice: options.sendInvoice || false
      })
    });
  }, [handleRequest]);

  // Chat integration helper
  const handleChatInquiry = useCallback(async (message, customerEmail = null) => {
    const inquiry = message.toLowerCase();

    // Order tracking
    if (inquiry.match(/order|track|shipping|delivery|status/i)) {
      // Extract order number if present
      const orderMatch = inquiry.match(/#?(\d{4,})/);
      if (orderMatch) {
        try {
          const result = await findOrderByNumber(orderMatch[1]);
          return {
            type: 'order_tracking',
            data: result.order,
            found: true
          };
        } catch (err) {
          return { type: 'order_tracking', found: false };
        }
      }

      // Look up customer's recent orders
      if (customerEmail) {
        try {
          const customerResult = await findCustomer(customerEmail);
          if (customerResult.customer) {
            const ordersResult = await getCustomerOrders(customerResult.customer.id, 3);
            return {
              type: 'order_history',
              data: ordersResult.orders,
              found: ordersResult.orders.length > 0
            };
          }
        } catch (err) {
          return { type: 'order_history', found: false };
        }
      }
    }

    // Product search
    if (inquiry.match(/product|item|buy|purchase|looking for|find/i)) {
      const words = inquiry.split(' ').filter(w => w.length > 3 && !['product', 'item', 'looking', 'find'].includes(w));
      if (words.length > 0) {
        try {
          const result = await searchProducts(words[words.length - 1]);
          return {
            type: 'product_search',
            data: result.products.slice(0, 5),
            found: result.products.length > 0
          };
        } catch (err) {
          return { type: 'product_search', found: false };
        }
      }
    }

    return { type: 'unknown', found: false };
  }, [findCustomer, getCustomerOrders, findOrderByNumber, searchProducts]);

  return {
    loading,
    error,
    verifyConnection,
    findCustomer,
    getCustomer,
    getCustomerOrders,
    getOrder,
    findOrderByNumber,
    getProducts,
    getProduct,
    searchProducts,
    checkInventory,
    checkProductInventory,
    getAbandonedCarts,
    createDraftOrder,
    handleChatInquiry
  };
}

export default useShopify;
