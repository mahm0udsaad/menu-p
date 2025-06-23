'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, ArrowRight, CreditCard, Menu, Sparkles } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6">
            <div className="mb-6">
              <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-center">معالجة الدفع</h2>
            <p className="text-muted-foreground text-center text-sm">
              يرجى الانتظار بينما نتحقق من دفعتك...
            </p>
            <div className="mt-4 flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {status === 'success' ? (
                <div className="relative">
                  <CheckCircle className="w-20 h-20 text-emerald-500" />
                  <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-200 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <XCircle className="w-20 h-20 text-red-500" />
              )}
            </div>
            <CardTitle className={`text-2xl font-bold ${status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
              {status === 'success' ? '🎉 تم الدفع بنجاح!' : '❌ فشل في الدفع'}
            </CardTitle>
            <CardDescription className="text-base">
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
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 space-y-3 border border-emerald-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        المبلغ:
                      </span>
                      <span className="font-bold text-emerald-600">{paymentDetails.amount / 100} جنيه</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">الحالة:</span>
                      <span className="font-medium capitalize text-emerald-600 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        مدفوع
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-800 mb-3 flex items-center">
                    <Menu className="w-5 h-5 mr-2" />
                    ما التالي؟
                  </h3>
                  <ul className="text-sm text-emerald-700 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                      تم ترقية حسابك
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                      يمكنك الآن إنشاء قوائم احترافية
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                      الوصول لجميع المميزات المتقدمة
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                      إنشاء رموز QR وملفات PDF
                    </li>
                  </ul>
                </div>

                {autoRedirect && countdown > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-sm text-blue-700 mb-2">
                      سيتم التوجيه تلقائياً خلال {countdown} ثانية
                    </p>
                    <button
                      onClick={toggleAutoRedirect}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      إلغاء التوجيه التلقائي
                    </button>
                  </div>
                )}

                <div className="space-y-3">
                  <Button 
                    onClick={handleContinue} 
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
                    size="lg"
                  >
                    <span className="flex items-center justify-center">
                      {autoPublish === 'true' ? 'متابعة نشر القائمة' : 'الذهاب للوحة التحكم'}
                      <ArrowRight className="w-4 h-4 mr-2" />
                    </span>
                  </Button>
                  
                  {!autoRedirect && (
                    <button
                      onClick={toggleAutoRedirect}
                      className="w-full text-sm text-muted-foreground hover:text-foreground underline"
                    >
                      تفعيل التوجيه التلقائي
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-3">ما الذي حدث؟</h3>
                  <ul className="text-sm text-red-700 space-y-2">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      تم رفض الدفع من البنك
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      رصيد غير كافي
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      مشكلة في الاتصال بالإنترنت
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      بيانات البطاقة غير صحيحة
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleRetry} 
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                    size="lg"
                  >
                    المحاولة مرة أخرى
                  </Button>
                  
                  <Button 
                    onClick={() => router.push('/dashboard')} 
                    variant="outline"
                    className="w-full"
                  >
                    العودة للوحة التحكم
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

// Fallback component for Suspense
function PaymentStatusFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
        <p className="text-muted-foreground">جاري التحميل...</p>
      </div>
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
