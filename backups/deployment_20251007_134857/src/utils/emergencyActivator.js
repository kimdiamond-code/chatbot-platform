// 🚀 Emergency Production Mode Activator
// Use this in browser console if the UI fails

console.log('🚀 Emergency Production Mode Activator Loaded');
console.log('📝 Run: activateProductionModeNow() to activate');

window.activateProductionModeNow = () => {
  console.log('🚀 Activating Production Mode...');
  
  // Set production flags
  localStorage.setItem('PRODUCTION_MODE', 'true');
  localStorage.setItem('DEMO_MODE', 'false');
  localStorage.setItem('CHATBOT_PRODUCTION_ACTIVATED', new Date().toISOString());
  
  console.log('✅ Production mode flags set');
  console.log('🎯 Status check:');
  console.log('PRODUCTION_MODE:', localStorage.getItem('PRODUCTION_MODE'));
  console.log('DEMO_MODE:', localStorage.getItem('DEMO_MODE'));
  
  alert('🚀 Production Mode Activated!\n\nReloading page to apply changes...');
  
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

window.checkProductionModeStatus = () => {
  const status = {
    productionMode: localStorage.getItem('PRODUCTION_MODE'),
    demoMode: localStorage.getItem('DEMO_MODE'),
    activatedAt: localStorage.getItem('CHATBOT_PRODUCTION_ACTIVATED'),
    isProduction: localStorage.getItem('PRODUCTION_MODE') === 'true'
  };
  
  console.log('📊 Production Mode Status:', status);
  return status;
};

window.resetToDemo = () => {
  localStorage.setItem('PRODUCTION_MODE', 'false');
  localStorage.setItem('DEMO_MODE', 'true');
  localStorage.removeItem('CHATBOT_PRODUCTION_ACTIVATED');
  console.log('🎮 Reset to demo mode');
  window.location.reload();
};

console.log('✅ Emergency activator ready!');
console.log('🔧 Available commands:');
console.log('  - activateProductionModeNow()');
console.log('  - checkProductionModeStatus()');
console.log('  - resetToDemo()');

export default {
  activateProductionModeNow: window.activateProductionModeNow,
  checkProductionModeStatus: window.checkProductionModeStatus,
  resetToDemo: window.resetToDemo
};