'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthToken, registerOrder, getPaymentKey } from '@/lib/paymob';
import { redirect } from 'next/navigation';
import { sendPaymentNotificationEmail } from '@/lib/email/service';

interface BillingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  apartment?: string;
  floor?: string;
  street?: string;
  building?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export async function createPaymobPayment(
  amount: number, 
  billing: BillingData,
  restaurantId: string,
  integrationId?: string
) {
  try {
    // Validate inputs
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }
    
    if (!restaurantId) {
      throw new Error('Restaurant ID is required');
    }

    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get auth token from Paymob
    const token = await getAuthToken();
    
    // Register order with Paymob (with metadata for webhook)
    const orderId = await registerOrder(token, amount, {
      user_id: user.id,
      restaurant_id: restaurantId,
      integration_id: integrationId
    });
    
    // Get payment key with specified integration ID
    const paymentToken = await getPaymentKey(token, orderId, amount, billing, integrationId);

    // Don't save to database here - webhook will create the record on success
    return { 
      success: true, 
      paymentToken,
      orderId,
      metadata: {
        user_id: user.id,
        restaurant_id: restaurantId,
        amount: amount,
        integration_id: integrationId
    }
    };
  } catch (error) {
    console.error('Payment creation error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Payment creation failed' 
    };
  }
}

export async function checkPaymentStatus(orderId: number) {
  try {
    const supabase = createClient();
    
    const { data: payment, error } = await supabase
      .from('payments')
      .select('status, amount')
      .eq('order_id', orderId)
      .single();

    if (error) {
      throw new Error('Payment not found');
    }

    return { success: true, payment };
  } catch (error) {
    console.error('Error checking payment status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to check payment status' 
    };
  }
}

export async function getUserPayments() {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch payments');
    }

    return { success: true, payments };
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch payments' 
    };
  }
}

export async function updatePaymentStatusAndNotify(
  orderId: string,
  status: 'success' | 'failed' | 'pending',
  userEmail?: string
) {
  try {
    const supabase = createClient();
    
    // Update payment status
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select(`
        *,
        restaurants (
          name,
          user_id,
          users (
            email
          )
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      throw new Error('Failed to update payment status');
    }

    // Get user email if not provided
    const emailToSend = userEmail || payment.restaurants?.users?.email;
    
    if (emailToSend) {
      // Send payment notification email
      const userName = emailToSend.split('@')[0] || 'عميلنا العزيز';
      
      try {
        await sendPaymentNotificationEmail({
          userName,
          userEmail: emailToSend,
          orderId: orderId,
          amount: payment.amount,
          status: status,
          restaurantName: payment.restaurants?.name,
          transactionDate: new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
        
        console.log(`Payment notification email sent to ${emailToSend} for order ${orderId}`);
      } catch (emailError) {
        console.error('Failed to send payment notification email:', emailError);
        // Don't fail the payment update if email fails
      }
    }

    return { success: true, payment };
  } catch (error) {
    console.error('Error updating payment status and sending notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update payment status' 
    };
  }
} 