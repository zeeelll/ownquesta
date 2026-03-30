'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';

const DEFAULT_PRICE = 4.99;

type CheckoutStep = 'details' | 'processing' | 'success';
type PaymentMethod = 'card' | 'upi';

export default function PaymentPage() {
  const router = useRouter();
  const [checkout, setCheckout] = useState({
    source: 'lab',
    sessionId: '',
    modelName: 'RandomForestClassifier',
    product: 'trained-model',
    price: DEFAULT_PRICE,
  });
  const [step, setStep] = useState<CheckoutStep>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const parsedPrice = Number.parseFloat(params.get('price') ?? `${DEFAULT_PRICE}`);

    setCheckout({
      source: params.get('source') ?? 'lab',
      sessionId: params.get('session') ?? '',
      modelName: params.get('model') ?? 'RandomForestClassifier',
      product: params.get('product') ?? 'trained-model',
      price: Number.isFinite(parsedPrice) ? parsedPrice : DEFAULT_PRICE,
    });
  }, []);

  const { source, sessionId, modelName, product, price } = checkout;
  const returnPath = source === 'script' ? '/lab/script' : '/lab';

  const orderId = useMemo(
    () => (sessionId ? `OQ-${sessionId.slice(0, 8).toUpperCase()}` : 'OQ-INSTANT-DL'),
    [sessionId],
  );

  const formatCardNumber = (value: string) => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) nextErrors.name = 'Full name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.';

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) nextErrors.cardNumber = 'Enter a valid 16-digit card number.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) nextErrors.expiry = 'Use MM/YY format.';
      if (cvv.length < 3) nextErrors.cvv = 'Enter a valid CVV.';
    } else if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      nextErrors.upiId = 'Enter a valid UPI ID.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCheckout = () => {
    if (!validate()) return;

    setStep('processing');

    window.setTimeout(() => {
      setStep('success');

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'ownquesta_model_payment',
          JSON.stringify({
            paid: true,
            product,
            sessionId,
            modelName,
            price,
            paidAt: Date.now(),
          }),
        );
      }

      window.setTimeout(() => {
        const params = new URLSearchParams();
        params.set('payment', 'success');
        if (sessionId) params.set('session', sessionId);
        router.push(`${returnPath}?${params.toString()}`);
      }, 1200);
    }, 1700);
  };

  const trustItems = [
    'One-time purchase with instant access',
    'Download your trained `.pkl` model right after checkout',
    'Pay securely with card or UPI and return automatically to the lab',
  ];

  return (
    <div
      className="min-h-screen text-[#e6eef8] font-chillax relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #06080f 0%, #0b0d1a 48%, #080b18 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-120px] left-[12%] w-[320px] h-[320px] rounded-full blur-3xl" style={{ background: 'rgba(110,84,200,0.16)' }} />
        <div className="absolute bottom-[-120px] right-[10%] w-[360px] h-[360px] rounded-full blur-3xl" style={{ background: 'rgba(96,165,250,0.12)' }} />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-10 py-4 bg-[rgba(10,11,20,0.72)] backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <Logo href="/home" size="md" />
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.16em] uppercase border border-violet-400/20 bg-violet-500/10 text-violet-300">
              {step === 'details' ? 'Secure checkout' : step === 'processing' ? 'Processing payment' : 'Returning to lab'}
            </span>
            {step === 'details' && (
              <Link
                href={returnPath}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/[0.03] text-[#c5d4ed] hover:text-white hover:bg-white/[0.06] transition-all"
              >
                ← Back to Lab
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 xl:gap-8 items-start">
          <section className="card-premium glass-dark rounded-[28px] p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-[11px] font-semibold tracking-[0.18em] uppercase border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Premium model delivery
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-white mb-3">
              Complete your <span className="gradient-text">Ownquesta</span> checkout
            </h1>
            <p className="text-sm sm:text-base text-[#8fa3c4] leading-relaxed max-w-xl">
              Your model is ready. Finish the payment below and we will send you straight back to the Lab Playground for an instant download.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass rounded-2xl border border-white/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f8da8] mb-2">Product</p>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-white font-semibold">{modelName} (.pkl)</p>
                    <p className="text-sm text-[#8fa3c4] mt-1">Trained ML model · Python pickle format</p>
                  </div>
                  <span className="text-xl font-black text-violet-300">${price.toFixed(2)}</span>
                </div>
              </div>

              <div className="glass rounded-2xl border border-white/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f8da8] mb-2">Order ID</p>
                <p className="text-white font-semibold tracking-wide">{orderId}</p>
                <p className="text-sm text-[#8fa3c4] mt-1">Linked to your current lab session</p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-violet-400/20 bg-[linear-gradient(135deg,rgba(110,84,200,0.12),rgba(96,165,250,0.06))] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-violet-500/15 border border-violet-400/20">📦</div>
                <div>
                  <p className="text-white font-semibold">What you get after payment</p>
                  <p className="text-sm text-[#9fb3d9]">Fast, branded, and friction-free delivery</p>
                </div>
              </div>

              <div className="space-y-3">
                {trustItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-[#d7def0]">
                    <span className="mt-0.5 text-emerald-400">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="card-premium glass-dark rounded-[28px] p-6 sm:p-7">
            {step === 'details' && (
              <>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-violet-300 mb-2">Payment details</p>
                    <h2 className="text-2xl font-bold text-white">Download trained model</h2>
                    <p className="text-sm text-[#8fa3c4] mt-1">One-time payment · instant delivery</p>
                  </div>
                  <div className="px-3 py-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 text-sm font-bold">
                    ${price.toFixed(2)}
                  </div>
                </div>

                <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-1.5">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('card'); setErrors({}); }}
                    className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${paymentMethod === 'card' ? 'bg-[linear-gradient(135deg,rgba(110,84,200,0.28),rgba(168,126,223,0.22))] text-white border border-violet-400/30' : 'text-[#8fa3c4] border border-transparent hover:bg-white/[0.04]'}`}
                  >
                    💳 Card
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('upi'); setErrors({}); }}
                    className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${paymentMethod === 'upi' ? 'bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(96,165,250,0.18))] text-white border border-emerald-400/30' : 'text-[#8fa3c4] border border-transparent hover:bg-white/[0.04]'}`}
                  >
                    📱 UPI
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <Field label="Cardholder name" error={errors.name}>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className={inputClass(Boolean(errors.name))}
                      />
                    </Field>

                    <Field label="Receipt email" error={errors.email}>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        type="email"
                        className={inputClass(Boolean(errors.email))}
                      />
                    </Field>

                    <Field label="Card number" error={errors.cardNumber}>
                      <div className="relative">
                        <input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="0000 0000 0000 0000"
                          className={`${inputClass(Boolean(errors.cardNumber))} pr-24`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-bold">
                          <span className="px-2 py-1 rounded-md bg-sky-500/10 border border-sky-400/20 text-sky-300">VISA</span>
                          <span className="px-2 py-1 rounded-md bg-orange-500/10 border border-orange-400/20 text-orange-300">MC</span>
                        </div>
                      </div>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry" error={errors.expiry}>
                        <input
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          className={inputClass(Boolean(errors.expiry))}
                        />
                      </Field>
                      <Field label="CVV" error={errors.cvv}>
                        <input
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          placeholder="•••"
                          type="password"
                          className={inputClass(Boolean(errors.cvv))}
                        />
                      </Field>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Field label="Full name" error={errors.name}>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className={inputClass(Boolean(errors.name))}
                      />
                    </Field>

                    <Field label="Receipt email" error={errors.email}>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        type="email"
                        className={inputClass(Boolean(errors.email))}
                      />
                    </Field>

                    <Field label="UPI ID" error={errors.upiId}>
                      <input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value.trim())}
                        placeholder="yourname@okaxis"
                        className={inputClass(Boolean(errors.upiId))}
                      />
                    </Field>

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-4">
                      <p className="text-xs font-semibold tracking-[0.16em] uppercase text-emerald-300">Supported UPI apps</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                          <span key={app} className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/[0.04] text-[#d7def0]">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  className="w-full mt-6 rounded-2xl px-5 py-3.5 text-sm sm:text-[15px] font-extrabold text-white transition-all hover:-translate-y-0.5"
                  style={{
                    background: paymentMethod === 'card'
                      ? 'linear-gradient(135deg, #6e54c8 0%, #a87edf 60%, #8b5cf6 100%)'
                      : 'linear-gradient(135deg, #059669 0%, #10b981 50%, #38bdf8 100%)',
                    boxShadow: paymentMethod === 'card'
                      ? '0 10px 32px rgba(110,84,200,0.35)'
                      : '0 10px 32px rgba(16,185,129,0.28)',
                  }}
                >
                  {paymentMethod === 'card' ? `Pay $${price.toFixed(2)} & Download Model` : `Pay $${price.toFixed(2)} with UPI`}
                </button>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#90a0bf]">
                  <span>🔒 SSL encrypted</span>
                  <span>✓ Secure checkout</span>
                  <span>⚡ Instant delivery</span>
                </div>
              </>
            )}

            {step === 'processing' && (
              <div className="py-10 text-center">
                <div className={`w-16 h-16 mx-auto rounded-full border-2 mb-5 animate-spin ${paymentMethod === 'card' ? 'border-violet-400/20 border-t-violet-400' : 'border-emerald-400/20 border-t-emerald-400'}`} />
                <h3 className="text-xl font-bold text-white mb-2">
                  {paymentMethod === 'card' ? 'Processing card payment…' : 'Confirming UPI payment…'}
                </h3>
                <p className="text-sm text-[#8fa3c4]">Please wait while we secure your order and prepare the automatic return to the Lab Playground.</p>
                <div className="mt-6 h-2 rounded-full overflow-hidden bg-white/5">
                  <div className={`h-full rounded-full animate-pulse ${paymentMethod === 'card' ? 'bg-[linear-gradient(90deg,#6e54c8,#a87edf,#60a5fa)]' : 'bg-[linear-gradient(90deg,#10b981,#34d399,#60a5fa)]'}`} style={{ width: '82%' }} />
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-10 text-center">
                <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center text-2xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-300">
                  ✓
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Payment successful</h3>
                <p className="text-sm text-[#8fa3c4]">Done. Returning you automatically to the Lab Playground to start the download…</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-[#91a0bf] mb-2">{label}</span>
      {children}
      {error && <span className="block mt-2 text-xs text-rose-400">{error}</span>}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-2xl border bg-[rgba(255,255,255,0.03)] px-4 py-3 text-sm text-white placeholder:text-[#60708f] outline-none transition-all focus:border-violet-400/50 focus:ring-2 focus:ring-violet-500/15 ${hasError ? 'border-rose-400/60' : 'border-white/10'}`;
}
