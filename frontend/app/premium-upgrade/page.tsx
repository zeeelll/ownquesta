'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Layers3,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Wallet,
  Zap,
} from 'lucide-react';
import QRCode from 'qrcode';
import Logo from '../components/Logo';
import { getCurrentUser, upgradeMembership } from '@/services/api';

type CheckoutState = {
  source: string;
  sessionId: string;
  modelName: string;
  product: string;
  price: number;
  returnTo: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
};

type PaymentMethod = 'upi' | 'card' | 'paypal';
type UpiAppKey = 'gpay' | 'phonepe' | 'paytm' | 'bhim';

const UPI_APPS: Array<{ key: UpiAppKey; label: string; short: string; tint: string }> = [
  { key: 'gpay', label: 'Google Pay', short: 'GPay', tint: '#4285F4' },
  { key: 'phonepe', label: 'PhonePe', short: 'PhonePe', tint: '#5F259F' },
  { key: 'paytm', label: 'Paytm', short: 'Paytm', tint: '#00BAF2' },
  { key: 'bhim', label: 'BHIM UPI', short: 'BHIM', tint: '#00866E' },
];

const PREMIUM_PRICE = 1500;
const OWNQUESTA_UPI_ID = 'ownquesta@oksbi';
const OWNQUESTA_UPI_NAME = 'Ownquesta';

const defaultCheckout: CheckoutState = {
  source: 'automl',
  sessionId: '',
  modelName: 'Trained Model',
  product: 'mlops-deploy',
  price: PREMIUM_PRICE,
  returnTo: '/automl',
};

