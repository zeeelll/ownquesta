'use client';

import Link from 'next/link';
import { useState } from 'react';

interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'default' | 'light';
}

export default function Logo({ href = '/', size = 'md', showText = true, variant = 'default' }: LogoProps) {
  const [hovered, setHovered] = useState(false);
  const px = { sm: 32, md: 40, lg: 50 }[size];

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
  };

  // Same ellipse path for all three rings (tilt applied via group transform)
  const P = 'M 90,50 A 40,13 0 0 1 10,50 A 40,13 0 0 1 90,50';

  // Two energy streaks per ring, evenly spaced (each 13% of path, 37% gap)
  // pathLength="1" normalises so these values are fractions 0–1
  const DA = '0.13 0.37 0.13 0.37';

  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <style>{`
        @keyframes ownq-dash { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1; } }
      `}</style>

      {/* Hover = pure CSS glow, no speed change */}
      <div style={{
        filter: hovered
          ? 'drop-shadow(0 0 8px rgba(167,139,250,0.95)) drop-shadow(0 0 20px rgba(109,40,217,0.7)) brightness(1.45)'
          : 'drop-shadow(0 0 3px rgba(139,92,246,0.35)) brightness(1)',
        transition: 'filter 0.4s ease',
        lineHeight: 0,
      }}>
        <svg
          width={px}
          height={px}
          viewBox="0 0 100 100"
          fill="none"
          overflow="visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft ring line glow */}
            <filter id="rg" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.2" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            {/* Wide outer bloom for streak */}
            <filter id="sg-out" x="-400%" y="-400%" width="900%" height="900%">
              <feGaussianBlur stdDeviation="4.5" result="b"/>
              <feMerge>
                <feMergeNode in="b"/>
                <feMergeNode in="b"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Tight bright core for streak */}
            <filter id="sg-in" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            {/* Nucleus blast */}
            <filter id="ng" x="-250%" y="-250%" width="600%" height="600%">
              <feGaussianBlur stdDeviation="7" result="outer"/>
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="inner"/>
              <feMerge>
                <feMergeNode in="outer"/>
                <feMergeNode in="outer"/>
                <feMergeNode in="inner"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <radialGradient id="ngrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ffffff"/>
              <stop offset="22%"  stopColor="#ede9fe"/>
              <stop offset="52%"  stopColor="#7c3aed" stopOpacity="0.75"/>
              <stop offset="82%"  stopColor="#4c1d95" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#1e0048" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* ══════════════════════════════════════════
              RING 1 — horizontal
              stroke-dashoffset animates the streak
              along the actual path curve (no rigidity)
          ══════════════════════════════════════════ */}
          <g>
            {/* Dim guide line */}
            <path d={P} stroke="rgba(167,139,250,0.45)" strokeWidth="0.75" fill="none" filter="url(#rg)"/>
            {/* Outer glow layer */}
            <path d={P} pathLength="1" fill="none"
              stroke="rgba(167,139,250,0.85)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={DA}
              filter="url(#sg-out)"
              style={{ animation: 'ownq-dash 3s linear infinite' }}/>
            {/* Bright core */}
            <path d={P} pathLength="1" fill="none"
              stroke="white" strokeWidth="1.1" strokeLinecap="round"
              strokeDasharray={DA}
              filter="url(#sg-in)"
              style={{ animation: 'ownq-dash 3s linear infinite' }}/>
          </g>

          {/* ══════════════════════════════════════════
              RING 2 — tilted +58°
          ══════════════════════════════════════════ */}
          <g transform="rotate(58 50 50)">
            <path d={P} stroke="rgba(139,92,246,0.45)" strokeWidth="0.75" fill="none" filter="url(#rg)"/>
            <path d={P} pathLength="1" fill="none"
              stroke="rgba(139,92,246,0.9)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={DA}
              filter="url(#sg-out)"
              style={{ animation: 'ownq-dash 3.8s linear infinite -1.27s' }}/>
            <path d={P} pathLength="1" fill="none"
              stroke="white" strokeWidth="1.1" strokeLinecap="round"
              strokeDasharray={DA}
              filter="url(#sg-in)"
              style={{ animation: 'ownq-dash 3.8s linear infinite -1.27s' }}/>
          </g>

          {/* ══════════════════════════════════════════
              RING 3 — tilted -58°
          ══════════════════════════════════════════ */}
          <g transform="rotate(-58 50 50)">
            <path d={P} stroke="rgba(124,58,237,0.45)" strokeWidth="0.75" fill="none" filter="url(#rg)"/>
            <path d={P} pathLength="1" fill="none"
              stroke="rgba(180,130,255,0.88)" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={DA}
              filter="url(#sg-out)"
              style={{ animation: 'ownq-dash 3.4s linear infinite -0.57s' }}/>
            <path d={P} pathLength="1" fill="none"
              stroke="white" strokeWidth="1.1" strokeLinecap="round"
              strokeDasharray={DA}
              filter="url(#sg-in)"
              style={{ animation: 'ownq-dash 3.4s linear infinite -0.57s' }}/>
          </g>

          {/* ══════════════════════════════════════════
              NUCLEUS
          ══════════════════════════════════════════ */}
          <circle cx="50" cy="50" r="20" fill="url(#ngrad)" filter="url(#ng)" opacity="0.9"/>
          <circle cx="50" cy="50" r="6"  fill="#ede9fe" opacity="0.9"/>
          <circle cx="50" cy="50" r="3.5" fill="white"/>
        </svg>
      </div>

      {showText && (
        <span className={`${textSizes[size]} font-bold tracking-tight font-chillax ${
          variant === 'light'
            ? 'text-white'
            : 'bg-gradient-to-r from-white via-[#d4c8ff] to-[#a87edf] bg-clip-text text-transparent'
        }`}>
          Ownquesta
        </span>
      )}
    </Link>
  );
}
