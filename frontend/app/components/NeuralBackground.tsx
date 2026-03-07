'use client';

import { useEffect, useRef } from 'react';

const PI2 = Math.PI * 2;

// ── Config ────────────────────────────────────────────────────────────────────
const TEXT_WORD      = 'OwnQuesta';
const FORM_DELAY     = 700;    // ms before any neuron starts moving toward target
const FORM_DURATION  = 3500;   // ms a single particle takes to reach its target
const STAGGER_MAX    = 1300;   // ms max stagger offset between particles

// Wave motion (only when particles are settled)
const WAVE_SPEED  = 0.00060;  // slow, subtle drift — watermark stays readable
const WAVE_AMP_Y  = 0.45;     // reduced — keeps letters crisp and legible
const WAVE_AMP_X  = 0.12;     // minimal horizontal sway
const WAVE_LEN    = 170;      // long wavelength spans the wide watermark text

// Cursor spring repulsion
const MOUSE_R          = 220;
const MOUSE_RSQ        = MOUSE_R * MOUSE_R;
const MOUSE_PUSH       = 0.9;     // gentle push for watermark feel
const SPRING_DECAY     = 0.975;   // smooth auto-return after cursor leaves
const SPRING_CLAMP     = 50;      // moderate scatter radius

// Links
const FREE_LINK_DIST = 120;    // reduced slightly for better scroll performance
const FREE_LINK_SQ   = FREE_LINK_DIST * FREE_LINK_DIST;
const TEXT_LINK_DIST = 16;     // step=4: covers adjacent + 1-step diagonal cleanly
const TEXT_LINK_SQ   = TEXT_LINK_DIST * TEXT_LINK_DIST;

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  sx: number; sy: number;  // captured start position when formation begins
  ox: number; oy: number;  // spring cursor offset (decays toward 0)
  r: number;
  hue: number;
  alpha: number;
  baseAlpha: number;
  phase: number;
  phaseSpeed: number;
  waveOff: number;         // spatial wave-phase offset (derived from tx)
  isText: boolean;
  tx: number; ty: number;  // text target pixel
  formDelay: number;
  rawT: number;            // cached eased formation progress 0 → 1
}

/**
 * Neural-network canvas background.
 * Neurons smoothly assemble into "OwnQuesta" with wave motion and cursor repulsion.
 */
