'use client';

import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentStatusSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
} 