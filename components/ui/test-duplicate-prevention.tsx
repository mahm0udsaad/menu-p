'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { debouncePaymentRequest, generatePaymentKey, clearPaymentCache } from '@/lib/utils/debounce-payment';
import { Loader2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function TestDuplicatePrevention() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const simulatePayment = (delay: number = 1000): Promise<{ success: boolean; id: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, id: Math.random().toString(36).substring(7) });
      }, delay);
    });
  };

  const testSingleRequest = async () => {
    setIsLoading(true);
    addResult('🔄 Testing single payment request...');
    
    try {
      const paymentKey = generatePaymentKey({
        userId: 'test-user-123',
        restaurantId: 'test-restaurant-456',
        amount: 8000,
        integrationId: 'test-integration'
      });

      const result = await debouncePaymentRequest(
        paymentKey,
        () => simulatePayment(1000),
        2000
      );

      addResult(`✅ Single request completed: ${result.id}`);
    } catch (error) {
      addResult(`❌ Single request failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDuplicateRequests = async () => {
    setIsLoading(true);
    addResult('🔄 Testing duplicate prevention (3 rapid requests)...');
    
    try {
      const paymentKey = generatePaymentKey({
        userId: 'test-user-123',
        restaurantId: 'test-restaurant-456',
        amount: 8000,
        integrationId: 'test-integration'
      });

      // Fire 3 requests rapidly
      const promises = [
        debouncePaymentRequest(paymentKey, () => simulatePayment(1500), 3000),
        debouncePaymentRequest(paymentKey, () => simulatePayment(1500), 3000),
        debouncePaymentRequest(paymentKey, () => simulatePayment(1500), 3000)
      ];

      const results = await Promise.all(promises);
      
      // All should return the same result
      const allSame = results.every(r => r.id === results[0].id);
      
      if (allSame) {
        addResult(`✅ Duplicate prevention working! All requests returned: ${results[0].id}`);
      } else {
        addResult(`❌ Duplicate prevention failed! Got different results: ${results.map(r => r.id).join(', ')}`);
      }
    } catch (error) {
      addResult(`❌ Duplicate test failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    clearPaymentCache();
    addResult('🧹 Cache cleared and results reset');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛡️ Duplicate Prevention Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={testSingleRequest} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Test Single Request
              </>
            )}
          </Button>

          <Button 
            onClick={testDuplicateRequests} 
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Test Duplicate Prevention
              </>
            )}
          </Button>

          <Button 
            onClick={clearResults} 
            disabled={isLoading}
            className="w-full"
            variant="ghost"
            size="sm"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Results
          </Button>
        </div>

        <div className="border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
          <div className="text-xs font-mono space-y-1">
            {results.length === 0 ? (
              <div className="text-gray-500">No test results yet...</div>
            ) : (
              results.map((result, i) => (
                <div key={i} className="text-xs">{result}</div>
              ))
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          This component tests the global payment debouncing system to ensure duplicate requests are properly handled.
        </div>
      </CardContent>
    </Card>
  );
} 