// Demo Shopify Service - For testing without real connection
// Returns mock product data to test UI features

export const demoShopifyService = {
  // Demo products
  getDemoProducts() {
    return [
      {
        id: 'demo_product_1',
        title: 'Wireless Bluetooth Headphones',
        handle: 'wireless-headphones',
        description: 'Premium noise-canceling headphones with 30-hour battery life. Perfect for music lovers and professionals.',
        vendor: 'TechAudio',
        type: 'Electronics',
        tags: ['headphones', 'bluetooth', 'audio'],
        images: [
          {
            id: 'img_1',
            src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            alt: 'Wireless Headphones'
          }
        ],
        variants: [
          {
            id: 'var_1',
            title: 'Black',
            price: '149.99',
            compareAtPrice: '199.99',
            sku: 'WH-BLACK-001',
            available: true,
            inventory: 15
          },
          {
            id: 'var_2',
            title: 'White',
            price: '149.99',
            compareAtPrice: '199.99',
            sku: 'WH-WHITE-001',
            available: true,
            inventory: 8
          }
        ],
        url: 'https://example.com/products/wireless-headphones'
      },
      {
        id: 'demo_product_2',
        title: 'Portable Bluetooth Speaker',
        handle: 'portable-speaker',
        description: '360° sound with deep bass. Waterproof design perfect for outdoor adventures.',
        vendor: 'SoundMax',
        type: 'Electronics',
        tags: ['speaker', 'bluetooth', 'portable'],
        images: [
          {
            id: 'img_2',
            src: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
            alt: 'Portable Speaker'
          }
        ],
        variants: [
          {
            id: 'var_3',
            title: 'Blue',
            price: '89.99',
            compareAtPrice: '129.99',
            sku: 'PS-BLUE-001',
            available: true,
            inventory: 25
          },
          {
            id: 'var_4',
            title: 'Red',
            price: '89.99',
            sku: 'PS-RED-001',
            available: false,
            inventory: 0
          }
        ],
        url: 'https://example.com/products/portable-speaker'
      },
      {
        id: 'demo_product_3',
        title: 'USB-C Charging Cable',
        handle: 'usbc-cable',
        description: 'Fast charging cable with reinforced braided design. 6ft length.',
        vendor: 'TechGear',
        type: 'Accessories',
        tags: ['cable', 'charging', 'usb-c'],
        images: [
          {
            id: 'img_3',
            src: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400',
            alt: 'USB-C Cable'
          }
        ],
        variants: [
          {
            id: 'var_5',
            title: 'Black - 6ft',
            price: '19.99',
            sku: 'USBC-6FT-001',
            available: true,
            inventory: 100
          }
        ],
        url: 'https://example.com/products/usbc-cable'
      }
    ];
  },

  // Search demo products
  searchDemoProducts(query) {
    const allProducts = this.getDemoProducts();
    const lowerQuery = query.toLowerCase();
    
    return allProducts.filter(product => 
      product.title.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.tags.some(tag => tag.includes(lowerQuery))
    );
  },

  // Mock add to cart
  async mockAddToCart(cartItem) {
    console.log('🛒 Mock add to cart called');
    console.log('Cart item:', cartItem);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      draftOrder: {
        id: `demo_order_${Date.now()}`,
        line_items: [cartItem],
        created_at: new Date().toISOString()
      }
    };
  }
};

export default demoShopifyService;
