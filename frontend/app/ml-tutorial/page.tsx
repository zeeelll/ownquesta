"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg0:#05080f;--bg1:#080d1a;--bg2:#0b1120;--bg3:#0f1626;--bg4:#121b2e;
    --rim0:rgba(255,255,255,0.03);--rim1:rgba(255,255,255,0.06);--rim2:rgba(255,255,255,0.10);--rim3:rgba(255,255,255,0.14);
    --txt0:#eef2f8;--txt1:#8fa3bc;--txt2:#3f5370;--txt3:#1e2f45;
    --blue:#60a5fa;--purple:#a78bfa;--pink:#f472b6;--green:#34d399;--amber:#fbbf24;--red:#f87171;--teal:#2dd4bf;
    --ind:#6366f1;--ind-l:#818cf8;
    --fd:'Bricolage Grotesque',sans-serif;--fb:'Plus Jakarta Sans',sans-serif;--fm:'JetBrains Mono',monospace;
    --r-sm:8px;--r-md:12px;--r-lg:16px;--r-xl:20px;--r-2xl:28px;
  }
  html{scroll-behavior:smooth}
  @keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse-dot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(0.85);opacity:0.6}}
  @keyframes drift{0%,100%{transform:translate(0,0)}40%{transform:translate(18px,-12px)}70%{transform:translate(-10px,8px)}}
  @keyframes bounce-x{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  @keyframes fill-bar{from{width:0}to{width:var(--w)}}
  @keyframes pop{0%{transform:scale(0.6);opacity:0}70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes node-pulse{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0)}50%{box-shadow:0 0 0 6px rgba(99,102,241,0.2)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes slide-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  .rise{animation:rise 0.55s cubic-bezier(0.22,1,0.36,1) both}
  .pop{animation:pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both}
  .d0{animation-delay:0ms}.d1{animation-delay:70ms}.d2{animation-delay:140ms}
  .d3{animation-delay:210ms}.d4{animation-delay:280ms}.d5{animation-delay:350ms}
  .d6{animation-delay:420ms}.d7{animation-delay:490ms}.d8{animation-delay:560ms}

  /* Nav */
  .nav-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:100px;
    background:rgba(255,255,255,0.04);border:1px solid var(--rim1);font-size:11px;font-weight:600;
    color:var(--txt1);cursor:pointer;font-family:var(--fb);transition:all 0.18s;letter-spacing:-0.01em}
  .nav-pill:hover{background:rgba(255,255,255,0.08);color:var(--txt0);border-color:var(--rim2)}

  /* Section cards */
  .sec-card{position:relative;border-radius:var(--r-xl);overflow:hidden;cursor:pointer;
    background:linear-gradient(145deg,var(--bg3),var(--bg2));border:1px solid var(--rim1);
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1),box-shadow 0.3s,border-color 0.3s}
  .sec-card:hover{transform:translateY(-6px) scale(1.015);box-shadow:0 28px 60px rgba(0,0,0,0.5)}
  .sec-card:hover .sec-arrow{transform:translateX(5px)}
  .sec-arrow{transition:transform 0.22s}

  /* Accordion */
  .acc-item{border:1px solid var(--rim1);border-radius:var(--r-lg);margin-bottom:10px;overflow:hidden;transition:border-color 0.25s}
  .acc-item:hover{border-color:var(--rim2)}
  .acc-item.open{border-color:rgba(99,102,241,0.3)}
  .acc-head{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;background:rgba(255,255,255,0.02);transition:background 0.2s;gap:12px}
  .acc-head:hover{background:rgba(255,255,255,0.04)}
  .acc-body{padding:0 20px;max-height:0;overflow:hidden;transition:max-height 0.45s cubic-bezier(0.4,0,0.2,1),padding 0.3s}
  .acc-body.open{max-height:6000px;padding:0 20px 24px}

  /* Simple word box */
  .word-box{display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:6px;
    background:rgba(99,102,241,0.12);border:1px solid rgba(99,102,241,0.25);
    font-size:11px;font-weight:700;color:var(--ind-l);font-family:var(--fm);cursor:help;
    position:relative;vertical-align:middle}

  /* Callout */
  .callout{padding:14px 16px;border-radius:var(--r-lg);margin:14px 0;border-left:3px solid}
  .callout-blue{background:rgba(96,165,250,0.07);border-color:#60a5fa}
  .callout-green{background:rgba(52,211,153,0.07);border-color:#34d399}
  .callout-amber{background:rgba(251,191,36,0.07);border-color:#fbbf24}
  .callout-red{background:rgba(248,113,113,0.07);border-color:#f87171}
  .callout-purple{background:rgba(167,139,250,0.07);border-color:#a78bfa}

  /* Math box */
  .math-box{background:rgba(0,0,0,0.3);border:1px solid var(--rim2);border-radius:var(--r-md);
    padding:16px 20px;font-family:var(--fm);font-size:13px;color:var(--txt0);margin:14px 0;overflow-x:auto;line-height:2}

  /* Tag */
  .tag{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:100px;
    font-size:10px;font-weight:700;letter-spacing:0.04em;font-family:var(--fm)}

  /* Chart bar */
  .chart-bar{height:100%;border-radius:6px;animation:fill-bar 1s cubic-bezier(0.22,1,0.36,1) both}

  /* Scrollbar */
  ::-webkit-scrollbar{width:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.18);border-radius:4px}
  ::selection{background:rgba(99,102,241,0.25)}

  /* Quiz button */
  .quiz-btn{padding:9px 14px;border-radius:10px;cursor:pointer;font-family:var(--fb);font-size:12px;font-weight:600;
    border:1px solid var(--rim2);background:rgba(255,255,255,0.04);color:var(--txt1);
    transition:all 0.18s;text-align:left;width:100%}
  .quiz-btn:hover{background:rgba(255,255,255,0.08);color:var(--txt0)}
  .quiz-btn.correct{background:rgba(52,211,153,0.12);border-color:#34d39950;color:#34d399}
  .quiz-btn.wrong{background:rgba(248,113,113,0.12);border-color:#f8717150;color:#f87171}

  @media(max-width:780px){.sec-grid{grid-template-columns:1fr !important}.flex-wrap-mobile{flex-wrap:wrap !important}}
`;

// ─── DIAGRAMS ──────────────────────────────────────────────────────────────

function BrainLearningDiagram() {
  const [step, setStep] = useState(0);
  const steps = [
    { emoji:"📸", title:"You show examples", desc:'Like showing 100 photos of cats and saying "this is a cat"', color:"#60a5fa" },
    { emoji:"🔍", title:"Computer finds patterns", desc:"It notices: pointy ears, fur, whiskers — those mean CAT!", color:"#a78bfa" },
    { emoji:"🧠", title:"It remembers the rules", desc:"It stores these patterns inside (called a model)", color:"#f472b6" },
    { emoji:"✅", title:"It predicts new ones", desc:'Show it a new photo → it says "CAT!" on its own', color:"#34d399" },
  ];
  useEffect(() => { const t = setInterval(() => setStep(s => (s+1)%4), 2200); return () => clearInterval(t); }, []);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.08em",textTransform:"uppercase"}}>How a computer learns — auto-playing</p>
      <div style={{display:"flex",gap:6,alignItems:"stretch"}}>
        {steps.map((s,i) => (
          <div key={i} style={{flex:1,padding:"14px 10px",borderRadius:14,border:`1px solid ${i===step?s.color+"50":"var(--rim1)"}`,
            background:i===step?`${s.color}12`:"rgba(255,255,255,0.02)",transition:"all 0.4s",
            display:"flex",flexDirection:"column",alignItems:"center",gap:8,textAlign:"center",
            transform:i===step?"scale(1.04)":"scale(1)"}}>
            <div style={{fontSize:i===step?32:22,transition:"font-size 0.3s"}}>{s.emoji}</div>
            <div style={{fontSize:10,fontWeight:700,color:i===step?s.color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.3}}>{s.title}</div>
            {i===step&&<div style={{fontSize:9,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.5,animation:"fadeIn 0.3s ease"}}>{s.desc}</div>}
            <div style={{width:6,height:6,borderRadius:"50%",background:i===step?s.color:"var(--txt3)",transition:"all 0.3s",boxShadow:i===step?`0 0 8px ${s.color}`:undefined}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrainTestDiagram() {
  const [hovered, setHovered] = useState<string|null>(null);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Your data gets split into parts</p>
      <div style={{display:"flex",gap:4,height:44,borderRadius:10,overflow:"hidden",width:"100%"}}>
        {[{key:"train",w:"70%",label:"TRAINING  70%",bg:"linear-gradient(90deg,#6366f180,#6366f1)",tip:"Model studies this like a textbook"},
          {key:"val",w:"15%",label:"CHECK  15%",bg:"linear-gradient(90deg,#f59e0b80,#f59e0b)",tip:"Like practice test questions"},
          {key:"test",w:"15%",label:"TEST  15%",bg:"linear-gradient(90deg,#34d39980,#34d399)",tip:"The final exam — never peeked before"},
        ].map(p=>(
          <div key={p.key} onMouseEnter={()=>setHovered(p.key)} onMouseLeave={()=>setHovered(null)}
            style={{width:p.w,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:9,fontWeight:800,color:"white",fontFamily:"var(--fm)",cursor:"pointer",
              transform:hovered===p.key?"scaleY(1.08)":"scaleY(1)",transition:"transform 0.2s",letterSpacing:"0.04em"}}>
            {p.label}
          </div>
        ))}
      </div>
      {hovered&&<div style={{padding:"10px 14px",borderRadius:10,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",fontSize:12,color:"var(--txt0)",fontFamily:"var(--fb)",animation:"slide-up 0.2s ease"}}>
        <strong>
          {hovered==="train"?"📚 Training Set: ":hovered==="val"?"🏋️ Validation Set: ":"🎯 Test Set: "}
        </strong>
        {hovered==="train"?"The model reads all these examples and learns from them — just like reading a textbook before an exam."
         :hovered==="val"?"We check how the model is doing. We can still improve it after seeing this."
         :"The FINAL test. The model has NEVER seen this data. This score is the real score!"}
      </div>}
      <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.6}}>
        💡 <strong style={{color:"var(--txt1)"}}>Hover each bar</strong> to understand what each part does.
        Never let the model see the test set early — that's like giving students the answers before the exam!
      </p>
    </div>
  );
}

function LinearRegressionDiagram() {
  const [showLine, setShowLine] = useState(false);
  const points = [{x:20,y:160},{x:40,y:140},{x:60,y:115},{x:80,y:100},{x:100,y:80},{x:120,y:65},{x:140,y:55},{x:160,y:40}];
  useEffect(()=>{const t=setTimeout(()=>setShowLine(true),600);return()=>clearTimeout(t)},[]);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Linear regression — finding the best line</p>
      <svg viewBox="0 0 200 180" style={{width:"100%",maxWidth:320,background:"rgba(0,0,0,0.2)",borderRadius:12,border:"1px solid var(--rim1)"}}>
        {/* Grid */}
        {[40,80,120,160].map(y=><line key={y} x1="18" y1={y} x2="190" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
        {[40,80,120,160].map(x=><line key={x} x1={x} y1="10" x2={x} y2="172" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
        {/* Axes */}
        <line x1="18" y1="10" x2="18" y2="172" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <line x1="18" y1="172" x2="190" y2="172" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
        <text x="100" y="177" fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="middle" fontFamily="'JetBrains Mono'">hours studied →</text>
        <text x="6" y="100" fill="rgba(255,255,255,0.3)" fontSize="7" textAnchor="middle" fontFamily="'JetBrains Mono'" transform="rotate(-90,6,100)">score →</text>
        {/* Best fit line */}
        {showLine&&<line x1="18" y1="168" x2="190" y2="32" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,3" opacity="0.8"
          style={{animation:"fadeIn 0.8s ease"}}/>}
        {/* Points */}
        {points.map((p,i)=>(
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#60a5fa" opacity="0.8" style={{animation:`pop 0.4s ${i*80}ms cubic-bezier(0.34,1.56,0.64,1) both`}}/>
            <circle cx={p.x} cy={p.y} r="3" fill="#bfdbfe"/>
          </g>
        ))}
        {showLine&&<>
          <circle cx={170} cy={42} r="7" fill="#f472b6" opacity="0.9" style={{animation:"pop 0.5s 0.9s both"}}/>
          <text x={175} y={38} fill="#f472b6" fontSize="7" fontFamily="'JetBrains Mono'">?</text>
          <line x1="170" y1="172" x2="170" y2="42" stroke="#f472b6" strokeWidth="1" strokeDasharray="3,2" opacity="0.5"/>
        </>}
        <text x="110" y="95" fill="#818cf8" fontSize="8" fontFamily="'JetBrains Mono'" transform="rotate(-35,110,95)">best fit line</text>
      </svg>
      <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7}}>
        <strong style={{color:"var(--txt0)"}}>What's happening:</strong> Each blue dot = one student (hours studied, exam score).
        The <span style={{color:"#818cf8"}}>purple dashed line</span> is what the computer draws through all dots to find the pattern.
        The <span style={{color:"#f472b6"}}>pink dot</span> = a new student we want to predict — we just look at where the line is!
      </div>
    </div>
  );
}

function NeuronDiagram() {
  const [fire, setFire] = useState(false);
  const inputs = [
    {label:"Is it raining?",val:1,x:10,y:40,color:"#60a5fa"},
    {label:"Is it cold?",val:0,x:10,y:90,color:"#a78bfa"},
    {label:"Is it dark?",val:1,x:10,y:140,color:"#f472b6"},
  ];
  const weights = [0.7,-0.2,0.9];
  const sum = inputs.reduce((a,inp,i)=>a+(inp.val*weights[i]),0);
  const output = sum > 0.5 ? 1 : 0;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.08em",textTransform:"uppercase"}}>How one neuron works</p>
      <svg viewBox="0 0 320 180" style={{width:"100%",background:"rgba(0,0,0,0.2)",borderRadius:12,border:"1px solid var(--rim1)"}}>
        {/* Inputs */}
        {inputs.map((inp,i)=>(
          <g key={i}>
            <rect x="5" y={inp.y-12} width="90" height="22" rx="6" fill={`${inp.color}18`} stroke={`${inp.color}35`} strokeWidth="1"/>
            <text x="50" y={inp.y+3} fill={inp.color} fontSize="7.5" textAnchor="middle" fontFamily="'Plus Jakarta Sans'">{inp.label}</text>
            <text x="99" y={inp.y+3} fill={inp.val?inp.color:"rgba(255,255,255,0.2)"} fontSize="9" fontFamily="'JetBrains Mono'" fontWeight="700">{inp.val}</text>
          </g>
        ))}
        {/* Lines with weights */}
        {inputs.map((inp,i)=>(
          <g key={i}>
            <line x1="100" y1={inp.y} x2="175" y2="90" stroke={fire?inp.color:"var(--txt3)"} strokeWidth={fire?"2":"1"} strokeDasharray={fire?"none":"3,2"} style={{transition:"all 0.4s"}}/>
            <rect x={fire?125:118} y={inp.y<90?inp.y:inp.y-14} width="26" height="14" rx="4" fill="rgba(0,0,0,0.5)" stroke="var(--rim2)" strokeWidth="1" style={{transition:"all 0.3s"}}/>
            <text x={fire?138:131} y={inp.y<90?inp.y+9:inp.y-5} fill={fire?inp.color:"var(--txt2)"} fontSize="7.5" textAnchor="middle" fontFamily="'JetBrains Mono'" style={{transition:"all 0.3s"}}>
              w={weights[i]}
            </text>
          </g>
        ))}
        {/* Neuron circle */}
        <circle cx="190" cy="90" r="32" fill={fire?"rgba(99,102,241,0.25)":"rgba(99,102,241,0.08)"} stroke={fire?"#6366f1":"rgba(99,102,241,0.3)"} strokeWidth="2" style={{transition:"all 0.4s"}}/>
        <text x="190" y="84" fill={fire?"#a5b4fc":"var(--txt1)"} fontSize="7.5" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" style={{transition:"color 0.3s"}}>Sum ×</text>
        <text x="190" y="95" fill={fire?"#a5b4fc":"var(--txt1)"} fontSize="7.5" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" style={{transition:"color 0.3s"}}>weights</text>
        <text x="190" y="107" fill={fire?"#818cf8":"var(--txt3)"} fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono'" fontWeight="700" style={{transition:"color 0.3s"}}>{sum.toFixed(1)}</text>
        {/* Output */}
        <line x1="222" y1="90" x2="275" y2="90" stroke={fire?"#34d399":"var(--txt3)"} strokeWidth={fire?"2.5":"1"} style={{transition:"all 0.4s"}}/>
        <rect x="276" y="72" width="38" height="36" rx="8" fill={fire?"rgba(52,211,153,0.15)":"rgba(255,255,255,0.04)"} stroke={fire?"#34d39960":"var(--rim1)"} strokeWidth="1.5" style={{transition:"all 0.4s"}}/>
        <text x="295" y="87" fill={fire?"#34d399":"var(--txt2)"} fontSize="8" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" style={{transition:"color 0.4s"}}>Take</text>
        <text x="295" y="97" fill={fire?"#34d399":"var(--txt2)"} fontSize="8" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" style={{transition:"color 0.4s"}}>umbrella?</text>
        <text x="295" y="109" fill={fire?"#34d399":"var(--txt3)"} fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono'" fontWeight="800" style={{transition:"color 0.4s"}}>{output?"YES":"NO"}</text>
      </svg>
      <button onClick={()=>setFire(f=>!f)} style={{
        padding:"9px 16px",borderRadius:10,cursor:"pointer",fontFamily:"var(--fb)",fontSize:12,fontWeight:700,
        background:fire?"rgba(52,211,153,0.15)":"rgba(99,102,241,0.12)",
        border:`1px solid ${fire?"#34d39950":"rgba(99,102,241,0.35)"}`,
        color:fire?"#34d399":"#a5b4fc",transition:"all 0.25s",width:"fit-content"
      }}>{fire?"🔥 Neuron is FIRING — it outputs YES":"⚡ Click to activate the neuron"}</button>
      <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.2)",border:"1px solid var(--rim1)",fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7}}>
        <strong style={{color:"var(--txt0)"}}>Think of it like a human brain cell:</strong> It gets signals from the world,
        each signal has a <em>weight</em> (how important it is), adds them all up, and decides: fire (yes) or don't fire (no).
        A neural network = millions of these connected together!
      </div>
    </div>
  );
}

function OverfitChart() {
  const [mode, setMode] = useState<"under"|"good"|"over">("good");
  const configs = {
    under:{label:"😟 Underfitting",color:"#f87171",trainScore:52,testScore:50,
      why:"The model is too simple. Like using one rule for everything — it misses real patterns.",
      fix:"Use a more complex model. Add more features."},
    good:{label:"😊 Just Right!",color:"#34d399",trainScore:91,testScore:87,
      why:"The model learned the real patterns and works on new data too. This is your goal!",
      fix:"Keep this! Tune a little more if needed."},
    over:{label:"😰 Overfitting",color:"#fbbf24",trainScore:99,testScore:58,
      why:"The model memorized all training data — including noise. Like memorizing answers without understanding.",
      fix:"Use less complex model. Add more data. Use dropout/regularization."},
  };
  const c = configs[mode];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {(["under","good","over"] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)} style={{
            padding:"6px 14px",borderRadius:100,cursor:"pointer",fontFamily:"var(--fm)",fontSize:10,fontWeight:700,
            background:mode===m?`${configs[m].color}18`:"rgba(255,255,255,0.03)",
            border:`1px solid ${mode===m?configs[m].color+"45":"var(--rim1)"}`,
            color:mode===m?configs[m].color:"var(--txt2)",transition:"all 0.18s",
          }}>{configs[m].label}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{label:"Training Score",val:c.trainScore,color:"#a5b4fc"},
          {label:"Test Score",val:c.testScore,color:c.color}].map(m=>(
          <div key={m.label} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)"}}>{m.label}</span>
              <span style={{fontSize:14,fontWeight:800,fontFamily:"var(--fm)",color:m.color}}>{m.val}%</span>
            </div>
            <div style={{height:8,background:"rgba(255,255,255,0.05)",borderRadius:100,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${m.val}%`,background:m.color,borderRadius:100,transition:"width 0.7s cubic-bezier(0.22,1,0.36,1)"}}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{padding:"12px 16px",borderRadius:12,background:`${c.color}10`,border:`1px solid ${c.color}30`}}>
        <div style={{fontFamily:"var(--fb)",fontSize:12,fontWeight:700,color:c.color,marginBottom:4}}>What's happening?</div>
        <div style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginBottom:8}}>{c.why}</div>
        <div style={{fontSize:11,color:"var(--txt0)",fontFamily:"var(--fb)",lineHeight:1.7}}>
          <strong>Fix: </strong>{c.fix}
        </div>
      </div>
    </div>
  );
}

function DecisionTreeDiagram() {
  const [path, setPath] = useState<string[]>([]);
  const [result, setResult] = useState<string|null>(null);

  const reset = () => { setPath([]); setResult(null); };
  const choose = (label:string, answer:string, next?:string) => {
    setPath(p=>[...p,`${label}: ${answer}`]);
    if(!next) setResult(answer === "Yes" ? "🏥 GO TO DOCTOR" : "😴 REST AT HOME");
    else if(next==="checkFever") {}
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Decision tree — should you see a doctor?</p>
      <svg viewBox="0 0 340 200" style={{width:"100%",background:"rgba(0,0,0,0.2)",borderRadius:12,border:"1px solid var(--rim1)"}}>
        {/* Lines */}
        <line x1="170" y1="42" x2="85" y2="82" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        <line x1="170" y1="42" x2="255" y2="82" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        <line x1="85" y1="106" x2="42" y2="146" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        <line x1="85" y1="106" x2="128" y2="146" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        <line x1="255" y1="106" x2="212" y2="146" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        <line x1="255" y1="106" x2="298" y2="146" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>
        {/* YES/NO labels on lines */}
        <text x="110" y="68" fill="#34d399" fontSize="8" fontFamily="'JetBrains Mono'" fontWeight="700">YES</text>
        <text x="220" y="68" fill="#f87171" fontSize="8" fontFamily="'JetBrains Mono'" fontWeight="700">NO</text>
        <text x="48" y="132" fill="#34d399" fontSize="7" fontFamily="'JetBrains Mono'" fontWeight="700">YES</text>
        <text x="105" y="132" fill="#f87171" fontSize="7" fontFamily="'JetBrains Mono'" fontWeight="700">NO</text>
        <text x="215" y="132" fill="#34d399" fontSize="7" fontFamily="'JetBrains Mono'" fontWeight="700">YES</text>
        <text x="272" y="132" fill="#f87171" fontSize="7" fontFamily="'JetBrains Mono'" fontWeight="700">NO</text>
        {/* Root */}
        <rect x="105" y="18" width="130" height="26" rx="8" fill="rgba(99,102,241,0.2)" stroke="#6366f180" strokeWidth="1.5"/>
        <text x="170" y="34" fill="#a5b4fc" fontSize="9" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" fontWeight="700">Do you have fever?</text>
        {/* Level 2 */}
        {[{x:18,y:82,label:"High fever?"},{x:190,y:82,label:"Body pain?"}].map((n,i)=>(
          <g key={i}><rect x={n.x} y={n.y} width="134" height="26" rx="8" fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.3)" strokeWidth="1"/>
          <text x={n.x+67} y={n.y+16} fill="#c4b5fd" fontSize="8.5" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" fontWeight="600">{n.label}</text></g>
        ))}
        {/* Leaves */}
        {[{x:4,y:146,label:"🏥 Doctor!",color:"#f87171"},
          {x:93,y:146,label:"💊 Medicine",color:"#fbbf24"},
          {x:178,y:146,label:"🏥 Doctor!",color:"#f87171"},
          {x:262,y:146,label:"😴 Rest",color:"#34d399"}].map((n,i)=>(
          <g key={i}><rect x={n.x} y={n.y} width="70" height="26" rx="8" fill={`${n.color}18`} stroke={`${n.color}40`} strokeWidth="1"/>
          <text x={n.x+35} y={n.y+16} fill={n.color} fontSize="8" textAnchor="middle" fontFamily="'Plus Jakarta Sans'" fontWeight="700">{n.label}</text></g>
        ))}
      </svg>
      <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.2)",border:"1px solid var(--rim1)",fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7}}>
        <strong style={{color:"var(--txt0)"}}>Decision Tree = asking YES/NO questions in order.</strong> The computer learns which questions to ask and in which order to best separate the data. Like a flowchart that the model builds automatically from examples!
      </div>
    </div>
  );
}

function GradientDescentAnim() {
  const [ball, setBall] = useState(10);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const timerRef = useRef<any>(null);

  const fn = (x:number) => 0.015*(x-50)*(x-50)+5;
  const points = Array.from({length:81},(_,i)=>({x:i*2+10,y:fn(i)}));
  const pathD = `M ${points.map(p=>`${p.x},${180-p.y*2}`).join(" L ")}`;
  const ballX = ball*2+10;
  const ballY = 180 - fn(ball)*2;

  const startDescent = () => {
    if(running) return;
    setBall(10); setSteps(0); setRunning(true);
    let pos=10, step=0;
    timerRef.current = setInterval(()=>{
      pos = pos + (50-pos)*0.12;
      step++;
      setBall(Math.round(pos*10)/10);
      setSteps(step);
      if(Math.abs(pos-50)<0.5){ clearInterval(timerRef.current); setRunning(false); setBall(50); }
    },120);
  };
  useEffect(()=>()=>clearInterval(timerRef.current),[]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Gradient descent — rolling to the bottom</p>
      <svg viewBox="0 0 180 100" style={{width:"100%",maxWidth:340,background:"rgba(0,0,0,0.2)",borderRadius:12,border:"1px solid var(--rim1)"}}>
        <defs><linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f87171" stopOpacity="0.6"/><stop offset="50%" stopColor="#34d399" stopOpacity="0.9"/><stop offset="100%" stopColor="#f87171" stopOpacity="0.6"/></linearGradient></defs>
        <path d={pathD} fill="none" stroke="url(#curveGrad)" strokeWidth="2.5"/>
        {/* Bottom label */}
        <text x="170" y="97" fill="rgba(255,255,255,0.15)" fontSize="6" textAnchor="middle" fontFamily="'JetBrains Mono'">← error →</text>
        {/* Minimum marker */}
        <line x1="110" y1="15" x2="110" y2="85" stroke="#34d39940" strokeWidth="1" strokeDasharray="3,2"/>
        <text x="110" y="12" fill="#34d399" fontSize="6" textAnchor="middle" fontFamily="'JetBrains Mono'">minimum ✓</text>
        {/* Ball */}
        <circle cx={ballX} cy={ballY} r="5" fill="#6366f1" stroke="#a5b4fc" strokeWidth="1.5" style={{transition:"cx 0.12s,cy 0.12s",filter:running?"drop-shadow(0 0 4px #6366f1)":undefined}}/>
        <text x={ballX} y={ballY-8} fill="#a5b4fc" fontSize="7" textAnchor="middle" fontFamily="'JetBrains Mono'">⚽</text>
      </svg>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <button onClick={startDescent} disabled={running} style={{
          padding:"8px 16px",borderRadius:10,cursor:running?"not-allowed":"pointer",fontFamily:"var(--fb)",fontSize:12,fontWeight:700,
          background:running?"rgba(255,255,255,0.04)":"rgba(99,102,241,0.15)",
          border:`1px solid ${running?"var(--rim1)":"rgba(99,102,241,0.4)"}`,
          color:running?"var(--txt2)":"#a5b4fc",transition:"all 0.2s",
        }}>{running?"⚽ Rolling...":"⚽ Roll the ball down!"}</button>
        {steps>0&&<span style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)"}}>{steps} steps</span>}
      </div>
      <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.18)",border:"1px solid var(--rim1)",fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7}}>
        <strong style={{color:"var(--txt0)"}}>Imagine you're blindfolded on a hill.</strong> You can feel which direction is downhill with your foot, so you take a small step downhill. Keep doing that until you reach the bottom. That's gradient descent! The "hill" is the model's error — we want to get to the lowest error possible.
      </div>
    </div>
  );
}

