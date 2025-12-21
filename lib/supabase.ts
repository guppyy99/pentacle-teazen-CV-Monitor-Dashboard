import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Supabase 설정 여부 확인
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project")
)

// Mock 모드 확인
export const useMockData = process.env.USE_MOCK_DATA === "true" || !isSupabaseConfigured

// Client for browser/client-side usage
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null

// Server client for API routes (uses service role key for full access)
export function createServerClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) {
    console.warn("Supabase not configured - using mock data")
    return null
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  if (!supabaseServiceKey || supabaseServiceKey.includes("your-service")) {
    console.warn("Supabase service key not configured - using mock data")
    return null
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
