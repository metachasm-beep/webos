import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Neural Registry Offline (Missing Supabase Credentials). Persistence is disabled.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
