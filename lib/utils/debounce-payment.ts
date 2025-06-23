// Global debouncing for payment requests to prevent duplicates
const pendingPayments = new Map<string, Promise<any>>();

interface PaymentRequest {
  userId: string;
  restaurantId: string;
  amount: number;
  integrationId?: string;
}

export function debouncePaymentRequest<T>(
  key: string,
  paymentFn: () => Promise<T>,
  debounceMs: number = 2000
): Promise<T> {
  // Create a unique key for this payment request
  const requestKey = `${key}-${Date.now()}`;
  
  // Check if there's already a pending payment for this key
  const existingRequest = pendingPayments.get(key);
  
  if (existingRequest) {
    console.log('Duplicate payment request detected, returning existing promise');
    return existingRequest;
  }

  // Create new payment promise
  const paymentPromise = paymentFn().finally(() => {
    // Remove from pending after completion (success or failure)
    pendingPayments.delete(key);
  });

  // Store the promise
  pendingPayments.set(key, paymentPromise);

  // Set timeout to remove the key even if promise doesn't resolve
  setTimeout(() => {
    pendingPayments.delete(key);
  }, debounceMs);

  return paymentPromise;
}

export function generatePaymentKey(request: PaymentRequest): string {
  return `payment-${request.userId}-${request.restaurantId}-${request.amount}-${request.integrationId || 'default'}`;
}

export function clearPaymentCache(): void {
  pendingPayments.clear();
} 