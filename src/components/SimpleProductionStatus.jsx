import React, { useState, useEffect } from 'react';

const SimpleProductionStatus = () => {
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    const checkMode = () => {
      const mode = localStorage.getItem('PRODUCTION_MODE') === 'true';
      setIsProduction(mode);
    };
    
    checkMode();
    
    // Listen for storage changes
    const handleStorageChange = () => checkMode();
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for changes every 5 seconds
    const interval = setInterval(checkMode, 5000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      isProduction 
        ? 'bg-green-100 text-green-800' 
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      {isProduction ? '🚀 Production' : '🎮 Demo'}
    </span>
  );
};

export default SimpleProductionStatus;