'use server';

import { sendEmail } from './index';
import { getWelcomeEmailTemplate, getPaymentNotificationTemplate, WelcomeEmailData, PaymentNotificationData } from './templates';

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  try {
    const html = getWelcomeEmailTemplate(data);
    
    const result = await sendEmail({
      to: data.userEmail,
      subject: 'مرحباً بك في Menu P! 🎉',
      html,
    });

    if (result.success) {
      console.log(`Welcome email sent successfully to ${data.userEmail}`);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('Failed to send welcome email:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error in sendWelcomeEmail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send welcome email' 
    };
  }
}

export async function sendPaymentNotificationEmail(data: PaymentNotificationData) {
  try {
    const html = getPaymentNotificationTemplate(data);
    
    let subject = '';
    switch (data.status) {
      case 'success':
        subject = '✅ تم الدفع بنجاح - Menu P';
        break;
      case 'failed':
        subject = '❌ فشل في الدفع - Menu P';
        break;
      case 'pending':
        subject = '⏳ الدفع قيد المعالجة - Menu P';
        break;
      default:
        subject = 'إشعار دفع - Menu P';
    }

    const result = await sendEmail({
      to: data.userEmail,
      subject,
      html,
    });

    if (result.success) {
      console.log(`Payment notification email sent successfully to ${data.userEmail} for order ${data.orderId}`);
      return { success: true, messageId: result.messageId };
    } else {
      console.error('Failed to send payment notification email:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Error in sendPaymentNotificationEmail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send payment notification email' 
    };
  }
}

// Helper function to send custom emails
export async function sendCustomEmail(to: string, subject: string, html: string) {
  try {
    const result = await sendEmail({
      to,
      subject,
      html,
    });

    return result;
  } catch (error) {
    console.error('Error in sendCustomEmail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send custom email' 
    };
  }
} 