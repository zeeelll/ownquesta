"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";

const LAB_URL = process.env.NEXT_PUBLIC_LAB_URL || "http://localhost:8010";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Dataset {
  filename: string;
  filePath?: string;
  rowCount?: number;
  fileType?: string;
  sizeKb?: number;
}

type Stage =
  | "initialized"
  | "dataset_uploaded"
  | "eda_completed"
  | "model_selected"
  | "training"
  | "trained"
  | "evaluated"
  | "completed";

interface Project {
  _id: string;
  sessionId: string;
  name: string;
  dataset?: Dataset;
  stage: Stage;
  problemType?: string;
  targetColumn?: string;
  selectedModel?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  completed: number;
}

// ── Stage configuration ───────────────────────────────────────────────────────

const PIPELINE_STEPS: { key: Stage; label: string; short: string }[] = [
  { key: "dataset_uploaded", label: "Dataset Uploaded", short: "Upload" },
  { key: "eda_completed",    label: "EDA Completed",    short: "EDA"    },
  { key: "trained",          label: "Model Trained",    short: "Train"  },
  { key: "evaluated",        label: "Evaluated",        short: "Eval"   },
];

const STAGE_ORDER: Stage[] = [
  "initialized","dataset_uploaded","eda_completed","model_selected",
  "training","trained","evaluated","completed",
];

function stageIdx(s: Stage) { return STAGE_ORDER.indexOf(s); }

function stageLabel(s: Stage): string {
  const map: Record<Stage, string> = {
    initialized:"Initialized", dataset_uploaded:"Uploaded",
    eda_completed:"EDA Done",  model_selected:"Model Set",
    training:"Training…",      trained:"Trained",
    evaluated:"Evaluated",     completed:"Complete",
  };
  return map[s] ?? s;
}

function stageTheme(s: Stage) {
  if (["trained","evaluated","completed"].includes(s))
    return { col:"#34d399", glow:"rgba(52,211,153,0.20)", border:"rgba(52,211,153,0.18)", bg:"rgba(52,211,153,0.06)" };
  if (["eda_completed","model_selected","training"].includes(s))
    return { col:"#c084fc", glow:"rgba(192,132,252,0.20)", border:"rgba(192,132,252,0.18)", bg:"rgba(192,132,252,0.06)" };
  if (s === "dataset_uploaded")
    return { col:"#60a5fa", glow:"rgba(96,165,250,0.20)", border:"rgba(96,165,250,0.18)", bg:"rgba(96,165,250,0.06)" };
  return { col:"#334155", glow:"rgba(51,65,85,0.12)", border:"rgba(51,65,85,0.18)", bg:"rgba(51,65,85,0.05)" };
}

