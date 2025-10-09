import React, { useState } from 'react';
import { ShoppingCart, ExternalLink, Plus, Minus, Check } from 'lucide-react';

const ProductCard = ({ product, onAddToCart, compact = false }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await onAddToCart({
        variantId: selectedVariant.id,
        quantity,
        product: {
          id: product.id,
          title: product.title,
          image: product.images?.[0]?.src,
          price: selectedVariant.price,
          variant: selectedVariant.title
        }
      });
      
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (compact) {
    // Compact view for chat
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3 max-w-sm hover:shadow-md transition-shadow">
        <div className="flex space-x-3">
          {/* Product Image */}
          {product.images?.[0]?.src && (
            <img
              src={product.images[0].src}
              alt={product.images[0].alt || product.title}
              className="w-20 h-20 object-cover rounded flex-shrink-0"
            />
          )}
          
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 text-sm truncate">
              {product.title}
            </h4>
            <p className="text-lg font-bold text-royal-600 mt-1">
              ${selectedVariant?.price}
            </p>
            
            {/* Variant Selector */}
            {product.variants?.length > 1 && (
              <select
                value={selectedVariant?.id}
                onChange={(e) => {
                  const variant = product.variants.find(v => v.id === e.target.value);
                  setSelectedVariant(variant);
                }}
                className="mt-2 w-full text-xs border border-gray-300 rounded px-2 py-1"
              >
                {product.variants.map(variant => (
                  <option key={variant.id} value={variant.id}>
                    {variant.title} - ${variant.price}
                  </option>
                ))}
              </select>
            )}
            
            {/* Quantity & Add to Cart */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2 py-1 hover:bg-gray-100"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2 py-1 hover:bg-gray-100"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={adding || !selectedVariant?.available}
                className={`flex-1 text-xs font-medium px-3 py-1.5 rounded transition-colors ${
                  added
                    ? 'bg-green-500 text-white'
                    : selectedVariant?.available
                    ? 'bg-royal-500 text-white hover:bg-royal-600'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-3 h-3 inline mr-1" />
                    Added!
                  </>
                ) : adding ? (
                  'Adding...'
                ) : !selectedVariant?.available ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="w-3 h-3 inline mr-1" />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      {product.images?.[0]?.src && (
        <div className="relative aspect-square bg-gray-100">
          <img
            src={product.images[0].src}
            alt={product.images[0].alt || product.title}
            className="w-full h-full object-cover"
          />
          {!selectedVariant?.available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        {/* Product Title */}
        <h3 className="font-semibold text-gray-900 mb-1">{product.title}</h3>
        
        {/* Vendor */}
        {product.vendor && (
          <p className="text-xs text-gray-500 mb-2">{product.vendor}</p>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-2xl font-bold text-royal-600">
            ${selectedVariant?.price}
          </p>
          {selectedVariant?.compareAtPrice && (
            <p className="text-sm text-gray-500 line-through">
              ${selectedVariant.compareAtPrice}
            </p>
          )}
        </div>
        
        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description.replace(/<[^>]*>/g, '')}
          </p>
        )}
        
        {/* Variant Selector */}
        {product.variants?.length > 1 && (
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Options
            </label>
            <select
              value={selectedVariant?.id}
              onChange={(e) => {
                const variant = product.variants.find(v => v.id === e.target.value);
                setSelectedVariant(variant);
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              {product.variants.map(variant => (
                <option key={variant.id} value={variant.id}>
                  {variant.title} - ${variant.price}
                  {!variant.available && ' (Out of Stock)'}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Quantity Selector */}
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Quantity
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center border border-gray-300 rounded px-3 py-2"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Stock Info */}
        {selectedVariant?.inventory && (
          <p className="text-xs text-gray-500 mb-3">
            {selectedVariant.inventory > 10 
              ? 'In Stock' 
              : `Only ${selectedVariant.inventory} left!`}
          </p>
        )}
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={adding || !selectedVariant?.available}
          className={`w-full font-medium px-4 py-3 rounded-lg transition-colors ${
            added
              ? 'bg-green-500 text-white'
              : selectedVariant?.available
              ? 'bg-royal-500 text-white hover:bg-royal-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {added ? (
            <>
              <Check className="w-5 h-5 inline mr-2" />
              Added to Cart!
            </>
          ) : adding ? (
            'Adding to Cart...'
          ) : !selectedVariant?.available ? (
            'Out of Stock'
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              Add to Cart
            </>
          )}
        </button>
        
        {/* View Product Link */}
        {product.url && (
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center text-sm text-royal-600 hover:text-royal-700"
          >
            View Product Details
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
