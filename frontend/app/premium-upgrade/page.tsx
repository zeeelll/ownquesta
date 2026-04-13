'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Layers3,
  Lock,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
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
  company: string;
  phone: string;
};

const PREMIUM_PRICE = 1500;

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
  const [form, setForm] = useState<FormState>({ name: '', email: '', company: '', phone: '' });
  const [processing, setProcessing] = useState(false);
  const [upgraded, setUpgraded] = useState(false);
  const [message, setMessage] = useState('');
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const price = Number(params.get('price') || PREMIUM_PRICE);
    const source = params.get('source') || 'automl';
    const sessionId = params.get('session') || '';
    const product = params.get('product') || 'mlops-deploy';
    const modelName = params.get('model') || 'Trained Model';
    const returnTo = params.get('returnTo') || (source === 'script' ? '/automl/script' : '/automl');

    setCheckout({
      source,
      sessionId,
      product,
      modelName,
      price: Number.isFinite(price) ? price : PREMIUM_PRICE,
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
          company: current.company,
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
            company: current.company,
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
  const canUpgrade = form.name.trim() && form.email.trim() && !processing && !upgraded;
  const planLabel = useMemo(() => `₹${checkout.price.toLocaleString('en-IN')}/month`, [checkout.price]);

  const onChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleUpgrade = async () => {
    if (!canUpgrade || !isDeploymentUpgrade) return;
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
        method: 'dummy-upgrade',
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
        method: 'dummy-upgrade',
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
              This is a dummy payment flow for testing. You enter basic details, click Upgrade, and OwnQuesta grants premium access immediately.
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
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Full name</span>
                <input value={form.name} onChange={onChange('name')} placeholder="Your name" className="input-premium w-full rounded-2xl px-4 py-3 text-sm" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Email address</span>
                <input value={form.email} onChange={onChange('email')} placeholder="name@company.com" className="input-premium w-full rounded-2xl px-4 py-3 text-sm" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-200">Company or team</span>
                <input value={form.company} onChange={onChange('company')} placeholder="Optional" className="input-premium w-full rounded-2xl px-4 py-3 text-sm" />
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
                {processing ? 'Upgrading...' : upgraded ? 'Premium activated' : `Upgrade for ${planLabel}`}
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