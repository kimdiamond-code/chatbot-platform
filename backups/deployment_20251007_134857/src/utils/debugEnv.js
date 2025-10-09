// 🔍 Environment Variables Debug Script
// Add this to check if .env is being loaded properly

export const debugEnvVars = () => {
  console.log('🔍 Environment Variables Debug:');
  console.log('===================================');
  
  // Check Node environment
  console.log('NODE_ENV:', import.meta.env.NODE_ENV);
  console.log('MODE:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  
  // Check our custom variables
  console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 
    import.meta.env.VITE_OPENAI_API_KEY.substring(0, 20) + '...' : 'NOT SET');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 
    import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'NOT SET');
  console.log('VITE_DEFAULT_BOT_NAME:', import.meta.env.VITE_DEFAULT_BOT_NAME);
  
  // Check if demo mode is active
  const isDemoMode = 
    import.meta.env.VITE_SUPABASE_URL === 'demo-mode' ||
    import.meta.env.VITE_OPENAI_API_KEY === 'demo-mode';
  
  console.log('🎮 Demo Mode Active:', isDemoMode);
  console.log('===================================');
  
  return {
    envLoaded: !!import.meta.env.VITE_DEFAULT_BOT_NAME,
    demoMode: isDemoMode,
    openaiConfigured: import.meta.env.VITE_OPENAI_API_KEY && 
      !import.meta.env.VITE_OPENAI_API_KEY.includes('demo-mode'),
    supabaseConfigured: import.meta.env.VITE_SUPABASE_URL && 
      !import.meta.env.VITE_SUPABASE_URL.includes('demo-mode')
  };
};