import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { confirmPaymentRecord, getPaymentRecord } from '../_store';

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000';

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  return {
    keySecret,
    client: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderId = String(body.orderId ?? '').trim();
    const razorpayPaymentId = String(body.razorpayPaymentId ?? '').trim();
    const razorpayOrderId = String(body.razorpayOrderId ?? '').trim();
    const razorpaySignature = String(body.razorpaySignature ?? '').trim();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: 'Razorpay verification payload is required.' }, { status: 400 });
    }

    const existing = getPaymentRecord(orderId);
    if (!existing) {
      return NextResponse.json({ error: 'Payment order not found.' }, { status: 404 });
    }
    if (existing.gatewayOrderId !== razorpayOrderId) {
      return NextResponse.json({ error: 'Gateway order mismatch.' }, { status: 400 });
    }

    const { keySecret, client } = getRazorpayClient();
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 });
    }

    const gatewayPayment = await client.payments.fetch(razorpayPaymentId);
    const isPaidState = gatewayPayment.status === 'captured' || gatewayPayment.status === 'authorized';
    if (!isPaidState) {
      return NextResponse.json({ error: 'Payment is not completed yet.' }, { status: 400 });
    }
    if (gatewayPayment.order_id !== razorpayOrderId) {
      return NextResponse.json({ error: 'Gateway payment/order mismatch.' }, { status: 400 });
    }
    if (gatewayPayment.method !== 'upi' && gatewayPayment.method !== 'card') {
      return NextResponse.json({ error: 'Only Card or UPI payments are accepted for this checkout.' }, { status: 400 });
    }

    const payment = confirmPaymentRecord(orderId, {
      gatewayPaymentId: razorpayPaymentId,
      gatewaySignature: razorpaySignature,
    });

    if (payment?.customerEmail) {
      setImmediate(async () => {
        try {
          await fetch(`${BACKEND_BASE}/api/payments/notify-success`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: payment.customerEmail,
              customerName: payment.customerName,
              orderId: payment.orderId,
              product: payment.product,
              modelName: payment.modelName,
              method: payment.method,
              gateway: payment.gateway,
              gatewayPaymentId: payment.gatewayPaymentId,
              amountInr: payment.amountInr,
              paidAt: payment.paidAt,
            }),
            cache: 'no-store',
          });
        } catch {
          // Keep payment confirmation successful even if email fails.
        }
      });
    }

    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unable to confirm payment.' },
      { status: 500 },
    );
  }
}
