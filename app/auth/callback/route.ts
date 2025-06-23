import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    console.log('Processing auth callback in route handler')
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      // Exchange the auth code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', requestUrl.origin))
      }

      if (data.session && data.user) {
        console.log('Session established for user:', data.user.id)
        
        // Check if user has a restaurant (onboarding completed)
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', data.user.id)
          .single()

        let redirectTo = next

        if (restaurantError || !restaurant) {
          // New user - redirect to onboarding
          redirectTo = '/onboarding'
        } else {
          // Existing user - redirect to dashboard unless specifically going to payment status
          if (next === '/' || next === '') {
            redirectTo = '/dashboard'
          }
        }

        // Redirect to the appropriate page with clean URL
        return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
      }
    } catch (error) {
      console.error('Callback processing error:', error)
      return NextResponse.redirect(new URL('/auth/login?error=callback_processing_failed', requestUrl.origin))
    }
  }

  // If no code, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin))
} 