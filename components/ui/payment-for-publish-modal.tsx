'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Wallet, X, ArrowLeft, FileText, Zap, Crown, Check, Star } from 'lucide-react';
import { createPaymobPayment } from '@/lib/actions/payment';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { debouncePaymentRequest, generatePaymentKey } from '@/lib/utils/debounce-payment';

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

interface PricingPlan {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number; // in cents
  currency: string;
  features: string[];
  featuresAr: string[];
  maxMenus: number;
  isPopular?: boolean;
  badge?: string;
  badgeAr?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    nameAr: 'الخطة الأساسية',
    description: 'Perfect for small cafes and restaurants',
    descriptionAr: 'مثالية للمقاهي والمطاعم الصغيرة',
    price: 20000, // 200 EGP
    currency: 'EGP',
    maxMenus: 1,
    features: [
      '1 Menu Publication',
      'PDF Generation',
      'QR Code Generation',
      'Basic Templates',
      'Email Support'
    ],
    featuresAr: [
      'نشر قائمة واحدة',
      'إنشاء ملف PDF',
      'إنشاء رمز QR',
      'قوالب أساسية',
      'دعم عبر البريد الإلكتروني'
    ]
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    nameAr: 'الخطة الاحترافية',
    description: 'Best for growing restaurants and chains',
    descriptionAr: 'الأفضل للمطاعم النامية والسلاسل',
    price: 50000, // 500 EGP
    currency: 'EGP',
    maxMenus: 5,
    isPopular: true,
    badge: 'Most Popular',
    badgeAr: 'الأكثر شهرة',
    features: [
      '5 Menu Publications',
      'Multi-language Support',
      'AI Translation',
      'Premium Templates',
      'Advanced Analytics',
      'Priority Support',
      'Custom Branding'
    ],
    featuresAr: [
      'نشر 5 قوائم',
      'دعم متعدد اللغات',
      'ترجمة بالذكاء الاصطناعي',
      'قوالب متميزة',
      'تحليلات متقدمة',
      'دعم أولوي',
      'علامة تجارية مخصصة'
    ]
  }
];

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit Card',
    nameAr: 'بطاقة ائتمان',
    icon: <CreditCard className="w-6 h-6" />,
    currency: 'EGP',
    integrationId: '4856925',
    color: 'text-red-600',
    bgColor: 'bg-red-50 hover:bg-red-100',
    borderColor: 'border-red-200 hover:border-red-300'
  },
  {
    id: 'wallet',
    name: 'Mobile Wallet',
    nameAr: 'محفظة موبايل',
    icon: <Wallet className="w-6 h-6" />,
    currency: 'EGP',
    integrationId: '5148466',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 hover:bg-rose-100',
    borderColor: 'border-rose-200 hover:border-rose-300'
  }
];

interface PaymentForPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  currentPath: string;
  currentTab?: string;
  returnStep?: string;
}

type ModalStep = 'plan-selection' | 'method-selection' | 'payment-iframe' | 'processing';

