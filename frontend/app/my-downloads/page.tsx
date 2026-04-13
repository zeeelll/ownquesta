'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getMyDownloads();
        if (active) setItems((data?.downloads || []) as DownloadItem[]);
      } catch (err: any) {
        if (active) setError(err?.message || 'Unable to load downloads');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#070b16', color: '#e2e8f0', padding: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>My Downloads</h1>
            <p style={{ marginTop: 6, color: '#94a3b8', fontSize: 13 }}>Purchased file outputs unlocked by payment.</p>
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ border: '1px solid rgba(148,163,184,0.25)', background: 'rgba(15,23,42,0.7)', color: '#cbd5e1', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}>
            Back to Dashboard
          </button>
        </div>

        {loading && <p style={{ color: '#94a3b8' }}>Loading downloads...</p>}
        {!!error && <p style={{ color: '#fca5a5' }}>{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div style={{ border: '1px solid rgba(148,163,184,0.2)', borderRadius: 14, padding: 18, background: 'rgba(15,23,42,0.45)', color: '#94a3b8' }}>
            No downloads yet. Complete a payment for file export in AutoML Playground.
          </div>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          {items.map((item) => (
            <div key={item.orderId} style={{ border: '1px solid rgba(52,211,153,0.25)', borderRadius: 14, padding: 14, background: 'rgba(6,20,18,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.modelName}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>Order {item.orderId} • {item.product}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#34d399', fontWeight: 700 }}>Unlocked</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>INR {Number(item.amountInr || 0).toFixed(2)}</div>
                </div>
              </div>
              <div style={{ marginTop: 9, fontSize: 12, color: '#99f6e4' }}>Formats: {item.formats.join(', ')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
