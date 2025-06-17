// Supabase configuration
const SUPABASE_URL = 'https://baevzgtwnmiothstaxwd.supabase.co'; // Add your Supabase URL here
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZXZ6Z3R3bm1pb3Roc3RheHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNjAwNjksImV4cCI6MjA2NTczNjA2OX0.Wh3uRybrug1_5ARbjxi45LlWmfoxpWBRbZg6IOGgjtg'; // Add your Supabase anon/public key here

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other modules
window.supabase = supabaseClient; 