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

    if (!orderId) {
      console.error('Missing order ID in webhook');
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    // Update payment status and get user data
    const { data: updatedPayment, error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: success ? 'paid' : 'failed',
        paymob_transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId)
      .select(`
        *,
        restaurants (
          name
        )
      `)
      .single();

    if (paymentError) {
      console.error('Error updating payment:', paymentError);
      return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }

    // Get user email for notification
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(updatedPayment.user_id);
    
    if (!userError && userData.user?.email) {
      // Send payment notification email
      try {
        const userName = userData.user.email.split('@')[0] || 'عميلنا العزيز';
        
        await sendPaymentNotificationEmail({
          userName,
          userEmail: userData.user.email,
          orderId: orderId.toString(),
          amount: updatedPayment.amount,
          status: success ? 'success' : 'failed',
          restaurantName: updatedPayment.restaurants?.name,
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

    // If payment is successful, update user's available menus
    if (success) {
      // Update restaurant's available menus to 1
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .update({ 
          available_menus: 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedPayment.restaurant_id)
        .eq('user_id', updatedPayment.user_id);

      if (restaurantError) {
        console.error('Error updating restaurant:', restaurantError);
        return NextResponse.json({ error: 'Failed to update restaurant' }, { status: 500 });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 