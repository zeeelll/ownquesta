'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, RefreshCw, Search, ArrowLeft, BadgeCheck, FileCode2 } from 'lucide-react';
import Logo from '../components/Logo';
import { getMyDownloads } from '@/services/api';

type DownloadItem = {
  orderId: string;
  product: string;
  modelName: string;
  productType: string;
  amountInr: number;
  paidAt?: string;
  status: string;
  formats: string[];
};

export default function MyDownloadsPage() {
  const router = useRouter();
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyDownloads();
      setItems((data?.downloads || []) as DownloadItem[]);
    } catch (err: any) {
      setError(err?.message || 'Unable to load downloads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [item.modelName, item.orderId, item.product, item.productType, item.status, ...(item.formats || [])]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const summary = useMemo(() => {
    const total = items.length;
    const paid = items.filter((i) => Number(i.amountInr || 0) > 0).length;
    const free = total - paid;
    const totalSpent = items.reduce((s, i) => s + Number(i.amountInr || 0), 0);
    return { total, paid, free, totalSpent };
  }, [items]);

  const formatDate = (v?: string) => {
    if (!v) return 'N/A';
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#070b16', color: '#e2e8f0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, borderBottom: '1px solid rgba(148,163,184,0.18)', background: 'rgba(7,11,22,0.9)', backdropFilter: 'blur(14px)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Logo href="/home" size="md" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => void load()} style={{ border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(15,23,42,0.7)', color: '#cbd5e1', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => router.push('/dashboard')} style={{ border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(15,23,42,0.7)', color: '#cbd5e1', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Dashboard
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>My Downloads</h1>
          <p style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: 14 }}>Track your unlocked files and export history from AutoML Playground.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
          <StatCard label="Total Items" value={String(summary.total)} tone="blue" />
          <StatCard label="Paid Items" value={String(summary.paid)} tone="green" />
          <StatCard label="Free Items" value={String(summary.free)} tone="violet" />
          <StatCard label="Total Spend" value={`INR ${summary.totalSpent.toFixed(2)}`} tone="amber" />
        </div>

        <div style={{ marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#64748b' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by model, order ID, product, format..."
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid rgba(148,163,184,0.22)', background: 'rgba(15,23,42,0.66)', color: '#e2e8f0', borderRadius: 10, padding: '9px 12px 9px 32px', outline: 'none', fontSize: 13 }}
            />
          </div>
        </div>

        {loading && <p style={{ color: '#94a3b8' }}>Loading downloads...</p>}
        {!!error && <p style={{ color: '#fca5a5' }}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ border: '1px solid rgba(148,163,184,0.2)', borderRadius: 14, padding: 18, background: 'rgba(15,23,42,0.45)', color: '#94a3b8' }}>
            {items.length === 0
              ? 'No downloads yet. Export files from AutoML Playground and they will appear here.'
              : 'No items match your search.'}
          </div>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map((item) => (
            <div key={item.orderId} style={{ border: '1px solid rgba(52,211,153,0.25)', borderRadius: 14, padding: 14, background: 'rgba(6,20,18,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Download size={14} /> {item.modelName || 'Model'}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Order {item.orderId} • {item.product}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#34d399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}><BadgeCheck size={14} /> Unlocked</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>INR {Number(item.amountInr || 0).toFixed(2)}</div>
                </div>
              </div>

              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(item.formats || []).map((fmt) => (
                  <span key={`${item.orderId}-${fmt}`} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(52,211,153,0.4)', color: '#99f6e4', background: 'rgba(16,185,129,0.12)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <FileCode2 size={12} /> {fmt}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
                Status: {item.status || 'completed'} • Paid at: {formatDate(item.paidAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'green' | 'violet' | 'amber' }) {
  const tones: Record<string, { border: string; bg: string; value: string }> = {
    blue: { border: 'rgba(96,165,250,0.35)', bg: 'rgba(59,130,246,0.12)', value: '#bfdbfe' },
    green: { border: 'rgba(52,211,153,0.35)', bg: 'rgba(16,185,129,0.12)', value: '#86efac' },
    violet: { border: 'rgba(167,139,250,0.35)', bg: 'rgba(139,92,246,0.12)', value: '#ddd6fe' },
    amber: { border: 'rgba(251,191,36,0.35)', bg: 'rgba(245,158,11,0.12)', value: '#fde68a' },
  };
  const c = tones[tone];
  return (
    <div style={{ border: `1px solid ${c.border}`, background: c.bg, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: '#94a3b8' }}>{label}</div>
      <div style={{ marginTop: 4, fontWeight: 800, color: c.value, fontSize: 18 }}>{value}</div>
    </div>
  );
}
