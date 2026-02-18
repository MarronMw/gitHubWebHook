import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables",
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
