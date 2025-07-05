import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse, type NextRequest } from "next/server"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // If Supabase is not configured, just continue without auth
  if (!isSupabaseConfigured) {
    return NextResponse.next({
      request,
    })
  }

  let res = NextResponse.next()

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if this is an auth callback with code parameter
  const code = request.nextUrl.searchParams.get('code')
  const isAuthCallback = code && (
    request.nextUrl.pathname === "/" || 
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/payment-status")
  )

  if (isAuthCallback) {
    // Redirect auth callbacks to the dedicated callback handler
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code)
    callbackUrl.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search)
    
    console.log('Redirecting auth callback to route handler:', callbackUrl.toString())
    return NextResponse.redirect(callbackUrl)
  } else {
    // Regular session refresh for non-callback requests
    await supabase.auth.getSession()
  }

  // Protected routes - redirect to login if not authenticated
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/auth/login") ||
    request.nextUrl.pathname.startsWith("/auth/sign-up") ||
    request.nextUrl.pathname.startsWith("/auth/forgot-password") ||
    request.nextUrl.pathname.startsWith("/auth/reset-password") ||
    request.nextUrl.pathname.startsWith("/saas-support") ||
    request.nextUrl.pathname === "/auth/callback"

  // Allow home page and menu pages for public access (no auth required)
  const isHomePage = request.nextUrl.pathname === "/"
  const isMenuPage = request.nextUrl.pathname.startsWith("/menus/")
  const isApiMenuPdf = request.nextUrl.pathname.startsWith("/api/menu-pdf/")

  if (!isAuthRoute && !isHomePage && !isMenuPage && !isApiMenuPdf) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const redirectUrl = new URL("/auth/login", request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}
