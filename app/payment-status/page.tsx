'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { checkPaymentStatus } from '@/lib/actions/payment';

// Component that uses useSearchParams
function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const success = searchParams.get('success');
  const orderId = searchParams.get('order');

  useEffect(() => {
    const checkStatus = async () => {
      if (success === 'true') {
        setStatus('success');
        
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
            if (result.success) {
              setPaymentDetails(result.payment);
              setStatus(result.payment.status === 'paid' ? 'success' : 'failed');
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
  }, [success, orderId]);

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    router.push('/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-muted-foreground text-center">
              Please wait while we verify your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'success' ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className={`text-2xl ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status === 'success' ? '🎉 Payment Successful!' : '❌ Payment Failed'}
          </CardTitle>
          <CardDescription>
            {status === 'success' 
              ? 'Your payment has been processed successfully.'
              : 'There was an issue processing your payment.'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' ? (
            <>
              {paymentDetails && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">{paymentDetails.amount / 100} EGP</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize text-green-600">
                      {paymentDetails.status}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your account has been upgraded</li>
                  <li>• You can now create professional menus</li>
                  <li>• Access all premium features</li>
                  <li>• Generate QR codes and PDFs</li>
                </ul>
              </div>

              <Button 
                onClick={handleContinue} 
                className="w-full"
                size="lg"
              >
                Continue to Dashboard
              </Button>
            </>
          ) : (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">What went wrong?</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Payment was declined by your bank</li>
                  <li>• Insufficient funds</li>
                  <li>• Network connection issue</li>
                  <li>• Card details were incorrect</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleRetry} 
                  className="w-full"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')} 
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Continue with Free Plan
                </Button>
              </div>
            </>
          )}

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@menu-p.com" className="text-primary hover:underline">
                support@menu-p.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback component
function PaymentStatusFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Payment Status</h2>
          <p className="text-muted-foreground text-center">
            Please wait while we load your payment information...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main page component with Suspense boundary
export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<PaymentStatusFallback />}>
      <PaymentStatusContent />
    </Suspense>
  );
}
