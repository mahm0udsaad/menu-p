'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Wallet, X, ArrowLeft, CheckCircle, Zap } from 'lucide-react';
import { createPaymobPayment } from '@/lib/actions/payment';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  name: string;
  nameAr: string;
  icon: React.ReactNode;
  currency: string;
  integrationId: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit Card',
    nameAr: 'بطاقة ائتمان',
    icon: <CreditCard className="w-6 h-6" />,
    currency: 'EGP',
    integrationId: '4856925',
    color: 'text-emerald-400',
    bgColor: 'bg-slate-800 hover:bg-slate-700',
    borderColor: 'border-slate-600 hover:border-emerald-400'
  },
  {
    id: 'wallet',
    name: 'Mobile Wallet',
    nameAr: 'محفظة موبايل',
    icon: <Wallet className="w-6 h-6" />,
    currency: 'EGP',
    integrationId: '5148466',
    color: 'text-emerald-400',
    bgColor: 'bg-slate-800 hover:bg-slate-700',
    borderColor: 'border-slate-600 hover:border-emerald-400'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameAr: 'PayPal',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.95.95 0 0 0-.943.8l-1.115 7.06h3.762l.788-4.991h2.548c4.687 0 8.367-1.907 9.42-7.4.394-2.056.007-3.746-.484-4.383z"/>
      </svg>
    ),
    currency: 'USD',
    integrationId: '5148461',
    color: 'text-blue-400',
    bgColor: 'bg-slate-800 hover:bg-slate-700',
    borderColor: 'border-slate-600 hover:border-blue-400'
  }
];

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  planName: string;
  restaurantId?: string;
  userEmail?: string;
  userName?: string;
}

type ModalStep = 'method-selection' | 'payment-iframe' | 'processing';

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  planName,
  restaurantId,
  userEmail,
  userName
}: PaymentModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('method-selection');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('method-selection');
      setSelectedMethod(null);
      setIframeUrl('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  const convertCurrency = (amountInCents: number, toCurrency: string) => {
    if (toCurrency === 'USD') {
      // Convert EGP to USD (assuming 1 USD = 50 EGP roughly)
      return Math.round(amountInCents / 50);
    }
    return amountInCents;
  };

  const formatPrice = (amountInCents: number, currency: string) => {
    const convertedAmount = convertCurrency(amountInCents, currency);
    const displayAmount = convertedAmount / 100;
    
    if (currency === 'USD') {
      return `$${displayAmount.toFixed(2)}`;
    }
    return `${displayAmount.toFixed(0)} جنيه`;
  };

  const handleMethodSelect = async (method: PaymentMethod) => {
    if (!restaurantId || !userEmail || !userName) {
      toast.error('معلومات المستخدم غير مكتملة');
      return;
    }

    setSelectedMethod(method);
    setCurrentStep('processing');
    setIsProcessing(true);

    try {
      const billingData = {
        firstName: userName.split(' ')[0] || 'User',
        lastName: userName.split(' ').slice(1).join(' ') || 'Name',
        email: userEmail,
        phone: '+201000000000',
      };

      const convertedAmount = convertCurrency(amount, method.currency);
      
      const result = await createPaymobPayment(
        convertedAmount, 
        billingData, 
        restaurantId,
        method.integrationId
      );
      
      if (result.success && result.paymentToken) {
        const iframeId = process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID;
        if (!iframeId) {
          throw new Error('PAYMOB_IFRAME_ID is not configured');
        }
        const frameUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${result.paymentToken}`;
        setIframeUrl(frameUrl);
        setCurrentStep('payment-iframe');
      } else {
        throw new Error(result.error || 'فشل في إنشاء الدفع');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('فشل في معالجة الدفع');
      setCurrentStep('method-selection');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment-iframe') {
      setCurrentStep('method-selection');
      setSelectedMethod(null);
      setIframeUrl('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl flex flex-col w-full h-[600px] p-0 overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader className="max-h-16 px-4 py-2 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep === 'payment-iframe' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div>
                <DialogTitle className="text-base font-bold text-white flex items-center gap-2" dir="rtl">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  {currentStep === 'method-selection' && 'الدفع ببطاقة ائتمان'}
                  {currentStep === 'payment-iframe' && `الدفع بـ ${selectedMethod?.nameAr}`}
                  {currentStep === 'processing' && 'جاري المعالجة...'}
                </DialogTitle>
                <p className="text-xs text-slate-400" dir="rtl">
                  {planName} - {formatPrice(amount, selectedMethod?.currency || 'EGP')}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        {/* Header - Minimal and dark themed */}

        {/* Content - Takes remaining space */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Method Selection Screen */}
          {currentStep === 'method-selection' && (
            <div className="p-6 h-full overflow-y-auto animate-in fade-in-0 duration-300">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-center mb-8" dir="rtl">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 rounded-full mb-4">
                    <CreditCard className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    قوائم طعام رقمية و أكواد QR
                  </h3>
                  <p className="text-slate-400 text-sm">
                    حول مطعمك لتقوائم طعام رقمية بدون لمس. أنشئ وخصص وشارك قائمة طعامك فوراً باستخدام أكواد QR
                  </p>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <Card
                      key={method.id}
                      className={`cursor-pointer transition-all duration-300 border-2 ${method.bgColor} ${method.borderColor} hover:shadow-lg hover:shadow-emerald-500/10`}
                      onClick={() => handleMethodSelect(method)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-slate-700 ${method.color} shadow-lg`}>
                              {method.icon}
                            </div>
                            <div className="text-right" dir="rtl">
                              <h4 className="font-semibold text-white">
                                {method.nameAr}
                              </h4>
                              <p className="text-sm text-slate-400">
                                {method.name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right" dir="rtl">
                            <Badge variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              {method.currency}
                            </Badge>
                            <p className="text-lg font-bold text-emerald-400 mt-1">
                              {formatPrice(amount, method.currency)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20" dir="rtl">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-emerald-300">
                      <p className="font-medium mb-1">معاملة آمنة ومحمية</p>
                      <p className="text-emerald-400">
                        جميع بياناتك محمية بأعلى معايير الأمان والحماية
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors duration-200">
                    <Zap className="w-4 h-4" />
                    ابدأ تجربتك المجانية
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Processing Screen */}
          {currentStep === 'processing' && (
            <div className="h-full flex items-center justify-center animate-in fade-in-0 duration-300">
              <div className="text-center" dir="rtl">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full mb-6">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  جاري تحضير عملية الدفع...
                </h3>
                <p className="text-slate-400">
                  سيتم توجيهك لصفحة الدفع في لحظات
                </p>
              </div>
            </div>
          )}

          {/* Payment Iframe Screen */}
          {currentStep === 'payment-iframe' && iframeUrl && (
            <div className="h-full w-full animate-in fade-in-0 duration-500">
              <iframe
                src={iframeUrl}
                className="w-full h-full border-0 rounded-b-lg"
                title="Payment"
                allow="payment"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}