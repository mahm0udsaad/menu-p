'use client';

import { usePaymentStatus } from '@/lib/hooks/use-payment-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Crown, CheckCircle, XCircle } from 'lucide-react';

export default function TestPaymentStatus() {
  const { hasPaidPlan, loading, error, refetch } = usePaymentStatus();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Payment Status Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Checking...</span>
            </div>
          ) : error ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Error
            </Badge>
          ) : hasPaidPlan ? (
            <Badge variant="default" className="bg-green-500 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Paid Plan
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Free Plan
            </Badge>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            This component uses the optimized payment status hook that:
          </div>
          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
            <li>• Caches results for 5 minutes</li>
            <li>• Checks payments table directly</li>
            <li>• Listens for real-time updates</li>
            <li>• Eliminates auth flashing</li>
          </ul>
        </div>

        <Button 
          onClick={refetch} 
          disabled={loading}
          size="sm" 
          variant="outline" 
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            'Refresh Status'
          )}
        </Button>
      </CardContent>
    </Card>
  );
} 