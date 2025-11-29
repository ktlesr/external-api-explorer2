export const supabaseConfig = {
  url: "https://zyxiznikuvpwmopraauj.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5eGl6bmlrdXZwd21vcHJhYXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NDU5ODQsImV4cCI6MjA2NDQyMTk4NH0.YNf5WA5grzswrRKl5SfiZh1dZM9esA66vvHI5fATPm8"
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