// ── Stylesheet ────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg0:    #060912;
    --bg1:    #090e1c;
    --bg2:    #0c1325;
    --bg3:    #101828;
    --bg4:    #141f35;
    --rim0:   rgba(255,255,255,0.035);
    --rim1:   rgba(255,255,255,0.06);
    --rim2:   rgba(255,255,255,0.09);
    --rim3:   rgba(255,255,255,0.13);
    --txt0:   #f1f5f9;
    --txt1:   #94a3b8;
    --txt2:   #4b6082;
    --txt3:   #253147;
    --ind:    #6366f1;
    --ind-l:  #818cf8;
    --ind-xl: #a5b4fc;
    --vio:    #c084fc;
    --em:     #34d399;
    --sky:    #60a5fa;
    --r-sm:   8px;
    --r-md:   12px;
    --r-lg:   16px;
    --r-xl:   22px;
    --r-2xl:  28px;
    --font-display: 'Bricolage Grotesque', sans-serif;
    --font-body:    'Plus Jakarta Sans', sans-serif;
    --font-mono:    'JetBrains Mono', monospace;
  }

  html { scroll-behavior: smooth; }

  @keyframes rise      { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pop       { from{opacity:0;transform:scale(0.93) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes shimmer   { 0%{background-position:-900px 0} 100%{background-position:900px 0} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes bar-grow  { from{width:0} }
  @keyframes toast-in  { from{opacity:0;transform:translateX(16px) scale(0.97)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes num-up    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.9)} }
  @keyframes ping-out  { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
  @keyframes bg-drift  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-14px) scale(1.04)} 66%{transform:translate(-12px,10px) scale(0.97)} }
  @keyframes scan-line { from{top:-60px} to{top:100%} }
  @keyframes border-spin { to{--border-angle:360deg} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes float-up  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

  .skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.015) 25%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.015) 75%);
    background-size: 900px 100%;
    animation: shimmer 2.2s ease infinite;
    border-radius: var(--r-md);
  }

  /* Rise animation delays */
  .d0{animation-delay:0ms}  .d1{animation-delay:60ms}  .d2{animation-delay:120ms}
  .d3{animation-delay:180ms}.d4{animation-delay:240ms} .d5{animation-delay:300ms}
  .d6{animation-delay:360ms}.d7{animation-delay:420ms}

  .rise { animation: rise 0.5s cubic-bezier(0.22,1,0.36,1) both; }

  /* ── Surface ── */
  .surface {
    background: linear-gradient(160deg, rgba(13,19,38,0.95) 0%, rgba(9,14,28,0.98) 100%);
    border: 1px solid var(--rim1);
    border-radius: var(--r-xl);
    backdrop-filter: blur(20px);
    position: relative;
    overflow: hidden;
  }
  .surface::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.055) 35%, rgba(255,255,255,0.03) 65%, transparent);
  }

  /* ── Glow card (gradient border) ── */
  .gc-wrap {
    position:relative;
    border-radius:var(--r-xl);
    padding:1px;
    background:linear-gradient(145deg,rgba(99,102,241,0.25),rgba(192,132,252,0.12),rgba(52,211,153,0.1),rgba(99,102,241,0.2));
    transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
  }
  .gc-wrap:hover {
    transform:translateY(-5px) scale(1.004);
    box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(99,102,241,0.08);
  }
  .gc-inner {
    border-radius: calc(var(--r-xl) - 1px);
    background:linear-gradient(165deg,#0d1425 0%,#080d1b 100%);
    overflow:hidden;
    position:relative;
  }

  /* ── Stat card ── */
  .stat-card {
    position:relative;
    border-radius:var(--r-xl);
    overflow:hidden;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
    background:linear-gradient(155deg,var(--bg3) 0%,var(--bg2) 100%);
    border:1px solid var(--rim1);
  }
  .stat-card:hover {
    transform:translateY(-4px) scale(1.01);
    box-shadow:0 20px 50px rgba(0,0,0,0.4);
  }

  /* ── Primary button ── */
  .btn-primary {
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    background:linear-gradient(140deg,#4f4fdc 0%,#6366f1 55%,#8b5cf6 100%);
    color:#fff; border:none; cursor:pointer;
    font-family:var(--font-body); font-weight:700;
    border-radius:var(--r-md);
    position:relative; overflow:hidden;
    box-shadow:0 4px 16px rgba(99,102,241,0.28), inset 0 1px 0 rgba(255,255,255,0.14);
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s;
    letter-spacing:-0.01em;
  }
  .btn-primary::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0); transition:background 0.15s; }
  .btn-primary:hover {
    transform:translateY(-2px) scale(1.015);
    box-shadow:0 10px 28px rgba(99,102,241,0.42), inset 0 1px 0 rgba(255,255,255,0.18);
  }
  .btn-primary:hover::after { background:rgba(255,255,255,0.04); }
  .btn-primary:active { transform:scale(0.97) !important; }
  .btn-primary:disabled {
    background:linear-gradient(140deg,#1a2035,#1e263a);
    color:var(--txt3); box-shadow:none; cursor:not-allowed; transform:none !important;
  }

  /* ── Ghost button ── */
  .btn-ghost {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    background:rgba(255,255,255,0.03); color:var(--txt1);
    border:1px solid var(--rim1); border-radius:var(--r-sm); cursor:pointer;
    font-family:var(--font-body); font-weight:600;
    transition:all 0.18s;
  }
  .btn-ghost:hover {
    background:rgba(255,255,255,0.06);
    color:var(--txt0); border-color:var(--rim2);
    transform:translateY(-1px);
  }
  .btn-ghost:active { transform:scale(0.97); }

  /* ── Delete button ── */
  .btn-delete {
    display:flex; align-items:center; justify-content:center;
    background:transparent; border:1px solid transparent; cursor:pointer;
    color:var(--txt2); border-radius:10px;
    transition:all 0.18s;
  }
  .btn-delete:hover {
    background:rgba(248,113,113,0.08);
    color:#f87171;
    border-color:rgba(248,113,113,0.18);
  }
  .btn-delete:disabled { opacity:0.25; cursor:not-allowed; }

  /* ── Input ── */
  .input {
    width:100%;
    background:rgba(255,255,255,0.025);
    border:1px solid var(--rim1);
    border-radius:var(--r-sm);
    color:var(--txt0);
    font-family:var(--font-body);
    outline:none;
    transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .input::placeholder { color:var(--txt3); }
  .input:focus {
    border-color:rgba(99,102,241,0.45);
    background:rgba(99,102,241,0.035);
    box-shadow:0 0 0 3px rgba(99,102,241,0.08);
  }

  /* ── Badge ── */
  .badge {
    display:inline-flex; align-items:center; justify-content:center;
    font-family:var(--font-mono); font-size:9px; font-weight:500;
    letter-spacing:0.07em; text-transform:uppercase;
    padding:3px 10px; border-radius:100px; border:1px solid; white-space:nowrap;
  }

  /* ── Chip ── */
  .chip {
    display:inline-flex; align-items:center;
    font-family:var(--font-mono); font-size:9px; font-weight:400;
    padding:2px 8px; border-radius:5px; border:1px solid; white-space:nowrap;
    max-width:140px; overflow:hidden; text-overflow:ellipsis;
  }

  /* ── Progress rail ── */
  .p-rail { height:2px; border-radius:100px; background:rgba(255,255,255,0.04); overflow:visible; position:relative; }
  .p-fill {
    height:100%; border-radius:100px;
    animation:bar-grow 0.9s cubic-bezier(0.4,0,0.2,1) both;
    position:relative;
  }
  .p-fill::after {
    content:''; position:absolute; right:-4px; top:-4px;
    width:10px; height:10px; border-radius:50%;
    background:inherit; filter:blur(4px); opacity:0.8;
  }

  /* ── Stage dot ── */
  .stage-dot {
    width:20px; height:20px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:7px; font-weight:700; flex-shrink:0;
    border:1.5px solid; position:relative;
    font-family:var(--font-mono); transition:all 0.3s;
  }

  /* ── Nav pill ── */
  .nav-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 13px; border-radius:100px;
    background:rgba(255,255,255,0.03); border:1px solid var(--rim1);
    font-size:11px; font-weight:600; color:var(--txt1);
    cursor:pointer; font-family:var(--font-body); transition:all 0.18s;
    letter-spacing:-0.01em;
  }
  .nav-pill:hover { background:rgba(255,255,255,0.07); color:var(--txt0); border-color:var(--rim2); }

  /* ── Activity row ── */
  .activity-row { transition:background 0.15s; cursor:pointer; }
  .activity-row:hover { background:rgba(99,102,241,0.04); }

  /* ── Goal option ── */
  .goal-opt {
    width:100%; text-align:left; cursor:pointer;
    background:rgba(255,255,255,0.015); border:1px solid var(--rim0);
    border-radius:var(--r-sm); padding:10px 13px;
    display:flex; align-items:center; gap:10px;
    color:var(--txt1); font-family:var(--font-body);
    transition:all 0.18s;
  }
  .goal-opt:hover {
    border-color:rgba(99,102,241,0.28);
    background:rgba(99,102,241,0.05);
    color:var(--txt0);
  }
  .goal-opt.sel {
    background:rgba(99,102,241,0.09);
    border-color:rgba(99,102,241,0.38);
    color:var(--txt0);
    box-shadow:0 0 18px rgba(99,102,241,0.07);
  }

  /* ── Pipeline legend step ── */
  .legend-step {
    display:flex; align-items:flex-start; gap:12px;
    padding:14px 16px; border-radius:var(--r-lg);
    border:1px solid; position:relative; overflow:hidden;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s, border-color 0.22s;
  }
  .legend-step:hover {
    transform:translateY(-3px);
    box-shadow:0 12px 36px rgba(0,0,0,0.32);
  }

  /* ── Hover scan effect ── */
  .scan-host { position:relative; overflow:hidden; }
  .scan-el {
    pointer-events:none; position:absolute; left:0; right:0; height:70px;
    background:linear-gradient(180deg, transparent, rgba(99,102,241,0.04), transparent);
    top:-70px; opacity:0; transition:opacity 0.22s;
    animation:scan-line 3.8s linear infinite;
    animation-play-state:paused; z-index:3;
  }
  .scan-host:hover .scan-el { opacity:1; animation-play-state:running; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.15); border-radius:2px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(99,102,241,0.28); }

  /* ── Selection ── */
  ::selection { background:rgba(99,102,241,0.25); }

  @media(max-width:820px) {
    .proj-grid   { grid-template-columns:1fr !important; }
    .stats-grid  { grid-template-columns:1fr !important; }
    .leg-grid    { grid-template-columns:1fr 1fr !important; }
    .page-head   { flex-direction:column !important; align-items:flex-start !important; gap:16px !important; }
  }
  @media(max-width:520px) {
    .leg-grid { grid-template-columns:1fr !important; }
  }
