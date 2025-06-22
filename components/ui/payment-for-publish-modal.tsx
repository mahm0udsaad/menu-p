'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CreditCard, Wallet, X, ArrowLeft, FileText, Zap, Crown } from 'lucide-react';
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
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200 hover:border-blue-300'
  },
  {
    id: 'wallet',
    name: 'Mobile Wallet',
    nameAr: 'محفظة موبايل',
    icon: <Wallet className="w-6 h-6" />,
    currency: 'EGP',
    integrationId: '5148466',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    borderColor: 'border-green-200 hover:border-green-300'
  }
];

interface PaymentForPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  userEmail: string;
  userName: string;
  currentPath: string;
}

type ModalStep = 'method-selection' | 'payment-iframe' | 'processing';

export default function PaymentForPublishModal({
  isOpen,
  onClose,
  restaurantId,
  userEmail,
  userName,
  currentPath
}: PaymentForPublishModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('method-selection');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const amount = 8000; // $80 in cents

  useEffect(() => {
    if (isOpen) {
      setCurrentStep('method-selection');
      setSelectedMethod(null);
      setIframeUrl('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  const formatPrice = (amountInCents: number, currency: string) => {
    const displayAmount = amountInCents / 100;
    
    if (currency === 'USD') {
      return `$${displayAmount.toFixed(2)}`;
    }
    return `${displayAmount.toFixed(0)} جنيه`;
  };

  const handleMethodSelect = async (method: PaymentMethod) => {
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

      const result = await createPaymobPayment(
        amount, 
        billingData, 
        restaurantId,
        method.integrationId
      );
      
      if (result.success && result.paymentToken) {
        const iframeId = process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID;
        if (!iframeId) {
          throw new Error('PAYMOB_IFRAME_ID is not configured');
        }
        
        // Add current path and auto-publish parameter for redirect after payment
        const redirectUrl = `${window.location.origin}/payment-status?success={{success}}&redirect=${encodeURIComponent(currentPath)}&auto_publish=true`;
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
                  <Crown className="w-4 h-4 text-yellow-400" />
                  {currentStep === 'method-selection' && 'اشترك للنشر'}
                  {currentStep === 'payment-iframe' && `الدفع بـ ${selectedMethod?.nameAr}`}
                  {currentStep === 'processing' && 'جاري المعالجة...'}
                </DialogTitle>
                <p className="text-xs text-slate-400" dir="rtl">
                  اشترك الآن ونشر قائمتك فوراً
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

        <div className="flex-1 flex flex-col min-h-0">
          {currentStep === 'method-selection' && (
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="max-w-lg mx-auto space-y-6">
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-8 h-8 text-yellow-400" />
                    <div>
                      <h3 className="text-xl font-bold text-white">خطة البريميم</h3>
                      <p className="text-yellow-200/80">مرة واحدة فقط - 80 دولار</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-white">
                      <FileText className="w-5 h-5 text-green-400" />
                      <span>نشر قوائم PDF احترافية</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <Zap className="w-5 h-5 text-blue-400" />
                      <span>إنشاء أكواد QR</span>
                    </div>
                    <div className="flex items-center gap-3 text-white">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span>جميع القوالب المتقدمة</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-white text-center">اختر طريقة الدفع</h4>
                  
                  {paymentMethods.map((method) => (
                    <Card 
                      key={method.id}
                      className={`cursor-pointer transition-all duration-200 border-2 ${method.bgColor} ${method.borderColor} hover:scale-[1.02] hover:shadow-lg bg-slate-800/50`}
                      onClick={() => handleMethodSelect(method)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${method.bgColor} ${method.color}`}>
                              {method.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{method.nameAr}</h3>
                              <p className="text-sm text-slate-400">{method.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">
                              {formatPrice(amount, method.currency)}
                            </p>
                            <p className="text-xs text-slate-400">{method.currency}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
                  <p className="text-sm text-slate-300 text-center" dir="rtl">
                    💡 بعد الدفع سيتم نشر قائمتك فوراً وتوجيهك للقائمة المنشورة
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto" />
                <h3 className="text-xl font-semibold text-white">جاري إعداد الدفع...</h3>
                <p className="text-slate-400">يرجى الانتظار لحظات</p>
              </div>
            </div>
          )}

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