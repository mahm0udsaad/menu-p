'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPaymentGate({ restaurantId }: { restaurantId: string }) {
  const [hasPaidPlan, setHasPaidPlan] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const { data } = await supabase
          .from('restaurants')
          .select('available_menus')
          .eq('id', restaurantId)
          .single();
        
        setHasPaidPlan((data?.available_menus || 0) > 0);
      } catch (error) {
        console.error('Error checking payment status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [restaurantId]);

  if (loading) {
    return <div>Loading payment status...</div>;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Status Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${hasPaidPlan ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            Status: {hasPaidPlan ? '✅ Paid Plan Active' : '❌ No Paid Plan'}
          </div>
          
          <div className="space-y-2">
            <Button 
              disabled={!hasPaidPlan}
              className={`w-full ${!hasPaidPlan ? 'opacity-50' : ''}`}
            >
              {hasPaidPlan ? 'Publish Menu (Available)' : 'Publish Menu (Requires Payment) 👑'}
            </Button>
            
            <Button 
              disabled={!hasPaidPlan}
              variant="outline"
              className={`w-full ${!hasPaidPlan ? 'opacity-50' : ''}`}
            >
              {hasPaidPlan ? 'Preview PDF (Available)' : 'Preview PDF (Requires Payment) 👑'}
            </Button>
          </div>

          {!hasPaidPlan && (
            <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
              💡 To test payment flow: Click publish/preview buttons in the menu editor
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 