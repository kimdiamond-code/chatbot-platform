// Environment Variables Debug - Silent in production
// Call debugEnvVars(true) to see output

export const debugEnvVars = (verbose = false) => {
  const isDemoMode = 
    import.meta.env.VITE_SUPABASE_URL === 'demo-mode' ||
    import.meta.env.VITE_OPENAI_API_KEY === 'demo-mode';
  
  const status = {
    envLoaded: !!import.meta.env.VITE_DEFAULT_BOT_NAME,
    demoMode: isDemoMode,
    openaiConfigured: import.meta.env.VITE_OPENAI_API_KEY && 
      !import.meta.env.VITE_OPENAI_API_KEY.includes('demo-mode'),
    supabaseConfigured: import.meta.env.VITE_SUPABASE_URL && 
      !import.meta.env.VITE_SUPABASE_URL.includes('demo-mode')
  };

  if (verbose) {
    console.log('🔍 Environment Variables Debug:');
    console.log('===================================');
    console.log('NODE_ENV:', import.meta.env.NODE_ENV);
    console.log('MODE:', import.meta.env.MODE);
    console.log('DEV:', import.meta.env.DEV);
    console.log('PROD:', import.meta.env.PROD);
    console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 
      import.meta.env.VITE_OPENAI_API_KEY.substring(0, 20) + '...' : 'NOT SET');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🎮 Demo Mode Active:', isDemoMode);
    console.log('===================================');
  }
  
  return status;
};
