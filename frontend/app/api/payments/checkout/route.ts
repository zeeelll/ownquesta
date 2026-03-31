import { NextRequest, NextResponse } from 'next/server';
import { buildUpiIntent, CheckoutMethod, createPaymentRecord, sanitizePrice } from '../_store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const paymentMethod = body.paymentMethod as CheckoutMethod;
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim();
    const sessionId = String(body.sessionId ?? '').trim();
    const product = String(body.product ?? 'trained-model').trim();
    const modelName = String(body.modelName ?? 'Trained Model').trim();
    const price = sanitizePrice(body.price, 0);

    if (!['paypal', 'card', 'upi'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Unsupported payment method.' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Customer name is required.' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!product) {
      return NextResponse.json({ error: 'Product is required.' }, { status: 400 });
    }
    if (price <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount.' }, { status: 400 });
    }

    const payment = createPaymentRecord({
      sessionId,
      product,
      modelName,
      price,
      method: paymentMethod,
      customerName: name,
      customerEmail: email,
    });

    const instructions =
      paymentMethod === 'paypal'
        ? 'PayPal checkout session created successfully.'
        : paymentMethod === 'upi'
          ? 'UPI payment request prepared for Ownquesta (ownquesta@oksbi). Approve it in your UPI app.'
          : 'Card payment authorized and ready to confirm.';

    return NextResponse.json({
      success: true,
      instructions,
      payment: {
        ...payment,
        upiIntentUrl: paymentMethod === 'upi' ? buildUpiIntent(payment.orderId, payment.price) : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unable to create checkout session.' },
      { status: 500 },
    );
  }
}
