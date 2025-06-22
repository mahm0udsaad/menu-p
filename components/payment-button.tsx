'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import PaymentModal from './payment-modal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handlePayment = () => {
    if (!restaurantId) {
      toast.error('يرجى إنشاء مطعم أولاً');
      router.push('/onboarding');
      return;
    }

    if (!userEmail || !userName) {
      toast.error('يرجى إكمال بيانات الملف الشخصي');
      return;
    }

    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        onClick={handlePayment}
        size={size}
        variant={variant}
        className={className}
      >
        <Zap className="w-4 h-4 mr-2" />
        ادفع ${amount / 100} الآن
      </Button>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={amount}
        planName={planName}
        restaurantId={restaurantId}
        userEmail={userEmail}
        userName={userName}
      />
    </>
  );
}