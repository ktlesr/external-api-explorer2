import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export function createClient(customUrl?: string, customKey?: string) {
  // If custom credentials provided, create new client
  if (customUrl && customKey) {
    return createSupabaseClient(customUrl, customKey)
  }

  // Otherwise use singleton pattern with hardcoded values
  if (!supabaseInstance) {
    const supabaseUrl = "https://zyxiznikuvpwmopraauj.supabase.co"
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGl6bmlrdXZwd21vcHJhYXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDU5ODQsImV4cCI6MjA2NDQyMTk4NH0.YNf5WA5grzswrRKl5SfiZh1dZM9esA66vvHI5fATPm8"

    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey)
  }

  return supabaseInstance
}
