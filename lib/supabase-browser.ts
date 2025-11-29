import { createBrowserClient } from "@supabase/ssr"
import { supabaseConfig, validateConfig } from "./sb-config"

export function createClient() {
  validateConfig()
  
  return createBrowserClient(
    supabaseConfig.url!,
    supabaseConfig.key!
  )
}
