import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'production') {
    console.error("CRITICAL: Neural Registry Credentials Missing in Production Environment.");
  } else {
    console.warn("Neural Registry Offline (Missing Supabase Credentials). Persistence is disabled.");
  }
}

// In Next.js build time, we provide fallback strings to prevent createClient from throwing.
// These are only used during static analysis/build.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-neural-registry.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
