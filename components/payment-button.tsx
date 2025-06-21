'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { createPaymobPayment } from '@/lib/actions/payment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PaymentButtonProps {
  amount: number;
  planName: string;
  restaurantId?: string;
  userEmail?: string;
  userName?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function PaymentButton({
  amount,
  planName,
  restaurantId,
  userEmail,
  userName,
  className,
  size = 'default',
  variant = 'default'
}: PaymentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePayment = () => {
    if (!restaurantId) {
      toast.error('Please create a restaurant first');
      router.push('/onboarding');
      return;
    }

    if (!userEmail || !userName) {
      toast.error('Please complete your profile');
      return;
    }

    startTransition(async () => {
      try {
        // Prepare billing data
        const billingData = {
          firstName: userName.split(' ')[0] || 'User',
          lastName: userName.split(' ').slice(1).join(' ') || 'Name',
          email: userEmail,
          phone: '+201000000000', // Default phone - user can update in profile
        };

        const result = await createPaymobPayment(amount, billingData, restaurantId);
        
        if (result.success && result.paymentToken) {
          // Redirect to Paymob checkout
          const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${result.paymentToken}`;
          window.location.href = iframeUrl;
        } else {
          toast.error(result.error || 'Failed to create payment');
        }
      } catch (error) {
        console.error('Payment error:', error);
        toast.error('Failed to process payment');
      }
    });
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isPending}
      size={size}
      variant={variant}
      className={className}
    >
      {isPending ? (
        <>
          <Zap className="w-4 h-4 mr-2 animate-spin" />
          جاري المعالجة...
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 mr-2" />
          ادفع ${amount / 100} الآن
        </>
      )}
    </Button>
  );
}