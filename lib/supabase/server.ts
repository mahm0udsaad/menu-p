import { createServerComponentClient, type SupabaseClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

type CookieStore = Awaited<ReturnType<typeof cookies>>

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a Supabase client in server components/route handlers.
// @supabase/auth-helpers-nextjs reads `context.cookies().get(...)`
// synchronously, so Next 15 call sites can pass an awaited cookie store.
export const createClient = (cookieStore?: CookieStore): SupabaseClient | any => {
  if (!isSupabaseConfigured) {
    // Return a minimal stub with the methods used in the app so that pages
    // can still be evaluated during build without real Supabase credentials.
    const stub = {
      auth: {
        async getUser() {
          return { data: { user: null } }
        },
        async getSession() {
          return { data: { session: null } }
        },
      },
      from() {
        // Provide chainable query builder stubs
        const builder: any = {
          select: () => builder,
          eq: () => builder,
          single: async () => ({ data: null }),
          insert: async () => ({ data: null }),
          update: async () => ({ data: null }),
          delete: async () => ({ data: null }),
        }
        return builder
      },
    }
    return stub
  }

  return createServerComponentClient({
    cookies: (() => cookieStore ?? cookies()) as unknown as typeof cookies,
  })
}
