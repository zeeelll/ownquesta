import { NextRequest, NextResponse } from 'next/server';
import { confirmPaymentRecord } from '../_store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = String(body.orderId ?? '').trim();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const payment = confirmPaymentRecord(orderId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment order not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unable to confirm payment.' },
      { status: 500 },
    );
  }
}
