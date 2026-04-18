'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, ArrowLeft, Check, CheckCircle2, Clock, Copy,
  CreditCard, Lock, Rocket, Shield, Smartphone, Sparkles, Star,
  Wallet, Zap,
} from 'lucide-react';
import QRCode from 'qrcode';
import Logo from '../components/Logo';
import { getCurrentUser, submitSubscription } from '@/services/api';

// ── Constants ──────────────────────────────────────────────────────────────
const UPI_ID   = '8460110210@ptyes';
const UPI_NAME = 'Ownquesta';

const PLANS = [
  {
    id: 'plan_750' as const,
    price: 750,
    label: '₹750 / month',
    badge: 'Starter',
    color: '#60a5fa',
    border: 'rgba(96,165,250,0.45)',
    bg: 'rgba(96,165,250,0.08)',
    features: [
      'All GPT models (GPT-4, GPT-4o Mini, GPT 5.3, Codex 5.2)',
      'Claude Haiku 4.5',
      'Unlimited AutoML sessions',
      'Priority model queue',
    ],
    locked: ['Claude Sonnet 4.6', 'Claude Opus 4.6'],
  },
  {
    id: 'plan_1399' as const,
    price: 1399,
    label: '₹1,399 / month',
    badge: 'Pro',
    color: '#c084fc',
    border: 'rgba(192,132,252,0.55)',
    bg: 'rgba(192,132,252,0.08)',
    recommended: true,
    features: [
      'All GPT models (GPT-4, GPT-4o Mini, GPT 5.3, Codex 5.2)',
      'Claude Haiku 4.5',
      'Claude Sonnet 4.6',
      'Claude Opus 4.6',
      'Unlimited AutoML sessions',
      'Priority model queue',
      'Early access to new models',
    ],
    locked: [],
  },
] as const;

type PlanId = 'plan_750' | 'plan_1399';

