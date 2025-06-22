import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=auth_error', request.url))
      }

      if (data.user) {
        // Check if user has completed onboarding (has restaurant record)
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        if (restaurantError || !restaurant) {
          // New user - redirect to onboarding
          return NextResponse.redirect(new URL('/onboarding', request.url))
        } else {
          // Existing user - redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url))
    }
  }

  // If no code or something went wrong, redirect to login
  return NextResponse.redirect(new URL('/auth/login', request.url))
} 