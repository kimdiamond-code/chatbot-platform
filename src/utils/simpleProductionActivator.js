// 🚀 Simple Production Mode Activator
// Quick activation without complex dependencies

export const activateProductionMode = () => {
  console.log('🚀 Activating Production Mode...');
  
  // Set production flags
  localStorage.setItem('PRODUCTION_MODE', 'true');
  localStorage.setItem('DEMO_MODE', 'false');
  localStorage.setItem('CHATBOT_PRODUCTION_ACTIVATED', new Date().toISOString());
  
  // Clear demo data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('demo-')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log('✅ Production mode activated successfully!');
  console.log('🔄 Page will reload to apply changes...');
  
  // Show success message
  alert('🚀 Production Mode Activated!\n\nAll systems now using live APIs and databases.\nPage will reload automatically.');
  
  // Reload page
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
  return true;
};

export const checkProductionStatus = () => {
  const isProduction = localStorage.getItem('PRODUCTION_MODE') === 'true';
  return {
    isProduction,
    isDemoMode: !isProduction,
    activatedAt: localStorage.getItem('CHATBOT_PRODUCTION_ACTIVATED')
  };
};

export default { activateProductionMode, checkProductionStatus };