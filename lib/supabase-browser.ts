import { createBrowserClient } from "@supabase/ssr"

export function createClient(url?: string, key?: string) {
  const sb_url = "https://zyxiznikuvpwmopraauj.supabase.co";
const sb_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGl6bmlrdXZwd21vcHJhYXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDU5ODQsImV4cCI6MjA2NDQyMTk4NH0.YNf5WA5grzswrRKl5SfiZh1dZM9esA66vvHI5fATPm8";

  const supabaseUrl = sb_url || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = sb_key || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
