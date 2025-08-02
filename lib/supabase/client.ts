import { createClientComponentClient, type SupabaseClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client for Client Components
// Only initialize the real client when configuration is present; otherwise
// provide a minimal stub so that imports don't throw during build.
export const supabase: SupabaseClient | { auth: { getUser: () => Promise<{ data: { user: null } }> } } =
  isSupabaseConfigured
    ? createClientComponentClient()
    : {
        auth: {
          async getUser() {
            return { data: { user: null } }
          },
        },
      }
