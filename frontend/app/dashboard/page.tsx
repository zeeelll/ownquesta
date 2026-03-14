"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";

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
    return { col:"#00ffa3", glow:"rgba(0,255,163,0.25)", border:"rgba(0,255,163,0.22)", bg:"rgba(0,255,163,0.07)" };
  if (["eda_completed","model_selected","training"].includes(s))
    return { col:"#a78bfa", glow:"rgba(167,139,250,0.25)", border:"rgba(167,139,250,0.22)", bg:"rgba(167,139,250,0.07)" };
  if (s === "dataset_uploaded")
    return { col:"#38bdf8", glow:"rgba(56,189,248,0.25)", border:"rgba(56,189,248,0.22)", bg:"rgba(56,189,248,0.07)" };
  return { col:"#3a4a61", glow:"rgba(58,74,97,0.15)", border:"rgba(58,74,97,0.2)", bg:"rgba(58,74,97,0.06)" };
}

// ── Stylesheet ────────────────────────────────────────────────────────────────
const STYLES = `


  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --void:   #02040b;
    --abyss:  #040812;
    --deep:   #060c18;
    --panel:  #0a1122;
    --panel2: #0d1630;
    --panel3: #101d3a;
    --rim:    rgba(255,255,255,0.05);
    --rim2:   rgba(255,255,255,0.08);
    --rim3:   rgba(255,255,255,0.14);
    --ink:    #dde6f5;
    --ink2:   #6b82a3;
    --ink3:   #8599b8;
    --indigo: #6366f1;
    --indigo-l:#818cf8;
    --violet: #a78bfa;
    --neon:   #00ffa3;
    --sky:    #38bdf8;
    --r:      12px;
    --r-lg:   18px;
    --r-xl:   24px;
  }

  @keyframes rise      { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pop       { from{opacity:0;transform:scale(0.92) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes shimmer   { 0%{background-position:-900px 0} 100%{background-position:900px 0} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes bar-in    { from{width:0} }
  @keyframes toast-in  { from{opacity:0;transform:translateX(20px) scale(0.96)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes num-up    { from{opacity:0;transform:translateY(14px) scale(0.8)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes aurora    { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes glow-beat { 0%,100%{opacity:0.7} 50%{opacity:1} }
  @keyframes ping      { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(2.6);opacity:0} }
  @keyframes orb-float { 0%,100%{transform:translate(0,0)} 33%{transform:translate(25px,-18px)} 66%{transform:translate(-15px,12px)} }
  @keyframes grid-in   { from{opacity:0} to{opacity:1} }
  @keyframes scan      { from{top:-2px} to{top:100%} }
  @keyframes tick-bar  { from{transform:scaleX(0)} to{transform:scaleX(1)} }

  .skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%);
    background-size: 900px 100%;
    animation: shimmer 2s ease infinite;
    border-radius: var(--r);
  }

  .d0{animation-delay:0ms}   .d1{animation-delay:70ms}  .d2{animation-delay:140ms}
  .d3{animation-delay:210ms} .d4{animation-delay:280ms} .d5{animation-delay:350ms}
  .d6{animation-delay:420ms} .d7{animation-delay:490ms}

  /* ── Glass ── */
  .glass {
    background: linear-gradient(148deg, rgba(13,22,48,0.94) 0%, rgba(8,14,30,0.98) 100%);
    border: 1px solid var(--rim2);
    border-radius: var(--r-lg);
    backdrop-filter: blur(24px);
    position: relative;
    overflow: hidden;
  }
  .glass::after {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.04) 70%, transparent 100%);
    pointer-events:none;
  }

  /* ── Aurora card ── */
  .a-card {
    position:relative; border-radius:var(--r-xl); padding:1.5px;
    background: linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(167,139,250,0.2) 30%, rgba(34,211,238,0.25) 70%, rgba(99,102,241,0.3) 100%);
    background-size:300% 300%;
    animation: aurora 6s ease infinite;
    transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
  }
  .a-card:hover {
    transform: translateY(-4px) scale(1.005);
    box-shadow: 0 28px 80px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.1);
  }
  .a-inner {
    border-radius:calc(var(--r-xl) - 1.5px);
    background: linear-gradient(158deg, #0c1830 0%, #070e1e 100%);
    overflow:hidden; position:relative;
  }

  /* ── Stat card ── */
  .s-card {
    position:relative; border-radius:var(--r-xl); overflow:hidden;
    transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
  }
  .s-card:hover { transform:translateY(-5px) scale(1.01); }
  .s-bg {
    position:absolute; inset:0; border-radius:inherit;
    background: linear-gradient(155deg, var(--panel2) 0%, var(--panel) 100%);
  }
  .s-border {
    position:absolute; inset:0; border-radius:inherit;
    padding:1px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite:exclude;
  }
  .s-content { position:relative; z-index:1; }

  /* ── Btn primary ── */
  .bp {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    background:linear-gradient(135deg, #4f52e8 0%, #6366f1 50%, #7c3aed 100%);
    color:#fff; border:none; cursor:pointer; font-family:'Chillax',sans-serif; font-weight:700;
    border-radius:var(--r-lg); position:relative; overflow:hidden;
    box-shadow: 0 4px 20px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15);
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
  }
  .bp::after { content:''; position:absolute; inset:0; background:rgba(255,255,255,0); transition:background 0.15s; }
  .bp:hover { transform:translateY(-2px) scale(1.02); box-shadow: 0 10px 32px rgba(99,102,241,0.48), inset 0 1px 0 rgba(255,255,255,0.2); }
  .bp:hover::after { background:rgba(255,255,255,0.05); }
  .bp:active { transform:scale(0.97) !important; }
  .bp:disabled { background:linear-gradient(135deg,#1e243a,#252d42); color:var(--ink3); box-shadow:none; cursor:not-allowed; transform:none !important; }

  /* ── Btn ghost ── */
  .bg {
    display:inline-flex; align-items:center; justify-content:center; gap:7px;
    background:rgba(255,255,255,0.04); color:var(--ink2);
    border:1px solid var(--rim2); border-radius:var(--r); cursor:pointer;
    font-family:'Chillax',sans-serif; font-weight:600;
    transition:all 0.18s;
  }
  .bg:hover { background:rgba(255,255,255,0.07); color:var(--ink); border-color:var(--rim3); transform:translateY(-1px); }
  .bg:active { transform:scale(0.97); }

  /* ── Btn delete ── */
  .bd {
    display:flex; align-items:center; justify-content:center;
    background:transparent; border:1px solid transparent; cursor:pointer;
    color:var(--ink3); border-radius:10px;
    transition:all 0.18s;
  }
  .bd:hover { background:rgba(251,113,133,0.1); color:#fb7185; border-color:rgba(251,113,133,0.2); }
  .bd:disabled { opacity:0.3; cursor:not-allowed; }

  /* ── Input ── */
  .inp {
    width:100%;
    background:rgba(255,255,255,0.03); border:1px solid var(--rim2);
    border-radius:var(--r); color:var(--ink);
    font-family:'Chillax',sans-serif; outline:none;
    transition:border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }
  .inp::placeholder { color:var(--ink3); }
  .inp:focus { border-color:rgba(99,102,241,0.5); background:rgba(99,102,241,0.04); box-shadow:0 0 0 3px rgba(99,102,241,0.1); }

  /* ── Badge ── */
  .badge {
    display:inline-flex; align-items:center; justify-content:center;
    font-family:'Chillax',sans-serif; font-size:9px; font-weight:500;
    letter-spacing:0.06em; text-transform:uppercase;
    padding:3px 10px; border-radius:100px; border:1px solid; white-space:nowrap;
  }

  /* ── Chip ── */
  .chip {
    display:inline-flex; align-items:center;
    font-family:'Chillax',sans-serif; font-size:9px; font-weight:400;
    padding:2px 8px; border-radius:5px; border:1px solid;
    white-space:nowrap; max-width:140px; overflow:hidden; text-overflow:ellipsis;
  }

  /* ── Progress ── */
  .p-rail { height:3px; border-radius:100px; background:rgba(255,255,255,0.05); overflow:visible; position:relative; }
  .p-fill { height:100%; border-radius:100px; animation:bar-in 1s cubic-bezier(0.4,0,0.2,1) both; position:relative; }
  .p-fill::after { content:''; position:absolute; right:-3px; top:-3px; width:9px; height:9px; border-radius:50%; background:inherit; filter:blur(3px); }

  /* ── Stage dot ── */
  .s-dot {
    width:22px; height:22px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:8px; font-weight:700; flex-shrink:0;
    border:1.5px solid; position:relative;
    font-family:'Chillax',sans-serif; transition:all 0.3s;
  }

  /* ── Nav pill ── */
  .n-pill {
    display:inline-flex; align-items:center; gap:6px;
    padding:6px 14px; border-radius:100px;
    background:rgba(255,255,255,0.04); border:1px solid var(--rim2);
    font-size:11px; font-weight:600; color:var(--ink2);
    cursor:pointer; font-family:'Chillax',sans-serif; transition:all 0.18s;
  }
  .n-pill:hover { background:rgba(255,255,255,0.08); color:var(--ink); border-color:var(--rim3); }

  /* ── Activity row ── */
  .a-row { transition:background 0.15s; cursor:pointer; }
  .a-row:hover { background:rgba(99,102,241,0.04); }

  /* ── Goal option ── */
  .g-opt {
    width:100%; text-align:left; cursor:pointer;
    background:rgba(255,255,255,0.02); border:1px solid var(--rim);
    border-radius:var(--r); padding:11px 14px;
    display:flex; align-items:center; gap:11px;
    color:var(--ink2); font-family:'Chillax',sans-serif;
    transition:all 0.18s;
  }
  .g-opt:hover { border-color:rgba(99,102,241,0.3); background:rgba(99,102,241,0.06); color:var(--ink); }
  .g-opt.sel { background:rgba(99,102,241,0.1); border-color:rgba(99,102,241,0.42); color:var(--ink); box-shadow:0 0 20px rgba(99,102,241,0.08); }

  /* ── Legend step ── */
  .l-step {
    display:flex; align-items:flex-start; gap:12px;
    padding:14px 16px; border-radius:var(--r-lg);
    border:1px solid; position:relative; overflow:hidden;
    transition:transform 0.22s, box-shadow 0.22s;
  }
  .l-step:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
  .l-step::after { content:''; position:absolute; bottom:0; left:0; right:0; height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); }

  /* ── Scan overlay on hover ── */
  .scan-host { position:relative; overflow:hidden; }
  .scan-line-el {
    pointer-events:none; position:absolute; left:0; right:0; height:80px;
    background:linear-gradient(180deg, transparent, rgba(99,102,241,0.05), transparent);
    top:-80px; opacity:0; transition:opacity 0.2s;
    animation:scan 3.5s linear infinite; animation-play-state:paused;
    z-index:3;
  }
  .scan-host:hover .scan-line-el { opacity:1; animation-play-state:running; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.18); border-radius:2px; }

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
    <div style={{ display:"flex", alignItems:"flex-start", marginTop:16 }}>
      {PIPELINE_STEPS.map((step, i) => {
        const si   = stageIdx(step.key);
        const done = cur >= si;
        const isLast = i === PIPELINE_STEPS.length - 1;
        const t = stageTheme(done ? step.key : "initialized");
        return (
          <div key={step.key} style={{ display:"flex", alignItems:"center", flex:1, minWidth:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
              <div
                className="s-dot"
                style={{
                  background: done ? t.bg : "rgba(255,255,255,0.02)",
                  borderColor: done ? t.col : "rgba(255,255,255,0.07)",
                  color: done ? t.col : "var(--ink3)",
                  boxShadow: done ? `0 0 10px ${t.glow}` : "none",
                }}
              >{done ? "✓" : i+1}</div>
              <span style={{
                fontSize:8, marginTop:4, whiteSpace:"nowrap",
                fontFamily:"'Chillax',sans-serif", fontWeight:500, letterSpacing:"0.05em",
                color: done ? t.col : "var(--ink3)",
              }}>{step.short}</span>
            </div>
            {!isLast && (
              <div style={{
                height:1, flex:1, margin:"0 3px", marginBottom:16,
                background: done && cur > si
                  ? `linear-gradient(90deg, ${t.col}70, ${stageTheme(PIPELINE_STEPS[i+1].key).col}40)`
                  : "rgba(255,255,255,0.05)",
                transition:"background 0.5s",
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
    <div className={`s-card rise d${delay/70}`} style={{ animationDelay:`${delay}ms` }}>
      <div className="s-bg"/>
      {/* Glow orb */}
      <div style={{ position:"absolute", top:-24, right:-12, width:80, height:80, borderRadius:"50%", background:accent, filter:"blur(32px)", opacity:0.15, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg, ${accent}40, transparent)`, opacity:0.6 }}/>
      {/* Border */}
      <div className="s-border" style={{ background:`linear-gradient(135deg, ${accent}45, rgba(255,255,255,0.05), ${accent}25)` }}/>
      {/* Corner brackets */}
      <svg style={{ position:"absolute", top:0, left:0, width:36, height:36, opacity:0.45 }} viewBox="0 0 36 36">
        <path d="M2 18 L2 2 L18 2" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <svg style={{ position:"absolute", bottom:0, right:0, width:36, height:36, opacity:0.3 }} viewBox="0 0 36 36">
        <path d="M34 18 L34 34 L18 34" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>

      <div className="s-content" style={{ padding:"24px 26px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <p style={{ fontFamily:"'Chillax',sans-serif", fontSize:9, fontWeight:500, letterSpacing:"0.13em", textTransform:"uppercase", color:"var(--ink3)" }}>{label}</p>
          <div style={{
            width:36, height:36, borderRadius:11,
            background:`linear-gradient(135deg, ${accent}18, ${accent}07)`,
            border:`1px solid ${accent}30`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0,
          }}>{icon}</div>
        </div>
        <p style={{
          fontFamily:"'Chillax',sans-serif", fontSize:52, fontWeight:700,
          color:"var(--ink)", lineHeight:1, letterSpacing:"-0.04em",
          animation:"num-up 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
          animationDelay:`${delay+100}ms`,
        }}>{value}</p>
        {sub && <p style={{ fontFamily:"'Chillax',sans-serif", fontSize:10, color:"var(--ink3)", marginTop:10, letterSpacing:"0.04em" }}>{sub}</p>}
        {/* Bottom accent */}
        <div style={{ marginTop:20, height:2, borderRadius:100, background:`linear-gradient(90deg, ${accent}80, ${accent}25, transparent)`, width:"55%" }}/>
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

  return (
    <div className="a-card scan-host rise" style={{ animationDelay:`${animDelay}ms` }}>
      <div className="scan-line-el"/>
      <div className="a-inner">
        <div style={{ padding:"22px 22px 20px" }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:12, minWidth:0 }}>
              <div style={{
                width:42, height:42, flexShrink:0, borderRadius:13,
                background:`linear-gradient(135deg, ${t.bg}, rgba(255,255,255,0.02))`,
                border:`1px solid ${t.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, position:"relative",
                boxShadow: !finished && project.stage !== "initialized" ? `0 0 18px ${t.glow}` : "none",
              }}>
                {finished ? "✓" : "◈"}
                {/* Active pulse */}
                {!finished && project.stage !== "initialized" && (
                  <span style={{ position:"absolute", top:-2, right:-2, width:8, height:8, borderRadius:"50%", background:t.col }}>
                    <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:t.col, animation:"ping 1.8s ease infinite" }}/>
                  </span>
                )}
              </div>
              <div style={{ minWidth:0, paddingTop:2 }}>
                <h3 style={{
                  fontFamily:"'Chillax',sans-serif", fontSize:14, fontWeight:700,
                  color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis",
                  whiteSpace:"nowrap", lineHeight:1.3,
                }}>{project.name}</h3>
                {project.dataset?.filename && (
                  <p style={{
                    fontFamily:"'Chillax',sans-serif", fontSize:10,
                    color:"var(--ink3)", marginTop:3,
                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                  }}>{project.dataset.filename}</p>
                )}
              </div>
            </div>
            <span className="badge" style={{
              background:t.bg, color:t.col, borderColor:t.border,
              boxShadow:`0 0 14px ${t.glow}`, flexShrink:0,
            }}>{stageLabel(project.stage)}</span>
          </div>

          {/* Chips */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:16, minHeight:20 }}>
            {project.problemType && (
              <span className="chip" style={{ background:"rgba(255,255,255,0.03)", borderColor:"rgba(255,255,255,0.07)", color:"var(--ink2)", textTransform:"capitalize" }}>
                {project.problemType}
              </span>
            )}
            {project.targetColumn && (
              <span className="chip" style={{ background:"rgba(255,255,255,0.02)", borderColor:"rgba(255,255,255,0.05)", color:"var(--ink3)" }}>
                → {project.targetColumn}
              </span>
            )}
            {project.selectedModel && (
              <span className="chip" style={{ background:"rgba(99,102,241,0.08)", borderColor:"rgba(99,102,241,0.18)", color:"#818cf8" }}>
                {project.selectedModel}
              </span>
            )}
            <span style={{ marginLeft:"auto", fontFamily:"'Chillax',sans-serif", fontSize:9, color:"var(--ink3)", letterSpacing:"0.04em", alignSelf:"center" }}>
              {new Date(project.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
            </span>
          </div>

          {/* Progress */}
          <div style={{ marginBottom:4 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontFamily:"'Chillax',sans-serif", fontSize:9, color:"var(--ink3)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Pipeline</span>
              <span style={{ fontFamily:"'Chillax',sans-serif", fontSize:10, fontWeight:500, color: finished ? "#00ffa3" : "#818cf8" }}>{pct}%</span>
            </div>
            <div className="p-rail">
              <div className="p-fill" style={{
                width:`${pct}%`,
                background: finished
                  ? "linear-gradient(90deg, #00ffa3, #00d4ff)"
                  : "linear-gradient(90deg, #6366f1, #a78bfa)",
              }}/>
            </div>
          </div>

          <StageTracker stage={project.stage}/>

          {/* Divider */}
          <div style={{ height:1, background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)", margin:"16px 0" }}/>

          {/* Actions */}
          <div style={{ display:"flex", gap:8 }}>
            <button className="bp" onClick={onContinue} style={{ flex:1, padding:"9px 14px", fontSize:12, borderRadius:10 }}>
              {finished ? (
                <>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Open in Lab
                </>
              ) : (
                <>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Continue
                </>
              )}
            </button>
            <button className="bd" onClick={onDelete} disabled={deleting} style={{ width:38, height:38 }} title="Delete">
              {deleting
                ? <div style={{ width:13, height:13, border:"2px solid rgba(251,113,133,0.3)", borderTopColor:"#fb7185", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
                : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
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
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(2,4,11,0.88)", backdropFilter:"blur(18px)", padding:16, animation:"rise 0.22s ease" }}>
      <div className="a-card pop" style={{ width:"100%", maxWidth:390 }}>
        <div className="a-inner" style={{ padding:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22 }}>
            <div style={{ width:46, height:46, borderRadius:14, background:"rgba(251,113,133,0.1)", border:"1px solid rgba(251,113,133,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>🗑️</div>
            <div>
              <h3 style={{ fontFamily:"'Chillax',sans-serif", fontSize:17, fontWeight:700, color:"var(--ink)" }}>Delete Project</h3>
              <p style={{ fontFamily:"'Chillax',sans-serif", fontSize:9, color:"var(--ink3)", marginTop:3, letterSpacing:"0.08em" }}>IRREVERSIBLE — CANNOT BE UNDONE</p>
            </div>
          </div>
          <p style={{ fontFamily:"'Chillax',sans-serif", fontSize:13, color:"var(--ink2)", lineHeight:1.65, marginBottom:22 }}>
            Permanently delete <span style={{ fontWeight:700, color:"var(--ink)" }}>"{project.name}"</span> and all its data, models, and results.
          </p>
          <p style={{ fontFamily:"'Chillax',sans-serif", fontSize:11, color:"var(--ink2)", marginBottom:9, fontWeight:600 }}>
            Type <code style={{ fontFamily:"'Chillax',sans-serif", color:"#fb7185", background:"rgba(251,113,133,0.1)", border:"1px solid rgba(251,113,133,0.2)", padding:"2px 8px", borderRadius:5 }}>delete</code> to confirm
          </p>
          <input className="inp" type="text" value={input} onChange={e=>setInput(e.target.value)}
            placeholder="delete" autoFocus
            onKeyDown={e=>{if(e.key==="Enter"&&ok)onConfirm();if(e.key==="Escape")onCancel();}}
            style={{ padding:"11px 14px", fontSize:13, fontFamily:"'Chillax',sans-serif", marginBottom:22, ...(ok?{borderColor:"rgba(251,113,133,0.4)", boxShadow:"0 0 0 3px rgba(251,113,133,0.07)"}:{}) }}
          />
          <div style={{ display:"flex", gap:9 }}>
            <button className="bg" onClick={onCancel} style={{ flex:1, padding:"11px", fontSize:13 }}>Cancel</button>
            <button onClick={onConfirm} disabled={!ok} style={{
              flex:1, padding:"11px", fontSize:13, fontFamily:"'Chillax',sans-serif", fontWeight:700, borderRadius:12, cursor:ok?"pointer":"not-allowed", border:"none", transition:"all 0.2s",
              background:ok?"linear-gradient(135deg,#dc2626,#ef4444)":"rgba(255,255,255,0.04)",
              color:ok?"#fff":"var(--ink3)", boxShadow:ok?"0 4px 20px rgba(239,68,68,0.35)":"none",
            }}>Delete Forever</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NewProjectModal ───────────────────────────────────────────────────────────
const GOAL_OPTIONS = [
  { value:"auto",           icon:"⬡", label:"Auto-detect",        desc:"Let the AI figure out the best approach" },
  { value:"classification", icon:"◈", label:"Predict a category", desc:"Spam, churn, diagnosis, fraud…" },
  { value:"regression",     icon:"◬", label:"Predict a number",   desc:"Price, sales, temperature…" },
  { value:"clustering",     icon:"⬡", label:"Group similar items",desc:"Customer segments, topics…" },
  { value:"anomaly",        icon:"⚠", label:"Detect anomalies",   desc:"Fraud detection, equipment failure…" },
];

function NewProjectModal({ onStart, onCancel }: {
  onStart:(name:string,goal:string,targetCol:string)=>void; onCancel:()=>void;
}) {
  const [name, setName]     = useState("");
  const [goal, setGoal]     = useState("");
  const [target, setTarget] = useState("");
  const canStart = name.trim().length > 0 && goal !== "";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(2,4,11,0.9)", backdropFilter:"blur(20px)", padding:16, animation:"rise 0.22s ease" }}>
      <div className="a-card pop" style={{ width:"100%", maxWidth:460 }}>
        <div className="a-inner" style={{ maxHeight:"90vh", overflowY:"auto" }}>
          <div style={{ padding:"26px 26px 28px" }}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:26 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:46, height:46, borderRadius:14, background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0, boxShadow:"0 0 20px rgba(99,102,241,0.15)" }}>⬡</div>
                <div>
                  <h3 style={{ fontFamily:"'Chillax',sans-serif", fontSize:19, fontWeight:700, color:"var(--ink)" }}>New Project</h3>
                  <p style={{ fontFamily:"'Chillax',sans-serif", fontSize:9, color:"var(--ink3)", marginTop:3, letterSpacing:"0.1em" }}>CONFIGURE BEFORE UPLOADING DATA</p>
                </div>
              </div>
              <button className="bg" onClick={onCancel} style={{ width:32, height:32, padding:0, borderRadius:9, fontSize:18, flexShrink:0 }}>×</button>
            </div>

            {/* Name */}
            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontFamily:"'Chillax',sans-serif", fontSize:9, fontWeight:500, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:9 }}>
                Project Name <span style={{ color:"#fb7185" }}>*</span>
              </label>
              <input className="inp" type="text" value={name} onChange={e=>setName(e.target.value)}
                placeholder="e.g. Customer Churn Prediction" autoFocus
                onKeyDown={e=>{if(e.key==="Escape")onCancel();}}
                style={{ padding:"12px 15px", fontSize:14, fontFamily:"'Chillax',sans-serif" }}
              />
            </div>

            {/* Goal */}
            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontFamily:"'Chillax',sans-serif", fontSize:9, fontWeight:500, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:9 }}>
                Prediction Goal <span style={{ color:"#fb7185" }}>*</span>
              </label>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {GOAL_OPTIONS.map(opt=>(
                  <button key={opt.value} onClick={()=>setGoal(opt.value)} className={`g-opt${goal===opt.value?" sel":""}`}>
                    <span style={{ fontFamily:"'Chillax',sans-serif", fontSize:15, flexShrink:0, color:goal===opt.value?"#818cf8":"var(--ink3)" }}>{opt.icon}</span>
                    <span style={{ flex:1 }}>
                      <span style={{ display:"block", fontFamily:"'Chillax',sans-serif", fontSize:13, fontWeight:700 }}>{opt.label}</span>
                      <span style={{ display:"block", fontFamily:"'Chillax',sans-serif", fontSize:11, color:"var(--ink3)", marginTop:1 }}>{opt.desc}</span>
                    </span>
                    {goal===opt.value && (
                      <span style={{ width:18, height:18, borderRadius:"50%", background:"var(--indigo)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#fff", fontWeight:900, flexShrink:0 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontFamily:"'Chillax',sans-serif", fontSize:9, fontWeight:500, color:"var(--ink3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:9 }}>
                Target Column <span style={{ fontSize:9, color:"var(--ink3)", textTransform:"none", letterSpacing:"normal", fontWeight:400 }}>(optional)</span>
              </label>
              <input className="inp" type="text" value={target} onChange={e=>setTarget(e.target.value)}
                placeholder="e.g. Churn, Price — leave blank to auto-detect"
                style={{ padding:"12px 15px", fontSize:13, fontFamily:"'Chillax',sans-serif" }}
              />
            </div>

            {/* Validation */}
            {!canStart && (name.trim()||goal) && (
              <div style={{ display:"flex", alignItems:"center", gap:9, padding:"10px 13px", borderRadius:10, background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.18)", marginBottom:18 }}>
                <span style={{ fontSize:12 }}>◈</span>
                <p style={{ fontFamily:"'Chillax',sans-serif", fontSize:11, color:"#fbbf24", fontWeight:600 }}>
                  {!name.trim() ? "Project name is required." : "Select a prediction goal to continue."}
                </p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:9 }}>
              <button className="bg" onClick={onCancel} style={{ padding:"12px 18px", fontSize:13 }}>Cancel</button>
              <button className="bp" onClick={()=>onStart(name.trim(),goal,target.trim())} disabled={!canStart} style={{ flex:1, padding:"12px", fontSize:13 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

// ── Main Page ─────────────────────────────────────────────────────────────────
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
      setProjects(projRes.projects??[]);
      setStats(statsRes);
      setBackendOk(true);
    } catch {
      setBackendOk(false);
      loadFromLocalStorage();
    } finally { setLoading(false); }
  },[router]);

  function loadFromLocalStorage() {
    if(typeof window==="undefined") return;
    try {
      const raw = localStorage.getItem("userProjects");
      if(!raw) return;
      const saved = JSON.parse(raw) as Array<{id:string;name:string;dataset:string;status:string;createdDate:string;}>;
      const mapped:Project[] = saved.map(p=>({
        _id:p.id, sessionId:p.id, name:p.name,
        dataset:{filename:p.dataset},
        stage:p.status==="validated"?"eda_completed":"initialized",
        createdAt:p.createdDate, updatedAt:p.createdDate,
      }));
      setProjects(mapped);
      setStats({total:mapped.length,active:mapped.filter(p=>p.stage==="initialized").length,completed:mapped.filter(p=>p.stage==="eda_completed").length});
    } catch {}
  }

  useEffect(()=>{loadData();},[loadData]);

  useEffect(()=>{
    const h=(e:MouseEvent)=>{ if(!(e.target as HTMLElement).closest("#user-menu")) setDropOpen(false); };
    document.addEventListener("click",h);
    return ()=>document.removeEventListener("click",h);
  },[]);

  const handleLogout = async () => {
    const BASE = process.env.NEXT_PUBLIC_BACKEND_URL||"http://localhost:5000";
    try { await fetch(`${BASE}/api/auth/logout`,{method:"POST",credentials:"include"}); } catch {}
    localStorage.removeItem("userAvatar");
    window.location.href="/";
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
        const raw=localStorage.getItem("userProjects");
        if(raw) {
          const saved=JSON.parse(raw).filter((p:{id:string})=>p.id!==project._id);
          localStorage.setItem("userProjects",JSON.stringify(saved));
        }
      }
      setProjects(prev=>prev.filter(p=>p._id!==project._id));
      setStats(prev=>({...prev,total:prev.total-1}));
      toast("Project deleted");
    } catch { toast("Failed to delete project",false); }
    finally { setDeleting(null); }
  },[deleteTarget,backendOk,toast]);

  const handleNewProject = useCallback((name:string,goal:string,targetCol:string) => {
    setShowNewProj(false);
    localStorage.setItem("mlNewProject",JSON.stringify({name,goal,targetCol}));
    router.push("/lab");
  },[router]);

  const handleContinue = (project:Project) => {
    const ctx={
      sessionId:project.sessionId, name:project.name, stage:project.stage,
      filename:project.dataset?.filename, filePath:project.dataset?.filePath,
      targetColumn:project.targetColumn, problemType:project.problemType,
      selectedModel:project.selectedModel,
    };
    localStorage.setItem("mlContinueProject",JSON.stringify(ctx));
    router.push("/lab");
  };

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if(!user || loading) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--void)" }}>
        <style>{STYLES}</style>
        <div style={{ height:58, borderBottom:"1px solid var(--rim)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", background:"rgba(2,4,11,0.8)" }}>
          <div className="skel" style={{ width:130,height:28 }}/>
          <div style={{ display:"flex",gap:10 }}>
            <div className="skel" style={{ width:80,height:28,borderRadius:100 }}/>
            <div className="skel" style={{ width:34,height:34,borderRadius:"50%" }}/>
          </div>
        </div>
        <div style={{ maxWidth:1140,margin:"0 auto",padding:"48px 28px",display:"flex",flexDirection:"column",gap:36 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div><div className="skel" style={{ width:290,height:36,marginBottom:10 }}/><div className="skel" style={{ width:360,height:16 }}/></div>
            <div className="skel" style={{ width:148,height:46,borderRadius:16 }}/>
          </div>
          <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
            {[0,1,2].map(i=><div key={i} className="skel" style={{ height:148,borderRadius:26 }}/>)}
          </div>
          <div className="skel" style={{ height:130,borderRadius:20 }}/>
          <div className="proj-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            {[0,1,2,3].map(i=><div key={i} className="skel" style={{ height:260,borderRadius:26 }}/>)}
          </div>
        </div>
      </div>
    );
  }

  const recentProjects = [...projects].sort(
    (a,b)=>new Date(b.updatedAt).getTime()-new Date(a.updatedAt).getTime()
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--void)", color:"var(--ink)", fontFamily:"'Chillax',sans-serif" }}>
      <style>{STYLES}</style>

      {/* ── Deep-space background ── */}
      <div style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none" }}>
        <div style={{ position:"absolute",inset:0,background:"linear-gradient(158deg,#02040d 0%,#040814 45%,#020610 100%)" }}/>
        {/* Dot grid */}
        <div style={{
          position:"absolute",inset:0,opacity:0.028,
          backgroundImage:"radial-gradient(circle, rgba(99,102,241,0.9) 1px, transparent 1px)",
          backgroundSize:"40px 40px",
        }}/>
        {/* Ambient blobs */}
        <div style={{ position:"absolute",top:"5%",left:"25%",width:800,height:800,background:"radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 65%)",borderRadius:"50%",animation:"orb-float 22s ease infinite" }}/>
        <div style={{ position:"absolute",bottom:"10%",right:"10%",width:500,height:500,background:"radial-gradient(circle,rgba(167,139,250,0.04) 0%,transparent 65%)",borderRadius:"50%",animation:"orb-float 30s ease infinite reverse" }}/>
        <div style={{ position:"absolute",top:"45%",left:"5%",width:300,height:300,background:"radial-gradient(circle,rgba(0,255,163,0.025) 0%,transparent 65%)",borderRadius:"50%" }}/>
        {/* SVG noise */}
        <svg style={{ position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.016 }}>
          <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
          <rect width="100%" height="100%" filter="url(#n)"/>
        </svg>
      </div>

      {/* ── Toast ── */}
      {notice && (
        <div style={{
          position:"fixed",top:22,right:22,zIndex:9999,
          display:"flex",alignItems:"center",gap:10,
          padding:"12px 18px",borderRadius:14,
          border:`1px solid ${notice.ok?"rgba(0,255,163,0.22)":"rgba(251,113,133,0.22)"}`,
          background:notice.ok?"rgba(0,18,10,0.97)":"rgba(28,4,8,0.97)",
          color:notice.ok?"#00ffa3":"#fb7185",
          fontSize:13,fontWeight:600,fontFamily:"'Chillax',sans-serif",
          boxShadow:`0 16px 56px rgba(0,0,0,0.65),0 0 24px ${notice.ok?"rgba(0,255,163,0.07)":"rgba(251,113,133,0.07)"}`,
          backdropFilter:"blur(24px)",
          animation:"toast-in 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{
            width:22,height:22,borderRadius:"50%",flexShrink:0,
            background:notice.ok?"rgba(0,255,163,0.1)":"rgba(251,113,133,0.1)",
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,
          }}>{notice.ok?"✓":"✕"}</div>
          {notice.msg}
        </div>
      )}

      {/* ── Navbar ── */}
      <nav style={{
        position:"relative",zIndex:10,height:58,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        padding:"0 28px",
        borderBottom:"1px solid var(--rim)",
        background:"rgba(2,4,11,0.84)",backdropFilter:"blur(28px)",
      }}>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.18),rgba(167,139,250,0.12),transparent)" }}/>
        <Logo href="/home" size="md"/>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <button onClick={()=>router.push("/home")} className="n-pill">
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Home
          </button>

          <div id="user-menu" style={{ position:"relative" }}>
            <button
              onClick={()=>setDropOpen(o=>!o)}
              style={{
                display:"flex",alignItems:"center",gap:9,padding:"5px 10px 5px 6px",
                borderRadius:100,background:dropOpen?"rgba(255,255,255,0.06)":"transparent",
                border:`1px solid ${dropOpen?"var(--rim2)":"transparent"}`,
                cursor:"pointer",transition:"all 0.18s",
              }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(255,255,255,0.05)";(e.currentTarget as HTMLButtonElement).style.borderColor="var(--rim2)";}}
              onMouseLeave={e=>{if(!dropOpen){(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.borderColor="transparent";}}}
            >
              <div style={{ position:"relative" }}>
                <img
                  src={user.avatar||`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name||"U")}&background=312e81&color=c7d2fe&bold=true`}
                  alt="avatar"
                  style={{ width:30,height:30,borderRadius:"50%",border:"1.5px solid rgba(99,102,241,0.5)",display:"block" }}
                />
                <span style={{ position:"absolute",bottom:0,right:0,width:8,height:8,borderRadius:"50%",background:"#00ffa3",border:"1.5px solid var(--void)" }}/>
              </div>
              <span style={{ fontSize:13,color:"var(--ink)",fontWeight:600 }}>{user.name}</span>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="var(--ink3)" style={{ transform:dropOpen?"rotate(180deg)":"none",transition:"transform 0.22s" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {dropOpen && (
              <div className="glass rise" style={{
                position:"absolute",right:0,top:"calc(100% + 10px)",width:218,
                overflow:"hidden",zIndex:100,animationDuration:"0.2s",
                boxShadow:"0 24px 64px rgba(0,0,0,0.65),0 0 0 1px rgba(99,102,241,0.1)",
              }}>
                <div style={{ padding:"14px 16px",borderBottom:"1px solid var(--rim)" }}>
                  <p style={{ fontSize:13,fontWeight:700,color:"var(--ink)",fontFamily:"'Chillax',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.name}</p>
                  <p style={{ fontSize:10,color:"var(--ink3)",marginTop:2,fontFamily:"'Chillax',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user.email}</p>
                </div>
                {[
                  {label:"Profile",path:"/profile",d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",show:true},
                  {label:"Admin",path:"/admin",d:"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",show:user.role==="admin"},
                ].filter(i=>i.show).map(item=>(
                  <button key={item.path} onClick={()=>router.push(item.path)}
                    style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 16px",background:"transparent",border:"none",color:"var(--ink2)",fontSize:13,cursor:"pointer",fontFamily:"'Chillax',sans-serif",fontWeight:500,transition:"all 0.15s" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(99,102,241,0.07)";(e.currentTarget as HTMLButtonElement).style.color="var(--ink)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";(e.currentTarget as HTMLButtonElement).style.color="var(--ink2)";}}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={item.d}/></svg>
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop:"1px solid var(--rim)",paddingTop:3 }}>
                  <button onClick={handleLogout}
                    style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 16px",background:"transparent",border:"none",color:"#fb7185",fontSize:13,cursor:"pointer",fontFamily:"'Chillax',sans-serif",fontWeight:500,transition:"all 0.15s" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background="rgba(251,113,133,0.07)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background="transparent";}}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main style={{ position:"relative",zIndex:1,maxWidth:1140,margin:"0 auto",padding:"52px 28px 100px",display:"flex",flexDirection:"column",gap:44 }}>

        {/* ── Page header ── */}
        <div className="page-head rise d0" style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:20 }}>
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"#00ffa3",boxShadow:"0 0 10px rgba(0,255,163,0.7)",display:"inline-block",animation:"glow-beat 2.2s ease infinite" }}/>
              <span style={{ fontFamily:"'Chillax',sans-serif",fontSize:9,fontWeight:500,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--ink3)" }}>ML Dashboard · Live</span>
            </div>
            <h1 style={{ fontFamily:"'Chillax',sans-serif",fontSize:32,fontWeight:700,letterSpacing:"-0.04em",lineHeight:1.1,color:"var(--ink)" }}>
              Welcome back,{" "}
              <span style={{ background:"linear-gradient(115deg,#818cf8 0%,#a78bfa 45%,#22d3ee 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
                {user.name?.split(" ")[0]}
              </span>
            </h1>
            <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:13,color:"var(--ink3)",marginTop:9,fontWeight:400,lineHeight:1.65,maxWidth:440 }}>
              Your ML workspace — track every project from raw dataset to trained and evaluated model.
            </p>
          </div>
          <button className="bp" onClick={()=>setShowNewProj(true)} style={{ padding:"13px 26px",fontSize:13,flexShrink:0,borderRadius:16 }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
            New Project
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="stats-grid" style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          <StatCard label="Total Projects"  value={stats.total}     sub="all time"             icon="📁" accent="#6366f1" delay={0}   />
          <StatCard label="Active Projects"  value={stats.active}    sub="in progress"          icon="⚡" accent="#a78bfa" delay={80}  />
          <StatCard label="Trained Models"   value={stats.completed} sub="trained or evaluated" icon="🤖" accent="#00ffa3" delay={160} />
        </div>

        {/* ── Pipeline legend ── */}
        <div className="glass rise d2" style={{ padding:"26px 28px" }}>
          <div style={{ position:"absolute",top:0,left:50,right:50,height:1,background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.25),rgba(167,139,250,0.18),transparent)" }}/>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20 }}>
            <div style={{ width:3,height:18,borderRadius:2,background:"linear-gradient(180deg,var(--indigo),var(--violet))",flexShrink:0 }}/>
            <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:9,fontWeight:500,letterSpacing:"0.15em",textTransform:"uppercase",color:"var(--ink3)" }}>ML Pipeline Stages</p>
          </div>
          <div className="leg-grid" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
            {([
              { icon:"📂",label:"Upload Dataset",  desc:"CSV / Excel file loaded",           bg:"rgba(56,189,248,0.06)",  border:"rgba(56,189,248,0.14)",  ib:"rgba(56,189,248,0.22)", ic:"rgba(56,189,248,0.1)", tc:"#38bdf8",n:"01" },
              { icon:"🔍",label:"EDA & Analysis",  desc:"AI profiles data & selects models", bg:"rgba(99,102,241,0.06)",  border:"rgba(99,102,241,0.14)",  ib:"rgba(99,102,241,0.22)", ic:"rgba(99,102,241,0.1)", tc:"#818cf8",n:"02" },
              { icon:"🏗️",label:"Model Training",  desc:"Pipeline generated & executed",     bg:"rgba(167,139,250,0.06)", border:"rgba(167,139,250,0.14)", ib:"rgba(167,139,250,0.22)", ic:"rgba(167,139,250,0.1)", tc:"#a78bfa",n:"03" },
              { icon:"✅",label:"Evaluation",      desc:"Predictions tested & scored",       bg:"rgba(0,255,163,0.04)",   border:"rgba(0,255,163,0.12)",   ib:"rgba(0,255,163,0.2)",   ic:"rgba(0,255,163,0.07)", tc:"#00ffa3",n:"04" },
            ] as const).map((s,i)=>(
              <div key={s.label} className={`l-step rise d${i+2}`} style={{ background:s.bg,borderColor:s.border }}>
                <div style={{ width:38,height:38,borderRadius:11,flexShrink:0,fontSize:16,background:s.ic,border:`1px solid ${s.ib}`,display:"flex",alignItems:"center",justifyContent:"center" }}>{s.icon}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:12,fontWeight:700,color:"var(--ink)",marginBottom:3 }}>{s.label}</p>
                  <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:11,color:"var(--ink3)",lineHeight:1.4 }}>{s.desc}</p>
                </div>
                <span style={{ position:"absolute",top:11,right:13,fontFamily:"'Chillax',sans-serif",fontSize:11,fontWeight:500,color:s.tc,opacity:0.4 }}>{s.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Projects ── */}
        <section>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <h2 style={{ fontFamily:"'Chillax',sans-serif",fontSize:22,fontWeight:700,letterSpacing:"-0.025em",color:"var(--ink)" }}>Projects</h2>
              {recentProjects.length>0 && (
                <span style={{ fontFamily:"'Chillax',sans-serif",fontSize:10,fontWeight:500,padding:"2px 11px",borderRadius:100,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.22)",color:"#818cf8",letterSpacing:"0.05em" }}>
                  {recentProjects.length}
                </span>
              )}
            </div>
            {!backendOk && (
              <span style={{ fontFamily:"'Chillax',sans-serif",fontSize:9,letterSpacing:"0.07em",padding:"4px 12px",borderRadius:100,background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",color:"#fbbf24" }}>
                ⚠ LOCAL ONLY
              </span>
            )}
          </div>

          {recentProjects.length===0 ? (
            <div style={{ border:"1px dashed rgba(99,102,241,0.14)",borderRadius:24,background:"rgba(99,102,241,0.02)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"90px 24px",gap:22 }}>
              <div style={{ width:72,height:72,borderRadius:22,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,position:"relative" }}>
                ⬡
                <div style={{ position:"absolute",inset:-1,borderRadius:22,border:"1px solid rgba(99,102,241,0.15)",animation:"ping 2.5s ease infinite" }}/>
              </div>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:18,fontWeight:700,color:"var(--ink)",marginBottom:8 }}>No projects yet</p>
                <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:13,color:"var(--ink3)",lineHeight:1.7,maxWidth:340 }}>
                  Launch a new ML project — upload a dataset and let the AI agent design, train, and evaluate your model end-to-end.
                </p>
              </div>
              <button className="bp" onClick={()=>setShowNewProj(true)} style={{ padding:"12px 30px",fontSize:13,borderRadius:14 }}>
                + New Project
              </button>
            </div>
          ) : (
            <div className="proj-grid" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
              {recentProjects.map((project,i)=>(
                <ProjectCard
                  key={project._id} project={project}
                  deleting={deleting===project._id}
                  onContinue={()=>handleContinue(project)}
                  onDelete={()=>handleDelete(project)}
                  animDelay={i*60}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Recent Activity ── */}
        {recentProjects.length>0 && (
          <section className="rise d5">
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:22 }}>
              <div style={{ width:3,height:18,borderRadius:2,background:"linear-gradient(180deg,#22d3ee,#818cf8)",flexShrink:0 }}/>
              <h2 style={{ fontFamily:"'Chillax',sans-serif",fontSize:22,fontWeight:700,letterSpacing:"-0.025em",color:"var(--ink)" }}>Recent Activity</h2>
            </div>
            <div className="glass" style={{ overflow:"hidden" }}>
              <div style={{ position:"absolute",top:0,left:50,right:50,height:1,background:"linear-gradient(90deg,transparent,rgba(34,211,238,0.2),transparent)" }}/>
              {recentProjects.slice(0,6).map((project,i)=>{
                const t = stageTheme(project.stage);
                return (
                  <div key={project._id} className="a-row" onClick={()=>handleContinue(project)} style={{
                    display:"flex",alignItems:"center",gap:14,padding:"14px 22px",
                    borderBottom:i<Math.min(recentProjects.length,6)-1?"1px solid var(--rim)":"none",
                  }}>
                    <div style={{
                      width:36,height:36,borderRadius:10,flexShrink:0,
                      background:t.bg,border:`1px solid ${t.border}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:13,color:t.col,fontFamily:"'Chillax',sans-serif",
                      boxShadow:`0 0 12px ${t.glow}`,
                    }}>
                      {project.stage==="evaluated"||project.stage==="completed"?"✓"
                        :project.stage==="trained"?"◈"
                        :project.stage==="eda_completed"?"◬"
                        :project.stage==="dataset_uploaded"?"▣":"○"}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:13,fontWeight:600,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{project.name}</p>
                      <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:10,color:"var(--ink3)",marginTop:2,letterSpacing:"0.03em" }}>
                        {stageLabel(project.stage)}
                        {project.dataset?.filename&&<span style={{ color:"rgba(255,255,255,0.11)" }}> · {project.dataset.filename}</span>}
                      </p>
                    </div>
                    <div style={{ textAlign:"right",flexShrink:0 }}>
                      <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:10,color:"var(--ink3)",letterSpacing:"0.03em" }}>
                        {new Date(project.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                      </p>
                      {project.selectedModel&&(
                        <p style={{ fontFamily:"'Chillax',sans-serif",fontSize:9,color:"#818cf8",marginTop:3 }}>{project.selectedModel}</p>
                      )}
                    </div>
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="var(--ink3)">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {deleteTarget && <DeleteConfirmModal project={deleteTarget} onConfirm={executeDelete} onCancel={()=>setDeleteTarget(null)}/>}
      {showNewProj  && <NewProjectModal onStart={handleNewProject} onCancel={()=>setShowNewProj(false)}/>}
    </div>
  );
}