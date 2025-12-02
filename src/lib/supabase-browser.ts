import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient(customUrl?: string, customKey?: string) {
  // If custom credentials provided, create new client
  if (customUrl && customKey) {
    return createSupabaseClient(customUrl, customKey)
  }

  // Otherwise use singleton pattern with env variables
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ""
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables")
    }

    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey)
  }

  return supabaseInstance
}