export default function PaymentForPublishModal({
  isOpen,
  onClose,
  restaurantId,
  currentPath,
  currentTab,
  returnStep
}: PaymentForPublishModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('plan-selection');
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  // Get user details when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('plan-selection');
      setSelectedPlan(null);
      setSelectedMethod(null);
      setIframeUrl('');
      setIsProcessing(false);
      
      // Get user details
      const getUserDetails = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || '');
          setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
        }
      };
      
      getUserDetails();
    }
  }, [isOpen]);

  const formatPrice = (amountInCents: number, currency: string) => {
    const displayAmount = amountInCents / 100;
    
    if (currency === 'USD') {
      return `$${displayAmount.toFixed(2)}`;
    }
    return `${displayAmount.toFixed(0)} جنيه`;
  };

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('method-selection');
  };

  const handleMethodSelect = async (method: PaymentMethod) => {
    if (!selectedPlan) return;
    
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

      console.log('Creating payment with Paymob...', {
        amount: selectedPlan.price,
        method: method.id,
        restaurant: restaurantId,
        user: userEmail
      });

      // Get current user for debouncing key
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Save complete current state to localStorage for post-payment redirect
      const currentUrl = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/menu-editor');
      
      console.log('💾 Saving comprehensive return state for post-payment redirect:', {
        url: currentUrl,
        tab: currentTab,
        step: returnStep,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem('paymentReturnUrl', currentUrl);
      if (currentTab) localStorage.setItem('paymentReturnTab', currentTab);
      if (returnStep) localStorage.setItem('paymentReturnStep', returnStep);
      localStorage.setItem('paymentReturnTimestamp', new Date().toISOString());

      // Generate unique debouncing key
      const paymentKey = generatePaymentKey({
        userId: user.id,
        restaurantId,
        amount: selectedPlan.price,
        integrationId: method.integrationId
      });

      // Use debounced payment request
      const result = await debouncePaymentRequest(
        paymentKey,
        () => createPaymobPayment(
          selectedPlan.price, 
          billingData, 
          restaurantId,
          method.integrationId
        ),
        3000 // 3 second debounce
      );
      
      if (result.success && result.paymentToken) {
        const iframeId = process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID;
        if (!iframeId) {
          throw new Error('PAYMOB_IFRAME_ID is not configured');
        }
        
        console.log('Payment created successfully, loading iframe...');
        
        // Add current path and auto-publish parameter for redirect after payment
        const redirectUrl = `${window.location.origin}/payment-status?success={{success}}&redirect=${encodeURIComponent(currentPath)}&auto_publish=true`;
        const frameUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${result.paymentToken}&callback_url=${encodeURIComponent(redirectUrl)}&notification_url=${encodeURIComponent(`${window.location.origin}/api/paymob-webhook`)}`;
        
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
    } else if (currentStep === 'method-selection') {
      setCurrentStep('plan-selection');
      setSelectedPlan(null);
      setSelectedMethod(null);
    }
  };

  const renderPlanSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">اختر خطتك</h3>
        <p className="text-gray-600">ابدأ بنشر قوائمك الاحترافية اليوم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
              plan.isPopular
                ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50'
                : 'border-red-200 hover:border-red-300 bg-white'
            }`}
            onClick={() => handlePlanSelect(plan)}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-red-500 text-white px-4 py-1 rounded-full">
                  <Star className="w-3 h-3 mr-1" />
                  {plan.badgeAr}
                </Badge>
              </div>
            )}
            
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  plan.isPopular ? 'bg-red-500' : 'bg-red-100'
                }`}>
                  {plan.isPopular ? (
                    <Crown className="w-8 h-8 text-white" />
                  ) : (
                    <FileText className="w-8 h-8 text-red-600" />
                  )}
                </div>
                
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{plan.nameAr}</h4>
                  <p className="text-gray-600 text-sm mt-1">{plan.descriptionAr}</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(plan.price, plan.currency)}
                  </div>
                  <div className="text-sm text-gray-500">لمرة واحدة</div>
                </div>
                
                <div className="space-y-2 text-right">
                  {plan.featuresAr.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button
                  className={`w-full ${
                    plan.isPopular
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-white border-2 border-red-500 text-red-600 hover:bg-red-50'
                  }`}
                >
                  {plan.isPopular ? 'اختر الخطة الاحترافية' : 'اختر الخطة الأساسية'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
              </div>
            </div>
  );

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
            <Button
              variant="ghost"
          onClick={handleBack}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة
            </Button>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            selectedPlan?.isPopular ? 'bg-red-500' : 'bg-red-100'
          }`}>
            {selectedPlan?.isPopular ? (
              <Crown className="w-6 h-6 text-white" />
            ) : (
              <FileText className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-gray-900">{selectedPlan?.nameAr}</h3>
            <p className="text-2xl font-bold text-red-600">
              {selectedPlan && formatPrice(selectedPlan.price, selectedPlan.currency)}
            </p>
                    </div>
                  </div>
                  
        <h4 className="text-lg font-semibold text-gray-900 mb-2">اختر طريقة الدفع</h4>
        <p className="text-gray-600">أدفع بأمان عبر البوابة المشفرة</p>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <Card 
                      key={method.id}
            className={`cursor-pointer transition-all duration-200 ${method.borderColor} ${method.bgColor} hover:shadow-md`}
            onClick={() => handleMethodSelect(method)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                  <div className={`${method.color}`}>
                    {method.icon}
                          </div>
                          <div className="text-right">
                    <h5 className="font-semibold text-gray-900">{method.nameAr}</h5>
                    <p className="text-sm text-gray-600">{method.name}</p>
                          </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
    </div>
  );

  const renderProcessing = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                </div>
              </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">جاري إعداد الدفع...</h3>
        <p className="text-gray-600">يرجى الانتظار بينما نقوم بتحضير عملية الدفع الآمنة</p>
              </div>
            </div>
  );

  const renderPaymentIframe = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة
        </Button>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {selectedPlan?.nameAr} - {selectedPlan && formatPrice(selectedPlan.price, selectedPlan.currency)}
          </p>
              </div>
            </div>

      <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
              <iframe
                src={iframeUrl}
          width="100%"
          height="600"
          frameBorder="0"
          className="w-full"
          title="Payment Gateway"
              />
            </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-gradient-to-br from-rose-50 via-white to-red-50 border-red-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900 flex items-center justify-center gap-2">
            <Crown className="w-6 h-6 text-red-600" />
            ترقية خطتك
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {currentStep === 'plan-selection' && renderPlanSelection()}
          {currentStep === 'method-selection' && renderMethodSelection()}
          {currentStep === 'processing' && renderProcessing()}
          {currentStep === 'payment-iframe' && renderPaymentIframe()}
        </div>
      </DialogContent>
    </Dialog>
  );
} 