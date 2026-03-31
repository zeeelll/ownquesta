export type CheckoutMethod = 'paypal' | 'card' | 'upi';

export type PaymentRecord = {
  orderId: string;
  sessionId: string;
  product: string;
  modelName: string;
  price: number;
  currency: 'USD';
  method: CheckoutMethod;
  customerName: string;
  customerEmail: string;
  status: 'created' | 'paid';
  createdAt: string;
  paidAt?: string;
};

declare global {
  var __ownquestaPaymentStore: Map<string, PaymentRecord> | undefined;
}

const paymentStore = globalThis.__ownquestaPaymentStore ?? new Map<string, PaymentRecord>();
if (!globalThis.__ownquestaPaymentStore) {
  globalThis.__ownquestaPaymentStore = paymentStore;
}

export function sanitizePrice(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : fallback;
}

export function createPaymentRecord(input: {
  sessionId: string;
  product: string;
  modelName?: string;
  price: number;
  method: CheckoutMethod;
  customerName: string;
  customerEmail: string;
}) {
  const orderId = `PAY-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const record: PaymentRecord = {
    orderId,
    sessionId: input.sessionId,
    product: input.product,
    modelName: input.modelName || 'Trained Model',
    price: sanitizePrice(input.price),
    currency: 'USD',
    method: input.method,
    customerName: input.customerName.trim(),
    customerEmail: input.customerEmail.trim().toLowerCase(),
    status: 'created',
    createdAt: new Date().toISOString(),
  };

  paymentStore.set(orderId, record);
  return record;
}

export function confirmPaymentRecord(orderId: string) {
  const existing = paymentStore.get(orderId);
  if (!existing) return null;

  const updated: PaymentRecord = {
    ...existing,
    status: 'paid',
    paidAt: new Date().toISOString(),
  };

  paymentStore.set(orderId, updated);
  return updated;
}

export function getPaymentRecord(orderId: string) {
  return paymentStore.get(orderId) ?? null;
}

export function buildUpiIntent(orderId: string, amount: number) {
  const payeeId = process.env.NEXT_PUBLIC_UPI_ID || 'ownquesta@oksbi';
  const payeeName = process.env.NEXT_PUBLIC_UPI_NAME || 'Ownquesta';
  const upiRate = Number(process.env.NEXT_PUBLIC_UPI_EXCHANGE_RATE || 83);
  const inrAmount = sanitizePrice(amount * upiRate, amount);

  const params = new URLSearchParams({
    pa: payeeId,
    pn: payeeName,
    tn: `Ownquesta ${orderId}`,
    tr: orderId,
    am: inrAmount.toFixed(2),
    cu: 'INR',
  });

  return `upi://pay?${params.toString()}`;
}