export default function PremiumUpgradePage() {
  const router = useRouter();
  const [checkout, setCheckout] = useState<CheckoutState>(defaultCheckout);
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiAppKey>('gpay');
  const [upiId, setUpiId] = useState('');
  const [upiQrDataUrl, setUpiQrDataUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const [message, setMessage] = useState('');
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const parsedPrice = Number(params.get('price') || PREMIUM_PRICE);
    const source = params.get('source') || 'automl';
    const sessionId = params.get('session') || '';
    const product = params.get('product') || 'mlops-deploy';
    const modelName = params.get('model') || 'Trained Model';
    const returnTo = params.get('returnTo') || (source === 'script' ? '/automl/script' : '/automl');
    const fixedPrice = product === 'mlops-deploy' ? PREMIUM_PRICE : parsedPrice;

    setCheckout({
      source,
      sessionId,
      product,
      modelName,
      price: Number.isFinite(fixedPrice) ? fixedPrice : PREMIUM_PRICE,
      returnTo,
    });
  }, []);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((data: any) => {
        if (!active || !data?.user) return;
        setIsPremiumUser(String(data.user.membershipStatus || '').toLowerCase() === 'ownque_user');
        setForm((current) => ({
          name: current.name || data.user.name || '',
          email: current.email || data.user.email || '',
          phone: current.phone,
        }));
      })
      .catch(() => {
        if (!active) return;
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem('ownquesta_user_access') : null;
        if (!cached) return;
        try {
          const parsed = JSON.parse(cached) as { membershipStatus?: string; name?: string; email?: string };
          setIsPremiumUser(String(parsed.membershipStatus || '').toLowerCase() === 'ownque_user');
          setForm((current) => ({
            name: current.name || parsed.name || '',
            email: current.email || parsed.email || '',
            phone: current.phone,
          }));
        } catch {
          // ignore cached state issues
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const isDeploymentUpgrade = checkout.product === 'mlops-deploy';
  const isUpiValid = /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim());
  const isCardValid = cardNumber.replace(/\s/g, '').length === 16 && /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) && cvv.length >= 3;
  const canUpgrade =
    form.name.trim() &&
    form.email.trim() &&
    !processing &&
    !upgraded &&
    paymentMethod !== 'paypal' &&
    ((paymentMethod === 'upi' && isUpiValid) || (paymentMethod === 'card' && isCardValid));
  const planLabel = useMemo(() => `₹${checkout.price.toLocaleString('en-IN')}/month`, [checkout.price]);
  const selectedUpiAppLabel = useMemo(() => UPI_APPS.find((app) => app.key === selectedUpiApp)?.short ?? 'UPI', [selectedUpiApp]);
  const upiPaymentLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: OWNQUESTA_UPI_ID,
      pn: OWNQUESTA_UPI_NAME,
      tn: `OwnQuesta Premium ${checkout.sessionId || 'MLOps'}`,
      am: checkout.price.toString(),
      cu: 'INR',
    });
    return `upi://pay?${params.toString()}`;
  }, [checkout.price, checkout.sessionId]);

  const onChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    let mounted = true;
    QRCode.toDataURL(upiPaymentLink, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#0b1224', light: '#ffffff' },
    })
      .then((url) => {
        if (mounted) setUpiQrDataUrl(url);
      })
      .catch(() => {
        if (mounted) setUpiQrDataUrl('');
      });
    return () => {
      mounted = false;
    };
  }, [upiPaymentLink]);

  const copyUpiId = async () => {
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(OWNQUESTA_UPI_ID);
    setCopiedUpi(true);
    window.setTimeout(() => setCopiedUpi(false), 1200);
  };

  const formatCardNumber = (value: string) => value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validateCheckout = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.name.trim()) nextErrors.name = 'Full name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (paymentMethod === 'upi' && !isUpiValid) nextErrors.upi = 'Enter a valid UPI ID (example: yourname@okaxis).';
    if (paymentMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) nextErrors.cardNumber = 'Enter a valid 16-digit card number.';
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) nextErrors.expiry = 'Use MM/YY format.';
      if (cvv.length < 3) nextErrors.cvv = 'Enter valid CVV.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleUpgrade = async () => {
    if (!canUpgrade || !isDeploymentUpgrade) return;
    if (!validateCheckout()) return;
    setProcessing(true);
    setMessage('');
    try {
      const result = await upgradeMembership({
        plan: 'premium-monthly',
        amountInr: checkout.price,
        customerName: form.name,
        customerEmail: form.email,
      });

      const orderId = `OWNQ-PREMIUM-${(checkout.sessionId || Date.now().toString()).slice(0, 12).toUpperCase()}`;
      const premiumPayload = {
        paid: true,
        product: 'mlops-deploy',
        sessionId: checkout.sessionId,
        modelName: checkout.modelName,
        price: checkout.price,
        paidAt: Date.now(),
        method: paymentMethod === 'upi' ? `upi-${selectedUpiApp}` : 'card',
        orderId,
        downloadTarget: 'deploy',
        unlocks: ['deploy'],
        gateway: 'ownquesta',
        membershipStatus: 'ownque_user',
      };

      sessionStorage.setItem('ownquesta_user_access', JSON.stringify(result.user));
      sessionStorage.setItem('ownquesta_model_payment', JSON.stringify(premiumPayload));
      sessionStorage.setItem('ownquesta_deploy_access', JSON.stringify({
        paid: true,
        sessionId: checkout.sessionId,
        modelName: checkout.modelName,
        orderId,
        method: paymentMethod === 'upi' ? `upi-${selectedUpiApp}` : 'card',
        grantedAt: Date.now(),
      }));

      setIsPremiumUser(true);
      setUpgraded(true);
      setMessage('Premium access activated. Preparing your deployment workflow...');

      window.setTimeout(() => {
        const params = new URLSearchParams();
        params.set('payment', 'success');
        params.set('session', checkout.sessionId);
        params.set('premium', '1');
        params.set('source', checkout.source);
        router.replace(`${checkout.returnTo}?${params.toString()}`);
      }, 1200);
    } catch (error: any) {
      setMessage(error?.message || 'Unable to activate premium access.');
    } finally {
      setProcessing(false);
    }
  };

  const containerTitle = isDeploymentUpgrade
    ? 'Premium Upgrade'
    : 'Downloads are already free';

  const paymentMethodCards = [
    { key: 'upi' as const, label: 'UPI', desc: 'Google Pay, PhonePe, Paytm, or BHIM UPI', icon: Smartphone },
    { key: 'card' as const, label: 'Card', desc: 'Secure card details form', icon: CreditCard },
    { key: 'paypal' as const, label: 'PayPal', desc: 'Coming soon', icon: Wallet },
  ];

  return (
    <div className="min-h-screen text-white" style={{ background: 'radial-gradient(circle at top, rgba(14,116,144,0.22), transparent 28%), linear-gradient(180deg, #050816 0%, #090d1d 55%, #070a14 100%)' }}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute right-[-4rem] top-40 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo href="/home" size="md" />
          <Link href={checkout.returnTo} className="btn-premium rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10">
            <ArrowLeft size={14} />
            Back to AutoML Playground
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
        <section className="card-premium rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
            <Sparkles size={14} />
            {containerTitle}
          </div>

          <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
            {isDeploymentUpgrade ? 'Activate premium deployment for your trained model' : 'Your exports are already unlocked'}
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            {isDeploymentUpgrade
              ? 'Complete this quick upgrade to mark your account as an OwnQuesta premium user and enable direct deployment inside the platform.'
              : 'You can download the .ipynb and Python script without paying. Return to the playground to continue.'}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/15 text-cyan-100"><Rocket size={18} /></div>
              <p className="text-sm font-semibold text-white">Direct deployment</p>
              <p className="mt-1 text-sm text-slate-300">Generate an OwnQuesta deployment endpoint without external platforms.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-100"><ShieldCheck size={18} /></div>
              <p className="text-sm font-semibold text-white">Premium access</p>
              <p className="mt-1 text-sm text-slate-300">Your profile is marked as <span className="font-semibold text-cyan-100">ownque_user</span>.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/15 text-violet-100"><Layers3 size={18} /></div>
              <p className="text-sm font-semibold text-white">MLOps stack</p>
              <p className="mt-1 text-sm text-slate-300">MLflow, FastAPI, Docker, monitoring, and versioned deployment flow.</p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/5 p-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                <CreditCard size={14} />
                Premium Plan
              </div>
              <div className="text-2xl font-semibold text-cyan-100">{planLabel}</div>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              MLOps deployment is a premium feature. Free users can still download the notebook and Python script, while premium users unlock direct deployment inside OwnQuesta.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><Lock size={14} /> Free users keep downloads</div>
              <p className="mt-2 text-sm text-slate-300">The .ipynb and Python script exports remain available without payment.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><Zap size={14} /> Premium deployment</div>
              <p className="mt-2 text-sm text-slate-300">Deploy your trained model directly inside the OwnQuesta ecosystem.</p>
            </div>
          </div>
        </section>

        <aside className="card-premium rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-100">
              <Lock size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">Secure upgrade</p>
              <h2 className="mt-1 text-2xl font-semibold">{isDeploymentUpgrade ? 'Unlock deployment' : 'Return to exports'}</h2>
            </div>
          </div>

          {isDeploymentUpgrade ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {paymentMethodCards.map((method) => {
                    const Icon = method.icon;
                    const active = paymentMethod === method.key;
                    return (
                      <button
                        key={method.key}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(method.key);
                          setMessage('');
                        }}
                        className={`flex h-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${active ? 'border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]' : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5'}`}
                      >
                        <span className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-cyan-400/15 text-cyan-100' : 'bg-white/5 text-slate-300'}`}>
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-semibold leading-5 text-white">{method.label}</span>
                          <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">{method.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'upi' && (
                  <div className="mt-4 space-y-3">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Select UPI App</div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {UPI_APPS.map((app) => {
                        const active = selectedUpiApp === app.key;
                        return (
                          <button
                            key={app.key}
                            type="button"
                            onClick={() => setSelectedUpiApp(app.key)}
                            className={`rounded-2xl border px-3 py-3 text-left transition ${active ? 'border-cyan-400/55 bg-white/10 shadow-[0_0_0_1px_rgba(34,211,238,0.18)]' : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5'}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="text-sm font-semibold leading-5 text-white">{app.short}</div>
                                <div className="text-[11px] leading-4 text-slate-400">{app.label}</div>
                              </div>
                              <span className="h-3 w-3 rounded-full" style={{ background: app.tint }} />
                            </div>
                            {active && <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-cyan-200"><Check size={11} /> Selected</div>}
                          </button>
                        );
                      })}
                    </div>

                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Enter your UPI ID</span>
                      <input
                        value={upiId}
                        onChange={(event) => setUpiId(event.target.value.trim())}
                        placeholder="yourname@okaxis"
                        className="input-premium w-full rounded-2xl px-4 py-3 text-sm"
                      />
                    </label>

                    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Pay to OwnQuesta</p>
                      <div className="mt-2 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{OWNQUESTA_UPI_NAME}</p>
                          <p className="text-xs text-cyan-100">{OWNQUESTA_UPI_ID}</p>
                        </div>
                        <div className="text-lg font-semibold text-cyan-100">₹{checkout.price.toFixed(2)}</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => void copyUpiId()} className="rounded-xl border border-cyan-300/35 bg-cyan-300/15 px-3 py-2 text-xs font-semibold text-cyan-100">
                          {copiedUpi ? 'Copied' : 'Copy UPI ID'}
                        </button>
                        <button type="button" onClick={() => window.open(upiPaymentLink, '_self')} className="rounded-xl border border-cyan-300/35 bg-cyan-300/15 px-3 py-2 text-xs font-semibold text-cyan-100">
                          Open {selectedUpiAppLabel}
                        </button>
                      </div>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-white p-2">
                        {upiQrDataUrl ? (
                          <img src={upiQrDataUrl} alt="UPI QR" className="mx-auto h-[190px] w-[190px] rounded-xl object-contain" />
                        ) : (
                          <div className="mx-auto flex h-[190px] w-[190px] items-center justify-center text-xs text-slate-500">Generating QR...</div>
                        )}
                      </div>
                    </div>

                    {errors.upi && <p className="flex items-start gap-2 text-xs text-rose-300"><AlertTriangle size={13} /> {errors.upi}</p>}
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="mt-4 space-y-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Card number</span>
                      <input
                        value={cardNumber}
                        onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                        placeholder="0000 0000 0000 0000"
                        className="input-premium w-full rounded-2xl px-4 py-3 text-sm"
                      />
                      {errors.cardNumber && <p className="mt-2 flex items-start gap-2 text-xs text-rose-300"><AlertTriangle size={13} /> {errors.cardNumber}</p>}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">Expiry</span>
                        <input
                          value={expiry}
                          onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                          placeholder="MM/YY"
                          className="input-premium w-full rounded-2xl px-4 py-3 text-sm"
                        />
                        {errors.expiry && <p className="mt-2 flex items-start gap-2 text-xs text-rose-300"><AlertTriangle size={13} /> {errors.expiry}</p>}
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">CVV</span>
                        <input
                          value={cvv}
                          onChange={(event) => setCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="***"
                          type="password"
                          className="input-premium w-full rounded-2xl px-4 py-3 text-sm"
                        />
                        {errors.cvv && <p className="mt-2 flex items-start gap-2 text-xs text-rose-300"><AlertTriangle size={13} /> {errors.cvv}</p>}
                      </label>
                    </div>
                    <p className="text-xs text-slate-400">Your card details are only used for this dummy payment simulation.</p>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
                    PayPal is coming soon. Please use UPI or Card to activate premium access now.
                  </div>
                )}
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Full name</span>
                <input value={form.name} onChange={onChange('name')} placeholder="Your name" className="input-premium w-full rounded-2xl px-4 py-3 text-sm" />
                {errors.name && <p className="mt-2 flex items-start gap-2 text-xs text-rose-300"><AlertTriangle size={13} /> {errors.name}</p>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Email address</span>
                <input value={form.email} onChange={onChange('email')} placeholder="name@company.com" className="input-premium w-full rounded-2xl px-4 py-3 text-sm" />
                {errors.email && <p className="mt-2 flex items-start gap-2 text-xs text-rose-300"><AlertTriangle size={13} /> {errors.email}</p>}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Phone</span>
                <input value={form.phone} onChange={onChange('phone')} placeholder="Optional" className="input-premium w-full rounded-2xl px-4 py-3 text-sm" />
              </label>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Clock3 size={14} /> Dummy payment flow
                </div>
                <p className="mt-2 leading-7">This does not charge a real card. It marks the user premium in OwnQuesta and starts the deployment workflow.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3 py-1">
                  <span>Premium MLOps plan</span>
                  <span className="font-semibold text-white">₹{checkout.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 py-1 text-amber-300">
                  <span>Other downloads</span>
                  <span className="font-semibold">Not included</span>
                </div>
                <div className="my-2 h-px bg-white/10" />
                <div className="flex items-center justify-between gap-3 py-1 text-base font-semibold text-cyan-100">
                  <span>Total payable now</span>
                  <span>₹{checkout.price.toFixed(2)}</span>
                </div>
              </div>

              {message && (
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-50">
                  {message}
                </div>
              )}

              <button
                onClick={() => void handleUpgrade()}
                disabled={!canUpgrade}
                className="btn-premium btn-primary mt-2 w-full rounded-2xl px-5 py-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing ? 'Upgrading...' : upgraded ? 'Premium activated' : paymentMethod === 'paypal' ? 'PayPal coming soon' : `Upgrade for ${planLabel}`}
              </button>

              {isPremiumUser && (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
                  Your account is already premium. You can return to AutoML Playground and deploy immediately.
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Free users can download the notebook and Python script from the playground without payment.
              </div>
              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
                <div className="flex items-center gap-2 text-white"><CheckCircle2 size={14} /> Notebook export remains free</div>
                <div className="flex items-center gap-2 text-white"><CheckCircle2 size={14} /> Python script export remains free</div>
                <div className="flex items-center gap-2 text-white"><CheckCircle2 size={14} /> Premium only unlocks direct deployment</div>
              </div>
              <Link href={checkout.returnTo} className="btn-premium btn-primary w-full rounded-2xl px-5 py-4 text-sm">
                Continue to AutoML Playground
                <ExternalLink size={14} />
              </Link>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Training session</p>
            <p className="mt-2 break-words">{checkout.modelName}</p>
            <p className="mt-1 text-slate-400">Session: {checkout.sessionId || 'N/A'}</p>
          </div>
        </aside>
      </main>
    </div>
  );
}