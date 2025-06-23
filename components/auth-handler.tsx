'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import AuthLoading from './auth-loading'

export default function AuthHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      // Handle auth errors from middleware or OAuth provider
      if (error) {
        console.error('Auth error:', error, errorDescription)
        
        let errorMessage = 'حدث خطأ في تسجيل الدخول'
        if (error === 'auth_callback_failed') {
          errorMessage = 'فشل في معالجة رمز المصادقة'
        } else if (error === 'callback_processing_failed') {
          errorMessage = 'فشل في معالجة عملية المصادقة'
        }
        
        router.push(`/auth/login?error=${encodeURIComponent(errorMessage)}`)
        return
      }

      // If there's a code parameter, show loading and process
      if (code) {
        setIsProcessing(true)
        
        try {
          // Small delay to allow middleware to process
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Check current session (middleware should have already established it)
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session check error:', sessionError)
            router.push('/auth/login?error=session_error')
            return
          }

          if (session?.user) {
            console.log('Client-side session confirmed for user:', session.user.id)
            
            // Clear the code parameter from URL for clean URLs
            const url = new URL(window.location.href)
            url.searchParams.delete('code')
            url.searchParams.delete('state')
            window.history.replaceState({}, '', url.toString())

            // Check if we're on payment status page - don't redirect
            if (window.location.pathname.startsWith('/payment-status')) {
              setIsProcessing(false)
              return
            }

            // For other pages, let the middleware handle routing
            // This prevents double redirects
            if (window.location.pathname === '/') {
              // Small delay to ensure middleware redirect takes effect
              setTimeout(() => {
                router.refresh()
                setIsProcessing(false)
              }, 100)
            } else {
              setIsProcessing(false)
            }
          } else {
            // No session despite having code - redirect to login
            router.push('/auth/login?error=no_session')
          }
        } catch (error) {
          console.error('Client-side callback processing error:', error)
          router.push('/auth/login?error=client_callback_error')
        }
      }
    }

    handleAuthCallback()
  }, [searchParams, router, supabase])

  // Show loading overlay during auth callback processing
  if (isProcessing) {
    return <AuthLoading message="جاري معالجة تسجيل الدخول..." />
  }

  // This component doesn't render anything visible when not processing
  return null
} 