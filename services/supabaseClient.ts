import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zetgvwnhiozgjbjpydjr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpldGd2d25oaW96Z2pianB5ZGpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NjE0MDcsImV4cCI6MjA3MzQzNzQwN30.U-OLh9vOzCCViOpDwhhmunFv-Gc_gig-3Y-F944UIsk";

// A custom fetch implementation to add robustness and improved error logging for network issues.
const robustFetch: typeof fetch = async (input, init) => {
  try {
    // Add robust fetch options to potentially mitigate transient network issues.
    const options: RequestInit = {
      ...init,
      mode: 'cors', // Explicitly set CORS mode.
      cache: 'no-cache', // Bypass browser cache.
    };
    return await fetch(input, options);
  } catch (error) {
    // Provide a more informative error message for the common "Failed to fetch" error.
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error(
        'Supabase fetch failed. This is likely a network error or a CORS configuration issue. Please ensure you are online and that this application\'s domain is added to the CORS origins list in your Supabase project settings (Authentication -> URL Configuration).',
        { error }
      );
    } else {
       console.error('An unexpected error occurred during the Supabase fetch operation:', error);
    }
    // Re-throw the error so the Supabase client's error handling can proceed.
    throw error;
  }
};


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: robustFetch,
    }
});