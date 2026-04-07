'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const LOGO_LOOPS = 3;

export default function LoadingScreen({ onComplete, duration = 6200 }: LoadingScreenProps) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsComplete(true);
      if (onComplete) {
        window.setTimeout(onComplete, 500);
      }
    }, duration);

    return () => window.clearTimeout(timer);
  }, [duration, onComplete]);

  const P = 'M 90,50 A 40,13 0 0 1 10,50 A 40,13 0 0 1 90,50';
  const DA = '0.13 0.37 0.13 0.37';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-[600ms] ${
        isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 40%, rgba(124,58,237,0.14) 0%, rgba(0,0,0,0) 38%), radial-gradient(circle at 50% 60%, rgba(167,139,250,0.09) 0%, rgba(0,0,0,0) 46%), #000000',
      }}
    >
      <style>{`
        @keyframes logoIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes ownq-dash {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -1;
          }
        }

        @keyframes glowBreath {
          0%, 100% {
            opacity: 0.18;
            transform: scale(1);
          }
          50% {
            opacity: 0.28;
            transform: scale(1.07);
          }
        }

        .logo-container {
          animation: logoIn 1.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .glow-ring {
          animation: glowBreath 3.8s ease-in-out infinite;
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="glow-ring absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 72%)',
            filter: 'blur(90px)',
          }}
        />
      </div>

      <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 px-4">
        <div className="logo-container">
          <div
            style={{
              filter: 'drop-shadow(0 0 18px rgba(167,139,250,0.95)) drop-shadow(0 0 38px rgba(109,40,217,0.7)) brightness(1.5)',
              lineHeight: 0,
            }}
          >
            <svg
              width="min(72vw, 460px)"
              height="min(72vw, 460px)"
              viewBox="0 0 100 100"
              fill="none"
              overflow="visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="rg" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="1.2" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="sg-out" x="-400%" y="-400%" width="900%" height="900%">
                  <feGaussianBlur stdDeviation="4.5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="sg-in" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="1" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="ng" x="-250%" y="-250%" width="600%" height="600%">
                  <feGaussianBlur stdDeviation="7" result="outer" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="inner" />
                  <feMerge>
                    <feMergeNode in="outer" />
                    <feMergeNode in="outer" />
                    <feMergeNode in="inner" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <radialGradient id="ngrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="22%" stopColor="#ede9fe" />
                  <stop offset="52%" stopColor="#7c3aed" stopOpacity="0.75" />
                  <stop offset="82%" stopColor="#4c1d95" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#1e0048" stopOpacity="0" />
                </radialGradient>
              </defs>

              <g>
                <path d={P} stroke="rgba(167,139,250,0.45)" strokeWidth="0.75" fill="none" filter="url(#rg)" />
                <path
                  d={P}
                  pathLength="1"
                  fill="none"
                  stroke="rgba(167,139,250,0.85)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={DA}
                  filter="url(#sg-out)"
                  style={{ animation: `ownq-dash 2.4s linear ${LOGO_LOOPS}` }}
                />
                <path
                  d={P}
                  pathLength="1"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeDasharray={DA}
                  filter="url(#sg-in)"
                  style={{ animation: `ownq-dash 2.4s linear ${LOGO_LOOPS}` }}
                />
              </g>

              <g transform="rotate(58 50 50)">
                <path d={P} stroke="rgba(139,92,246,0.45)" strokeWidth="0.75" fill="none" filter="url(#rg)" />
                <path
                  d={P}
                  pathLength="1"
                  fill="none"
                  stroke="rgba(139,92,246,0.9)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={DA}
                  filter="url(#sg-out)"
                  style={{ animation: `ownq-dash 2.8s linear ${LOGO_LOOPS}` }}
                />
                <path
                  d={P}
                  pathLength="1"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeDasharray={DA}
                  filter="url(#sg-in)"
                  style={{ animation: `ownq-dash 2.8s linear ${LOGO_LOOPS}` }}
                />
              </g>

              <g transform="rotate(-58 50 50)">
                <path d={P} stroke="rgba(124,58,237,0.45)" strokeWidth="0.75" fill="none" filter="url(#rg)" />
                <path
                  d={P}
                  pathLength="1"
                  fill="none"
                  stroke="rgba(180,130,255,0.88)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={DA}
                  filter="url(#sg-out)"
                  style={{ animation: `ownq-dash 2.1s linear ${LOGO_LOOPS}` }}
                />
                <path
                  d={P}
                  pathLength="1"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeDasharray={DA}
                  filter="url(#sg-in)"
                  style={{ animation: `ownq-dash 2.1s linear ${LOGO_LOOPS}` }}
                />
              </g>

              <circle cx="50" cy="50" r="20" fill="url(#ngrad)" filter="url(#ng)" opacity="0.9" />
              <circle cx="50" cy="50" r="6" fill="#ede9fe" opacity="0.9" />
              <circle cx="50" cy="50" r="3.5" fill="white" />
            </svg>
          </div>
        </div>

      </div>
    </div>
  );
}
