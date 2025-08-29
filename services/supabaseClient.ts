
import { createClient } from '@supabase/supabase-js';

// Explicitly use window.process.env which is polyfilled in index.html
const supabaseUrl = (window as any).process?.env?.SUPABASE_URL || '';
const supabaseAnonKey = (window as any).process?.env?.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL or Anon Key is missing. Check the environment configuration in index.html. The application will not work.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Supabase client-side auth uses localStorage by default.
        // No need to specify storage unless you want to customize it.
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    },
    // Add this to potentially resolve fetch issues in some environments
    global: {
        fetch: fetch,
    },
});

// Helper function to get the public URL for a storage item
export const getPublicUrl = (bucket: string, path: string | undefined | null) => {
    if (!path) return '/default-profile.png'; // A default placeholder image
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
