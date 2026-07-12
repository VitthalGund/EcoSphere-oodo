import { createClient } from "@supabase/supabase-js";

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (supabaseUrl.endsWith("/rest/v1/")) {
  supabaseUrl = supabaseUrl.slice(0, -9);
} else if (supabaseUrl.endsWith("/rest/v1")) {
  supabaseUrl = supabaseUrl.slice(0, -8);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
