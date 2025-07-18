import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendPaymentNotificationEmail } from '@/lib/email/service';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    
    const body = await req.json();
    console.log('🔔 [WEBHOOK] Paymob webhook received:', JSON.stringify(body, null, 2));
    console.log('🔔 [WEBHOOK] Request headers:', JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));

    const success = body.obj?.success;
    const orderId = body.obj?.order?.id;
    const transactionId = body.obj?.id;
    const order = body.obj?.order;

    console.log('🔔 [WEBHOOK] Payment details:', {
      success,
      orderId,
      transactionId,
      merchant_order_id: order?.merchant_order_id,
      extras: order?.extras,
      amount: order?.amount_cents
    });

    if (!orderId) {
      console.error('❌ [WEBHOOK] Missing order ID in webhook');
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    // Only process successful payments
    if (!success) {
      console.log('❌ [WEBHOOK] Payment failed for order', orderId);
      return NextResponse.json({ status: 'ok' });
    }

    // Extract metadata from merchant_order_id or extras
    let metadata = null;
    try {
      // First try to parse merchant_order_id as JSON (legacy)
      if (order?.merchant_order_id) {
        try {
          metadata = JSON.parse(order.merchant_order_id);
          console.log('✅ [WEBHOOK] Parsed metadata from merchant_order_id:', metadata);
        } catch {
          console.log('ℹ️ [WEBHOOK] merchant_order_id is not JSON, checking extras...');
          // If JSON parsing fails, try to extract from order extras
          if (order?.extras) {
            metadata = order.extras;
            console.log('✅ [WEBHOOK] Got metadata from extras:', metadata);
          } else {
            console.log('ℹ️ [WEBHOOK] No extras, trying to parse merchant_order_id structure...');
            // Parse merchant_order_id structure (user_id__restaurant_id__timestamp__random)
            const parts = order.merchant_order_id.split('__');
            if (parts.length >= 2 && parts[0] !== 'order') {
              metadata = {
                user_id: parts[0],
                restaurant_id: parts[1]
              };
              console.log('✅ [WEBHOOK] Extracted metadata from merchant_order_id parts:', metadata);
            } else {
              console.error('❌ [WEBHOOK] Invalid merchant_order_id format:', order.merchant_order_id);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ [WEBHOOK] Error parsing order metadata:', error);
    }

    console.log('📋 [WEBHOOK] Final extracted metadata:', metadata);

    // If no metadata, we can't create the payment record
    if (!metadata || !metadata.user_id || !metadata.restaurant_id) {
      console.error('❌ [WEBHOOK] Missing required metadata in order:', {
        metadata,
        merchant_order_id: order?.merchant_order_id,
        extras: order?.extras
      });
      return NextResponse.json({ error: 'Missing order metadata' }, { status: 400 });
    }

    // Create payment record for successful payment
    console.log('💾 [WEBHOOK] Creating payment record...');
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
      console.error('❌ [WEBHOOK] Error creating payment:', paymentError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    console.log('✅ [WEBHOOK] Payment record created:', createdPayment);

    // Get user email for notification
    console.log('📧 [WEBHOOK] Getting user email for notification...');
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
        
        console.log('✅ [WEBHOOK] Payment notification email sent to', userData.user.email);
      } catch (emailError) {
        console.error('❌ [WEBHOOK] Failed to send payment notification email:', emailError);
        // Don't fail the webhook if email fails
      }
    }

    // Update restaurant's available menus to 1
    console.log('🏪 [WEBHOOK] Updating restaurant available_menus...');
    const { error: restaurantError } = await supabase
      .from('restaurants')
      .update({ 
        available_menus: 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', createdPayment.restaurant_id)
      .eq('user_id', createdPayment.user_id);

    if (restaurantError) {
      console.error('❌ [WEBHOOK] Error updating restaurant:', restaurantError);
      return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 });
    }

    console.log('✅ [WEBHOOK] Restaurant updated successfully');
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('❌ [WEBHOOK] Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 