# 💳 Paymob One-Time Payment Integration (Next.js + Supabase)

This guide is written for an **AI Agent or Developer Assistant** responsible for implementing a **one-time payment workflow using Paymob Egypt** with the following stack:

- **Next.js** (App Router)
- **Server Actions**
- **Supabase**
- **Paymob Egypt Developer API**

---

## 📦 Overview of the Flow

| Step | Description |
|------|-------------|
| 1️⃣ | Client initiates payment |
| 2️⃣ | Server gets auth token from Paymob |
| 3️⃣ | Create an order on Paymob |
| 4️⃣ | Get a payment key |
| 5️⃣ | Display iframe with payment UI |
| 6️⃣ | Paymob redirects user to `/payment-status` |
| 7️⃣ | Paymob triggers `api/paymob-webhook` |
| 8️⃣ | Supabase gets updated with payment status |

---

## 🔧 Required Environment Variables

```env
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_card_integration_id
PAYMOB_IFRAME_ID=your_iframe_id
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
1. 🔐 API Token – /api/paymob/auth
This endpoint gets a token from Paymob:

ts
Copy
Edit
// app/api/paymob/auth/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://accept.paymob.com/api/auth/tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.PAYMOB_API_KEY
    })
  });
  const { token } = await res.json();
  return NextResponse.json({ token });
}
2. 📦 Register Order
ts
Copy
Edit
export async function registerOrder(token: string, amount: number) {
  const res = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: amount,
      currency: 'EGP',
      items: []
    })
  });

  const data = await res.json();
  return data.id;
}
3. 🎫 Get Payment Key
ts
Copy
Edit
export async function getPaymentKey(
  token: string,
  orderId: number,
  amount: number,
  billing: any
) {
  const res = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      amount_cents: amount,
      expiration: 3600,
      order_id: orderId,
      billing_data: billing,
      currency: 'EGP',
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID)
    })
  });

  const data = await res.json();
  return data.token;
}
4. 🧾 Save Payment Record in Supabase
ts
Copy
Edit
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function savePayment(orderId: number, paymentToken: string, amount: number) {
  await supabase
    .from('payments')
    .insert({
      order_id: orderId,
      payment_token: paymentToken,
      amount,
      status: 'pending'
    });
}
5. 🚀 Server Action to Trigger Payment Flow
ts
Copy
Edit
// app/actions/paymob.ts
'use server';

import { registerOrder, getPaymentKey, savePayment } from '@/lib/paymob';

export async function createPaymobPayment(amount: number, billing: any) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/paymob/auth`);
  const { token } = await res.json();

  const orderId = await registerOrder(token, amount);
  const paymentToken = await getPaymentKey(token, orderId, amount, billing);

  await savePayment(orderId, paymentToken, amount);

  return paymentToken;
}
6. 📱 Client Button to Start Payment
tsx
Copy
Edit
'use client';

import { createPaymobPayment } from '@/app/actions/paymob';

export default function PayButton({ amount, billing }) {
  async function handleClick() {
    const token = await createPaymobPayment(amount, billing);
    window.location.href = `/checkout?pt=${token}`;
  }

  return <button onClick={handleClick}>Pay {amount / 100} EGP</button>;
}
7. 🖼️ Checkout Page with Iframe
tsx
Copy
Edit
export default function Checkout({ searchParams }) {
  const { pt } = searchParams;
  const iframeSrc = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${pt}`;

  return (
    <iframe src={iframeSrc} width="100%" height="600" />
  );
}
8. 🔔 Webhook Endpoint – /api/paymob-webhook
Paymob calls this after payment is done to confirm payment status.

ts
Copy
Edit
// app/api/paymob-webhook/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: Request) {
  const body = await req.json();
  const success = body.obj?.success;
  const orderId = body.obj?.order?.id;

  if (!orderId) return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });

  await supabase
    .from('payments')
    .update({ status: success ? 'paid' : 'failed' })
    .eq('order_id', orderId);

  return NextResponse.json({ status: 'ok' });
}
✅ Configure this in Paymob Dashboard as the “Callback URL”:

arduino
Copy
Edit
https://your-domain.com/api/paymob-webhook
9. ✅ User Redirect Page – /payment-status
This page is where Paymob redirects users after payment.

tsx
Copy
Edit
'use client';

import { useSearchParams } from 'next/navigation';

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  return (
    <div className="p-6 text-center">
      {success === 'true' ? (
        <div>
          <h1 className="text-green-600 text-3xl font-bold">🎉 Payment Successful</h1>
          <p>Thank you for your purchase.</p>
        </div>
      ) : (
        <div>
          <h1 className="text-red-600 text-3xl font-bold">❌ Payment Failed</h1>
          <p>Please try again or contact support.</p>
        </div>
      )}
    </div>
  );
}
✅ Redirect URL to configure in Paymob iframe settings:

arduino
Copy
Edit
https://your-domain.com/payment-status?success={{success}}
🗃️ Supabase payments Table Schema
sql
Copy
Edit
create table payments (
  id bigint primary key generated always as identity,
  order_id integer not null,
  payment_token text not null,
  amount integer not null,
  status text default 'pending',
  created_at timestamp default now()
);
✅ Done!
You now have a complete Paymob integration for one-time payments, including:

Secure payment iframe

Supabase tracking

Webhook for confirmation

Payment status UI

This is production-ready and extensible for receipts, invoices, analytics, or subscriptions later.