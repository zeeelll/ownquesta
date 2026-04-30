'use client';

import { Rocket, Zap, Shield, BarChart2, Globe, Clock } from 'lucide-react';
import DashboardShell from '../components/DashboardShell';

const features = [
  {
    icon: <Rocket size={20} />,
    title: 'One-Click Deployment',
    description: 'Deploy your trained models directly from OwnQuesta with a single click — no infrastructure setup required.',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.15)',
  },
  {
    icon: <BarChart2 size={20} />,
    title: 'Real-Time Monitoring',
    description: 'Track model performance, prediction latency, and data drift with built-in Prometheus dashboards.',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.12)',
  },
  {
    icon: <Zap size={20} />,
    title: 'Auto-Scaling',
    description: 'Automatically scale replicas up or down based on traffic — your model stays fast under any load.',
    color: '#c084fc',
    glow: 'rgba(192,132,252,0.12)',
  },
  {
    icon: <Shield size={20} />,
    title: 'Secure Endpoints',
    description: 'Every deployed model gets a private, authenticated REST endpoint with TLS encryption out of the box.',
    color: '#60a5fa',
    glow: 'rgba(96,165,250,0.12)',
  },
  {
    icon: <Globe size={20} />,
    title: 'Global Edge Network',
    description: 'Serve predictions with low latency from data centers close to your users around the world.',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.12)',
  },
];

export default function MyDeploymentsPage() {
  return (
    <DashboardShell activePath="/my-deployments">
      <div style={{ padding: '40px 32px 80px' }}>
        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 8px rgba(192,132,252,0.7)', display: 'inline-block' }}/>
            <span style={{ fontFamily: 'var(--font-body, sans-serif)', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#c7d3e3' }}>MLOps · Coming Soon</span>
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#e6eef8', marginBottom: 10, lineHeight: 1.2 }}>
            My <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Deployments</span>
          </h1>
          <p style={{ fontSize: 14, color: '#9caec2', maxWidth: 520, lineHeight: 1.7 }}>
            We&apos;re building a first-class deployment platform so you can take your trained models straight from the AutoML Playground to production — entirely inside OwnQuesta.
          </p>
        </div>

        {/* Coming Soon badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          border: '1px solid rgba(192,132,252,0.3)', background: 'rgba(192,132,252,0.06)',
          borderRadius: 999, padding: '7px 18px', fontSize: 12, color: '#c084fc',
          fontWeight: 600, letterSpacing: '0.04em', marginBottom: 36,
        }}>
          <Clock size={13} />
          Coming Soon
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>
          {features.map(f => (
            <div key={f.title} style={{
              background: 'linear-gradient(155deg, #1c1c1c 0%, #141414 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 22,
              padding: '22px 20px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.22s, box-shadow 0.22s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 14px 34px rgba(0,0,0,0.3), 0 0 24px ${f.glow}`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: f.glow, border: `1px solid ${f.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color, marginBottom: 14,
              }}>
                {f.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#e6eef8' }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#6b7f97', lineHeight: 1.65 }}>{f.description}</div>
            </div>
          ))}
        </div>

        {/* CTA note */}
        <div style={{
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 22,
          padding: '28px 32px',
          background: 'linear-gradient(155deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
          maxWidth: 560,
        }}>
          <Rocket size={26} style={{ color: '#818cf8', marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 13, color: '#c7d3e3', lineHeight: 1.75 }}>
            Your model is trained and ready. Once MLOps deployment launches, you&apos;ll be able to deploy it to a live endpoint directly from your AutoML project — no extra steps.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
