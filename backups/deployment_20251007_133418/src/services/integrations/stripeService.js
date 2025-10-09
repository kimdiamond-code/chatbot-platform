// Stripe Integration Service - Production Ready
class StripeService {
  constructor() {
    this.config = this.loadConfig();
    this.baseUrl = 'https://api.stripe.com/v1';
    this.headers = null;
    this.initializeConfig();
  }

  loadConfig() {
    const saved = localStorage.getItem('stripe_config');
    return saved ? JSON.parse(saved) : null;
  }

  initializeConfig() {
    if (this.config && this.config.status === 'connected') {
      this.headers = {
        'Authorization': `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      };
    }
  }

  isConnected() {
    return this.config && this.config.status === 'connected' && this.config.secretKey;
  }

  // Test API connection
  async testConnection() {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Connection failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        balance: data,
        message: 'Connected to Stripe successfully'
      };
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      throw error;
    }
  }

  // Customer Methods
  async findCustomer(email) {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const params = new URLSearchParams({
        email: email,
        limit: 1
      });

      const response = await fetch(`${this.baseUrl}/customers/search?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to search customer: ${response.status}`);
      }

      const data = await response.json();
      return data.data && data.data.length > 0 ? data.data[0] : null;
    } catch (error) {
      console.error('Error finding Stripe customer:', error);
      throw error;
    }
  }

  async createCustomer(customerData) {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const params = new URLSearchParams({
        email: customerData.email,
        name: customerData.name || '',
        phone: customerData.phone || '',
        description: customerData.description || 'Customer created via chatbot'
      });

      if (customerData.address) {
        Object.keys(customerData.address).forEach(key => {
          if (customerData.address[key]) {
            params.append(`address[${key}]`, customerData.address[key]);
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/customers`, {
        method: 'POST',
        headers: this.headers,
        body: params
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create customer: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  async getCustomer(customerId) {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch customer: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Stripe customer:', error);
      throw error;
    }
  }

  // Payment Methods
  async getPaymentMethods(customerId) {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const params = new URLSearchParams({
        customer: customerId,
        type: 'card'
      });

      const response = await fetch(`${this.baseUrl}/payment_methods?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment methods: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  // Charges and Payments
  async getCharges(customerId = null, limit = 10) {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      if (customerId) {
        params.append('customer', customerId);
      }

      const response = await fetch(`${this.baseUrl}/charges?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch charges: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching charges:', error);
      throw error;
    }
  }

  async getPaymentIntents(customerId = null, limit = 10) {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      if (customerId) {
        params.append('customer', customerId);
      }

      const response = await fetch(`${this.baseUrl}/payment_intents?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payment intents: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching payment intents:', error);
      throw error;
    }
  }

  async createPaymentIntent(amount, currency = 'usd', customerId = null, metadata = {}) {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const params = new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        automatic_payment_methods: JSON.stringify({ enabled: true })
      });

      if (customerId) {
        params.append('customer', customerId);
      }

      // Add metadata
      Object.keys(metadata).forEach(key => {
        params.append(`metadata[${key}]`, metadata[key]);
      });

      const response = await fetch(`${this.baseUrl}/payment_intents`, {
        method: 'POST',
        headers: this.headers,
        body: params
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create payment intent: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  // Subscription Methods
  async getSubscriptions(customerId, status = 'active') {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const params = new URLSearchParams({
        customer: customerId,
        status: status
      });

      const response = await fetch(`${this.baseUrl}/subscriptions?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch subscriptions: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw error;
    }
  }

  async getInvoices(customerId, limit = 10) {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const params = new URLSearchParams({
        customer: customerId,
        limit: limit.toString()
      });

      const response = await fetch(`${this.baseUrl}/invoices?${params}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch invoices: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  // Refund Methods
  async createRefund(chargeId, amount = null, reason = null) {
    if (!this.isConnected()) {
      throw new Error('Stripe integration not configured');
    }

    try {
      const params = new URLSearchParams({
        charge: chargeId
      });

      if (amount) {
        params.append('amount', amount.toString());
      }

      if (reason) {
        params.append('reason', reason);
      }

      const response = await fetch(`${this.baseUrl}/refunds`, {
        method: 'POST',
        headers: this.headers,
        body: params
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to create refund: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating refund:', error);
      throw error;
    }
  }

  // Chat Integration Methods
  async handlePaymentInquiry(message, customerEmail) {
    if (!this.isConnected()) {
      return null;
    }

    const inquiry = message.toLowerCase();
    
    try {
      // Find customer
      const customer = await this.findCustomer(customerEmail);
      if (!customer) {
        return {
          type: 'customer_not_found',
          response: 'I couldn\'t find any payment information for your email address. Please make sure you\'re using the same email address used for payments.'
        };
      }

      // Payment status inquiries
      if (inquiry.includes('payment') && (inquiry.includes('status') || inquiry.includes('failed') || inquiry.includes('success'))) {
        const paymentIntents = await this.getPaymentIntents(customer.id, 5);
        const recentPayments = paymentIntents.slice(0, 3);
        
        return {
          type: 'payment_status',
          data: recentPayments,
          response: this.formatPaymentStatusResponse(recentPayments)
        };
      }

      // Subscription inquiries
      if (inquiry.includes('subscription') || inquiry.includes('billing') || inquiry.includes('plan')) {
        const subscriptions = await this.getSubscriptions(customer.id);
        
        return {
          type: 'subscription_info',
          data: subscriptions,
          response: this.formatSubscriptionResponse(subscriptions)
        };
      }

      // Invoice inquiries
      if (inquiry.includes('invoice') || inquiry.includes('bill') || inquiry.includes('receipt')) {
        const invoices = await this.getInvoices(customer.id, 3);
        
        return {
          type: 'invoice_info',
          data: invoices,
          response: this.formatInvoiceResponse(invoices)
        };
      }

      // Refund inquiries
      if (inquiry.includes('refund') || inquiry.includes('cancel') || inquiry.includes('return')) {
        const charges = await this.getCharges(customer.id, 5);
        const refundableCharges = charges.filter(charge => 
          charge.status === 'succeeded' && !charge.refunded && charge.amount_refunded === 0
        );
        
        return {
          type: 'refund_info',
          data: refundableCharges,
          response: this.formatRefundResponse(refundableCharges)
        };
      }

    } catch (error) {
      console.error('Error handling payment inquiry:', error);
    }

    return null;
  }

  // Helper Methods
  formatPaymentStatusResponse(payments) {
    if (payments.length === 0) {
      return 'I don\'t see any recent payment activity on your account.';
    }

    if (payments.length === 1) {
      const payment = payments[0];
      return `Your most recent payment of ${this.formatAmount(payment.amount, payment.currency)} is ${payment.status}. ${payment.status === 'succeeded' ? 'Payment completed successfully!' : payment.status === 'requires_payment_method' ? 'Please update your payment method.' : ''}`;
    }

    let response = `Here are your recent payments:\n`;
    payments.forEach((payment, index) => {
      response += `${index + 1}. ${this.formatAmount(payment.amount, payment.currency)} - ${payment.status}\n`;
    });

    return response;
  }

  formatSubscriptionResponse(subscriptions) {
    if (subscriptions.length === 0) {
      return 'You don\'t have any active subscriptions.';
    }

    if (subscriptions.length === 1) {
      const sub = subscriptions[0];
      const nextBilling = new Date(sub.current_period_end * 1000).toLocaleDateString();
      return `You have an active ${sub.status} subscription. Next billing date: ${nextBilling}. Amount: ${this.formatAmount(sub.items.data[0]?.price?.unit_amount || 0, sub.currency)}.`;
    }

    let response = `You have ${subscriptions.length} active subscriptions:\n`;
    subscriptions.forEach((sub, index) => {
      const nextBilling = new Date(sub.current_period_end * 1000).toLocaleDateString();
      response += `${index + 1}. ${sub.status} - Next billing: ${nextBilling}\n`;
    });

    return response;
  }

  formatInvoiceResponse(invoices) {
    if (invoices.length === 0) {
      return 'I don\'t see any recent invoices for your account.';
    }

    if (invoices.length === 1) {
      const invoice = invoices[0];
      const dueDate = invoice.due_date ? new Date(invoice.due_date * 1000).toLocaleDateString() : 'N/A';
      return `Your most recent invoice for ${this.formatAmount(invoice.amount_due, invoice.currency)} is ${invoice.status}. ${invoice.status === 'open' ? `Due date: ${dueDate}` : ''}`;
    }

    let response = `Here are your recent invoices:\n`;
    invoices.forEach((invoice, index) => {
      response += `${index + 1}. ${this.formatAmount(invoice.amount_due, invoice.currency)} - ${invoice.status}\n`;
    });

    return response;
  }

  formatRefundResponse(refundableCharges) {
    if (refundableCharges.length === 0) {
      return 'I don\'t see any recent payments that are eligible for refund. Please contact support for assistance with refunds.';
    }

    let response = 'Here are your recent payments that may be eligible for refund:\n';
    refundableCharges.slice(0, 3).forEach((charge, index) => {
      const date = new Date(charge.created * 1000).toLocaleDateString();
      response += `${index + 1}. ${this.formatAmount(charge.amount, charge.currency)} on ${date}\n`;
    });
    response += '\nTo request a refund, please contact our support team with the payment details.';

    return response;
  }

  formatAmount(amount, currency = 'usd') {
    // Stripe amounts are in cents for most currencies
    const divisor = this.getCurrencyDivisor(currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / divisor);
  }

  getCurrencyDivisor(currency) {
    // Most currencies use cents (divisor = 100)
    // Some currencies like JPY don't use decimal places (divisor = 1)
    const noDivisionCurrencies = ['bif', 'djf', 'jpy', 'krw', 'pyg', 'vnd', 'xaf', 'xpf'];
    return noDivisionCurrencies.includes(currency.toLowerCase()) ? 1 : 100;
  }

  formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Webhook verification (for server-side implementation)
  verifyWebhookSignature(payload, signature, endpointSecret) {
    // This would typically be done on the server side
    // Implementation depends on your webhook handling setup
    console.log('Webhook signature verification should be handled server-side');
    return false;
  }
}

// Export singleton instance
export const stripeService = new StripeService();
export default stripeService;