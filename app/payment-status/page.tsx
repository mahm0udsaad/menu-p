'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ArrowRight, CreditCard, Menu, Sparkles, Crown } from 'lucide-react';
import { checkPaymentStatus } from '@/lib/actions/payment';
import { usePaymentStatus } from '@/lib/hooks/use-payment-status';

// Component that uses useSearchParams
function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);
  const [autoRedirect, setAutoRedirect] = useState(true);

  // Use the payment status hook for real-time updates
  const { hasPaidPlan, loading: paymentLoading, refetch: refetchPaymentStatus } = usePaymentStatus();

  const success = searchParams.get('success');
  const orderId = searchParams.get('order');
  const autoPublish = searchParams.get('auto_publish');

  useEffect(() => {
    const checkStatus = async () => {
      if (success === 'true') {
        setStatus('success');
        
        // Force refresh payment status for immediate UI updates
        await refetchPaymentStatus();
        
        // If we have an order ID, fetch payment details
        if (orderId) {
          try {
            const result = await checkPaymentStatus(parseInt(orderId));
            if (result.success) {
              setPaymentDetails(result.payment);
            }
          } catch (error) {
            console.error('Error fetching payment details:', error);
          }
        }
      } else if (success === 'false') {
        setStatus('failed');
      } else {
        // If no success parameter, check based on order ID
        if (orderId) {
          try {
            const result = await checkPaymentStatus(parseInt(orderId));
            if (result.success && result.payment) {
              setPaymentDetails(result.payment);
              setStatus(result.payment.status === 'paid' ? 'success' : 'failed');
              if (result.payment.status === 'paid') {
                await refetchPaymentStatus();
              }
            } else {
              setStatus('failed');
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
            setStatus('failed');
          }
        } else {
          setStatus('failed');
        }
      }
    };

    checkStatus();
  }, [success, orderId, refetchPaymentStatus]);

  // Auto-redirect countdown for successful payments
  useEffect(() => {
    if (status === 'success' && autoRedirect && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && autoRedirect && countdown === 0) {
      handleContinue();
    }
  }, [status, autoRedirect, countdown]);

  const handleContinue = () => {
    // Get saved return URL from localStorage (more reliable than URL params)
    const savedReturnUrl = localStorage.getItem('paymentReturnUrl');
    const savedStep = localStorage.getItem('paymentReturnStep');
    const savedTab = localStorage.getItem('paymentReturnTab');
    const redirect = searchParams.get('redirect');
    
    console.log('🔄 Payment status redirect - Saved state:', { savedReturnUrl, savedStep, savedTab });
    
    let finalUrl = savedReturnUrl || redirect || '/dashboard';
    
    // If we have saved state, construct the URL with those parameters
    if (savedReturnUrl && (savedStep || savedTab)) {
      const url = new URL(savedReturnUrl, window.location.origin);
      if (savedStep && !url.searchParams.has('step')) {
        url.searchParams.set('step', savedStep);
      }
      if (savedTab && !url.searchParams.has('tab')) {
        url.searchParams.set('tab', savedTab);
      }
      finalUrl = url.pathname + url.search;
    }
    
    // Add auto_publish parameter for automatic action after payment
    if ((autoPublish === 'true' || savedReturnUrl) && !finalUrl.includes('auto_publish=true')) {
      const separator = finalUrl.includes('?') ? '&' : '?';
      finalUrl += `${separator}auto_publish=true`;
    }
    
    console.log('🔄 Redirecting to:', finalUrl);
    console.log('🧹 Cleaning up localStorage...');
    
    // Clean up localStorage
    localStorage.removeItem('paymentReturnUrl');
    localStorage.removeItem('paymentReturnStep');
    localStorage.removeItem('paymentReturnTab');
    localStorage.removeItem('paymentReturnTimestamp');
    
    router.push(finalUrl);
  };

  const handleRetry = () => {
    const savedReturnUrl = localStorage.getItem('paymentReturnUrl');
    router.push(savedReturnUrl || '/');
  };

  const toggleAutoRedirect = () => {
    setAutoRedirect(!autoRedirect);
    if (!autoRedirect) {
      setCountdown(5); // Reset countdown when re-enabling
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-red-50 p-4 relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40"></div>
          
          {/* Animated gradient orbs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-red-200/50 to-rose-200/50 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Floating Particles */}
          <div className="absolute top-20 right-20 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-300 shadow-lg shadow-red-500/50"></div>
          <div className="absolute top-40 left-32 w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-700 shadow-lg shadow-rose-500/50"></div>
          <div className="absolute bottom-32 right-1/3 w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce delay-1000 shadow-lg shadow-pink-500/50"></div>
        </div>

        <Card className="relative z-10 w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70 hover:shadow-red-500/20 transition-all duration-500">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-rose-500 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-red-600 to-rose-600 p-4 rounded-full">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2 text-center bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">معالجة الدفع</h2>
            <p className="text-gray-600 text-center text-sm font-medium">
              يرجى الانتظار بينما نتحقق من دفعتك...
            </p>
            <div className="mt-6 flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-500/50" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50" style={{animationDelay: '0.4s'}}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-red-50 p-4 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 via-white to-rose-50/40"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-r from-red-200/50 to-rose-200/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-r from-rose-200/40 to-pink-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-100/30 to-rose-100/30 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Floating Particles */}
        <div className="absolute top-20 right-20 w-3 h-3 bg-red-500 rounded-full animate-bounce delay-300 shadow-lg shadow-red-500/50"></div>
        <div className="absolute top-40 left-32 w-2 h-2 bg-rose-500 rounded-full animate-bounce delay-700 shadow-lg shadow-rose-500/50"></div>
        <div className="absolute bottom-32 right-1/3 w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce delay-1000 shadow-lg shadow-pink-500/50"></div>
        <div className="absolute top-1/3 left-20 w-2 h-2 bg-red-600 rounded-full animate-bounce delay-500 shadow-lg shadow-red-600/50"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/70 overflow-hidden hover:shadow-red-500/20 transition-all duration-500">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {status === 'success' ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-400 rounded-full blur-2xl opacity-75 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-red-600 to-rose-600 rounded-full p-2">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 border-4 border-red-200 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-400 rounded-full blur-2xl opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-red-600 to-rose-600 rounded-full p-2">
                    <XCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
              )}
            </div>
            <CardTitle className={`text-2xl font-bold flex items-center justify-center gap-2 ${status === 'success' ? 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent' : 'text-red-600'}`}>
              {status === 'success' ? (
                <>
                  <Crown className="w-6 h-6 text-red-600" />
                  🎉 تم الدفع بنجاح!
                  <Sparkles className="w-6 h-6 text-red-600" />
                </>
              ) : (
                '❌ فشل في الدفع'
              )}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 font-medium">
              {status === 'success' 
                ? 'تمت معالجة دفعتك بنجاح وتم ترقية حسابك.'
                : 'حدثت مشكلة في معالجة دفعتك.'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6 pb-6">
            {status === 'success' ? (
              <div className="space-y-4">
                {paymentDetails && (
                  <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-4 space-y-3 border border-red-100 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center font-medium">
                        <CreditCard className="w-4 h-4 mr-2 text-red-500" />
                        المبلغ:
                      </span>
                      <span className="font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">{paymentDetails.amount / 100} جنيه</span>
                    </div>

                    {paymentDetails.currency && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">العملة:</span>
                        <span className="font-bold text-red-600">{paymentDetails.currency.toUpperCase()}</span>
                      </div>
                    )}

                    {paymentDetails.created_at && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">التاريخ:</span>
                        <span className="font-bold text-red-600">
                          {new Date(paymentDetails.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    )}

                    {paymentDetails.order_id && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">رقم الطلب:</span>
                        <span className="font-mono text-xs bg-red-100 px-2 py-1 rounded text-red-700">
                          #{paymentDetails.order_id}
                      </span>
                    </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center justify-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-green-700 font-medium text-sm">تم تفعيل الباقة المميزة</span>
                </div>

                  {autoRedirect && (
                    <div className="text-center text-sm text-gray-600 bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="font-medium">سيتم التوجيه تلقائياً خلال <span className="font-bold text-red-600">{countdown}</span> ثانية</p>
                    <button
                      onClick={toggleAutoRedirect}
                        className="text-xs text-red-500 hover:text-red-700 underline mt-1 transition-colors"
                    >
                      إلغاء التوجيه التلقائي
                    </button>
                  </div>
                )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleContinue} 
                    className="flex-1 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:shadow-red-500/30 transition-all duration-300 group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    متابعة إلى لوحة التحكم
                  </Button>
                  
                  {autoRedirect && (
                    <Button
                      variant="outline"
                      onClick={toggleAutoRedirect}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium py-3 px-4 rounded-xl transition-all duration-300"
                    >
                      البقاء هنا
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-4 border border-red-200">
                  <p className="text-red-700 text-sm text-center font-medium">
                    لم تتم معالجة دفعتك بنجاح. يرجى المحاولة مرة أخرى أو التواصل معنا للمساعدة.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleRetry} 
                    className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-xl hover:shadow-red-500/30 transition-all duration-300 group"
                  >
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    محاولة مرة أخرى
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-medium py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    العودة إلى لوحة التحكم
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading fallback component
function PaymentStatusFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-red-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-2xl">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
          <p className="text-gray-600 text-center font-medium">جاري التحميل...</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main component with Suspense wrapper
export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<PaymentStatusFallback />}>
      <PaymentStatusContent />
    </Suspense>
  );
}
