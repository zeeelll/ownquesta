'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    try {
      await scaleMyDeployment(id, replicas);
      await load();
    } catch (err: any) {
      setError(err?.message || 'Scaling failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0616', color: '#f3e8ff', padding: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>My Deployments</h1>
            <p style={{ marginTop: 6, color: '#d8b4fe', fontSize: 13 }}>Manage production MLOps deployments, monitoring, and autoscaling.</p>
          </div>
          <button onClick={() => router.push('/dashboard')} style={{ border: '1px solid rgba(216,180,254,0.35)', background: 'rgba(30,13,56,0.72)', color: '#f5d0fe', borderRadius: 10, padding: '8px 12px', cursor: 'pointer' }}>
            Back to Dashboard
          </button>
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
                <div style={{ fontSize: 12, padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(216,180,254,0.45)', background: 'rgba(216,180,254,0.12)' }}>{item.status}</div>
              </div>

              <div style={{ marginTop: 8, fontSize: 12, color: '#f5d0fe' }}>Endpoint: {item.endpointUrl || 'pending'}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#d8b4fe' }}>Replicas: {item.replicas} (min {item.minReplicas}, max {item.maxReplicas})</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#d8b4fe' }}>
                Monitoring: {item.monitoringEnabled ? 'Prometheus enabled' : 'disabled'} • Autoscaling: {item.autoscalingEnabled ? 'enabled' : 'disabled'}
              </div>

              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button onClick={() => handleScale(item._id, item.replicas - 1)} style={{ border: '1px solid rgba(216,180,254,0.35)', background: 'rgba(76,29,149,0.45)', color: '#f5d0fe', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
                  Scale -1
                </button>
                <button onClick={() => handleScale(item._id, item.replicas + 1)} style={{ border: '1px solid rgba(244,114,182,0.35)', background: 'rgba(157,23,77,0.4)', color: '#fbcfe8', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
                  Scale +1
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
