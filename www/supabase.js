// Ensure the global supabase library from your CDN is loaded before initializing
if (typeof supabase === 'undefined') {
  console.error("🚨 Supabase CDN script was not loaded before supabase.js executed!");
}

const supabaseUrl = 'https://cywkbfmqpuoqgczcmcut.supabase.co';
// 🔑 Replace this string with your actual Project API Anon/Public Key from your Supabase dashboard
const supabaseKey = 'sb_publishable_2DVlFIw3R0zGTBsA0YqhyQ_KWxKAWsH';

// Create and export a single persistent client instance across your entire application
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,      // 🌟 Forces the browser to remember your login across all tabs/pages
    autoRefreshToken: true,    // Keeps your session active automatically
    detectSessionInUrl: true   // Handles callback redirects smoothly
  }
});

// Export it globally so signup.js, api.js and game.js can all reference it smoothly
window.supabaseClient = supabaseClient;

console.log("🌌 Supabase client instance initialized successfully with persistent session state.");
