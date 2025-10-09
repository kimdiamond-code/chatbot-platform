/**
 * Proactive Engagement Widget Script
 * Tracks user behavior and triggers proactive chat messages
 */

(function() {
  'use strict';

  // Configuration
  const WIDGET_CONFIG = {
    apiUrl: window.CHATBOT_API_URL || 'YOUR_SUPABASE_URL',
    apiKey: window.CHATBOT_API_KEY || 'YOUR_SUPABASE_ANON_KEY',
    organizationId: window.CHATBOT_ORG_ID || '00000000-0000-0000-0000-000000000001',
    debug: false
  };

  // State management
  const state = {
    sessionId: generateSessionId(),
    pageLoadTime: Date.now(),
    scrollPercentage: 0,
    exitIntentTriggered: false,
    triggeredEvents: new Set(),
    customerId: null,
    cartValue: 0,
    hasCartItems: false
  };

  // Initialize
  function init() {
    if (WIDGET_CONFIG.debug) console.log('[Proactive Widget] Initializing...');
    
    // Load triggers from server
    loadTriggers();
    
    // Setup event listeners
    setupEventListeners();
    
    // Check URL-based triggers
    checkUrlTriggers();
    
    // Check UTM parameters
    checkUtmTriggers();
  }

  // Generate unique session ID
  function generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Load active triggers from Supabase
  async function loadTriggers() {
    try {
      const response = await fetch(
        `${WIDGET_CONFIG.apiUrl}/rest/v1/proactive_triggers?organization_id=eq.${WIDGET_CONFIG.organizationId}&enabled=eq.true&order=priority.desc`,
        {
          headers: {
            'apikey': WIDGET_CONFIG.apiKey,
            'Authorization': `Bearer ${WIDGET_CONFIG.apiKey}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to load triggers');
      
      const triggers = await response.json();
      if (WIDGET_CONFIG.debug) console.log('[Proactive Widget] Loaded triggers:', triggers);
      
      // Store triggers in state
      state.triggers = triggers;
      
      // Start checking time-based triggers
      startTimeBasedChecks();
    } catch (error) {
      console.error('[Proactive Widget] Error loading triggers:', error);
    }
  }

  // Setup event listeners for user behavior
  function setupEventListeners() {
    // Scroll tracking
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);
        
        if (scrollPercent > state.scrollPercentage) {
          state.scrollPercentage = scrollPercent;
          checkScrollTriggers(scrollPercent);
        }
      }, 100);
    });

    // Exit intent detection
    document.addEventListener('mouseleave', (e) => {
      if (e.clientY <= 0 && !state.exitIntentTriggered) {
        state.exitIntentTriggered = true;
        checkExitIntentTriggers();
      }
    });

    // Cart tracking (if e-commerce site)
    trackCartChanges();
  }

  // Check scroll-based triggers
  function checkScrollTriggers(scrollPercent) {
    if (!state.triggers) return;

    state.triggers.forEach(trigger => {
      if (trigger.trigger_type === 'scroll_percentage') {
        const targetPercent = trigger.conditions?.scrollPercentage || 50;
        
        if (scrollPercent >= targetPercent && !state.triggeredEvents.has(trigger.id)) {
          setTimeout(() => {
            triggerProactiveMessage(trigger);
          }, trigger.delay_seconds * 1000);
        }
      }
    });
  }

  // Check exit intent triggers
  function checkExitIntentTriggers() {
    if (!state.triggers) return;

    state.triggers.forEach(trigger => {
      if (trigger.trigger_type === 'exit_intent') {
        const minTime = trigger.conditions?.minTimeOnSite || 0;
        const timeOnSite = (Date.now() - state.pageLoadTime) / 1000;
        
        if (timeOnSite >= minTime && !state.triggeredEvents.has(trigger.id)) {
          setTimeout(() => {
            triggerProactiveMessage(trigger);
          }, trigger.delay_seconds * 1000);
        }
      }
    });
  }

  // Check URL-based triggers
  function checkUrlTriggers() {
    if (!state.triggers) return;

    const currentUrl = window.location.pathname;

    state.triggers.forEach(trigger => {
      if (trigger.trigger_type === 'url_match') {
        const urlPattern = trigger.conditions?.pageUrl || '*';
        
        if (matchUrlPattern(currentUrl, urlPattern) && !state.triggeredEvents.has(trigger.id)) {
          setTimeout(() => {
            triggerProactiveMessage(trigger);
          }, trigger.delay_seconds * 1000);
        }
      }
    });
  }

  // Check UTM parameter triggers
  function checkUtmTriggers() {
    if (!state.triggers) return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmCampaign = urlParams.get('utm_campaign');

    if (!utmSource) return;

    state.triggers.forEach(trigger => {
      if (trigger.trigger_type === 'utm_parameter') {
        const requiredSource = trigger.conditions?.utm_source;
        const requiredCampaign = trigger.conditions?.utm_campaign;
        
        let match = false;
        if (requiredSource === '*' || requiredSource === utmSource) {
          if (!requiredCampaign || requiredCampaign === utmCampaign) {
            match = true;
          }
        }
        
        if (match && !state.triggeredEvents.has(trigger.id)) {
          setTimeout(() => {
            // Replace {utm_source} placeholder in message
            const message = trigger.message.replace('{utm_source}', utmSource);
            triggerProactiveMessage({ ...trigger, message });
          }, trigger.delay_seconds * 1000);
        }
      }
    });
  }

  // Start time-based trigger checks
  function startTimeBasedChecks() {
    setInterval(() => {
      if (!state.triggers) return;

      const timeOnPage = (Date.now() - state.pageLoadTime) / 1000;

      state.triggers.forEach(trigger => {
        if (trigger.trigger_type === 'time_on_page') {
          const requiredTime = trigger.conditions?.timeOnPage || 60;
          const urlPattern = trigger.conditions?.pageUrl || '*';
          const currentUrl = window.location.pathname;
          
          if (timeOnPage >= requiredTime && 
              matchUrlPattern(currentUrl, urlPattern) && 
              !state.triggeredEvents.has(trigger.id)) {
            triggerProactiveMessage(trigger);
          }
        }

        // Cart abandonment check
        if (trigger.trigger_type === 'cart_abandonment') {
          const requiredCartValue = trigger.conditions?.cartValue || 0;
          
          if (state.hasCartItems && 
              state.cartValue >= requiredCartValue && 
              !state.triggeredEvents.has(trigger.id)) {
            setTimeout(() => {
              triggerProactiveMessage(trigger);
            }, trigger.delay_seconds * 1000);
          }
        }
      });
    }, 5000); // Check every 5 seconds
  }

  // Track cart changes
  function trackCartChanges() {
    // This is a generic implementation
    // Customize based on your e-commerce platform (Shopify, WooCommerce, etc.)
    
    // Check for cart in localStorage (common pattern)
    const checkCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        state.hasCartItems = cart.length > 0;
        state.cartValue = cart.reduce((sum, item) => sum + (item.price * item.quantity || 0), 0);
      } catch (e) {
        // Fallback: check for cart elements in DOM
        const cartItems = document.querySelectorAll('[data-cart-item], .cart-item');
        state.hasCartItems = cartItems.length > 0;
      }
    };

    checkCart();
    setInterval(checkCart, 10000); // Check every 10 seconds
    
    // Listen for custom cart events
    window.addEventListener('cartUpdated', checkCart);
  }

  // Match URL patterns (supports wildcards)
  function matchUrlPattern(url, pattern) {
    if (pattern === '*') return true;
    
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(url);
  }

  // Trigger a proactive message
  async function triggerProactiveMessage(trigger) {
    if (state.triggeredEvents.has(trigger.id)) return;
    
    state.triggeredEvents.add(trigger.id);

    if (WIDGET_CONFIG.debug) {
      console.log('[Proactive Widget] Triggering:', trigger.name);
    }

    // Log the event to database
    await logTriggerEvent(trigger);

    // Show the proactive message
    showProactivePopup(trigger);
  }

  // Log trigger event to database
  async function logTriggerEvent(trigger) {
    try {
      await fetch(`${WIDGET_CONFIG.apiUrl}/rest/v1/proactive_events`, {
        method: 'POST',
        headers: {
          'apikey': WIDGET_CONFIG.apiKey,
          'Authorization': `Bearer ${WIDGET_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          trigger_id: trigger.id,
          organization_id: WIDGET_CONFIG.organizationId,
          customer_id: state.customerId,
          session_id: state.sessionId,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          engaged: false,
          converted: false,
          metadata: {
            scroll_percentage: state.scrollPercentage,
            time_on_page: (Date.now() - state.pageLoadTime) / 1000,
            cart_value: state.cartValue
          }
        })
      });
    } catch (error) {
      console.error('[Proactive Widget] Error logging event:', error);
    }
  }

  // Update trigger event (engagement/conversion)
  async function updateTriggerEvent(triggerId, updates) {
    try {
      // Find the most recent event for this trigger
      const response = await fetch(
        `${WIDGET_CONFIG.apiUrl}/rest/v1/proactive_events?trigger_id=eq.${triggerId}&session_id=eq.${state.sessionId}&order=triggered_at.desc&limit=1`,
        {
          headers: {
            'apikey': WIDGET_CONFIG.apiKey,
            'Authorization': `Bearer ${WIDGET_CONFIG.apiKey}`
          }
        }
      );

      const events = await response.json();
      if (events.length > 0) {
        const eventId = events[0].id;
        
        await fetch(`${WIDGET_CONFIG.apiUrl}/rest/v1/proactive_events?id=eq.${eventId}`, {
          method: 'PATCH',
          headers: {
            'apikey': WIDGET_CONFIG.apiKey,
            'Authorization': `Bearer ${WIDGET_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(updates)
        });
      }
    } catch (error) {
      console.error('[Proactive Widget] Error updating event:', error);
    }
  }

  // Show proactive popup
  function showProactivePopup(trigger) {
    // Check if chat widget exists
    const chatWidget = document.querySelector('#chatbot-widget, [data-chatbot-widget]');
    
    if (chatWidget) {
      // If widget exists, send message through it
      sendMessageToChatWidget(trigger.message);
    } else {
      // Create standalone popup
      createStandalonePopup(trigger);
    }
  }

  // Send message to existing chat widget
  function sendMessageToChatWidget(message) {
    // Dispatch custom event that the chat widget can listen to
    window.dispatchEvent(new CustomEvent('proactiveMessage', {
      detail: { message, source: 'proactive_trigger' }
    }));
  }

  // Create standalone popup
  function createStandalonePopup(trigger) {
    // Remove existing popup if any
    const existing = document.getElementById('proactive-popup');
    if (existing) existing.remove();

    // Create popup HTML
    const popup = document.createElement('div');
    popup.id = 'proactive-popup';
    popup.innerHTML = `
      <style>
        #proactive-popup {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 320px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          z-index: 999999;
          animation: slideInUp 0.3s ease;
        }
        @keyframes slideInUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        #proactive-popup-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px;
          border-radius: 12px 12px 0 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        #proactive-popup-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        #proactive-popup-body {
          padding: 16px;
        }
        #proactive-popup-message {
          background: #f3f4f6;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 12px;
          color: #1f2937;
          line-height: 1.5;
        }
        #proactive-popup-actions {
          display: flex;
          gap: 8px;
        }
        .proactive-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .proactive-btn-primary {
          background: #667eea;
          color: white;
        }
        .proactive-btn-primary:hover {
          background: #5568d3;
        }
        .proactive-btn-secondary {
          background: #e5e7eb;
          color: #4b5563;
        }
        .proactive-btn-secondary:hover {
          background: #d1d5db;
        }
        .proactive-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
      <div id="proactive-popup-header">
        <div id="proactive-popup-avatar">🤖</div>
        <div>
          <div style="font-weight: 600;">Support Assistant</div>
          <div style="font-size: 12px; opacity: 0.9;">Online now</div>
        </div>
        <button class="proactive-close" onclick="document.getElementById('proactive-popup').remove()">×</button>
      </div>
      <div id="proactive-popup-body">
        <div id="proactive-popup-message">${trigger.message}</div>
        <div id="proactive-popup-actions">
          <button class="proactive-btn proactive-btn-primary" onclick="window.proactiveStartChat('${trigger.id}')">
            Start Chat
          </button>
          <button class="proactive-btn proactive-btn-secondary" onclick="document.getElementById('proactive-popup').remove()">
            Maybe Later
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Auto-hide after 30 seconds if no interaction
    setTimeout(() => {
      if (document.getElementById('proactive-popup')) {
        popup.style.animation = 'slideInUp 0.3s ease reverse';
        setTimeout(() => popup.remove(), 300);
      }
    }, 30000);
  }

  // Global function to start chat from proactive popup
  window.proactiveStartChat = function(triggerId) {
    // Mark as engaged
    updateTriggerEvent(triggerId, { engaged: true });

    // Open chat widget or redirect to chat page
    const chatWidget = document.querySelector('#chatbot-widget, [data-chatbot-widget]');
    if (chatWidget) {
      chatWidget.click();
    }

    // Remove popup
    const popup = document.getElementById('proactive-popup');
    if (popup) popup.remove();
  };

  // Public API
  window.ProactiveWidget = {
    setCustomerId: (id) => {
      state.customerId = id;
    },
    markConversion: (triggerId) => {
      updateTriggerEvent(triggerId, { converted: true });
    },
    updateCart: (hasItems, value) => {
      state.hasCartItems = hasItems;
      state.cartValue = value;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
