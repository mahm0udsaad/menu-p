'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap } from 'lucide-react';
import { createPaymobPayment } from '@/lib/actions/payment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: 'default' | 'outline';
}

const plans: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9900, // 99 EGP in cents
    currency: 'EGP',
    period: 'one-time',
    description: 'Perfect for small restaurants and cafes',
    features: [
      '1 Menu Creation',
      'PDF Export',
      'QR Code Generation',
      'Basic Templates',
      'Email Support',
    ],
    buttonText: 'Get Started',
    buttonVariant: 'outline',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 19900, // 199 EGP in cents
    originalPrice: 29900,
    currency: 'EGP',
    period: 'one-time',
    description: 'Best for growing restaurants',
    features: [
      '3 Menu Creations',
      'PDF Export',
      'QR Code Generation',
      'Premium Templates',
      'Custom Branding',
      'Priority Support',
      'Advanced Analytics',
    ],
    popular: true,
    buttonText: 'Choose Pro',
    buttonVariant: 'default',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 39900, // 399 EGP in cents
    currency: 'EGP',
    period: 'one-time',
    description: 'For large restaurants and chains',
    features: [
      'Unlimited Menus',
      'PDF Export',
      'QR Code Generation',
      'All Templates',
      'Custom Branding',
      'White Label Solution',
      '24/7 Support',
      'API Access',
      'Multi-location Support',
    ],
    buttonText: 'Contact Sales',
    buttonVariant: 'outline',
  },
];

interface PricingPlansProps {
  restaurantId?: string;
  userEmail?: string;
  userName?: string;
}

export default function PricingPlans({ restaurantId, userEmail, userName }: PricingPlansProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const router = useRouter();

  const handlePlanSelect = (plan: PricingPlan) => {
    if (!restaurantId) {
      toast.error('Please create a restaurant first');
      router.push('/onboarding');
      return;
    }

    if (!userEmail || !userName) {
      toast.error('Please complete your profile');
      return;
    }

    setSelectedPlan(plan.id);

    startTransition(async () => {
      try {
        // Prepare billing data
        const billingData = {
          firstName: userName.split(' ')[0] || 'User',
          lastName: userName.split(' ').slice(1).join(' ') || 'Name',
          email: userEmail,
          phone: '+201000000000', // Default phone - user can update in profile
        };

        const result = await createPaymobPayment(plan.price, billingData, restaurantId);

        if (result.success && result.paymentToken) {
          // Redirect to Paymob checkout
          const iframeId = process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID;
          if (!iframeId) {
            throw new Error('PAYMOB_IFRAME_ID is not configured');
          }
          
          // Add redirect URL for payment status page
          const redirectUrl = `${window.location.origin}/payment-status?success={{success}}`;
          const frameUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${result.paymentToken}&callback_url=${encodeURIComponent(redirectUrl)}`;
          
          window.location.href = frameUrl;
        } else {
          toast.error(result.error || 'Failed to create payment');
        }
      } catch (error) {
        console.error('Payment error:', error);
        toast.error('Failed to process payment');
      } finally {
        setSelectedPlan(null);
      }
    });
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started with our professional menu creation tools. One-time payment, lifetime access.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 hover:shadow-lg ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1 rounded-full">
                    <Star className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {plan.description}
                </CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    {plan.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {plan.originalPrice / 100} {plan.currency}
                      </span>
                    )}
                    <span className="text-3xl font-bold">
                      {plan.price / 100}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.currency}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {plan.period}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.buttonVariant}
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isPending && selectedPlan === plan.id}
                >
                  {isPending && selectedPlan === plan.id ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            All plans include 30-day money-back guarantee. No hidden fees.
          </p>
        </div>
      </div>
    </section>
  );
}
