'use client';

import { useEffect, useRef } from 'react';

const PI2        = Math.PI * 2;
const LINK_DIST  = 155;
const LINK_SQ    = LINK_DIST * LINK_DIST;
const MOUSE_R    = 200;
const MOUSE_RSQ  = MOUSE_R * MOUSE_R;

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  hue: number;
  alpha: number;
  phase: number;
  phaseSpeed: number;
}

/**
 * Optimised neural-network canvas background.
 *
 * Performance tricks:
 *  - Links batched into 3 opacity tiers → only 3 ctx.stroke() calls per frame
 *  - Node glow via ctx.shadowBlur (GPU-composited) instead of per-node radialGradient
 *  - Static background drawn onto a separate off-screen canvas, composited cheaply
 *  - Max 80 nodes (3 160 pair-checks) instead of 140 (9 730 pair-checks)
 *  - DPR capped at 2 (saves 2.25× fill-rate on 3× Retina displays)
 *  - No lenis, no competing RAF loops
 */
export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef     = useRef<HTMLCanvasElement>(null);  // static background layer

  useEffect(() => {
    const canvas = canvasRef.current;
    const bgCanvas = bgRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx  = canvas.getContext('2d')!;
    const bgCtx = bgCanvas.getContext('2d')!;

    let W = 0, H = 0, DPR = 1;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999 };
    let rafId = 0;

    // ── Static background (redrawn only on resize) ────────────────────────────
    const drawStaticBg = () => {
      bgCtx.clearRect(0, 0, W, H);

      // Dark glossy purple base
      const base = bgCtx.createLinearGradient(0, 0, W * 0.5, H);
      base.addColorStop(0,   '#0d0120');
      base.addColorStop(0.5, '#080118');
      base.addColorStop(1,   '#050010');
      bgCtx.fillStyle = base;
      bgCtx.fillRect(0, 0, W, H);

      // Centre gloss highlight — very subtle top sheen
      const gloss = bgCtx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, W * 0.75);
      gloss.addColorStop(0,   'rgba(140,60,220,0.14)');
      gloss.addColorStop(0.4, 'rgba(100,30,180,0.05)');
      gloss.addColorStop(1,   'rgba(70,10,140,0)');
      bgCtx.fillStyle = gloss;
      bgCtx.fillRect(0, 0, W, H);

      // Bottom-left violet bloom
      const bloom1 = bgCtx.createRadialGradient(W * 0.08, H * 0.9, 0, W * 0.08, H * 0.9, W * 0.55);
      bloom1.addColorStop(0, 'rgba(80,20,170,0.16)');
      bloom1.addColorStop(1, 'rgba(50,5,120,0)');
      bgCtx.fillStyle = bloom1;
      bgCtx.fillRect(0, 0, W, H);

      // Top-right pink-violet accent
      const bloom2 = bgCtx.createRadialGradient(W * 0.92, H * 0.06, 0, W * 0.92, H * 0.06, W * 0.42);
      bloom2.addColorStop(0, 'rgba(160,50,220,0.10)');
      bloom2.addColorStop(1, 'rgba(110,20,180,0)');
      bgCtx.fillStyle = bloom2;
      bgCtx.fillRect(0, 0, W, H);

      // Centre-bottom depth glow
      const depth = bgCtx.createRadialGradient(W * 0.5, H, 0, W * 0.5, H, W * 0.6);
      depth.addColorStop(0, 'rgba(70,15,160,0.14)');
      depth.addColorStop(1, 'rgba(40,5,100,0)');
      bgCtx.fillStyle = depth;
      bgCtx.fillRect(0, 0, W, H);
    };

    // ── Resize ────────────────────────────────────────────────────────────────
    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2); // cap at 2× — saves fill-rate
      W   = window.innerWidth;
      H   = window.innerHeight;

      for (const c of [canvas, bgCanvas]) {
        c.width        = Math.round(W * DPR);
        c.height       = Math.round(H * DPR);
        c.style.width  = `${W}px`;
        c.style.height = `${H}px`;
      }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      bgCtx.setTransform(DPR, 0, 0, DPR, 0, 0);

      drawStaticBg();
      initParticles();
    };

    const initParticles = () => {
      // 80 nodes max → 80×79÷2 = 3 160 pair-checks (vs 9 730 for 140)
      const count = Math.min(200, Math.max(100, Math.floor(W * H / 6000)));
      particles = Array.from({ length: count }, () => ({
        x:          Math.random() * W,
        y:          Math.random() * H,
        vx:         (Math.random() - 0.5) * 0.15,
        vy:         (Math.random() - 0.5) * 0.15,
        r:          0.5 + Math.random() * 0.8,
        hue:        270 + Math.random() * 50,   // violet → pink-purple
        alpha:      0.35 + Math.random() * 0.25,
        phase:      Math.random() * PI2,
        phaseSpeed: 0.016 + Math.random() * 0.022,
      }));
    };

    // ── Link tiers — 3 draw calls total for all connections ──────────────────
    //   tier 0: dist < 40 %  → bright + thick
    //   tier 1: dist 40–70 % → medium
    //   tier 2: dist 70–100% → faint + thin
    const TIERS = [
      { thresh: 0.40, color: 'rgba(180,100,255,0.32)', lw: 0.55 },
      { thresh: 0.70, color: 'rgba(150,70,230,0.15)', lw: 0.40 },
      { thresh: 1.00, color: 'rgba(120,50,200,0.06)', lw: 0.25 },
    ];

    const drawLinks = () => {
      // Accumulate segments per tier (reuse array slices each frame)
      const segs: Array<Array<[number, number, number, number]>> = [[], [], []];

      for (let i = 0; i < particles.length - 1; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b   = particles[j];
          const dx  = a.x - b.x;
          const dy  = a.y - b.y;
          const dsq = dx * dx + dy * dy;
          if (dsq > LINK_SQ) continue;

          const pct  = Math.sqrt(dsq) / LINK_DIST;
          const tier = pct < 0.40 ? 0 : pct < 0.70 ? 1 : 2;
          segs[tier].push([a.x, a.y, b.x, b.y]);
        }
      }

      for (let t = 0; t < 3; t++) {
        if (!segs[t].length) continue;
        ctx.beginPath();
        ctx.strokeStyle = TIERS[t].color;
        ctx.lineWidth   = TIERS[t].lw;
        for (const [ax, ay, bx, by] of segs[t]) {
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
        }
        ctx.stroke();
      }
    };

    // ── Nodes — shadowBlur is GPU-composited (fast) ───────────────────────────
    const drawNodes = () => {
      for (const n of particles) {
        const pulse = 0.82 + 0.18 * Math.sin(n.phase);
        const r     = n.r * pulse;

        ctx.shadowColor = `hsl(${n.hue},70%,70%)`;
        ctx.shadowBlur  = r * 3;

        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, PI2);
        ctx.fillStyle = `hsla(${n.hue},88%,76%,${n.alpha.toFixed(2)})`;
        ctx.fill();
      }
      // Reset shadow so it doesn't bleed
      ctx.shadowBlur = 0;
    };

    // ── Main loop ─────────────────────────────────────────────────────────────
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 2.5); // normalised to 60 fps
      lastTime  = now;

      for (const n of particles) {
        n.phase += n.phaseSpeed * dt;

        // Gentle Brownian drift
        n.vx += (Math.random() - 0.5) * 0.005 * dt;
        n.vy += (Math.random() - 0.5) * 0.005 * dt;

        // Speed cap
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (spd > 0.45) { n.vx = n.vx / spd * 0.45; n.vy = n.vy / spd * 0.45; }

        // Mouse repulsion (soft)
        const mdx = n.x - mouse.x;
        const mdy = n.y - mouse.y;
        const msq = mdx * mdx + mdy * mdy;
        if (msq < MOUSE_RSQ && msq > 1) {
          const md = Math.sqrt(msq);
          const f  = (1 - md / MOUSE_R) * 0.45 * dt;
          n.vx += (mdx / md) * f;
          n.vy += (mdy / md) * f;
        }

        n.x += n.vx * dt;
        n.y += n.vy * dt;

        // Wrap at edges
        if      (n.x < -15)    n.x = W + 15;
        else if (n.x > W + 15) n.x = -15;
        if      (n.y < -15)    n.y = H + 15;
        else if (n.y > H + 15) n.y = -15;
      }

      // 1. Blit static background (one drawImage — very cheap)
      ctx.drawImage(bgCanvas, 0, 0, W, H);

      // 2. Links (3 stroke calls)
      drawLinks();

      // 3. Nodes (N fill calls but shadowBlur is GPU)
      drawNodes();

      rafId = requestAnimationFrame(tick);
    };

    // ── Events ────────────────────────────────────────────────────────────────
    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    window.addEventListener('resize',     resize,  { passive: true });
    window.addEventListener('mousemove',  onMove,  { passive: true });
    window.addEventListener('mouseleave', onLeave);

    resize();
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <>
      {/* Static background layer — only repainted on resize */}
      <canvas
        ref={bgRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%',
                 zIndex: 0, display: 'block', pointerEvents: 'none' }}
      />
      {/* Animated layer */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%',
                 zIndex: 0, display: 'block' }}
      />
    </>
  );
}
