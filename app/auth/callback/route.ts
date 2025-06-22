import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=Authentication failed', request.url))
      }

      // Check if this is a new user (Google OAuth) or email confirmation
      if (data.user) {
        // Check if user has completed onboarding
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (restaurantError || !restaurant) {
          // New user needs onboarding
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // User already has restaurant setup, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=Authentication failed', request.url))
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
} 