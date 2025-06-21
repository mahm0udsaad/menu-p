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

export async function registerOrder(token: string, amount: number): Promise<number> {
  const res = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: amount,
      currency: 'EGP',
      items: [{
        name: 'Menu Subscription',
        amount_cents: amount,
        description: 'One-time payment for menu access',
        quantity: 1
      }]
    })
  });

  if (!res.ok) {
    throw new Error('Failed to register order with Paymob');
  }

  const data = await res.json();
  return data.id;
}

export async function getPaymentKey(
  token: string,
  orderId: number,
  amount: number,
  billing: any
): Promise<string> {
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
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID)
    })
  });

  if (!res.ok) {
    throw new Error('Failed to get payment key from Paymob');
  }

  const data = await res.json();
  return data.token;
} 