export default function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef     = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas   = canvasRef.current;
    const bgCanvas = bgRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx   = canvas.getContext('2d')!;
    const bgCtx = bgCanvas.getContext('2d')!;

    let W = 0, H = 0, DPR = 1;
    let textParticles: Particle[] = [];
    let freeParticles: Particle[] = [];
    const mouse = { x: -9999, y: -9999 };
    let rafId = 0;
    let startTime = 0;

    // ── Text pixel sampling ────────────────────────────────────────────────────
    // Render text onto an offscreen canvas, scan alpha channel for neuron targets.
    const sampleTextPositions = (): Array<{ x: number; y: number }> => {
      // Measure at 100 px to find the size that fills ~88% of viewport width
      // (watermark style — text spans nearly the full screen width)
      const probe = document.createElement('canvas').getContext('2d')!;
      probe.font  = `900 100px "Arial Black", Arial, sans-serif`;
      const baseW = probe.measureText(TEXT_WORD).width;
      const fontSize = Math.max(64, Math.min(460, Math.round((W * 0.88 / baseW) * 100)));

      // Offscreen canvas — 1.9× height to accommodate descenders (q in OwnQuesta)
      const oc  = document.createElement('canvas');
      const oH  = Math.ceil(fontSize * 1.9);
      oc.width  = W;
      oc.height = oH;
      const g   = oc.getContext('2d')!;

      g.imageSmoothingEnabled = false;
      g.font         = `900 ${fontSize}px "Arial Black", "Impact", Arial, sans-serif`;
      g.textAlign    = 'center';
      g.textBaseline = 'middle';

      // Stroke first with thick width to fatten the letter strokes, then fill —
      // this ensures even thin letters (like 'i', 'l') have enough particle density.
      g.strokeStyle = '#fff';
      g.lineWidth   = Math.max(6, fontSize * 0.032);
      g.lineJoin    = 'round';
      g.strokeText(TEXT_WORD, W / 2, oH / 2);
      g.fillStyle   = '#fff';
      g.fillText(TEXT_WORD, W / 2, oH / 2);

      const data = g.getImageData(0, 0, oc.width, oH).data;
      const pts: Array<{ x: number; y: number }> = [];

      // Watermark centred vertically in the viewport
      const textCY = H * 0.5;

      // Step = 4 px — denser grid gives crisper letter shapes
      const step = 4;

      for (let row = 0; row < oH; row += step) {
        for (let col = 0; col < oc.width; col += step) {
          if (data[(row * oc.width + col) * 4 + 3] > 40) {
            pts.push({ x: col, y: textCY + row - oH / 2 });
          }
        }
      }
      return pts;
    };

    // ── Static background ──────────────────────────────────────────────────────
    const drawStaticBg = () => {
      bgCtx.clearRect(0, 0, W, H);

      const base = bgCtx.createLinearGradient(0, 0, W * 0.5, H);
      base.addColorStop(0,   '#0d0120');
      base.addColorStop(0.5, '#080118');
      base.addColorStop(1,   '#050010');
      bgCtx.fillStyle = base;
      bgCtx.fillRect(0, 0, W, H);

      const makeRadial = (
        x: number, y: number, r: number,
        c0: string, c1: string,
      ) => {
        const g = bgCtx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c0); g.addColorStop(1, c1);
        bgCtx.fillStyle = g; bgCtx.fillRect(0, 0, W, H);
      };

      makeRadial(W*.5, 0, W*.75, 'rgba(140,60,220,0.14)', 'rgba(70,10,140,0)');
      makeRadial(W*.08, H*.9, W*.55, 'rgba(80,20,170,0.16)', 'rgba(50,5,120,0)');
      makeRadial(W*.92, H*.06, W*.42, 'rgba(160,50,220,0.10)', 'rgba(110,20,180,0)');
      makeRadial(W*.5, H, W*.6, 'rgba(70,15,160,0.14)', 'rgba(40,5,100,0)');
    };

    // ── Particle factory ───────────────────────────────────────────────────────
    const makeParticle = (
      x: number, y: number, isText: boolean,
      tx = 0, ty = 0, formDelay = 0,
    ): Particle => ({
      x, y, sx: x, sy: y,
      vx: (Math.random() - .5) * .15,
      vy: (Math.random() - .5) * .15,
      ox: 0, oy: 0,
      r:         isText ? 1.3 + Math.random() * 0.9  : .5 + Math.random() * .8,
      hue:       isText ? 272 + Math.random() * 38   : 268 + Math.random() * 52,
      alpha:     isText ? .06 : .32 + Math.random() * .22,
      baseAlpha: isText ? .48 + Math.random() * .12  : .32 + Math.random() * .22,
      phase:      Math.random() * PI2,
      phaseSpeed: .011 + Math.random() * .019,
      waveOff:    tx / WAVE_LEN,
      isText, tx, ty, formDelay,
      rawT: 0,
    });

    // ── Resize / init ─────────────────────────────────────────────────────────
    const resize = () => {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
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
      startTime = performance.now();

      const pts = sampleTextPositions();

      // Shuffle text points
      for (let i = pts.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [pts[i], pts[j]] = [pts[j], pts[i]];
      }

      // Dedicate more particles to the text for clear letter shapes; keep free count
      // modest so O(n²) link checks stay fast at 60 fps.
      const textCount = Math.min(pts.length, Math.min(1400, Math.max(700, (W * H / 1400) | 0)));
      const freeCount = Math.min(160, Math.max(80, (W * H / 10000) | 0));

      textParticles = pts.slice(0, textCount).map(p =>
        makeParticle(
          Math.random() * W, Math.random() * H,
          true, p.x, p.y,
          Math.random() * STAGGER_MAX,
        )
      );

      freeParticles = Array.from({ length: freeCount }, () =>
        makeParticle(Math.random() * W, Math.random() * H, false)
      );
    };

    // ── Easing ────────────────────────────────────────────────────────────────
    const ease = (t: number) =>
      t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // ── Link drawing ──────────────────────────────────────────────────────────
    const drawLinks = (formProgress: number) => {
      // 1 · Background neuron network (free particles)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(148,68,230,0.13)';
      ctx.lineWidth   = 0.4;
      for (let i = 0; i < freeParticles.length - 1; i++) {
        const a = freeParticles[i];
        for (let j = i + 1; j < freeParticles.length; j++) {
          const b = freeParticles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          if (dx * dx + dy * dy < FREE_LINK_SQ) {
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          }
        }
      }
      ctx.stroke();

      // 2 · Text-particle micro-links (fade in once mostly formed)
      if (formProgress > 0.42) {
        const la = Math.min(0.36, (formProgress - 0.42) * 0.62);  // slightly toned down
        ctx.beginPath();
        ctx.strokeStyle = `rgba(220,170,255,${la.toFixed(3)})`;
        ctx.lineWidth   = 0.40;
        for (let i = 0; i < textParticles.length - 1; i++) {
          const a = textParticles[i];
          for (let j = i + 1; j < textParticles.length; j++) {
            const b = textParticles[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            if (dx * dx + dy * dy < TEXT_LINK_SQ) {
              ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            }
          }
        }
        ctx.stroke();
      }
    };

    // ── Node drawing ──────────────────────────────────────────────────────────
    const drawNodes = () => {
      // Free particles — reduced shadowBlur for scroll performance
      for (const n of freeParticles) {
        const r = n.r * (0.82 + 0.18 * Math.sin(n.phase));
        ctx.shadowColor = `hsl(${n.hue},70%,70%)`;
        ctx.shadowBlur  = r * 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, PI2);
        ctx.fillStyle = `hsla(${n.hue},86%,76%,${n.alpha.toFixed(2)})`;
        ctx.fill();
      }
      // Text particles — crisp bright nodes that clearly trace each letter
      for (const n of textParticles) {
        const r = n.r * (0.82 + 0.18 * Math.sin(n.phase));
        ctx.shadowColor = `hsl(${n.hue},90%,80%)`;
        ctx.shadowBlur  = r * 2.5;   // less blur = sharper, more legible dots
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, PI2);
        ctx.fillStyle = `hsla(${n.hue},90%,88%,${n.alpha.toFixed(3)})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    // ── Main animation loop ────────────────────────────────────────────────────
    let lastTime = 0;

    const tick = (now: number) => {
      const dt = lastTime ? Math.min((now - lastTime) / 16.67, 2.5) : 1;
      lastTime  = now;

      const elapsed = now - startTime;
      // Global progress used for link opacity — accounts for stagger
      const globalT = Math.max(0, Math.min(1,
        (elapsed - FORM_DELAY) / (FORM_DURATION + STAGGER_MAX)
      ));

      const springDecayDt = Math.pow(SPRING_DECAY, dt);

      // ── Text particles ─────────────────────────────────────────────────────
      for (const n of textParticles) {
        n.phase += n.phaseSpeed * dt;

        // Decay spring offset each frame
        n.ox *= springDecayDt;
        n.oy *= springDecayDt;

        const pe   = elapsed - FORM_DELAY - n.formDelay;
        const rawT = (n.rawT = Math.max(0, Math.min(1, pe / FORM_DURATION)));
        const t    = ease(rawT);

        if (rawT <= 0) {
          // Pre-formation: roam freely, update start position each frame
          n.vx += (Math.random() - .5) * .0035 * dt;
          n.vy += (Math.random() - .5) * .0035 * dt;
          const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
          if (spd > .32) { n.vx = n.vx / spd * .32; n.vy = n.vy / spd * .32; }
          n.x += n.vx * dt;
          n.y += n.vy * dt;
          n.sx = n.x; n.sy = n.y;
          n.alpha = Math.min(.28, n.alpha + .003 * dt);
        } else {
          // Formation: direct lerp from start to target
          // Wave amplitude ramps in only after 50% formed (settled = 0→1)
          const settled = Math.max(0, rawT * 2 - 1);
          const wt      = now * WAVE_SPEED;

          // Sinusoidal wave flowing left → right across the word
          const waveDy = Math.sin(wt + n.waveOff) * WAVE_AMP_Y * settled;
          const waveDx = Math.cos(wt * 0.65 + n.waveOff * 1.25) * WAVE_AMP_X * settled;

          // Final position = lerped base + wave + spring cursor offset
          n.x = n.sx + (n.tx - n.sx) * t + waveDx + n.ox;
          n.y = n.sy + (n.ty - n.sy) * t + waveDy + n.oy;

          // Fade alpha in as formation progresses
          n.alpha = .06 + (n.baseAlpha - .06) * Math.min(1, rawT * 1.5);
        }

        // Mouse repulsion — pushes the spring offset (ox/oy)
        const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
        const msq = mdx * mdx + mdy * mdy;
        if (msq < MOUSE_RSQ && msq > 1) {
          const md  = Math.sqrt(msq);
          const str = (1 - md / MOUSE_R) * MOUSE_PUSH * dt;
          n.ox += (mdx / md) * str;
          n.oy += (mdy / md) * str;
          // Clamp spring magnitude
          const oSpd = Math.sqrt(n.ox * n.ox + n.oy * n.oy);
          if (oSpd > SPRING_CLAMP) {
            n.ox = n.ox / oSpd * SPRING_CLAMP;
            n.oy = n.oy / oSpd * SPRING_CLAMP;
          }
        }
      }

      // ── Free particles ─────────────────────────────────────────────────────
      for (const n of freeParticles) {
        n.phase += n.phaseSpeed * dt;
        n.vx += (Math.random() - .5) * .005 * dt;
        n.vy += (Math.random() - .5) * .005 * dt;
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (spd > .45) { n.vx = n.vx / spd * .45; n.vy = n.vy / spd * .45; }
        n.x += n.vx * dt;
        n.y += n.vy * dt;

        // Mouse repulsion (velocity-based for free particles)
        const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
        const msq = mdx * mdx + mdy * mdy;
        if (msq < MOUSE_RSQ && msq > 1) {
          const md = Math.sqrt(msq);
          const f  = (1 - md / MOUSE_R) * .5 * dt;
          n.vx += (mdx / md) * f;
          n.vy += (mdy / md) * f;
        }

        // Edge wrap
        if      (n.x < -15)    n.x = W + 15;
        else if (n.x > W + 15) n.x = -15;
        if      (n.y < -15)    n.y = H + 15;
        else if (n.y > H + 15) n.y = -15;
      }

      // ── Render ─────────────────────────────────────────────────────────────
      ctx.drawImage(bgCanvas, 0, 0, W, H);
      drawLinks(globalT);
      drawNodes();

      rafId = requestAnimationFrame(tick);
    };

    // ── Events ────────────────────────────────────────────────────────────────
    const onMove  = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    // Pause animation when tab is backgrounded — saves CPU and improves scroll perf
    const onVisChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        lastTime = 0;
        rafId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener('resize',     resize,  { passive: true });
    window.addEventListener('mousemove',  onMove,  { passive: true });
    window.addEventListener('mouseleave', onLeave);
    document.addEventListener('visibilitychange', onVisChange);

    resize();
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  return (
    <>
      <canvas
        ref={bgRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%',
                 zIndex: 0, display: 'block', pointerEvents: 'none',
                 willChange: 'transform', transform: 'translateZ(0)' }}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%',
                 zIndex: 0, display: 'block',
                 willChange: 'transform', transform: 'translateZ(0)' }}
      />
    </>
  );
}

