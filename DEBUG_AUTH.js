// DEBUG: Check Auth Status
// Run this in browser console to see what's happening

// 1. Check Supabase auth
const checkAuth = async () => {
  console.log('=== AUTH DEBUG ===');
  
  // Check if user context exists
  const authContext = window.__REACT_CONTEXT_DEVTOOL__;
  console.log('React Context:', authContext);
  
  // Try to get session from storage
  const supabaseKey = Object.keys(localStorage).find(k => k.includes('supabase'));
  if (supabaseKey) {
    const session = JSON.parse(localStorage.getItem(supabaseKey));
    console.log('Supabase Session:', session);
    
    if (session?.user) {
      console.log('✅ Supabase User:', {
        email: session.user.email,
        id: session.user.id
      });
      
      // Now check if we can get full user data from API
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'auth',
          action: 'get_user_by_email',
          email: session.user.email
        })
      });
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success && data.agent) {
        console.log('✅ Full User Data:', {
          email: data.agent.email,
          organization_id: data.agent.organization_id,
          role: data.agent.role,
          name: data.agent.name
        });
      } else {
        console.log('❌ No agent data in Neon database for this user');
        console.log('   You need to create an agent record for:', session.user.email);
      }
    } else {
      console.log('❌ No user in Supabase session');
    }
  } else {
    console.log('❌ No Supabase auth found in localStorage');
    console.log('   You need to log in first');
  }
  
  console.log('=== END DEBUG ===');
};

checkAuth();