function KMeansViz() {
  const [step, setStep] = useState(0);
  const maxSteps = 4;
  const colors = ["#60a5fa","#f472b6","#34d399"];
  const clusters = [
    {cx:55,cy:55,points:[{x:40,y:42},{x:55,y:35},{x:62,y:60},{x:45,y:65},{x:70,y:45}]},
    {cx:145,cy:55,points:[{x:130,y:40},{x:150,y:35},{x:160,y:55},{x:135,y:65},{x:155,y:68}]},
    {cx:100,cy:130,points:[{x:85,y:120},{x:100,y:110},{x:115,y:130},{x:90,y:140},{x:110,y:145}]},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.08em",textTransform:"uppercase"}}>K-Means clustering — grouping similar data</p>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setStep(s=>Math.max(0,s-1))} style={{width:28,height:28,borderRadius:8,border:"1px solid var(--rim2)",background:"rgba(255,255,255,0.04)",color:"var(--txt1)",cursor:"pointer",fontSize:13}}>←</button>
          <button onClick={()=>setStep(s=>Math.min(maxSteps,s+1))} style={{width:28,height:28,borderRadius:8,border:"1px solid var(--rim2)",background:"rgba(255,255,255,0.04)",color:"var(--txt1)",cursor:"pointer",fontSize:13}}>→</button>
        </div>
      </div>
      <svg viewBox="0 0 210 180" style={{width:"100%",maxWidth:320,background:"rgba(0,0,0,0.2)",borderRadius:12,border:"1px solid var(--rim1)"}}>
        {step>=1&&clusters.map((cl,ci)=>(
          <circle key={ci} cx={cl.cx} cy={cl.cy} r={step>=3?40:0} fill={`${colors[ci]}08`} stroke={`${colors[ci]}30`} strokeWidth="1" strokeDasharray="4,3" style={{transition:"r 0.5s"}}/>
        ))}
        {clusters.map((cl,ci)=>cl.points.map((p,pi)=>(
          <circle key={`${ci}-${pi}`} cx={p.x} cy={p.y} r="5" fill={step>=2?colors[ci]:"#94a3b8"} opacity="0.85"
            stroke="rgba(255,255,255,0.2)" strokeWidth="1" style={{transition:"fill 0.5s"}}/>
        )))}
        {step>=1&&clusters.map((cl,ci)=>(
          <g key={ci}>
            <circle cx={cl.cx} cy={cl.cy} r="8" fill={colors[ci]} opacity="0.9" stroke="white" strokeWidth="1.5"/>
            <text x={cl.cx} y={cl.cy+4} fill="white" fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono'" fontWeight="800">✕</text>
          </g>
        ))}
        {step===0&&<text x="105" y="95" fill="rgba(255,255,255,0.3)" fontSize="10" textAnchor="middle" fontFamily="'Plus Jakarta Sans'">Step → to begin</text>}
      </svg>
      <div style={{padding:"10px 14px",borderRadius:10,background:"rgba(0,0,0,0.18)",border:"1px solid var(--rim1)",fontSize:11,fontFamily:"var(--fb)",lineHeight:1.7}}>
        {[
          {color:"var(--txt1)",text:"These are raw data points — just scattered dots. No labels."},
          {color:"var(--txt0)",text:"Step 1: We place 3 center points (✕) randomly. These are our guesses."},
          {color:"var(--txt0)",text:"Step 2: Each dot is assigned to its nearest center — given a color."},
          {color:"var(--txt0)",text:"Step 3: Centers move to the middle of their group. Colors are final clusters!"},
          {color:"#34d399",text:"✅ Done! The model found 3 natural groups — no labels needed!"},
        ][step].text&&(
          <span style={{color:["var(--txt1)","var(--txt0)","var(--txt0)","var(--txt0)","#34d399"][step]}}>
            {["These are raw data points — just scattered dots. No labels.",
              "Step 1: We place 3 center points (✕) randomly. These are our guesses.",
              "Step 2: Each dot is assigned to its nearest center — given a color.",
              "Step 3: Centers move to the middle of their group. Colors are final clusters!",
              "✅ Done! The model found 3 natural groups — no labels needed!"][step]}
          </span>
        )}
      </div>
    </div>
  );
}

function ActivationFnDiagram() {
  const fns = {
    relu:{label:"ReLU",color:"#60a5fa",fn:(x:number)=>Math.max(0,x),desc:'If input < 0, output = 0. If input > 0, output = input. Like a "don\'t let bad signals through" gate.'},
    sigmoid:{label:"Sigmoid",color:"#f472b6",fn:(x:number)=>1/(1+Math.exp(-x)),desc:"Squishes any number into 0-1 range. Perfect for YES/NO output (probability)."},
    tanh:{label:"Tanh",color:"#34d399",fn:(x:number)=>Math.tanh(x),desc:"Like sigmoid but outputs -1 to 1. Used inside hidden layers of neural networks."},
  };
  const [active, setActive] = useState<keyof typeof fns>("relu");
  const af = fns[active];
  const xs = Array.from({length:81},(_,i)=>i/4-10);

  const toSVG = (x:number,y:number) => ({sx:x*8+100, sy:90-y*18});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",gap:8}}>
        {(Object.keys(fns) as Array<keyof typeof fns>).map(k=>(
          <button key={k} onClick={()=>setActive(k)} style={{
            padding:"5px 12px",borderRadius:100,cursor:"pointer",fontFamily:"var(--fm)",fontSize:10,fontWeight:700,
            background:active===k?`${fns[k].color}18`:"rgba(255,255,255,0.03)",
            border:`1px solid ${active===k?fns[k].color+"45":"var(--rim1)"}`,
            color:active===k?fns[k].color:"var(--txt2)",transition:"all 0.18s",
          }}>{fns[k].label}</button>
        ))}
      </div>
      <svg viewBox="0 0 200 120" style={{width:"100%",maxWidth:300,background:"rgba(0,0,0,0.2)",borderRadius:12,border:"1px solid var(--rim1)"}}>
        <line x1="10" y1="60" x2="190" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        <line x1="100" y1="5" x2="100" y2="115" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        {[-2,-1,1,2].map(v=>(
          <g key={v}>
            <text x={100+v*8*2} y="68" fill="rgba(255,255,255,0.2)" fontSize="6" textAnchor="middle" fontFamily="'JetBrains Mono'">{v*2.5}</text>
          </g>
        ))}
        <path d={`M ${xs.map(x=>{const p=toSVG(x,af.fn(x));return`${p.sx},${p.sy}`}).join(" L ")}`}
          fill="none" stroke={af.color} strokeWidth="2.5" strokeLinejoin="round"/>
      </svg>
      <div style={{padding:"10px 14px",borderRadius:10,background:`${af.color}10`,border:`1px solid ${af.color}30`,fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7}}>
        <strong style={{color:af.color}}>{af.label}: </strong>{af.desc}
      </div>
    </div>
  );
}

function PrecisionRecallDiagram() {
  const [focus, setFocus] = useState<"precision"|"recall"|null>(null);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.08em",textTransform:"uppercase"}}>Precision vs recall — the tradeoff</p>
      <svg viewBox="0 0 280 160" style={{width:"100%",background:"rgba(0,0,0,0.2)",borderRadius:12,border:"1px solid var(--rim1)"}}>
        {/* All items circle */}
        <ellipse cx="140" cy="80" rx="120" ry="68" fill="rgba(99,102,241,0.06)" stroke="rgba(99,102,241,0.2)" strokeWidth="1.5" strokeDasharray="5,3"/>
        <text x="240" y="18" fill="rgba(99,102,241,0.5)" fontSize="8" fontFamily="'Plus Jakarta Sans'">All items</text>
        {/* Actual positive region */}
        <ellipse cx="105" cy="80" rx="68" ry="50" fill="rgba(52,211,153,0.1)" stroke="#34d39940" strokeWidth="1.5"/>
        <text x="65" y="130" fill="#34d399" fontSize="8" fontFamily="'Plus Jakarta Sans'">Actual Positives</text>
        {/* Predicted positive region */}
        <ellipse cx="160" cy="80" rx="60" ry="44" fill={focus==="precision"?"rgba(96,165,250,0.2)":"rgba(96,165,250,0.08)"} stroke="#60a5fa40" strokeWidth="1.5"/>
        <text x="165" y="130" fill="#60a5fa" fontSize="8" fontFamily="'Plus Jakarta Sans'">Predicted +</text>
        {/* TP (intersection) */}
        <ellipse cx="130" cy="80" rx="30" ry="28" fill={focus?"rgba(248,191,36,0.25)":"rgba(248,191,36,0.15)"} stroke="#fbbf2460" strokeWidth="1.5"/>
        <text x="130" y="77" fill="#fbbf24" fontSize="9" textAnchor="middle" fontFamily="'JetBrains Mono'" fontWeight="800">TP</text>
        <text x="130" y="88" fill="#fbbf24" fontSize="7" textAnchor="middle" fontFamily="'Plus Jakarta Sans'">correct!</text>
        {/* FN */}
        <text x="78" y="78" fill="#f87171" fontSize="8" textAnchor="middle" fontFamily="'JetBrains Mono'" fontWeight="700">FN</text>
        {/* FP */}
        <text x="183" y="78" fill="#a78bfa" fontSize="8" textAnchor="middle" fontFamily="'JetBrains Mono'" fontWeight="700">FP</text>
      </svg>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[
          {key:"precision",label:"🎯 Precision",color:"#60a5fa",formula:"TP ÷ (TP + FP)",plain:"Of all the things I called positive, how many WERE really positive?",eg:"Spam filter: don't flag good emails as spam"},
          {key:"recall",label:"🔍 Recall",color:"#34d399",formula:"TP ÷ (TP + FN)",plain:"Of all the real positives, how many did I FIND?",eg:"Cancer detector: don't miss actual cancer cases"},
        ].map(m=>(
          <div key={m.key} onMouseEnter={()=>setFocus(m.key as any)} onMouseLeave={()=>setFocus(null)}
            style={{padding:"12px 14px",borderRadius:12,background:`${m.color}0a`,border:`1px solid ${m.color}30`,cursor:"default",transition:"all 0.2s"}}>
            <div style={{fontFamily:"var(--fb)",fontSize:12,fontWeight:700,color:m.color,marginBottom:5}}>{m.label}</div>
            <code style={{fontSize:11,color:"#a5b4fc",fontFamily:"var(--fm)",display:"block",marginBottom:6}}>{m.formula}</code>
            <div style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:5}}>{m.plain}</div>
            <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.5,fontStyle:"italic"}}>{m.eg}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QUIZ COMPONENT ────────────────────────────────────────────────────────
function Quiz({q,options,correct}:{q:string;options:string[];correct:number}) {
  const [selected, setSelected] = useState<number|null>(null);
  return (
    <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid var(--rim2)",borderRadius:14,padding:"16px 18px",marginTop:16}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <span style={{fontSize:14}}>🧠</span>
        <span style={{fontFamily:"var(--fb)",fontSize:12,fontWeight:700,color:"#fbbf24"}}>Quick Check</span>
      </div>
      <p style={{fontFamily:"var(--fb)",fontSize:12,color:"var(--txt0)",marginBottom:10,lineHeight:1.6}}>{q}</p>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {options.map((o,i)=>(
          <button key={i} onClick={()=>selected===null&&setSelected(i)} className={`quiz-btn ${selected!==null?(i===correct?"correct":i===selected?"wrong":""):""}`}>
            {selected!==null?(i===correct?"✅ ":i===selected?"❌ ":""):"○ "}{o}
          </button>
        ))}
      </div>
      {selected!==null&&(
        <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:selected===correct?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)",fontSize:11,color:selected===correct?"#34d399":"#f87171",fontFamily:"var(--fb)"}}>
          {selected===correct?"🎉 Correct! Great job!":"💡 Not quite — the correct answer is: "+options[correct]}
        </div>
      )}
    </div>
  );
}

