'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { fetchAvailableModels, type AIModel } from '../../../lib/aiModels';

const AGENT_URL = 'http://localhost:8020';
const LAB_URL   = 'http://localhost:8010';

// ── SSE reader ────────────────────────────────────────────────────────────────
async function* readSSE(response: Response): AsyncGenerator<Record<string, unknown>> {
  const reader = response.body!.getReader();
  const dec    = new TextDecoder();
  let   buf    = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() ?? '';
    for (const part of parts) {
      const line = part.split('\n').find(l => l.startsWith('data: '));
      if (!line) continue;
      try { yield JSON.parse(line.slice(6)); } catch { /* skip */ }
    }
  }
}

function triggerDownload(content: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface ChatMsg { role: 'user' | 'assistant'; content: string; }

type DownloadType = 'py' | 'ipynb';

// ── Payment config — adjust price / label as needed ──────────────────────────
const DOWNLOAD_PRICE = 2.99;
const FREE_DOWNLOADS_KEY = 'ownquesta_free_download_usage';
const UPI_APP_OPTIONS = [
  { key: 'gpay', short: 'GPay', label: 'Google Pay', mark: 'G', accent: '#7dd3fc', bg: 'rgba(14,165,233,0.14)', border: 'rgba(56,189,248,0.32)' },
  { key: 'phonepe', short: 'PhonePe', label: 'PhonePe', mark: 'पे', accent: '#c4b5fd', bg: 'rgba(139,92,246,0.14)', border: 'rgba(167,139,250,0.34)' },
  { key: 'paytm', short: 'Paytm', label: 'Paytm', mark: 'tm', accent: '#67e8f9', bg: 'rgba(6,182,212,0.14)', border: 'rgba(34,211,238,0.32)' },
  { key: 'bhim', short: 'BHIM', label: 'BHIM UPI', mark: '₹', accent: '#fcd34d', bg: 'rgba(245,158,11,0.14)', border: 'rgba(251,191,36,0.32)' },
] as const;
type UpiAppKey = (typeof UPI_APP_OPTIONS)[number]['key'];

// ── Payment Modal ─────────────────────────────────────────────────────────────
function PaymentModal({
  downloadType,
  onClose,
  onSuccess,
}: {
  downloadType: DownloadType;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card' | 'upi'>('paypal');
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiAppKey | ''>('');
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [statusNote, setStatusNote] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = paymentMethod === 'paypal' ? 'Enter your PayPal email' : 'Enter a valid email';
    }
    if (paymentMethod === 'card') {
      if (cardNum.replace(/\s/g, '').length < 16) e.card = 'Enter 16-digit card number';
      if (expiry.length < 5) e.expiry = 'Enter MM/YY';
      if (cvv.length < 3) e.cvv = 'Enter 3-digit CVV';
    }
    if (paymentMethod === 'upi') {
      if (!selectedUpiApp) e.upiApp = 'Choose a UPI app first';
      if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        e.upi = 'Enter a valid UPI ID';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;

    setSubmitError('');
    setStatusNote('');

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod,
          name,
          email,
          upiId,
          upiApp: selectedUpiApp || undefined,
          sessionId: '',
          product: downloadType === 'py' ? 'python-script' : 'jupyter-notebook',
          modelName: fileLabel,
          price: DOWNLOAD_PRICE,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to start the payment.');
      }

      setStatusNote(
        paymentMethod === 'upi'
          ? `Payment request created. Complete it in ${UPI_APP_OPTIONS.find((app) => app.key === selectedUpiApp)?.short ?? 'your UPI app'}.`
          : data.instructions || 'Checkout session created successfully.',
      );
      setStep('processing');
      setProgress(8);

      if (paymentMethod === 'upi' && data.payment?.upiIntentUrl && typeof window !== 'undefined') {
        const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
        if (isMobileDevice) {
          window.open(data.payment.upiIntentUrl, '_self');
        }
      }

      let p = 8;
      const interval = window.setInterval(() => {
        p += Math.random() * 16;
        if (p >= 94) {
          window.clearInterval(interval);
          p = 94;
        }
        setProgress(Math.min(p, 94));
      }, 120);

      await new Promise((resolve) => window.setTimeout(resolve, 1400));

      const confirmResponse = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.payment.orderId }),
      });
      const confirmData = await confirmResponse.json();

      window.clearInterval(interval);
      if (!confirmResponse.ok || !confirmData.success) {
        throw new Error(confirmData.error || 'Unable to confirm the payment.');
      }

      setProgress(100);
      setStatusNote('Payment confirmed. Your export download is starting now…');
      window.setTimeout(() => {
        setStep('success');
        window.setTimeout(onSuccess, 1000);
      }, 250);
    } catch (error: any) {
      setStep('details');
      setProgress(0);
      setSubmitError(error?.message || 'Payment failed. Please try again.');
    }
  };

  const fileLabel = downloadType === 'py' ? 'Python Script (.py)' : 'Jupyter Notebook (.ipynb)';
  const ownquestaUpiId = 'ownquesta@oksbi';
  const upiApproxAmount = Number((DOWNLOAD_PRICE * 83).toFixed(2));
  const selectedUpiAppLabel = UPI_APP_OPTIONS.find((app) => app.key === selectedUpiApp)?.short ?? 'UPI';
  const accent = paymentMethod === 'paypal' ? '#38bdf8' : paymentMethod === 'upi' ? '#34d399' : '#a87edf';
  const payAction =
    paymentMethod === 'paypal'
      ? `Pay $${DOWNLOAD_PRICE} with PayPal`
      : paymentMethod === 'upi'
        ? selectedUpiApp
          ? `Pay ₹${upiApproxAmount.toFixed(2)} with ${selectedUpiAppLabel}`
          : `Select app & pay ₹${upiApproxAmount.toFixed(2)}`
        : `Pay $${DOWNLOAD_PRICE} by Card`;

  const handleCopyUpi = async () => {
    if (typeof window === 'undefined' || !window.navigator?.clipboard) return;
    await window.navigator.clipboard.writeText(ownquestaUpiId);
    setCopiedUpi(true);
    window.setTimeout(() => setCopiedUpi(false), 1500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div
        onClick={step === 'details' ? onClose : undefined}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      />

      <div style={{
        position: 'relative', width: '100%', maxWidth: 440, borderRadius: 20,
        background: 'linear-gradient(160deg, #0e0f1f 0%, #0a0b18 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        overflow: 'hidden',
      }}>
        <div style={{ height: 3, background: paymentMethod === 'paypal' ? 'linear-gradient(90deg, #2563eb, #38bdf8, #60a5fa)' : paymentMethod === 'upi' ? 'linear-gradient(90deg, #059669, #10b981, #6ee7b7)' : 'linear-gradient(90deg, #6e54c8, #a87edf, #60a5fa)' }} />

        <div style={{ padding: 28 }}>
          {step === 'details' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: accent, marginBottom: 4 }}>
                    Secure Checkout
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>Download File</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Pay with PayPal, card, or UPI</div>
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}>×</button>
              </div>

              <div style={{ background: 'rgba(110,84,200,0.08)', border: '1px solid rgba(110,84,200,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#c4b5fd', fontWeight: 600 }}>
                    {downloadType === 'py' ? '🐍' : '📓'} {fileLabel}
                  </div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>pipeline export · instant unlock</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#a87edf', textAlign: 'right' }}>
                  <div>{paymentMethod === 'upi' ? `₹${upiApproxAmount.toFixed(2)}` : `$${DOWNLOAD_PRICE}`}</div>
                  {paymentMethod === 'upi' && <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 2 }}>≈ ${DOWNLOAD_PRICE} USD</div>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: 18 }}>
                {[
                  { key: 'paypal', label: '🅿️ PayPal' },
                  { key: 'card', label: '💳 Card' },
                  { key: 'upi', label: '📱 UPI' },
                ].map((item) => {
                  const active = paymentMethod === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => { setPaymentMethod(item.key as 'paypal' | 'card' | 'upi'); setErrors({}); }}
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        border: active ? `1px solid ${accent}55` : '1px solid transparent',
                        background: active ? `${accent}18` : 'transparent',
                        color: active ? '#f8fafc' : '#94a3b8',
                        padding: '9px 10px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Field label="Full Name" error={errors.name}>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" style={inputStyle(!!errors.name)} />
                </Field>

                <Field label={paymentMethod === 'paypal' ? 'PayPal Email' : 'Receipt Email'} error={errors.email}>
                  <input value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" type="email" style={inputStyle(!!errors.email)} />
                </Field>

                {paymentMethod === 'paypal' ? (
                  <div style={{ borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(56,189,248,0.25)', background: 'rgba(56,189,248,0.08)', fontSize: 12, color: '#dbeafe', lineHeight: 1.5 }}>
                    Use your PayPal balance or any linked debit / credit card for a fast secure checkout billed under the Ownquesta account.
                  </div>
                ) : paymentMethod === 'card' ? (
                  <>
                    <Field label="Card Number" error={errors.card}>
                      <div style={{ position: 'relative' }}>
                        <input value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} placeholder="0000 0000 0000 0000" style={{ ...inputStyle(!!errors.card), paddingRight: 80 }} />
                        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
                          <CardBadge label="VISA" color="#60a5fa" />
                          <CardBadge label="MC" color="#f97316" />
                        </div>
                      </div>
                    </Field>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <Field label="Expiry" error={errors.expiry} style={{ flex: 1 }}>
                        <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" style={inputStyle(!!errors.expiry)} />
                      </Field>
                      <Field label="CVV" error={errors.cvv} style={{ flex: 1 }}>
                        <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="•••" type="password" style={inputStyle(!!errors.cvv)} />
                      </Field>
                    </div>
                  </>
                ) : (
                  <>
                    <Field label="1. Choose UPI App" error={errors.upiApp}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                        {UPI_APP_OPTIONS.map((app) => {
                          const active = selectedUpiApp === app.key;
                          return (
                            <button
                              key={app.key}
                              type="button"
                              onClick={() => {
                                setSelectedUpiApp(app.key);
                                setErrors((prev) => ({ ...prev, upiApp: '' }));
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                width: '100%',
                                borderRadius: 12,
                                padding: '10px 11px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                border: active ? '1px solid rgba(110,231,183,0.42)' : '1px solid rgba(255,255,255,0.08)',
                                background: active ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.03)',
                              }}
                            >
                              <span
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 10,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: app.accent,
                                  background: app.bg,
                                  border: `1px solid ${app.border}`,
                                  flexShrink: 0,
                                }}
                              >
                                {app.mark}
                              </span>
                              <span style={{ minWidth: 0 }}>
                                <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>{app.short}</span>
                                <span style={{ display: 'block', fontSize: 10, color: '#8ca3b8' }}>{app.label}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </Field>
                    <Field label="2. Enter UPI ID" error={errors.upi}>
                      <input value={upiId} onChange={e => setUpiId(e.target.value.trim())} placeholder="yourname@okaxis" style={inputStyle(!!errors.upi)} />
                    </Field>
                    <div style={{ borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(52,211,153,0.25)', background: 'rgba(16,185,129,0.08)', fontSize: 12, color: '#d1fae5', lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 700, color: '#86efac', marginBottom: 6 }}>Pay to Ownquesta • {ownquestaUpiId}</div>
                      <div>
                        {selectedUpiApp
                          ? `Continue with ${selectedUpiAppLabel}. Approximate UPI amount: ₹${upiApproxAmount.toFixed(2)} based on $${DOWNLOAD_PRICE} USD.`
                          : `First select your UPI app, then enter your UPI ID. Approximate UPI amount: ₹${upiApproxAmount.toFixed(2)} based on $${DOWNLOAD_PRICE} USD.`}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        style={{ marginTop: 10, padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(134,239,172,0.3)', background: 'rgba(134,239,172,0.08)', color: '#d1fae5', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        {copiedUpi ? 'Copied UPI ID' : 'Copy Ownquesta UPI ID'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button onClick={handlePay} style={{
                marginTop: 20, width: '100%', padding: 14, borderRadius: 12,
                background: paymentMethod === 'paypal' ? 'linear-gradient(135deg,#1d4ed8,#38bdf8)' : paymentMethod === 'upi' ? 'linear-gradient(135deg,#047857,#10b981)' : 'linear-gradient(135deg,#6e54c8,#a87edf)',
                border: 'none', color: '#fff', fontSize: 15, fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: paymentMethod === 'paypal' ? '0 4px 24px rgba(37,99,235,0.4)' : paymentMethod === 'upi' ? '0 4px 24px rgba(5,150,105,0.35)' : '0 4px 24px rgba(110,84,200,0.45)',
              }}>
                {payAction}
              </button>

              {(submitError || statusNote) && (
                <div style={{ marginTop: 10, fontSize: 12, color: submitError ? '#f87171' : '#7dd3fc', lineHeight: 1.5 }}>
                  {submitError || statusNote}
                </div>
              )}

              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11, color: '#475569', flexWrap: 'wrap' }}>
                <span>🔒 SSL Encrypted</span>
                <span>✓ Secure Payment</span>
                <span>⚡ Instant Delivery</span>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16, display: 'inline-block', animation: 'pmSpin 1s linear infinite' }}>⚙️</div>
              <style>{`@keyframes pmSpin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
                {paymentMethod === 'paypal' ? 'Connecting to PayPal…' : paymentMethod === 'upi' ? `Confirming ${selectedUpiAppLabel} Payment…` : 'Processing Card Payment…'}
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{statusNote || 'Please wait, do not close this window'}</div>
              <div style={{ marginTop: 20, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: paymentMethod === 'paypal' ? 'linear-gradient(90deg,#2563eb,#38bdf8)' : paymentMethod === 'upi' ? 'linear-gradient(90deg,#059669,#34d399)' : 'linear-gradient(90deg,#6e54c8,#a87edf)', borderRadius: 4, transition: 'width 0.12s linear' }} />
              </div>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '2px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>✓</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80', marginBottom: 8 }}>Payment Successful!</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Starting your download…</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Field({ label, error, children, style }: { label: string; error?: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', marginBottom: 5 }}>{label}</div>
      {children}
      {error && <div style={{ fontSize: 11, color: '#f87171', marginTop: 3 }}>{error}</div>}
    </div>
  );
}

function CardBadge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 4, border: `1px solid ${color}40`, color, background: `${color}10` }}>{label}</span>
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${hasError ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 10, color: '#f1f5f9', fontSize: 13,
    fontFamily: 'inherit', outline: 'none',
  };
}

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMd(text: string): string {
  return text
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre style="background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;overflow-x:auto;font-size:12px;margin:8px 0;white-space:pre-wrap">$1</pre>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08);padding:1px 5px;border-radius:4px;font-size:12px">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ScriptPage() {
  const router = useRouter();

  // Session
  const [sessionId, setSessionId] = useState('');
  const [script,    setScript]    = useState('# Loading script…');

  // Execution
  const [output,    setOutput]    = useState<{ type: 'out' | 'err' | 'status'; text: string }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Chat
  const [chatMsgs,  setChatMsgs]  = useState<ChatMsg[]>([{ role: 'assistant', content: 'I can help you modify, debug or improve this Python script. Ask me anything!' }]);
  const [chatInput, setChatInput] = useState('');
  const [chatBusy,  setChatBusy]  = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Models
  const [models,        setModels]        = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const modelDropRef = useRef<HTMLDivElement>(null);

  // Payment modal state
  const [payModal,   setPayModal]   = useState<DownloadType | null>(null);
  const [paidTypes,  setPaidTypes]  = useState<Set<DownloadType>>(new Set());
  const [dlNotebook, setDlNotebook] = useState(false);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem('lab_script_session');
    if (!raw) { setScript('# No session data found. Go back to the AutoML Playground and click "Python Script".'); return; }
    try {
      const { sessionId: sid, cells } = JSON.parse(raw) as { sessionId: string; cells: string[] };
      setSessionId(sid);
      fetch(`${AGENT_URL}/v2/generate-script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, cells }),
      })
        .then(r => r.json())
        .then(d => setScript(d.script || '# (empty script)'))
        .catch(() => {
          const header = '# Auto-generated by Ownquesta\n\n';
          setScript(header + cells.map((c, i) => `# ── Cell ${i + 1} ──\n${c.trim()}`).join('\n\n'));
        });
    } catch {
      setScript('# Failed to parse session data.');
    }
  }, []);

  useEffect(() => {
    if (!sessionId || typeof window === 'undefined') return;

    const rawAccess = sessionStorage.getItem('ownquesta_export_access') ?? sessionStorage.getItem('ownquesta_model_payment');
    if (!rawAccess) return;

    try {
      const access = JSON.parse(rawAccess) as {
        paid?: boolean;
        sessionId?: string;
        product?: string;
        downloadTarget?: string;
        types?: string[];
        unlocks?: string[];
      };

      if (!access.paid) return;
      if (access.sessionId && access.sessionId !== sessionId) return;

      const unlocked = new Set<DownloadType>();
      access.types?.forEach((type) => {
        if (type === 'py' || type === 'ipynb') unlocked.add(type);
      });
      access.unlocks?.forEach((type) => {
        if (type === 'py' || type === 'ipynb') unlocked.add(type);
      });
      if (access.downloadTarget === 'py' || access.product === 'python-script') unlocked.add('py');
      if (access.downloadTarget === 'ipynb' || access.product === 'jupyter-notebook') unlocked.add('ipynb');

      if (!unlocked.size) return;

      setPaidTypes(prev => new Set([...prev, ...Array.from(unlocked)]));
    } catch {
      // ignore invalid payment cache
    }
  }, [sessionId]);

  useEffect(() => {
    fetchAvailableModels(AGENT_URL).then(m => {
      if (m.length > 0) {
        setModels(m);
        setSelectedModel(prev => m.some(x => x.id === prev) ? prev : m[0].id);
      }
    });
  }, []);

  useEffect(() => { outputEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [output]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!modelDropRef.current?.contains(e.target as Node)) setModelDropOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Run ───────────────────────────────────────────────────────────────────
  const runScript = useCallback(async () => {
    if (isRunning || !sessionId) return;
    setIsRunning(true);
    setOutput([]);
    try {
      const res = await fetch(`${AGENT_URL}/v2/execute-script-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, script }),
      });
      for await (const ev of readSSE(res)) {
        if (ev.type === 'status')     setOutput(p => [...p, { type: 'status', text: ev.text as string }]);
        if (ev.type === 'output')     setOutput(p => [...p, { type: 'out',    text: ev.line as string }]);
        if (ev.type === 'error_line') setOutput(p => [...p, { type: 'err',    text: ev.line as string }]);
      }
    } catch (e: any) {
      setOutput(p => [...p, { type: 'err', text: e.message }]);
    } finally { setIsRunning(false); }
  }, [isRunning, sessionId, script]);

  // ── Actual download helpers (called AFTER payment) ────────────────────────
  const doDownloadPy = useCallback(() => {
    triggerDownload(script, 'pipeline.py', 'text/x-python');
  }, [script]);

  const doDownloadNotebook = useCallback(async () => {
    if (dlNotebook || !sessionId) return;
    setDlNotebook(true);
    try {
      const raw = localStorage.getItem('lab_script_session');
      const cells = raw ? (JSON.parse(raw) as { cells: string[] }).cells : [script];
      const res = await fetch(`${AGENT_URL}/v2/generate-notebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, cells }),
      });
      if (res.ok) {
        const blob  = await res.blob();
        const fname = res.headers.get('content-disposition')?.match(/filename="?([^"]+)"?/)?.[1] ?? 'pipeline.ipynb';
        triggerDownload(await blob.text(), fname, 'application/json');
      }
    } catch {
      // silent
    } finally {
      setDlNotebook(false);
    }
  }, [dlNotebook, sessionId, script]);

  useEffect(() => {
    if (!sessionId || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') !== 'success') return;

    const rawPayment = sessionStorage.getItem('ownquesta_model_payment');
    if (!rawPayment) return;

    try {
      const payment = JSON.parse(rawPayment) as {
        paid?: boolean;
        sessionId?: string;
        product?: string;
        downloadTarget?: DownloadType | 'trained-model';
      };

      if (!payment.paid) return;
      if (payment.sessionId && payment.sessionId !== sessionId) return;

      const target: DownloadType | null =
        payment.downloadTarget === 'py' || payment.product === 'python-script'
          ? 'py'
          : payment.downloadTarget === 'ipynb' || payment.product === 'jupyter-notebook'
            ? 'ipynb'
            : null;

      if (!target) return;

      setPaidTypes(prev => new Set([...prev, target]));
      sessionStorage.removeItem('ownquesta_model_payment');
      window.history.replaceState({}, '', window.location.pathname);

      window.setTimeout(() => {
        if (target === 'py') doDownloadPy();
        if (target === 'ipynb') void doDownloadNotebook();
      }, 150);
    } catch {
      // ignore invalid payment cache
    }
  }, [sessionId, doDownloadPy, doDownloadNotebook]);

  const claimFreeDownload = (type: DownloadType) => {
    if (typeof window === 'undefined') return false;

    try {
      const raw = window.localStorage.getItem(FREE_DOWNLOADS_KEY);
      const usage = raw ? JSON.parse(raw) as Record<string, number> : {};
      const current = usage[type] ?? 0;

      if (current >= 1) return false;

      window.localStorage.setItem(
        FREE_DOWNLOADS_KEY,
        JSON.stringify({ ...usage, [type]: current + 1 }),
      );
      return true;
    } catch {
      return false;
    }
  };

  // ── Download click handlers — first download free, then payment ───────────
  const handleDownloadPy = () => {
    if (paidTypes.has('py')) { doDownloadPy(); return; }
    if (claimFreeDownload('py')) { doDownloadPy(); return; }
    setPayModal('py');
  };

  const handleDownloadNotebook = () => {
    if (dlNotebook) return;
    if (paidTypes.has('ipynb')) { doDownloadNotebook(); return; }
    if (claimFreeDownload('ipynb')) { void doDownloadNotebook(); return; }
    setPayModal('ipynb');
  };

  // ── Payment success ───────────────────────────────────────────────────────
  const handlePaySuccess = () => {
    const type = payModal!;
    const nextPaid = new Set<DownloadType>([...paidTypes, type]);
    setPaidTypes(nextPaid);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'ownquesta_export_access',
        JSON.stringify({
          paid: true,
          sessionId,
          types: Array.from(nextPaid),
          downloadTarget: type,
          grantedAt: Date.now(),
        }),
      );
      sessionStorage.setItem(
        'ownquesta_model_payment',
        JSON.stringify({
          paid: true,
          product: type === 'py' ? 'python-script' : 'jupyter-notebook',
          sessionId,
          downloadTarget: type,
          paidAt: Date.now(),
        }),
      );
    }

    setPayModal(null);
    setTimeout(() => {
      if (type === 'py') doDownloadPy();
      if (type === 'ipynb') doDownloadNotebook();
    }, 300);
  };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendChat = useCallback(async () => {
    const msg = chatInput.trim();
    if (!msg || chatBusy) return;
    setChatInput('');
    setChatMsgs(p => [...p, { role: 'user', content: msg }]);
    setChatBusy(true);
    try {
      const res = await fetch(`${AGENT_URL}/v2/script-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: msg, script, model_id: selectedModel }),
      });
      const d = await res.json();
      setChatMsgs(p => [...p, { role: 'assistant', content: d.reply || '(no reply)' }]);
      if (d.changed && d.updated_script) {
        setScript(d.updated_script);
        setChatMsgs(p => [...p, { role: 'assistant', content: '**Script updated** — the editor has been refreshed with the new code.' }]);
      }
    } catch (e: any) {
      setChatMsgs(p => [...p, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally { setChatBusy(false); }
  }, [chatInput, chatBusy, sessionId, script, selectedModel]);

  const selectedModelObj = models.find(m => m.id === selectedModel);

  // ── Styles ────────────────────────────────────────────────────────────────
  const S = {
    root:       { height: '100vh', display: 'flex', flexDirection: 'column' as const, background: '#080912', color: '#e6eef8', fontFamily: "'Chillax','Inter',sans-serif", overflow: 'hidden' },
    header:     { height: 52, flexShrink: 0, background: 'rgba(10,11,20,0.95)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    body:       { flex: 1, display: 'flex', minHeight: 0 },
    leftPanel:  { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, borderRight: '1px solid rgba(255,255,255,0.06)' },
    rightPanel: { width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column' as const },
    btn: (color = '#a87edf', bg = 'rgba(110,84,200,0.15)', border = 'rgba(110,84,200,0.35)'): React.CSSProperties => ({
      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8,
      border: `1px solid ${border}`, background: bg, color, fontSize: 12, fontWeight: 600,
      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    }),
  };

  return (
    <div style={S.root}>

      {/* ── Header ── */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => router.back()} style={S.btn('#94a3b8', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0.1)')}>
            ← Back
          </button>
          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: 16 }}>🐍</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Script Editor</span>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' as const, background: 'rgba(110,84,200,0.18)', border: '1px solid rgba(110,84,200,0.35)', color: '#a87edf' }}>BETA</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Run */}
          <button onClick={runScript} disabled={isRunning}
            style={S.btn(
              isRunning ? '#475569' : '#4ade80',
              isRunning ? 'rgba(74,222,128,0.04)' : 'rgba(74,222,128,0.12)',
              isRunning ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.4)',
            )}>
            {isRunning ? <><SpinIcon />Running…</> : <><PlayIcon />Run Script</>}
          </button>

          <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.08)' }} />

          {/* Download .py — shows lock if not paid */}
          <button onClick={handleDownloadPy}
            style={S.btn(
              paidTypes.has('py') ? '#60a5fa' : '#94a3b8',
              paidTypes.has('py') ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.04)',
              paidTypes.has('py') ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.12)',
            )}>
            {paidTypes.has('py') ? <DownloadIcon /> : <LockIcon />}
            Download .py
            {!paidTypes.has('py') && <PriceTag price={DOWNLOAD_PRICE} />}
          </button>

          {/* Download .ipynb — shows lock if not paid */}
          <button onClick={handleDownloadNotebook} disabled={dlNotebook}
            style={S.btn(
              paidTypes.has('ipynb') ? '#fbbf24' : '#94a3b8',
              paidTypes.has('ipynb') ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)',
              paidTypes.has('ipynb') ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.12)',
            )}>
            {dlNotebook
              ? <><SpinIcon />…</>
              : paidTypes.has('ipynb')
                ? <><DownloadIcon />Download .ipynb</>
                : <><LockIcon />Download .ipynb<PriceTag price={DOWNLOAD_PRICE} /></>
            }
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={S.body}>

        {/* Left: editor + terminal */}
        <div style={S.leftPanel}>

          {/* Editor */}
          <div style={{ flex: '0 0 60%', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#a87edf' }}>●</span> pipeline.py
              <span style={{ marginLeft: 'auto', color: '#475569' }}>{script.split('\n').length} lines</span>
            </div>
            <div style={{ flex: 1, overflow: 'auto' }}>
              <CodeMirror
                value={script}
                onChange={setScript}
                extensions={[python()]}
                theme={oneDark}
                style={{ fontSize: 13, height: '100%' }}
                basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true }}
              />
            </div>
          </div>

          {/* Terminal output */}
          <div style={{ flex: '0 0 40%', minHeight: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#4ade80' }}>●</span> Terminal Output
              {isRunning && <span style={{ color: '#fbbf24', marginLeft: 4 }}>running…</span>}
              {output.length > 0 && !isRunning && (
                <button onClick={() => setOutput([])} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#475569', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
              )}
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '10px 16px', fontFamily: 'ui-monospace,SFMono-Regular,monospace', fontSize: 12, lineHeight: 1.6 }}>
              {output.length === 0 && !isRunning && (
                <span style={{ color: '#334155' }}>Press "Run Script" to execute…</span>
              )}
              {output.map((line, i) => (
                <div key={i} style={{ color: line.type === 'err' ? '#f87171' : line.type === 'status' ? '#a87edf' : '#94a3b8', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {line.text}
                </div>
              ))}
              <div ref={outputEndRef} />
            </div>
          </div>
        </div>

        {/* Right: AI Chat */}
        <div style={S.rightPanel}>

          {/* Chat header with model selector */}
          <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <span style={{ fontWeight: 700, fontSize: 13, flex: 1 }}>AI Assistant</span>

            {/* Model picker */}
            <div ref={modelDropRef} style={{ position: 'relative' }}>
              <button onClick={() => setModelDropOpen(o => !o)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(110,84,200,0.4)', background: 'rgba(110,84,200,0.12)', color: '#c4b5fd', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                {selectedModelObj?.short_name ?? selectedModel}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ transform: modelDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><path d="M5 7L1 3h8L5 7z"/></svg>
              </button>

              {modelDropOpen && models.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'rgba(10,12,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, minWidth: 200, zIndex: 200, overflow: 'hidden', backdropFilter: 'blur(16px)' }}>
                  {['openai', 'anthropic'].map(provider => {
                    const group = models.filter(m => m.provider === provider);
                    if (!group.length) return null;
                    return (
                      <div key={provider}>
                        <div style={{ padding: '6px 12px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: provider === 'anthropic' ? '#f97316' : '#60a5fa' }}>
                          {provider === 'anthropic' ? 'Anthropic' : 'OpenAI'}
                        </div>
                        {group.map(m => (
                          <button key={m.id} onClick={() => { setSelectedModel(m.id); setModelDropOpen(false); }}
                            style={{ width: '100%', textAlign: 'left', padding: '7px 12px', background: m.id === selectedModel ? 'rgba(110,84,200,0.2)' : 'none', border: 'none', color: m.id === selectedModel ? '#c4b5fd' : '#94a3b8', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{m.short_name}</span>
                            {m.id === selectedModel && <span style={{ color: '#a87edf' }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chatMsgs.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '90%', padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg,#4a3aad,#6e54c8)' : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  fontSize: 13, lineHeight: 1.55, color: '#e2e8f0',
                }}>
                  {msg.role === 'assistant'
                    ? <span dangerouslySetInnerHTML={{ __html: renderMd(msg.content) }} />
                    : msg.content}
                </div>
              </div>
            ))}
            {chatBusy && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12 }}>
                <SpinIcon />Thinking…
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
              placeholder="Ask to modify, explain, or debug the script…"
              rows={2}
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 10px', color: '#e2e8f0', fontSize: 12, resize: 'none', fontFamily: 'inherit', outline: 'none' }}
            />
            <button onClick={sendChat} disabled={chatBusy || !chatInput.trim()}
              style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(110,84,200,0.5)', background: chatBusy || !chatInput.trim() ? 'rgba(110,84,200,0.06)' : 'rgba(110,84,200,0.25)', color: chatBusy || !chatInput.trim() ? '#475569' : '#c4b5fd', cursor: chatBusy || !chatInput.trim() ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>
              {chatBusy ? <SpinIcon /> : '↑'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Payment Modal ── */}
      {payModal && (
        <PaymentModal
          downloadType={payModal}
          onClose={() => setPayModal(null)}
          onSuccess={handlePaySuccess}
        />
      )}
    </div>
  );
}

// ── Inline price tag ──────────────────────────────────────────────────────────
function PriceTag({ price }: { price: number }) {
  return (
    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(168,126,223,0.15)', border: '1px solid rgba(168,126,223,0.3)', color: '#a87edf', marginLeft: 2 }}>
      ${price}
    </span>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function PlayIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><polygon points="2,1 11,6 2,11"/></svg>;
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function SpinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2a10 10 0 0 1 10 10"/>
    </svg>
  );
}