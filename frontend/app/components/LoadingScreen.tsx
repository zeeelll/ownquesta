'use client';

import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const LOGO_LOOPS = 3;
const DEFAULT_DURATION = 6800;
const BLAST_DELAY = 5200;

export default function LoadingScreen({ onComplete, duration = DEFAULT_DURATION }: LoadingScreenProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [isBlast, setIsBlast] = useState(false);

  useEffect(() => {
    const blastTimer = window.setTimeout(() => {
      setIsBlast(true);
    }, Math.min(BLAST_DELAY, Math.max(0, duration - 1400)));

    const timer = window.setTimeout(() => {
      setIsComplete(true);
      if (onComplete) {
        window.setTimeout(onComplete, 650);
      }
    }, duration);

    return () => {
      window.clearTimeout(blastTimer);
      window.clearTimeout(timer);
    };
  }, [duration, onComplete]);

  const P = 'M 90,50 A 40,13 0 0 1 10,50 A 40,13 0 0 1 90,50';
  const DA = '0.13 0.37 0.13 0.37';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-[750ms] ${
        isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 40%, rgba(94,60,190,0.14) 0%, rgba(0,0,0,0) 32%), radial-gradient(circle at 50% 60%, rgba(132,102,214,0.08) 0%, rgba(0,0,0,0) 42%), linear-gradient(180deg, #030208 0%, #000000 50%, #030208 100%)',
      }}
    >
      <style>{`
        @keyframes logoIn {
          0% {
            transform: translate(-50%, -50%) scale(0.42);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes logoBlast {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.03);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(1.7);
          }
        }

        @keyframes ownq-dash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -1; }
        }

        @keyframes glowBreath {
          0%, 100% {
            opacity: 0.16;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.28;
            transform: translate(-50%, -50%) scale(1.08);
          }
        }

        .stage {
          position: relative;
          width: min(94vw, 1200px);
          height: min(90vh, 700px);
        }

        .logo-wrap {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 2;
          animation: logoIn 1.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .name-wrap {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 1;
          opacity: 0;
          white-space: nowrap;
          pointer-events: none;
          animation: nameReveal 1.5s cubic-bezier(0.22, 1, 0.36, 1) 1.1s forwards;
        }

        @keyframes nameReveal {
          0% {
            opacity: 0;
            filter: blur(14px);
            transform: translate(calc(-50% + 14px), -50%) translateX(0) scale(0.92);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: translate(calc(-50% + 14px), -50%) translateX(clamp(120px, 16vw, 240px)) scale(1);
          }
        }

        .glow-ring {
          animation: glowBreath 4.8s ease-in-out infinite;
        }

        .logo-blast {
          opacity: 0;
          animation: logoBlast 1.05s ease-out forwards;
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="glow-ring absolute left-1/2 top-1/2 h-[920px] w-[920px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(104,76,206,0.26) 0%, transparent 72%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      <div className="stage px-4">
        <div className="logo-blast absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
          <div
            style={{
              width: 'min(92vw, 760px)',
              height: 'min(92vw, 760px)',
              borderRadius: '9999px',
              background:
                'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(212,191,255,0.72) 12%, rgba(124,58,237,0.35) 28%, rgba(0,0,0,0) 66%)',
              filter: 'blur(2px) drop-shadow(0 0 28px rgba(167,139,250,0.95))',
            }}
          />
        </div>

        <div className="logo-wrap">
          <div
            style={{
              filter: 'drop-shadow(0 0 16px rgba(184,162,255,0.9)) drop-shadow(0 0 28px rgba(96,70,190,0.58)) brightness(1.24)',
              lineHeight: 0,
            }}
          >
            <svg
              width="min(86vw, 700px)"
              height="min(86vw, 700px)"
              viewBox="0 0 100 100"
              fill="none"
              overflow="visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="rg" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="0.9" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="sg-out" x="-400%" y="-400%" width="900%" height="900%">
                  <feGaussianBlur stdDeviation="3.3" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="sg-in" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="0.7" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="ng" x="-250%" y="-250%" width="600%" height="600%">
                  <feGaussianBlur stdDeviation="5" result="outer" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="inner" />
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
                <path d={P} stroke="rgba(184,162,255,0.38)" strokeWidth="0.75" fill="none" filter="url(#rg)" />
                <path
                  d={P}
                  pathLength="1"
                  fill="none"
                  stroke="rgba(184,162,255,0.95)"
                  strokeWidth="5.2"
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
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeDasharray={DA}
                  filter="url(#sg-in)"
                  style={{ animation: `ownq-dash 2.4s linear ${LOGO_LOOPS}` }}
                />
              </g>

              <g transform="rotate(58 50 50)">
                <path d={P} stroke="rgba(146,114,255,0.4)" strokeWidth="0.75" fill="none" filter="url(#rg)" />
                <path
                  d={P}
                  pathLength="1"
                  fill="none"
                  stroke="rgba(150,118,255,0.95)"
                  strokeWidth="5.2"
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
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeDasharray={DA}
                  filter="url(#sg-in)"
                  style={{ animation: `ownq-dash 2.8s linear ${LOGO_LOOPS}` }}
                />
              </g>

              <g transform="rotate(-58 50 50)">
                <path d={P} stroke="rgba(126,92,228,0.4)" strokeWidth="0.75" fill="none" filter="url(#rg)" />
                <path
                  d={P}
                  pathLength="1"
                  fill="none"
                  stroke="rgba(202,166,255,0.95)"
                  strokeWidth="5.2"
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
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeDasharray={DA}
                  filter="url(#sg-in)"
                  style={{ animation: `ownq-dash 2.1s linear ${LOGO_LOOPS}` }}
                />
              </g>

              <circle cx="50" cy="50" r="20" fill="url(#ngrad)" filter="url(#ng)" opacity="0.98" />
              <circle cx="50" cy="50" r="6" fill="#faf7ff" opacity="0.98" />
              <circle cx="50" cy="50" r="3.5" fill="#ffffff" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