// ─── MATH EXPLAINER ───────────────────────────────────────────────────────
function MathExplainer({title,formula,parts}:{title:string;formula:string;parts:{symbol:string;means:string;color:string}[]}) {
  return (
    <div style={{background:"rgba(0,0,0,0.28)",border:"1px solid var(--rim2)",borderRadius:14,padding:"16px 18px",margin:"14px 0"}}>
      <div style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>{title}</div>
      <div style={{fontFamily:"var(--fm)",fontSize:15,color:"var(--txt0)",letterSpacing:"0.05em",marginBottom:14,padding:"8px 12px",background:"rgba(255,255,255,0.03)",borderRadius:8}}>{formula}</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {parts.map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
            <code style={{fontSize:12,fontFamily:"var(--fm)",color:p.color,minWidth:60,paddingTop:1}}>{p.symbol}</code>
            <span style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6}}>{p.means}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ANALOGY BOX ──────────────────────────────────────────────────────────
function AnalogyBox({icon,title,text}:{icon:string;title:string;text:string}) {
  return (
    <div style={{display:"flex",gap:12,padding:"12px 16px",borderRadius:12,background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",margin:"12px 0"}}>
      <span style={{fontSize:24,flexShrink:0}}>{icon}</span>
      <div>
        <div style={{fontFamily:"var(--fb)",fontSize:12,fontWeight:700,color:"#fbbf24",marginBottom:4}}>{title}</div>
        <div style={{fontFamily:"var(--fb)",fontSize:12,color:"var(--txt1)",lineHeight:1.7}}>{text}</div>
      </div>
    </div>
  );
}

const ICONS = {
  robot: "⦿",
  star: "★",
  check: "✓",
  cross: "✕",
  bulb: "✦",
  spark: "✨",
  focus: "⊕",
  model: "⊗",
  home: "⌂",
  chart: "▤",
  data: "⧉",
  data2: "▣",
  checkCircle: "☑",
  error: "⚠",
  success: "✔",
  train: "⟟",
  rate: "⎺",
  clock: "⌛",
  goal: "⟀",
  run: "⏩",
  survey: "☒",
  memory: "\u29b7",
};

// ─── ALL SECTIONS DATA ─────────────────────────────────────────────────────
const SECTIONS: MLSection[] = [
  {
    id:"introduction-ml", icon:ICONS.robot, title:"1. Introduction to Machine Learning", color:"#60a5fa",
    tagline:"The foundation and fundamentals",
    topics:[
      {
        title:"What is Machine Learning?",
        badge:`${ICONS.star} foundation`,
        badgeColor:"#60a5fa",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Machine Learning is a subset of Artificial Intelligence that enables computers to learn and make decisions from data <strong style={{color:"var(--txt0)"}}>without being explicitly programmed</strong> for every scenario.
            </p>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#6366f1",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Arthur Samuel (1959) — Pioneer Definition</div>
                <p style={{fontSize:13,color:"var(--txt0)",fontFamily:"var(--fb)",lineHeight:1.7,fontStyle:"italic",marginBottom:6}}>
                  "Machine Learning is the field of study that gives computers the ability to learn without being explicitly programmed."
                </p>
                <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.6}}>
                  Samuel created the first self-learning checkers program, demonstrating that computers could improve through experience.
                </p>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(244,114,182,0.08)",border:"1px solid rgba(244,114,182,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f472b6",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Tom Mitchell (1997) — Technical Definition</div>
                <p style={{fontSize:13,color:"var(--txt0)",fontFamily:"var(--fb)",lineHeight:1.7,fontStyle:"italic",marginBottom:6}}>
                  "A computer program is said to learn from experience E with respect to some class of tasks T and performance measure P, if its performance at tasks in T, as measured by P, improves with experience E."
                </p>
                <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.6}}>
                  This formal definition emphasizes measurable improvement through experience — the core of all ML.
                </p>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#34d399",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Modern Understanding</div>
                <p style={{fontSize:13,color:"var(--txt0)",fontFamily:"var(--fb)",lineHeight:1.7,marginBottom:6}}>
                  Machine Learning is the science of getting computers to act without being explicitly programmed by teaching them to recognize patterns in data and make predictions or decisions.
                </p>
                <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.6}}>
                  Today, ML encompasses algorithms that can learn from and make predictions on data, continuously improving their performance.
                </p>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[
                {icon:ICONS.data, title:"Data-Driven", desc:"Learns from examples rather than rules"},
                {icon:ICONS.check, title:"Adaptive", desc:"Improves performance over time"},
                {icon:ICONS.focus, title:"Pattern Recognition", desc:"Finds hidden relationships in data"},
                {icon:ICONS.model, title:"Predictive", desc:"Makes informed predictions/decisions"},
                {icon:ICONS.bulb, title:"Automated", desc:"Reduces need for manual programming"},
                {icon:ICONS.run, title:"Scalable", desc:"Handles large, complex datasets"}
              ].map((item,i)=>(
                <div key={i} style={{padding:"12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)",textAlign:"center"}}>
                  <div style={{fontSize:16,marginBottom:6}}>{item.icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:4}}>{item.title}</div>
                  <div style={{fontSize:10,color:"var(--txt2)",lineHeight:1.4}}>{item.desc}</div>
                </div>
              ))}
            </div>

            <AnalogyBox icon={ICONS.robot} title="Teaching a Child vs Programming a Computer" text="Traditional programming: You write exact instructions like 'if rain > 0, take umbrella'. Machine Learning: You show thousands of weather examples, and the computer learns when to take an umbrella by finding patterns in the data."/>

            <Quiz q="What is the key difference between traditional programming and machine learning?" options={["ML uses more memory","ML learns patterns from data instead of following explicit rules","ML is slower","ML requires more code"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"Types of Machine Learning",
        badge:`${ICONS.chart} classifications`,
        badgeColor:"#f472b6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Machine Learning is broadly classified into three main types based on how the algorithm learns and what kind of data it uses.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
              {[
                {
                  type:"Supervised Learning",
                  icon:ICONS.goal,
                  color:"#6366f1",
                  description:"Learning with labeled data — the algorithm learns from examples where both input and correct output are provided.",
                  examples:["Email spam detection","House price prediction","Medical diagnosis"],
                  analogy:"Learning with a teacher who provides correct answers",
                  when:"When you have historical data with known outcomes"
                },
                {
                  type:"Unsupervised Learning",
                  icon:ICONS.focus,
                  color:"#34d399",
                  description:"Learning without labeled data — the algorithm finds hidden patterns and structures in data on its own.",
                  examples:["Customer segmentation","Anomaly detection","Topic modeling"],
                  analogy:"Exploring a new city without a map, finding patterns yourself",
                  when:"When you want to discover hidden structures in data"
                },
                {
                  type:"Reinforcement Learning",
                  icon:ICONS.run,
                  color:"#f59e0b",
                  description:"Learning through trial and error — the algorithm learns by interacting with an environment and receiving rewards/penalties.",
                  examples:["Game playing (Chess, Go)","Robot navigation","Recommendation systems"],
                  analogy:"Training a dog with treats and corrections",
                  when:"When you need sequential decision-making in dynamic environments"
                }
              ].map((ml_type,i)=>(
                <div key={i} style={{padding:"20px",borderRadius:14,background:`${ml_type.color}08`,border:`1px solid ${ml_type.color}25`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                    <span style={{fontSize:24}}>{ml_type.icon}</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:ml_type.color,fontFamily:"var(--fd)"}}>{ml_type.type}</div>
                      <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)",marginTop:2}}>Use when: {ml_type.when}</div>
                    </div>
                  </div>

                  <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:12}}>{ml_type.description}</p>

                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Examples</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {ml_type.examples.map((ex,j)=>(
                        <span key={j} style={{fontSize:9,color:ml_type.color,fontFamily:"var(--fm)",background:`${ml_type.color}15`,padding:"2px 6px",borderRadius:4}}>{ex}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{padding:"8px 10px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                    <span style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)"}}>🍬 Analogy: </span>
                    <span style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fb)"}}>{ml_type.analogy}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="callout callout-blue">
              <strong style={{fontSize:12,color:"#60a5fa"}}>Semi-Supervised & Self-Supervised Learning:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
                <strong>Semi-supervised:</strong> Mix of labeled and unlabeled data. Uses small labeled dataset to guide learning on large unlabeled dataset.<br/>
                <strong>Self-supervised:</strong> Creates its own labels from the data structure (e.g., predicting missing parts of images).
              </p>
            </div>

            <Quiz q="Which type of ML would you use to group customers by shopping behavior without knowing the groups in advance?" options={["Supervised Learning","Unsupervised Learning","Reinforcement Learning","Semi-supervised Learning"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"Why Machine Learning Matters",
        badge:`${ICONS.bulb} impact`,
        badgeColor:"#fbbf24",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Machine Learning is transforming industries and solving problems that were previously impossible or impractical to solve with traditional programming.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {
                  title:"Handles Complexity",
                  icon:ICONS.model,
                  desc:"Traditional programming requires explicit rules for every scenario. ML finds patterns in complex, high-dimensional data automatically.",
                  example:"Recognizing faces in photos — millions of possible variations vs. simple if-then rules"
                },
                {
                  title:"Scales with Data",
                  icon:ICONS.data,
                  desc:"Performance improves with more data. Traditional systems become more complex and error-prone as requirements grow.",
                  example:"Spam filters that learn from millions of emails vs. manually maintained rule lists"
                },
                {
                  title:"Adapts to Change",
                  icon:ICONS.check,
                  desc:"ML models can adapt to new patterns without reprogramming. Traditional systems require manual updates.",
                  example:"Fraud detection that learns new fraud patterns vs. static rule-based systems"
                },
                {
                  title:"Discovers Insights",
                  icon:ICONS.focus,
                  desc:"Finds hidden relationships and patterns humans might miss in large datasets.",
                  example:"Medical research discovering unexpected correlations between symptoms and diseases"
                },
                {
                  title:"Automates Decisions",
                  icon:ICONS.run,
                  desc:"Makes consistent, data-driven decisions at scale, reducing human error and bias.",
                  example:"Credit scoring that evaluates thousands of applications consistently"
                },
                {
                  title:"Personalizes Experience",
                  icon:ICONS.star,
                  desc:"Learns individual preferences to provide personalized recommendations and experiences.",
                  example:"Streaming services learning your taste to recommend perfect movies"
                }
              ].map((benefit,i)=>(
                <div key={i} style={{padding:"14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:16}}>{benefit.icon}</span>
                    <span style={{fontSize:12,fontWeight:700,color:"var(--txt0)",fontFamily:"var(--fb)"}}>{benefit.title}</span>
                  </div>
                  <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:8}}>{benefit.desc}</p>
                  <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)",fontStyle:"italic"}}>{benefit.example}</div>
                </div>
              ))}
            </div>

            <div className="callout callout-green">
              <strong style={{fontSize:12,color:"#34d399"}}>Real-World Impact:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
                ML powers self-driving cars, medical diagnosis, financial trading, content recommendation, language translation, and countless other applications that improve our daily lives and drive economic growth.
              </p>
            </div>
          </div>
        ),
      }
    ],
  },
      {
        title:"Machine Learning in Simple Words",
        badge:`${ICONS.star} start here`,
        badgeColor:"#60a5fa",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Normally, when you write a computer program, you tell the computer <strong style={{color:"var(--txt0)"}}>exactly what to do</strong>, step by step. Like: <em>"If rain → open umbrella."</em>
            </p>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              <strong style={{color:"var(--txt0)"}}>Machine Learning is different.</strong> Instead of telling the computer the rules, you show it <em>thousands of examples</em>, and it <strong style={{color:"#60a5fa"}}>figures out the rules by itself!</strong>
            </p>
            <AnalogyBox icon={ICONS.robot} title="Think of it like teaching a baby" text='You do not teach a baby grammar rules. You just say "ball" 500 times, and they learn what "ball" means. Machine learning works the same way — lots of examples → the computer learns the pattern.'/>
            <BrainLearningDiagram/>
            <Quiz q="In Machine Learning, how does a computer learn?" options={["You write all the rules manually","You show it examples and it finds patterns","You program every possible answer","You connect it to the internet"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"What is Machine Learning? — Complete Definitions",
        badge:`${ICONS.bulb} definitions`,
        badgeColor:"#f472b6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Machine Learning has been defined in many ways by different experts. Here are the most important definitions that capture its essence:
            </p>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#6366f1",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Arthur Samuel (1959) — Pioneer Definition</div>
                <p style={{fontSize:13,color:"var(--txt0)",fontFamily:"var(--fb)",lineHeight:1.7,fontStyle:"italic",marginBottom:6}}>
                  "Machine Learning is the field of study that gives computers the ability to learn without being explicitly programmed."
                </p>
                <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.6}}>
                  This was the first formal definition. Samuel created the first self-learning checkers program in 1959.
                </p>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(244,114,182,0.08)",border:"1px solid rgba(244,114,182,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f472b6",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Tom Mitchell (1997) — Technical Definition</div>
                <p style={{fontSize:13,color:"var(--txt0)",fontFamily:"var(--fb)",lineHeight:1.7,fontStyle:"italic",marginBottom:6}}>
                  "A computer program is said to learn from experience E with respect to some class of tasks T and performance measure P, if its performance at tasks in T, as measured by P, improves with experience E."
                </p>
                <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.6}}>
                  This is the most widely accepted technical definition. It emphasizes measurable improvement through experience.
                </p>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#34d399",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Andrew Ng — Practical Definition</div>
                <p style={{fontSize:13,color:"var(--txt0)",fontFamily:"var(--fb)",lineHeight:1.7,fontStyle:"italic",marginBottom:6}}>
                  "Machine Learning is the science of getting computers to act without being explicitly programmed."
                </p>
                <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.6}}>
                  Stanford professor and Coursera founder. Focuses on the practical outcome: computers acting intelligently without explicit programming.
                </p>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#fbbf24",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Ian Goodfellow — Deep Learning Perspective</div>
                <p style={{fontSize:13,color:"var(--txt0)",fontFamily:"var(--fb)",lineHeight:1.7,fontStyle:"italic",marginBottom:6}}>
                  "Machine Learning is a set of methods that can automatically detect patterns in data, and then use the uncovered patterns to predict future data, or to perform other kinds of decision making under uncertainty."
                </p>
                <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fb)",lineHeight:1.6}}>
                  Author of "Deep Learning" textbook. Emphasizes pattern detection and decision-making under uncertainty.
                </p>
              </div>
            </div>

            <div className="callout callout-blue">
              <strong style={{fontSize:12,color:"#60a5fa"}}>Key Characteristics of Machine Learning:</strong>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>📊 Data-Driven</div>
                  <p style={{fontSize:11,color:"var(--txt1)",lineHeight:1.6}}>Learns from data rather than explicit rules</p>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>🎯 Task-Specific</div>
                  <p style={{fontSize:11,color:"var(--txt1)",lineHeight:1.6}}>Improves at specific tasks through practice</p>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>🔄 Iterative</div>
                  <p style={{fontSize:11,color:"var(--txt1)",lineHeight:1.6}}>Gets better over time with more data</p>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>🧠 Pattern Recognition</div>
                  <p style={{fontSize:11,color:"var(--txt1)",lineHeight:1.6}}>Finds hidden patterns humans might miss</p>
                </div>
              </div>
            </div>

            <div className="callout callout-green">
              <strong style={{fontSize:12,color:"#34d399"}}>Why Machine Learning Matters:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
                Traditional programming requires humans to understand and code every possible scenario. Machine Learning enables computers to handle complex, unpredictable situations by learning from examples — just like humans do. This makes it possible to solve problems that would be impossible to program manually.
              </p>
            </div>
          </div>
        ),
      },
      {
        title:"Regular Programming vs Machine Learning",
        badge:"📊 comparison",
        badgeColor:"#a78bfa",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>The biggest difference — where do the rules come from?</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {title:"💻 Normal Programming",color:"#60a5fa",items:["Rules → Computer","You write: IF rain → umbrella","You write every possible case","Hard to handle complex problems","Like: a recipe book"]},
                {title:"🤖 Machine Learning",color:"#f472b6",items:["Data + Answers → Computer finds rules","You show: [rainy days, people used umbrella]","Computer finds pattern automatically","Handles complex problems easily","Like: a child learning from experience"]},
              ].map((col,i)=>(
                <div key={i} style={{padding:"14px",borderRadius:12,background:`${col.color}0a`,border:`1px solid ${col.color}25`}}>
                  <div style={{fontSize:12,fontWeight:700,color:col.color,fontFamily:"var(--fb)",marginBottom:10}}>{col.title}</div>
                  {col.items.map((item,j)=>(
                    <div key={j} style={{display:"flex",gap:7,marginBottom:7,alignItems:"flex-start"}}>
                      <span style={{color:col.color,fontSize:10,marginTop:2,flexShrink:0}}>→</span>
                      <span style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.5}}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="callout callout-amber">
              <strong style={{fontSize:12,color:"#fbbf24"}}>Real example:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
                Spam email filter — Old way: write 1000 rules like "if email contains 'FREE MONEY' → spam". Machine Learning way: show 10,000 spam emails + 10,000 good emails → computer learns the difference automatically, even for new types of spam you never thought of!
              </p>
            </div>
          </div>
        ),
      },
      {
        title:"3 Types of Machine Learning",
        badge:"🗺️ overview",
        badgeColor:"#34d399",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {[
              {
                type:"Supervised Learning",emoji:"🎯",color:"#6366f1",
                simple:"You give the computer data WITH answers (labels)",
                analogy:"Teaching with a textbook that has answers in the back",
                examples:["Email → Spam or Not Spam","Photo → Cat or Dog","House size → Price"],
                when:"When you have labeled data",
              },
              {
                type:"Unsupervised Learning",emoji:"🔍",color:"#34d399",
                simple:"You give the computer data WITHOUT answers — it finds its own groups",
                analogy:"Giving someone a pile of foreign coins and asking them to sort by country without telling them the countries",
                examples:["Customer groups (find who buys similar things)","Topic grouping in news articles","Anomaly detection (find weird transactions)"],
                when:"When you have no labels and want to find hidden structure",
              },
              {
                type:"Reinforcement Learning",emoji:"🎮",color:"#f59e0b",
                simple:"Computer learns by trial and error — reward for good, penalty for bad",
                analogy:"Training a dog with treats — it tries things, good action gets treat, bad action gets no treat",
                examples:["AI playing Chess/Go","Robot learning to walk","Self-driving car decisions"],
                when:"When you need a model to make sequences of decisions",
              },
            ].map((t,i)=>(
              <div key={i} style={{padding:"16px 18px",borderRadius:14,background:`${t.color}0a`,border:`1px solid ${t.color}25`}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <span style={{fontSize:24}}>{t.emoji}</span>
                  <div>
                    <div style={{fontFamily:"var(--fd)",fontSize:14,fontWeight:700,color:t.color}}>{t.type}</div>
                    <div style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",marginTop:2}}>use when: {t.when}</div>
                  </div>
                </div>
                <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginBottom:8}}><strong style={{color:"var(--txt0)"}}>In simple words:</strong> {t.simple}</p>
                <div style={{padding:"8px 12px",borderRadius:9,background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.15)",marginBottom:10}}>
                  <span style={{fontSize:12,color:"#fbbf24",fontFamily:"var(--fb)"}}>🍬 Analogy: </span>
                  <span style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)"}}>{t.analogy}</span>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {t.examples.map((e,j)=>(
                    <span key={j} style={{padding:"3px 9px",borderRadius:100,background:`${t.color}12`,border:`1px solid ${t.color}25`,fontSize:10,color:t.color,fontFamily:"var(--fm)"}}>{e}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ),
      },
  {
    id:"data-importance", icon:ICONS.data, title:"2. Importance of Data in ML", color:"#34d399",
    tagline:"Data is the foundation of everything",
    topics:[
      {
        title:"Data as the Fuel of Machine Learning",
        badge:`${ICONS.data} foundation`,
        badgeColor:"#34d399",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              "Garbage in, garbage out" — this principle is especially true in machine learning. The quality and quantity of your data directly determines the performance and reliability of your models.
            </p>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#34d399",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Data Quality Dimensions</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10}}>
                  {[
                    {name:"Completeness", desc:"No missing values", icon:"✓", color:"#60a5fa"},
                    {name:"Accuracy", desc:"Correct values", icon:"🎯", color:"#34d399"},
                    {name:"Consistency", desc:"Same format", icon:"🔄", color:"#fbbf24"},
                    {name:"Timeliness", desc:"Up-to-date data", icon:"⏰", color:"#f472b6"}
                  ].map((dim,i)=>(
                    <div key={i} style={{textAlign:"center",padding:"12px",borderRadius:8,background:`${dim.color}08`,border:`1px solid ${dim.color}25`}}>
                      <div style={{fontSize:16,marginBottom:4}}>{dim.icon}</div>
                      <div style={{fontSize:11,fontWeight:700,color:dim.color,marginBottom:2}}>{dim.name}</div>
                      <div style={{fontSize:9,color:"var(--txt2)"}}>{dim.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#fbbf24",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Data Quantity Matters</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div style={{padding:"10px",borderRadius:6,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#60a5fa",marginBottom:4}}>Small Dataset (&le; 1K samples)</div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.5}}>Risk of overfitting, limited generalization, may not capture all patterns</p>
                    </div>
                    <div style={{padding:"10px",borderRadius:6,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#34d399",marginBottom:4}}>Large Dataset (&ge; 100K samples)</div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.5}}>Better generalization, can train complex models, more robust predictions</p>
                    </div>
                  </div>
                  <div style={{padding:"8px 12px",borderRadius:6,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)"}}>
                    <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)",marginBottom:2}}>📈 General Rule:</div>
                    <div style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)"}}>More data generally leads to better models, but diminishing returns apply</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {
                  title:"Training Data",
                  desc:"Used to teach the model patterns and relationships",
                  importance:"Foundation of learning",
                  risk:"Poor training data = poor model"
                },
                {
                  title:"Validation Data",
                  desc:"Used to tune hyperparameters and prevent overfitting",
                  importance:"Model optimization",
                  risk:"Data leakage reduces validity"
                },
                {
                  title:"Test Data",
                  desc:"Final unbiased evaluation of model performance",
                  importance:"True performance measure",
                  risk:"Contamination invalidates results"
                },
                {
                  title:"Real-world Data",
                  desc:"Data the model will encounter in production",
                  importance:"Practical applicability",
                  risk:"Distribution shift causes failures"
                }
              ].map((data_type,i)=>(
                <div key={i} style={{padding:"14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>{data_type.title}</div>
                  <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.5,marginBottom:6}}>{data_type.desc}</p>
                  <div style={{fontSize:10,color:"#34d399",fontFamily:"var(--fm)",marginBottom:2}}>✓ {data_type.importance}</div>
                  <div style={{fontSize:10,color:"#f87171",fontFamily:"var(--fm)"}}>⚠ {data_type.risk}</div>
                </div>
              ))}
            </div>

            <AnalogyBox icon={ICONS.data} title="Data is Like Food for the Brain" text="Just as our brains need quality nutrition to function properly, ML models need quality data to learn effectively. Poor data leads to poor learning, just like junk food leads to poor health."/>

            <Quiz q="What happens if you train an ML model on poor quality data?" options={["The model becomes faster","The model learns incorrect patterns","The model ignores the data","The model becomes more accurate"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"Data Collection and Sources",
        badge:`${ICONS.chart} acquisition`,
        badgeColor:"#f472b6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Collecting the right data is crucial for building effective ML models. The data must be relevant, representative, and collected ethically.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {
                  type:"Primary Data Collection",
                  methods:["Surveys & Questionnaires","Sensors & IoT Devices","Web Scraping","User Interactions","Experiments"],
                  pros:"Customized to your needs, fresh data",
                  cons:"Time-consuming, expensive",
                  examples:"Customer feedback forms, website analytics"
                },
                {
                  type:"Secondary Data Sources",
                  methods:["Public Datasets (Kaggle, UCI)","Government Databases","Research Papers","Commercial APIs","Existing Company Data"],
                  pros:"Readily available, cost-effective",
                  cons:"May not fit exact needs, quality varies",
                  examples:"ImageNet, census data, financial records"
                },
                {
                  type:"Synthetic Data Generation",
                  methods:["Data Augmentation","Generative Models (GANs)","Simulation","Bootstrapping"],
                  pros:"Infinite supply, privacy-safe",
                  cons:"May not capture real-world complexity",
                  examples:"Rotated images, generated text, simulated physics"
                },
                {
                  type:"Data Partnerships",
                  methods:["Industry Consortia","Academic Collaborations","Crowdsourcing","Third-party Vendors"],
                  pros:"Access to specialized data",
                  cons:"Cost, data sharing agreements",
                  examples:"Medical research collaborations, satellite imagery"
                }
              ].map((source,i)=>(
                <div key={i} style={{padding:"16px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--txt0)",marginBottom:8}}>{source.type}</div>

                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)",marginBottom:4,textTransform:"uppercase"}}>Methods</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {source.methods.map((method,j)=>(
                        <span key={j} style={{fontSize:9,color:"#60a5fa",fontFamily:"var(--fm)",background:"rgba(96,165,250,0.1)",padding:"2px 6px",borderRadius:4}}>{method}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                    <div>
                      <div style={{fontSize:10,color:"#34d399",fontFamily:"var(--fm)",marginBottom:2}}>✓ Pros</div>
                      <div style={{fontSize:9,color:"var(--txt1)"}}>{source.pros}</div>
                    </div>
                    <div>
                      <div style={{fontSize:10,color:"#f87171",fontFamily:"var(--fm)",marginBottom:2}}>⚠ Cons</div>
                      <div style={{fontSize:9,color:"var(--txt1)"}}>{source.cons}</div>
                    </div>
                  </div>

                  <div style={{marginTop:8,fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)",fontStyle:"italic"}}>Example: {source.examples}</div>
                </div>
              ))}
            </div>

            <div className="callout callout-red">
              <strong style={{fontSize:12,color:"#f87171"}}>⚠️ Ethical Data Collection:</strong>
              <div style={{marginTop:6}}>
                <div style={{fontSize:11,color:"var(--txt1)",marginBottom:4}}>Always consider:</div>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <div style={{fontSize:10,color:"var(--txt1)"}}>• <strong>Privacy:</strong> Obtain consent, anonymize data</div>
                  <div style={{fontSize:10,color:"var(--txt1)"}}>• <strong>Bias:</strong> Ensure representative sampling</div>
                  <div style={{fontSize:10,color:"var(--txt1)"}}>• <strong>Legal:</strong> Comply with GDPR, CCPA, etc.</div>
                  <div style={{fontSize:10,color:"var(--txt1)"}}>• <strong>Quality:</strong> Validate data accuracy and relevance</div>
                </div>
              </div>
            </div>

            <Quiz q="Which data collection method is best when you need customized data for your specific problem?" options={["Public datasets","Web scraping","Primary data collection","Synthetic generation"]} correct={2}/>
          </div>
        ),
      },
      {
        title:"Data Preprocessing Fundamentals",
        badge:`${ICONS.check} preparation`,
        badgeColor:"#fbbf24",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Raw data is rarely ready for machine learning. Data preprocessing transforms raw data into a format that algorithms can effectively learn from.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              {[
                {
                  step:"Data Cleaning",
                  icon:ICONS.check,
                  description:"Handle missing values, remove duplicates, fix errors",
                  techniques:["Mean/median imputation","Drop missing data","Outlier removal"],
                  importance:"Prevents model confusion from bad data"
                },
                {
                  step:"Data Integration",
                  icon:ICONS.data,
                  description:"Combine data from multiple sources",
                  techniques:["Schema matching","Entity resolution","Data fusion"],
                  importance:"Creates comprehensive dataset"
                },
                {
                  step:"Data Transformation",
                  icon:ICONS.run,
                  description:"Convert data to suitable format",
                  techniques:["Normalization","Scaling","Log transformation"],
                  importance:"Ensures fair feature contribution"
                },
                {
                  step:"Data Reduction",
                  icon:ICONS.focus,
                  description:"Reduce data size while preserving information",
                  techniques:["Feature selection","Dimensionality reduction","Sampling"],
                  importance:"Improves computational efficiency"
                },
                {
                  step:"Data Discretization",
                  icon:ICONS.chart,
                  description:"Convert continuous to categorical data",
                  techniques:["Binning","Histogram analysis","Clustering"],
                  importance:"Simplifies complex relationships"
                },
                {
                  step:"Quality Assessment",
                  icon:ICONS.star,
                  description:"Validate data quality and readiness",
                  techniques:["Statistical summaries","Visualization","Cross-validation"],
                  importance:"Ensures reliable model training"
                }
              ].map((step,i)=>(
                <div key={i} style={{padding:"14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:16}}>{step.icon}</span>
                    <span style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{step.step}</span>
                  </div>
                  <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.5,marginBottom:6}}>{step.description}</p>
                  <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)",marginBottom:4}}>Techniques:</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                    {step.techniques.map((tech,j)=>(
                      <span key={j} style={{fontSize:8,color:"#60a5fa",background:"rgba(96,165,250,0.1)",padding:"1px 4px",borderRadius:3}}>{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="callout callout-blue">
              <strong style={{fontSize:12,color:"#60a5fa"}}>Preprocessing Best Practices:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Automate when possible:</strong> Create reproducible pipelines</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Document decisions:</strong> Track why you made each choice</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Validate impact:</strong> Test how preprocessing affects model performance</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Handle outliers carefully:</strong> Don't remove without domain knowledge</div>
                </div>
              </div>
            </div>

            <Quiz q="What is the main purpose of data preprocessing?" options={["Make data look pretty","Transform raw data into format suitable for ML algorithms","Reduce data size","Add more features"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"What is Data in ML? — Complete Understanding",
        badge:`${ICONS.data} fundamentals`,
        badgeColor:"#34d399",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              In Machine Learning, <strong style={{color:"var(--txt0)"}}>data is everything</strong>. Without good data, even the best algorithms fail. Let's understand data from every angle:
            </p>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#34d399",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Data as a Table</div>
                <p style={{fontSize:13,color:"var(--txt0)",fontFamily:"var(--fb)",lineHeight:1.7,marginBottom:10}}>
                  Think of data as an Excel spreadsheet or database table. Each row is one <span className="word-box">observation</span> (also called <span className="word-box">sample</span>, <span className="word-box">instance</span>, or <span className="word-box">record</span>). Each column is one <span className="word-box">feature</span> (also called <span className="word-box">attribute</span>, <span className="word-box">variable</span>, or <span className="word-box">field</span>).
                </p>
                <div style={{overflowX:"auto",marginTop:12}}>
                  <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"3px",fontFamily:"var(--fm)",fontSize:11,minWidth:400}}>
                    <thead>
                      <tr>
                        {["Age","Salary ($)","Experience (yrs)","Education","Got Promoted? ← TARGET"].map((h,i)=>(
                          <td key={i} style={{padding:"8px 12px",borderRadius:6,background:i===4?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.07)",color:i===4?"#a5b4fc":"var(--txt1)",fontWeight:700,fontSize:10,textAlign:"center"}}>{h}</td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [25,50000,2,"Bachelor's","YES"],
                        [32,75000,6,"Master's","YES"],
                        [45,60000,15,"PhD","NO"],
                        [28,45000,1,"High School","NO"],
                        [38,90000,10,"Bachelor's","YES"]
                      ].map((row,i)=>(
                        <tr key={i}>
                          {row.map((cell,j)=>(
                            <td key={j} style={{padding:"7px 12px",borderRadius:5,background:j===4?"rgba(99,102,241,0.1)":"rgba(255,255,255,0.03)",color:j===4?"#818cf8":"var(--txt1)",textAlign:"center",fontSize:10}}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#fbbf24",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Key Data Terminology</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[
                    {term:"Feature (X)",color:"#60a5fa",def:"Input variables used to make predictions (Age, Salary, Experience, Education)",examples:"Independent variables"},
                    {term:"Target/Label (Y)",color:"#a5b4fc",def:"The answer we want to predict (Got Promoted?)",examples:"Dependent variable"},
                    {term:"Sample/Instance",color:"#34d399",def:"One complete row of data (one person's information)",examples:"Observation, record, data point"},
                    {term:"Dataset",color:"#f472b6",def:"The entire collection of samples",examples:"Training data, test data"},
                    {term:"Feature Vector",color:"#fbbf24",def:"All feature values for one sample as a mathematical vector",examples:"[25, 50000, 2, 'Bachelor's']"},
                    {term:"Feature Space",color:"#a78bfa",def:"The n-dimensional space where features exist",examples:"2D space for 2 features, 100D for 100 features"},
                  ].map((d,i)=>(
                    <div key={i} style={{padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                      <code style={{fontSize:11,color:d.color,fontFamily:"var(--fm)",fontWeight:700,display:"block",marginBottom:4}}>{d.term}</code>
                      <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:3}}>{d.def}</p>
                      <span style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>Examples: {d.examples}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(244,114,182,0.08)",border:"1px solid rgba(244,114,182,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f472b6",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Types of Data in ML</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[
                    {type:"Structured Data",color:"#60a5fa",desc:"Organized in tables with clear rows/columns",examples:"Excel files, SQL databases, CSV files"},
                    {type:"Unstructured Data",color:"#34d399",desc:"No predefined structure",examples:"Images, text, audio, video"},
                    {type:"Semi-structured",color:"#fbbf24",desc:"Some structure but not fully tabular",examples:"JSON, XML, HTML"},
                    {type:"Time Series",color:"#a78bfa",desc:"Data points collected over time",examples:"Stock prices, weather data, sensor readings"},
                    {type:"Categorical",color:"#f472b6",desc:"Discrete categories or labels",examples:"Colors, countries, product types"},
                    {type:"Numerical",color:"#a5b4fc",desc:"Measurable quantities",examples:"Age, price, temperature, counts"},
                  ].map((d,i)=>(
                    <div key={i} style={{padding:"12px 14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                      <div style={{fontSize:12,fontWeight:700,color:d.color,marginBottom:4}}>{d.type}</div>
                      <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.5,marginBottom:4}}>{d.desc}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>Examples: {d.examples}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {
                  title:"Training Data",
                  desc:"Used to teach the model patterns and relationships",
                  importance:"Foundation of learning",
                  risk:"Poor training data = poor model"
                },
                {
                  title:"Validation Data",
                  desc:"Used to tune hyperparameters and prevent overfitting",
                  importance:"Model optimization",
                  risk:"Data leakage reduces validity"
                },
                {
                  title:"Test Data",
                  desc:"Final unbiased evaluation of model performance",
                  importance:"True performance measure",
                  risk:"Contamination invalidates results"
                },
                {
                  title:"Real-world Data",
                  desc:"Data the model will encounter in production",
                  importance:"Practical applicability",
                  risk:"Distribution shift causes failures"
                }
              ].map((data_type,i)=>(
                <div key={i} style={{padding:"14px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>{data_type.title}</div>
                  <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.5,marginBottom:6}}>{data_type.desc}</p>
                  <div style={{fontSize:10,color:"#34d399",fontFamily:"var(--fm)",marginBottom:2}}>✓ {data_type.importance}</div>
                  <div style={{fontSize:10,color:"#f87171",fontFamily:"var(--fm)"}}>⚠ {data_type.risk}</div>
                </div>
              ))}
            </div>

            <AnalogyBox icon={ICONS.data} title="Data is Like Food for the Brain" text="Just as our brains need quality nutrition to function properly, ML models need quality data to learn effectively. Poor data leads to poor learning, just like junk food leads to poor health."/>

            <Quiz q="What happens if you train an ML model on poor quality data?" options={["The model becomes faster","The model learns incorrect patterns","The model ignores the data","The model becomes more accurate"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"Cleaning Data — Fixing the Mess",
        badge:"🧹 practical",
        badgeColor:"#fbbf24",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Real-world data is <strong style={{color:"var(--txt0)"}}>messy</strong>. Missing values, wrong numbers, duplicates. A model trained on bad data gives bad results. <em>"Garbage in, garbage out."</em>
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {problem:"Missing Values",emoji:"🕳️",color:"#f87171",example:'Age: 25, Salary: ???',fix:"Fill with the average (mean), or the most common value, or just delete the row.",why:"Computers can't do math with empty boxes."},
                {problem:"Outliers",emoji:"📏",color:"#fbbf24",example:"Salaries: 50k, 60k, 55k, 999999k ← very weird!",fix:"Remove it or cap it at a reasonable max value.",why:"One crazy value can throw off the whole model."},
                {problem:"Duplicate Rows",emoji:"👯",color:"#a78bfa",example:"Same person appears 3 times in the data",fix:"Keep only one copy — delete the rest.",why:"Duplicates make the model think that example is more important."},
                {problem:"Wrong Data Types",emoji:"🔢",color:"#60a5fa",example:'Gender: "Male", "male", "M", "MALE" — all the same!',fix:'Standardize: make all the same → "male"',why:"Computer thinks these are 4 different values."},
              ].map((p,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${p.color}08`,border:`1px solid ${p.color}22`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:18}}>{p.emoji}</span>
                    <span style={{fontSize:12,fontWeight:700,color:p.color,fontFamily:"var(--fb)"}}>{p.problem}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div style={{padding:"6px 10px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)",marginBottom:3}}>EXAMPLE</div>
                      <code style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fm)"}}>{p.example}</code>
                    </div>
                    <div style={{padding:"6px 10px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)",marginBottom:3}}>FIX</div>
                      <span style={{fontSize:11,color:"var(--txt0)",fontFamily:"var(--fb)"}}>{p.fix}</span>
                    </div>
                  </div>
                  <div style={{marginTop:8,fontSize:10,color:"var(--txt2)",fontFamily:"var(--fb)",fontStyle:"italic"}}>Why it matters: {p.why}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      }
    ],
  },
  {
    id:"statistics", icon:ICONS.chart, title:"4. Statistics for ML", color:"#8b5cf6",
    tagline:"The mathematical foundation of machine learning",
    topics:[
      {
        title:"Descriptive Statistics",
        badge:`${ICONS.chart} describe`,
        badgeColor:"#8b5cf6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Descriptive statistics help us understand and summarize our data before building models. They provide the first insights into data distribution, central tendency, and variability.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Measures of Central Tendency</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"Mean (Average)",
                      formula:"μ = Σxᵢ/n",
                      description:"Sum of all values divided by count",
                      use:"Overall central value, sensitive to outliers",
                      example:"[1,2,3,4,5] → mean = 3",
                      icon:"📊"
                    },
                    {
                      name:"Median",
                      formula:"Middle value when sorted",
                      description:"50th percentile, middle value",
                      use:"Central value, robust to outliers",
                      example:"[1,2,3,4,5] → median = 3",
                      icon:"⚖️"
                    },
                    {
                      name:"Mode",
                      formula:"Most frequent value",
                      description:"Value that appears most often",
                      use:"Categorical data, peak identification",
                      example:"[1,2,2,3,3,3] → mode = 3",
                      icon:"🎯"
                    }
                  ].map((measure,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(139,92,246,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{measure.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{measure.name}</div>
                          <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"var(--fm)"}}>{measure.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{measure.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {measure.use}<br/>
                        <strong>Example:</strong> {measure.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Measures of Variability</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"Range",
                      formula:"max - min",
                      description:"Difference between highest and lowest values",
                      use:"Simple spread measure, sensitive to outliers",
                      example:"[1,2,3,4,5] → range = 4",
                      icon:"📏"
                    },
                    {
                      name:"Variance (σ²)",
                      formula:"σ² = Σ(xᵢ-μ)²/n",
                      description:"Average of squared differences from mean",
                      use:"Spread measure, foundation for other statistics",
                      example:"[1,2,3,4,5] → variance ≈ 2.0",
                      icon:"📈"
                    },
                    {
                      name:"Standard Deviation (σ)",
                      formula:"σ = √σ²",
                      description:"Square root of variance, same units as data",
                      use:"Common spread measure, normal distribution",
                      example:"[1,2,3,4,5] → std ≈ 1.41",
                      icon:"📊"
                    },
                    {
                      name:"Interquartile Range (IQR)",
                      formula:"Q3 - Q1",
                      description:"Range of middle 50% of data",
                      use:"Robust spread measure, outlier detection",
                      example:"[1,2,3,4,5] → IQR = 2",
                      icon:"📦"
                    }
                  ].map((measure,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(139,92,246,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{measure.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{measure.name}</div>
                          <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"var(--fm)"}}>{measure.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{measure.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {measure.use}<br/>
                        <strong>Example:</strong> {measure.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(244,114,182,0.08)",border:"1px solid rgba(244,114,182,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f472b6",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Types of Data in ML</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[
                    {type:"Structured Data",color:"#60a5fa",desc:"Organized in tables with clear rows/columns",examples:"Excel files, SQL databases, CSV files"},
                    {type:"Unstructured Data",color:"#34d399",desc:"No predefined structure",examples:"Images, text, audio, video"},
                    {type:"Semi-structured",color:"#fbbf24",desc:"Some structure but not fully tabular",examples:"JSON, XML, HTML"},
                    {type:"Time Series",color:"#a78bfa",desc:"Data points collected over time",examples:"Stock prices, weather data, sensor readings"},
                    {type:"Categorical",color:"#f472b6",desc:"Discrete categories or labels",examples:"Colors, countries, product types"},
                    {type:"Numerical",color:"#a5b4fc",desc:"Measurable quantities",examples:"Age, price, temperature, counts"},
                  ].map((t,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:10,background:`${t.color}08`,border:`1px solid ${t.color}22`}}>
                      <div style={{fontSize:11,fontWeight:700,color:t.color,fontFamily:"var(--fb)",marginBottom:4}}>{t.type}</div>
                      <p style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.5,marginBottom:4}}>{t.desc}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>{t.examples}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="callout callout-blue">
              <strong style={{fontSize:12,color:"#60a5fa"}}>Data Quality Dimensions:</strong>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:14,color:"#60a5fa",marginBottom:4}}>📊</div>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)"}}>Completeness</div>
                  <div style={{fontSize:9,color:"var(--txt2)"}}>No missing values</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:14,color:"#34d399",marginBottom:4}}>✅</div>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)"}}>Accuracy</div>
                  <div style={{fontSize:9,color:"var(--txt2)"}}>Correct values</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:14,color:"#fbbf24",marginBottom:4}}>🔄</div>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)"}}>Consistency</div>
                  <div style={{fontSize:9,color:"var(--txt2)"}}>Same format</div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title:"Data Splitting — Train, Validation, Test Sets",
        badge:`${ICONS.train} critical concept`,
        badgeColor:"#f472b6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              You can't use <em>all</em> your data for training. How would you know if your model works on <strong style={{color:"var(--txt0)"}}>data it has never seen before?</strong> You need separate datasets for training, validation, and final testing.
            </p>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#6366f1",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>The Three Sacred Datasets</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  {[
                    {
                      name:"Training Set",
                      icon:ICONS.train,
                      color:"#60a5fa",
                      percentage:"60-80%",
                      purpose:"Model learns patterns from this data",
                      analogy:"Textbook you study from",
                      access:"Model sees this during training"
                    },
                    {
                      name:"Validation Set",
                      icon:ICONS.check,
                      color:"#fbbf24",
                      percentage:"10-20%",
                      purpose:"Tune hyperparameters and check overfitting",
                      analogy:"Practice exam to improve",
                      access:"Model sees this during development"
                    },
                    {
                      name:"Test Set",
                      icon:ICONS.goal,
                      color:"#f87171",
                      percentage:"10-20%",
                      purpose:"Final unbiased evaluation",
                      analogy:"Real exam you take once",
                      access:"Model NEVER sees this until the end"
                    }
                  ].map((set,i)=>(
                    <div key={i} style={{padding:"14px",borderRadius:10,background:`${set.color}08`,border:`1px solid ${set.color}25`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:16}}>{set.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:set.color,fontFamily:"var(--fb)"}}>{set.name}</div>
                          <div style={{fontSize:10,color:set.color,fontFamily:"var(--fm)"}}>{set.percentage}</div>
                        </div>
                      </div>
                      <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.5,marginBottom:6}}>{set.purpose}</p>
                      <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fb)",fontStyle:"italic"}}>{set.analogy}</div>
                      <div style={{fontSize:9,color:set.color,fontFamily:"var(--fm)",marginTop:4,fontWeight:600}}>{set.access}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(244,114,182,0.08)",border:"1px solid rgba(244,114,182,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f472b6",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Why Three Sets? The Complete Picture</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#60a5fa",marginBottom:6}}>Training Set Only</div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.5}}>Model memorizes training data perfectly but fails on new data. This is called <span className="word-box">overfitting</span>.</p>
                    </div>
                    <div style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#34d399",marginBottom:6}}>Training + Validation</div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.5}}>Good for development, but validation scores are optimistic since you tune based on them.</p>
                    </div>
                  </div>
                  <div style={{padding:"12px",borderRadius:8,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#6366f1",marginBottom:6}}>Training + Validation + Test</div>
                    <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.5}}>Test set gives unbiased final score. This is the only honest way to evaluate your model!</p>
                  </div>
                </div>
              </div>
            </div>

            <AnalogyBox icon={ICONS.data} title="Think of it like school exams" text="You study from textbooks (training set). You do practice problems (validation set). Then you sit the final exam using questions you've never seen before (test set). If you only practiced with the same questions as the exam, you'd just memorize — not learn!"/>
            <TrainTestDiagram/>

            <div className="callout callout-red">
              <strong style={{fontSize:12,color:"#f87171"}}>⚠️ The Golden Rules of Data Splitting:</strong>
              <div style={{marginTop:8}}>
                <div style={{display:"flex",gap:8,marginBottom:6}}>
                  <span style={{color:"#f87171",fontSize:12}}>1.</span>
                  <span style={{fontSize:11,color:"var(--txt1)",lineHeight:1.6}}>Never look at test set during development. It's your final exam!</span>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:6}}>
                  <span style={{color:"#f87171",fontSize:12}}>2.</span>
                  <span style={{fontSize:11,color:"var(--txt1)",lineHeight:1.6}}>Split data randomly to avoid bias. Don't put all easy examples in training!</span>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:6}}>
                  <span style={{color:"#f87171",fontSize:12}}>3.</span>
                  <span style={{fontSize:11,color:"var(--txt1)",lineHeight:1.6}}>Keep class proportions the same in each split (stratified sampling).</span>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <span style={{color:"#f87171",fontSize:12}}>4.</span>
                  <span style={{fontSize:11,color:"var(--txt1)",lineHeight:1.6}}>Test set should represent real-world data your model will encounter.</span>
                </div>
              </div>
            </div>

            <div className="callout callout-green">
              <strong style={{fontSize:12,color:"#34d399"}}>Common Splitting Ratios:</strong>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:8}}>
                <div style={{textAlign:"center",padding:"8px",borderRadius:6,background:"rgba(255,255,255,0.03)"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)"}}>60/20/20</div>
                  <div style={{fontSize:9,color:"var(--txt2)"}}>Standard split</div>
                </div>
                <div style={{textAlign:"center",padding:"8px",borderRadius:6,background:"rgba(255,255,255,0.03)"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)"}}>70/15/15</div>
                  <div style={{fontSize:9,color:"var(--txt2)"}}>More training data</div>
                </div>
                <div style={{textAlign:"center",padding:"8px",borderRadius:6,background:"rgba(255,255,255,0.03)"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)"}}>80/10/10</div>
                  <div style={{fontSize:9,color:"var(--txt2)"}}>Small datasets</div>
                </div>
              </div>
            </div>

            <Quiz q="Why do we keep a separate test set?" options={["To save memory","To test the model on data it has never seen before","Because it's too much data to train on","To make training faster"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"Cleaning Data — Fixing the Mess",
        badge:"🧹 practical",
        badgeColor:"#fbbf24",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Real-world data is <strong style={{color:"var(--txt0)"}}>messy</strong>. Missing values, wrong numbers, duplicates. A model trained on bad data gives bad results. <em>"Garbage in, garbage out."</em>
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {problem:"Missing Values",emoji:"🕳️",color:"#f87171",example:'Age: 25, Salary: ???',fix:"Fill with the average (mean), or the most common value, or just delete the row.",why:"Computers can't do math with empty boxes."},
                {problem:"Outliers",emoji:"📏",color:"#fbbf24",example:"Salaries: 50k, 60k, 55k, 999999k ← very weird!",fix:"Remove it or cap it at a reasonable max value.",why:"One crazy value can throw off the whole model."},
                {problem:"Duplicate Rows",emoji:"👯",color:"#a78bfa",example:"Same person appears 3 times in the data",fix:"Keep only one copy — delete the rest.",why:"Duplicates make the model think that example is more important."},
                {problem:"Wrong Data Types",emoji:"🔢",color:"#60a5fa",example:'Gender: "Male", "male", "M", "MALE" — all the same!',fix:'Standardize: make all the same → "male"',why:"Computer thinks these are 4 different values."},
              ].map((p,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${p.color}08`,border:`1px solid ${p.color}22`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:18}}>{p.emoji}</span>
                    <span style={{fontSize:12,fontWeight:700,color:p.color,fontFamily:"var(--fb)"}}>{p.problem}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div style={{padding:"6px 10px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)",marginBottom:3}}>EXAMPLE</div>
                      <code style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fm)"}}>{p.example}</code>
                    </div>
                    <div style={{padding:"6px 10px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)",marginBottom:3}}>FIX</div>
                      <span style={{fontSize:11,color:"var(--txt0)",fontFamily:"var(--fb)"}}>{p.fix}</span>
                    </div>
                  </div>
                  <div style={{marginTop:8,fontSize:10,color:"var(--txt2)",fontFamily:"var(--fb)",fontStyle:"italic"}}>Why it matters: {p.why}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      }
    ],
  },
  {
    id:"statistics", icon:ICONS.chart, title:"4. Statistics for ML", color:"#8b5cf6",
    tagline:"The mathematical foundation of machine learning",
    topics:[
      {
        title:"Descriptive Statistics",
        badge:`${ICONS.chart} describe`,
        badgeColor:"#8b5cf6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Descriptive statistics help us understand and summarize our data before building models. They provide the first insights into data distribution, central tendency, and variability.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Measures of Central Tendency</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"Mean (Average)",
                      formula:"μ = Σxᵢ/n",
                      description:"Sum of all values divided by count",
                      use:"Overall central value, sensitive to outliers",
                      example:"[1,2,3,4,5] → mean = 3",
                      icon:"📊"
                    },
                    {
                      name:"Median",
                      formula:"Middle value when sorted",
                      description:"50th percentile, middle value",
                      use:"Central value, robust to outliers",
                      example:"[1,2,3,4,5] → median = 3",
                      icon:"⚖️"
                    },
                    {
                      name:"Mode",
                      formula:"Most frequent value",
                      description:"Value that appears most often",
                      use:"Categorical data, peak identification",
                      example:"[1,2,2,3,3,3] → mode = 3",
                      icon:"🎯"
                    }
                  ].map((measure,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(139,92,246,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{measure.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{measure.name}</div>
                          <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"var(--fm)"}}>{measure.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{measure.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {measure.use}<br/>
                        <strong>Example:</strong> {measure.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Measures of Variability</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"Range",
                      formula:"max - min",
                      description:"Difference between highest and lowest values",
                      use:"Simple spread measure, sensitive to outliers",
                      example:"[1,2,3,4,5] → range = 4",
                      icon:"📏"
                    },
                    {
                      name:"Variance (σ²)",
                      formula:"σ² = Σ(xᵢ-μ)²/n",
                      description:"Average of squared differences from mean",
                      use:"Spread measure, foundation for other statistics",
                      example:"[1,2,3,4,5] → variance ≈ 2.0",
                      icon:"📈"
                    },
                    {
                      name:"Standard Deviation (σ)",
                      formula:"σ = √σ²",
                      description:"Square root of variance, same units as data",
                      use:"Common spread measure, normal distribution",
                      example:"[1,2,3,4,5] → std ≈ 1.41",
                      icon:"📊"
                    },
                    {
                      name:"Interquartile Range (IQR)",
                      formula:"Q3 - Q1",
                      description:"Range of middle 50% of data",
                      use:"Robust spread measure, outlier detection",
                      example:"[1,2,3,4,5] → IQR = 2",
                      icon:"📦"
                    }
                  ].map((measure,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(139,92,246,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{measure.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{measure.name}</div>
                          <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"var(--fm)"}}>{measure.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{measure.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {measure.use}<br/>
                        <strong>Example:</strong> {measure.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{padding:"16px",borderRadius:12,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#fbbf24",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Data Distribution Shapes</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>
                {[
                  {name:"Normal", shape:"Bell curve", mean_median:"Equal", skewness:"0", example:"Heights, IQ scores"},
                  {name:"Skewed Right", shape:"Long right tail", mean_median:"Mean &gt; Median", skewness:"&gt;0", example:"Income, city populations"},
                  {name:"Skewed Left", shape:"Long left tail", mean_median:"Mean &lt; Median", skewness:"&lt;0", example:"Age at retirement"},
                  {name:"Uniform", shape:"Flat", mean_median:"Equal", skewness:"0", example:"Random number generation"},
                  {name:"Bimodal", shape:"Two peaks", mean_median:"Varies", skewness:"Varies", example:"Height by gender"}
                ].map((dist,i)=>(
                  <div key={i} style={{padding:"10px",borderRadius:8,background:"rgba(0,0,0,0.2)",textAlign:"center"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:4}}>{dist.name}</div>
                    <div style={{fontSize:9,color:"var(--txt2)",marginBottom:2}}>{dist.shape}</div>
                    <div style={{fontSize:8,color:"#fbbf24",marginBottom:1}}>{dist.mean_median}</div>
                    <div style={{fontSize:8,color:"var(--txt2)",marginBottom:2}}>Skew: {dist.skewness}</div>
                    <div style={{fontSize:7,color:"var(--txt3)",lineHeight:1.1}}>{dist.example}</div>
                  </div>
                ))}
              </div>
            </div>

            <AnalogyBox icon={ICONS.chart} title="Statistics Like Photography" text="Descriptive statistics are like taking a photo of your data — they capture the current state, show what's typical, and reveal how spread out the values are, just like a photo shows a moment in time."/>

            <Quiz q="Which measure is most affected by outliers?" options={["Median","Mean","Mode","Interquartile Range"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"Inferential Statistics",
        badge:`${ICONS.predict} infer`,
        badgeColor:"#ec4899",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Inferential statistics allow us to make predictions and draw conclusions about populations from sample data, forming the basis for hypothesis testing and confidence intervals.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Hypothesis Testing Framework</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>Step 1: State Hypotheses</div>
                    <div style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4}}>
                      <strong>H₀ (Null):</strong> No effect or difference exists<br/>
                      <strong>H₁ (Alternative):</strong> Effect or difference exists
                    </div>
                  </div>
                  <div style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>Step 2: Choose Significance Level (α)</div>
                    <div style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4}}>
                      Common values: 0.05, 0.01, 0.10<br/>
                      <strong>α = P(Type I error)</strong> = P(rejecting H₀ when true)
                    </div>
                  </div>
                  <div style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>Step 3: Calculate Test Statistic</div>
                    <div style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4}}>
                      Compare sample statistic to null hypothesis<br/>
                      Examples: t-statistic, z-statistic, F-statistic
                    </div>
                  </div>
                  <div style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>Step 4: Find p-value</div>
                    <div style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4}}>
                      Probability of observing data (or more extreme)<br/>
                      assuming H₀ is true
                    </div>
                  </div>
                  <div style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>Step 5: Make Decision</div>
                    <div style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4}}>
                      If p-value &lt; α: Reject H₀<br/>
                      If p-value &ge; α: Fail to reject H₀
                    </div>
                  </div>
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Common Statistical Tests</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {
                      test:"One-sample t-test",
                      purpose:"Compare sample mean to known value",
                      assumptions:"Normal distribution, independent observations",
                      example:"Is average height different from 170cm?"
                    },
                    {
                      test:"Two-sample t-test",
                      purpose:"Compare means of two groups",
                      assumptions:"Normal distribution, equal variances, independence",
                      example:"Do men and women have different average heights?"
                    },
                    {
                      test:"Paired t-test",
                      purpose:"Compare means of related samples",
                      assumptions:"Normal differences, random sampling",
                      example:"Before/after treatment effect on same patients"
                    },
                    {
                      test:"Chi-square test",
                      purpose:"Test independence of categorical variables",
                      assumptions:"Expected frequencies ≥ 5, random sampling",
                      example:"Is there relationship between gender and preference?"
                    },
                    {
                      test:"ANOVA (F-test)",
                      purpose:"Compare means across multiple groups",
                      assumptions:"Normal distribution, equal variances, independence",
                      example:"Do different diets affect weight loss differently?"
                    },
                    {
                      test:"Correlation test",
                      purpose:"Test linear relationship strength",
                      assumptions:"Linear relationship, homoscedasticity",
                      example:"How strongly related are height and weight?"
                    }
                  ].map((test,i)=>(
                    <div key={i} style={{padding:"10px",borderRadius:6,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:2}}>{test.test}</div>
                      <div style={{fontSize:9,color:"var(--txt1)",lineHeight:1.3,marginBottom:3}}>{test.purpose}</div>
                      <div style={{fontSize:8,color:"var(--txt2)",marginBottom:2}}>
                        <strong>Assumptions:</strong> {test.assumptions}
                      </div>
                      <div style={{fontSize:8,color:"#ec4899",fontStyle:"italic"}}>{test.example}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="callout callout-red">
              <strong style={{fontSize:12,color:"#f87171"}}>⚠️ p-value Misconceptions:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Not probability H₀ is true:</strong> p-value is probability of data given H₀</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Not effect size:</strong> Small p-value doesn't mean large effect</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Not replication probability:</strong> p-value doesn't predict future results</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Arbitrary threshold:</strong> 0.05 is conventional, not magical</div>
                </div>
              </div>
            </div>

            <Quiz q="What does a p-value of 0.03 mean?" options={["3% chance null hypothesis is true","3% chance of making Type I error","Probability of data if null is true","3% chance results will replicate"]} correct={2}/>
          </div>
        ),
      },
      {
        title:"Probability Distributions",
        badge:`${ICONS.distribution} probability`,
        badgeColor:"#06b6d4",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Probability distributions describe how data is spread across different values. Understanding these distributions is crucial for selecting appropriate ML algorithms and interpreting results.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#06b6d4",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Discrete Distributions</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {
                      name:"Bernoulli",
                      pmf:"P(X=1)=p, P(X=0)=1-p",
                      mean:"p",
                      variance:"p(1-p)",
                      example:"Coin flip, yes/no question",
                      icon:"🪙"
                    },
                    {
                      name:"Binomial",
                      pmf:"C(n,k) pᵏ (1-p)ⁿ⁻ᵏ",
                      mean:"np",
                      variance:"np(1-p)",
                      example:"Number of successes in n trials",
                      icon:"🎲"
                    },
                    {
                      name:"Poisson",
                      pmf:"e⁻λ λᵏ/k!",
                      mean:"λ",
                      variance:"λ",
                      example:"Number of events in time interval",
                      icon:"⚡"
                    }
                  ].map((dist,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{dist.icon}</span>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{dist.name}</div>
                      </div>
                      <div style={{fontSize:9,color:"var(--txt1)",marginBottom:4}}>
                        <strong>PMF:</strong> {dist.pmf}
                      </div>
                      <div style={{fontSize:9,color:"var(--txt1)",marginBottom:4}}>
                        <strong>Mean:</strong> {dist.mean} | <strong>Variance:</strong> {dist.variance}
                      </div>
                      <div style={{fontSize:8,color:"var(--txt2)",fontStyle:"italic"}}>{dist.example}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(6,182,212,0.08)",border:"1px solid rgba(6,182,212,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#06b6d4",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Continuous Distributions</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {
                      name:"Normal (Gaussian)",
                      pdf:"(1/√(2πσ²)) e^(-(x-μ)²/(2σ²))",
                      mean:"μ",
                      variance:"σ²",
                      example:"Heights, measurement errors",
                      icon:"📊"
                    },
                    {
                      name:"Uniform",
                      pdf:"1/(b-a) for a &le; x &le; b",
                      mean:"(a+b)/2",
                      variance:"(b-a)²/12",
                      example:"Random number generation",
                      icon:"📏"
                    },
                    {
                      name:"Exponential",
                      pdf:"λ e^(-λx)",
                      mean:"1/λ",
                      variance:"1/λ²",
                      example:"Time between events",
                      icon:"⏱️"
                    },
                    {
                      name:"Beta",
                      pdf:"Complex (conjugate to binomial)",
                      mean:"α/(α+β)",
                      variance:"αβ/((α+β)²(α+β+1))",
                      example:"Probabilities, proportions",
                      icon:"🎯"
                    }
                  ].map((dist,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{dist.icon}</span>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{dist.name}</div>
                      </div>
                      <div style={{fontSize:9,color:"var(--txt1)",marginBottom:4}}>
                        <strong>PDF:</strong> {dist.pdf}
                      </div>
                      <div style={{fontSize:9,color:"var(--txt1)",marginBottom:4}}>
                        <strong>Mean:</strong> {dist.mean} | <strong>Variance:</strong> {dist.variance}
                      </div>
                      <div style={{fontSize:8,color:"var(--txt2)",fontStyle:"italic"}}>{dist.example}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{padding:"16px",borderRadius:12,background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#22c55e",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Central Limit Theorem</div>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:8}}>
                The Central Limit Theorem states that the sampling distribution of the sample mean approaches a normal distribution as the sample size increases, regardless of the population's distribution.
              </p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                <div style={{padding:"8px",borderRadius:6,background:"rgba(0,0,0,0.2)",textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)"}}>Sample Size</div>
                  <div style={{fontSize:12,color:"#22c55e"}}>n ≥ 30</div>
                  <div style={{fontSize:8,color:"var(--txt2)"}}>For most distributions</div>
                </div>
                <div style={{padding:"8px",borderRadius:6,background:"rgba(0,0,0,0.2)",textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)"}}>Sample Mean</div>
                  <div style={{fontSize:12,color:"#22c55e"}}>μₓ̄ = μ</div>
                  <div style={{fontSize:8,color:"var(--txt2)"}}>Same as population mean</div>
                </div>
                <div style={{padding:"8px",borderRadius:6,background:"rgba(0,0,0,0.2)",textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)"}}>Standard Error</div>
                  <div style={{fontSize:12,color:"#22c55e"}}>σₓ̄ = σ/√n</div>
                  <div style={{fontSize:8,color:"var(--txt2)"}}>Decreases with sample size</div>
                </div>
              </div>
            </div>

            <AnalogyBox icon={ICONS.distribution} title="Distributions Like Musical Instruments" text="Different probability distributions are like different musical instruments — each has its own characteristic 'sound' or shape, and you choose the right one based on the type of data you're working with, just as a musician chooses the right instrument for the melody."/>

            <Quiz q="According to the Central Limit Theorem, what happens to sample means as sample size increases?" options={["They become more variable","They approach a normal distribution","They become more skewed","They stay the same"]} correct={1}/>
          </div>
        ),
      }
    ],
  },
  {
    id:"ml-process", icon:ICONS.run, title:"3. ML Process on Data", color:"#f59e0b",
    tagline:"The complete machine learning workflow",
    topics:[
      {
        title:"The Machine Learning Pipeline",
        badge:`${ICONS.run} workflow`,
        badgeColor:"#f59e0b",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Machine learning follows a systematic process that transforms raw data into predictive models. This pipeline ensures reproducible, reliable results.
            </p>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Complete ML Pipeline</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
                  {[
                    {step:"1", name:"Problem Definition", icon:"🎯", desc:"Define objective clearly"},
                    {step:"2", name:"Data Collection", icon:"📊", desc:"Gather relevant data"},
                    {step:"3", name:"Data Exploration", icon:"🔍", desc:"Understand data structure"},
                    {step:"4", name:"Data Preprocessing", icon:"🧹", desc:"Clean and prepare data"},
                    {step:"5", name:"Feature Engineering", icon:"⚙️", desc:"Create meaningful features"},
                    {step:"6", name:"Model Selection", icon:"🤖", desc:"Choose appropriate algorithm"},
                    {step:"7", name:"Model Training", icon:"🏋️", desc:"Train on prepared data"},
                    {step:"8", name:"Model Evaluation", icon:"📏", desc:"Assess performance"},
                    {step:"9", name:"Model Tuning", icon:"🔧", desc:"Optimize hyperparameters"},
                    {step:"10", name:"Model Deployment", icon:"🚀", desc:"Deploy to production"},
                    {step:"11", name:"Monitoring", icon:"📊", desc:"Track performance over time"},
                    {step:"12", name:"Maintenance", icon:"🔄", desc:"Update and retrain as needed"}
                  ].map((step,i)=>(
                    <div key={i} style={{padding:"10px",borderRadius:8,background:"rgba(0,0,0,0.2)",textAlign:"center",border:"1px solid rgba(245,158,11,0.1)"}}>
                      <div style={{fontSize:8,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:2}}>{step.step}</div>
                      <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)",marginBottom:2}}>{step.name}</div>
                      <div style={{fontSize:14,marginBottom:4}}>{step.icon}</div>
                      <div style={{fontSize:8,color:"var(--txt2)",lineHeight:1.2}}>{step.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {
                  phase:"Planning Phase",
                  steps:["Problem Definition","Data Collection","Data Exploration"],
                  focus:"Understanding and preparation",
                  output:"Clear objectives and clean dataset"
                },
                {
                  phase:"Development Phase",
                  steps:["Preprocessing","Feature Engineering","Model Selection","Training"],
                  focus:"Building the solution",
                  output:"Trained model ready for evaluation"
                },
                {
                  phase:"Validation Phase",
                  steps:["Model Evaluation","Hyperparameter Tuning","Cross-validation"],
                  focus:"Ensuring quality and reliability",
                  output:"Optimized, validated model"
                },
                {
                  phase:"Deployment Phase",
                  steps:["Model Deployment","Monitoring","Maintenance"],
                  focus:"Production and ongoing improvement",
                  output:"Live system with continuous learning"
                }
              ].map((phase,i)=>(
                <div key={i} style={{padding:"16px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--txt0)",marginBottom:8}}>{phase.phase}</div>
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)",marginBottom:4}}>Steps:</div>
                    <div style={{display:"flex",flexDirection:"column",gap:2}}>
                      {phase.steps.map((step,j)=>(
                        <div key={j} style={{fontSize:10,color:"var(--txt1)"}}>• {step}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:4}}>Focus: {phase.focus}</div>
                  <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>Output: {phase.output}</div>
                </div>
              ))}
            </div>

            <AnalogyBox icon={ICONS.run} title="ML Pipeline is Like Cooking" text="Just as cooking requires gathering ingredients, preparing them, cooking with the right technique, and serving the final dish, ML requires systematic steps from raw data to deployed model."/>

            <Quiz q="Which phase of the ML pipeline focuses on ensuring the model works well on unseen data?" options={["Planning Phase","Development Phase","Validation Phase","Deployment Phase"]} correct={2}/>
          </div>
        ),
      },
      {
        title:"Data Splitting Strategy",
        badge:`${ICONS.train} splitting`,
        badgeColor:"#f472b6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Proper data splitting is crucial to prevent data leakage and ensure your model can generalize to new, unseen data.
            </p>

            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(244,114,182,0.08)",border:"1px solid rgba(244,114,182,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f472b6",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>The Three Sacred Datasets</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
                  {[
                    {
                      name:"Training Set",
                      percentage:"60-80%",
                      purpose:"Model learns patterns from this data",
                      access:"Model sees this during training",
                      icon:ICONS.train,
                      color:"#60a5fa"
                    },
                    {
                      name:"Validation Set",
                      percentage:"10-20%",
                      purpose:"Tune hyperparameters and check overfitting",
                      access:"Model sees this during development",
                      icon:ICONS.check,
                      color:"#fbbf24"
                    },
                    {
                      name:"Test Set",
                      percentage:"10-20%",
                      purpose:"Final unbiased evaluation",
                      access:"Model NEVER sees this until end",
                      icon:ICONS.goal,
                      color:"#f87171"
                    }
                  ].map((set,i)=>(
                    <div key={i} style={{padding:"14px",borderRadius:10,background:`${set.color}08`,border:`1px solid ${set.color}25`}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                        <span style={{fontSize:16}}>{set.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:set.color}}>{set.name}</div>
                          <div style={{fontSize:10,color:set.color,fontFamily:"var(--fm)"}}>{set.percentage}</div>
                        </div>
                      </div>
                      <p style={{fontSize:11,color:"var(--txt1)",lineHeight:1.5,marginBottom:6}}>{set.purpose}</p>
                      <div style={{fontSize:9,color:set.color,fontFamily:"var(--fm)",fontWeight:600}}>{set.access}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#fbbf24",fontFamily:"var(--fm)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Common Splitting Techniques</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[
                    {
                      method:"Random Split",
                      description:"Randomly assign samples to train/validation/test",
                      pros:"Simple, fast",
                      cons:"May not preserve class distribution",
                      use:"When classes are balanced"
                    },
                    {
                      method:"Stratified Split",
                      description:"Maintain class proportions in each split",
                      pros:"Preserves class balance",
                      cons:"Slightly more complex",
                      use:"When dealing with imbalanced classes"
                    },
                    {
                      method:"Time-based Split",
                      description:"Split based on time (earlier for train, later for test)",
                      pros:"Realistic evaluation",
                      cons:"May have temporal bias",
                      use:"Time series, trending data"
                    },
                    {
                      method:"Group-based Split",
                      description:"Keep related samples together (e.g., same patient)",
                      pros:"Prevents data leakage",
                      cons:"Requires domain knowledge",
                      use:"Medical, user behavior data"
                    }
                  ].map((method,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:4}}>{method.method}</div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:6}}>{method.description}</p>
                      <div style={{display:"flex",gap:8}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:8,color:"#34d399",marginBottom:2}}>✓ Pros</div>
                          <div style={{fontSize:8,color:"var(--txt1)"}}>{method.pros}</div>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:8,color:"#f87171",marginBottom:2}}>⚠ Cons</div>
                          <div style={{fontSize:8,color:"var(--txt1)"}}>{method.cons}</div>
                        </div>
                      </div>
                      <div style={{fontSize:8,color:"var(--txt2)",marginTop:4,fontStyle:"italic"}}>Use: {method.use}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="callout callout-red">
              <strong style={{fontSize:12,color:"#f87171"}}>🚨 Data Leakage — The Silent Killer:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
                Data leakage occurs when information from outside the training set "leaks" into the model, making it perform unrealistically well on test data but fail in production. Common causes: using future data to predict past events, including target-related features in training, improper cross-validation.
              </p>
            </div>

            <Quiz q="What is data leakage?" options={["When data gets lost","When test data influences training","When model performs too well","When data is corrupted"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"Cross-Validation Techniques",
        badge:`${ICONS.check} validation`,
        badgeColor:"#34d399",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Cross-validation provides a more reliable estimate of model performance by testing on multiple data splits, reducing the risk of overfitting to a particular train-test split.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[
                {
                  method:"K-Fold Cross-Validation",
                  description:"Split data into K equal parts. Train on K-1 parts, test on remaining part. Repeat K times.",
                  advantages:["Uses all data for training and testing","Reduces overfitting risk","Provides confidence intervals"],
                  disadvantages:["Computationally expensive","Requires careful stratification"],
                  best_for:"Most ML problems with sufficient data",
                  k_value:"Typically K=5 or K=10"
                },
                {
                  method:"Stratified K-Fold",
                  description:"K-Fold with class proportion preservation in each fold",
                  advantages:["Maintains class balance","Better for imbalanced datasets"],
                  disadvantages:["Slower than regular K-Fold","Requires classification task"],
                  best_for:"Classification with imbalanced classes",
                  k_value:"K=5 or K=10"
                },
                {
                  method:"Leave-One-Out (LOO)",
                  description:"Use single sample for testing, rest for training. Repeat for each sample.",
                  advantages:["Uses maximum training data","Unbiased estimate"],
                  disadvantages:["Very computationally expensive","High variance"],
                  best_for:"Small datasets (< 1000 samples)",
                  k_value:"K = number of samples"
                },
                {
                  method:"Time Series Split",
                  description:"Respect temporal order — train on past, test on future",
                  advantages:["Realistic evaluation","Prevents data leakage"],
                  disadvantages:["Limited training data","Cannot shuffle"],
                  best_for:"Time series forecasting",
                  k_value:"Varies by time periods"
                }
              ].map((cv,i)=>(
                <div key={i} style={{padding:"16px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <div style={{fontSize:13,fontWeight:700,color:"var(--txt0)",marginBottom:8}}>{cv.method}</div>
                  <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.5,marginBottom:8}}>{cv.description}</p>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:8}}>
                    <div>
                      <div style={{fontSize:9,color:"#34d399",fontFamily:"var(--fm)",marginBottom:2}}>✓ Advantages</div>
                      <div style={{display:"flex",flexDirection:"column",gap:1}}>
                        {cv.advantages.map((adv,j)=>(
                          <div key={j} style={{fontSize:8,color:"var(--txt1)"}}>• {adv}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{fontSize:9,color:"#f87171",fontFamily:"var(--fm)",marginBottom:2}}>⚠ Disadvantages</div>
                      <div style={{display:"flex",flexDirection:"column",gap:1}}>
                        {cv.disadvantages.map((dis,j)=>(
                          <div key={j} style={{fontSize:8,color:"var(--txt1)"}}>• {dis}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                    <strong>Best for:</strong> {cv.best_for}<br/>
                    <strong>K value:</strong> {cv.k_value}
                  </div>
                </div>
              ))}
            </div>

            <div className="callout callout-blue">
              <strong style={{fontSize:12,color:"#60a5fa"}}>Cross-Validation Best Practices:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Always stratify:</strong> Preserve class distributions</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Shuffle wisely:</strong> Randomize but respect temporal order for time series</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Report mean ± std:</strong> Show confidence in your results</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Nested CV for tuning:</strong> Separate hyperparameter tuning from final evaluation</div>
                </div>
              </div>
            </div>

            <Quiz q="Why is cross-validation better than a single train-test split?" options={["It's faster","It uses more data","It provides more reliable performance estimates","It requires less data"]} correct={2}/>
          </div>
        ),
      }
    ],
  },
      {
        title:"Linear Regression — Predict Numbers",
        badge:"📈 algorithm",
        badgeColor:"#60a5fa",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Use Linear Regression when you want to <strong style={{color:"var(--txt0)"}}>predict a number</strong> — like a house price, tomorrow's temperature, or someone's salary.
            </p>
            <AnalogyBox emoji="📏" title="The best-fit line" text="Imagine plotting points on a graph — each point is a student (x = hours studied, y = exam score). Linear Regression finds the single straight line that passes closest to ALL the points. Then to predict a new student's score, just look at where the line is at their study hours!"/>
            <LinearRegressionDiagram/>
            <MathExplainer
              title="The formula — in simple English"
              formula="y = (m × x) + b"
              parts={[
                {symbol:"y",means:"The answer we want to predict (exam score, house price...)",color:"#34d399"},
                {symbol:"x",means:"The input we know (hours studied, house size...)",color:"#60a5fa"},
                {symbol:"m",means:"The slope — how much y changes when x goes up by 1. (The computer figures this out!)",color:"#f472b6"},
                {symbol:"b",means:"Where the line crosses zero (the starting point). (The computer figures this out too!)",color:"#fbbf24"},
              ]}
            />
            <div className="callout callout-green">
              <strong style={{fontSize:12,color:"#34d399"}}>When to use it:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>✅ Predicting house prices, salaries, temperatures, sales numbers. Any time your answer is a continuous number. ❌ Don't use it for Yes/No questions!</p>
            </div>
            <Quiz q="What type of output does Linear Regression predict?" options={["A category like 'spam' or 'not spam'","A continuous number like price or temperature","A group or cluster","A probability between 0 and 1"]} correct={1}/>
          </div>
        ),
      },
      {
        title:"Logistic Regression — Yes/No Decisions",
        badge:"⚖️ algorithm",
        badgeColor:"#f472b6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Despite having "regression" in the name, Logistic Regression is used for <strong style={{color:"var(--txt0)"}}>classification</strong> — predicting a category, usually YES or NO.
            </p>
            <AnalogyBox emoji="🌡️" title="Like a thermometer that outputs probability" text="Instead of saying 'this email IS spam', it says 'there's an 87% chance this is spam'. If that's above 50%, we call it spam. Below 50%, we call it not spam. The special S-curve squishes any number into 0–1 range."/>
            <div style={{background:"rgba(0,0,0,0.25)",borderRadius:14,padding:"16px",border:"1px solid var(--rim1)"}}>
              <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>The sigmoid function — the magic S-curve</p>
              <svg viewBox="0 0 200 100" style={{width:"100%",maxWidth:280,display:"block"}}>
                <line x1="10" y1="50" x2="190" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <line x1="100" y1="5" x2="100" y2="95" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                {/* 0 and 1 labels */}
                <text x="5" y="18" fill="#34d399" fontSize="7" fontFamily="'JetBrains Mono'">1.0</text>
                <text x="5" y="53" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="'JetBrains Mono'">0.5</text>
                <text x="5" y="88" fill="#f87171" fontSize="7" fontFamily="'JetBrains Mono'">0.0</text>
                <path d={`M ${Array.from({length:161},(_,i)=>{const x=(i-80)/8;const y=1/(1+Math.exp(-x));return`${i+10},${80-y*70}`}).join(" L ")}`}
                  fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinejoin="round"/>
                <line x1="10" y1="15" x2="190" y2="15" stroke="#34d39930" strokeWidth="1" strokeDasharray="4,3"/>
                <line x1="10" y1="85" x2="190" y2="85" stroke="#f8717130" strokeWidth="1" strokeDasharray="4,3"/>
                <text x="125" y="30" fill="#34d399" fontSize="7" fontFamily="'Plus Jakarta Sans'">← Predict YES</text>
                <text x="115" y="78" fill="#f87171" fontSize="7" fontFamily="'Plus Jakarta Sans'">← Predict NO</text>
              </svg>
              <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:10}}>No matter how big or small the input is, the output is always between 0 and 1. We read this as a probability (0% to 100% chance).</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {label:"✅ Use for",items:["Spam or not spam","Disease: positive or negative","Will customer churn? Yes/No","Pass or fail exam"],color:"#34d399"},
                {label:"❌ Don't use for",items:["Predicting exact prices","When you have 3+ categories (use softmax instead)","When data is very non-linear"],color:"#f87171"},
              ].map((col,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${col.color}08`,border:`1px solid ${col.color}20`}}>
                  <div style={{fontSize:11,fontWeight:700,color:col.color,fontFamily:"var(--fb)",marginBottom:8}}>{col.label}</div>
                  {col.items.map((item,j)=>(
                    <div key={j} style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:4,display:"flex",gap:6}}>
                      <span style={{color:col.color}}>•</span>{item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title:"Decision Trees — Playing 20 Questions",
        badge:"🌳 algorithm",
        badgeColor:"#34d399",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              A decision tree works by asking YES/NO questions, one after another, until it reaches an answer. Just like the game "20 Questions"!
            </p>
            <AnalogyBox emoji="🎮" title="Like the game 20 Questions" text='You think of an animal. I ask: "Does it have 4 legs?" → YES → "Does it have fur?" → YES → "Does it roar?" → NO → "Is it a dog?" → YES! The computer learns WHICH questions to ask and IN WHAT ORDER to best sort your data.'/>
            <DecisionTreeDiagram/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
              {[
                {title:"Pros 👍",color:"#34d399",items:["Very easy to understand — you can literally draw it","Works for both numbers AND categories","Handles missing data okay","No need to scale features"]},
                {title:"Cons 👎",color:"#f87171",items:["Can overfit easily (memorize training data)","Small change in data = completely different tree","Not great for very complex patterns","Gets too big on complex datasets"]},
              ].map((col,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${col.color}08`,border:`1px solid ${col.color}20`}}>
                  <div style={{fontSize:11,fontWeight:700,color:col.color,fontFamily:"var(--fb)",marginBottom:8}}>{col.title}</div>
                  {col.items.map((item,j)=>(
                    <div key={j} style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginBottom:4}}>• {item}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title:"Random Forest — Many Trees Together",
        badge:"🌲🌲 algorithm",
        badgeColor:"#34d399",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              One tree can make mistakes. But what if you asked <strong style={{color:"var(--txt0)"}}>100 different trees</strong> the same question and took a vote? That's a Random Forest!
            </p>
            <AnalogyBox emoji="🗳️" title="Democracy of trees" text="Imagine 100 doctors looking at your scan. Some might be wrong, but if 80 out of 100 say 'it's fine', you trust the majority. Random Forest creates 100 decision trees, each trained slightly differently. Then they vote — the majority answer wins. Much more reliable than one tree!"/>
            <div style={{background:"rgba(0,0,0,0.22)",border:"1px solid var(--rim1)",borderRadius:14,padding:"16px 18px"}}>
              <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:14}}>How the voting works</p>
              <div style={{display:"flex",gap:8,alignItems:"center",justifyContent:"center",flexWrap:"wrap"}}>
                {[{label:"Tree 1",vote:"YES",color:"#34d399"},{label:"Tree 2",vote:"YES",color:"#34d399"},{label:"Tree 3",vote:"NO",color:"#f87171"},{label:"Tree 4",vote:"YES",color:"#34d399"},{label:"Tree 5",vote:"NO",color:"#f87171"}].map((t,i)=>(
                  <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,padding:"10px 12px",borderRadius:12,background:`${t.color}12`,border:`1px solid ${t.color}30`,minWidth:60}}>
                    <span style={{fontSize:16}}>🌳</span>
                    <span style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)"}}>{t.label}</span>
                    <span style={{fontSize:12,fontWeight:800,color:t.color,fontFamily:"var(--fm)"}}>{t.vote}</span>
                  </div>
                ))}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <span style={{fontSize:20}}>→</span>
                </div>
                <div style={{padding:"14px 18px",borderRadius:12,background:"rgba(52,211,153,0.15)",border:"2px solid #34d399"}}>
                  <div style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",textAlign:"center",marginBottom:4}}>FINAL VOTE</div>
                  <div style={{fontSize:22,fontWeight:800,color:"#34d399",fontFamily:"var(--fm)",textAlign:"center"}}>YES</div>
                  <div style={{fontSize:9,color:"var(--txt1)",fontFamily:"var(--fm)",textAlign:"center"}}>3 out of 5</div>
                </div>
              </div>
            </div>
            <div className="callout callout-green">
              <strong style={{fontSize:12,color:"#34d399"}}>Why Random Forest is so popular:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>It almost always works well without much tuning. It handles missing data. It tells you which features are most important. And it's much harder to overfit than a single tree!</p>
            </div>
          </div>
        ),
      },
      {
        title:"K-Means Clustering — Finding Groups",
        badge:"🔍 unsupervised",
        badgeColor:"#teal",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              K-Means is <strong style={{color:"var(--txt0)"}}>unsupervised</strong> — you have data but NO labels. You just want to find natural groups (clusters) in it.
            </p>
            <AnalogyBox emoji="🎪" title="Sorting marbles without being told colors" text="You dump a bag of marbles on the floor. Nobody told you how many colors there are. You start grouping by color automatically. K-Means does the same — it finds groups of similar data points, even without labels!"/>
            <KMeansViz/>
            <MathExplainer
              title="How it decides which group a point belongs to"
              formula="Assign point to nearest center (smallest distance)"
              parts={[
                {symbol:"Distance",means:"How far a point is from each center — calculated using the Pythagorean formula (a² + b² = c²)",color:"#60a5fa"},
                {symbol:"K",means:"The number of groups you want to find. YOU have to choose this! (Try 3 groups? Try 5?)",color:"#f472b6"},
                {symbol:"Center",means:"The average position of all points in a group. Moves each round to the middle of its members.",color:"#34d399"},
              ]}
            />
          </div>
        ),
      },
    ],
  },
  {
    id:"neural-networks", icon:"🕸️", title:"Neural Networks & Deep Learning", color:"#f472b6",
    tagline:"How AI really thinks",
    topics:[
      {
        title:"What is a Neural Network?",
        badge:"🧠 deep learning",
        badgeColor:"#f472b6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              A neural network is inspired by the human brain. Your brain has 86 billion neurons (brain cells) connected to each other. When you see a cat, neurons fire signals to each other and recognize "cat". A neural network does the same — but with <strong style={{color:"var(--txt0)"}}>artificial neurons made of math</strong>.
            </p>
            <AnalogyBox emoji="🧠" title="A chain of decisions" text="Think of a relay race. Runner 1 passes baton to runner 2, who passes to runner 3. Each runner adds something. In a neural network, information flows through layers of neurons — each layer finds more complex patterns. First layer: edges. Second: shapes. Third: objects. Final: 'it's a cat!'"/>
            <NeuronDiagram/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[
                {layer:"Input Layer",color:"#60a5fa",desc:"Gets the raw data — like pixels of an image or words of a sentence"},
                {layer:"Hidden Layers",color:"#a78bfa",desc:"Finds patterns — edges, shapes, features. More layers = deeper learning"},
                {layer:"Output Layer",color:"#34d399",desc:"Gives the final answer — 'cat' or 'dog', a price, a probability"},
              ].map((l,i)=>(
                <div key={i} style={{padding:"12px 10px",borderRadius:12,background:`${l.color}0a`,border:`1px solid ${l.color}25`,textAlign:"center"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:`${l.color}20`,border:`1px solid ${l.color}40`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",fontSize:16}}>{["📥","⚙️","📤"][i]}</div>
                  <div style={{fontSize:11,fontWeight:700,color:l.color,fontFamily:"var(--fb)",marginBottom:5}}>{l.layer}</div>
                  <div style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6}}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title:"Weights & Bias — What the Network Learns",
        badge:"⚙️ how it works",
        badgeColor:"#a78bfa",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              When a neural network "learns", it's actually just adjusting millions of numbers called <strong style={{color:"var(--txt0)"}}>weights</strong>. Nothing magical — just a lot of number tuning!
            </p>
            <AnalogyBox emoji="🎛️" title="Think of mixing a song" text="A music mixer has hundreds of dials (bass, treble, reverb...). Finding the right settings for a great song = adjusting all dials. Neural network weights are the dials. Training = finding the right settings so the network makes correct predictions!"/>
            <MathExplainer
              title="What happens inside one neuron"
              formula="output = activation( w₁×x₁ + w₂×x₂ + ... + b )"
              parts={[
                {symbol:"x₁, x₂...",means:"The inputs coming in (from previous layer or raw data)",color:"#60a5fa"},
                {symbol:"w₁, w₂...",means:"Weights — how much we trust/amplify each input. Learned during training.",color:"#f472b6"},
                {symbol:"b",means:"Bias — a small extra number that shifts the output up or down. Like adjusting the starting point.",color:"#fbbf24"},
                {symbol:"activation",means:"A mathematical function that decides how strongly the neuron fires. Makes non-linear patterns possible!",color:"#34d399"},
              ]}
            />
            <div className="callout callout-blue">
              <strong style={{fontSize:12,color:"#60a5fa"}}>In very simple words:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>Each connection has a weight. Important connections have high weights. Unimportant ones have low weights (close to 0). Training = adjusting weights until the network gives correct answers. That's literally it!</p>
            </div>
          </div>
        ),
      },
      {
        title:"Activation Functions — Adding Complexity",
        badge:"∫ math made easy",
        badgeColor:"#34d399",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Without activation functions, a neural network with 100 layers is still just a straight line (linear). Activation functions add "bends" — letting the network learn complex, curved patterns.
            </p>
            <AnalogyBox emoji="💡" title="Like a light switch vs a dimmer" text="A simple switch is on or off (binary). A dimmer can be anywhere from 0 to 100% (continuous). Without activation functions, neurons are just switches. With them, they become dimmers — much more expressive!"/>
            <ActivationFnDiagram/>
            <div className="callout callout-green">
              <strong style={{fontSize:12,color:"#34d399"}}>Which one to use?</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
                For hidden layers: <strong style={{color:"#60a5fa"}}>ReLU</strong> (fast, works great in most cases)<br/>
                For output (yes/no): <strong style={{color:"#f472b6"}}>Sigmoid</strong> (gives probability 0-1)<br/>
                For output (multi-class): <strong style={{color:"#fbbf24"}}>Softmax</strong> (probabilities for each class)
              </p>
            </div>
          </div>
        ),
      },
      {
        title:"Backpropagation — How Networks Learn",
        badge:"↩️ training magic",
        badgeColor:"#f472b6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              After the network makes a prediction, we check: how wrong was it? Then we go <strong style={{color:"var(--txt0)"}}>backwards</strong> through the network and adjust every weight a tiny bit. Repeat millions of times = a trained network!
            </p>
            <AnalogyBox emoji="🏹" title="Like adjusting your aim" text='You shoot an arrow at a target. It lands 10cm to the right. You adjust your aim a tiny bit left. Shoot again. A bit closer. Adjust again. Eventually — bullseye! Backpropagation is this "adjust based on your mistake" process, done automatically for every weight in the network.'/>
            <GradientDescentAnim/>
            <MathExplainer
              title="Loss / Error — measuring how wrong we are"
              formula="Loss = (Predicted − Actual)²  ← called MSE"
              parts={[
                {symbol:"Predicted",means:"What the model said the answer is",color:"#60a5fa"},
                {symbol:"Actual",means:"The real correct answer (from your labeled data)",color:"#34d399"},
                {symbol:"( )²",means:"We square the difference so negatives don't cancel positives. Big errors get punished more!",color:"#f472b6"},
                {symbol:"Goal",means:"Make the Loss as SMALL as possible = model is accurate!",color:"#fbbf24"},
              ]}
            />
          </div>
        ),
      },
    ],
  },
  {
    id:"evaluation", icon:"📏", title:"Measuring Model Performance", color:"#fbbf24",
    tagline:"Is your model actually good?",
    topics:[
      {
        title:"Overfitting & Underfitting",
        badge:"⚠️ must know",
        badgeColor:"#f87171",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              This is the <strong style={{color:"var(--txt0)"}}>most important concept</strong> in machine learning. Your model needs to learn the real pattern — not just memorize the training data!
            </p>
            <OverfitChart/>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:4}}>
              {[
                {title:"Underfitting fixes:",items:["Use a more complex model (more layers, more trees)","Add more features to your data","Train for more epochs","Try a different algorithm"],color:"#f87171"},
                {title:"Overfitting fixes:",items:["Get more training data (best solution!)","Simplify the model (fewer layers/trees)","Regularization (L1/L2) — penalty for complexity","Dropout — randomly turn off neurons during training","Early stopping — stop training when val score stops improving"],color:"#fbbf24"},
              ].map((s,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${s.color}08`,border:`1px solid ${s.color}20`}}>
                  <div style={{fontSize:11,fontWeight:700,color:s.color,fontFamily:"var(--fb)",marginBottom:7}}>{s.title}</div>
                  {s.items.map((item,j)=>(
                    <div key={j} style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginBottom:3,display:"flex",gap:7}}>
                      <span style={{color:s.color,flexShrink:0}}>→</span>{item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <Quiz q="Your model gets 99% on training but 60% on test. What is this?" options={["Underfitting — model is too simple","Perfect — 99% is great!","Overfitting — model memorized training data","Normal behavior"]} correct={2}/>
          </div>
        ),
      },
      {
        title:"Accuracy, Precision, Recall & F1",
        badge:"📊 metrics",
        badgeColor:"#fbbf24",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              <strong style={{color:"var(--txt0)"}}>Accuracy alone is not enough!</strong> Imagine a cancer test where 99% of people are healthy. A model that always says "healthy" is 99% accurate — but useless for finding sick people!
            </p>
            <PrecisionRecallDiagram/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:4}}>
              {[
                {metric:"Accuracy",color:"#a5b4fc",formula:"(TP+TN) / Total",simple:"What % of ALL predictions were right?",use:"When classes are balanced. Easy to understand."},
                {metric:"Precision",color:"#60a5fa",formula:"TP / (TP+FP)",simple:'When I said "YES", how often was I right?',use:"When false alarms are costly. e.g. spam filter"},
                {metric:"Recall",color:"#34d399",formula:"TP / (TP+FN)",simple:"Of all real YES cases, how many did I catch?",use:"When missing a case is costly. e.g. cancer detection"},
                {metric:"F1 Score",color:"#f472b6",formula:"2×P×R / (P+R)",simple:"Balance of precision and recall (average of both)",use:"When data is imbalanced — some classes have far fewer examples"},
              ].map((m,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <div style={{fontSize:12,fontWeight:700,color:m.color,fontFamily:"var(--fb)",marginBottom:5}}>{m.metric}</div>
                  <code style={{fontSize:10,color:"rgba(165,180,252,0.8)",fontFamily:"var(--fm)",display:"block",marginBottom:7}}>{m.formula}</code>
                  <div style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:5}}>{m.simple}</div>
                  <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fb)",fontStyle:"italic"}}>{m.use}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title:"Cross Validation — Fairer Testing",
        badge:"🔄 technique",
        badgeColor:"#60a5fa",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              What if your random split was unlucky — the test set had all the hard examples? <strong style={{color:"var(--txt0)"}}>Cross Validation</strong> solves this by testing on every part of the data, one at a time.
            </p>
            <AnalogyBox emoji="🔄" title="K-Fold Cross Validation" text="Split data into 5 equal parts. Round 1: train on parts 2,3,4,5 — test on part 1. Round 2: train on 1,3,4,5 — test on part 2. And so on. You get 5 test scores. Average them for a fair final score!"/>
            <div style={{background:"rgba(0,0,0,0.22)",border:"1px solid var(--rim1)",borderRadius:14,padding:"16px 18px"}}>
              <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12}}>5-fold cross validation</p>
              {[1,2,3,4,5].map(fold=>(
                <div key={fold} style={{display:"flex",gap:4,marginBottom:6,alignItems:"center"}}>
                  <span style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)",width:40,flexShrink:0}}>Fold {fold}</span>
                  <div style={{display:"flex",gap:3,flex:1}}>
                    {[1,2,3,4,5].map(part=>(
                      <div key={part} style={{flex:1,height:20,borderRadius:5,background:part===fold?"rgba(99,102,241,0.5)":"rgba(255,255,255,0.08)",border:`1px solid ${part===fold?"rgba(99,102,241,0.6)":"var(--rim1)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontFamily:"var(--fm)",color:part===fold?"#a5b4fc":"var(--txt3)"}}>
                        {part===fold?"TEST":"train"}
                      </div>
                    ))}
                  </div>
                  <div style={{width:32,textAlign:"right",fontSize:10,color:"#34d399",fontFamily:"var(--fm)"}}>{[88,91,85,93,89][fold-1]}%</div>
                </div>
              ))}
              <div style={{marginTop:10,padding:"8px 12px",borderRadius:8,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.2)",fontSize:11,color:"#34d399",fontFamily:"var(--fm)"}}>
                Average: 89.2% ← much more reliable than one random split!
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id:"advanced", icon:"🚀", title:"Advanced Concepts", color:"#6366f1",
    tagline:"Take ML to the next level",
    topics:[
      {
        title:"Gradient Descent — How Models Improve",
        badge:"🧮 math explained",
        badgeColor:"#a78bfa",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Gradient Descent is the algorithm that actually <strong style={{color:"var(--txt0)"}}>makes models learn</strong>. Without it, we'd have no way to improve a model's weights. It's used inside almost every ML algorithm!
            </p>
            <GradientDescentAnim/>
            <MathExplainer
              title="The update rule — memorize this concept"
              formula="new_weight = old_weight − (learning_rate × gradient)"
              parts={[
                {symbol:"gradient",means:"Which direction is 'uphill' (making things worse). We want to go the OPPOSITE direction.",color:"#f87171"},
                {symbol:"learning_rate",means:"How big of a step to take each time (usually 0.001). Too big = overshoot. Too small = too slow.",color:"#fbbf24"},
                {symbol:"result",means:"A slightly better weight. Do this millions of times for all weights = trained model!",color:"#34d399"},
              ]}
            />
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {title:"Learning Rate too HIGH 🏃‍♂️",color:"#f87171",desc:"Takes giant steps. Jumps over the minimum. Model never converges — error keeps bouncing around."},
                {title:"Learning Rate too LOW 🐢",color:"#fbbf24",desc:"Takes tiny steps. Takes forever. Gets stuck in local minimums. Training is painfully slow."},
                {title:"Learning Rate just right ✅",color:"#34d399",desc:"Takes reasonable steps. Smoothly reaches the minimum. This is what we tune for!"},
                {title:"Batch Size 📦",color:"#60a5fa",desc:"Instead of updating after every example, update after seeing a batch (e.g., 32 examples). Faster and more stable."},
              ].map((c,i)=>(
                <div key={i} style={{padding:"10px 12px",borderRadius:12,background:`${c.color}08`,border:`1px solid ${c.color}22`}}>
                  <div style={{fontSize:11,fontWeight:700,color:c.color,fontFamily:"var(--fb)",marginBottom:5}}>{c.title}</div>
                  <div style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6}}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title:"Regularization — Preventing Overfitting",
        badge:"🛡️ technique",
        badgeColor:"#6366f1",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Regularization is like adding a <strong style={{color:"var(--txt0)"}}>penalty</strong> to a model that becomes too complex. If the model tries to memorize every training example, we punish it — making it prefer simpler, more general solutions.
            </p>
            <AnalogyBox emoji="⚖️" title="The complexity tax" text='Imagine a student who memorizes every exact question from past exams. They do great on exams they have seen but fail on new questions. Regularization is like telling the student: "You will lose points for memorizing specific answers. You must understand the concepts generally!"'/>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                {
                  name:"L1 Regularization (Lasso)",color:"#60a5fa",
                  formula:"Loss + λ × Σ|weights|",
                  simple:"Adds the sum of the absolute values of all weights to the loss. This pushes some weights all the way to ZERO — effectively removing useless features!",
                  use:"Feature selection — when you suspect many features are irrelevant",
                },
                {
                  name:"L2 Regularization (Ridge)",color:"#f472b6",
                  formula:"Loss + λ × Σweights²",
                  simple:"Adds the sum of squared weights to the loss. This shrinks all weights toward zero but never reaches zero — all features stay, just smaller.",
                  use:"When all features are somewhat useful but you want to prevent any single one from dominating",
                },
                {
                  name:"Dropout (Neural Networks only)",color:"#34d399",
                  formula:"Randomly turn off p% of neurons during training",
                  simple:"During each training step, randomly ignore some neurons. This forces the network to learn multiple ways to get the right answer, not rely on specific neurons.",
                  use:"Deep learning — very effective for preventing overfitting in neural networks",
                },
              ].map((r,i)=>(
                <div key={i} style={{padding:"14px 16px",borderRadius:12,background:`${r.color}08`,border:`1px solid ${r.color}22`}}>
                  <div style={{fontFamily:"var(--fb)",fontSize:12,fontWeight:700,color:r.color,marginBottom:6}}>{r.name}</div>
                  <code style={{fontSize:11,color:"rgba(165,180,252,0.7)",fontFamily:"var(--fm)",display:"block",marginBottom:8,padding:"5px 9px",background:"rgba(0,0,0,0.2)",borderRadius:6}}>{r.formula}</code>
                  <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginBottom:6}}>{r.simple}</p>
                  <p style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fb)",fontStyle:"italic"}}>Best for: {r.use}</p>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title:"Hyperparameters — The Dials You Control",
        badge:"🎛️ tuning",
        badgeColor:"#fbbf24",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              <strong style={{color:"var(--txt0)"}}>Parameters</strong> are what the model learns (like weights). <strong style={{color:"var(--txt0)"}}>Hyperparameters</strong> are settings you choose BEFORE training — they control how the model learns.
            </p>
            <AnalogyBox emoji="🏎️" title="Like setting up a race car" text="Before the race, you tune the car: tire pressure, fuel mix, gear ratios. These are your hyperparameters. The car then runs the race on its own — that's the model learning. Wrong setup = car won't win, even if it drives perfectly!"/>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"3px",fontFamily:"var(--fm)",fontSize:11,minWidth:400}}>
                <thead>
                  <tr>
                    {["Hyperparameter","What it does","Too small","Too big","Common values"].map(h=>(
                      <td key={h} style={{padding:"7px 10px",borderRadius:6,background:"rgba(255,255,255,0.07)",color:"var(--txt1)",fontWeight:700,fontSize:10}}>{h}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Learning Rate","How fast weights update","Slow training","Unstable, overshoots","0.001, 0.01"],
                    ["Epochs","How many times to loop training data","Underfitting","Overfitting","10, 50, 100"],
                    ["Batch Size","Examples per weight update","Noisy but general","Smooth but slow","32, 64, 128"],
                    ["Trees (RF)","Number of trees in forest","Underfitting","Slow training","100, 500"],
                    ["Depth (tree)","How many questions a tree asks","Underfitting","Overfitting","3, 5, 10"],
                  ].map((row,i)=>(
                    <tr key={i}>
                      {row.map((cell,j)=>(
                        <td key={j} style={{padding:"7px 10px",borderRadius:5,background:"rgba(255,255,255,0.02)",color:j===0?"#a5b4fc":"var(--txt1)",fontFamily:j===4?"var(--fm)":"var(--fb)",fontSize:10}}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="callout callout-purple">
              <strong style={{fontSize:12,color:"#a78bfa"}}>How to tune hyperparameters:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
                <strong style={{color:"var(--txt0)"}}>Grid Search:</strong> Try every combination (e.g., all learning rates × all batch sizes). Thorough but slow.<br/>
                <strong style={{color:"var(--txt0)"}}>Random Search:</strong> Try random combinations. Surprisingly often finds good answers faster!<br/>
                <strong style={{color:"var(--txt0)"}}>Optuna / Bayesian:</strong> Smart search that learns which values work well. Best for complex models.
              </p>
            </div>
          </div>
        ),
      },
      {
        title:"Convolutional Neural Networks (CNNs) — For Images",
        badge:"🖼️ computer vision",
        badgeColor:"#60a5fa",
        content:(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
            Regular neural networks treat images as one long list of pixels. CNNs understand that images have <strong style={{color:"var(--txt0)"}}>structure</strong> — nearby pixels are related. They use "filters" that slide across the image, finding patterns like edges, shapes, textures.
          </p>
          <AnalogyBox emoji="🔍" title="Like scanning with a magnifying glass" text="You don't read a book one letter at a time. You scan with your eyes, recognizing words and patterns. CNNs scan images with filters, recognizing edges, then shapes, then objects — just like your visual cortex!"/>
          <div style={{background:"rgba(0,0,0,0.22)",border:"1px solid var(--rim1)",borderRadius:14,padding:"16px 18px"}}>
            <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12}}>How a CNN sees an image</p>
            <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{padding:"12px",borderRadius:10,background:"rgba(96,165,250,0.1)",border:"1px solid rgba(96,165,250,0.3)"}}>
                <div style={{fontSize:20,textAlign:"center",marginBottom:6}}>🔍</div>
                <div style={{fontSize:10,color:"#60a5fa",fontFamily:"var(--fm)",textAlign:"center"}}>Edge Detector</div>
                <div style={{fontSize:8,color:"var(--txt2)",fontFamily:"var(--fb)",textAlign:"center",marginTop:4}}>Finds lines & edges</div>
              </div>
              <span style={{fontSize:16,color:"var(--txt2)"}}>→</span>
              <div style={{padding:"12px",borderRadius:10,background:"rgba(167,139,250,0.1)",border:"1px solid rgba(167,139,250,0.3)"}}>
                <div style={{fontSize:20,textAlign:"center",marginBottom:6}}>📐</div>
                <div style={{fontSize:10,color:"#a78bfa",fontFamily:"var(--fm)",textAlign:"center"}}>Shape Finder</div>
                <div style={{fontSize:8,color:"var(--txt2)",fontFamily:"var(--fb)",textAlign:"center",marginTop:4}}>Combines edges into shapes</div>
              </div>
              <span style={{fontSize:16,color:"var(--txt2)"}}>→</span>
              <div style={{padding:"12px",borderRadius:10,background:"rgba(244,114,182,0.1)",border:"1px solid rgba(244,114,182,0.3)"}}>
                <div style={{fontSize:20,textAlign:"center",marginBottom:6}}>🏠</div>
                <div style={{fontSize:10,color:"#f472b6",fontFamily:"var(--fm)",textAlign:"center"}}>Object Recognizer</div>
                <div style={{fontSize:8,color:"var(--txt2)",fontFamily:"var(--fb)",textAlign:"center",marginTop:4}}>Recognizes complete objects</div>
              </div>
            </div>
          </div>
          <div className="callout callout-green">
            <strong style={{fontSize:12,color:"#34d399"}}>Why CNNs are amazing for images:</strong>
            <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
              They automatically learn features (no manual feature engineering needed). They handle translation (object can be anywhere). They work on any image size. Used in: self-driving cars, medical imaging, photo apps.
            </p>
          </div>
        </div>),
      },
      {
        title:"Recurrent Neural Networks (RNNs) — For Sequences",
        badge:"🔄 time series",
        badgeColor:"#f472b6",
        content:(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
            Regular neural networks assume all inputs are independent. RNNs remember what came before — perfect for <strong style={{color:"var(--txt0)"}}>sequences</strong> like text, time series, or music. Each step's output becomes input for the next step.
          </p>
          <AnalogyBox emoji="📖" title="Reading a sentence word by word" text="You don't understand each word in isolation. 'The cat sat on the...' — you remember 'cat' when you see 'sat', building understanding over time. RNNs do the same — they maintain a 'memory' of previous inputs."/>
          <div style={{background:"rgba(0,0,0,0.22)",border:"1px solid var(--rim1)",borderRadius:14,padding:"16px 18px"}}>
            <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12}}>RNN processing a sequence</p>
            <div style={{display:"flex",gap:8,alignItems:"center",overflowX:"auto",paddingBottom:8}}>
              {["The","cat","sat","on","the","mat"].map((word,i)=>(
                <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:60}}>
                  <div style={{padding:"8px 10px",borderRadius:8,background:`rgba(244,114,182,${0.1 + i*0.05})`,border:"1px solid rgba(244,114,182,0.3)",fontSize:11,color:"var(--txt0)",fontFamily:"var(--fm)"}}>{word}</div>
                  <div style={{width:8,height:8,borderRadius:"50%",background:"#f472b6",opacity:0.7}}/>
                  <div style={{fontSize:8,color:"var(--txt2)",fontFamily:"var(--fm)",textAlign:"center"}}>t={i+1}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,padding:"8px 12px",borderRadius:8,background:"rgba(244,114,182,0.08)",border:"1px solid rgba(244,114,182,0.2)"}}>
              <div style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)"}}>
                <strong>Memory flows:</strong> Each step combines current input with previous memory. The network learns what to remember and what to forget.
              </div>
            </div>
          </div>
          <div className="callout callout-amber">
            <strong style={{fontSize:12,color:"#fbbf24"}}>LSTM = Long Short-Term Memory:</strong>
            <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
              Basic RNNs forget quickly. LSTMs have "gates" that control what to keep in memory. They can remember patterns from 1000 steps ago! Used for: language translation, stock prediction, music generation.
            </p>
          </div>
        </div>),
      },
      {
        title:"Transformers & Attention — Modern AI Foundation",
        badge:"⚡ attention mechanism",
        badgeColor:"#34d399",
        content:(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
            Transformers revolutionized AI. Instead of processing sequences step-by-step like RNNs, they look at <strong style={{color:"var(--txt0)"}}>everything at once</strong> and learn which parts are most important to focus on (attention).
          </p>
          <AnalogyBox emoji="👀" title="Reading with perfect memory" text="When translating 'I saw a cat on the mat', you don't process word-by-word. You instantly see all words and focus on relationships: 'saw' connects to 'I' and 'cat', 'on' connects 'cat' and 'mat'. Attention lets the model do this instantly!"/>
          <div style={{background:"rgba(0,0,0,0.22)",border:"1px solid var(--rim1)",borderRadius:14,padding:"16px 18px"}}>
            <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12}}>Attention in action</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"12px",borderRadius:10,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#34d399",fontFamily:"var(--fb)",marginBottom:8}}>Input Sentence</div>
                <div style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fm)",lineHeight:1.6}}>
                  "The cat sat on the mat"
                </div>
              </div>
              <div style={{padding:"12px",borderRadius:10,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#6366f1",fontFamily:"var(--fb)",marginBottom:8}}>Attention Weights</div>
                <div style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fm)",lineHeight:1.6}}>
                  cat↔sat: 0.9<br/>cat↔mat: 0.7<br/>on↔mat: 0.8
                </div>
              </div>
            </div>
          </div>
          <div className="callout callout-blue">
            <strong style={{fontSize:12,color:"#60a5fa"}}>Why transformers are game-changing:</strong>
            <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
              Parallel processing (much faster training). Long-range dependencies (remembers distant context). Foundation for: GPT, BERT, DALL-E, all modern AI. Attention is what lets AI understand context and relationships.
            </p>
          </div>
        </div>),
      },
      {
        title:"Generative Adversarial Networks (GANs) — Creating New Data",
        badge:"🎨 generative AI",
        badgeColor:"#a78bfa",
        content:(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
            GANs have two networks fighting each other: a <strong style={{color:"var(--txt0)"}}>Generator</strong> that creates fake data, and a <strong style={{color:"var(--txt0)"}}>Discriminator</strong> that tries to tell real from fake. They improve until the fake is indistinguishable from real!
          </p>
          <AnalogyBox emoji="🎭" title="Art forger vs art expert" text="A forger creates fake paintings. An expert tries to spot fakes. They both get better — forger makes more convincing fakes, expert gets better at detecting. Eventually, the forger creates masterpieces that fool everyone!"/>
          <div style={{background:"rgba(0,0,0,0.22)",border:"1px solid var(--rim1)",borderRadius:14,padding:"16px 18px"}}>
            <p style={{fontSize:11,color:"var(--txt2)",fontFamily:"var(--fm)",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:12}}>The GAN training loop</p>
            <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{padding:"12px",borderRadius:10,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.3)",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:6}}>🎨</div>
                <div style={{fontSize:11,fontWeight:700,color:"#34d399",fontFamily:"var(--fb)"}}>Generator</div>
                <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fb)",marginTop:4}}>Creates fake images</div>
              </div>
              <div style={{fontSize:16,color:"var(--txt1)"}}>⚔️</div>
              <div style={{padding:"12px",borderRadius:10,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:6}}>🔍</div>
                <div style={{fontSize:11,fontWeight:700,color:"#f87171",fontFamily:"var(--fb)"}}>Discriminator</div>
                <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fb)",marginTop:4}}>Tells real from fake</div>
              </div>
              <div style={{fontSize:16,color:"var(--txt1)"}}>→</div>
              <div style={{padding:"12px",borderRadius:10,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.3)",textAlign:"center"}}>
                <div style={{fontSize:20,marginBottom:6}}>✨</div>
                <div style={{fontSize:11,fontWeight:700,color:"#fbbf24",fontFamily:"var(--fb)"}}>Result</div>
                <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fb)",marginTop:4}}>Perfect fakes!</div>
              </div>
            </div>
          </div>
          <div className="callout callout-purple">
            <strong style={{fontSize:12,color:"#a78bfa"}}>GAN applications:</strong>
            <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
              Deepfakes, photo enhancement, style transfer (turn photo into painting), drug discovery (generate new molecules), super-resolution (make blurry images sharp).
            </p>
          </div>
        </div>),
      },
      {
        title:"Transfer Learning — Reuse Pre-trained Models",
        badge:"🔄 efficiency",
        badgeColor:"#fbbf24",
        content:(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
            Training models from scratch takes huge datasets and weeks of computing. <strong style={{color:"var(--txt0)"}}>Transfer learning</strong> takes a model trained on millions of images (like ImageNet) and fine-tunes it for your specific task with just hundreds of examples.
          </p>
          <AnalogyBox emoji="📚" title="Learning from textbooks vs learning from scratch" text="Instead of learning every subject from basic principles, you read textbooks that contain distilled knowledge from experts. Transfer learning = using a 'textbook' of features learned from huge datasets, then adapting it to your specific problem."/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {title:"Without Transfer Learning",color:"#f87171",items:["Train from random weights","Need 100k+ images","Takes days/weeks","Expensive compute"]},
              {title:"With Transfer Learning",color:"#34d399",items:["Start from pre-trained weights","Need 100-1000 images","Takes hours","Cheap & fast"]},
            ].map((col,i)=>(
              <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${col.color}08`,border:`1px solid ${col.color}20`}}>
                <div style={{fontSize:11,fontWeight:700,color:col.color,fontFamily:"var(--fb)",marginBottom:8}}>{col.title}</div>
                {col.items.map((item,j)=>(
                  <div key={j} style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:4}}>• {item}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="callout callout-green">
            <strong style={{fontSize:12,color:"#34d399"}}>How to do transfer learning:</strong>
            <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
              Freeze early layers (they have general features like edges). Train only the last few layers on your data. This adapts the model to your specific task while keeping the powerful general features.
            </p>
          </div>
        </div>),
      },
      {
        title:"Model Interpretability — Understanding Predictions",
        badge:"🔍 explainability",
        badgeColor:"#2dd4bf",
        content:(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
            Neural networks are "black boxes" — they make great predictions but you don't know why. <strong style={{color:"var(--txt0)"}}>Interpretability techniques</strong> help explain what the model is looking at and why it makes certain decisions.
          </p>
          <AnalogyBox emoji="🕵️" title="Getting inside the model's head" text="Your doctor says 'you have a cold'. You want to know WHY — what symptoms led to that diagnosis? Interpretability tools show you which pixels or features the model focused on for its prediction."/>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {name:"SHAP Values",color:"#60a5fa",desc:"Shows how much each feature contributes to the prediction. Like: 'Age +15 years increased risk by 20%'"},
              {name:"LIME",color:"#f472b6",desc:"Creates simple explanations for complex models. Explains individual predictions."},
              {name:"Feature Importance",color:"#34d399",desc:"Ranks which features the model considers most important overall."},
              {name:"Saliency Maps",color:"#fbbf24",desc:"For images: highlights which pixels were most important for the classification."},
            ].map((tool,i)=>(
              <div key={i} style={{padding:"10px 12px",borderRadius:10,background:`${tool.color}08`,border:`1px solid ${tool.color}22`}}>
                <div style={{fontSize:11,fontWeight:700,color:tool.color,fontFamily:"var(--fb)",marginBottom:4}}>{tool.name}</div>
                <div style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6}}>{tool.desc}</div>
              </div>
            ))}
          </div>
          <div className="callout callout-blue">
            <strong style={{fontSize:12,color:"#60a5fa"}}>Why interpretability matters:</strong>
            <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
              Trust (doctors won't use AI they can't understand), debugging (find why model fails), fairness (detect bias), regulation (GDPR requires explanations).
            </p>
          </div>
        </div>),
      },
      {
        title:"Ethics in Machine Learning",
        badge:"⚖️ responsible AI",
        badgeColor:"#6366f1",
        content:(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
            ML can be incredibly powerful, but it can also cause harm if not used responsibly. <strong style={{color:"var(--txt0)"}}>AI Ethics</strong> is about ensuring ML benefits everyone and doesn't create unfairness or harm.
          </p>
          <AnalogyBox emoji="⚖️" title="AI as a superpower" text="Superpowers are amazing, but they can be dangerous if misused. Spider-Man's webs can save lives or cause accidents. ML is a superpower — we need ethical guidelines to ensure it's used for good, not harm."/>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {issue:"Bias & Fairness",emoji:"⚖️",color:"#f87171",desc:"Models can inherit biases from training data. A resume screener might unfairly reject women if trained on mostly male hires.",fix:"Audit datasets for bias, use fairness-aware algorithms, test on diverse groups."},
              {issue:"Privacy",emoji:"🔒",color:"#fbbf24",desc:"ML often needs personal data. But collecting too much can violate privacy.",fix:"Use federated learning (train on device without sending data), differential privacy (add noise to protect individuals)."},
              {issue:"Transparency",emoji:"👀",color:"#34d399",desc:"Black box models make decisions we can't explain. This is problematic in healthcare or criminal justice.",fix:"Use interpretable models when possible, develop explainability tools."},
              {issue:"Job Displacement",emoji:"👷",color:"#a78bfa",desc:"Automation can eliminate jobs. Self-driving trucks could displace millions of drivers.",fix:"Reskill workers, create new job types, implement transition policies."},
              {issue:"Misinformation",emoji:"📰",color:"#f472b6",desc:"Deepfakes and AI-generated content can spread false information at scale.",fix:"Watermark AI content, develop detection tools, educate about AI capabilities."},
            ].map((eth,i)=>(
              <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${eth.color}08`,border:`1px solid ${eth.color}22`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontSize:18}}>{eth.emoji}</span>
                  <span style={{fontSize:12,fontWeight:700,color:eth.color,fontFamily:"var(--fb)"}}>{eth.issue}</span>
                </div>
                <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginBottom:6}}>{eth.desc}</p>
                <div style={{fontSize:11,color:eth.color,fontFamily:"var(--fb)",fontStyle:"italic"}}>Solution: {eth.fix}</div>
              </div>
            ))}
          </div>
        </div>),
      },
      {
        title:"MLOps — ML in Production",
        badge:"🔧 engineering",
        badgeColor:"#2dd4bf",
        content:(<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
            <strong style={{color:"var(--txt0)"}}>MLOps</strong> (Machine Learning Operations) is like DevOps but for ML models. It handles the entire ML lifecycle: from development to deployment to monitoring in production.
          </p>
          <AnalogyBox emoji="🏭" title="ML factory assembly line" text="Building one model is like making one car by hand. MLOps is setting up a factory that can build, test, and deploy new models automatically. It ensures quality, reliability, and speed at scale."/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {phase:"Development",color:"#60a5fa",items:["Version control for data & code","Automated testing","Experiment tracking","Model registry"]},
              {phase:"Deployment",color:"#f472b6",items:["CI/CD pipelines","Model serving (APIs)","A/B testing","Rollback strategies"]},
              {phase:"Monitoring",color:"#34d399",items:["Performance metrics","Data drift detection","Model retraining","Alerting systems"]},
              {phase:"Governance",color:"#fbbf24",items:["Model documentation","Audit trails","Compliance","Security"]},
            ].map((p,i)=>(
              <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${p.color}08`,border:`1px solid ${p.color}20`}}>
                <div style={{fontSize:11,fontWeight:700,color:p.color,fontFamily:"var(--fb)",marginBottom:8}}>{p.phase}</div>
                {p.items.map((item,j)=>(
                  <div key={j} style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:4}}>• {item}</div>
                ))}
              </div>
            ))}
          </div>
          <div className="callout callout-green">
            <strong style={{fontSize:12,color:"#34d399"}}>Popular MLOps tools:</strong>
            <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>
              <strong>MLflow:</strong> Experiment tracking & model registry<br/>
              <strong>Kubeflow:</strong> ML pipelines on Kubernetes<br/>
              <strong>DVC:</strong> Data version control<br/>
              <strong>Weights & Biases:</strong> Experiment tracking & visualization
            </p>
          </div>
        </div>),
      },
    ],
  },
  {
    id:"encoding", icon:"🔧", title:"Encoding & Feature Engineering", color:"#f59e0b",
    tagline:"Transform raw data into ML-ready features",
    topics:[
      {
        title:"Categorical Encoding — Converting Text to Numbers",
        badge:`${ICONS.code} preprocessing`,
        badgeColor:"#f59e0b",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              ML algorithms need numbers, but real data has text categories like "Red", "Blue", "Green" or "Bachelor's", "Master's", "PhD". <strong style={{color:"var(--txt0)"}}>Encoding</strong> converts these to numbers while preserving meaning.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Label Encoding</div>
                <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:12}}>
                  Assigns each category a number: Red=0, Blue=1, Green=2. Simple but implies order where none exists.
                </p>
                <div style={{overflowX:"auto",marginTop:12}}>
                  <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"3px",fontFamily:"var(--fm)",fontSize:10,minWidth:200}}>
                    <thead>
                      <tr>
                        {["Color","Encoded"].map((h,i)=>(
                          <td key={i} style={{padding:"6px 8px",borderRadius:4,background:"rgba(255,255,255,0.07)",color:"var(--txt1)",fontWeight:700,textAlign:"center"}}>{h}</td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Red",0],
                        ["Blue",1],
                        ["Green",2]
                      ].map((row,i)=>(
                        <tr key={i}>
                          {row.map((cell,j)=>(
                            <td key={j} style={{padding:"5px 8px",borderRadius:3,background:"rgba(255,255,255,0.03)",color:"var(--txt1)",textAlign:"center"}}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)",marginTop:8}}>
                  <strong>Problem:</strong> Algorithm thinks Green (2) > Blue (1) > Red (0)
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>One-Hot Encoding</div>
                <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginBottom:12}}>
                  Creates binary columns for each category. No false ordering, but increases dimensionality.
                </p>
                <div style={{overflowX:"auto",marginTop:12}}>
                  <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"2px",fontFamily:"var(--fm)",fontSize:9,minWidth:250}}>
                    <thead>
                      <tr>
                        {["Color","Red","Blue","Green"].map((h,i)=>(
                          <td key={i} style={{padding:"4px 6px",borderRadius:3,background:"rgba(255,255,255,0.07)",color:"var(--txt1)",fontWeight:700,textAlign:"center"}}>{h}</td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Red",1,0,0],
                        ["Blue",0,1,0],
                        ["Green",0,0,1]
                      ].map((row,i)=>(
                        <tr key={i}>
                          {row.map((cell,j)=>(
                            <td key={j} style={{padding:"4px 6px",borderRadius:2,background:"rgba(255,255,255,0.03)",color:"var(--txt1)",textAlign:"center"}}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{fontSize:10,color:"var(--txt2)",fontFamily:"var(--fm)",marginTop:8}}>
                  <strong>Advantage:</strong> No ordering assumption, each category independent
                </div>
              </div>
            </div>

            <div style={{padding:"16px",borderRadius:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Advanced Encoding Techniques</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[
                  {
                    name:"Target Encoding",
                    description:"Replace category with average target value for that category",
                    example:"'Bachelor's' → 0.75 (75% of Bachelor's get promoted)",
                    use:"When categories have strong relationship with target",
                    icon:"🎯"
                  },
                  {
                    name:"Frequency Encoding",
                    description:"Replace category with how often it appears in data",
                    example:"'Rare category' → 0.02 (appears in 2% of data)",
                    use:"When category frequency is informative",
                    icon:"📊"
                  },
                  {
                    name:"Binary Encoding",
                    description:"Convert category to binary, then split into separate columns",
                    example:"Category 5 → 101 → columns: [1,0,1]",
                    use:"Memory efficient alternative to one-hot",
                    icon:"🔢"
                  }
                ].map((enc,i)=>(
                  <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(245,158,11,0.1)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:16}}>{enc.icon}</span>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{enc.name}</div>
                      </div>
                    </div>
                    <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{enc.description}</p>
                    <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                      <strong>Example:</strong> {enc.example}<br/>
                      <strong>Use:</strong> {enc.use}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <AnalogyBox icon={ICONS.code} title="Like Translating Languages" text="Label encoding is like assigning numbers to words in a dictionary. One-hot encoding is like creating a separate flag for each word. Target encoding is like using the meaning/context of words to represent them."/>

            <Quiz q="When should you use one-hot encoding instead of label encoding?" options={["When categories have natural order","When categories are nominal (no order)","When you have many categories","When memory is limited"] correct={1}/>
          </div>
        ),
      },
      {
        title:"Feature Engineering — Creating Better Features",
        badge:`${ICONS.lightbulb} creativity`,
        badgeColor:"#f59e0b",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Raw data is rarely perfect for ML. <strong style={{color:"var(--txt0)"}}>Feature engineering</strong> creates new features that better represent the underlying patterns, often making the difference between a good and great model.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Numerical Features</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {name:"Log Transform",desc:"log(x+1) for skewed data",why:"Makes exponential relationships linear"},
                    {name:"Standardization",desc:"(x - mean) / std",why:"Centers data, handles different scales"},
                    {name:"Binning",desc:"Group continuous values into categories",why:"Captures non-linear patterns"},
                    {name:"Polynomial Features",desc:"x², x³, xy combinations",why:"Captures complex relationships"}
                  ].map((feat,i)=>(
                    <div key={i} style={{padding:"8px 10px",borderRadius:6,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:2}}>{feat.name}</div>
                      <div style={{fontSize:9,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:2}}>{feat.desc}</div>
                      <div style={{fontSize:9,color:"var(--txt2)"}}>{feat.why}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Categorical Features</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {name:"Grouping",desc:"Combine rare categories",why:"Reduces noise, prevents overfitting"},
                    {name:"Ordinal Encoding",desc:"Low=1, Medium=2, High=3",why:"Preserves order information"},
                    {name:"Count Encoding",desc:"Replace with frequency counts",why:"Captures popularity/rarity"},
                    {name:"Interaction Features",desc:"Combine categories: 'Young+Urban'",why:"Captures combined effects"}
                  ].map((feat,i)=>(
                    <div key={i} style={{padding:"8px 10px",borderRadius:6,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:2}}>{feat.name}</div>
                      <div style={{fontSize:9,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:2}}>{feat.desc}</div>
                      <div style={{fontSize:9,color:"var(--txt2)"}}>{feat.why}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{padding:"16px",borderRadius:12,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#f59e0b",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Domain-Specific Features</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {[
                  {domain:"Finance",features:["Debt-to-Income Ratio","Payment History Score","Credit Utilization"],icon:"💰"},
                  {domain:"E-commerce",features:["Purchase Frequency","Cart Abandonment Rate","Product Similarity Score"],icon:"🛒"},
                  {domain:"Healthcare",features:["BMI Categories","Age Groups","Symptom Combinations"],icon:"🏥"},
                  {domain:"Marketing",features:["Customer Lifetime Value","Engagement Score","Channel Preferences"],icon:"📢"},
                  {domain:"Real Estate",features:["Price per Square Foot","Location Score","Property Age Groups"],icon:"🏠"},
                  {domain:"Transportation",features:["Speed Categories","Route Efficiency","Time of Day Groups"],icon:"🚗"}
                ].map((dom,i)=>(
                  <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(245,158,11,0.1)",textAlign:"center"}}>
                    <div style={{fontSize:16,marginBottom:6}}>{dom.icon}</div>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:6}}>{dom.domain}</div>
                    <div style={{fontSize:9,color:"var(--txt2)",lineHeight:1.3}}>
                      {dom.features.map((f,j)=><div key={j}>• {f}</div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="callout callout-amber">
              <strong style={{fontSize:12,color:"#f59e0b"}}>Feature Engineering Best Practices:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Understand your domain:</strong> Talk to experts to find meaningful features</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Iterate and test:</strong> Create features, train model, measure improvement</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Handle missing data:</strong> Don't just drop — impute or create "missing" indicators</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Feature selection:</strong> Remove redundant features to prevent overfitting</div>
                </div>
              </div>
            </div>

            <AnalogyBox icon={ICONS.lightbulb} title="Like Cooking Ingredients" text="Raw ingredients (data) need preparation to become delicious. Chopping, mixing, seasoning — that's feature engineering. A great chef knows how to combine ingredients creatively to make something amazing."/>

            <Quiz q="What is the main goal of feature engineering?" options={["Make data look pretty","Create features that help algorithms learn patterns better","Reduce file size","Add more data points"] correct={1}/>
          </div>
        ),
      },
    ],
  },
  {
    id:"modeling", icon:"🤖", title:"Modeling Algorithms", color:"#10b981",
    tagline:"The algorithms that power machine learning",
    topics:[
      {
        title:"Supervised Learning Algorithms",
        badge:`${ICONS.goal} prediction`,
        badgeColor:"#10b981",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Supervised learning algorithms learn from labeled data to make predictions. They find patterns in input-output pairs and use those patterns to predict outputs for new inputs.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#10b981",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Regression Algorithms</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"Linear Regression",
                      description:"Fits a straight line to predict continuous values",
                      formula:"y = mx + b",
                      use:"Predicting prices, scores, measurements",
                      icon:"📈",
                      pros:"Simple, interpretable, fast",
                      cons:"Assumes linear relationship"
                    },
                    {
                      name:"Polynomial Regression",
                      description:"Fits curved lines using polynomial terms",
                      formula:"y = a + bx + cx² + dx³",
                      use:"Non-linear relationships",
                      icon:"📊",
                      pros:"Handles curves",
                      cons:"Can overfit easily"
                    },
                    {
                      name:"Ridge Regression",
                      description:"Linear regression with L2 regularization",
                      formula:"min Σ(yᵢ - ŷᵢ)² + λΣwⱼ²",
                      use:"Prevent overfitting, handle multicollinearity",
                      icon:"🛡️",
                      pros:"Reduces overfitting",
                      cons:"Less interpretable"
                    },
                    {
                      name:"Lasso Regression",
                      description:"Linear regression with L1 regularization",
                      formula:"min Σ(yᵢ - ŷᵢ)² + λΣ|wⱼ|",
                      use:"Feature selection, sparse models",
                      icon:"🎯",
                      pros:"Automatic feature selection",
                      cons:"Can be unstable"
                    }
                  ].map((alg,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(16,185,129,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{alg.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{alg.name}</div>
                          <div style={{fontSize:10,color:"#10b981",fontFamily:"var(--fm)"}}>{alg.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{alg.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {alg.use}<br/>
                        <strong>Pros:</strong> {alg.pros}<br/>
                        <strong>Cons:</strong> {alg.cons}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#10b981",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Classification Algorithms</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"Logistic Regression",
                      description:"Predicts probability of binary outcomes",
                      formula:"P(y=1) = 1/(1+e^(-z))",
                      use:"Binary classification, probability estimates",
                      icon:"📊",
                      pros:"Interpretable, outputs probabilities",
                      cons:"Assumes linear decision boundary"
                    },
                    {
                      name:"Decision Trees",
                      description:"Tree-like model of decisions and outcomes",
                      formula:"Series of if-then-else rules",
                      use:"Classification and regression, interpretable models",
                      icon:"🌳",
                      pros:"Easy to understand, handles mixed data",
                      cons:"Can overfit, unstable"
                    },
                    {
                      name:"Random Forest",
                      description:"Ensemble of many decision trees",
                      formula:"Average of many tree predictions",
                      use:"High accuracy, handles missing data",
                      icon:"🌲",
                      pros:"Accurate, robust to overfitting",
                      cons:"Less interpretable, slower"
                    },
                    {
                      name:"Support Vector Machines",
                      description:"Finds optimal hyperplane for separation",
                      formula:"max margin classifier",
                      use:"High-dimensional data, non-linear classification",
                      icon:"📏",
                      pros:"Effective in high dimensions",
                      cons:"Slow on large datasets"
                    }
                  ].map((alg,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(16,185,129,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{alg.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{alg.name}</div>
                          <div style={{fontSize:10,color:"#10b981",fontFamily:"var(--fm)"}}>{alg.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{alg.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {alg.use}<br/>
                        <strong>Pros:</strong> {alg.pros}<br/>
                        <strong>Cons:</strong> {alg.cons}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="callout callout-green">
              <strong style={{fontSize:12,color:"#10b981"}}>Algorithm Selection Guide:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Start simple:</strong> Linear/Logistic regression as baseline</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Tree-based for tabular data:</strong> Random Forest, XGBoost</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Neural networks for:</strong> Images, text, complex patterns</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>SVM for:</strong> Small datasets, text classification</div>
                </div>
              </div>
            </div>

            <AnalogyBox icon={ICONS.robot} title="Like Learning Different Skills" text="Linear regression is like learning basic arithmetic. Decision trees are like following flowcharts. Neural networks are like learning complex strategies through experience. Each algorithm has its strengths for different types of problems."/>

            <Quiz q="Which algorithm is best for interpretable models that can handle both numerical and categorical data?" options={["Neural Networks","Support Vector Machines","Decision Trees","Linear Regression"] correct={2}/>
          </div>
        ),
      },
      {
        title:"Unsupervised Learning Algorithms",
        badge:`${ICONS.focus} patterns`,
        badgeColor:"#10b981",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Unsupervised learning finds hidden patterns in data without labeled examples. These algorithms discover structure, groupings, and relationships on their own.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#10b981",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Clustering Algorithms</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"K-Means Clustering",
                      description:"Partitions data into k clusters by minimizing distance to centroids",
                      formula:"min Σ Σ ||xᵢ - μⱼ||²",
                      use:"Customer segmentation, image compression",
                      icon:"🎯",
                      pros:"Simple, scalable, fast",
                      cons:"Needs k specified, sensitive to initialization"
                    },
                    {
                      name:"Hierarchical Clustering",
                      description:"Builds tree of clusters by successively merging or splitting",
                      formula:"Agglomerative/Divisive approaches",
                      use:"Taxonomy creation, understanding data structure",
                      icon:"🌳",
                      pros:"No need to specify k, creates hierarchy",
                      cons:"Slow on large datasets, can't undo merges"
                    },
                    {
                      name:"DBSCAN",
                      description:"Density-based clustering that finds arbitrary shaped clusters",
                      formula:"Core points, reachable points, outliers",
                      use:"Spatial data, anomaly detection",
                      icon:"🔍",
                      pros:"Finds arbitrary shapes, handles noise",
                      cons:"Struggles with varying densities"
                    },
                    {
                      name:"Gaussian Mixture Models",
                      description:"Probabilistic model assuming data from mixture of Gaussians",
                      formula:"P(x) = Σ πₖ N(x|μₖ,Σₖ)",
                      use:"Soft clustering, density estimation",
                      icon:"📊",
                      pros:"Soft assignments, probabilistic",
                      cons:"Assumes Gaussian distributions"
                    }
                  ].map((alg,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(16,185,129,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{alg.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{alg.name}</div>
                          <div style={{fontSize:10,color:"#10b981",fontFamily:"var(--fm)"}}>{alg.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{alg.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {alg.use}<br/>
                        <strong>Pros:</strong> {alg.pros}<br/>
                        <strong>Cons:</strong> {alg.cons}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#10b981",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Dimensionality Reduction</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"Principal Component Analysis (PCA)",
                      description:"Finds directions of maximum variance in data",
                      formula:"Eigenvalue decomposition of covariance matrix",
                      use:"Data visualization, noise reduction, feature extraction",
                      icon:"📉",
                      pros:"Unsupervised, preserves variance",
                      cons:"Linear method, hard to interpret"
                    },
                    {
                      name:"t-SNE",
                      description:"Non-linear dimensionality reduction for visualization",
                      formula:"Minimizes KL divergence between distributions",
                      use:"High-dimensional data visualization",
                      icon:"🎨",
                      pros:"Preserves local structure, great for viz",
                      cons:"Slow, stochastic, not for production"
                    },
                    {
                      name:"Autoencoders",
                      description:"Neural networks that learn efficient data representations",
                      formula:"Encoder → Bottleneck → Decoder",
                      use:"Feature learning, denoising, generation",
                      icon:"🧠",
                      pros:"Non-linear, learns features automatically",
                      cons:"Requires lots of data, complex"
                    },
                    {
                      name:"UMAP",
                      description:"Uniform Manifold Approximation and Projection",
                      formula:"Topological data analysis approach",
                      use:"Fast dimensionality reduction, preserves structure",
                      icon:"🗺️",
                      pros:"Fast, preserves global structure",
                      cons:"Newer method, less proven"
                    }
                  ].map((alg,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(16,185,129,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{alg.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{alg.name}</div>
                          <div style={{fontSize:10,color:"#10b981",fontFamily:"var(--fm)"}}>{alg.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{alg.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {alg.use}<br/>
                        <strong>Pros:</strong> {alg.pros}<br/>
                        <strong>Cons:</strong> {alg.cons}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="callout callout-blue">
              <strong style={{fontSize:12,color:"#10b981"}}>Unsupervised Learning Applications:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Customer segmentation:</strong> Group customers by behavior</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Anomaly detection:</strong> Find unusual patterns</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Recommendation systems:</strong> Find similar items/users</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Data compression:</strong> Reduce dimensionality</div>
                </div>
              </div>
            </div>

            <AnalogyBox icon={ICONS.focus} title="Like Exploring Unknown Territory" text="Supervised learning is like following a map with marked destinations. Unsupervised learning is like exploring a new land without a map, discovering rivers, mountains, and natural boundaries on your own."/>

            <Quiz q="Which clustering algorithm can find clusters of arbitrary shapes and handle noise?" options={["K-Means","Hierarchical Clustering","DBSCAN","Gaussian Mixture Models"] correct={2}/>
          </div>
        ),
      },
    ],
  },
  {
    id:"evaluation", icon:"📊", title:"Model Evaluation", color:"#8b5cf6",
    tagline:"Measuring how well your model performs",
    topics:[
      {
        title:"Evaluating Classification Models",
        badge:`${ICONS.check} metrics`,
        badgeColor:"#8b5cf6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Model evaluation tells you how well your model performs. Different metrics matter for different problems — accuracy alone is often misleading, especially with imbalanced data.
            </p>

            <div style={{padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Confusion Matrix — The Foundation</div>
              <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:16,alignItems:"center"}}>
                <div style={{background:"rgba(0,0,0,0.2)",borderRadius:8,padding:"16px",textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:700,color:"var(--txt0)",marginBottom:8}}>Predicted</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2}}>
                    <div style={{padding:"8px",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:4}}>
                      <div style={{fontSize:10,color:"#22c55e",fontWeight:700}}>TP</div>
                      <div style={{fontSize:8,color:"var(--txt2)"}}>True Positive</div>
                    </div>
                    <div style={{padding:"8px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:4}}>
                      <div style={{fontSize:10,color:"#ef4444",fontWeight:700}}>FP</div>
                      <div style={{fontSize:8,color:"var(--txt2)"}}>False Positive</div>
                    </div>
                    <div style={{padding:"8px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:4}}>
                      <div style={{fontSize:10,color:"#ef4444",fontWeight:700}}>FN</div>
                      <div style={{fontSize:8,color:"var(--txt2)"}}>False Negative</div>
                    </div>
                    <div style={{padding:"8px",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:4}}>
                      <div style={{fontSize:10,color:"#22c55e",fontWeight:700}}>TN</div>
                      <div style={{fontSize:8,color:"var(--txt2)"}}>True Negative</div>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"var(--txt2)",marginTop:8,textTransform:"uppercase",letterSpacing:"0.05em"}}>Actual</div>
                </div>
                <div style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6}}>
                  <strong>TP (True Positive):</strong> Correctly predicted positive cases<br/>
                  <strong>FP (False Positive):</strong> Incorrectly predicted positive (Type I error)<br/>
                  <strong>FN (False Negative):</strong> Incorrectly predicted negative (Type II error)<br/>
                  <strong>TN (True Negative):</strong> Correctly predicted negative cases
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Key Classification Metrics</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {metric:"Accuracy",formula:"(TP+TN) / Total",desc:"What % of ALL predictions were right?",when:"Balanced classes, equal cost of errors"},
                    {metric:"Precision",formula:"TP / (TP+FP)",desc:'When I said "YES", how often was I right?',when:"False positives are costly"},
                    {metric:"Recall",formula:"TP / (TP+FN)",desc:"Of all real YES cases, how many did I catch?",when:"False negatives are costly"},
                    {metric:"F1 Score",formula:"2×P×R / (P+R)",desc:"Balance of precision and recall",when:"Imbalanced data, need single metric"},
                    {metric:"AUC-ROC",formula:"Area under ROC curve",desc:"How well model ranks positive cases higher",when:"Ranking/ranking quality matters"}
                  ].map((m,i)=>(
                    <div key={i} style={{padding:"10px",borderRadius:6,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:2}}>{m.metric}</div>
                      <code style={{fontSize:9,color:"#8b5cf6",fontFamily:"var(--fm)",display:"block",marginBottom:3}}>{m.formula}</code>
                      <div style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:2}}>{m.desc}</div>
                      <div style={{fontSize:9,color:"var(--txt2)"}}><strong>When to use:</strong> {m.when}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Real-World Examples</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {scenario:"Medical Diagnosis",important:"Recall (catch all sick patients)",why:"Missing sick patient is dangerous"},
                    {scenario:"Spam Detection",important:"Precision (don't delete good emails)",why:"False positive frustrates users"},
                    {scenario:"Fraud Detection",important:"Precision + Recall balance",why:"Both false positives and negatives costly"},
                    {scenario:"Weather Prediction",important:"Accuracy (general correctness)",why:"Costs of errors are similar"}
                  ].map((ex,i)=>(
                    <div key={i} style={{padding:"10px",borderRadius:6,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:3}}>{ex.scenario}</div>
                      <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:2}}>{ex.important}</div>
                      <div style={{fontSize:9,color:"var(--txt2)"}}>{ex.why}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="callout callout-purple">
              <strong style={{fontSize:12,color:"#8b5cf6"}}>Evaluation Best Practices:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Never evaluate on training data:</strong> Always use separate test set</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Use cross-validation:</strong> More reliable than single train/test split</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Choose metrics based on business impact:</strong> Not just accuracy</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Consider baseline:</strong> Compare to simple rules or random guessing</div>
                </div>
              </div>
            </div>

            <AnalogyBox icon={ICONS.check} title="Like Grading a Test" text="Accuracy is like counting correct answers. Precision is like checking if you only marked correct answers. Recall is like checking if you found all correct answers. F1 is the overall grade considering both."/>

            <Quiz q="When should you prefer recall over precision?" options={["When false positives are expensive","When false negatives are expensive","When you have balanced data","When accuracy is most important"] correct={1}/>
          </div>
        ),
      },
      {
        title:"Evaluating Regression Models",
        badge:`${ICONS.chart} errors`,
        badgeColor:"#8b5cf6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Regression evaluation measures how close your predictions are to the actual values. Different metrics emphasize different aspects of prediction quality.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Error-Based Metrics</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"Mean Absolute Error (MAE)",
                      formula:"MAE = (1/n) Σ |yᵢ - ŷᵢ|",
                      description:"Average absolute difference between predicted and actual",
                      use:"Easy to interpret, robust to outliers",
                      example:"Predictions: [100, 200, 300] Actual: [110, 190, 310] → MAE = 10",
                      icon:"📏"
                    },
                    {
                      name:"Mean Squared Error (MSE)",
                      formula:"MSE = (1/n) Σ (yᵢ - ŷᵢ)²",
                      description:"Average of squared differences",
                      use:"Penalizes large errors more, mathematical properties",
                      example:"Same data → MSE = 100",
                      icon:"📐"
                    },
                    {
                      name:"Root Mean Squared Error (RMSE)",
                      formula:"RMSE = √MSE",
                      description:"Square root of MSE, same units as target",
                      use:"Most common metric, interpretable units",
                      example:"Same data → RMSE ≈ 10",
                      icon:"📊"
                    },
                    {
                      name:"Mean Absolute Percentage Error (MAPE)",
                      formula:"MAPE = (100/n) Σ |(yᵢ - ŷᵢ)/yᵢ|",
                      description:"Average percentage error",
                      use:"Relative error, compare across different scales",
                      example:"Same data → MAPE ≈ 4.3%",
                      icon:"📈"
                    }
                  ].map((metric,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(139,92,246,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{metric.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{metric.name}</div>
                          <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"var(--fm)"}}>{metric.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{metric.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {metric.use}<br/>
                        <strong>Example:</strong> {metric.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#8b5cf6",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Relative Metrics</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      name:"R² Score (Coefficient of Determination)",
                      formula:"R² = 1 - (SS_res / SS_tot)",
                      description:"Proportion of variance explained by model",
                      use:"How much better than mean prediction",
                      interpretation:"0.8 means 80% of variation explained",
                      icon:"🎯"
                    },
                    {
                      name:"Adjusted R²",
                      formula:"R²_adj = 1 - ((1-R²)(n-1))/(n-p-1)",
                      description:"R² adjusted for number of features",
                      use:"Comparing models with different features",
                      interpretation:"Penalizes adding useless features",
                      icon:"⚖️"
                    },
                    {
                      name:"Explained Variance Score",
                      formula:"1 - (Var(y - ŷ) / Var(y))",
                      description:"How much variance is explained",
                      use:"Similar to R² but can be negative",
                      interpretation:"Negative means worse than mean",
                      icon:"📊"
                    }
                  ].map((metric,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(139,92,246,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{metric.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{metric.name}</div>
                          <div style={{fontSize:10,color:"#8b5cf6",fontFamily:"var(--fm)"}}>{metric.formula}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{metric.description}</p>
                      <div style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)"}}>
                        <strong>Use:</strong> {metric.use}<br/>
                        <strong>Interpretation:</strong> {metric.interpretation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="callout callout-amber">
              <strong style={{fontSize:12,color:"#f59e0b"}}>Choosing the Right Metric:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Use MAE when:</strong> All errors are equally important, outliers present</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Use RMSE when:</strong> Large errors are particularly bad, normal distribution</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Use MAPE when:</strong> Comparing models on different scales</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Use R² when:</strong> Explaining variance is the goal</div>
                </div>
              </div>
            </div>

            <AnalogyBox icon={ICONS.chart} title="Like Measuring Distance" text="MAE is like measuring straight-line distance. MSE is like measuring squared distance (punishes long detours more). RMSE brings it back to normal units. R² tells you what percentage of the journey you explained correctly."/>

            <Quiz q="Which metric gives the error in the same units as the target variable?" options={["MAE","MSE","RMSE","R²"] correct={2}/>
          </div>
        ),
      },
    ],
  },
  {
    id:"applications", icon:"🌟", title:"Applications & Future", color:"#ec4899",
    tagline:"ML in the real world and what's next",
    topics:[
      {
        title:"ML in Industry — Real-World Applications",
        badge:`${ICONS.run} impact`,
        badgeColor:"#ec4899",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Machine Learning is transforming every industry. From healthcare to finance to transportation, ML algorithms are solving real problems and creating new opportunities.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Healthcare & Medicine</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {app:"Disease Diagnosis",tech:"CNNs for medical imaging",impact:"Early detection of cancer, COVID-19",icon:"🏥"},
                    {app:"Drug Discovery",tech:"Molecular property prediction",impact:"Faster drug development, personalized medicine",icon:"💊"},
                    {app:"Health Monitoring",tech:"Time series analysis",impact:"Predictive healthcare, wearable devices",icon:"📱"},
                    {app:"Medical Research",tech:"Pattern recognition in genomics",impact:"Understanding diseases at molecular level",icon:"🧬"}
                  ].map((item,i)=>(
                    <div key={i} style={{padding:"10px",borderRadius:6,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <span style={{fontSize:14}}>{item.icon}</span>
                        <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)"}}>{item.app}</div>
                      </div>
                      <div style={{fontSize:9,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:2}}>{item.tech}</div>
                      <div style={{fontSize:9,color:"var(--txt2)"}}>{item.impact}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Finance & Banking</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {app:"Fraud Detection",tech:"Anomaly detection algorithms",impact:"Prevent billions in fraudulent transactions",icon:"💳"},
                    {app:"Credit Scoring",tech:"Ensemble methods, feature engineering",impact:"Fairer lending decisions, risk assessment",icon:"📊"},
                    {app:"Algorithmic Trading",tech:"Time series forecasting",impact:"Automated trading, market prediction",icon:"📈"},
                    {app:"Insurance Pricing",tech:"Risk modeling, customer segmentation",impact:"Personalized premiums, claims prediction",icon:"🛡️"}
                  ].map((item,i)=>(
                    <div key={i} style={{padding:"10px",borderRadius:6,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <span style={{fontSize:14}}>{item.icon}</span>
                        <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)"}}>{item.app}</div>
                      </div>
                      <div style={{fontSize:9,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:2}}>{item.tech}</div>
                      <div style={{fontSize:9,color:"var(--txt2)"}}>{item.impact}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Transportation</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[
                    {app:"Self-Driving Cars",tech:"Computer vision, reinforcement learning",icon:"🚗"},
                    {app:"Route Optimization",tech:"Graph algorithms, real-time prediction",icon:"🛣️"},
                    {app:"Traffic Prediction",tech:"Time series, spatial analysis",icon:"🚦"}
                  ].map((item,i)=>(
                    <div key={i} style={{padding:"8px",borderRadius:4,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                        <span style={{fontSize:12}}>{item.icon}</span>
                        <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)"}}>{item.app}</div>
                      </div>
                      <div style={{fontSize:8,color:"var(--txt2)"}}>{item.tech}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Entertainment</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[
                    {app:"Recommendation Systems",tech:"Collaborative filtering, content-based",icon:"🎬"},
                    {app:"Content Generation",tech:"GANs, transformers",icon:"🎨"},
                    {app:"Personalization",tech:"User behavior analysis",icon:"🎯"}
                  ].map((item,i)=>(
                    <div key={i} style={{padding:"8px",borderRadius:4,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                        <span style={{fontSize:12}}>{item.icon}</span>
                        <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)"}}>{item.app}</div>
                      </div>
                      <div style={{fontSize:8,color:"var(--txt2)"}}>{item.tech}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Manufacturing</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {[
                    {app:"Quality Control",tech:"Computer vision, anomaly detection",icon:"🏭"},
                    {app:"Predictive Maintenance",tech:"Time series, sensor data",icon:"🔧"},
                    {app:"Supply Chain",tech:"Demand forecasting, optimization",icon:"📦"}
                  ].map((item,i)=>(
                    <div key={i} style={{padding:"8px",borderRadius:4,background:"rgba(0,0,0,0.2)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:2}}>
                        <span style={{fontSize:12}}>{item.icon}</span>
                        <div style={{fontSize:10,fontWeight:700,color:"var(--txt0)"}}>{item.app}</div>
                      </div>
                      <div style={{fontSize:8,color:"var(--txt2)"}}>{item.tech}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="callout callout-pink">
              <strong style={{fontSize:12,color:"#ec4899"}}>ML Success Stories:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Netflix:</strong> ML recommendations increased engagement by 25%</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Google Translate:</strong> Neural networks improved accuracy by 60%</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>PayPal:</strong> ML fraud detection saves $700M annually</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Tesla:</strong> Autopilot uses ML for self-driving capabilities</div>
                </div>
              </div>
            </div>

            <AnalogyBox icon={ICONS.run} title="Like Electricity in the Industrial Revolution" text="Just as electricity transformed factories, transportation, and communication in the 20th century, ML is transforming industries today. It's not just automation — it's intelligent automation that learns and improves."/>

            <Quiz q="Which industry was NOT mentioned as using ML for quality control?" options={["Healthcare","Manufacturing","Finance","Transportation"] correct={2}/>
          </div>
        ),
      },
      {
        title:"The Future of Machine Learning",
        badge:`${ICONS.bulb} trends`,
        badgeColor:"#ec4899",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              ML is evolving rapidly. New architectures, better algorithms, and novel applications are emerging. Understanding these trends helps you stay ahead in this fast-moving field.
            </p>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Emerging Technologies</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      tech:"Large Language Models (LLMs)",
                      desc:"GPT, BERT, and similar models that understand and generate human-like text",
                      impact:"Revolutionizing chatbots, content creation, code generation",
                      timeline:"Now → 2025",
                      icon:"💬"
                    },
                    {
                      tech:"Multimodal Learning",
                      desc:"Models that process text, images, audio, and video together",
                      impact:"More comprehensive AI understanding, better context awareness",
                      timeline:"2024 → 2026",
                      icon:"🎭"
                    },
                    {
                      tech:"Federated Learning",
                      desc:"Training models across decentralized devices without sharing data",
                      impact:"Privacy-preserving ML, edge computing, IoT applications",
                      timeline:"2023 → 2027",
                      icon:"🔒"
                    },
                    {
                      tech:"AutoML & Neural Architecture Search",
                      desc:"AI that automatically designs and optimizes ML models",
                      impact:"Democratizing ML, faster model development",
                      timeline:"Now → 2025",
                      icon:"🤖"
                    },
                    {
                      tech:"Quantum Machine Learning",
                      desc:"Using quantum computers for faster ML computations",
                      impact:"Solving currently intractable problems",
                      timeline:"2025 → 2030",
                      icon:"⚛️"
                    }
                  ].map((tech,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(236,72,153,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{tech.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{tech.tech}</div>
                          <div style={{fontSize:9,color:"#ec4899",fontFamily:"var(--fm)"}}>{tech.timeline}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{tech.desc}</p>
                      <div style={{fontSize:9,color:"var(--txt2)"}}><strong>Impact:</strong> {tech.impact}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
                <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Challenges & Opportunities</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {
                      challenge:"Data Privacy & Ethics",
                      desc:"Balancing innovation with privacy rights and ethical considerations",
                      opportunity:"Privacy-preserving techniques, ethical AI frameworks",
                      icon:"🛡️"
                    },
                    {
                      challenge:"Model Interpretability",
                      desc:"Understanding why complex models make certain decisions",
                      opportunity:"Explainable AI (XAI), model debugging tools",
                      icon:"🔍"
                    },
                    {
                      challenge:"Energy Efficiency",
                      desc:"Large models require significant computational resources",
                      opportunity:"Model compression, efficient architectures, edge computing",
                      icon:"⚡"
                    },
                    {
                      challenge:"Bias & Fairness",
                      desc:"Models can inherit and amplify societal biases",
                      opportunity:"Fairness-aware algorithms, diverse training data",
                      icon:"⚖️"
                    },
                    {
                      challenge:"Skill Gap",
                      desc:"Demand for ML expertise exceeds supply",
                      opportunity:"Better education, AutoML tools, citizen data science",
                      icon:"📚"
                    }
                  ].map((item,i)=>(
                    <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(236,72,153,0.1)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <span style={{fontSize:16}}>{item.icon}</span>
                        <div>
                          <div style={{fontSize:12,fontWeight:700,color:"var(--txt0)"}}>{item.challenge}</div>
                        </div>
                      </div>
                      <p style={{fontSize:10,color:"var(--txt1)",lineHeight:1.4,marginBottom:4}}>{item.desc}</p>
                      <div style={{fontSize:9,color:"var(--txt2)"}}><strong>Opportunity:</strong> {item.opportunity}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{padding:"16px",borderRadius:12,background:"rgba(236,72,153,0.08)",border:"1px solid rgba(236,72,153,0.2)"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Career Opportunities in ML</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                {[
                  {role:"ML Engineer",skills:"Python, TensorFlow/PyTorch, MLOps",salary:"$120k-200k",icon:"👨‍💻"},
                  {role:"Data Scientist",skills:"Statistics, Python/R, visualization",salary:"$100k-180k",icon:"📊"},
                  {role:"ML Researcher",skills:"Mathematics, research, publications",salary:"$130k-250k",icon:"🔬"},
                  {role:"AI Ethics Officer",skills:"Ethics, policy, social science",salary:"$90k-150k",icon:"⚖️"},
                  {role:"MLOps Engineer",skills:"DevOps, cloud, automation",salary:"$110k-190k",icon:"☁️"},
                  {role:"AI Product Manager",skills:"Product management, ML basics",salary:"$130k-220k",icon:"📱"}
                ].map((career,i)=>(
                  <div key={i} style={{padding:"12px",borderRadius:8,background:"rgba(0,0,0,0.2)",border:"1px solid rgba(236,72,153,0.1)",textAlign:"center"}}>
                    <div style={{fontSize:16,marginBottom:6}}>{career.icon}</div>
                    <div style={{fontSize:11,fontWeight:700,color:"var(--txt0)",marginBottom:4}}>{career.role}</div>
                    <div style={{fontSize:9,color:"#ec4899",fontFamily:"var(--fm)",marginBottom:3}}>{career.salary}</div>
                    <div style={{fontSize:8,color:"var(--txt2)",lineHeight:1.2}}>{career.skills}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="callout callout-purple">
              <strong style={{fontSize:12,color:"#8b5cf6"}}>Getting Started in ML:</strong>
              <div style={{marginTop:6}}>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Learn fundamentals:</strong> Statistics, linear algebra, Python programming</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Practice projects:</strong> Kaggle competitions, personal projects</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Build portfolio:</strong> GitHub projects, blog posts, certifications</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Stay current:</strong> Follow research papers, attend conferences</div>
                  <div style={{fontSize:11,color:"var(--txt1)"}}>• <strong>Network:</strong> Join ML communities, contribute to open source</div>
                </div>
              </div>
            </div>

            <AnalogyBox icon={ICONS.bulb} title="Like the Internet in the 1990s" text="We're in the early days of ML, similar to the internet boom of the 1990s. The field is growing exponentially, new applications are discovered daily, and the skills you learn now will be valuable for decades to come."/>

            <Quiz q="Which emerging technology focuses on training models without sharing private data?" options={["Large Language Models","Federated Learning","Quantum ML","AutoML"] correct={1}/>
          </div>
        ),
      },
    ],
  },
  {
    id:"deployment", icon:"🚀", title:"Deploying ML Models", color:"#2dd4bf",
    tagline:"Taking your model to the real world",
    topics:[
      {
        title:"What is Model Deployment?",
        badge:"🌐 real world",
        badgeColor:"#2dd4bf",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Training a model is just half the job. <strong style={{color:"var(--txt0)"}}>Deployment</strong> means putting your model somewhere that real users can actually use it — like inside an app, a website, or an automated pipeline.
            </p>
            <AnalogyBox emoji="🏭" title="From lab to factory" text="A scientist invents a new medicine in a lab. But people can't just come to the lab for their medicine! The formula needs to go to a factory that can make millions of pills and ship them to pharmacies. Deployment = moving your model from your laptop to a factory (server) that serves millions of users!"/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {step:"1",title:"Save the model",desc:"Export your trained model to a file (e.g., model.pkl for sklearn, model.h5 for Keras)",icon:"💾",color:"#60a5fa"},
                {step:"2",title:"Build an API",desc:"Wrap your model in a web API (using Flask, FastAPI, etc.) so other programs can send data and get predictions back",icon:"🔌",color:"#a78bfa"},
                {step:"3",title:"Deploy to server",desc:"Put it on a cloud server (AWS, GCP, Azure) so it's always running and accessible from anywhere",icon:"☁️",color:"#f472b6"},
                {step:"4",title:"Monitor it",desc:"Watch performance over time. Data changes in the real world — your model might slowly become less accurate (called data drift)",icon:"📊",color:"#34d399"},
              ].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:`${s.color}20`,border:`1px solid ${s.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{s.icon}</div>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:s.color,fontFamily:"var(--fb)",marginBottom:4}}>Step {s.step}: {s.title}</div>
                    <div style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7}}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title:"ML in the Real World — Where It's Used",
        badge:"🌍 applications",
        badgeColor:"#2dd4bf",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Machine Learning is already all around you. Here's where it's silently working every day:
            </p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {icon:"📱",area:"Your Phone",examples:["Face unlock = neural network","Voice assistants = speech ML","Photo enhancements = CNN"],color:"#60a5fa"},
                {icon:"🎬",area:"Netflix / YouTube",examples:["'You might like...' = recommendation ML","Thumbnail selection = A/B testing ML","Auto-captions = speech-to-text ML"],color:"#f472b6"},
                {icon:"🏥",area:"Healthcare",examples:["Cancer detection in scans","Drug discovery","Patient risk prediction"],color:"#34d399"},
                {icon:"🏦",area:"Banking / Finance",examples:["Fraud detection (unusual spending)","Credit scoring","Stock market prediction"],color:"#fbbf24"},
                {icon:"🚗",area:"Self-Driving Cars",examples:["Object detection (pedestrians, signs)","Path planning","Emergency braking"],color:"#a78bfa"},
                {icon:"📧",area:"Email",examples:["Spam filtering","Auto-reply suggestions","Priority inbox"],color:"#2dd4bf"},
              ].map((a,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${a.color}08`,border:`1px solid ${a.color}22`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <span style={{fontSize:20}}>{a.icon}</span>
                    <span style={{fontSize:12,fontWeight:700,color:a.color,fontFamily:"var(--fb)"}}>{a.area}</span>
                  </div>
                  {a.examples.map((e,j)=>(
                    <div key={j} style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,display:"flex",gap:5}}>
                      <span style={{color:a.color,flexShrink:0}}>•</span>{e}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="callout callout-blue">
              <strong style={{fontSize:12,color:"#60a5fa"}}>Your AutoML platform:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>This platform does all of this automatically for you! Upload your data → it cleans it, picks the best algorithm, trains it, evaluates it, and deploys it. You focus on the problem; the platform handles the ML!</p>
            </div>
          </div>
        ),
      },
    ],
  },
];

// ─── SECTION CARD ──────────────────────────────────────────────────────────
function SectionCard({section,onClick,delay}:any) {
  return (
    <div className="sec-card rise" onClick={onClick} style={{animationDelay:`${delay}ms`}}>
      <div style={{position:"absolute",top:-20,right:-10,width:80,height:80,borderRadius:"50%",background:section.color,filter:"blur(32px)",opacity:0.12,pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:`linear-gradient(90deg,${section.color}50,transparent)`,opacity:0.6}}/>
      <div style={{padding:"20px 22px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:12}}>
          <div style={{width:46,height:46,borderRadius:13,flexShrink:0,background:`linear-gradient(140deg,${section.color}14,${section.color}04)`,border:`1px solid ${section.color}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>
            {section.icon}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <h3 style={{fontFamily:"var(--fd)",fontSize:15,fontWeight:700,color:"var(--txt0)",letterSpacing:"-0.02em",marginBottom:3}}>{section.title}</h3>
            <p style={{fontFamily:"var(--fb)",fontSize:11,color:"var(--txt2)",lineHeight:1.5}}>{section.tagline}</p>
          </div>
          <svg className="sec-arrow" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="var(--txt2)">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{height:1.5,borderRadius:100,background:`linear-gradient(90deg,${section.color}70,${section.color}18,transparent)`,width:70}}/>
          <span style={{fontFamily:"var(--fm)",fontSize:9,color:"var(--txt2)"}}>{section.topics.length} topics</span>
        </div>
      </div>
    </div>
  );
}

