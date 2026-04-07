'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import Logo from '../components/Logo';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  Package,
  ShieldCheck,
  Smartphone,
  Wallet,
  Zap,
  ChevronRight,
  Star,
  Info,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Clock,
  Shield,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────
const DEFAULT_PRICE = 4.99;
const UPI_EXCHANGE_RATE = 83;
const OWNQUESTA_UPI_ID = 'ownquesta@oksbi';
const OWNQUESTA_UPI_NAME = 'Ownquesta';
const UPI_APP_OPTIONS = [
  { key: 'gpay',    short: 'GPay',    label: 'Google Pay', logo: '/upi/gpay.svg',    color: '#4285F4' },
  { key: 'phonepe', short: 'PhonePe', label: 'PhonePe',    logo: '/upi/phonepe.svg', color: '#5F259F' },
  { key: 'paytm',   short: 'Paytm',   label: 'Paytm',      logo: '/upi/paytm.svg',   color: '#00BAF2' },
  { key: 'bhim',    short: 'BHIM',    label: 'BHIM UPI',   logo: '/upi/bhim.svg',    color: '#00866E' },
] as const;

type CheckoutStep = 'details' | 'processing' | 'success';
type PaymentMethod = 'paypal' | 'card' | 'upi';
type UpiAppKey = (typeof UPI_APP_OPTIONS)[number]['key'];

const PAYPAL_AVAILABLE = false;

type RazorpaySuccessPayload = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
type RazorpayCheckoutResponse = {
  orderId: string;
  razorpayKeyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: 'INR';
  upiIntentUrl?: string;
};
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// ─── Reusable sub-components ─────────────────────────────────────────────────

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block group">
      <span className="f-label">{label}</span>
      {hint && <span className="f-hint">{hint}</span>}
      {children}
      {error && (
        <span className="f-error">
          <AlertTriangle size={11} strokeWidth={2.4} />
          {error}
        </span>
      )}
    </label>
  );
}

function StepIndicator({ current }: { current: CheckoutStep }) {
  const steps = [
    { key: 'details',    label: 'Details',    num: 1 },
    { key: 'processing', label: 'Processing', num: 2 },
    { key: 'success',    label: 'Done',       num: 3 },
  ];
  const idx = steps.findIndex(s => s.key === current);
  return (
    <div className="step-track">
      {steps.map((s, i) => (
        <div key={s.key} className={`step-item ${i < idx ? 'done' : i === idx ? 'active' : 'pending'}`}>
          <div className="step-circle">
            {i < idx ? <Check size={11} strokeWidth={3} /> : s.num}
          </div>
          <span className="step-label">{s.label}</span>
          {i < steps.length - 1 && <div className="step-connector" />}
        </div>
      ))}
    </div>
  );
}

function PriceTag({ amount, label }: { amount: string; label?: string }) {
  return (
    <div className="price-tag">
      <span className="price-currency">₹</span>
      <span className="price-amount">{amount}</span>
      {label && <span className="price-label">{label}</span>}
    </div>
  );
}

function TrustBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="trust-badge">
      <span className="trust-icon">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function AnimatedCheck() {
  return (
    <svg className="anim-check" viewBox="0 0 52 52">
      <circle className="check-circle" cx="26" cy="26" r="25" fill="none" />
      <path className="check-path" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function PaymentPage() {
  const router = useRouter();
  const [step, setStep]               = useState<CheckoutStep>('details');
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [cardNumber, setCardNumber]   = useState('');
  const [expiry, setExpiry]           = useState('');
  const [cvv, setCvv]                 = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiAppKey | ''>('');
  const [upiId, setUpiId]             = useState('');
  const [errors, setErrors]           = useState<Record<string, string>>({});
  const [progress, setProgress]       = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNote, setStatusNote]   = useState('');
  const [paidOrderId, setPaidOrderId] = useState('');
  const [copiedUpi, setCopiedUpi]     = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [activeUpiIntentUrl, setActiveUpiIntentUrl] = useState('');
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');
  const [cardFocused, setCardFocused] = useState('');
  const [progressText, setProgressText] = useState('');
  const [qrLoading, setQrLoading]     = useState(false);

  // ── Checkout params
  const checkout = useMemo(() => {
    if (typeof window === 'undefined') return { source: 'lab', sessionId: '', modelName: 'RandomForestClassifier', product: 'trained-model', price: DEFAULT_PRICE };
    const params = new URLSearchParams(window.location.search);
    const parsedPrice = parseFloat(params.get('price') ?? `${DEFAULT_PRICE}`);
    return {
      source:    params.get('source') ?? 'lab',
      sessionId: params.get('session') ?? '',
      modelName: params.get('model') ?? 'RandomForestClassifier',
      product:   params.get('product') ?? 'trained-model',
      price:     isFinite(parsedPrice) ? parsedPrice : DEFAULT_PRICE,
    };
  }, []);

  const { source, sessionId, modelName, product, price } = checkout;
  const returnPath = source === 'script' ? '/lab/script' : '/lab';

  const orderId = useMemo(() => sessionId ? `OQ-${sessionId.slice(0, 8).toUpperCase()}` : 'OQ-INSTANT-DL', [sessionId]);
  const upiApproxAmount = useMemo(() => parseFloat((price * UPI_EXCHANGE_RATE).toFixed(2)), [price]);

  const downloadTarget = product === 'python-script' ? 'py' : product === 'jupyter-notebook' ? 'ipynb' : 'trained-model';
  const exportTypes    = product === 'python-script' ? ['py'] : product === 'jupyter-notebook' ? ['ipynb'] : [];
  const checkoutTitle  = downloadTarget === 'trained-model' ? 'Download trained model' : downloadTarget === 'py' ? 'Download Python script' : 'Download Jupyter notebook';
  const productSummary = downloadTarget === 'trained-model' ? `${modelName} trained model (.pkl)` : downloadTarget === 'py' ? 'Python pipeline export (.py)' : 'Jupyter notebook export (.ipynb)';
  const productDetails = downloadTarget === 'trained-model' ? 'Trained .pkl model only' : downloadTarget === 'py' ? 'Python script file only' : 'Notebook file only';

  const upiPaymentLink = useMemo(() => {
    const p = new URLSearchParams({ pa: OWNQUESTA_UPI_ID, pn: OWNQUESTA_UPI_NAME, tn: `Ownquesta ${orderId}`, tr: orderId, am: upiApproxAmount.toString(), cu: 'INR' });
    return `upi://pay?${p.toString()}`;
  }, [orderId, upiApproxAmount]);

  const selectedUpiAppLabel = useMemo(() => UPI_APP_OPTIONS.find(a => a.key === selectedUpiApp)?.short ?? 'UPI', [selectedUpiApp]);

  // ── Effects
  useEffect(() => { setActiveUpiIntentUrl(upiPaymentLink); }, [upiPaymentLink]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.Razorpay) { setRazorpayReady(true); return; }
    const script = document.createElement('script');
    script.src   = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayReady(true);
    script.onerror = () => setErrors(p => ({ ...p, general: 'Unable to load Razorpay. Please refresh and retry.' }));
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!activeUpiIntentUrl) { setUpiQrDataUrl(''); return; }
    let mounted = true;
    setQrLoading(true);
    QRCode.toDataURL(activeUpiIntentUrl, { width: 240, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#0f172a', light: '#ffffff' } })
      .then(url => { if (mounted) { setUpiQrDataUrl(url); setQrLoading(false); } })
      .catch(() => { if (mounted) { setUpiQrDataUrl(''); setQrLoading(false); } });
    return () => { mounted = false; };
  }, [activeUpiIntentUrl]);

  // ── Simulated progress animation
  useEffect(() => {
    if (step !== 'processing') return;
    const messages = ['Initiating secure connection...', 'Verifying payment signature...', 'Confirming with bank...', 'Unlocking your download...', 'Almost done...'];
    let i = 0;
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 12 + 3, 90));
      if (i < messages.length) { setProgressText(messages[i++]); }
    }, 600);
    return () => clearInterval(interval);
  }, [step]);

  // ── Handlers
  const handleCopyUpi = useCallback(async () => {
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(OWNQUESTA_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  }, []);

  const handleOpenUpiApp = useCallback((link?: string) => {
    window.open(link || activeUpiIntentUrl || upiPaymentLink, '_self');
  }, [activeUpiIntentUrl, upiPaymentLink]);

  const formatCardNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry     = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d; };

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g,'').length < 16) e.cardNumber = 'Enter a valid 16-digit card number.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) e.expiry = 'Use MM/YY format.';
      if (cvv.length < 3) e.cvv = 'Enter a valid CVV.';
    }
    if (paymentMethod === 'upi' && !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) e.upiId = 'Enter a valid UPI ID (e.g. name@okaxis).';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, email, paymentMethod, cardNumber, expiry, cvv, upiId]);

  const completeVerifiedCheckout = async (createdOrderId: string, payload: RazorpaySuccessPayload) => {
    setProgress(85);
    setProgressText('Verifying payment signature...');
    const res  = await fetch('/api/payments/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: createdOrderId, razorpayPaymentId: payload.razorpay_payment_id, razorpayOrderId: payload.razorpay_order_id, razorpaySignature: payload.razorpay_signature }) });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Payment verification failed.');
    setProgress(100);
    setPaidOrderId(createdOrderId);
    setStep('success');
    sessionStorage.setItem('ownquesta_model_payment', JSON.stringify({ paid: true, product, sessionId, modelName, price, paidAt: Date.now(), method: paymentMethod, orderId: createdOrderId, downloadTarget, unlocks: [downloadTarget], gateway: 'razorpay' }));
    sessionStorage.setItem('ownquesta_export_access', JSON.stringify({ paid: true, sessionId, types: exportTypes, downloadTarget, orderId: createdOrderId, grantedAt: Date.now() }));
    setTimeout(() => { const p = new URLSearchParams(); p.set('payment', 'success'); if (sessionId) p.set('session', sessionId); router.push(`${returnPath}?${p.toString()}`); }, 1400);
  };

  const launchRazorpayCheckout = async (payment: RazorpayCheckoutResponse, method: 'upi' | 'card') => {
    if (!window.Razorpay || !razorpayReady) throw new Error('Razorpay is not ready. Please wait a moment and retry.');
    setStep('processing');
    setProgress(15);
    setProgressText(method === 'upi' ? 'Launching secure UPI checkout...' : 'Launching secure card checkout...');
    const rz = new window.Razorpay({
      key: payment.razorpayKeyId, amount: payment.amountPaise, currency: payment.currency,
      name: 'Ownquesta', description: `${productSummary} checkout`, order_id: payment.razorpayOrderId,
      method: { upi: method === 'upi', card: method === 'card', netbanking: false, wallet: false, emi: false, paylater: false },
      prefill: { name, email, vpa: upiId || undefined },
      notes: { ownquestaOrderId: payment.orderId, sessionId, product },
      theme: { color: '#6d28d9' },
      modal: { ondismiss: () => { setStep('details'); setProgress(0); setIsSubmitting(false); setStatusNote('Payment cancelled. You can retry anytime.'); } },
      handler: async (payload: RazorpaySuccessPayload) => {
        try { await completeVerifiedCheckout(payment.orderId, payload); }
        catch (err: any) { setStep('details'); setProgress(0); setErrors(p => ({ ...p, general: err?.message || 'Verification failed. Please try again.' })); }
        finally { setIsSubmitting(false); }
      },
    });
    rz.open();
  };

  const handleCheckout = async () => {
    if (!validate() || isSubmitting) return;
    if (paymentMethod === 'paypal') { setErrors({ general: 'PayPal is coming soon. Please use Card or UPI.' }); return; }
    if (!razorpayReady) { setErrors({ general: 'Payment is still initializing. Please wait a moment.' }); return; }
    setErrors({}); setStatusNote(''); setIsSubmitting(true);
    try {
      const res  = await fetch('/api/payments/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentMethod, name, email, upiId, upiApp: selectedUpiApp || undefined, sessionId, product, modelName, price }) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Unable to start checkout.');
      const pd = data.payment as RazorpayCheckoutResponse;
      if (pd.upiIntentUrl) setActiveUpiIntentUrl(pd.upiIntentUrl);
      await launchRazorpayCheckout(pd, paymentMethod === 'card' ? 'card' : 'upi');
    } catch (err: any) {
      setStep('details'); setProgress(0);
      setErrors(p => ({ ...p, general: err?.message || 'Payment could not be completed. Please try again.' }));
      setIsSubmitting(false);
    }
  };

  const detectorCardType = (n: string): 'visa' | 'mc' | 'amex' | null => {
    const num = n.replace(/\s/g, '');
    if (/^4/.test(num)) return 'visa';
    if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return 'mc';
    if (/^3[47]/.test(num)) return 'amex';
    return null;
  };
  const cardType = detectorCardType(cardNumber);

  // ─── Render
  return (
    <>
      <style>{css}</style>

      <div className="pw-root">
        <div className="pw-bg-mesh" />
        <div className="pw-noise" />

        {/* ── NAV (unchanged as requested) ── */}
        <nav className="pw-nav">
          <div className="pw-nav-inner">
            <Logo href="/home" size="md" />
            <div className="pw-nav-right">
              <span className="pw-status-chip">
                <span className={`pw-dot ${step === 'success' ? 'dot-green' : step === 'processing' ? 'dot-amber' : 'dot-violet'}`} />
                {step === 'details' ? 'Secure checkout' : step === 'processing' ? 'Processing payment' : 'Returning to lab'}
              </span>
              {step === 'details' && (
                <Link href={returnPath} className="pw-back-btn">
                  <ArrowLeft size={14} strokeWidth={2.5} />
                  <span>Back to Lab</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* ── MAIN ── */}
        <main className="pw-main">
          <div className="pw-grid">

            {/* ──── LEFT: Order Summary ──── */}
            <section className="pw-card pw-left">
              <div className="pw-section-label">Order summary</div>
              <h1 className="pw-title">
                Complete your{' '}
                <span className="pw-gradient-text">Ownquesta</span>{' '}
                checkout
              </h1>
              <p className="pw-subtitle">Your model is ready. Complete payment and you'll be redirected instantly for download.</p>

              <StepIndicator current={step} />

              {/* Product card */}
              <div className="pw-product-card">
                <div className="pw-product-icon">
                  <Package size={22} strokeWidth={2} className="text-violet-200" />
                </div>
                <div className="pw-product-info">
                  <p className="pw-product-name">{productSummary}</p>
                  <p className="pw-product-detail">{productDetails}</p>
                  <div className="pw-tags">
                    <span className="pw-tag pw-tag-violet"><Zap size={10} strokeWidth={2.5} /> Instant delivery</span>
                    <span className="pw-tag pw-tag-slate"><Clock size={10} strokeWidth={2.5} /> Session-linked</span>
                  </div>
                </div>
                <PriceTag amount={upiApproxAmount.toFixed(2)} />
              </div>

              {/* Feature list */}
              <div className="pw-features">
                {[
                  { icon: <Zap size={14} strokeWidth={2.4} />, title: 'Instant download', text: 'Your file starts downloading immediately after payment confirmation.' },
                  { icon: <Shield size={14} strokeWidth={2.2} />, title: 'Session-locked', text: 'This unlock is tied only to your current lab session — targeted access only.' },
                  { icon: <Package size={14} strokeWidth={2.2} />, title: 'Separate billing', text: 'Each export type (model, .py, .ipynb) is billed independently.' },
                ].map(f => (
                  <div key={f.title} className="pw-feature-item">
                    <span className="pw-feature-icon">{f.icon}</span>
                    <div>
                      <p className="pw-feature-title">{f.title}</p>
                      <p className="pw-feature-text">{f.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security row */}
              <div className="pw-security-row">
                <TrustBadge icon={<Lock size={12} strokeWidth={2.2} />} text="SSL encrypted" />
                <TrustBadge icon={<ShieldCheck size={12} strokeWidth={2.2} />} text="Razorpay secured" />
                <TrustBadge icon={<Zap size={12} strokeWidth={2.2} />} text="Instant access" />
                <TrustBadge icon={<CheckCircle2 size={12} strokeWidth={2.2} />} text="Verified gateway" />
              </div>
            </section>

            {/* ──── RIGHT: Payment Form ──── */}
            <section className="pw-card pw-right">

              {/* ── DETAILS STEP ── */}
              {step === 'details' && (
                <div className="pw-fade-in">
                  {/* Header */}
                  <div className="pw-form-header">
                    <div>
                      <p className="pw-section-label">Payment details</p>
                      <h2 className="pw-form-title">{checkoutTitle}</h2>
                      <p className="pw-form-subtitle">One-time · no recurring charges</p>
                    </div>
                    <div className="pw-amount-badge">
                      <span className="pw-amount-val">₹{upiApproxAmount.toFixed(2)}</span>
                      <span className="pw-amount-sub">INR · one-time</span>
                    </div>
                  </div>

                  {/* Method selector */}
                  <div className="pw-method-group">
                    <MethodButton active={paymentMethod === 'paypal'} disabled method="paypal"
                      onClick={() => {}} icon={<Wallet size={15} strokeWidth={2.2} />} label="PayPal" badge="Soon" />
                    <MethodButton active={paymentMethod === 'card'} method="card"
                      onClick={() => { setPaymentMethod('card'); setErrors({}); }}
                      icon={<CreditCard size={15} strokeWidth={2.2} />} label="Card" badge="Live" />
                    <MethodButton active={paymentMethod === 'upi'} method="upi"
                      onClick={() => { setPaymentMethod('upi'); setErrors({}); }}
                      icon={<Smartphone size={15} strokeWidth={2.2} />} label="UPI" badge="Live" />
                  </div>

                  {/* ── CARD FORM ── */}
                  {paymentMethod === 'card' && (
                    <div className="pw-fields pw-fade-in">
                      <div className="pw-fields-row">
                        <Field label="Cardholder name" error={errors.name}>
                          <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className={`pw-input${errors.name ? ' pw-input-err' : ''}`} onFocus={() => setCardFocused('name')} onBlur={() => setCardFocused('')} />
                        </Field>
                        <Field label="Email for receipt" error={errors.email}>
                          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" type="email" className={`pw-input${errors.email ? ' pw-input-err' : ''}`} />
                        </Field>
                      </div>

                      <Field label="Card number" error={errors.cardNumber}>
                        <div className="pw-card-wrap">
                          <input value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="0000  0000  0000  0000" className={`pw-input pw-card-input${errors.cardNumber ? ' pw-input-err' : ''}`} onFocus={() => setCardFocused('card')} onBlur={() => setCardFocused('')} />
                          <div className="pw-card-badges">
                            <span className={`pw-card-badge ${cardType === 'visa' ? 'pw-badge-active' : ''}`}>VISA</span>
                            <span className={`pw-card-badge pw-badge-mc ${cardType === 'mc' ? 'pw-badge-active' : ''}`}>MC</span>
                            <span className={`pw-card-badge pw-badge-amex ${cardType === 'amex' ? 'pw-badge-active' : ''}`}>AMEX</span>
                          </div>
                        </div>
                      </Field>

                      <div className="pw-row-2">
                        <Field label="Expiry" error={errors.expiry}>
                          <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM / YY" className={`pw-input${errors.expiry ? ' pw-input-err' : ''}`} />
                        </Field>
                        <Field label="CVV" error={errors.cvv} hint="3–4 digits on back">
                          <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="•••" type="password" className={`pw-input${errors.cvv ? ' pw-input-err' : ''}`} />
                        </Field>
                      </div>

                      <div className="pw-card-note">
                        <Info size={12} strokeWidth={2.2} className="shrink-0 mt-0.5" />
                        <span>Your card is processed securely via Razorpay PCI-DSS Level 1 infrastructure. We never store card data.</span>
                      </div>
                    </div>
                  )}

                  {/* ── UPI FORM ── */}
                  {paymentMethod === 'upi' && (
                    <div className="pw-fields pw-fade-in">
                      <div className="pw-fields-row">
                        <Field label="Full name" error={errors.name}>
                          <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className={`pw-input${errors.name ? ' pw-input-err' : ''}`} />
                        </Field>
                        <Field label="Email for receipt" error={errors.email}>
                          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" type="email" className={`pw-input${errors.email ? ' pw-input-err' : ''}`} />
                        </Field>
                      </div>

                      <Field label="Step 1 — Select your UPI app" error={errors.upiApp}>
                        <div className="pw-upi-apps">
                          {UPI_APP_OPTIONS.map(app => (
                            <button key={app.key} type="button" onClick={() => { setSelectedUpiApp(app.key); setErrors(p => ({...p, upiApp: ''})); }}
                              className={`pw-upi-app-btn${selectedUpiApp === app.key ? ' pw-upi-app-active' : ''}`}>
                              <span className="pw-upi-logo"><img src={app.logo} alt={app.label} width={22} height={22} /></span>
                              <span className="pw-upi-app-name">{app.short}</span>
                              {selectedUpiApp === app.key && <span className="pw-upi-check"><Check size={10} strokeWidth={3} /></span>}
                            </button>
                          ))}
                        </div>
                      </Field>

                      <Field label="Step 2 — Your UPI ID" error={errors.upiId} hint="The payment request will be sent here">
                        <div className="pw-upi-id-wrap">
                          <input value={upiId} onChange={e => setUpiId(e.target.value.trim())} placeholder="yourname@okaxis" className={`pw-input pw-upi-id-input${errors.upiId ? ' pw-input-err' : ''}`} />
                          <span className="pw-upi-at">@</span>
                        </div>
                      </Field>

                      {/* Pay-to box */}
                      <div className="pw-payto-box">
                        <div className="pw-payto-header">
                          <div>
                            <p className="pw-payto-label">Step 3 — Pay to Ownquesta</p>
                            <p className="pw-payto-name">{OWNQUESTA_UPI_NAME}</p>
                            <p className="pw-payto-id">{OWNQUESTA_UPI_ID}</p>
                          </div>
                          <div className="pw-payto-amount">₹{upiApproxAmount.toFixed(2)}</div>
                        </div>

                        <div className="pw-payto-actions">
                          <button type="button" onClick={handleCopyUpi} className="pw-action-btn pw-btn-copy">
                            {copiedUpi ? <><Check size={12} strokeWidth={2.5} /> Copied!</> : <><Copy size={12} strokeWidth={2.2} /> Copy UPI ID</>}
                          </button>
                          <button type="button" onClick={() => handleOpenUpiApp()} className="pw-action-btn pw-btn-open">
                            <ExternalLink size={12} strokeWidth={2.2} />
                            {selectedUpiApp ? `Open ${selectedUpiAppLabel}` : 'Open UPI app'}
                          </button>
                        </div>

                        {/* QR */}
                        <div className="pw-qr-box">
                          <p className="pw-qr-label">Or scan QR with any UPI app</p>
                          <div className="pw-qr-frame">
                            {qrLoading ? (
                              <div className="pw-qr-loading"><RefreshCw size={20} strokeWidth={2} className="pw-spin-icon" /></div>
                            ) : upiQrDataUrl ? (
                              <img src={upiQrDataUrl} alt="UPI QR code" width={200} height={200} className="pw-qr-img" />
                            ) : (
                              <p className="pw-qr-placeholder">Generating QR...</p>
                            )}
                          </div>
                          <div className="pw-qr-brands">
                            {UPI_APP_OPTIONS.map(app => (
                              <span key={`qr-${app.key}`} className="pw-qr-brand">
                                <img src={app.logo} alt={app.label} width={14} height={14} />
                                {app.short}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── PAYPAL ── */}
                  {paymentMethod === 'paypal' && (
                    <div className="pw-paypal-note pw-fade-in">
                      <Wallet size={28} strokeWidth={1.8} className="text-sky-400 mx-auto mb-3" />
                      <p className="pw-paypal-title">PayPal coming soon</p>
                      <p className="pw-paypal-text">PayPal integration is under development. Please use Card or UPI to complete your payment right now.</p>
                    </div>
                  )}

                  {/* ── ORDER SUMMARY ── */}
                  <div className="pw-order-summary">
                    <div className="pw-summary-row">
                      <span>{productSummary}</span>
                      <span>₹{upiApproxAmount.toFixed(2)}</span>
                    </div>
                    <div className="pw-summary-row pw-summary-muted">
                      <span>Other export types</span>
                      <span className="pw-text-amber">Separate charge</span>
                    </div>
                    <div className="pw-summary-row pw-summary-muted">
                      <span>Platform & processing fee</span>
                      <span className="pw-text-green">₹0.00</span>
                    </div>
                    <div className="pw-summary-divider" />
                    <div className="pw-summary-row pw-summary-total">
                      <span>Total due today</span>
                      <span>₹{upiApproxAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* ── PAY BUTTON ── */}
                  <button onClick={handleCheckout} disabled={isSubmitting || paymentMethod === 'paypal'}
                    className={`pw-pay-btn pw-pay-${paymentMethod === 'card' ? 'card' : paymentMethod === 'upi' ? 'upi' : 'paypal'}`}>
                    <span className="pw-pay-shimmer" />
                    {isSubmitting ? (
                      <span className="pw-pay-inner"><span className="pw-mini-spin" /> Starting secure checkout…</span>
                    ) : paymentMethod === 'paypal' ? (
                      <span className="pw-pay-inner"><Wallet size={16} strokeWidth={2.2} /> PayPal — coming soon</span>
                    ) : paymentMethod === 'card' ? (
                      <span className="pw-pay-inner"><CreditCard size={16} strokeWidth={2.2} /> Pay ₹{upiApproxAmount.toFixed(2)} by Card</span>
                    ) : selectedUpiApp ? (
                      <span className="pw-pay-inner"><Smartphone size={16} strokeWidth={2.2} /> Pay ₹{upiApproxAmount.toFixed(2)} with {selectedUpiAppLabel}</span>
                    ) : (
                      <span className="pw-pay-inner"><Smartphone size={16} strokeWidth={2.2} /> Pay ₹{upiApproxAmount.toFixed(2)} via UPI</span>
                    )}
                  </button>

                  {errors.general && (
                    <p className="pw-error-note"><AlertTriangle size={13} strokeWidth={2.2} /> {errors.general}</p>
                  )}
                  {statusNote && !errors.general && (
                    <p className="pw-status-note"><Info size={13} strokeWidth={2.2} /> {statusNote}</p>
                  )}
                  {!razorpayReady && !errors.general && (
                    <p className="pw-loading-note"><RefreshCw size={12} strokeWidth={2.2} className="pw-spin-icon" /> Initializing payment gateway…</p>
                  )}

                  <p className="pw-disclaimer">
                    By paying you agree to Ownquesta's terms. Each download type bills separately. Paying for the model does <strong>not</strong> unlock .py or .ipynb files.
                  </p>
                </div>
              )}

              {/* ── PROCESSING STEP ── */}
              {step === 'processing' && (
                <div className="pw-fade-in pw-processing">
                  <div className={`pw-spinner pw-spinner-${paymentMethod}`}>
                    <div className="pw-spinner-inner" />
                    <div className="pw-spinner-outer" />
                  </div>
                  <h3 className="pw-proc-title">
                    {paymentMethod === 'upi' ? `Confirming ${selectedUpiAppLabel} payment` : 'Processing card payment'}
                  </h3>
                  <p className="pw-proc-text">{progressText || 'Securing your order and preparing your download…'}</p>

                  <div className="pw-progress-wrap">
                    <div className="pw-progress-track">
                      <div className={`pw-progress-fill pw-progress-${paymentMethod}`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className="pw-progress-pct">{Math.round(progress)}%</span>
                  </div>

                  <div className="pw-proc-steps">
                    {['Payment initiated', 'Signature verified', 'Order confirmed', 'Download ready'].map((s, i) => {
                      const done = progress > (i + 1) * 22;
                      return (
                        <div key={s} className={`pw-proc-step ${done ? 'pw-step-done' : ''}`}>
                          <span className="pw-proc-step-icon">{done ? <Check size={10} strokeWidth={3} /> : <span className="pw-step-num">{i+1}</span>}</span>
                          <span>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── SUCCESS STEP ── */}
              {step === 'success' && (
                <div className="pw-fade-in pw-success">
                  <AnimatedCheck />
                  <h3 className="pw-success-title">Payment successful!</h3>
                  <p className="pw-success-text">Your payment has been verified and your download is unlocked. Redirecting you to the lab now…</p>
                  {paidOrderId && <p className="pw-success-order">Order #{paidOrderId}</p>}
                  <div className="pw-success-chips">
                    <span className="pw-success-chip"><Check size={11} strokeWidth={3} /> Payment confirmed</span>
                    <span className="pw-success-chip"><Package size={11} strokeWidth={2.5} /> Download unlocked</span>
                    <span className="pw-success-chip"><Zap size={11} strokeWidth={2.5} /> Returning to lab</span>
                  </div>
                </div>
              )}

            </section>
          </div>
        </main>
      </div>
    </>
  );
}

// ─── MethodButton ────────────────────────────────────────────────────────────
function MethodButton({ active, disabled, method, onClick, icon, label, badge }: {
  active: boolean; disabled?: boolean; method: PaymentMethod;
  onClick: () => void; icon: ReactNode; label: string; badge: string;
}) {
  const colorMap = { paypal: 'pw-method-paypal', card: 'pw-method-card', upi: 'pw-method-upi' };
  return (
    <button type="button" onClick={onClick} disabled={!!disabled}
      className={`pw-method-btn ${active ? colorMap[method] + ' pw-method-active' : 'pw-method-inactive'} ${disabled ? 'pw-method-disabled' : ''}`}>
      {icon}
      <span>{label}</span>
      <span className={`pw-method-badge ${badge === 'Live' ? 'pw-badge-live' : 'pw-badge-soon'}`}>{badge}</span>
    </button>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

.pw-root { min-height: 100vh; background: #060711; font-family: 'DM Sans', sans-serif; color: #e2e8f0; position: relative; overflow-x: hidden; }

/* Background */
.pw-bg-mesh { position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse 900px 700px at 20% 10%, rgba(109,40,217,0.14) 0%, transparent 60%),
              radial-gradient(ellipse 700px 600px at 80% 80%, rgba(14,165,233,0.09) 0%, transparent 60%),
              radial-gradient(ellipse 500px 400px at 60% 30%, rgba(167,139,250,0.07) 0%, transparent 60%);
}
.pw-noise { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.022;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* NAV */
.pw-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 0 1.5rem; height: 64px; display: flex; align-items: center;
  background: rgba(6,7,17,0.82); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.055); }
.pw-nav-inner { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.pw-nav-right { display: flex; align-items: center; gap: 12px; }
.pw-status-chip { display: inline-flex; align-items: center; gap: 7px; padding: 5px 14px; border-radius: 100px;
  font-size: 12px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #94a3b8; }
.pw-dot { width: 7px; height: 7px; border-radius: 50%; animation: dotPulse 2s ease-in-out infinite; }
.dot-violet { background: #8b5cf6; box-shadow: 0 0 6px #8b5cf6; }
.dot-amber  { background: #f59e0b; box-shadow: 0 0 6px #f59e0b; }
.dot-green  { background: #10b981; box-shadow: 0 0 6px #10b981; }
@keyframes dotPulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
.pw-back-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
  border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #94a3b8; text-decoration: none; transition: all 0.18s ease; }
.pw-back-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; border-color: rgba(255,255,255,0.18); }

/* MAIN */
.pw-main { position: relative; z-index: 10; padding: 88px 1.5rem 4rem; max-width: 1380px; margin: 0 auto; }
.pw-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
@media (min-width: 1100px) { .pw-grid { grid-template-columns: 1.1fr 0.9fr; align-items: start; } }

/* CARD */
.pw-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.075); border-radius: 24px;
  backdrop-filter: blur(20px); padding: 2rem; position: relative; overflow: hidden; }
.pw-card::before { content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent); }
@media (min-width: 1100px) { .pw-right { position: sticky; top: 80px; } }

/* SECTION LABEL */
.pw-section-label { font-family: 'Syne', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #6d28d9; margin-bottom: 10px; }

/* TITLE */
.pw-title { font-family: 'Syne', sans-serif; font-size: clamp(26px, 4vw, 38px); font-weight: 800; color: #f1f5f9; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 10px; }
.pw-gradient-text { background: linear-gradient(135deg, #a78bfa, #818cf8, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.pw-subtitle { font-size: 14px; color: #64748b; line-height: 1.6; max-width: 500px; margin-bottom: 24px; }

/* STEP INDICATOR */
.step-track { display: flex; align-items: center; gap: 0; margin-bottom: 28px; }
.step-item { display: flex; align-items: center; gap: 8px; position: relative; }
.step-circle { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; transition: all 0.3s ease; }
.step-item.done .step-circle   { background: #10b981; border: 2px solid #10b981; color: #fff; }
.step-item.active .step-circle { background: rgba(109,40,217,0.25); border: 2px solid #7c3aed; color: #a78bfa; }
.step-item.pending .step-circle{ background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.1); color: #475569; }
.step-label { font-size: 11px; font-weight: 600; white-space: nowrap; }
.step-item.done .step-label   { color: #10b981; }
.step-item.active .step-label { color: #a78bfa; }
.step-item.pending .step-label{ color: #475569; }
.step-connector { width: 40px; height: 1.5px; background: rgba(255,255,255,0.08); margin: 0 6px; }

/* PRODUCT CARD */
.pw-product-card { display: flex; align-items: flex-start; gap: 16px; background: rgba(109,40,217,0.08); border: 1px solid rgba(109,40,217,0.2); border-radius: 18px; padding: 18px; margin-bottom: 20px; }
.pw-product-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(109,40,217,0.15); border: 1px solid rgba(109,40,217,0.25); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.pw-product-info { flex: 1; min-width: 0; }
.pw-product-name { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #f1f5f9; margin-bottom: 3px; }
.pw-product-detail { font-size: 12px; color: #64748b; margin-bottom: 8px; }
.pw-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.pw-tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; }
.pw-tag-violet { background: rgba(109,40,217,0.18); border: 1px solid rgba(139,92,246,0.3); color: #c4b5fd; }
.pw-tag-slate  { background: rgba(71,85,105,0.25); border: 1px solid rgba(100,116,139,0.25); color: #94a3b8; }

/* PRICE TAG */
.price-tag { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; flex-shrink: 0; }
.price-currency { font-size: 12px; color: #a78bfa; font-weight: 700; line-height: 1; }
.price-amount { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.03em; line-height: 1; }
.price-label { font-size: 10px; color: #64748b; font-weight: 500; }

/* FEATURES */
.pw-features { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.pw-feature-item { display: flex; align-items: flex-start; gap: 12px; }
.pw-feature-icon { width: 30px; height: 30px; border-radius: 9px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #94a3b8; }
.pw-feature-title { font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 2px; }
.pw-feature-text { font-size: 12px; color: #475569; line-height: 1.5; }

/* SECURITY ROW */
.pw-security-row { display: flex; flex-wrap: wrap; gap: 8px; }
.trust-badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 100px; font-size: 11px; font-weight: 500; color: #475569; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.03); }
.trust-icon { color: #334155; }

/* FORM HEADER */
.pw-form-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
.pw-form-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.025em; margin-bottom: 3px; }
.pw-form-subtitle { font-size: 12px; color: #475569; }
.pw-amount-badge { text-align: right; padding: 10px 14px; border-radius: 14px; border: 1px solid rgba(16,185,129,0.25); background: rgba(16,185,129,0.07); flex-shrink: 0; }
.pw-amount-val { display: block; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #6ee7b7; line-height: 1; }
.pw-amount-sub { display: block; font-size: 10px; color: #34d399; font-weight: 600; margin-top: 3px; letter-spacing: 0.05em; }

/* METHOD GROUP */
.pw-method-group { display: flex; gap: 8px; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 6px; margin-bottom: 20px; }
.pw-method-btn { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 6px; border: none; border-radius: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; transition: all 0.2s cubic-bezier(0.34,1.1,0.64,1); position: relative; }
.pw-method-inactive { background: transparent; color: #475569; }
.pw-method-inactive:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
.pw-method-active  { }
.pw-method-paypal.pw-method-active { background: rgba(56,189,248,0.12); color: #7dd3fc; box-shadow: 0 2px 12px rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.25); }
.pw-method-card.pw-method-active   { background: rgba(109,40,217,0.18); color: #c4b5fd; box-shadow: 0 2px 12px rgba(109,40,217,0.25); border: 1px solid rgba(139,92,246,0.35); }
.pw-method-upi.pw-method-active    { background: rgba(16,185,129,0.14); color: #6ee7b7; box-shadow: 0 2px 12px rgba(16,185,129,0.2); border: 1px solid rgba(52,211,153,0.3); }
.pw-method-disabled { opacity: 0.45; cursor: not-allowed !important; }
.pw-method-badge { font-size: 9px; font-weight: 800; letter-spacing: 0.1em; padding: 2px 7px; border-radius: 100px; }
.pw-badge-live { background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(52,211,153,0.3); }
.pw-badge-soon { background: rgba(245,158,11,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.25); }

/* FIELDS */
.pw-fields { display: flex; flex-direction: column; gap: 14px; margin-bottom: 18px; }
.pw-fields-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 480px) { .pw-fields-row { grid-template-columns: 1fr; } }
.pw-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.f-label { display: block; font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #475569; margin-bottom: 6px; }
.f-hint { display: block; font-size: 10px; color: #334155; margin-bottom: 5px; margin-top: -3px; }
.f-error { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #f87171; margin-top: 5px; font-weight: 500; }

/* INPUT */
.pw-input { width: 100%; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px;
  padding: 12px 14px; font-size: 14px; font-weight: 400; color: #e2e8f0; outline: none; transition: all 0.18s ease;
  font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
.pw-input::placeholder { color: #334155; }
.pw-input:focus { border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.05); box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
.pw-input-err { border-color: rgba(248,113,113,0.5) !important; }
.pw-input-err:focus { box-shadow: 0 0 0 3px rgba(248,113,113,0.1) !important; }

/* CARD */
.pw-card-wrap { position: relative; }
.pw-card-input { padding-right: 110px !important; }
.pw-card-badges { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); display: flex; gap: 4px; }
.pw-card-badge { font-size: 8px; font-weight: 800; padding: 3px 6px; border-radius: 5px; background: rgba(255,255,255,0.04); color: #475569; border: 1px solid rgba(255,255,255,0.08); transition: all 0.2s; }
.pw-badge-active { background: rgba(255,255,255,0.1) !important; color: #cbd5e1 !important; border-color: rgba(255,255,255,0.18) !important; }
.pw-badge-mc   { }
.pw-badge-amex { }
.pw-card-note { display: flex; align-items: flex-start; gap: 7px; font-size: 11px; color: #334155; background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 10px 12px; line-height: 1.5; }

/* UPI APPS */
.pw-upi-apps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 6px; }
@media (max-width: 380px) { .pw-upi-apps { grid-template-columns: repeat(2, 1fr); } }
.pw-upi-app-btn { position: relative; border: 1.5px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 10px 8px; background: rgba(255,255,255,0.03); cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; }
.pw-upi-app-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.15); }
.pw-upi-app-active { border-color: rgba(52,211,153,0.45) !important; background: rgba(16,185,129,0.1) !important; }
.pw-upi-logo { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; overflow: hidden; }
.pw-upi-app-name { font-size: 11px; font-weight: 700; color: #94a3b8; }
.pw-upi-check { position: absolute; top: 5px; right: 5px; width: 16px; height: 16px; border-radius: 50%; background: #10b981; display: flex; align-items: center; justify-content: center; color: #fff; }

/* UPI ID */
.pw-upi-id-wrap { position: relative; }
.pw-upi-id-input { padding-left: 34px !important; }
.pw-upi-at { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #475569; font-weight: 600; pointer-events: none; }

/* PAY-TO BOX */
.pw-payto-box { background: rgba(16,185,129,0.05); border: 1px solid rgba(52,211,153,0.2); border-radius: 16px; padding: 16px; }
.pw-payto-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.pw-payto-label { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #10b981; margin-bottom: 5px; }
.pw-payto-name { font-size: 14px; font-weight: 700; color: #f1f5f9; margin-bottom: 3px; }
.pw-payto-id { font-size: 12px; color: #34d399; font-family: monospace; letter-spacing: 0.05em; }
.pw-payto-amount { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #6ee7b7; white-space: nowrap; flex-shrink: 0; }
.pw-payto-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
.pw-action-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 600; border: none; cursor: pointer; transition: all 0.18s ease; font-family: 'DM Sans', sans-serif; }
.pw-btn-copy { background: rgba(16,185,129,0.12); border: 1px solid rgba(52,211,153,0.25); color: #6ee7b7; }
.pw-btn-copy:hover { background: rgba(16,185,129,0.2); }
.pw-btn-open { background: rgba(14,165,233,0.1); border: 1px solid rgba(56,189,248,0.25); color: #7dd3fc; }
.pw-btn-open:hover { background: rgba(14,165,233,0.18); }

/* QR */
.pw-qr-box { background: rgba(14,165,233,0.04); border: 1px solid rgba(56,189,248,0.18); border-radius: 14px; padding: 14px; }
.pw-qr-label { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #38bdf8; margin-bottom: 4px; }
.pw-qr-frame { width: 200px; height: 200px; background: #fff; border-radius: 14px; margin: 10px 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.pw-qr-img { display: block; width: 100%; height: 100%; object-fit: contain; }
.pw-qr-loading { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
.pw-qr-placeholder { font-size: 12px; color: #475569; }
.pw-qr-brands { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.pw-qr-brand { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; background: rgba(14,165,233,0.07); border: 1px solid rgba(56,189,248,0.18); color: #93c5fd; }

/* PAYPAL NOTE */
.pw-paypal-note { text-align: center; padding: 32px 20px; margin-bottom: 16px; }
.pw-paypal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #94a3b8; margin-bottom: 8px; }
.pw-paypal-text { font-size: 13px; color: #475569; line-height: 1.6; max-width: 320px; margin: 0 auto; }

/* ORDER SUMMARY */
.pw-order-summary { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 14px 16px; margin-bottom: 16px; }
.pw-summary-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #94a3b8; margin-bottom: 6px; }
.pw-summary-muted span:first-child { color: #475569; }
.pw-summary-total { font-weight: 700; color: #f1f5f9; font-size: 14px; margin-bottom: 0; }
.pw-summary-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 8px 0; }
.pw-text-amber { color: #fbbf24; font-weight: 600; }
.pw-text-green { color: #34d399; font-weight: 600; }

/* PAY BUTTON */
.pw-pay-btn { width: 100%; padding: 16px 20px; border: none; cursor: pointer; border-radius: 16px; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; color: #fff; transition: all 0.22s cubic-bezier(0.34,1.1,0.64,1); position: relative; overflow: hidden; letter-spacing: -0.01em; }
.pw-pay-btn:hover:not(:disabled) { transform: translateY(-2px); }
.pw-pay-btn:active:not(:disabled) { transform: translateY(0) scale(0.99); }
.pw-pay-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.pw-pay-upi  { background: linear-gradient(135deg, #065f46, #059669 40%, #10b981 75%, #34d399); box-shadow: 0 8px 32px rgba(16,185,129,0.35); }
.pw-pay-upi:hover:not(:disabled) { box-shadow: 0 14px 44px rgba(16,185,129,0.5); }
.pw-pay-card { background: linear-gradient(135deg, #4c1d95, #7c3aed 45%, #8b5cf6 75%, #a78bfa); box-shadow: 0 8px 32px rgba(109,40,217,0.45); }
.pw-pay-card:hover:not(:disabled) { box-shadow: 0 14px 44px rgba(109,40,217,0.6); }
.pw-pay-paypal { background: linear-gradient(135deg, #1e3a5f, #2563eb 45%, #0ea5e9); box-shadow: 0 8px 32px rgba(37,99,235,0.3); }
.pw-pay-inner { display: inline-flex; align-items: center; justify-content: center; gap: 8px; position: relative; z-index: 1; }
.pw-pay-shimmer { position: absolute; inset: 0; background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%);
  transform: translateX(-120%); transition: transform 0.55s ease; }
.pw-pay-btn:hover .pw-pay-shimmer { transform: translateX(120%); }
.pw-mini-spin { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
.pw-error-note  { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: #f87171; margin-top: 10px; line-height: 1.5; }
.pw-status-note { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: #7dd3fc; margin-top: 10px; line-height: 1.5; }
.pw-loading-note{ display: flex; align-items: center; gap: 6px; font-size: 11px; color: #475569; margin-top: 8px; }
.pw-disclaimer { font-size: 11px; color: #334155; line-height: 1.6; margin-top: 14px; }
.pw-disclaimer strong { color: #475569; }

/* PROCESSING */
.pw-processing { padding: 2rem 1rem; text-align: center; }
.pw-spinner { width: 72px; height: 72px; position: relative; margin: 0 auto 24px; }
.pw-spinner-outer { position: absolute; inset: 0; border-radius: 50%; border: 2px solid rgba(255,255,255,0.05); }
.pw-spinner-inner { position: absolute; inset: 4px; border-radius: 50%; border: 2.5px solid transparent; animation: spin 0.9s linear infinite; }
.pw-spinner-upi .pw-spinner-inner   { border-top-color: #10b981; box-shadow: 0 0 16px rgba(16,185,129,0.3); }
.pw-spinner-card .pw-spinner-inner  { border-top-color: #8b5cf6; box-shadow: 0 0 16px rgba(139,92,246,0.3); }
.pw-spinner-paypal .pw-spinner-inner{ border-top-color: #38bdf8; box-shadow: 0 0 16px rgba(56,189,248,0.3); }
.pw-proc-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.02em; margin-bottom: 8px; }
.pw-proc-text { font-size: 13px; color: #475569; max-width: 280px; margin: 0 auto 20px; line-height: 1.6; min-height: 40px; transition: opacity 0.3s; }
.pw-progress-wrap { display: flex; align-items: center; gap: 10px; max-width: 280px; margin: 0 auto 20px; }
.pw-progress-track { flex: 1; height: 5px; border-radius: 100px; background: rgba(255,255,255,0.07); overflow: hidden; }
.pw-progress-fill { height: 100%; border-radius: 100px; transition: width 0.3s ease; background-size: 200%; animation: shimmerFill 2s linear infinite; }
.pw-progress-upi    { background: linear-gradient(90deg, #059669, #10b981, #34d399); }
.pw-progress-card   { background: linear-gradient(90deg, #6d28d9, #8b5cf6, #a78bfa); }
.pw-progress-paypal { background: linear-gradient(90deg, #1d4ed8, #3b82f6, #7dd3fc); }
@keyframes shimmerFill { from{background-position:200% center;} to{background-position:-200% center;} }
.pw-progress-pct { font-size: 12px; font-weight: 700; color: #64748b; min-width: 32px; text-align: right; }
.pw-proc-steps { display: flex; flex-direction: column; gap: 8px; max-width: 260px; margin: 0 auto; text-align: left; }
.pw-proc-step { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #334155; transition: color 0.3s; }
.pw-step-done { color: #10b981 !important; }
.pw-proc-step-icon { width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 10px; font-weight: 700; color: #475569; transition: all 0.3s; }
.pw-step-done .pw-proc-step-icon { background: #10b981; border-color: #10b981; color: #fff; }
.pw-step-num { font-size: 10px; }

/* SUCCESS */
.pw-success { padding: 2rem 1rem; text-align: center; }
.anim-check { width: 72px; height: 72px; margin: 0 auto 20px; }
.check-circle { stroke: #10b981; stroke-width: 2; stroke-dasharray: 166; stroke-dashoffset: 166; stroke-linecap: round; animation: strokeCircle 0.8s cubic-bezier(0.65,0,0.45,1) forwards; }
.check-path { stroke: #10b981; stroke-width: 3.5; stroke-dasharray: 48; stroke-dashoffset: 48; stroke-linecap: round; stroke-linejoin: round; animation: strokeCheck 0.5s 0.7s cubic-bezier(0.65,0,0.45,1) forwards; }
@keyframes strokeCircle { to { stroke-dashoffset: 0; } }
@keyframes strokeCheck  { to { stroke-dashoffset: 0; } }
.pw-success-title { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800; color: #f1f5f9; letter-spacing: -0.025em; margin-bottom: 10px; }
.pw-success-text { font-size: 13px; color: #475569; max-width: 280px; margin: 0 auto 12px; line-height: 1.6; }
.pw-success-order { font-size: 12px; color: #38bdf8; font-weight: 600; margin-bottom: 16px; font-family: monospace; }
.pw-success-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.pw-success-chip { display: inline-flex; align-items: center; gap: 5px; padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 700; background: rgba(16,185,129,0.1); border: 1px solid rgba(52,211,153,0.25); color: #6ee7b7; animation: chipPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
.pw-success-chip:nth-child(2) { animation-delay: 0.1s; }
.pw-success-chip:nth-child(3) { animation-delay: 0.2s; }
@keyframes chipPop { from{transform:scale(0.6);opacity:0;} to{transform:scale(1);opacity:1;} }

/* FADE IN */
.pw-fade-in { animation: fadeSlide 0.32s cubic-bezier(0.22,1,0.36,1) both; }
@keyframes fadeSlide { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }

/* SPIN / misc */
@keyframes spin { to { transform: rotate(360deg); } }
.pw-spin-icon { animation: spin 1.2s linear infinite; }
`;