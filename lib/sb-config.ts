export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}

export function validateConfig() {
  if (!supabaseConfig.url || !supabaseConfig.key) {
    throw new Error(`
      Missing Supabase environment variables.
      Please check:
      1. .env.local file exists
      2. NEXT_PUBLIC_SUPABASE_URL is set
      3. NEXT_PUBLIC_SUPABASE_ANON_KEY is set
      4. You've restarted your development server after adding variables
    `)
  }
}
