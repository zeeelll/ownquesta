"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
function AnalogyBox({emoji,title,text}:{emoji:string;title:string;text:string}) {
  return (
    <div style={{display:"flex",gap:12,padding:"12px 16px",borderRadius:12,background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",margin:"12px 0"}}>
      <span style={{fontSize:24,flexShrink:0}}>{emoji}</span>
      <div>
        <div style={{fontFamily:"var(--fb)",fontSize:12,fontWeight:700,color:"#fbbf24",marginBottom:4}}>{title}</div>
        <div style={{fontFamily:"var(--fb)",fontSize:12,color:"var(--txt1)",lineHeight:1.7}}>{text}</div>
      </div>
    </div>
  );
}

// ─── ALL SECTIONS DATA ─────────────────────────────────────────────────────
const SECTIONS = [
  {
    id:"what-is-ml", icon:"🤖", title:"What is Machine Learning?", color:"#60a5fa",
    tagline:"Start here — the big picture",
    topics:[
      {
        title:"Machine Learning in Simple Words",
        badge:"🌟 start here",
        badgeColor:"#60a5fa",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              Normally, when you write a computer program, you tell the computer <strong style={{color:"var(--txt0)"}}>exactly what to do</strong>, step by step. Like: <em>"If rain → open umbrella."</em>
            </p>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              <strong style={{color:"var(--txt0)"}}>Machine Learning is different.</strong> Instead of telling the computer the rules, you show it <em>thousands of examples</em>, and it <strong style={{color:"#60a5fa"}}>figures out the rules by itself!</strong>
            </p>
            <AnalogyBox emoji="👶" title="Think of it like teaching a baby" text='You do not teach a baby grammar rules. You just say "ball" 500 times, and they learn what "ball" means. Machine learning works the same way — lots of examples → the computer learns the pattern.'/>
            <BrainLearningDiagram/>
            <Quiz q="In Machine Learning, how does a computer learn?" options={["You write all the rules manually","You show it examples and it finds patterns","You program every possible answer","You connect it to the internet"]} correct={1}/>
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
    ],
  },
  {
    id:"data", icon:"📊", title:"Data — The Fuel of ML", color:"#34d399",
    tagline:"Understand your data first",
    topics:[
      {
        title:"What is Data in ML?",
        badge:"📚 basics",
        badgeColor:"#34d399",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              In ML, <strong style={{color:"var(--txt0)"}}>data is a table</strong> — just like an Excel spreadsheet. Each row is one example (called a <span className="word-box">sample</span> or <span className="word-box">record</span>). Each column is one piece of information (called a <span className="word-box">feature</span>).
            </p>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"separate",borderSpacing:"3px",fontFamily:"var(--fm)",fontSize:11}}>
                <thead>
                  <tr>
                    {["Age","Salary ($)","Experience (yrs)","Got promoted? ← TARGET"].map((h,i)=>(
                      <td key={i} style={{padding:"7px 10px",borderRadius:6,background:i===3?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.07)",color:i===3?"#a5b4fc":"var(--txt1)",fontWeight:700,fontSize:10,textAlign:"center"}}>{h}</td>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[[25,50000,2,"YES"],[32,75000,6,"YES"],[45,60000,15,"NO"],[28,45000,1,"NO"],[38,90000,10,"YES"]].map((row,i)=>(
                    <tr key={i}>
                      {row.map((cell,j)=>(
                        <td key={j} style={{padding:"6px 10px",borderRadius:5,background:j===3?"rgba(99,102,241,0.1)":"rgba(255,255,255,0.03)",color:j===3?"#818cf8":"var(--txt1)",textAlign:"center"}}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {term:"Feature",color:"#60a5fa",def:"An input column (Age, Salary, Experience). These are the clues."},
                {term:"Target / Label",color:"#a5b4fc",def:"The answer column (Got promoted?). This is what we want to predict."},
                {term:"Row / Sample",color:"#34d399",def:"One complete example — one person's data in this case."},
                {term:"Dataset",color:"#fbbf24",def:"The whole table — all your examples combined."},
              ].map((d,i)=>(
                <div key={i} style={{padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,0.03)",border:"1px solid var(--rim1)"}}>
                  <code style={{fontSize:11,color:d.color,fontFamily:"var(--fm)",fontWeight:700}}>{d.term}</code>
                  <p style={{fontSize:11,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.6,marginTop:5}}>{d.def}</p>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        title:"Train, Validation, and Test Split",
        badge:"🔑 important",
        badgeColor:"#f472b6",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              You can't use <em>all</em> your data for training. How would you know if the model works on <strong style={{color:"var(--txt0)"}}>data it has never seen before?</strong> You need to save some for testing!
            </p>
            <AnalogyBox emoji="📝" title="Think of it like school exams" text="You study from textbooks (training set). You do practice problems (validation set). Then you sit the final exam using questions you've never seen before (test set). If you only practiced with the same questions as the exam, you'd just memorize — not learn!"/>
            <TrainTestDiagram/>
            <div className="callout callout-red">
              <strong style={{fontSize:12,color:"#f87171"}}>⚠️ Golden Rule:</strong>
              <p style={{fontSize:12,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.7,marginTop:4}}>NEVER look at the test set until the very end. If you tune your model based on test results, you're "leaking" information — like getting the exam answers in advance. Your test score won't be honest anymore!</p>
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
      },
    ],
  },
  {
    id:"algorithms", icon:"🧠", title:"Algorithms Explained Simply", color:"#a78bfa",
    tagline:"The tools that make predictions",
    topics:[
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
            <AnalogyBox emoji="⚖️" title="The complexity tax" text='Imagine a student who memorizes every exact question from past exams. They do great on exams they\'ve seen but fail on new questions. Regularization is like telling the student: "You\'ll lose points for memorizing specific answers. You must understand the concepts generally!"'/>
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
        title:"Feature Engineering — Creating Better Inputs",
        badge:"⚡ advanced",
        badgeColor:"#fbbf24",
        content:(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <p style={{fontSize:13,color:"var(--txt1)",fontFamily:"var(--fb)",lineHeight:1.85}}>
              <strong style={{color:"var(--txt0)"}}>Feature Engineering is often more impactful than choosing a better algorithm.</strong> It means creating new, more useful columns from your existing data.
            </p>
            <AnalogyBox emoji="🍳" title="Like preparing ingredients before cooking" text="A recipe with bad ingredients can't be saved by a good chef. But even a simple recipe becomes great with perfect ingredients. Feature engineering = transforming raw data into perfect ingredients for your model!"/>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {before:"Date: 2024-01-15",after:'Year: 2024, Month: 1, Day: 15, DayOfWeek: "Monday", IsWeekend: 0',why:"Models can't understand dates directly. Split them into numbers!",color:"#60a5fa"},
                {before:"Temperature: 37.2°C",after:"IsFever: 1 (because > 37)",why:"Creating binary flags from thresholds can help the model a lot.",color:"#f472b6"},
                {before:"Height: 170cm, Weight: 70kg",after:"BMI: 24.2 (= Weight ÷ Height²)",why:"Combined features often capture patterns that separate features miss.",color:"#34d399"},
                {before:'City: "Mumbai"',after:"City_Mumbai: 1, City_Delhi: 0, City_Chennai: 0 (One-Hot Encoding)",why:"Models need numbers, not text. One-hot encoding converts categories to 0/1 columns.",color:"#fbbf24"},
              ].map((ex,i)=>(
                <div key={i} style={{padding:"12px 14px",borderRadius:12,background:`${ex.color}08`,border:`1px solid ${ex.color}20`}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <div style={{padding:"6px 10px",borderRadius:8,background:"rgba(248,113,113,0.08)"}}>
                      <div style={{fontSize:9,color:"#f87171",fontFamily:"var(--fm)",marginBottom:3}}>BEFORE</div>
                      <code style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fm)"}}>{ex.before}</code>
                    </div>
                    <div style={{padding:"6px 10px",borderRadius:8,background:"rgba(52,211,153,0.08)"}}>
                      <div style={{fontSize:9,color:"#34d399",fontFamily:"var(--fm)",marginBottom:3}}>AFTER</div>
                      <code style={{fontSize:10,color:"var(--txt1)",fontFamily:"var(--fm)",lineHeight:1.6}}>{ex.after}</code>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:ex.color,fontFamily:"var(--fb)",fontStyle:"italic"}}>Why: {ex.why}</div>
                </div>
              ))}
            </div>
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
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const section = selected ? SECTIONS.find(s=>s.id===selected) : null;
  const idx = SECTIONS.findIndex(s=>s.id===selected);

  const goTo = (id:string) => { setSelected(id); setOpen(new Set([0])); window.scrollTo({top:0,behavior:"smooth"}); };
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
          <div style={{width:26,height:26,borderRadius:7,background:"linear-gradient(135deg,#6366f1,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:13}}>🧠</span>
          </div>
          <span style={{fontFamily:"var(--fd)",fontSize:13,fontWeight:700,color:"var(--txt0)",letterSpacing:"-0.02em"}}>ML Guide</span>
          <span style={{fontSize:9,color:"var(--txt2)",fontFamily:"var(--fm)",padding:"2px 7px",borderRadius:100,background:"rgba(255,255,255,0.04)",border:"1px solid var(--rim1)"}}>beginner friendly</span>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          {selected&&<button onClick={()=>{setSelected(null);setOpen(new Set([0]))}} className="nav-pill">
            <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            All Topics
          </button>}
          <button onClick={()=>router.push("/dashboard")} className="nav-pill">🏠 Dashboard</button>
        </div>
      </nav>

      <main style={{position:"relative",zIndex:1,maxWidth:900,margin:"0 auto",padding:"44px 20px 100px"}}>
        {!selected ? (
          <>
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
          </>
        ) : (
          <>
            {/* section header */}
            <div className="rise d0" style={{marginBottom:28}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:52,height:52,borderRadius:15,flexShrink:0,background:`linear-gradient(140deg,${section?.color}16,${section?.color}04)`,border:`1px solid ${section?.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:`0 0 20px ${section?.color}14`}}>{section?.icon}</div>
                <div>
                  <h1 style={{fontFamily:"var(--fd)",fontSize:26,fontWeight:800,color:"var(--txt0)",letterSpacing:"-0.03em",lineHeight:1.1}}>{section?.title}</h1>
                  <p style={{fontFamily:"var(--fb)",fontSize:11,color:"var(--txt2)",marginTop:3}}>{section?.tagline}</p>
                </div>
              </div>
              {/* prev/next */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {idx>0&&<button onClick={()=>goTo(SECTIONS[idx-1].id)} className="nav-pill">
                  <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                  {SECTIONS[idx-1].title}
                </button>}
                {idx<SECTIONS.length-1&&<button onClick={()=>goTo(SECTIONS[idx+1].id)} className="nav-pill">
                  {SECTIONS[idx+1].title}
                  <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                </button>}
              </div>
              <div style={{height:2,borderRadius:100,background:`linear-gradient(90deg,${section?.color}70,${section?.color}18,transparent)`,width:"30%",marginTop:12}}/>
            </div>

            {/* progress dots */}
            <div style={{display:"flex",gap:5,marginBottom:24}}>
              {SECTIONS.map((_,i)=>(
                <div key={i} onClick={()=>goTo(SECTIONS[i].id)} style={{width:i===idx?18:6,height:6,borderRadius:100,background:i===idx?"#6366f1":i<idx?"rgba(99,102,241,0.35)":"rgba(255,255,255,0.06)",transition:"all 0.3s cubic-bezier(0.34,1.56,0.64,1)",cursor:"pointer"}}/>
              ))}
            </div>

            <div className="rise d1">
              {section?.topics.map((t,i)=>(
                <Accordion key={i} topic={t} isOpen={open.has(i)} onToggle={()=>toggle(i)} color={section.color}/>
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
          </>
        )}
      </main>
    </div>
  );
}

function clamp(min:number,mid:number,max:number){return Math.min(max,Math.max(min,mid));}