'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      
      if (code) {
        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('Auth callback error:', error)
            router.push('/auth/login?error=auth_error')
            return
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
              router.push('/onboarding')
            } else {
              // Existing user - redirect to dashboard
              router.push('/dashboard')
            }
          }
        } catch (error) {
          console.error('Callback processing error:', error)
          router.push('/auth/login?error=callback_error')
        }
      }
    }

    handleAuthCallback()
  }, [searchParams, router, supabase])

  // This component doesn't render anything visible
  return null
} 