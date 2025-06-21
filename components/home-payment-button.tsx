'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { createPaymobPayment } from '@/lib/actions/payment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface HomePaymentButtonProps {
  restaurantId?: string;
  userEmail?: string;
  userName?: string;
  isLoggedIn: boolean;
}

export default function HomePaymentButton({
  restaurantId,
  userEmail,
  userName,
  isLoggedIn
}: HomePaymentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handlePayment = () => {
    if (!isLoggedIn) {
      router.push('/auth/sign-up');
      return;
    }

    if (!restaurantId) {
      toast.error('Please create a restaurant first');
      router.push('/onboarding');
      return;
    }

    if (!userEmail || !userName) {
      toast.error('Please complete your profile');
      return;
    }

    const amount = 8000; // $80 in cents
    
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
          const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID}?payment_token=${result.paymentToken}`;
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

  if (!isLoggedIn) {
    return (
      <Button className="w-full bg-emerald-500 hover:bg-emerald-600" asChild>
        <Link href="/auth/sign-up">ابدأ الآن</Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isPending}
      className="w-full bg-emerald-500 hover:bg-emerald-600"
    >
      {isPending ? (
        <>
          <Zap className="w-4 h-4 mr-2 animate-spin" />
          جاري المعالجة...
        </>
      ) : (
        <>
          <Zap className="w-4 h-4 mr-2" />
          ادفع $80 الآن
        </>
      )}
    </Button>
  );
} 