export async function getAuthToken(): Promise<string> {
  const res = await fetch('https://accept.paymob.com/api/auth/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.PAYMOB_API_KEY
    })
  });

  if (!res.ok) {
    throw new Error('Failed to get auth token from Paymob');
  }

  const data = await res.json();
  return data.token;
}

export async function registerOrder(token: string, amount: number, metadata?: any): Promise<number> {
  // Validate inputs
  if (!token) {
    throw new Error('Auth token is required');
  }
  
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  const res = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: amount,
      currency: 'EGP',
      merchant_order_id: metadata ? JSON.stringify(metadata) : undefined,
      items: [{
        name: 'Menu Subscription',
        amount_cents: amount,
        description: 'One-time payment for menu access',
        quantity: 1
      }]
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to register order with Paymob: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  
  if (!data.id || isNaN(data.id)) {
    throw new Error(`Invalid order ID received: ${data.id}`);
  }
  
  return data.id;
}

export async function getPaymentKey(
  token: string,
  orderId: number,
  amount: number,
  billing: any,
  integrationId?: string
): Promise<string> {
  // Use provided integration ID or fallback to environment variable
  const finalIntegrationId = integrationId || process.env.PAYMOB_INTEGRATION_ID;
  
  // Validate integration ID
  if (!finalIntegrationId || finalIntegrationId === 'undefined') {
    throw new Error('Integration ID is required but not provided');
  }
  
  // Convert to number and validate
  const integrationIdNumber = parseInt(finalIntegrationId, 10);
  if (isNaN(integrationIdNumber)) {
    throw new Error(`Invalid integration ID: ${finalIntegrationId}`);
  }
  
  const res = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      amount_cents: amount,
      expiration: 3600,
      order_id: orderId,
      billing_data: {
        apartment: billing.apartment || 'N/A',
        email: billing.email,
        floor: billing.floor || 'N/A',
        first_name: billing.firstName,
        street: billing.street || 'N/A',
        building: billing.building || 'N/A',
        phone_number: billing.phone,
        shipping_method: 'N/A',
        postal_code: billing.postalCode || 'N/A',
        city: billing.city || 'N/A',
        country: billing.country || 'EG',
        last_name: billing.lastName,
        state: billing.state || 'N/A'
      },
      currency: 'EGP',
      integration_id: integrationIdNumber
    })
  });

  if (!res.ok) {
    throw new Error('Failed to get payment key from Paymob');
  }

  const data = await res.json();
  return data.token;
} 