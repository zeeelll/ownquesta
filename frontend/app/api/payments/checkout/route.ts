import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { buildUpiIntent, CheckoutMethod, createPaymentRecord, sanitizePrice } from '../_store';

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  return {
    keyId,
    client: new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    }),
  };
}

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
    const upiRate = sanitizePrice(process.env.UPI_EXCHANGE_RATE ?? process.env.NEXT_PUBLIC_UPI_EXCHANGE_RATE, 83);
    const amountInr = sanitizePrice(price * upiRate, price);
    const amountPaise = Math.max(100, Math.round(amountInr * 100));

    if (!['paypal', 'card', 'upi'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Unsupported payment method.' }, { status: 400 });
    }
    if (paymentMethod === 'paypal') {
      return NextResponse.json({ error: 'PayPal is coming soon. Please use Card or UPI.' }, { status: 400 });
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

    const { keyId, client } = getRazorpayClient();
    const razorpayOrder = await client.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `oq_${Date.now()}`,
      notes: {
        sessionId: sessionId || 'none',
        product,
        modelName,
        customerEmail: email,
      },
    });

    const payment = createPaymentRecord({
      sessionId,
      product,
      modelName,
      price,
      amountInr,
      amountPaise,
      method: paymentMethod,
      customerName: name,
      customerEmail: email,
      gateway: 'razorpay',
      gatewayOrderId: razorpayOrder.id,
    });

    const upiIntentUrl = buildUpiIntent(payment.orderId, amountInr);

    const instructions =
      paymentMethod === 'upi'
        ? 'UPI checkout created. You can pay with any UPI app via intent or by scanning the QR in the checkout.'
        : 'Card checkout created. Complete payment securely in Razorpay.';

    return NextResponse.json({
      success: true,
      instructions,
      payment: {
        ...payment,
        upiIntentUrl,
        razorpayKeyId: keyId,
        razorpayOrderId: razorpayOrder.id,
        amountInr,
        amountPaise,
        currency: 'INR',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Unable to create checkout session.' },
      { status: 500 },
    );
  }
}
