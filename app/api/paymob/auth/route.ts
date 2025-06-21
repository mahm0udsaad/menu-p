import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.PAYMOB_API_KEY
      })
    });

    if (!res.ok) {
      throw new Error('Failed to get auth token from Paymob');
    }

    const data = await res.json();
    return NextResponse.json({ token: data.token });
  } catch (error) {
    console.error('Paymob auth error:', error);
    return NextResponse.json({ error: 'Failed to authenticate with Paymob' }, { status: 500 });
  }
} 