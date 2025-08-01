import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a Supabase client in server components/route handlers.
// In Next.js 15 the `cookies()` API is asynchronous, so instead of
// reading the cookie store synchronously we pass the `cookies` function
// directly to the Supabase helper. The helper will call it and await the
// result internally, avoiding the "cookies() should be awaited" runtime
// error.
export const createClient = () => {
  return createServerComponentClient({
    cookies,
  })
}