// ── Component ──────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('plan_1399');
  const [step, setStep] = useState<'plans' | 'payment' | 'pending'>('plans');

  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [txId, setTxId]   = useState('');
  const [payDate, setPayDate] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const [qrUrl, setQrUrl]       = useState('');
  const [copied, setCopied]     = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [message, setMessage]   = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('');

  const plan = PLANS.find(p => p.id === selectedPlan)!;

  // Load current user
  useEffect(() => {
    getCurrentUser()
      .then((data: any) => {
        if (!data?.user) return;
        setName(data.user.name || '');
        setEmail(data.user.email || '');
        const status = String(data.user.membershipStatus || '').toLowerCase();
        setIsPremium(status === 'ownque_user');
        setCurrentPlan(data.user.membershipPlan || '');
      })
      .catch(() => {});
  }, []);

  // Build UPI link
  const upiLink = useMemo(() => {
    const p = new URLSearchParams({ pa: UPI_ID, pn: UPI_NAME, am: plan.price.toString(), cu: 'INR', tn: 'OwnQuesta Premium' });
    return `upi://pay?${p.toString()}`;
  }, [plan.price]);

  // Generate QR
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(upiLink, { width: 800, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#000', light: '#fff' } })
      .then(url => { if (active) setQrUrl(url); })
      .catch(() => {});
    return () => { active = false; };
  }, [upiLink]);

  const maxDate = useMemo(() => {
    const now = new Date();
    const pad = (v: number) => String(v).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }, []);

  const copyUpi = async () => {
    await navigator.clipboard.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const fileToDataUrl = (file: File) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(typeof r.result === 'string' ? r.result : '');
      r.onerror = () => rej(new Error('Cannot read file'));
      r.readAsDataURL(file);
    });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required.';
    if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) e.upiId = 'Valid UPI ID required (e.g. name@okaxis).';
    if (txId.trim().length < 6) e.txId = 'Enter a valid transaction ID (min 6 chars).';
    if (!payDate) e.payDate = 'Select payment date & time.';
    if (!screenshot) e.screenshot = 'Upload your payment screenshot.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setProcessing(true);
    setMessage('');
    try {
      const dataUrl = screenshot ? await fileToDataUrl(screenshot) : '';
      await submitSubscription({
        planType: selectedPlan,
        customerName: name.trim(),
        customerEmail: email.trim(),
        transactionId: txId.trim(),
        payerUpiId: upiId.trim(),
        paymentTime: payDate,
        paymentScreenshot: screenshot
          ? { fileName: screenshot.name, mimeType: screenshot.type || 'image/png', dataUrl }
          : undefined,
      });
      setStep('pending');
    } catch (err: any) {
      setMessage(err?.message || 'Submission failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0b0616', color: '#f3e8ff', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, borderBottom: '1px solid rgba(216,180,254,0.2)', background: 'rgba(17,7,34,0.92)', backdropFilter: 'blur(14px)' }}>
        <div style={{ maxWidth: 1060, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo href="/home" size="md" />
          <button onClick={() => router.back()} style={{ border: '1px solid rgba(216,180,254,0.35)', background: 'rgba(30,13,56,0.72)', color: '#f5d0fe', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 20px 80px', width: '100%' }}>

        {/* Already premium banner */}
        {isPremium && (
          <div style={{ marginBottom: 24, border: '1px solid rgba(74,222,128,0.4)', borderRadius: 14, padding: '14px 18px', background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <CheckCircle2 size={16} color="#4ade80" />
            <span style={{ color: '#86efac' }}>Your account is already premium ({currentPlan || 'active'}). You have full model access.</span>
          </div>
        )}

        {/* Step: Plan Selection */}
        {step === 'plans' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid rgba(192,132,252,0.45)', background: 'rgba(192,132,252,0.1)', borderRadius: 999, padding: '6px 16px', fontSize: 13, color: '#d8b4fe', marginBottom: 18 }}>
                <Sparkles size={14} /> Premium Subscription
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, background: 'linear-gradient(135deg, #f5d0fe 0%, #a78bfa 50%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Unlock Advanced AI Models
              </h1>
              <p style={{ marginTop: 12, color: '#c4b5fd', fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: '12px auto 0' }}>
                Choose a plan to access premium Claude and GPT models inside OwnQuesta AutoML Playground.
              </p>
            </div>

            {/* Plan cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
              {PLANS.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  style={{ border: `2px solid ${selectedPlan === p.id ? p.border : 'rgba(255,255,255,0.1)'}`, borderRadius: 18, padding: '24px 22px', background: selectedPlan === p.id ? p.bg : 'rgba(255,255,255,0.03)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}
                >
                  {'recommended' in p && p.recommended && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #a78bfa, #818cf8)', borderRadius: 999, padding: '3px 14px', fontSize: 11, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                      ⭐ Recommended
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: `rgba(${p.color === '#60a5fa' ? '96,165,250' : '192,132,252'},0.15)`, border: `1px solid ${p.border}`, color: p.color }}>{p.badge}</span>
                    {selectedPlan === p.id && <Check size={18} color={p.color} />}
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: p.color, marginBottom: 4 }}>{p.label}</div>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {p.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#e9d5ff' }}>
                        <Check size={13} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                      </div>
                    ))}
                    {p.locked.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#475569' }}>
                        <Lock size={13} style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Razorpay coming soon note */}
            <div style={{ border: '1px solid rgba(251,191,36,0.3)', borderRadius: 12, padding: '12px 16px', background: 'rgba(251,191,36,0.06)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#fde68a', marginBottom: 24 }}>
              <CreditCard size={15} />
              <span><strong>Razorpay / Stripe</strong> — Automated payment gateway coming soon. Currently we verify UPI payments manually.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => setStep('payment')} style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.8), rgba(109,40,217,0.8))', border: '1px solid rgba(192,132,252,0.5)', color: '#f5d0fe', borderRadius: 12, padding: '14px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Rocket size={16} /> Continue with {plan.label}
              </button>
            </div>
          </>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <button onClick={() => setStep('plans')} style={{ background: 'none', border: 'none', color: '#c4b5fd', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 20, padding: 0 }}>
              <ArrowLeft size={14} /> Back to plans
            </button>

            <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 800 }}>Complete Payment</h2>
            <p style={{ margin: '0 0 24px', color: '#c4b5fd', fontSize: 14 }}>Pay via UPI and upload your screenshot for verification.</p>

            {/* Plan summary */}
            <div style={{ border: `1px solid ${plan.border}`, borderRadius: 14, padding: '14px 18px', background: plan.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{plan.badge} Plan</div>
                <div style={{ fontSize: 12, color: '#c4b5fd', marginTop: 2 }}>30 days access · Manual verification</div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: plan.color }}>{plan.label}</div>
            </div>

            {/* QR + UPI */}
            <div style={{ border: '1px solid rgba(192,132,252,0.3)', borderRadius: 14, padding: '18px', background: 'rgba(59,7,100,0.2)', marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#c4b5fd', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pay to OwnQuesta</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{UPI_NAME}</div>
                <div style={{ fontSize: 13, color: '#d8b4fe', marginTop: 2 }}>{UPI_ID}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: plan.color, marginTop: 8 }}>₹{plan.price}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button onClick={() => void copyUpi()} style={{ border: '1px solid rgba(192,132,252,0.4)', background: 'rgba(192,132,252,0.1)', color: '#f5d0fe', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Copy size={12} /> {copied ? 'Copied!' : 'Copy UPI ID'}
                  </button>
                  <button onClick={() => window.open(upiLink, '_self')} style={{ border: '1px solid rgba(192,132,252,0.4)', background: 'rgba(192,132,252,0.1)', color: '#f5d0fe', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Smartphone size={12} /> Open UPI App
                  </button>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 12, padding: 8 }}>
                {qrUrl ? (
                  <img src={qrUrl} alt="UPI QR" style={{ width: 160, height: 160, display: 'block' }} />
                ) : (
                  <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888' }}>Generating…</div>
                )}
              </div>
            </div>

            {/* Form fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Full name" error={errors.name}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
              </Field>
              <Field label="Email address" error={errors.email}>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={inputStyle} />
              </Field>
              <Field label="Your UPI ID" error={errors.upiId}>
                <input value={upiId} onChange={e => setUpiId(e.target.value.trim())} placeholder="yourname@okaxis" style={inputStyle} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label="Transaction ID" error={errors.txId}>
                  <input value={txId} onChange={e => setTxId(e.target.value.trim())} placeholder="e.g. 413245678901" style={inputStyle} />
                </Field>
                <Field label="Payment date & time" error={errors.payDate}>
                  <input type="datetime-local" value={payDate} max={maxDate} onChange={e => setPayDate(e.target.value)} style={inputStyle} />
                </Field>
              </div>
              <Field label="Payment screenshot" error={errors.screenshot}>
                <input
                  type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setScreenshot(e.target.files?.[0] ?? null)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                />
                {screenshot && <div style={{ marginTop: 4, fontSize: 12, color: '#86efac' }}>✓ {screenshot.name}</div>}
              </Field>
            </div>

            {message && (
              <div style={{ marginTop: 16, border: '1px solid rgba(252,165,165,0.4)', borderRadius: 10, padding: '10px 14px', background: 'rgba(220,38,38,0.1)', fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} /> {message}
              </div>
            )}

            <div style={{ marginTop: 20, border: '1px solid rgba(251,191,36,0.3)', borderRadius: 10, padding: '10px 14px', background: 'rgba(251,191,36,0.07)', fontSize: 13, color: '#fde68a' }}>
              After submitting, wait 3–4 hours for admin verification. Your model access will be activated once approved.
            </div>

            <button
              onClick={() => void handleSubmit()}
              disabled={processing}
              style={{ marginTop: 20, width: '100%', background: processing ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(109,40,217,0.9))', border: '1px solid rgba(192,132,252,0.5)', color: '#f5d0fe', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {processing ? 'Submitting…' : <><Shield size={16} /> Submit Payment for Verification</>}
            </button>
          </div>
        )}

        {/* Step: Pending */}
        {step === 'pending' && (
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Clock size={32} color="#fbbf24" />
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: 28, fontWeight: 800 }}>Payment Submitted!</h2>
            <p style={{ color: '#c4b5fd', fontSize: 15, lineHeight: 1.7, margin: '0 0 32px' }}>
              Your payment is under review. Our team will verify your screenshot within <strong style={{ color: '#fde68a' }}>3–4 hours</strong>. Once approved, your premium model access will be activated automatically.
            </p>
            <div style={{ border: '1px solid rgba(251,191,36,0.3)', borderRadius: 14, padding: '18px 20px', background: 'rgba(251,191,36,0.06)', textAlign: 'left', marginBottom: 28 }}>
              {[
                { icon: <CheckCircle2 size={15} color="#4ade80" />, text: 'Payment screenshot received' },
                { icon: <CheckCircle2 size={15} color="#4ade80" />, text: 'Transaction ID recorded' },
                { icon: <Clock size={15} color="#fbbf24" />, text: 'Awaiting admin verification (3–4 hours)' },
                { icon: <Lock size={15} color="#475569" />, text: 'Premium model access (after approval)' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e9d5ff', padding: '6px 0' }}>
                  {item.icon} {item.text}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => router.push('/automl')} style={{ border: '1px solid rgba(192,132,252,0.4)', background: 'rgba(192,132,252,0.12)', color: '#f5d0fe', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Rocket size={14} /> Go to AutoML
              </button>
              <button onClick={() => router.push('/help')} style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#c4b5fd', borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(30,13,56,0.7)', border: '1px solid rgba(216,180,254,0.25)', borderRadius: 10,
  padding: '10px 14px', color: '#f3e8ff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#d8b4fe', marginBottom: 6 }}>{label}</div>
      {children}
      {error && (
        <div style={{ marginTop: 5, fontSize: 12, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 5 }}>
          <AlertTriangle size={12} /> {error}
        </div>
      )}
    </label>
  );
}
