import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-url')) {
  console.error("Supabase URL or Anon Key is missing or placeholders are being used. Please check your environment variables in index.html.");
  alert("خطأ في الإعداد: بيانات Supabase غير مكتملة. يرجى مراجعة التعليمات في ملف index.html");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Supabase client-side auth uses localStorage by default.
        // No need to specify storage unless you want to customize it.
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Helper function to get the public URL for a storage item
export const getPublicUrl = (bucket: string, path: string | undefined | null) => {
    if (!path) return '/default-profile.png'; // A default placeholder image
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}
