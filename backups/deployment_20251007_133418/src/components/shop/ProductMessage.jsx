import React from 'react';
import ProductCard from './ProductCard';

const ProductMessage = ({ products, onAddToCart }) => {
  if (!products || products.length === 0) {
    return null;
  }

  // Single product - show full card
  if (products.length === 1) {
    return (
      <div className="max-w-sm">
        <ProductCard 
          product={products[0]} 
          onAddToCart={onAddToCart}
          compact
        />
      </div>
    );
  }

  // Multiple products - show compact list
  return (
    <div className="space-y-3 max-w-md">
      <p className="text-sm font-medium text-gray-700">
        Here are some products you might like:
      </p>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          compact
        />
      ))}
    </div>
  );
};

export default ProductMessage;
