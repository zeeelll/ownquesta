'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';

const DEFAULT_PRICE = 4.99;

type CheckoutStep = 'details' | 'processing' | 'success';
type PaymentMethod = 'paypal' | 'card' | 'upi';

export default function PaymentPage() {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [paidOrderId, setPaidOrderId] = useState('');

  const checkout = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        source: 'lab',
        sessionId: '',
        modelName: 'RandomForestClassifier',
        product: 'trained-model',
        price: DEFAULT_PRICE,
      };
    }

    const params = new URLSearchParams(window.location.search);
    const parsedPrice = Number.parseFloat(params.get('price') ?? `${DEFAULT_PRICE}`);
    return {
      source: params.get('source') ?? 'lab',
      sessionId: params.get('session') ?? '',
      modelName: params.get('model') ?? 'RandomForestClassifier',
      product: params.get('product') ?? 'trained-model',
      price: Number.isFinite(parsedPrice) ? parsedPrice : DEFAULT_PRICE,
    };
  }, []);

  const { source, sessionId, modelName, product, price } = checkout;
  const returnPath = source === 'script' ? '/lab/script' : '/lab';

  const orderId = useMemo(
    () => (sessionId ? `OQ-${sessionId.slice(0, 8).toUpperCase()}` : 'OQ-INSTANT-DL'),
    [sessionId],
  );

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Full name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email =
        paymentMethod === 'paypal'
          ? 'Enter the email linked to your PayPal account.'
          : 'Enter a valid email address.';
    }

    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        nextErrors.cardNumber = 'Enter a valid 16-digit card number.';
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) nextErrors.expiry = 'Use MM/YY format.';
      if (cvv.length < 3) nextErrors.cvv = 'Enter a valid CVV.';
    }

    if (paymentMethod === 'upi' && !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
      nextErrors.upiId = 'Enter a valid UPI ID.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const completeCheckout = async (createdOrderId: string) => {
    setStep('processing');
    setProgress(8);

    let p = 8;
    const interval = window.setInterval(() => {
      p += Math.random() * 14;
      if (p >= 94) {
        window.clearInterval(interval);
        p = 94;
      }
      setProgress(Math.min(p, 94));
    }, 120);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 1400));

      const confirmResponse = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: createdOrderId }),
      });
      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok || !confirmData.success) {
        throw new Error(confirmData.error || 'Unable to confirm payment.');
      }

      window.clearInterval(interval);
      setProgress(100);
      setPaidOrderId(createdOrderId);
      setStatusNote('Payment confirmed. Unlocking your model and code exports now…');
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
            method: paymentMethod,
            orderId: createdOrderId,
            unlocks: ['trained-model', 'py', 'ipynb'],
          }),
        );
        sessionStorage.setItem(
          'ownquesta_export_access',
          JSON.stringify({
            paid: true,
            sessionId,
            types: ['py', 'ipynb'],
            orderId: createdOrderId,
            grantedAt: Date.now(),
          }),
        );
      }

      window.setTimeout(() => {
        const params = new URLSearchParams();
        params.set('payment', 'success');
        if (sessionId) params.set('session', sessionId);
        router.push(`${returnPath}?${params.toString()}`);
      }, 1100);
    } catch (error) {
      window.clearInterval(interval);
      throw error;
    }
  };

  const handleCheckout = async () => {
    if (!validate() || isSubmitting) return;

    setErrors({});
    setStatusNote('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          name,
          email,
          upiId,
          sessionId,
          product,
          modelName,
          price,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to start the checkout.');
      }

      setStatusNote(data.instructions || 'Secure checkout created successfully.');

      if (paymentMethod === 'upi' && data.payment?.upiIntentUrl && typeof window !== 'undefined') {
        const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
        if (isMobileDevice) {
          window.open(data.payment.upiIntentUrl, '_self');
        }
      }

      await completeCheckout(data.payment.orderId as string);
    } catch (error: any) {
      setStep('details');
      setProgress(0);
      setErrors((prev) => ({
        ...prev,
        general: error?.message || 'Payment could not be completed. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const trustItems = [
    { icon: '⚡', text: 'One checkout unlocks your trained model plus matching `.py` and `.ipynb` exports' },
    { icon: '📦', text: 'Download the `.pkl` model instantly and continue from the same lab session' },
    { icon: '🔒', text: 'Choose PayPal, debit/credit card, or UPI with a smooth return back to Ownquesta' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .pay-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* Animated background grid */
        .pay-bg-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(110,84,200,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(110,84,200,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
        }

        /* Glowing orbs */
        .orb {
          position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
          animation: orbFloat 10s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 480px; height: 480px; top: -140px; left: -80px;
          background: radial-gradient(circle, rgba(110,84,200,0.22) 0%, transparent 65%);
          filter: blur(60px);
        }
        .orb-2 {
          width: 420px; height: 420px; bottom: -120px; right: -60px;
          background: radial-gradient(circle, rgba(96,165,250,0.16) 0%, transparent 65%);
          filter: blur(60px); animation-delay: -5s;
        }
        .orb-3 {
          width: 260px; height: 260px; top: 40%; right: 18%;
          background: radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%);
          filter: blur(40px); animation-delay: -2.5s;
        }
        @keyframes orbFloat {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(20px, 30px) scale(1.06); }
        }

        /* Glass panel */
        .glass-panel {
          background: rgba(255,255,255,0.032);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 28px;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        /* Top shimmer line */
        .glass-panel::before {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          border-radius: 1px;
        }

        /* Enhanced input */
        .pay-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 13px 16px;
          font-size: 14px;
          font-weight: 500;
          color: #e6eef8;
          outline: none;
          transition: all 0.2s ease;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .pay-input::placeholder { color: #3d5166; }
        .pay-input:focus {
          border-color: rgba(139,92,246,0.55);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 4px rgba(139,92,246,0.1), 0 2px 12px rgba(0,0,0,0.2);
        }
        .pay-input.has-error { border-color: rgba(248,113,113,0.55); }
        .pay-input.has-error:focus { box-shadow: 0 0 0 4px rgba(248,113,113,0.1); }

        /* Method button */
        .method-btn {
          flex: 1; border: none; cursor: pointer; padding: 11px 14px;
          border-radius: 12px; font-size: 13px; font-weight: 700;
          transition: all 0.22s cubic-bezier(0.34,1.1,0.64,1);
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .method-btn.inactive { background: transparent; color: #4a6080; border: 1.5px solid transparent; }
        .method-btn.inactive:hover { background: rgba(255,255,255,0.04); color: #8fa3c4; }
        .method-btn.active-paypal {
          background: linear-gradient(135deg, rgba(37,99,235,0.3), rgba(56,189,248,0.22));
          color: #7dd3fc;
          border: 1.5px solid rgba(56,189,248,0.35);
          box-shadow: 0 4px 18px rgba(56,189,248,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .method-btn.active-card {
          background: linear-gradient(135deg, rgba(110,84,200,0.35), rgba(139,92,246,0.28));
          color: #c4b5fd;
          border: 1.5px solid rgba(139,92,246,0.4);
          box-shadow: 0 4px 18px rgba(110,84,200,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .method-btn.active-upi {
          background: linear-gradient(135deg, rgba(16,185,129,0.28), rgba(52,211,153,0.2));
          color: #6ee7b7;
          border: 1.5px solid rgba(52,211,153,0.35);
          box-shadow: 0 4px 18px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        /* Pay button */
        .pay-btn {
          width: 100%; padding: 15px 20px; border: none; cursor: pointer;
          border-radius: 18px; font-size: 15px; font-weight: 800;
          color: #fff; transition: all 0.22s cubic-bezier(0.34,1.1,0.64,1);
          font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: -0.01em;
          position: relative; overflow: hidden;
        }
        .pay-btn:hover { transform: translateY(-2px); }
        .pay-btn:active { transform: translateY(0) scale(0.99); }
        .pay-btn.paypal-pay {
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 35%, #0ea5e9 80%, #38bdf8 100%);
          box-shadow: 0 10px 36px rgba(37,99,235,0.42), 0 1px 0 rgba(255,255,255,0.1) inset;
        }
        .pay-btn.paypal-pay:hover { box-shadow: 0 16px 48px rgba(37,99,235,0.55); }
        .pay-btn.card-pay {
          background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 40%, #8b5cf6 80%, #a78bfa 100%);
          box-shadow: 0 10px 36px rgba(109,40,217,0.5), 0 1px 0 rgba(255,255,255,0.12) inset;
        }
        .pay-btn.card-pay:hover { box-shadow: 0 16px 48px rgba(109,40,217,0.6); }
        .pay-btn.upi-pay {
          background: linear-gradient(135deg, #065f46 0%, #059669 40%, #10b981 80%, #34d399 100%);
          box-shadow: 0 10px 36px rgba(5,150,105,0.45), 0 1px 0 rgba(255,255,255,0.1) inset;
        }
        .pay-btn.upi-pay:hover { box-shadow: 0 16px 48px rgba(5,150,105,0.55); }

        /* Shimmer on pay button */
        .pay-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s ease;
        }
        .pay-btn:hover::after { transform: translateX(100%); }

        /* Progress bar */
        .prog-track {
          width: 100%; height: 5px; border-radius: 999px;
          background: rgba(255,255,255,0.07); overflow: hidden; margin-top: 20px;
        }
        .prog-fill {
          height: 100%; border-radius: 999px;
          transition: width 0.14s linear;
          background: linear-gradient(90deg, #6d28d9, #8b5cf6, #a78bfa, #60a5fa);
          background-size: 200%;
          animation: shimmerBar 1.5s linear infinite;
        }
        .prog-fill.paypal-fill {
          background: linear-gradient(90deg, #2563eb, #0ea5e9, #60a5fa, #93c5fd);
          background-size: 200%;
        }
        .prog-fill.upi-fill {
          background: linear-gradient(90deg, #059669, #10b981, #34d399, #6ee7b7);
          background-size: 200%;
        }
        @keyframes shimmerBar {
          from { background-position: 200% center; }
          to   { background-position: -200% center; }
        }

        /* Spinner */
        .spin-ring {
          width: 60px; height: 60px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.06);
          border-top-color: #8b5cf6;
          animation: spin 0.85s linear infinite;
          margin: 0 auto 20px;
          box-shadow: 0 0 20px rgba(139,92,246,0.3);
        }
        .spin-ring.paypal-spin {
          border-top-color: #38bdf8;
          box-shadow: 0 0 20px rgba(56,189,248,0.32);
        }
        .spin-ring.upi-spin {
          border-top-color: #10b981;
          box-shadow: 0 0 20px rgba(16,185,129,0.3);
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Success check */
        .success-ring {
          width: 70px; height: 70px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; margin: 0 auto 20px;
          background: radial-gradient(circle, rgba(16,185,129,0.2), rgba(16,185,129,0.05));
          border: 1.5px solid rgba(52,211,153,0.4);
          box-shadow: 0 0 32px rgba(16,185,129,0.35);
          animation: popCheck 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes popCheck {
          from { transform: scale(0.3); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        /* Field label */
        .f-label {
          display: block;
          font-size: 11px; font-weight: 700; letter-spacing: 0.13em;
          text-transform: uppercase; color: #4a5e78; margin-bottom: 8px;
        }
        .f-error { display: block; font-size: 11px; color: #f87171; margin-top: 6px; font-weight: 500; }

        /* Chip */
        .chip {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 100px;
          font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
        }
        .chip-dot { width: 6px; height: 6px; border-radius: 50%; animation: pulseDot 1.8s ease-in-out infinite; }
        @keyframes pulseDot { 0%,100%{opacity:1;} 50%{opacity:0.25;} }

        /* Divider */
        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 20px 0; }

        /* Card badges */
        .card-wrap { position: relative; }
        .card-badges {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          display: flex; gap: 4px;
        }
        .cbadge {
          font-size: 9px; font-weight: 800; letter-spacing: 0.06em;
          padding: 3px 7px; border-radius: 6px;
        }

        /* UPI supported row */
        .upi-row {
          display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;
        }
        .upi-chip {
          padding: 5px 11px; border-radius: 8px; font-size: 11px; font-weight: 600;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #c5d4ed;
          transition: background 0.15s;
        }
        .paypal-note {
          border-radius: 16px;
          border: 1px solid rgba(56,189,248,0.22);
          background: rgba(56,189,248,0.08);
          padding: 14px 16px;
        }
        .bundle-row {
          display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;
        }
        .bundle-chip {
          padding: 6px 10px; border-radius: 999px; font-size: 11px; font-weight: 700;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04); color: #dbeafe;
        }

        /* Security items */
        .sec-row {
          display: flex; justify-content: center; flex-wrap: wrap; gap: 16px; margin-top: 14px;
        }
        .sec-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #374f66; font-weight: 500; }

        /* Delivery box */
        .delivery-box {
          border-radius: 20px;
          border: 1px solid rgba(110,84,200,0.2);
          background: linear-gradient(135deg, rgba(110,84,200,0.09), rgba(99,102,241,0.05));
          padding: 20px; margin-top: 20px;
        }

        /* Meta cards */
        .meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
        @media (max-width:500px) { .meta-row { grid-template-columns:1fr; } }
        .meta-card {
          background: rgba(255,255,255,0.033);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 15px;
        }

        /* Fade-in for step transitions */
        .fade-in { animation: fadeIn 0.3s ease both; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div
        className="pay-wrap min-h-screen text-[#e6eef8] relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #06080f 0%, #0b0d1a 48%, #080b18 100%)' }}
      >
        {/* Background */}
        <div className="pay-bg-grid" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* ── NAV ── */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-10 py-4 bg-[rgba(8,10,20,0.75)] backdrop-blur-2xl border-b border-white/[0.055]">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <Logo href="/home" size="md" />
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="chip hidden sm:inline-flex border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <span className="chip-dot bg-violet-400" />
                {step === 'details' ? 'Secure checkout' : step === 'processing' ? 'Processing payment' : 'Returning to lab'}
              </span>
              {step === 'details' && (
                <Link
                  href={returnPath}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/[0.03] text-[#c5d4ed] hover:text-white hover:bg-white/[0.06] hover:border-white/20 transition-all duration-200"
                >
                  ← Back to Lab
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 xl:gap-8 items-start">

            {/* ── LEFT PANEL ── */}
            <section className="glass-panel p-6 sm:p-8">
              <div className="chip border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 mb-5">
                <span className="chip-dot bg-emerald-400" />
                Premium model delivery
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white mb-3" style={{ letterSpacing: '-0.03em' }}>
                Complete your{' '}
                <span style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Ownquesta
                </span>{' '}
                checkout
              </h1>
              <p className="text-sm sm:text-[15px] text-[#7a8fa8] leading-relaxed max-w-xl mb-0">
                Your model is ready. Finish the payment below and we will send you straight back to the Lab Playground for an instant download.
              </p>

              {/* Order meta */}
              <div className="meta-row">
                <div className="meta-card">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#4a5e78] mb-2 font-bold">Product</p>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-white font-bold text-[15px]">{modelName} delivery bundle</p>
                      <p className="text-xs text-[#5a718a] mt-1">Trained `.pkl` model + matching `.py` and `.ipynb` exports</p>
                    </div>
                    <span
                      className="text-xl font-black shrink-0"
                      style={{ background: 'linear-gradient(135deg,#a78bfa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      ${price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="meta-card">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#4a5e78] mb-2 font-bold">Order ID</p>
                  <p className="text-white font-bold tracking-wider text-[15px]">{orderId}</p>
                  <p className="text-xs text-[#5a718a] mt-1">Linked to your current lab session</p>
                </div>
              </div>

              {/* Delivery info */}
              <div className="delivery-box">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl bg-violet-500/15 border border-violet-400/20 shrink-0">📦</div>
                  <div>
                    <p className="text-white font-bold text-[15px]">What you get after payment</p>
                    <p className="text-xs text-[#5a718a] mt-0.5">Fast, branded, friction-free delivery for all export files</p>
                  </div>
                </div>
                <div className="bundle-row mb-4">
                  <span className="bundle-chip">📦 model.pkl</span>
                  <span className="bundle-chip">🐍 pipeline.py</span>
                  <span className="bundle-chip">📓 pipeline.ipynb</span>
                </div>
                <div className="space-y-3">
                  {trustItems.map((item) => (
                    <div key={item.text} className="flex items-start gap-3 text-sm text-[#c5d4ed]">
                      <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── RIGHT PANEL ── */}
            <section className="glass-panel p-6 sm:p-7">

              {/* ── DETAILS STEP ── */}
              {step === 'details' && (
                <div className="fade-in">
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-violet-400 mb-1.5 font-bold">Payment details</p>
                      <h2 className="text-2xl font-extrabold text-white" style={{ letterSpacing: '-0.025em' }}>Download model + exports</h2>
                      <p className="text-xs text-[#5a718a] mt-1">One-time payment · instant delivery</p>
                    </div>
                    <div className="px-3 py-2 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-300 text-base font-black shrink-0">
                      ${price.toFixed(2)}
                    </div>
                  </div>

                  {/* Method switcher */}
                  <div className="flex gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1.5 mb-6">
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('paypal'); setErrors({}); }}
                      className={`method-btn ${paymentMethod === 'paypal' ? 'active-paypal' : 'inactive'}`}
                    >
                      🅿️ PayPal
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('card'); setErrors({}); }}
                      className={`method-btn ${paymentMethod === 'card' ? 'active-card' : 'inactive'}`}
                    >
                      💳 Card
                    </button>
                    <button
                      type="button"
                      onClick={() => { setPaymentMethod('upi'); setErrors({}); }}
                      className={`method-btn ${paymentMethod === 'upi' ? 'active-upi' : 'inactive'}`}
                    >
                      📱 UPI
                    </button>
                  </div>

                  {paymentMethod === 'paypal' ? (
                    <div className="space-y-4">
                      <Field label="Full name" error={errors.name}>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className={`pay-input${errors.name ? ' has-error' : ''}`}
                        />
                      </Field>

                      <Field label="PayPal email" error={errors.email}>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          type="email"
                          className={`pay-input${errors.email ? ' has-error' : ''}`}
                        />
                      </Field>

                      <div className="paypal-note">
                        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-sky-300 mb-2">PayPal checkout</p>
                        <p className="text-sm text-[#dbeafe] leading-relaxed">
                          Use your PayPal balance or any linked Visa / MasterCard. The payment will appear under the Ownquesta account and return straight back to the lab after confirmation.
                        </p>
                      </div>
                    </div>
                  ) : paymentMethod === 'card' ? (
                    <div className="space-y-4">
                      <Field label="Cardholder name" error={errors.name}>
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className={`pay-input${errors.name ? ' has-error' : ''}`}
                        />
                      </Field>

                      <Field label="Receipt email" error={errors.email}>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          type="email"
                          className={`pay-input${errors.email ? ' has-error' : ''}`}
                        />
                      </Field>

                      <Field label="Card number" error={errors.cardNumber}>
                        <div className="card-wrap">
                          <input
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="0000 0000 0000 0000"
                            className={`pay-input${errors.cardNumber ? ' has-error' : ''}`}
                            style={{ paddingRight: '90px' }}
                          />
                          <div className="card-badges">
                            <span className="cbadge bg-sky-500/10 border border-sky-400/20 text-sky-300">VISA</span>
                            <span className="cbadge bg-orange-500/10 border border-orange-400/20 text-orange-300">MC</span>
                          </div>
                        </div>
                      </Field>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Expiry" error={errors.expiry}>
                          <input
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            className={`pay-input${errors.expiry ? ' has-error' : ''}`}
                          />
                        </Field>
                        <Field label="CVV" error={errors.cvv}>
                          <input
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            type="password"
                            className={`pay-input${errors.cvv ? ' has-error' : ''}`}
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
                          className={`pay-input${errors.name ? ' has-error' : ''}`}
                        />
                      </Field>

                      <Field label="Receipt email" error={errors.email}>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="john@example.com"
                          type="email"
                          className={`pay-input${errors.email ? ' has-error' : ''}`}
                        />
                      </Field>

                      <Field label="UPI ID" error={errors.upiId}>
                        <input
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value.trim())}
                          placeholder="ownquesta@oksbi"
                          className={`pay-input${errors.upiId ? ' has-error' : ''}`}
                        />
                      </Field>

                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4">
                        <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-emerald-400 mb-3">Supported UPI apps</p>
                        <div className="upi-row">
                          {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                            <span key={app} className="upi-chip">{app}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="divider" />
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-[#5a718a]">{modelName} delivery bundle</span>
                    <span className="text-[#c5d4ed] font-semibold">${price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-[#5a718a]">Python script + notebook</span>
                    <span className="text-sky-300 font-semibold">Included</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#5a718a]">Processing & platform fee</span>
                    <span className="text-emerald-400 font-semibold">$0.00</span>
                  </div>
                  <p className="text-[11px] text-[#6d84a3] mt-3 leading-relaxed">
                    The same payment also unlocks the matching <code>.py</code> and <code>.ipynb</code> exports in the Script Editor.
                  </p>

                  {/* Pay button */}
                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className={`pay-btn mt-5 ${paymentMethod === 'paypal' ? 'paypal-pay' : paymentMethod === 'card' ? 'card-pay' : 'upi-pay'}`}
                    style={{ opacity: isSubmitting ? 0.9 : 1 }}
                  >
                    {isSubmitting
                      ? 'Starting secure checkout…'
                      : paymentMethod === 'paypal'
                        ? `Pay $${price.toFixed(2)} with PayPal`
                        : paymentMethod === 'card'
                          ? `Pay $${price.toFixed(2)} by Card`
                          : `Pay $${price.toFixed(2)} with UPI`}
                  </button>

                  {(errors.general || statusNote) && (
                    <p className={`mt-3 text-xs leading-relaxed ${errors.general ? 'text-rose-400' : 'text-sky-300'}`}>
                      {errors.general || statusNote}
                    </p>
                  )}

                  {/* Security */}
                  <div className="sec-row">
                    <span className="sec-item"><span>🔒</span> SSL encrypted</span>
                    <span className="sec-item"><span>✓</span> Secure checkout</span>
                    <span className="sec-item"><span>⚡</span> Instant delivery</span>
                  </div>
                </div>
              )}

              {/* ── PROCESSING STEP ── */}
              {step === 'processing' && (
                <div className="fade-in py-10 text-center">
                  <div className={`spin-ring ${paymentMethod === 'paypal' ? 'paypal-spin' : paymentMethod === 'upi' ? 'upi-spin' : ''}`} />
                  <h3 className="text-xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                    {paymentMethod === 'paypal'
                      ? 'Connecting to PayPal…'
                      : paymentMethod === 'card'
                        ? 'Processing card payment…'
                        : 'Confirming UPI payment…'}
                  </h3>
                  <p className="text-sm text-[#5a718a] leading-relaxed max-w-[280px] mx-auto">
                    {statusNote || 'Please wait while we secure your order, unlock your exports, and prepare the automatic return to the Lab Playground.'}
                  </p>
                  <div className="prog-track mx-auto" style={{ maxWidth: '240px' }}>
                    <div
                      className={`prog-fill ${paymentMethod === 'paypal' ? 'paypal-fill' : paymentMethod === 'upi' ? 'upi-fill' : ''}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#374f66] mt-3 font-semibold">{Math.round(progress)}%</p>
                </div>
              )}

              {/* ── SUCCESS STEP ── */}
              {step === 'success' && (
                <div className="fade-in py-10 text-center">
                  <div className="success-ring">✓</div>
                  <h3 className="text-xl font-extrabold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Payment successful
                  </h3>
                  <p className="text-sm text-[#5a718a] leading-relaxed max-w-[280px] mx-auto">
                    {statusNote || 'Done. Returning you automatically to the Lab Playground to start the download…'}
                  </p>
                  {paidOrderId && (
                    <p className="text-[11px] text-sky-300 mt-3 font-semibold">Order #{paidOrderId}</p>
                  )}
                </div>
              )}

            </section>
          </div>
        </main>
      </div>
    </>
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
      <span className="f-label">{label}</span>
      {children}
      {error && <span className="f-error">⚠ {error}</span>}
    </label>
  );
}