// Emergency Production Mode Activator - Silent in production
// Available in console if needed: activateProductionModeNow()

window.activateProductionModeNow = () => {
  localStorage.setItem('PRODUCTION_MODE', 'true');
  localStorage.setItem('DEMO_MODE', 'false');
  localStorage.setItem('CHATBOT_PRODUCTION_ACTIVATED', new Date().toISOString());
  alert('Production Mode Activated! Reloading...');
  setTimeout(() => window.location.reload(), 1000);
};

window.checkProductionModeStatus = () => {
  return {
    productionMode: localStorage.getItem('PRODUCTION_MODE'),
    demoMode: localStorage.getItem('DEMO_MODE'),
    activatedAt: localStorage.getItem('CHATBOT_PRODUCTION_ACTIVATED'),
    isProduction: localStorage.getItem('PRODUCTION_MODE') === 'true'
  };
};

window.resetToDemo = () => {
  localStorage.setItem('PRODUCTION_MODE', 'false');
  localStorage.setItem('DEMO_MODE', 'true');
  localStorage.removeItem('CHATBOT_PRODUCTION_ACTIVATED');
  window.location.reload();
};

export default {
  activateProductionModeNow: window.activateProductionModeNow,
  checkProductionModeStatus: window.checkProductionModeStatus,
  resetToDemo: window.resetToDemo
};
