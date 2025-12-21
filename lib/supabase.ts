import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser/client-side usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Server client for API routes (uses service role key for full access)
export function createServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