`;

// ── StageTracker ──────────────────────────────────────────────────────────────
function StageTracker({ stage }: { stage: Stage }) {
  const cur = stageIdx(stage);
  return (
    <div style={{ display:"flex", alignItems:"flex-start", marginTop:14 }}>
      {PIPELINE_STEPS.map((step, i) => {
        const si = stageIdx(step.key);
        const done = cur >= si;
        const isLast = i === PIPELINE_STEPS.length - 1;
        const t = stageTheme(done ? step.key : "initialized");
        return (
          <div key={step.key} style={{ display:"flex", alignItems:"center", flex:1, minWidth:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
              <div
                className="stage-dot"
                style={{
                  background: done ? t.bg : "transparent",
                  borderColor: done ? t.col : "rgba(255,255,255,0.06)",
                  color: done ? t.col : "var(--txt3)",
                  boxShadow: done ? `0 0 8px ${t.glow}` : "none",
                }}
              >
                {done ? "✓" : i+1}
              </div>
              <span style={{
                fontSize:8, marginTop:3, whiteSpace:"nowrap",
                fontFamily:"var(--font-mono)", fontWeight:400,
                letterSpacing:"0.05em",
                color: done ? t.col : "var(--txt3)",
                opacity: done ? 1 : 0.5,
              }}>{step.short}</span>
            </div>
            {!isLast && (
              <div style={{
                height:1, flex:1, margin:"0 3px", marginBottom:14,
                background: done && cur > si
                  ? `linear-gradient(90deg,${t.col}60,${stageTheme(PIPELINE_STEPS[i+1].key).col}30)`
                  : "rgba(255,255,255,0.04)",
                transition:"background 0.6s",
              }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent, icon, delay=0 }: {
  label:string; value:number|string; sub?:string;
  accent:string; icon:string; delay?:number;
}) {
  return (
    <div className="stat-card rise" style={{ animationDelay:`${delay}ms` }}>
      {/* Glow orb */}
      <div style={{
        position:"absolute", top:-30, right:-16, width:100, height:100,
        borderRadius:"50%", background:accent, filter:"blur(36px)", opacity:0.12, pointerEvents:"none",
      }}/>
      {/* Bottom accent line */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:1,
        background:`linear-gradient(90deg, ${accent}50, transparent)`, opacity:0.7,
      }}/>
      {/* Subtle top-right bracket */}
      <svg style={{ position:"absolute", top:0, right:0, width:40, height:40, opacity:0.18 }} viewBox="0 0 40 40">
        <path d="M38 2 L38 18" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M22 2 L38 2" fill="none" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>

      <div style={{ padding:"22px 24px", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <p style={{
            fontFamily:"var(--font-mono)", fontSize:9, fontWeight:400,
            letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--txt2)",
          }}>{label}</p>
          <div style={{
            width:34, height:34, borderRadius:10, flexShrink:0,
            background:`linear-gradient(140deg, ${accent}14, ${accent}05)`,
            border:`1px solid ${accent}25`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:15,
          }}>{icon}</div>
        </div>
        <p style={{
          fontFamily:"var(--font-display)", fontSize:48, fontWeight:800,
          color:"var(--txt0)", lineHeight:1, letterSpacing:"-0.05em",
          animation:"num-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
          animationDelay:`${delay+80}ms`,
        }}>{value}</p>
        {sub && (
          <p style={{
            fontFamily:"var(--font-mono)", fontSize:9, color:"var(--txt2)",
            marginTop:8, letterSpacing:"0.05em",
          }}>{sub}</p>
        )}
        <div style={{
          marginTop:18, height:1.5, borderRadius:100,
          background:`linear-gradient(90deg, ${accent}70, ${accent}18, transparent)`,
          width:"50%",
        }}/>
      </div>
    </div>
  );
}

// ── ProjectCard ───────────────────────────────────────────────────────────────
function ProjectCard({ project, deleting, onContinue, onDelete, animDelay=0 }: {
  project:Project; deleting:boolean;
  onContinue:()=>void; onDelete:()=>void; animDelay?:number;
}) {
  const finished = ["trained","evaluated","completed"].includes(project.stage);
  const pct = Math.round((stageIdx(project.stage) / (STAGE_ORDER.length - 1)) * 100);
  const t = stageTheme(project.stage);
  const isActive = !finished && project.stage !== "initialized";

  return (
    <div className="gc-wrap scan-host rise" style={{ animationDelay:`${animDelay}ms` }}>
      <div className="scan-el"/>
      <div className="gc-inner">
        <div style={{ padding:"20px 20px 18px" }}>

          {/* ── Header ── */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:11, minWidth:0 }}>
              {/* Icon */}
              <div style={{
                width:40, height:40, flexShrink:0, borderRadius:12,
                background:`linear-gradient(140deg, ${t.bg}, rgba(255,255,255,0.015))`,
                border:`1px solid ${t.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, position:"relative",
                boxShadow: isActive ? `0 0 14px ${t.glow}` : "none",
              }}>
                {finished ? "✓" : isActive ? "◈" : "○"}
                {isActive && (
                  <span style={{
                    position:"absolute", top:-2, right:-2,
                    width:7, height:7, borderRadius:"50%",
                    background:t.col, border:"1.5px solid var(--bg1)",
                  }}>
                    <span style={{
                      position:"absolute", inset:0, borderRadius:"50%",
                      background:t.col, animation:"ping-out 2s ease infinite",
                    }}/>
                  </span>
                )}
              </div>
              {/* Name & file */}
              <div style={{ minWidth:0, paddingTop:2 }}>
                <h3 style={{
                  fontFamily:"var(--font-display)", fontSize:14, fontWeight:700,
                  color:"var(--txt0)", overflow:"hidden", textOverflow:"ellipsis",
                  whiteSpace:"nowrap", lineHeight:1.3, letterSpacing:"-0.02em",
                }}>{project.name}</h3>
                {project.dataset?.filename && (
                  <p style={{
                    fontFamily:"var(--font-mono)", fontSize:9, color:"var(--txt2)",
                    marginTop:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  }}>{project.dataset.filename}</p>
                )}
              </div>
            </div>
            {/* Stage badge */}
            <span className="badge" style={{
              background:t.bg, color:t.col, borderColor:t.border,
              boxShadow:`0 0 10px ${t.glow}`, flexShrink:0,
            }}>{stageLabel(project.stage)}</span>
          </div>

          {/* ── Meta chips ── */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:14, minHeight:18 }}>
            {project.problemType && (
              <span className="chip" style={{
                background:"rgba(255,255,255,0.025)",
                borderColor:"rgba(255,255,255,0.06)",
                color:"var(--txt1)", textTransform:"capitalize",
              }}>{project.problemType}</span>
            )}
            {project.targetColumn && (
              <span className="chip" style={{
                background:"rgba(255,255,255,0.015)",
                borderColor:"rgba(255,255,255,0.04)",
                color:"var(--txt2)",
              }}>→ {project.targetColumn}</span>
            )}
            {project.selectedModel && (
              <span className="chip" style={{
                background:"rgba(99,102,241,0.07)",
                borderColor:"rgba(99,102,241,0.16)",
                color:"#a5b4fc",
              }}>{project.selectedModel}</span>
            )}
            <span style={{
              marginLeft:"auto",
              fontFamily:"var(--font-mono)", fontSize:9, color:"var(--txt2)",
              letterSpacing:"0.03em", alignSelf:"center",
            }}>
              {new Date(project.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
            </span>
          </div>

          {/* ── Progress bar ── */}
          <div style={{ marginBottom:2 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
              <span style={{
                fontFamily:"var(--font-mono)", fontSize:9, color:"var(--txt2)",
                letterSpacing:"0.1em", textTransform:"uppercase",
              }}>Pipeline</span>
              <span style={{
                fontFamily:"var(--font-mono)", fontSize:9, fontWeight:500,
                color: finished ? "#34d399" : "#a5b4fc",
              }}>{pct}%</span>
            </div>
            <div className="p-rail">
              <div className="p-fill" style={{
                width:`${pct}%`,
                background: finished
                  ? "linear-gradient(90deg,#34d399,#22d3ee)"
                  : "linear-gradient(90deg,#6366f1,#c084fc)",
              }}/>
            </div>
          </div>

          <StageTracker stage={project.stage}/>

          {/* ── Divider ── */}
          <div style={{
            height:1,
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.045),transparent)",
            margin:"14px 0",
          }}/>

          {/* ── Actions ── */}
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-primary" onClick={onContinue} style={{ flex:1, padding:"9px 12px", fontSize:12, borderRadius:10 }}>
              {finished ? (
                <>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  View Results
                </>
              ) : (
                <>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Continue
                </>
              )}
            </button>
            <button
              className="btn-delete"
              onClick={onDelete}
              disabled={deleting}
              style={{ width:36, height:36 }}
              title="Delete project"
            >
              {deleting
                ? <div style={{ width:12, height:12, border:"2px solid rgba(248,113,113,0.25)", borderTopColor:"#f87171", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
                : <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DeleteConfirmModal ────────────────────────────────────────────────────────
function DeleteConfirmModal({ project, onConfirm, onCancel }: {
  project:Project; onConfirm:()=>void; onCancel:()=>void;
}) {
  const [input, setInput] = useState("");
  const ok = input === "delete";
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:500,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(3,5,14,0.86)", backdropFilter:"blur(20px)",
      padding:16, animation:"fadeIn 0.2s ease",
    }}>
      <div className="gc-wrap pop" style={{ width:"100%", maxWidth:380 }}>
        <div className="gc-inner" style={{ padding:26 }}>
          <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:20 }}>
            <div style={{
              width:44, height:44, borderRadius:13, flexShrink:0,
              background:"rgba(248,113,113,0.08)",
              border:"1px solid rgba(248,113,113,0.18)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
            }}>🗑</div>
            <div>
              <h3 style={{ fontFamily:"var(--font-display)", fontSize:16, fontWeight:800, color:"var(--txt0)", letterSpacing:"-0.02em" }}>
                Delete Project
              </h3>
              <p style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--txt2)", marginTop:3, letterSpacing:"0.08em" }}>
                IRREVERSIBLE — CANNOT BE UNDONE
              </p>
            </div>
          </div>
          <p style={{ fontFamily:"var(--font-body)", fontSize:13, color:"var(--txt1)", lineHeight:1.65, marginBottom:20 }}>
            This will permanently delete{" "}
            <span style={{ fontWeight:700, color:"var(--txt0)" }}>"{project.name}"</span>{" "}
            and all associated data, models, and results.
          </p>
          <p style={{ fontFamily:"var(--font-body)", fontSize:11, color:"var(--txt1)", marginBottom:8, fontWeight:600 }}>
            Type{" "}
            <code style={{
              fontFamily:"var(--font-mono)", color:"#f87171",
              background:"rgba(248,113,113,0.08)",
              border:"1px solid rgba(248,113,113,0.18)",
              padding:"2px 7px", borderRadius:5,
            }}>delete</code>{" "}
            to confirm
          </p>
          <input
            className="input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="delete"
            autoFocus
            onKeyDown={e => { if(e.key==="Enter" && ok) onConfirm(); if(e.key==="Escape") onCancel(); }}
            style={{
              padding:"10px 13px", fontSize:13,
              fontFamily:"var(--font-mono)", marginBottom:20,
              ...(ok ? { borderColor:"rgba(248,113,113,0.38)", boxShadow:"0 0 0 3px rgba(248,113,113,0.06)" } : {}),
            }}
          />
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn-ghost" onClick={onCancel} style={{ flex:1, padding:"10px", fontSize:13 }}>Cancel</button>
            <button
              onClick={onConfirm}
              disabled={!ok}
              style={{
                flex:1, padding:"10px", fontSize:13,
                fontFamily:"var(--font-body)", fontWeight:700,
                borderRadius:10, cursor:ok?"pointer":"not-allowed",
                border:"none", transition:"all 0.2s",
                background:ok?"linear-gradient(135deg,#dc2626,#ef4444)":"rgba(255,255,255,0.03)",
                color:ok?"#fff":"var(--txt3)",
                boxShadow:ok?"0 4px 18px rgba(239,68,68,0.32)":"none",
              }}
            >Delete Forever</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NewProjectModal ───────────────────────────────────────────────────────────
const GOAL_OPTIONS = [
  { value:"auto",           icon:"◎", label:"Auto-detect",        desc:"Let the AI figure out the best approach" },
  { value:"classification", icon:"◈", label:"Predict a category", desc:"Spam, churn, diagnosis, fraud…" },
  { value:"regression",     icon:"◬", label:"Predict a number",   desc:"Price, sales, temperature…" },
  { value:"clustering",     icon:"⬡", label:"Group similar items",desc:"Customer segments, topics…" },
  { value:"anomaly",        icon:"⚠", label:"Detect anomalies",   desc:"Fraud detection, equipment failure…" },
];

function NewProjectModal({ onStart, onCancel }: {
  onStart:(name:string,goal:string,targetCol:string)=>void;
  onCancel:()=>void;
}) {
  const [name, setName]     = useState("");
  const [goal, setGoal]     = useState("");
  const [target, setTarget] = useState("");
  const canStart = name.trim().length > 0 && goal !== "";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:500,
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(3,5,14,0.9)", backdropFilter:"blur(22px)",
      padding:16, animation:"fadeIn 0.22s ease",
    }}>
      <div className="gc-wrap pop" style={{ width:"100%", maxWidth:450 }}>
        <div className="gc-inner" style={{ maxHeight:"90vh", overflowY:"auto" }}>
          <div style={{ padding:"24px 24px 26px" }}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:13 }}>
                <div style={{
                  width:44, height:44, borderRadius:13, flexShrink:0,
                  background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.22)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:18, boxShadow:"0 0 16px rgba(99,102,241,0.12)",
                }}>⬡</div>
                <div>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:18, fontWeight:800, color:"var(--txt0)", letterSpacing:"-0.03em" }}>
                    New Project
                  </h3>
                  <p style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--txt2)", marginTop:3, letterSpacing:"0.1em" }}>
                    CONFIGURE BEFORE UPLOADING DATA
                  </p>
                </div>
              </div>
              <button
                className="btn-ghost"
                onClick={onCancel}
                style={{ width:30, height:30, padding:0, borderRadius:8, fontSize:16, flexShrink:0 }}
              >×</button>
            </div>

            {/* Name */}
            <div style={{ marginBottom:20 }}>
              <label style={{
                display:"block", fontFamily:"var(--font-mono)", fontSize:9, fontWeight:400,
                color:"var(--txt2)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8,
              }}>
                Project Name <span style={{ color:"#f87171" }}>*</span>
              </label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Customer Churn Prediction"
                autoFocus
                onKeyDown={e => { if(e.key==="Escape") onCancel(); }}
                style={{ padding:"11px 14px", fontSize:13, fontFamily:"var(--font-body)" }}
              />
            </div>

            {/* Goal */}
            <div style={{ marginBottom:20 }}>
              <label style={{
                display:"block", fontFamily:"var(--font-mono)", fontSize:9, fontWeight:400,
                color:"var(--txt2)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8,
              }}>
                Prediction Goal <span style={{ color:"#f87171" }}>*</span>
              </label>
              <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                {GOAL_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`goal-opt${goal===opt.value?" sel":""}`}
                  >
                    <span style={{
                      fontFamily:"var(--font-mono)", fontSize:13, flexShrink:0,
                      color:goal===opt.value?"#a5b4fc":"var(--txt2)",
                    }}>{opt.icon}</span>
                    <span style={{ flex:1 }}>
                      <span style={{ display:"block", fontFamily:"var(--font-body)", fontSize:13, fontWeight:600, letterSpacing:"-0.01em" }}>
                        {opt.label}
                      </span>
                      <span style={{ display:"block", fontFamily:"var(--font-body)", fontSize:11, color:"var(--txt2)", marginTop:1 }}>
                        {opt.desc}
                      </span>
                    </span>
                    {goal===opt.value && (
                      <span style={{
                        width:17, height:17, borderRadius:"50%", flexShrink:0,
                        background:"var(--ind)", display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:7, color:"#fff", fontWeight:900,
                      }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Target column */}
            <div style={{ marginBottom:20 }}>
              <label style={{
                display:"block", fontFamily:"var(--font-mono)", fontSize:9, fontWeight:400,
                color:"var(--txt2)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8,
              }}>
                Target Column{" "}
                <span style={{ fontSize:9, color:"var(--txt2)", textTransform:"none", letterSpacing:"normal", fontWeight:400, opacity:0.7 }}>
                  (optional)
                </span>
              </label>
              <input
                className="input"
                type="text"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g. Churn, Price — leave blank to auto-detect"
                style={{ padding:"11px 14px", fontSize:12, fontFamily:"var(--font-mono)" }}
              />
            </div>

            {/* Validation warning */}
            {!canStart && (name.trim() || goal) && (
              <div style={{
                display:"flex", alignItems:"center", gap:9,
                padding:"9px 12px", borderRadius:9,
                background:"rgba(251,191,36,0.05)",
                border:"1px solid rgba(251,191,36,0.15)",
                marginBottom:16,
              }}>
                <span style={{ fontSize:11 }}>◈</span>
                <p style={{ fontFamily:"var(--font-body)", fontSize:11, color:"#fbbf24", fontWeight:600 }}>
                  {!name.trim() ? "Project name is required." : "Select a prediction goal to continue."}
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-ghost" onClick={onCancel} style={{ padding:"11px 16px", fontSize:12 }}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => onStart(name.trim(), goal, target.trim())}
                disabled={!canStart}
                style={{ flex:1, padding:"11px", fontSize:13, borderRadius:12 }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Launch Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [user,         setUser]         = useState<{name?:string;email?:string;avatar?:string;role?:string}|null>(null);
  const [projects,     setProjects]     = useState<Project[]>([]);
  const [stats,        setStats]        = useState<Stats>({total:0,active:0,completed:0});
  const [loading,      setLoading]      = useState(true);
  const [backendOk,    setBackendOk]    = useState(true);
  const [notice,       setNotice]       = useState<{msg:string;ok:boolean}|null>(null);
  const [dropOpen,     setDropOpen]     = useState(false);
  const [deleting,     setDeleting]     = useState<string|null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project|null>(null);
  const [showNewProj,  setShowNewProj]  = useState(false);

  const toast = useCallback((msg:string, ok=true) => {
    setNotice({msg,ok});
    setTimeout(()=>setNotice(null), 3500);
  },[]);

  const loadData = useCallback(async () => {
    try {
      const me = await api("/api/auth/me");
      setUser(me.user);
    } catch { router.push("/login"); return; }
    try {
      const [projRes, statsRes] = await Promise.all([
        api("/api/user/projects"),
        api("/api/user/projects/stats"),
      ]);
      setProjects(projRes.projects ?? []);
      setStats(statsRes);
      setBackendOk(true);
    } catch {
      setBackendOk(false);
      loadFromLocalStorage();
    } finally { setLoading(false); }
  },[router]);

  function loadFromLocalStorage() {
    if(typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("userProjects");
      if(!raw) return;
      const saved = JSON.parse(raw) as Array<{id:string;name:string;dataset:string;status:string;createdDate:string;}>;
      const mapped:Project[] = saved.map(p => ({
        _id:p.id, sessionId:p.id, name:p.name,
        dataset:{filename:p.dataset},
        stage:p.status==="validated"?"eda_completed":"initialized",
        createdAt:p.createdDate, updatedAt:p.createdDate,
      }));
      setProjects(mapped);
      setStats({
        total:mapped.length,
        active:mapped.filter(p=>p.stage==="initialized").length,
        completed:mapped.filter(p=>p.stage==="eda_completed").length,
      });
    } catch {}
  }

  useEffect(()=>{ loadData(); },[loadData]);

  useEffect(()=>{
    const h = (e:MouseEvent) => {
      if(!(e.target as HTMLElement).closest("#user-menu")) setDropOpen(false);
    };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  },[]);

  const handleLogout = async () => {
    const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    try { await fetch(`${BASE}/api/auth/logout`,{method:"POST",credentials:"include"}); } catch {}
    localStorage.removeItem("userAvatar");
    window.location.href = "/";
  };

  const handleDelete = (p:Project) => setDeleteTarget(p);

  const executeDelete = useCallback(async () => {
    const project = deleteTarget;
    if(!project) return;
    setDeleteTarget(null);
    setDeleting(project._id);
    try {
      if(backendOk) {
        await api(`/api/user/projects/${project._id}`,{method:"DELETE"});
      } else {
        const raw = localStorage.getItem("userProjects");
        if(raw) {
          const saved = JSON.parse(raw).filter((p:{id:string})=>p.id!==project._id);
          localStorage.setItem("userProjects", JSON.stringify(saved));
        }
      }
      setProjects(prev => prev.filter(p => p._id !== project._id));
      setStats(prev => ({...prev, total:prev.total-1}));
      toast("Project deleted");
    } catch { toast("Failed to delete project", false); }
    finally { setDeleting(null); }
  },[deleteTarget, backendOk, toast]);

  const handleNewProject = useCallback(async (name:string, goal:string, targetCol:string) => {
    setShowNewProj(false);
    let sessionId: string | undefined;

    try {
      const sessionRes = await fetch(`${LAB_URL}/session`, { method: "POST" });
      if (!sessionRes.ok) throw new Error(`HTTP ${sessionRes.status}`);

      const sessionData = await sessionRes.json();
      sessionId = sessionData.session_id;

      if (sessionId) {
        await api("/api/user/projects", {
          method: "POST",
          body: JSON.stringify({
            sessionId,
            name,
            stage: "initialized",
            problemType: goal === "auto" ? "Auto-detect" : goal,
            targetColumn: targetCol || undefined,
          }),
        });
      }
    } catch {
      toast("Project started. It will sync once the backend is available.", false);
    }

    localStorage.setItem("mlNewProject", JSON.stringify({ name, goal, targetCol, sessionId }));
    router.push("/lab");
  },[router, toast]);

  const handleContinue = (project:Project) => {
    const ctx = {
      sessionId:project.sessionId, name:project.name, stage:project.stage,
      filename:project.dataset?.filename, filePath:project.dataset?.filePath,
      targetColumn:project.targetColumn, problemType:project.problemType,
      selectedModel:project.selectedModel,
    };
    localStorage.setItem("mlContinueProject", JSON.stringify(ctx));
    router.push("/lab");
  };

  // ── Loading Skeleton ───────────────────────────────────────────────────────
  if(!user || loading) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg0)" }}>
        <style>{STYLES}</style>
        <div style={{
          height:56, borderBottom:"1px solid var(--rim0)",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 28px", background:"rgba(6,9,18,0.8)",
        }}>
          <div className="skel" style={{ width:120, height:26 }}/>
          <div style={{ display:"flex", gap:10 }}>
            <div className="skel" style={{ width:78, height:28, borderRadius:100 }}/>
            <div className="skel" style={{ width:32, height:32, borderRadius:"50%" }}/>
          </div>
        </div>
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"48px 24px", display:"flex", flexDirection:"column", gap:32 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div className="skel" style={{ width:280, height:34, marginBottom:10 }}/>
              <div className="skel" style={{ width:350, height:14 }}/>
            </div>
            <div className="skel" style={{ width:140, height:44, borderRadius:14 }}/>
          </div>
          <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {[0,1,2].map(i=><div key={i} className="skel" style={{ height:136, borderRadius:22 }}/>)}
          </div>
          <div className="skel" style={{ height:120, borderRadius:18 }}/>
          <div className="proj-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[0,1,2,3].map(i=><div key={i} className="skel" style={{ height:248, borderRadius:24 }}/>)}
          </div>
        </div>
      </div>
    );
  }

  const recentProjects = [...projects].sort(
    (a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div style={{
      minHeight:"100vh",
      background:"var(--bg0)",
      color:"var(--txt0)",
      fontFamily:"var(--font-body)",
    }}>
      <style>{STYLES}</style>

      {/* ── Background atmosphere ── */}
      <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}>
        {/* Base gradient */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(170deg,#060b18 0%,#050910 50%,#040711 100%)" }}/>
        {/* Fine dot grid */}
        <div style={{
          position:"absolute", inset:0, opacity:0.022,
          backgroundImage:"radial-gradient(circle, rgba(148,163,184,0.9) 1px, transparent 1px)",
          backgroundSize:"32px 32px",
        }}/>
        {/* Ambient glows */}
        <div style={{
          position:"absolute", top:"8%", left:"30%", width:700, height:700,
          background:"radial-gradient(circle,rgba(99,102,241,0.045) 0%,transparent 65%)",
          borderRadius:"50%", animation:"bg-drift 24s ease infinite",
        }}/>
        <div style={{
          position:"absolute", bottom:"12%", right:"8%", width:460, height:460,
          background:"radial-gradient(circle,rgba(192,132,252,0.035) 0%,transparent 65%)",
          borderRadius:"50%", animation:"bg-drift 32s ease infinite reverse",
        }}/>
        <div style={{
          position:"absolute", top:"50%", left:"2%", width:260, height:260,
          background:"radial-gradient(circle,rgba(52,211,153,0.022) 0%,transparent 65%)",
          borderRadius:"50%",
        }}/>
        {/* SVG grain texture */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.012 }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)"/>
        </svg>
      </div>

      {/* ── Toast notification ── */}
      {notice && (
        <div style={{
          position:"fixed", top:18, right:18, zIndex:9999,
          display:"flex", alignItems:"center", gap:9,
          padding:"11px 16px", borderRadius:13,
          border:`1px solid ${notice.ok?"rgba(52,211,153,0.18)":"rgba(248,113,113,0.18)"}`,
          background:notice.ok?"rgba(4,16,10,0.97)":"rgba(24,4,7,0.97)",
          color:notice.ok?"#34d399":"#f87171",
          fontSize:12, fontWeight:600, fontFamily:"var(--font-body)",
          boxShadow:`0 14px 48px rgba(0,0,0,0.6),0 0 20px ${notice.ok?"rgba(52,211,153,0.05)":"rgba(248,113,113,0.05)"}`,
          backdropFilter:"blur(20px)",
          animation:"toast-in 0.26s cubic-bezier(0.34,1.56,0.64,1)",
          letterSpacing:"-0.01em",
        }}>
          <div style={{
            width:20, height:20, borderRadius:"50%", flexShrink:0,
            background:notice.ok?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:9, fontWeight:900,
          }}>{notice.ok?"✓":"✕"}</div>
          {notice.msg}
        </div>
      )}

      {/* ── Navigation ── */}
      <nav style={{
        position:"relative", zIndex:10, height:56,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 26px",
        borderBottom:"1px solid var(--rim0)",
        background:"rgba(5,8,17,0.82)",
        backdropFilter:"blur(28px)",
      }}>
        {/* Bottom accent line */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.14),rgba(192,132,252,0.1),transparent)",
        }}/>

        <Logo href="/home" size="md"/>

        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
      {/* ML Tutorial button - NEW */}
      <button 
        onClick={() => router.push("/ml-tutorial")}
        className="nav-pill"
        style={{
          background:"rgba(192,132,252,0.06)",
          borderColor:"rgba(192,132,252,0.15)",
          cursor: "pointer"
        }}
      >
        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        ML Tutorial
      </button>

          {/* Back to home */}
          <button onClick={() => router.push("/home")} className="nav-pill">
            <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Home
          </button>

          {/* User dropdown */}
          <div id="user-menu" style={{ position:"relative" }}>
            <button
              onClick={() => setDropOpen(o=>!o)}
              style={{
                display:"flex", alignItems:"center", gap:8, padding:"4px 9px 4px 5px",
                borderRadius:100, cursor:"pointer", transition:"all 0.18s",
                background:dropOpen?"rgba(255,255,255,0.05)":"transparent",
                border:`1px solid ${dropOpen?"var(--rim1)":"transparent"}`,
              }}
              onMouseEnter={e=>{
                (e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.borderColor="var(--rim1)";
              }}
              onMouseLeave={e=>{
                if(!dropOpen){
                  (e.currentTarget as HTMLButtonElement).style.background="transparent";
                  (e.currentTarget as HTMLButtonElement).style.borderColor="transparent";
                }
              }}
            >
              <div style={{ position:"relative" }}>
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name||"U")}&background=312e81&color=c7d2fe&bold=true`}
                  alt="avatar"
                  style={{ width:28, height:28, borderRadius:"50%", border:"1.5px solid rgba(99,102,241,0.45)", display:"block" }}
                />
                <span style={{
                  position:"absolute", bottom:0, right:0,
                  width:7, height:7, borderRadius:"50%",
                  background:"#34d399", border:"1.5px solid var(--bg0)",
                }}/>
              </div>
              <span style={{ fontSize:12, color:"var(--txt0)", fontWeight:600, letterSpacing:"-0.01em" }}>
                {user.name}
              </span>
              <svg
                width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="var(--txt2)"
                style={{ transform:dropOpen?"rotate(180deg)":"none", transition:"transform 0.22s" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {dropOpen && (
              <div className="surface rise" style={{
                position:"absolute", right:0, top:"calc(100% + 10px)", width:210,
                overflow:"hidden", zIndex:100, animationDuration:"0.18s",
                boxShadow:"0 20px 56px rgba(0,0,0,0.6),0 0 0 1px rgba(99,102,241,0.08)",
              }}>
                <div style={{ padding:"13px 15px", borderBottom:"1px solid var(--rim0)" }}>
                  <p style={{
                    fontSize:13, fontWeight:700, color:"var(--txt0)",
                    fontFamily:"var(--font-display)", letterSpacing:"-0.02em",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  }}>{user.name}</p>
                  <p style={{
                    fontSize:10, color:"var(--txt2)", marginTop:2,
                    fontFamily:"var(--font-mono)",
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  }}>{user.email}</p>
                </div>
                {[
                  {
                    label:"Profile", path:"/profile", show:true,
                    d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                  },
                  {
                    label:"Admin", path:"/admin", show:user.role==="admin",
                    d:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
                  },
                ].filter(i=>i.show).map(item=>(
                  <button
                    key={item.path}
                    onClick={()=>router.push(item.path)}
                    style={{
                      width:"100%", display:"flex", alignItems:"center", gap:9,
                      padding:"9px 15px", background:"transparent", border:"none",
                      color:"var(--txt1)", fontSize:12, cursor:"pointer",
                      fontFamily:"var(--font-body)", fontWeight:500, transition:"all 0.15s",
                      letterSpacing:"-0.01em",
                    }}
                    onMouseEnter={e=>{
                      (e.currentTarget as HTMLButtonElement).style.background="rgba(99,102,241,0.06)";
                      (e.currentTarget as HTMLButtonElement).style.color="var(--txt0)";
                    }}
                    onMouseLeave={e=>{
                      (e.currentTarget as HTMLButtonElement).style.background="transparent";
                      (e.currentTarget as HTMLButtonElement).style.color="var(--txt1)";
                    }}
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.d}/>
                    </svg>
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop:"1px solid var(--rim0)", paddingTop:3 }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width:"100%", display:"flex", alignItems:"center", gap:9,
                      padding:"9px 15px", background:"transparent", border:"none",
                      color:"#f87171", fontSize:12, cursor:"pointer",
                      fontFamily:"var(--font-body)", fontWeight:500, transition:"all 0.15s",
                      letterSpacing:"-0.01em",
                    }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(248,113,113,0.06)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";}}
                  >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main style={{
        position:"relative", zIndex:1,
        maxWidth:1100, margin:"0 auto",
        padding:"48px 24px 96px",
        display: 'grid', gridTemplateColumns: '250px 1fr', gap: 18, alignItems: 'start',
      }}>
        {/* Sidebar */}
        <aside style={{
          position: 'sticky', top: 78, background: 'rgba(4,7,14,0.85)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14,
          padding: '12px 10px', height: 'fit-content', maxHeight: '80vh', overflowY: 'auto'
        }}>
          <div style={{fontFamily: 'var(--fd)', fontSize: 12, fontWeight: 700, color: 'var(--txt0)', marginBottom: 10}}>Dashboard</div>
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'projects', label: 'Projects', icon: '📁' },
            { id: 'activity', label: 'Activity', icon: '📈' },
          ].map((item) => (
            <button key={item.id} style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px',
              borderRadius: 8, border: 'none', background: 'transparent',
              color: 'var(--txt1)', cursor: 'pointer', marginBottom: 4,
              fontFamily: 'var(--fb)', fontSize: 11
            }}>
              {item.icon} {item.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* ── Page header ── */}
        <div className="page-head rise d0" style={{
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:20,
        }}>
          <div>
            {/* Live indicator */}
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
              <span style={{
                width:5, height:5, borderRadius:"50%",
                background:"#34d399",
                boxShadow:"0 0 8px rgba(52,211,153,0.7)",
                display:"inline-block",
                animation:"pulse-dot 2.4s ease infinite",
              }}/>
              <span style={{
                fontFamily:"var(--font-mono)", fontSize:9, fontWeight:400,
                letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--txt2)",
              }}>AI-Powered ML Pipeline · Live</span>
            </div>

            <h1 style={{
              fontFamily:"var(--font-display)", fontSize:30, fontWeight:800,
              letterSpacing:"-0.04em", lineHeight:1.1, color:"var(--txt0)",
            }}>
              Your{" "}
              <span style={{
                background:"linear-gradient(120deg,#a5b4fc 0%,#c084fc 50%,#67e8f9 100%)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                backgroundClip:"text",
              }}>ML Workspace</span>
            </h1>
            <p style={{
              fontFamily:"var(--font-body)", fontSize:13, color:"var(--txt2)",
              marginTop:10, fontWeight:400, lineHeight:1.7, maxWidth:420,
            }}>
              Upload a dataset, let the AI profile it, select the best model, train and evaluate — all in one streamlined pipeline.
            </p>
          </div>

          <button
            className="btn-primary"
            onClick={() => setShowNewProj(true)}
            style={{ padding:"12px 24px", fontSize:13, flexShrink:0, borderRadius:14 }}
          >
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            New Project
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          <StatCard label="Total Projects"  value={stats.total}     sub="across all sessions"  icon="📁" accent="#6366f1" delay={0}   />
          <StatCard label="In Progress"      value={stats.active}    sub="currently running"    icon="⚡" accent="#c084fc" delay={70}  />
          <StatCard label="Models Trained"   value={stats.completed} sub="ready for evaluation" icon="🤖" accent="#34d399" delay={140} />
        </div>

        {/* ── Pipeline legend ── */}
        <div className="surface rise d2" style={{ padding:"24px 26px" }}>
          <div style={{
            position:"absolute", top:0, left:60, right:60, height:1,
            background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.2),rgba(192,132,252,0.14),transparent)",
          }}/>
          <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:18 }}>
            <div style={{
              width:2.5, height:16, borderRadius:2,
              background:"linear-gradient(180deg,var(--ind),var(--vio))", flexShrink:0,
            }}/>
            <p style={{
              fontFamily:"var(--font-mono)", fontSize:9, fontWeight:400,
              letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--txt2)",
            }}>Ml Pipeline</p>
          </div>

          <div className="leg-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {([
              {
                icon:"📂", label:"Upload Dataset",
                desc:"CSV or Excel dropped in, parsed instantly",
                bg:"rgba(96,165,250,0.045)", border:"rgba(96,165,250,0.12)",
                ib:"rgba(96,165,250,0.2)", ic:"rgba(96,165,250,0.08)",
                tc:"#60a5fa", n:"01",
              },
              {
                icon:"🔍", label:"EDA & Analysis",
                desc:"AI profiles columns, detects types & patterns",
                bg:"rgba(99,102,241,0.045)", border:"rgba(99,102,241,0.12)",
                ib:"rgba(99,102,241,0.2)", ic:"rgba(99,102,241,0.08)",
                tc:"#818cf8", n:"02",
              },
              {
                icon:"🏗", label:"Model Training",
                desc:"Best-fit pipeline built, tuned & executed",
                bg:"rgba(192,132,252,0.04)", border:"rgba(192,132,252,0.11)",
                ib:"rgba(192,132,252,0.18)", ic:"rgba(192,132,252,0.07)",
                tc:"#c084fc", n:"03",
              },
              {
                icon:"✅", label:"Evaluation",
                desc:"Metrics scored, predictions validated",
                bg:"rgba(52,211,153,0.035)", border:"rgba(52,211,153,0.1)",
                ib:"rgba(52,211,153,0.16)", ic:"rgba(52,211,153,0.06)",
                tc:"#34d399", n:"04",
              },
            ] as const).map((s, i) => (
              <div
                key={s.label}
                className={`legend-step rise d${i+2}`}
                style={{ background:s.bg, borderColor:s.border }}
              >
                <div style={{
                  width:36, height:36, borderRadius:10, flexShrink:0, fontSize:15,
                  background:s.ic, border:`1px solid ${s.ib}`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>{s.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{
                    fontFamily:"var(--font-body)", fontSize:12, fontWeight:700,
                    color:"var(--txt0)", marginBottom:2, letterSpacing:"-0.01em",
                  }}>{s.label}</p>
                  <p style={{
                    fontFamily:"var(--font-body)", fontSize:10, color:"var(--txt2)", lineHeight:1.4,
                  }}>{s.desc}</p>
                </div>
                <span style={{
                  position:"absolute", top:10, right:11,
                  fontFamily:"var(--font-mono)", fontSize:10, fontWeight:400,
                  color:s.tc, opacity:0.35,
                }}>{s.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Projects ── */}
        <section>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <h2 style={{
                fontFamily:"var(--font-display)", fontSize:21, fontWeight:800,
                letterSpacing:"-0.03em", color:"var(--txt0)",
              }}>Projects</h2>
              {recentProjects.length > 0 && (
                <span style={{
                  fontFamily:"var(--font-mono)", fontSize:9, fontWeight:400, padding:"2px 10px",
                  borderRadius:100, background:"rgba(99,102,241,0.09)",
                  border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc",
                  letterSpacing:"0.04em",
                }}>{recentProjects.length}</span>
              )}
            </div>
            {!backendOk && (
              <span style={{
                fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:"0.07em",
                padding:"4px 11px", borderRadius:100,
                background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.16)",
                color:"#fbbf24",
              }}>⚠ LOCAL ONLY</span>
            )}
          </div>

          {recentProjects.length === 0 ? (
            /* ── Empty state ── */
            <div style={{
              border:"1px dashed rgba(99,102,241,0.12)",
              borderRadius:22,
              background:"rgba(99,102,241,0.018)",
              display:"flex", flexDirection:"column", alignItems:"center",
              justifyContent:"center", padding:"88px 24px", gap:20,
            }}>
              <div style={{
                width:68, height:68, borderRadius:20,
                background:"rgba(99,102,241,0.07)",
                border:"1px solid rgba(99,102,241,0.13)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:26, position:"relative",
                animation:"float-up 3s ease infinite",
              }}>
                ⬡
                <span style={{
                  position:"absolute", inset:-1, borderRadius:20,
                  border:"1px solid rgba(99,102,241,0.13)",
                  animation:"ping-out 3s ease infinite",
                }}/>
              </div>
              <div style={{ textAlign:"center" }}>
                <p style={{
                  fontFamily:"var(--font-display)", fontSize:17, fontWeight:700,
                  color:"var(--txt0)", marginBottom:8, letterSpacing:"-0.02em",
                }}>Nothing here yet</p>
                <p style={{
                  fontFamily:"var(--font-body)", fontSize:13, color:"var(--txt2)",
                  lineHeight:1.7, maxWidth:330,
                }}>
                  Start your first ML project. Upload any CSV or Excel file and the AI will profile it, select the best model, train and evaluate — completely hands-free.
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => setShowNewProj(true)}
                style={{ padding:"11px 28px", fontSize:13, borderRadius:13 }}
              >+ New Project</button>
            </div>
          ) : (
            <div className="proj-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {recentProjects.map((project, i) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  deleting={deleting===project._id}
                  onContinue={() => handleContinue(project)}
                  onDelete={() => handleDelete(project)}
                  animDelay={i*55}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Recent Activity ── */}
        {recentProjects.length > 0 && (
          <section className="rise d5">
            <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:20 }}>
              <div style={{
                width:2.5, height:16, borderRadius:2,
                background:"linear-gradient(180deg,#22d3ee,#818cf8)", flexShrink:0,
              }}/>
              <h2 style={{
                fontFamily:"var(--font-display)", fontSize:21, fontWeight:800,
                letterSpacing:"-0.03em", color:"var(--txt0)",
              }}>Recent Activity</h2>
            </div>

            <div className="surface" style={{ overflow:"hidden" }}>
              <div style={{
                position:"absolute", top:0, left:60, right:60, height:1,
                background:"linear-gradient(90deg,transparent,rgba(34,211,238,0.16),transparent)",
              }}/>
              {recentProjects.slice(0,6).map((project, i) => {
                const t = stageTheme(project.stage);
                return (
                  <div
                    key={project._id}
                    className="activity-row"
                    onClick={() => handleContinue(project)}
                    style={{
                      display:"flex", alignItems:"center", gap:13,
                      padding:"13px 20px",
                      borderBottom:i<Math.min(recentProjects.length,6)-1?"1px solid var(--rim0)":"none",
                    }}
                  >
                    {/* Stage icon */}
                    <div style={{
                      width:34, height:34, borderRadius:10, flexShrink:0,
                      background:t.bg, border:`1px solid ${t.border}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, color:t.col, fontFamily:"var(--font-mono)",
                      boxShadow:`0 0 10px ${t.glow}`,
                    }}>
                      {["evaluated","completed"].includes(project.stage) ? "✓"
                        : project.stage==="trained" ? "◈"
                        : project.stage==="eda_completed" ? "◬"
                        : project.stage==="dataset_uploaded" ? "▣"
                        : "○"}
                    </div>

                    {/* Name & stage */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{
                        fontFamily:"var(--font-body)", fontSize:12, fontWeight:600,
                        color:"var(--txt0)", overflow:"hidden", textOverflow:"ellipsis",
                        whiteSpace:"nowrap", letterSpacing:"-0.01em",
                      }}>{project.name}</p>
                      <p style={{
                        fontFamily:"var(--font-mono)", fontSize:9, color:"var(--txt2)",
                        marginTop:2, letterSpacing:"0.03em",
                      }}>
                        {stageLabel(project.stage)}
                        {project.dataset?.filename && (
                          <span style={{ color:"rgba(255,255,255,0.08)" }}> · {project.dataset.filename}</span>
                        )}
                      </p>
                    </div>

                    {/* Date & model */}
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"var(--txt2)", letterSpacing:"0.03em" }}>
                        {new Date(project.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                      </p>
                      {project.selectedModel && (
                        <p style={{ fontFamily:"var(--font-mono)", fontSize:9, color:"#a5b4fc", marginTop:2 }}>
                          {project.selectedModel}
                        </p>
                      )}
                    </div>

                    {/* Chevron */}
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="var(--txt3)">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        </div>
      </main>

      {deleteTarget && (
        <DeleteConfirmModal
          project={deleteTarget}
          onConfirm={executeDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showNewProj && (
        <NewProjectModal
          onStart={handleNewProject}
          onCancel={() => setShowNewProj(false)}
        />
      )}
    </div>
  );
}