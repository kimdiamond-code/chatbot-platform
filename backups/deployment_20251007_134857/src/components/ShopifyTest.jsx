/**
 * Shopify Integration Test Component
 * Tests connection and displays store data
 */

import React, { useState, useEffect } from 'react';
import { useShopify } from '../hooks/useShopify';

export default function ShopifyTest() {
  const shopify = useShopify();
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testOrderNumber, setTestOrderNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const result = await shopify.verifyConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({ connected: false, error: error.message });
    }
  };

  const handleFindCustomer = async () => {
    try {
      const result = await shopify.findCustomer(testEmail);
      setResults({ type: 'customer', data: result });
    } catch (error) {
      setResults({ type: 'error', message: error.message });
    }
  };

  const handleFindOrder = async () => {
    try {
      const result = await shopify.findOrderByNumber(testOrderNumber);
      setResults({ type: 'order', data: result });
    } catch (error) {
      setResults({ type: 'error', message: error.message });
    }
  };

  const handleSearchProducts = async () => {
    try {
      const result = await shopify.searchProducts(searchQuery);
      setResults({ type: 'products', data: result });
    } catch (error) {
      setResults({ type: 'error', message: error.message });
    }
  };

  const handleGetAbandonedCarts = async () => {
    try {
      const result = await shopify.getAbandonedCarts(10);
      setResults({ type: 'carts', data: result });
    } catch (error) {
      setResults({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Shopify Integration Test</h1>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        {connectionStatus ? (
          <div>
            {connectionStatus.connected ? (
              <div className="text-green-600">
                <p className="font-semibold">✓ Connected to Shopify</p>
                {connectionStatus.shop && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p>Store: {connectionStatus.shop.name}</p>
                    <p>Domain: {connectionStatus.shop.domain}</p>
                    <p>Currency: {connectionStatus.shop.currency}</p>
                    <p>Plan: {connectionStatus.shop.planName}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-red-600">
                <p className="font-semibold">✗ Not Connected</p>
                {connectionStatus.error && (
                  <p className="mt-2 text-sm">{connectionStatus.error}</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Checking connection...</p>
        )}
        <button
          onClick={testConnection}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={shopify.loading}
        >
          {shopify.loading ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Customer Lookup */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Find Customer</h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="customer@example.com"
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={handleFindCustomer}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={shopify.loading || !testEmail}
          >
            Search
          </button>
        </div>
      </div>

      {/* Order Lookup */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Find Order</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={testOrderNumber}
            onChange={(e) => setTestOrderNumber(e.target.value)}
            placeholder="Order number (e.g., 1001)"
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={handleFindOrder}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={shopify.loading || !testOrderNumber}
          >
            Search
          </button>
        </div>
      </div>

      {/* Product Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Products</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Product name"
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={handleSearchProducts}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={shopify.loading || !searchQuery}
          >
            Search
          </button>
        </div>
      </div>

      {/* Abandoned Carts */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Abandoned Carts</h2>
        <button
          onClick={handleGetAbandonedCarts}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={shopify.loading}
        >
          Get Abandoned Carts
        </button>
      </div>

      {/* Results Display */}
      {results && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {results.type === 'error' ? (
            <div className="text-red-600">
              <p>Error: {results.message}</p>
            </div>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(results.data, null, 2)}
            </pre>
          )}
        </div>
      )}

      {shopify.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
          Error: {shopify.error}
        </div>
      )}
    </div>
  );
}
