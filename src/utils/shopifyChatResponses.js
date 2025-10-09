/**
 * Shopify Chat Response Templates
 * Use these to format Shopify data into conversational responses
 */

export const ShopifyChatResponses = {
  
  // Order Tracking Responses
  orderTracking: {
    found: (order) => {
      const status = order.fulfillmentStatus || 'processing';
      const tracking = order.fulfillments?.[0];
      
      let response = `I found your order #${order.orderNumber}!\n\n`;
      response += `Status: ${status}\n`;
      response += `Total: $${order.totalPrice} ${order.currency}\n`;
      response += `Placed: ${new Date(order.createdAt).toLocaleDateString()}\n\n`;
      
      if (tracking?.trackingUrl) {
        response += `Track your shipment: ${tracking.trackingUrl}`;
      } else if (status === 'fulfilled') {
        response += `Your order has been delivered!`;
      } else {
        response += `Your order is being processed and will ship soon.`;
      }
      
      return response;
    },
    
    notFound: (orderNumber) => 
      `I couldn't find order #${orderNumber}. Please double-check the order number or provide the email address associated with your order.`,
    
    multipleOrders: (orders) => {
      let response = `I found ${orders.length} recent orders:\n\n`;
      orders.slice(0, 3).forEach(order => {
        response += `• Order #${order.orderNumber} - $${order.totalPrice} - ${order.fulfillmentStatus || 'Processing'}\n`;
      });
      response += `\nWhich order would you like to track?`;
      return response;
    }
  },

  // Product Search Responses
  productSearch: {
    found: (products) => {
      if (products.length === 0) {
        return `I couldn't find any products matching that search. Would you like to browse our full catalog?`;
      }
      
      let response = `I found ${products.length} product${products.length > 1 ? 's' : ''}:\n\n`;
      
      products.slice(0, 5).forEach(product => {
        const variant = product.variants[0];
        const price = variant.price;
        const inStock = variant.inventoryQuantity > 0;
        
        response += `**${product.title}**\n`;
        response += `Price: $${price}\n`;
        response += `Status: ${inStock ? '✓ In Stock' : 'Out of Stock'}\n`;
        response += `View: https://true-citrus.myshopify.com/products/${product.handle}\n\n`;
      });
      
      if (products.length > 5) {
        response += `...and ${products.length - 5} more. Would you like to see more options?`;
      }
      
      return response;
    },
    
    singleProduct: (product) => {
      const variant = product.variants[0];
      const inStock = variant.inventoryQuantity > 0;
      const onSale = variant.compareAtPrice && parseFloat(variant.compareAtPrice) > parseFloat(variant.price);
      
      let response = `**${product.title}**\n\n`;
      
      if (onSale) {
        response += `~~$${variant.compareAtPrice}~~ **$${variant.price}** - On Sale!\n`;
      } else {
        response += `Price: $${variant.price}\n`;
      }
      
      response += `${inStock ? '✓ In Stock' : '✗ Currently Out of Stock'}\n\n`;
      
      if (product.description) {
        response += `${product.description.replace(/<[^>]*>/g, '').slice(0, 200)}...\n\n`;
      }
      
      response += `View Product: https://true-citrus.myshopify.com/products/${product.handle}`;
      
      return response;
    }
  },

  // Customer Information
  customer: {
    found: (customer) => {
      return `Welcome back, ${customer.firstName || 'valued customer'}! I can help you with:\n\n` +
             `• Track your ${customer.ordersCount} order${customer.ordersCount !== 1 ? 's' : ''}\n` +
             `• Find products you might like\n` +
             `• Answer questions about returns or exchanges\n\n` +
             `What can I help you with today?`;
    },
    
    loyalCustomer: (customer) => {
      const spent = parseFloat(customer.totalSpent);
      return `Great to see you again, ${customer.firstName}! ` +
             `As a valued customer who's spent $${spent.toFixed(2)} with us, ` +
             `you qualify for exclusive perks. How can I assist you today?`;
    }
  },

  // Abandoned Cart Recovery
  cartRecovery: {
    found: (cart) => {
      const items = cart.lineItems.length;
      const total = cart.totalPrice;
      
      return `I noticed you left ${items} item${items !== 1 ? 's' : ''} in your cart (Total: $${total})!\n\n` +
             `Would you like to complete your order? I can offer you a special 10% discount if you checkout now.\n\n` +
             `Complete your order: ${cart.abandonedCheckoutUrl}`;
    },
    
    withDiscount: (cart, discountPercent) => {
      const items = cart.lineItems.length;
      const total = parseFloat(cart.totalPrice);
      const discounted = (total * (1 - discountPercent / 100)).toFixed(2);
      
      return `Special offer just for you! 🎉\n\n` +
             `Your cart: ${items} item${items !== 1 ? 's' : ''}\n` +
             `Original total: $${total}\n` +
             `With ${discountPercent}% off: $${discounted}\n\n` +
             `Complete checkout now: ${cart.abandonedCheckoutUrl}`;
    }
  },

  // Inventory Status
  inventory: {
    inStock: (product, quantity) => 
      `✓ ${product.title} is in stock! We have ${quantity} available right now.`,
    
    lowStock: (product, quantity) => 
      `⚠️ Only ${quantity} left in stock for ${product.title}. Order soon!`,
    
    outOfStock: (product) => 
      `✗ ${product.title} is currently out of stock. Would you like me to notify you when it's back?`,
    
    preOrder: (product, restockDate) => 
      `${product.title} is available for pre-order. Expected back in stock: ${restockDate}`
  },

  // General Assistance
  general: {
    greeting: () => 
      `Hi! I'm here to help you with:\n\n` +
      `• Track your order\n` +
      `• Find products\n` +
      `• Check stock availability\n` +
      `• Answer questions about returns\n\n` +
      `What can I help you with?`,
    
    needsEmail: () => 
      `To look up your order, I'll need your email address. What email did you use for your purchase?`,
    
    needsOrderNumber: () => 
      `Could you provide your order number? It starts with # and is in your order confirmation email.`,
    
    error: () => 
      `I'm having trouble accessing that information right now. Let me connect you with a team member who can help.`
  },

  // Returns & Refunds
  returns: {
    policy: () => 
      `Our return policy:\n\n` +
      `• 30-day return window\n` +
      `• Items must be unused and in original packaging\n` +
      `• Free return shipping on defective items\n\n` +
      `Would you like to start a return?`,
    
    initiateReturn: (orderNumber) => 
      `I'll help you return items from order #${orderNumber}. ` +
      `Which item(s) would you like to return?`
  }
};

// Helper function to format currency
export function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(parseFloat(price));
}

// Helper function to format dates
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to determine order status message
export function getOrderStatusMessage(order) {
  if (order.cancelledAt) {
    return 'Your order has been cancelled';
  }
  
  if (order.fulfillmentStatus === 'fulfilled') {
    return 'Your order has been delivered';
  }
  
  if (order.fulfillmentStatus === 'partial') {
    return 'Your order has been partially shipped';
  }
  
  if (order.financialStatus === 'paid' && !order.fulfillmentStatus) {
    return 'Your order is being processed';
  }
  
  if (order.financialStatus === 'pending') {
    return 'Waiting for payment confirmation';
  }
  
  return 'Your order has been received';
}

export default ShopifyChatResponses;
