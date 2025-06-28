import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (home page - should be public)
     * - /menus/ (menu pages - should be public)
     * - /api/menu-pdf/ (menu PDF API - should be public)
     * - /api/paymob-webhook (webhook endpoint)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|^/$|^/menus/|^/api/menu-pdf/|api/paymob-webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
