// 🚀 Production Mode Enabler
// Disables demo mode and activates all production features

export const enableProductionMode = () => {
  // Set production mode flags
  localStorage.setItem('PRODUCTION_MODE', 'true');
  localStorage.setItem('DEMO_MODE', 'false');
  localStorage.setItem('CHATBOT_PRODUCTION_ACTIVATED', new Date().toISOString());
  
  // Clear any demo data from localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('demo-') || key.includes('DEMO_'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('✅ Production mode enabled');
  console.log('🔄 Demo mode disabled');
  console.log('🗄️ Demo data cleared');
  
  return true;
};

export const disableProductionMode = () => {
  localStorage.setItem('PRODUCTION_MODE', 'false');
  localStorage.setItem('DEMO_MODE', 'true');
  localStorage.removeItem('CHATBOT_PRODUCTION_ACTIVATED');
  
  console.log('🎮 Demo mode enabled');
  console.log('🔄 Production mode disabled');
  
  return true;
};

export const isProductionMode = () => {
  const productionMode = localStorage.getItem('PRODUCTION_MODE');
  const demoMode = localStorage.getItem('DEMO_MODE');
  
  // Default to demo mode if not explicitly set
  if (productionMode === 'true' && demoMode !== 'true') {
    return true;
  }
  
  return false;
};

export const getProductionStatus = () => {
  const isProduction = isProductionMode();
  const activatedAt = localStorage.getItem('CHATBOT_PRODUCTION_ACTIVATED');
  
  return {
    isProduction,
    isDemoMode: !isProduction,
    activatedAt: activatedAt ? new Date(activatedAt) : null,
    environmentChecks: {
      hasSupabase: !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY),
      hasOpenAI: !!(import.meta.env.VITE_OPENAI_API_KEY),
      hasGitHub: !!(import.meta.env.GITHUB_ID),
      hasShopify: !!(import.meta.env.VITE_SHOPIFY_API_KEY)
    }
  };
};

// Override demo mode detection for services
export const overrideDemoMode = () => {
  // This function can be called to force services to use production APIs
  // even if environment variables suggest demo mode
  
  if (isProductionMode()) {
    console.log('🚀 Production mode active - using real APIs');
    return false; // Not demo mode
  }
  
  console.log('🎮 Demo mode active - using fallback data');
  return true; // Demo mode
};

export default {
  enableProductionMode,
  disableProductionMode,
  isProductionMode,
  getProductionStatus,
  overrideDemoMode
};