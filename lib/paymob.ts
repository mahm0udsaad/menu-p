export async function getAuthToken(): Promise<string> {
  console.log('🔑 [PAYMOB] Starting getAuthToken process...');
  console.log('🔑 [PAYMOB] API Key exists:', !!process.env.PAYMOB_API_KEY);
  console.log('🔑 [PAYMOB] API Key length:', process.env.PAYMOB_API_KEY?.length || 0);
  
  const requestPayload = {
    api_key: process.env.PAYMOB_API_KEY
  };
  
  console.log('🔑 [PAYMOB] Making auth token request to Paymob...');
  
  try {
    const res = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    console.log('🔑 [PAYMOB] Auth token response status:', res.status);
    console.log('🔑 [PAYMOB] Auth token response ok:', res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('🔑 [PAYMOB] Auth token request failed:', {
        status: res.status,
        statusText: res.statusText,
        response: errorText
      });
      throw new Error(`Failed to get auth token from Paymob: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    console.log('🔑 [PAYMOB] Auth token received successfully');
    console.log('🔑 [PAYMOB] Token length:', data.token?.length || 0);
    
    return data.token;
  } catch (error) {
    console.error('🔑 [PAYMOB] Auth token error:', error);
    throw error;
  }
}

// Generate unique merchant order ID to prevent duplicates
function generateUniqueMerchantOrderId(metadata?: any): string {
  console.log('🆔 [PAYMOB] Generating unique merchant order ID...');
  console.log('🆔 [PAYMOB] Metadata provided:', !!metadata);
  
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 12); // Longer random suffix
  const uniqueId = `${timestamp}-${randomSuffix}`;
  
  if (metadata) {
    console.log('🆔 [PAYMOB] Extracting metadata:', {
      user_id: metadata.user_id,
      restaurant_id: metadata.restaurant_id
    });
    
    // Create a shorter, cleaner unique ID that includes essential metadata
    const userId = metadata.user_id ? metadata.user_id.toString().substring(0, 8) : 'u';
    const restaurantId = metadata.restaurant_id ? metadata.restaurant_id.toString().substring(0, 8) : 'r';
    
    const merchantOrderId = `${userId}-${restaurantId}-${uniqueId}`;
    console.log('🆔 [PAYMOB] Generated merchant order ID with metadata:', merchantOrderId);
    return merchantOrderId;
  }
  
  const merchantOrderId = `order-${uniqueId}`;
  console.log('🆔 [PAYMOB] Generated merchant order ID without metadata:', merchantOrderId);
  return merchantOrderId;
}

export async function registerOrder(token: string, amount: number, metadata?: any): Promise<number> {
  console.log('📝 [PAYMOB] Starting registerOrder process...');
  console.log('📝 [PAYMOB] Input parameters:', {
    token_length: token?.length || 0,
    amount: amount,
    metadata: metadata,
    timestamp: new Date().toISOString()
  });
  
  // Validate inputs
  if (!token) {
    console.error('📝 [PAYMOB] ERROR: Auth token is required');
    throw new Error('Auth token is required');
  }
  
  if (!amount || isNaN(amount) || amount <= 0) {
    console.error('📝 [PAYMOB] ERROR: Invalid amount:', amount);
    throw new Error(`Invalid amount: ${amount}`);
  }

  console.log('📝 [PAYMOB] Input validation passed');
  
  let lastError: Error | null = null;
  const maxRetries = 3;
  
  console.log('📝 [PAYMOB] Starting retry loop with max retries:', maxRetries);
  
  // Retry logic with exponential backoff for transient errors
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    // Generate NEW unique merchant order ID for each attempt
    const uniqueMerchantOrderId = generateUniqueMerchantOrderId(metadata);
    
    console.log('Registering order with Paymob:', {
      amount_cents: amount,
      merchant_order_id: uniqueMerchantOrderId,
      attempt: attempt,
      timestamp: new Date().toISOString()
    });

    const orderPayload = {
      auth_token: token,
      delivery_needed: false,
      amount_cents: amount,
      currency: 'EGP',
      merchant_order_id: uniqueMerchantOrderId,
      items: [{
        name: 'Menu Subscription',
        amount_cents: amount,
        description: 'One-time payment for menu access',
        quantity: 1
      }],
      // Add metadata to the order payload if provided
      ...(metadata && { 
        extras: {
          user_id: metadata.user_id,
          restaurant_id: metadata.restaurant_id,
          created_at: new Date().toISOString(),
          ...metadata
        }
      })
    };

    try {
      const res = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Menu-P-App/1.0'
        },
        body: JSON.stringify(orderPayload)
      });

      const responseText = await res.text();
      
      if (!res.ok) {
        console.error(`Paymob order registration failed (attempt ${attempt}/${maxRetries}):`, {
          status: res.status,
          statusText: res.statusText,
          response: responseText,
          merchant_order_id: uniqueMerchantOrderId
        });

        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { message: responseText };
        }

        // Handle specific error cases
        if (res.status === 422) {
          if (errorData.message === 'duplicate') {
            // Log the duplicate error with more context
            console.error(`Duplicate order error on attempt ${attempt}:`, {
              merchant_order_id: uniqueMerchantOrderId,
              metadata: metadata,
              timestamp: new Date().toISOString()
            });
            
            // If duplicate on last attempt, throw error
            if (attempt === maxRetries) {
              throw new Error('Duplicate order detected after multiple attempts. Please try again later.');
            }
            
            // Continue to next attempt with new merchant order ID
            const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 1000; // Add jitter
            console.log(`Retrying in ${delay}ms due to duplicate error...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Other 422 errors - don't retry
          throw new Error(`Payment validation failed: ${errorData.message || 'Invalid payment data'}`);
        }
        
        // For 5xx errors or network issues, retry with exponential backoff
        if (res.status >= 500 || !res.status) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`Retrying in ${delay}ms due to server error...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          lastError = new Error(`Server error: ${res.status} ${errorData.message || responseText}`);
          continue;
        }
        
        // For other errors, don't retry
        throw new Error(`Failed to register order: ${res.status} ${errorData.message || responseText}`);
      }

      // Success - parse response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Paymob response:', responseText);
        throw new Error('Invalid response format from payment provider');
      }
      
      if (!data.id || isNaN(data.id)) {
        console.error('Invalid order response from Paymob:', data);
        throw new Error(`Invalid order ID received: ${data.id}`);
      }
      
      console.log('Order registered successfully:', {
        order_id: data.id,
        merchant_order_id: uniqueMerchantOrderId,
        attempt: attempt
      });
      
      return data.id;
      
    } catch (error) {
      console.error(`Order registration attempt ${attempt} failed:`, error);
      lastError = error as Error;
      
      // If it's not a retryable error, throw immediately
      if (error instanceof Error && (
        error.message.includes('validation failed') ||
        error.message.includes('Invalid payment data')
      )) {
        throw error;
      }
      
      // If last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retry (with jitter to avoid thundering herd)
      const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error('Failed to register order after multiple attempts');
}

export async function getPaymentKey(
  token: string,
  orderId: number,
  amount: number,
  billing: any,
  integrationId?: string
): Promise<string> {
  console.log('🔑 [PAYMOB] Starting getPaymentKey process...');
  console.log('🔑 [PAYMOB] Input parameters:', {
    token_length: token?.length || 0,
    orderId,
    amount,
    integrationId,
    billing: {
      ...billing,
      email: billing?.email ? billing.email.substring(0, 10) + '...' : 'N/A',
      phone: billing?.phone ? billing.phone.substring(0, 8) + '...' : 'N/A'
    }
  });

  // Use provided integration ID or fallback to environment variable
  const finalIntegrationId = integrationId || process.env.PAYMOB_INTEGRATION_ID;
  console.log('🔑 [PAYMOB] Final integration ID:', finalIntegrationId);
  
  // Validate integration ID
  if (!finalIntegrationId || finalIntegrationId === 'undefined') {
    console.error('🔑 [PAYMOB] ERROR: Integration ID is required but not provided');
    throw new Error('Integration ID is required but not provided');
  }
  
  // Convert to number and validate
  const integrationIdNumber = parseInt(finalIntegrationId, 10);
  if (isNaN(integrationIdNumber)) {
    console.error('🔑 [PAYMOB] ERROR: Invalid integration ID:', finalIntegrationId);
    throw new Error(`Invalid integration ID: ${finalIntegrationId}`);
  }

  console.log('🔑 [PAYMOB] Integration ID validated:', integrationIdNumber);

  const paymentKeyPayload = {
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
  };

  console.log('🔑 [PAYMOB] Making payment key request to Paymob...');
  
  try {
    const res = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentKeyPayload)
    });

    console.log('🔑 [PAYMOB] Payment key response status:', res.status);
    console.log('🔑 [PAYMOB] Payment key response ok:', res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('🔑 [PAYMOB] Payment key request failed:', {
        status: res.status,
        statusText: res.statusText,
        response: errorText
      });
      throw new Error(`Failed to get payment key from Paymob: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    console.log('🔑 [PAYMOB] Payment key received successfully');
    console.log('🔑 [PAYMOB] Payment key length:', data.token?.length || 0);
    
    return data.token;
  } catch (error) {
    console.error('🔑 [PAYMOB] Payment key error:', error);
    throw error;
  }
}

// Alternative: Consider using the Intention API for better reliability
export async function createPaymentIntention(
  amount: number,
  billingData: any,
  metadata?: any,
  integrationId?: string
): Promise<{ clientSecret: string; intentionId: string }> {
  const finalIntegrationId = integrationId || process.env.PAYMOB_INTEGRATION_ID;
  
  if (!finalIntegrationId) {
    throw new Error('Integration ID is required');
  }

  const intentionPayload = {
    amount: amount,
    currency: 'EGP',
    payment_methods: [parseInt(finalIntegrationId, 10)],
    items: [{
      name: 'Menu Subscription',
      amount: amount,
      description: 'One-time payment for menu access',
      quantity: 1
    }],
    billing_data: {
      apartment: billingData.apartment || 'N/A',
      first_name: billingData.firstName,
      last_name: billingData.lastName,
      street: billingData.street || 'N/A',
      building: billingData.building || 'N/A',
      phone_number: billingData.phone,
      city: billingData.city || 'N/A',
      country: billingData.country || 'EG',
      email: billingData.email,
      floor: billingData.floor || 'N/A',
      state: billingData.state || 'N/A'
    },
    extras: metadata || {},
    special_reference: generateUniqueMerchantOrderId(metadata),
    expiration: 3600,
    ...(process.env.PAYMOB_NOTIFICATION_URL && { notification_url: process.env.PAYMOB_NOTIFICATION_URL }),
    ...(process.env.PAYMOB_REDIRECT_URL && { redirection_url: process.env.PAYMOB_REDIRECT_URL })
  };

  const res = await fetch('https://accept.paymob.com/v1/intention/', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Token ${process.env.PAYMOB_SECRET_KEY}`
    },
    body: JSON.stringify(intentionPayload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create payment intention: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return {
    clientSecret: data.client_secret,
    intentionId: data.id
  };
}