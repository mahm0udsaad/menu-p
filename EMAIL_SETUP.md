# Email Service Setup Guide

This guide explains how to set up the email service for Menu P platform.

## Features

- 🎉 **Welcome Emails**: Automatically sent when users sign up
- 💳 **Payment Notifications**: Sent for successful, failed, or pending payments
- 🎨 **Beautiful Templates**: Responsive HTML templates with Arabic support
- 📧 **Reliable Delivery**: Using Hostinger SMTP for reliable email delivery

## Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Email Configuration (Hostinger SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@menu-p.com
SMTP_PASS=MM011@25m
```

## Email Templates

### Welcome Email
- Sent automatically when users successfully sign up
- Includes platform introduction and getting started tips
- Arabic content with modern design
- Call-to-action button to dashboard

### Payment Notification Email
- Sent when payment status changes (success/failed/pending)
- Includes transaction details and order information
- Different styling based on payment status
- Arabic content with payment details

## Setup Complete

The email service has been successfully integrated into:

1. **User Signup Process** - Welcome emails sent automatically
2. **Payment Webhook** - Payment notifications via Paymob webhook
3. **Manual Functions** - Available for custom email sending

## File Structure

```
lib/email/
├── index.ts          # Email service configuration
├── service.ts        # High-level email functions
└── templates.ts      # HTML email templates
```

## Testing

1. Sign up with a real email to test welcome emails
2. Complete a payment to test payment notifications
3. Check server logs for email service status

The email service is now ready to use!

## Security Notes

- Email credentials are configured via environment variables
- Fallback to hardcoded values for development (should be changed in production)
- Email sending errors don't break the main application flow
- All email operations are logged for debugging

## Email Client Compatibility

Templates tested with:
- Gmail
- Outlook
- Apple Mail  
- Mobile email clients

The templates use inline CSS and simple HTML structure for maximum compatibility.

---

**Note**: Make sure to update the SMTP credentials for production use and never commit sensitive credentials to version control. 