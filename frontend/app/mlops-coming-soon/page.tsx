'use client';

import { useRouter } from 'next/navigation';
import { Rocket, Zap, Shield, BarChart2, Globe, ArrowLeft, Clock } from 'lucide-react';
import Logo from '../components/Logo';

const features = [
  {
    icon: <Rocket size={22} />,
    title: 'One-Click Deployment',
    description: 'Deploy your trained models directly from OwnQuesta with a single click — no infrastructure setup required.',
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Real-Time Monitoring',
    description: 'Track model performance, prediction latency, and data drift with built-in Prometheus dashboards.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Auto-Scaling',
    description: 'Automatically scale replicas up or down based on traffic — your model stays fast under any load.',
  },
  {
    icon: <Shield size={22} />,
    title: 'Secure Endpoints',
    description: 'Every deployed model gets a private, authenticated REST endpoint with TLS encryption out of the box.',
  },
  {
    icon: <Globe size={22} />,
    title: 'Global Edge Network',
    description: 'Serve predictions with low latency from data centers close to your users around the world.',
  },
];

export default function MlopsComingSoonPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0616',
        color: '#f3e8ff',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderBottom: '1px solid rgba(216,180,254,0.2)',
          background: 'rgba(17,7,34,0.9)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Logo href="/home" size="md" />
          <button
            onClick={() => router.back()}
            style={{
              border: '1px solid rgba(216,180,254,0.35)',
              background: 'rgba(30,13,56,0.72)',
              color: '#f5d0fe',
              borderRadius: 10,
              padding: '8px 14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </header>

      {/* Hero */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '60px 20px 80px',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(192,132,252,0.45)',
            background: 'rgba(192,132,252,0.1)',
            borderRadius: 999,
            padding: '6px 16px',
            fontSize: 13,
            color: '#d8b4fe',
            marginBottom: 28,
          }}
        >
          <Clock size={14} />
          Coming Soon
        </div>

        {/* Title */}
        <h1
          style={{
            margin: 0,
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.15,
            background: 'linear-gradient(135deg, #f5d0fe 0%, #a78bfa 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            maxWidth: 700,
          }}
        >
          MLOps Deployment — Powered by OwnQuesta
        </h1>

        <p
          style={{
            marginTop: 20,
            maxWidth: 580,
            textAlign: 'center',
            color: '#c4b5fd',
            fontSize: 16,
            lineHeight: 1.7,
          }}
        >
          We&apos;re building a first-class deployment platform so you can take your trained models straight from
          the AutoML Playground to production — entirely inside OwnQuesta, no external cloud accounts needed.
        </p>

        {/* Glow divider */}
        <div
          style={{
            width: 120,
            height: 3,
            borderRadius: 999,
            background: 'linear-gradient(90deg, #a78bfa, #818cf8)',
            margin: '40px auto',
            boxShadow: '0 0 18px rgba(167,139,250,0.5)',
          }}
        />

        {/* Feature cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            width: '100%',
            maxWidth: 1000,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                border: '1px solid rgba(216,180,254,0.25)',
                borderRadius: 16,
                padding: '22px 20px',
                background: 'rgba(59,7,100,0.22)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: 'rgba(167,139,250,0.18)',
                  border: '1px solid rgba(167,139,250,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c4b5fd',
                  marginBottom: 14,
                }}
              >
                {f.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#c4b5fd', lineHeight: 1.6 }}>{f.description}</div>
            </div>
          ))}
        </div>

        {/* CTA note */}
        <div
          style={{
            marginTop: 52,
            border: '1px solid rgba(192,132,252,0.3)',
            borderRadius: 16,
            padding: '24px 32px',
            background: 'rgba(76,29,149,0.18)',
            maxWidth: 560,
            textAlign: 'center',
          }}
        >
          <Rocket size={28} style={{ color: '#d8b4fe', marginBottom: 10 }} />
          <p style={{ margin: 0, fontSize: 15, color: '#e9d5ff', lineHeight: 1.7 }}>
            Your model is trained and ready. Once MLOps deployment launches, you&apos;ll be able to deploy it
            to a live endpoint directly from your AutoML project — no extra steps.
          </p>
          <button
            onClick={() => router.push('/automl')}
            style={{
              marginTop: 20,
              border: '1px solid rgba(192,132,252,0.45)',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(109,40,217,0.6))',
              color: '#f5d0fe',
              borderRadius: 10,
              padding: '10px 22px',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <ArrowLeft size={14} /> Back to AutoML Playground
          </button>
        </div>
      </div>
    </div>
  );
}