// ─── ACCORDION ─────────────────────────────────────────────────────────────
function Accordion({topic,isOpen,onToggle,color}:any) {
  return (
    <div className={`acc-item ${isOpen?"open":""}`}>
      <div className="acc-head" onClick={onToggle}>
        <div style={{display:"flex",alignItems:"center",gap:9,flex:1,minWidth:0}}>
          <h4 style={{fontFamily:"var(--fd)",fontSize:13,fontWeight:700,color:"var(--txt0)",letterSpacing:"-0.01em",lineHeight:1.3}}>{topic.title}</h4>
          {topic.badge&&<span className="tag" style={{background:`${topic.badgeColor}12`,color:topic.badgeColor,border:`1px solid ${topic.badgeColor}30`,flexShrink:0}}>{topic.badge}</span>}
        </div>
        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="var(--txt1)" style={{transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.3s",flexShrink:0}}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      <div className={`acc-body ${isOpen?"open":""}`}>
        {topic.content}
      </div>
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
export default function MLTutorialPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string|null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set(Array.from({length: SECTIONS.reduce((a,s)=>a+s.topics.length,0)}, (_,i)=>i))); // All open by default
  const [sectionSearch, setSectionSearch] = useState("");
  const [topicSearch, setTopicSearch] = useState("");

  const filteredSections = useMemo(() => {
    const term = sectionSearch.trim().toLowerCase();
    if (!term) return SECTIONS;
    return SECTIONS.filter(sec =>
      sec.title.toLowerCase().includes(term)
      || sec.tagline.toLowerCase().includes(term)
      || sec.topics.some(top =>
        top.title.toLowerCase().includes(term)
        || (top.badge || "").toLowerCase().includes(term)
      )
    );
  }, [sectionSearch]);

  const section = selected ? SECTIONS.find(s=>s.id===selected) : null;
  const idx = SECTIONS.findIndex(s=>s.id===selected);

  const selectedTopics = useMemo(() => {
    if (!section) return [];
    const term = topicSearch.trim().toLowerCase();
    if (!term) return section.topics;
    return section.topics.filter(top =>
      top.title.toLowerCase().includes(term)
      || top.badge?.toLowerCase().includes(term)
    );
  }, [section, topicSearch]);

  const goTo = (id:string) => {
    setSelected(id);
    setOpen(new Set(Array.from({length: SECTIONS.find(s=>s.id===id)?.topics.length || 0}, (_,i)=>i)));
    setTopicSearch("");
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const toggle = (i:number) => setOpen(p=>{ const n=new Set(p); n.has(i)?n.delete(i):n.add(i); return n; });

  return (
    <div style={{minHeight:"100vh",background:"var(--bg0)",color:"var(--txt0)",fontFamily:"var(--fb)"}}>
      <style>{STYLES}</style>

      {/* bg */}
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(160deg,#060a14 0%,#040810 60%,#030610 100%)"}}/>
        <div style={{position:"absolute",inset:0,opacity:0.018,backgroundImage:"radial-gradient(circle,rgba(148,163,184,0.8) 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
        <div style={{position:"absolute",top:"5%",left:"25%",width:600,height:600,background:"radial-gradient(circle,rgba(99,102,241,0.04) 0%,transparent 70%)",borderRadius:"50%",animation:"drift 26s ease infinite"}}/>
        <div style={{position:"absolute",bottom:"10%",right:"5%",width:400,height:400,background:"radial-gradient(circle,rgba(244,114,182,0.03) 0%,transparent 65%)",borderRadius:"50%",animation:"drift 34s ease infinite reverse"}}/>
      </div>

      {/* nav */}
      <nav style={{position:"sticky",top:0,zIndex:30,height:54,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px",borderBottom:"1px solid var(--rim0)",background:"rgba(4,7,14,0.9)",backdropFilter:"blur(28px)"}}>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.18),transparent)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <Logo/>
          <span style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)",padding:"2px 7px",borderRadius:100,background:"rgba(255,255,255,0.04)",border:"1px solid var(--rim1)"}}>ML Tutorial</span>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {selected&&<button onClick={()=>{setSelected(null);setOpen(new Set(Array.from({length: SECTIONS.reduce((a,s)=>a+s.topics.length,0)}, (_,i)=>i))); window.scrollTo({top:0,behavior:"smooth"});}} className="nav-pill">
            <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            All Topics
          </button>}
          <button onClick={()=>router.push("/dashboard")} className="nav-pill">🏠 Dashboard</button>
        </div>
      </nav>

      <main style={{position:"relative",zIndex:1,padding:"44px 20px 100px",width:"100%"}}>
        {!selected ? (
          <div style={{display:'grid',gridTemplateColumns:'250px 1fr',gap:18,alignItems:'start'}}>
            <aside style={{position:'sticky',top:78,background:'rgba(4,7,14,0.85)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'12px 10px',height:'fit-content',maxHeight:'80vh',overflowY:'auto'}}>
              <div style={{fontFamily:'var(--fd)',fontSize:12,fontWeight:700,color:'var(--txt0)',marginBottom:8}}>Sections</div>
              <input value={sectionSearch} onChange={e=>setSectionSearch(e.target.value)} placeholder="Search sections..." style={{width:'100%',padding:'7px 10px',marginBottom:10,borderRadius:8,border:'1px solid var(--rim1)',background:'rgba(255,255,255,0.03)',color:'var(--txt0)',fontFamily:'var(--fb)',fontSize:11}} aria-label="Search sections" />
              {filteredSections.length === 0 ? (
                <div style={{fontFamily:'var(--fb)',fontSize:11,color:'var(--txt2)',padding:'8px',borderRadius:8,background:'rgba(255,255,255,0.03)'}}>No sections match "{sectionSearch}"</div>
              ) : filteredSections.map((s)=>(
                <button key={s.id} onClick={()=>goTo(s.id)} style={{display:'block',width:'100%',textAlign:'left',padding:'8px 10px',borderRadius:8,border:'none',background:selected===s.id ? 'rgba(99,102,241,0.2)' : 'transparent',color:selected===s.id ? '#fff' : 'var(--txt1)',cursor:'pointer',marginBottom:4,fontFamily:'var(--fb)',fontSize:11}}>
                  {s.icon} {s.title}
                </button>
              ))}
            </aside>
            <div>
              <div className="rise d0" style={{marginBottom:44}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:"#a78bfa",boxShadow:"0 0 10px rgba(167,139,250,0.7)",display:"inline-block",animation:"pulse-dot 2s ease infinite"}}/>
                  <span style={{fontFamily:"var(--fm)",fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--txt2)"}}>Complete guide · Basic to Advanced</span>
                </div>
                <h1 style={{fontFamily:"var(--fd)",fontSize:clamp(28,5,40),fontWeight:800,letterSpacing:"-0.04em",lineHeight:1.1,color:"var(--txt0)",marginBottom:12}}>
                  Machine Learning<br/>
                  <span style={{background:"linear-gradient(120deg,#818cf8 0%,#c084fc 40%,#f472b6 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Explained Simply</span>
                </h1>
                <p style={{fontFamily:"var(--fb)",fontSize:14,color:"var(--txt2)",lineHeight:1.8,maxWidth:480,marginBottom:20}}>
                  Every concept explained like you're in 5th grade — with interactive diagrams, simple analogies, and no confusing jargon. From what ML is, all the way to deploying models.
                </p>
                <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                  {[{icon:"🎯",label:"Simple English"},{icon:"📊",label:"Live Diagrams"},{icon:"🧠",label:"Quick Quizzes"},{icon:"🧮",label:"Math Explained"}].map(b=>(
                    <div key={b.label} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 12px",borderRadius:100,background:"rgba(255,255,255,0.04)",border:"1px solid var(--rim1)",fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)"}}>
                      <span style={{fontSize:12}}>{b.icon}</span>{b.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="sec-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
                {SECTIONS.map((s,i)=>(
                  <SectionCard key={s.id} section={s} onClick={()=>goTo(s.id)} delay={i*65}/>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: '250px 1fr', gap: 18, alignItems: 'start', padding: 20}}>
            <aside style={{position:'sticky',top:78,background:'rgba(4,7,14,0.85)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,padding:'12px 10px',height:'fit-content',maxHeight:'80vh',overflowY:'auto'}}>
              <div style={{fontFamily:'var(--fd)',fontSize:12,fontWeight:700,color:'var(--txt0)',marginBottom:10}}>Sections</div>
              {SECTIONS.map((s)=>(
                <button key={s.id} onClick={()=>goTo(s.id)} style={{display:'block',width:'100%',textAlign:'left',padding:'8px 10px',borderRadius:8,border:'none',background:selected===s.id ? 'rgba(99,102,241,0.2)' : 'transparent',color:selected===s.id ? '#fff' : 'var(--txt1)',cursor:'pointer',marginBottom:4,fontFamily:'var(--fb)',fontSize:11}}>
                  {s.icon} {s.title}
                </button>
              ))}
            </aside>
            <div>
              <h2 style={{fontFamily:'var(--fd)',fontSize:20,color:'var(--txt0)',marginBottom:10}}>{section?.title}</h2>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {section?.topics.map((t,i)=>(
                  <Accordion key={i} topic={t} isOpen={open.has(i)} onToggle={()=>toggle(i)} color={section?.color} />
                ))}
              </div>
              {/* progress dots */}
              <div style={{display:"flex",gap:5,marginBottom:24}}>
                {SECTIONS.map((_,i)=>(
                  <div key={i} onClick={()=>goTo(SECTIONS[i].id)} style={{width:i===idx?18:6,height:6,borderRadius:100,background:i===idx?"#6366f1":i<idx?"rgba(99,102,241,0.35)":"rgba(255,255,255,0.06)",transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",cursor:"pointer"}}/>
                ))}
              </div>
              {/* CTA */}
              <div className="rise d2" style={{marginTop:48,padding:"26px 28px",borderRadius:"var(--r-xl)",background:"linear-gradient(145deg,rgba(99,102,241,0.09),rgba(167,139,250,0.05))",border:"1px solid rgba(99,102,241,0.18)"}}>
                <div style={{fontSize:18,marginBottom:8}}>🎉</div>
                <h3 style={{fontFamily:"var(--fd)",fontSize:17,fontWeight:700,color:"var(--txt0)",marginBottom:8}}>
                  {idx===SECTIONS.length-1?"You've completed the full guide! 🏆":"Ready to try it yourself?"}
                </h3>
                <p style={{fontFamily:"var(--fb)",fontSize:13,color:"var(--txt1)",lineHeight:1.75,marginBottom:18}}>
                  {idx===SECTIONS.length-1
                    ?"You now know ML from basics to deployment! Go build something amazing — upload a dataset to the dashboard and create your first real ML model."
                    :"Upload any dataset to the dashboard and see all these concepts in action — data cleaning, model training, evaluation — all automatically!"}
                </p>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button onClick={()=>router.push("/dashboard")} style={{display:"inline-flex",alignItems:"center",gap:7,background:"linear-gradient(135deg,#4f46e5,#6366f1,#818cf8)",color:"#fff",border:"none",cursor:"pointer",fontFamily:"var(--fb)",fontWeight:700,borderRadius:11,padding:"10px 20px",fontSize:12,boxShadow:"0 4px 18px rgba(99,102,241,0.3)",transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 28px rgba(99,102,241,0.45)"}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 18px rgba(99,102,241,0.3)"}}>
                    🚀 Start a project
                  </button>
                  {idx<SECTIONS.length-1&&<button onClick={()=>goTo(SECTIONS[idx+1].id)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.05)",color:"var(--txt0)",border:"1px solid var(--rim2)",cursor:"pointer",fontFamily:"var(--fb)",fontWeight:600,borderRadius:11,padding:"10px 18px",fontSize:12,transition:"all 0.2s"}}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.09)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                    Next: {SECTIONS[idx+1].title} →
                  </button>}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function clamp(min:number,mid:number,max:number){return Math.min(max,Math.max(min,mid));}