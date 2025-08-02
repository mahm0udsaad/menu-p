import nodemailer from 'nodemailer';

// Email configuration using Hostinger SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER || 'info@menu-p.com',
    pass: process.env.SMTP_PASS || 'MM011@25m'
  }
});

// Verify connection configuration only in development to avoid
// network calls during build or in environments where SMTP access
// isn't available. This prevents the build from failing when the
// SMTP server can't be reached.
if (process.env.NODE_ENV !== 'production') {
  transporter.verify(function (error: any) {
    if (error) {
      console.error('Email service configuration error:', error);
    } else {
      console.log('Email service is ready to send messages');
    }
  });
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const mailOptions = {
      from: `"Menu P" <${process.env.SMTP_USER || 'info@menu-p.com'}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

export { transporter }; 