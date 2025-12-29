$targetFile = "C:\Users\kdiamond\OneDrive - True Citrus\Directory\Chatbot\Chatbot set up\Chatbot-platform_files\chatbot-platform\src\hooks\useMessages.js"

# Read the current file
$content = Get-Content $targetFile -Raw

# Find the add_to_cart case and replace the entire section
$oldAddToCartSection = @'
      case 'add_to_cart':
        console.log('🛒 Adding to cart:', action.data);
        
        // Get customer email from enhanced bot service session
        const sessionEmail = enhancedBotService.getCustomerEmail(conversationId) || 'guest@example.com';
        console.log('📧 Using customer email for cart:', sessionEmail);
        
        // Check if we're in demo mode by verifying Shopify connection
        
        try {
          
          
          if (isDemoMode) {
            
            // Use demo service
            const { demoShopifyService } = await import('../services/demoShopifyService');
            const result = await demoShopifyService.mockAddToCart({
              ...action.data,
              customerEmail: sessionEmail
            });
            console.log('✅ Demo cart created:', result);
          } else {
            console.log("Adding to cart via Shopify...");
            // Real Shopify - create draft order with session email
            const result = await shopifyService.createDraftOrder({
              ...action.data,
              customerEmail: sessionEmail
            });
            console.log('✅ Added to cart:', result);
          }
          
          // Send confirmation message
          await sendMessage({
            conversation_id: conversationId,
            content: `✅ Added ${action.data.product?.title || 'item'} to cart!`,
            sender_type: 'bot',
            metadata: {
              source: 'shopify',
              action: 'add_to_cart',
              cartItem: action.data,
              
            }
          });
          
          // Track analytics - Add to Cart
          await analyticsTracker.trackAddToCart(
            conversationId,
            action.data.product,
            action.data.quantity || 1
          );
          
          console.log('📊 Tracked add to cart:', action.data.product?.title);
          
        } catch (error) {
          console.error('❌ Failed to add to cart:', error);
          console.error('❌ Error details:', error.message);
          console.error('❌ Action data:', action.data);
          
          // Send detailed error message
          const errorMessage = ${error.message || 'Failed to create mock cart'}. The demo cart feature is being set up.`
            : `❌ Sorry, I couldn't add that item to your cart. ${error.message || 'Please try again or contact support.'}`;
          
          await sendMessage({
            conversation_id: conversationId,
            content: errorMessage,
            sender_type: 'bot',
            metadata: {
              error: true,
              errorMessage: error.message,
              errorType: 'add_to_cart_failed'
            }
          });
        }
        break;
'@

$newAddToCartSection = @'
      case 'add_to_cart':
        console.log('🛒 Adding to cart:', action.data);
        
        // Get customer email from enhanced bot service session
        const sessionEmail = enhancedBotService.getCustomerEmail(conversationId) || 'guest@example.com';
        console.log('📧 Using customer email for cart:', sessionEmail);
        
        try {
          console.log("Adding to cart via Shopify...");
          // Create draft order with session email
          const result = await shopifyService.createDraftOrder({
            ...action.data,
            customerEmail: sessionEmail
          });
          console.log('✅ Added to cart:', result);
          
          // Send confirmation message
          await sendMessage({
            conversation_id: conversationId,
            content: `✅ Added ${action.data.product?.title || 'item'} to cart!`,
            sender_type: 'bot',
            metadata: {
              source: 'shopify',
              action: 'add_to_cart',
              cartItem: action.data
            }
          });
          
          // Track analytics - Add to Cart
          await analyticsTracker.trackAddToCart(
            conversationId,
            action.data.product,
            action.data.quantity || 1
          );
          
          console.log('📊 Tracked add to cart:', action.data.product?.title);
          
        } catch (error) {
          console.error('❌ Failed to add to cart:', error);
          
          await sendMessage({
            conversation_id: conversationId,
            content: `❌ Sorry, I couldn't add that item to your cart. ${error.message || 'Please try again.'}`,
            sender_type: 'bot',
            metadata: {
              error: true,
              errorMessage: error.message,
              errorType: 'add_to_cart_failed'
            }
          });
        }
        break;
'@

# Replace the section
$content = $content -replace [regex]::Escape($oldAddToCartSection), $newAddToCartSection

$content | Set-Content $targetFile

Write-Host "Fixed useMessages.js - removed all demo code" -ForegroundColor Green
