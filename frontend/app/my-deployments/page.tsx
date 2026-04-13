'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, RefreshCw, ArrowLeft, Copy, ExternalLink, Minus, Plus, Activity } from 'lucide-react';
import Logo from '../components/Logo';
import { getMyDeployments, scaleMyDeployment } from '@/services/api';

type DeploymentItem = {
  _id: string;
  modelName: string;
  paymentOrderId: string;
  status: string;
  endpointUrl?: string;
  replicas: number;
  minReplicas: number;
  maxReplicas: number;
  monitoringEnabled?: boolean;
  autoscalingEnabled?: boolean;
  updatedAt?: string;
};

export default function MyDeploymentsPage() {
  const router = useRouter();
  const [items, setItems] = useState<DeploymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string>('');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string>('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyDeployments();
      setItems((data?.deployments || []) as DeploymentItem[]);
    } catch (err: any) {
      setError(err?.message || 'Unable to load deployments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleScale = async (id: string, replicas: number) => {
    if (replicas < 1) return;
    try {
      setBusyId(id);
      setError('');
      await scaleMyDeployment(id, replicas);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Scaling failed');
    } finally {
      setBusyId('');
    }
  };

  const copyText = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(text);
      setTimeout(() => setCopiedEndpoint(''), 1400);
    } catch {
      setError('Unable to copy endpoint URL.');
    }
  };

  const summary = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => (i.status || '').toLowerCase().includes('active') || (i.status || '').toLowerCase().includes('ready')).length;
    const pending = items.filter((i) => (i.status || '').toLowerCase().includes('provision') || (i.status || '').toLowerCase().includes('pending')).length;
    const totalReplicas = items.reduce((s, i) => s + Number(i.replicas || 0), 0);
    return { total, active, pending, totalReplicas };
  }, [items]);

  const statusTone = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('active') || s.includes('ready')) return { color: '#86efac', border: 'rgba(74,222,128,0.4)', bg: 'rgba(22,163,74,0.18)' };
    if (s.includes('pending') || s.includes('provision')) return { color: '#fde68a', border: 'rgba(251,191,36,0.4)', bg: 'rgba(245,158,11,0.18)' };
    if (s.includes('failed') || s.includes('error')) return { color: '#fda4af', border: 'rgba(244,114,182,0.4)', bg: 'rgba(190,24,93,0.18)' };
    return { color: '#ddd6fe', border: 'rgba(216,180,254,0.4)', bg: 'rgba(168,85,247,0.2)' };
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0616', color: '#f3e8ff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, borderBottom: '1px solid rgba(216,180,254,0.2)', background: 'rgba(17,7,34,0.9)', backdropFilter: 'blur(14px)' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Logo href="/home" size="md" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => void load()} style={{ border: '1px solid rgba(216,180,254,0.35)', background: 'rgba(30,13,56,0.72)', color: '#f5d0fe', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={() => router.push('/dashboard')} style={{ border: '1px solid rgba(216,180,254,0.35)', background: 'rgba(30,13,56,0.72)', color: '#f5d0fe', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={14} /> Dashboard
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}><Rocket size={24} /> My Deployments</h1>
          <p style={{ margin: '6px 0 0', color: '#d8b4fe', fontSize: 14 }}>Manage production MLOps deployments, scaling, and endpoint access.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 14 }}>
          <StatCard label="Total Deployments" value={String(summary.total)} tone="violet" />
          <StatCard label="Active" value={String(summary.active)} tone="green" />
          <StatCard label="Pending" value={String(summary.pending)} tone="amber" />
          <StatCard label="Total Replicas" value={String(summary.totalReplicas)} tone="blue" />
        </div>

        {loading && <p style={{ color: '#d8b4fe' }}>Loading deployments...</p>}
        {!!error && <p style={{ color: '#fda4af' }}>{error}</p>}

        {!loading && !error && items.length === 0 && (
          <div style={{ border: '1px solid rgba(216,180,254,0.25)', borderRadius: 14, padding: 18, background: 'rgba(59,7,100,0.24)', color: '#d8b4fe' }}>
            No deployments yet. Complete a Deploy MLOps payment in AutoML Playground.
          </div>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          {items.map((item) => (
            <div key={item._id} style={{ border: '1px solid rgba(216,180,254,0.35)', borderRadius: 14, padding: 14, background: 'rgba(59,7,100,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{item.modelName}</div>
                  <div style={{ fontSize: 12, color: '#e9d5ff' }}>Order {item.paymentOrderId}</div>
                </div>
                <div style={{ fontSize: 12, padding: '3px 8px', borderRadius: 999, border: `1px solid ${statusTone(item.status).border}`, background: statusTone(item.status).bg, color: statusTone(item.status).color }}>{item.status || 'unknown'}</div>
              </div>

              <div style={{ marginTop: 8, fontSize: 12, color: '#f5d0fe', wordBreak: 'break-all' }}>Endpoint: {item.endpointUrl || 'pending'}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#d8b4fe' }}>Replicas: {item.replicas} (min {item.minReplicas}, max {item.maxReplicas})</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#d8b4fe' }}>
                Monitoring: {item.monitoringEnabled ? 'Prometheus enabled' : 'disabled'} • Autoscaling: {item.autoscalingEnabled ? 'enabled' : 'disabled'}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Activity size={13} /> Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}
              </div>

              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => copyText(item.endpointUrl)}
                  disabled={!item.endpointUrl}
                  style={{ border: '1px solid rgba(216,180,254,0.35)', background: 'rgba(76,29,149,0.45)', color: '#f5d0fe', borderRadius: 8, padding: '6px 10px', cursor: item.endpointUrl ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Copy size={13} /> {copiedEndpoint === item.endpointUrl ? 'Copied' : 'Copy endpoint'}
                </button>
                <button
                  onClick={() => item.endpointUrl && window.open(item.endpointUrl, '_blank', 'noopener,noreferrer')}
                  disabled={!item.endpointUrl}
                  style={{ border: '1px solid rgba(216,180,254,0.35)', background: 'rgba(76,29,149,0.45)', color: '#f5d0fe', borderRadius: 8, padding: '6px 10px', cursor: item.endpointUrl ? 'pointer' : 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ExternalLink size={13} /> Open endpoint
                </button>
              </div>

              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleScale(item._id, item.replicas - 1)}
                  disabled={busyId === item._id || item.replicas <= item.minReplicas}
                  style={{ border: '1px solid rgba(216,180,254,0.35)', background: 'rgba(76,29,149,0.45)', color: '#f5d0fe', borderRadius: 8, padding: '6px 10px', cursor: (busyId === item._id || item.replicas <= item.minReplicas) ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Minus size={13} /> Scale -1
                </button>
                <button
                  onClick={() => handleScale(item._id, item.replicas + 1)}
                  disabled={busyId === item._id || item.replicas >= item.maxReplicas}
                  style={{ border: '1px solid rgba(244,114,182,0.35)', background: 'rgba(157,23,77,0.4)', color: '#fbcfe8', borderRadius: 8, padding: '6px 10px', cursor: (busyId === item._id || item.replicas >= item.maxReplicas) ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={13} /> Scale +1
                </button>
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
    violet: { border: 'rgba(216,180,254,0.35)', bg: 'rgba(168,85,247,0.14)', value: '#f5d0fe' },
    amber: { border: 'rgba(251,191,36,0.35)', bg: 'rgba(245,158,11,0.12)', value: '#fde68a' },
  };
  const c = tones[tone];
  return (
    <div style={{ border: `1px solid ${c.border}`, background: c.bg, borderRadius: 12, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: '#d8b4fe' }}>{label}</div>
      <div style={{ marginTop: 4, fontWeight: 800, color: c.value, fontSize: 18 }}>{value}</div>
    </div>
  );
}
