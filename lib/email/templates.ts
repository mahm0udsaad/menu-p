export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export interface PaymentNotificationData {
  userName: string;
  userEmail: string;
  orderId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  restaurantName?: string;
  transactionDate: string;
}

export function getWelcomeEmailTemplate({ userName, userEmail }: WelcomeEmailData): string {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Menu P!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; text-align: center; }
        .logo { color: #10b981; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .welcome-title { font-size: 28px; font-weight: bold; color: #1e293b; margin-bottom: 20px; text-align: center; }
        .cta-button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .footer { background: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🍽️ Menu P</div>
            <div style="color: #94a3b8;">Digital Menu Solutions</div>
        </div>
        
        <div class="content">
            <h1 class="welcome-title">أهلاً وسهلاً ${userName}! 🎉</h1>
            
            <p>مرحباً بك في <strong>Menu P</strong> - منصتك الذكية لإنشاء وإدارة قوائم الطعام الرقمية!</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://menu-p.com/dashboard" class="cta-button">ابدأ الآن</a>
            </div>
        </div>
        
        <div class="footer">
            <p>شكراً لانضمامك إلى Menu P!</p>
            <p><strong>فريق Menu P</strong><br>info@menu-p.com</p>
        </div>
    </div>
</body>
</html>`;
}

export function getPaymentNotificationTemplate({ 
  userName, 
  userEmail, 
  orderId, 
  amount, 
  status, 
  restaurantName, 
  transactionDate 
}: PaymentNotificationData): string {
  const statusConfig = {
    success: {
      color: '#10b981',
      icon: '✅',
      title: 'تمت العملية بنجاح',
      message: 'تم الدفع بنجاح! أصبح مطعمك الآن نشطاً على منصة Menu P.'
    },
    failed: {
      color: '#ef4444',
      icon: '❌',
      title: 'فشلت العملية',
      message: 'لم تتم عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل معنا.'
    },
    pending: {
      color: '#f59e0b',
      icon: '⏳',
      title: 'العملية قيد المعالجة',
      message: 'عملية الدفع قيد المراجعة. سنخبرك بالنتيجة قريباً.'
    }
  };

  const config = statusConfig[status];

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إشعار الدفعة - Menu P</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 40px 20px; text-align: center; }
        .logo { color: #10b981; font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .status-banner { background: #f8fafc; border: 2px solid ${config.color}; border-radius: 12px; padding: 25px; margin: 30px; text-align: center; }
        .content { padding: 0 30px 40px; }
        .payment-details { background: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .footer { background: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🍽️ Menu P</div>
            <div style="color: #94a3b8;">Digital Menu Solutions</div>
        </div>
        
        <div class="status-banner">
            <div style="font-size: 48px; margin-bottom: 15px;">${config.icon}</div>
            <div style="color: ${config.color}; font-size: 24px; font-weight: bold; margin-bottom: 10px;">${config.title}</div>
            <div>${config.message}</div>
        </div>
        
        <div class="content">
            <h2 style="text-align: center;">مرحباً ${userName}</h2>
            
            <div class="payment-details">
                <h3 style="text-align: center; margin-bottom: 20px;">تفاصيل العملية</h3>
                
                <div class="detail-row">
                    <span>رقم الطلب:</span>
                    <span><strong>#${orderId}</strong></span>
                </div>
                
                <div class="detail-row">
                    <span>المبلغ:</span>
                    <span style="color: ${config.color}; font-weight: bold;">${amount.toLocaleString()} جنيه</span>
                </div>
                
                <div class="detail-row">
                    <span>تاريخ العملية:</span>
                    <span>${transactionDate}</span>
                </div>
                
                <div class="detail-row">
                    <span>حالة الدفع:</span>
                    <span style="color: ${config.color}; font-weight: bold;">${config.title}</span>
                </div>
                
                <div class="detail-row" style="border-bottom: none;">
                    <span>البريد الإلكتروني:</span>
                    <span>${userEmail}</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>شكراً لاختيارك Menu P لحلول القوائم الرقمية</p>
            <p><strong>فريق Menu P</strong><br>info@menu-p.com</p>
        </div>
    </div>
</body>
</html>`;
} 