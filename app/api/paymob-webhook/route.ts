import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPaymentNotificationEmail } from '@/lib/email/service';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Paymob webhook received:', body);

    const success = body.obj?.success;
    const orderId = body.obj?.order?.id;
    const transactionId = body.obj?.id;
    const order = body.obj?.order;

    if (!orderId) {
      console.error('Missing order ID in webhook');
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    // Only process successful payments
    if (!success) {
      console.log(`Payment failed for order ${orderId}`);
      return NextResponse.json({ status: 'ok' });
    }

    // Extract metadata from merchant_order_id (if available)
    let metadata = null;
    try {
      if (order?.merchant_order_id) {
        metadata = JSON.parse(order.merchant_order_id);
      }
    } catch (error) {
      console.error('Error parsing order metadata:', error);
    }

    // If no metadata, we can't create the payment record
    if (!metadata || !metadata.user_id || !metadata.restaurant_id) {
      console.error('Missing required metadata in order:', metadata);
      return NextResponse.json({ error: 'Missing order metadata' }, { status: 400 });
    }

    // Create payment record for successful payment
    const { data: createdPayment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: metadata.user_id,
        restaurant_id: metadata.restaurant_id,
        order_id: orderId,
        amount: order?.amount_cents || 0,
        status: 'paid',
        paymob_transaction_id: transactionId,
        integration_id: metadata.integration_id,
        payment_token: body.obj?.token || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        restaurants (
          name
        )
      `)
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    console.log(`Payment record created for order ${orderId}`);

    // Get user email for notification
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(createdPayment.user_id);
    
    if (!userError && userData.user?.email) {
      // Send payment notification email
      try {
        const userName = userData.user.email.split('@')[0] || 'عميلنا العزيز';
        
        await sendPaymentNotificationEmail({
          userName,
          userEmail: userData.user.email,
          orderId: orderId.toString(),
          amount: createdPayment.amount,
          status: 'success',
          restaurantName: createdPayment.restaurants?.name,
          transactionDate: new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
        
        console.log(`Payment notification email sent to ${userData.user.email} for order ${orderId}`);
      } catch (emailError) {
        console.error('Failed to send payment notification email:', emailError);
        // Don't fail the webhook if email fails
      }
    }

    // Update restaurant's available menus to 1
    const { error: restaurantError } = await supabase
      .from('restaurants')
      .update({ 
        available_menus: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', createdPayment.restaurant_id)
      .eq('user_id', createdPayment.user_id);

    if (restaurantError) {
      console.error('Error updating restaurant:', restaurantError);
      return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 