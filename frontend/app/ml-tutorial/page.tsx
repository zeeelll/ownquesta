"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&display=swap');
  
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg0:#05080f;--bg1:#080d1a;--bg2:#0b1120;--bg3:#0f1626;--bg4:#121b2e;
    --rim0:rgba(255,255,255,0.03);--rim1:rgba(255,255,255,0.06);--rim2:rgba(255,255,255,0.10);
    --txt0:#eef2f8;--txt1:#8fa3bc;--txt2:#3f5370;--txt3:#1e2f45;
    --blue:#60a5fa;--purple:#a78bfa;--pink:#f472b6;--green:#34d399;--amber:#fbbf24;--red:#f87171;--teal:#2dd4bf;
    --ind:#6366f1;--ind-l:#818cf8;
    --fd:'Bricolage Grotesque',sans-serif;--fb:'Plus Jakarta Sans',sans-serif;--fm:'JetBrains Mono',monospace;
    --r-xl:20px;
  }
  html{scroll-behavior:smooth}
  @keyframes rise{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pop{0%{transform:scale(0.6);opacity:0}100%{transform:scale(1);opacity:1}}
  @keyframes slide-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

  .rise{animation:rise 0.55s cubic-bezier(0.22,1,0.36,1) both}
  .nav-pill{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:100px;background:rgba(255,255,255,0.04);border:1px solid var(--rim1);font-size:13px;font-weight:600;color:var(--txt1);cursor:pointer;font-family:var(--fb);transition:all 0.2s}
  .nav-pill:hover{background:rgba(255,255,255,0.1);color:var(--txt0)}

  .sec-card{position:relative;border-radius:var(--r-xl);overflow:hidden;cursor:pointer;background:linear-gradient(145deg,var(--bg3),var(--bg2));border:1px solid var(--rim1);transition:all 0.3s}
  .sec-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 30px 70px rgba(0,0,0,0.55)}

  .acc-item{border:1px solid var(--rim1);border-radius:18px;margin-bottom:18px;overflow:hidden;transition:all 0.3s}
  .acc-item.open{border-color:#6366f160}
  .acc-head{display:flex;align-items:center;justify-content:space-between;padding:22px 26px;cursor:pointer;background:rgba(255,255,255,0.025);transition:background 0.25s}
  .acc-head:hover{background:rgba(255,255,255,0.06)}
  .acc-body{padding:0 26px;max-height:0;overflow:hidden;transition:max-height 0.6s cubic-bezier(0.4,0,0.2,1)}
  .acc-body.open{max-height:15000px;padding-bottom:32px}

  .callout{padding:18px 22px;border-radius:14px;margin:20px 0;border-left:5px solid}
  .callout-blue{background:rgba(96,165,250,0.08);border-color:#60a5fa}
  .callout-green{background:rgba(52,211,153,0.08);border-color:#34d399}

  .math-box{background:rgba(0,0,0,0.35);border:1px solid var(--rim2);border-radius:14px;padding:20px;font-family:var(--fm);font-size:14px;color:var(--txt0);margin:18px 0;line-height:1.9}
  .quiz-btn{padding:13px 18px;border-radius:12px;cursor:pointer;font-family:var(--fb);font-size:13.5px;font-weight:600;border:1px solid var(--rim2);background:rgba(255,255,255,0.04);color:var(--txt1);transition:all 0.2s;width:100%;text-align:left;margin-bottom:8px}
  .quiz-btn:hover{background:rgba(255,255,255,0.09)}
  .quiz-btn.correct{background:rgba(52,211,153,0.18);border-color:#34d399;color:#34d399}
  .quiz-btn.wrong{background:rgba(248,113,113,0.18);border-color:#f87171;color:#f87171}
  
  .full-width-content{width:100%}
  .diagram-container{background:rgba(0,0,0,0.25);border-radius:24px;padding:20px;margin:24px 0;border:1px solid var(--rim1)}
  .simple-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;margin:20px 0}
  
  .full-width-main{width:100%;max-width:none;padding:60px 40px 120px}
  .full-width-nav{padding:0 40px}
  
  @media (max-width: 768px){
    .full-width-main{padding:40px 20px 80px}
    .full-width-nav{padding:0 20px}
  }
`;


// ─── ALL DIAGRAM COMPONENTS ────────────────────────────────────────────────

function BrainLearningDiagram() {
  const [step, setStep] = useState(0);
  const steps = [
    { emoji:"📸", title:"You show examples", desc:"Like showing 100 photos of cats", color:"#60a5fa" },
    { emoji:"🔍", title:"Computer finds patterns", desc:"Pointy ears, fur, whiskers = CAT!", color:"#a78bfa" },
    { emoji:"🧠", title:"It remembers the rules", desc:"Stores patterns inside a model", color:"#f472b6" },
    { emoji:"✅", title:"It predicts new ones", desc:"New photo → says CAT!", color:"#34d399" },
  ];

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s+1)%4), 2400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="diagram-container" style={{margin:"24px 0"}}>
      <p style={{fontSize:"14px",fontWeight:"600",color:"var(--txt0)",marginBottom:"20px"}}>🧠 HOW MACHINE LEARNING WORKS (Step by Step)</p>
      <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
        {steps.map((s,i) => (
          <div key={i} style={{
            flex: "1 1 200px", padding:"20px", borderRadius:"20px",
            border: `2px solid ${i===step ? s.color : "var(--rim1)"}`,
            background: i===step ? `${s.color}15` : "rgba(255,255,255,0.02)",
            transition:"all 0.4s"
          }}>
            <div style={{fontSize: i===step ? "48px" : "38px", marginBottom:"12px"}}>{s.emoji}</div>
            <div style={{fontWeight:"800", color: i===step ? s.color : "var(--txt0)", marginBottom:"8px", fontSize:"18px"}}>{s.title}</div>
            {i===step && <div style={{fontSize:"14px",color:"var(--txt1)", lineHeight:"1.5"}}>{s.desc}</div>}
          </div>
        ))}
      </div>
      <div className="callout callout-blue" style={{marginTop:"24px"}}>
        💡 <strong>Simple idea:</strong> Instead of writing rules like "if ears are pointy then cat", the computer learns rules by itself from examples!
      </div>
    </div>
  );
}

function TrainTestDiagram() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div className="diagram-container" style={{margin:"24px 0"}}>
      <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"20px"}}>📊 HOW WE SPLIT DATA TO TEST MODELS</p>
      <div style={{display:"flex",height:"70px",borderRadius:"16px",overflow:"hidden",marginBottom:"20px"}}>
        {[
          {key:"train", w:"68%", label:"📚 TRAINING 70%", color:"#6366f1", tip:"Model learns from this"},
          {key:"val", w:"16%", label:"🔧 VALIDATION 15%", color:"#f59e0b", tip:"Used to tune model"},
          {key:"test", w:"16%", label:"🎯 TEST 15%", color:"#34d399", tip:"Final unseen test"}
        ].map(p => (
          <div key={p.key}
            onMouseEnter={() => setHovered(p.key)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: p.w, background: `linear-gradient(135deg,${p.color}cc,${p.color})`,
              display:"flex", alignItems:"center", justifyContent:"center", color:"white",
              fontSize:"12px", fontWeight:"700", fontFamily:"var(--fm)", cursor:"pointer",
              transition:"all 0.2s"
            }}>
            {p.label}
          </div>
        ))}
      </div>
      {hovered && (
        <div style={{padding:"16px",background:"rgba(99,102,241,0.15)",borderRadius:"16px",border:"1px solid rgba(99,102,241,0.3)",fontSize:"14px",lineHeight:"1.6"}}>
          {hovered === "train" && "📘 Training data (70%): This is like school homework. The model sees the answers and learns patterns."}
          {hovered === "val" && "🔍 Validation data (15%): Like practice tests. We use this to check progress and improve the model."}
          {hovered === "test" && "🏆 Test data (15%): Like final exam! The model has NEVER seen this. This tells us how good it really is."}
        </div>
      )}
    </div>
  );
}

function LinearRegressionDiagram() {
  const [showLine, setShowLine] = useState(false);
  useEffect(() => { setTimeout(() => setShowLine(true), 400); }, []);

  return (
    <div className="diagram-container" style={{margin:"24px 0", textAlign:"center"}}>
      <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"16px"}}>📈 LINEAR REGRESSION: FINDING THE BEST LINE</p>
      <svg viewBox="0 0 400 220" style={{width:"100%", maxWidth:"500px", background:"rgba(0,0,0,0.35)", borderRadius:"20px", border:"1px solid var(--rim1)", padding:"12px"}}>
        {/* Grid & Axes */}
        {[40,80,120,160,200].map(y => <line key={y} x1="40" y1={y} x2="360" y2={y} stroke="#ffffff15" strokeWidth="1"/>)}
        <line x1="40" y1="20" x2="40" y2="210" stroke="#ffffff50" strokeWidth="2"/>
        <line x1="40" y1="210" x2="360" y2="210" stroke="#ffffff50" strokeWidth="2"/>
        <text x="20" y="110" fill="#aaa" fontSize="10">Price</text>
        <text x="200" y="225" fill="#aaa" fontSize="10">Size ➡</text>
        
        {/* Points */}
        {[ {x:70,y:185}, {x:110,y:165}, {x:155,y:140}, {x:200,y:120}, {x:250,y:95}, {x:310,y:70} ].map((p,i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="8" fill="#60a5fa" stroke="white" strokeWidth="2"/>
          </g>
        ))}

        {showLine && <line x1="50" y1="195" x2="340" y2="60" stroke="#f472b6" strokeWidth="4" strokeDasharray="8 4"/>}
      </svg>
      <p style={{fontSize:"14px",color:"var(--txt1)",marginTop:"16px"}}>✨ The pink line is the "best guess" — it passes through the middle of all points. When new house size comes, we follow the line to predict price!</p>
    </div>
  );
}

function NeuronDiagram() {
  const [fire, setFire] = useState(false);
  return (
    <div className="diagram-container" style={{margin:"24px 0"}}>
      <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"16px"}}>⚡ HOW A SINGLE NEURON WORKS (Like a tiny brain cell)</p>
      <svg viewBox="0 0 500 220" style={{width:"100%", maxWidth:"550px", background:"rgba(0,0,0,0.35)", borderRadius:"20px", padding:"16px"}}>
        {/* Inputs */}
        {[{label:"Rain outside?", val:1, y:40}, {label:"Cold weather?", val:0, y:90}, {label:"Cloudy sky?", val:1, y:140}].map((inp,i) => (
          <g key={i}>
            <rect x="30" y={inp.y-12} width="120" height="32" rx="12" fill="#60a5fa20" stroke="#60a5fa60"/>
            <text x="90" y={inp.y+6} fill="#60a5fa" fontSize="12" textAnchor="middle">{inp.label}</text>
            <text x="165" y={inp.y+6} fill={inp.val ? "#60a5fa" : "#888"} fontSize="14" fontWeight="800">{inp.val}</text>
          </g>
        ))}

        {/* Neuron */}
        <circle cx="280" cy="100" r="48" fill={fire ? "#6366f140" : "#6366f120"} stroke={fire ? "#6366f1" : "#6366f180"} strokeWidth="4"/>
        <text x="280" y="88" fill="#a5b4fc" fontSize="12" textAnchor="middle">Sum + Bias</text>
        <text x="280" y="110" fill="#818cf8" fontSize="16" fontWeight="800" textAnchor="middle">2.4</text>

        {/* Output */}
        <rect x="360" y="70" width="80" height="60" rx="16" fill={fire ? "#34d39930" : "#ffffff10"} stroke={fire ? "#34d399" : "#aaa"} strokeWidth="2"/>
        <text x="400" y="106" fill={fire ? "#34d399" : "#bbb"} fontSize="16" textAnchor="middle" fontWeight="700">{fire ? "🌂 TAKE UMBRELLA" : "NO"}</text>
      </svg>
      <button onClick={() => setFire(!fire)} style={{marginTop:"20px", padding:"12px 28px", borderRadius:"40px", background: fire ? "#34d39930" : "#6366f130", color: fire ? "#34d399" : "#a5b4fc", border:"1px solid", fontWeight:"700", fontSize:"14px", cursor:"pointer"}}>
        {fire ? "🔥 Neuron Fired! (Decision = Take umbrella)" : "⚡ Activate Neuron → See Decision"}
      </button>
      <p className="callout callout-blue" style={{marginTop:"20px"}}>🧠 <strong>How it works:</strong> Each input gets a "weight". The neuron adds them up + bias. If total  threshold, it fires (YES)!</p>
    </div>
  );
}

function OverfitChart() {
  const [mode, setMode] = useState<"under" | "good" | "over">("good");
  const configs = {
    under: { label: "Underfitting (Too Simple)", color: "#f87171", train: 58, test: 55, desc: "Model didn't learn enough → bad at everything" },
    good: { label: "Good Fit (Just Right)", color: "#34d399", train: 89, test: 87, desc: "Learned patterns without memorizing" },
    over: { label: "Overfitting (Memorized)", color: "#fbbf24", train: 99, test: 64, desc: "Memorized training, but fails on new data" },
  };
  const c = configs[mode];

  return (
    <div className="diagram-container">
      <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"20px"}}>🎯 OVERFITTING vs UNDERFITTING (Why balance matters)</p>
      <div style={{display:"flex", gap:"12px", marginBottom:"24px", flexWrap:"wrap"}}>
        {(["under","good","over"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{padding:"8px 20px", borderRadius:"40px", background: mode===m ? `${configs[m].color}30` : "rgba(255,255,255,0.05)", border:`1px solid ${mode===m ? configs[m].color : "var(--rim1)"}`, color: mode===m ? configs[m].color : "var(--txt1)", fontWeight:"600", cursor:"pointer"}}>
            {configs[m].label}
          </button>
        ))}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px"}}>
        {[{label:"📚 Training Score (Homework)", val:c.train, color:"#a5b4fc"}, {label:"🎯 Test Score (Exam)", val:c.test, color:c.color}].map((item,i) => (
          <div key={i} style={{padding:"16px", background:"rgba(255,255,255,0.05)", borderRadius:"20px"}}>
            <div style={{display:"flex", justifyContent:"space-between", marginBottom:"12px", fontWeight:"600"}}>
              <span>{item.label}</span>
              <span style={{color:item.color}}>{item.val}%</span>
            </div>
            <div style={{height:"14px", background:"#ffffff20", borderRadius:"999px", overflow:"hidden"}}>
              <div style={{height:"100%", width:`${item.val}%`, background:item.color, transition:"width 0.6s"}}/>
            </div>
          </div>
        ))}
      </div>
      <div className="callout" style={{background:`${c.color}15`, borderColor:c.color}}>
        💡 {c.desc}
      </div>
    </div>
  );
}

function GradientDescentAnim() {
  const [ball, setBall] = useState(20);
  const [running, setRunning] = useState(false);

  const start = () => {
    setRunning(true);
    let pos = 20;
    const int = setInterval(() => {
      pos += (75 - pos) * 0.18;
      setBall(Math.round(pos));
      if (Math.abs(pos - 75) < 1) {
        clearInterval(int);
        setRunning(false);
        setBall(75);
      }
    }, 80);
  };

  return (
    <div className="diagram-container" style={{textAlign:"center"}}>
      <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"16px"}}>⛰️ GRADIENT DESCENT: ROLLING DOWN TO THE LOWEST POINT</p>
      <svg viewBox="0 0 400 160" style={{width:"100%", maxWidth:"450px", background:"rgba(0,0,0,0.35)", borderRadius:"20px", padding:"12px"}}>
        <path d="M 40 140 Q 90 100 140 70 Q 200 35 260 40 Q 320 45 360 60" fill="none" stroke="#f472b6" strokeWidth="5"/>
        <circle cx={ball*3.5 + 30} cy={140 - (ball*1.2)} r="10" fill="#6366f1" stroke="white" strokeWidth="2"/>
        <text x="30" y="150" fill="#aaa" fontSize="10">Start (High Error)</text>
        <text x="320" y="50" fill="#34d399" fontSize="10">Lowest Error (Goal!)</text>
      </svg>
      <button onClick={start} disabled={running} style={{marginTop:"20px", padding:"10px 28px", borderRadius:"40px", background:"#6366f130", color:"#a5b4fc", fontWeight:"700", cursor:"pointer"}}>
        {running ? "🏃‍♂️ Rolling downhill..." : "▶️ Start Gradient Descent (Find Best Path)"}
      </button>
      <p style={{fontSize:"14px", marginTop:"16px", color:"var(--txt1)"}}>The ball rolls down the hill step by step — that's how models learn to lower their error!</p>
    </div>
  );
}

function ActivationFnDiagram() {
  const [active, setActive] = useState<"relu" | "sigmoid">("relu");
  return (
    <div className="diagram-container">
      <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"16px"}}>🎛️ ACTIVATION FUNCTIONS: The "ON/OFF" Switch for Neurons</p>
      <div style={{display:"flex", gap:"12px", marginBottom:"20px"}}>
        <button onClick={() => setActive("relu")} style={{padding:"8px 20px", borderRadius:"40px", background: active==="relu" ? "#60a5fa30" : "transparent", border: active==="relu" ? "1px solid #60a5fa" : "1px solid var(--rim1)", fontWeight:"600", cursor:"pointer"}}>⚡ ReLU (Most Popular)</button>
        <button onClick={() => setActive("sigmoid")} style={{padding:"8px 20px", borderRadius:"40px", background: active==="sigmoid" ? "#f472b630" : "transparent", border: active==="sigmoid" ? "1px solid #f472b6" : "1px solid var(--rim1)", fontWeight:"600", cursor:"pointer"}}>📊 Sigmoid (Probability)</button>
      </div>
      <div className="callout" style={{background: active==="relu" ? "#60a5fa15" : "#f472b615", borderColor: active==="relu" ? "#60a5fa" : "#f472b6"}}>
        {active === "relu" ? (
          <><strong>🔹 ReLU:</strong> If input is negative → output 0 (neuron OFF). If positive → output same value (ON). Like "no negative thoughts"! Great for deep networks.</>
        ) : (
          <><strong>🔹 Sigmoid:</strong> Squashes any number between 0 and 1. Perfect for "probability" — like 0.8 means 80% chance!</>
        )}
      </div>
    </div>
  );
}

function PrecisionRecallDiagram() {
  return (
    <div className="diagram-container">
      <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"20px"}}>🎯 PRECISION vs RECALL (Two Ways to Be Right)</p>
      <div className="simple-grid">
        <div style={{background:"rgba(96,165,250,0.1)", borderRadius:"20px", padding:"20px"}}>
          <div style={{fontSize:"32px", marginBottom:"8px"}}>🎯</div>
          <h4 style={{fontSize:"20px", color:"#60a5fa"}}>Precision</h4>
          <p style={{fontSize:"14px", marginTop:"8px"}}>"When model says SPAM, how often is it actually SPAM?"<br/><strong>High precision = few false alarms.</strong></p>
        </div>
        <div style={{background:"rgba(52,211,153,0.1)", borderRadius:"20px", padding:"20px"}}>
          <div style={{fontSize:"32px", marginBottom:"8px"}}>🔍</div>
          <h4 style={{fontSize:"20px", color:"#34d399"}}>Recall</h4>
          <p style={{fontSize:"14px", marginTop:"8px"}}>"Of all actual SPAM emails, how many did we catch?"<br/><strong>High recall = catching almost all bad things.</strong></p>
        </div>
      </div>
      <div className="callout callout-blue">
        📌 <strong>Trade-off:</strong> Catch all spam (high recall) but might mark good email as spam (low precision). Find balance!
      </div>
    </div>
  );
}

// New Advanced Topic: Ensemble Methods (Simple Explanation)
function EnsembleDiagram() {
  return (
    <div className="diagram-container">
      <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"20px"}}>🤝 ENSEMBLE LEARNING: Asking Multiple Models</p>
      <div style={{display:"flex", justifyContent:"center", gap:"20px", flexWrap:"wrap", marginBottom:"20px"}}>
        {["Decision Tree 1", "Decision Tree 2", "Decision Tree 3"].map((model,i) => (
          <div key={i} style={{background:"rgba(167,139,250,0.2)", padding:"16px", borderRadius:"20px", textAlign:"center", width:"130px"}}>
            <div style={{fontSize:"28px"}}>🌳</div>
            <div>{model}</div>
            <div style={{fontSize:"12px", color:"#a78bfa"}}>Vote: {i===0 ? "Cat" : i===1 ? "Dog" : "Cat"}</div>
          </div>
        ))}
      </div>
      <div style={{background:"rgba(99,102,241,0.2)", borderRadius:"20px", padding:"20px", textAlign:"center"}}>
        <strong style={{fontSize:"20px"}}>🏆 FINAL RESULT: CAT (2 votes vs 1)</strong>
        <p style={{marginTop:"12px"}}>Ensemble = Combine multiple models → more accurate and stable!</p>
      </div>
    </div>
  );
}

// Advanced: CNN for Images (Simple)
function CNNDiagram() {
  return (
    <div className="diagram-container">
      <p style={{fontSize:"14px",fontWeight:"600",marginBottom:"20px"}}>🖼️ HOW AI SEES IMAGES (Convolutional Neural Networks)</p>
      <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", flexWrap:"wrap"}}>
        <div style={{background:"#2d2d44", padding:"12px", borderRadius:"16px", textAlign:"center"}}>
          <div style={{fontSize:"40px"}}>🐱</div>
          <div>Input Image</div>
        </div>
        <span style={{fontSize:"24px"}}>→</span>
        <div style={{background:"#2d2d44", padding:"12px", borderRadius:"16px", textAlign:"center"}}>
          <div style={{fontSize:"30px"}}>🔲🔲🔲</div>
          <div>Find Edges</div>
        </div>
        <span style={{fontSize:"24px"}}>→</span>
        <div style={{background:"#2d2d44", padding:"12px", borderRadius:"16px", textAlign:"center"}}>
          <div style={{fontSize:"30px"}}>👂👁️</div>
          <div>Find Parts</div>
        </div>
        <span style={{fontSize:"24px"}}>→</span>
        <div style={{background:"#34d39930", padding:"12px", borderRadius:"16px", textAlign:"center"}}>
          <div style={{fontSize:"30px"}}>🐱✅</div>
          <div>It's a CAT!</div>
        </div>
      </div>
      <p className="callout callout-blue" style={{marginTop:"20px"}}>🧩 CNN breaks image into small pieces, finds patterns (edges, shapes, objects), then decides!</p>
    </div>
  );
}

// ─── QUIZ & MATH COMPONENTS ────────────────────────────────────────────────
function Quiz({ q, options, correct }: { q: string; options: string[]; correct: number }) {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div style={{background:"rgba(255,255,255,0.04)", border:"1px solid var(--rim2)", borderRadius:"20px", padding:"24px", margin:"28px 0"}}>
      <p style={{fontSize:"16px", fontWeight:"700", marginBottom:"20px", color:"var(--txt0)"}}>📝 {q}</p>
      <div style={{display:"flex", flexDirection:"column", gap:"12px"}}>
        {options.map((o,i) => (
          <button key={i} onClick={() => selected===null && setSelected(i)}
            className={`quiz-btn ${selected!==null ? (i===correct?"correct":i===selected?"wrong":"") : ""}`}
            style={{fontSize:"14px", padding:"14px 20px"}}>
            {o}
          </button>
        ))}
      </div>
      {selected !== null && (
        <div style={{marginTop:"20px", padding:"14px", borderRadius:"14px", background: selected===correct?"rgba(52,211,153,0.15)":"rgba(248,113,113,0.15)", color: selected===correct?"#34d399":"#f87171", fontSize:"14px"}}>
          {selected===correct ? "✅ Correct! Great understanding." : `❌ Correct answer: ${options[correct]}`}
        </div>
      )}
    </div>
  );
}

function MathExplainer({title, formula, parts}: any) {
  return (
    <div className="math-box">
      <div style={{fontSize:"13px", color:"var(--txt2)", marginBottom:"10px"}}>{title}</div>
      <div style={{fontSize:"22px", color:"#a5b4fc", marginBottom:"20px", fontFamily:"monospace"}}>{formula}</div>
      {parts.map((p:any, i:number) => (
        <div key={i} style={{display:"flex", gap:"16px", marginBottom:"12px"}}>
          <code style={{color:p.color, minWidth:"70px", fontSize:"15px"}}>{p.symbol}</code>
          <span style={{color:"var(--txt1)"}}>{p.means}</span>
        </div>
      ))}
    </div>
  );
}

// ─── 8 SECTIONS (EXPANDED WITH ADVANCED TOPICS) ────────────────────────────
const SECTIONS = [
  { id: "basic", icon: "🌱", title: "1. Machine Learning Basics", color: "#60a5fa", tagline: "What is ML? Simple as teaching a child",
    topics: [
      { title: "What is Machine Learning? (Like Teaching a Pet)", badge: "MUST READ", badgeColor: "#60a5fa",
        content: (
          <>
            <p style={{fontSize:"16px", lineHeight:"1.9", color:"var(--txt1)", marginBottom:"20px"}}>
              Imagine teaching a dog: you don't explain rules like "if you see a ball, fetch it". You just show the ball many times, and the dog learns! 
              <strong> Machine Learning is exactly that — computers learn from examples instead of being programmed with rules.</strong>
            </p>
            <BrainLearningDiagram />
            <div className="simple-grid">
              <div className="callout callout-blue"><strong>✅ Traditional Programming:</strong> Rules + Data → Answer</div>
              <div className="callout callout-green"><strong>🤖 Machine Learning:</strong> Data + Answer → Learns Rules</div>
            </div>
            <Quiz q="What is the main idea of Machine Learning?" options={["Writing thousands of if-else rules", "Letting computer find patterns from examples", "Copying answers from internet", "Using calculators"]} correct={1} />
          </>
        )
      },
      { title: "3 Main Types of ML", badge: "SUPERVISED / UNSUPERVISED / RL", badgeColor: "#34d399",
        content: (
          <div className="simple-grid">
            {[
              {emoji:"📚", name:"Supervised Learning", desc:"Labeled examples like flashcards (cat/dog)", color:"#6366f1", ex:"Spam filter, price prediction"},
              {emoji:"🔍", name:"Unsupervised Learning", desc:"No labels — finds hidden groups", color:"#34d399", ex:"Customer segmentation"},
              {emoji:"🎮", name:"Reinforcement Learning", desc:"Learn by trial & rewards (like video game)", color:"#f59e0b", ex:"Game AI, robotics"}
            ].map((t,i) => (
              <div key={i} style={{padding:"24px", borderRadius:"24px", background:`${t.color}15`, border:`1px solid ${t.color}40`}}>
                <span style={{fontSize:"40px"}}>{t.emoji}</span>
                <h3 style={{margin:"12px 0 8px", fontSize:"22px"}}>{t.name}</h3>
                <p style={{color:"var(--txt1)", fontSize:"14px"}}>{t.desc}</p>
                <small style={{color:t.color}}>Example: {t.ex}</small>
              </div>
            ))}
          </div>
        )
      }
    ]
  },
  { id: "mathematics", icon: "📐", title: "2. Mathematics Behind ML", color: "#a78bfa", tagline: "Simple math that powers AI",
    topics: [
      { title: "Linear Regression (Drawing Best Line)", badge: "PREDICT NUMBERS", badgeColor: "#60a5fa", content: <><LinearRegressionDiagram /><MathExplainer title="Formula" formula="y = m × x + b" parts={[{symbol:"y",means:"What we want to predict (Price)",color:"#34d399"},{symbol:"m",means:"Slope (How steep line is)",color:"#f472b6"},{symbol:"b",means:"Starting point",color:"#fbbf24"}]} /><Quiz q="What does Linear Regression do?" options={["Classify cats vs dogs", "Draw a line to predict numbers", "Group customers", "Find hidden patterns"]} correct={1} /></> },
      { title: "Gradient Descent (Learning Step by Step)", badge: "HOW MODEL IMPROVES", badgeColor: "#f472b6", content: <GradientDescentAnim /> },
      { title: "Activation Functions (Neuron Switches)", badge: "NEURAL NETWORKS", badgeColor: "#34d399", content: <ActivationFnDiagram /> }
    ]
  },
  { id: "data", icon: "📊", title: "3. Data — The Fuel", color: "#34d399", tagline: "Understanding your data",
    topics: [
      { title: "Train/Test Split", badge: "CRITICAL", badgeColor: "#f472b6", content: <TrainTestDiagram /> },
      { title: "What is Good Data?", badge: "QUALITY MATTERS", badgeColor: "#60a5fa", content: <div className="simple-grid"><div className="callout callout-green">✅ Balanced classes</div><div className="callout callout-green">✅ Enough examples</div><div className="callout callout-green">✅ Clean and accurate</div></div> }
    ]
  },
  { id: "preprocessing", icon: "🧹", title: "4. Data Preprocessing", color: "#fbbf24", tagline: "Cleaning messy data",
    topics: [{ title: "Essential Cleaning Steps", badge: "PRACTICAL", badgeColor: "#fbbf24",
      content: (
        <div className="simple-grid">
          {["🧹 Handle missing values (fill or remove)", "📏 Scale numbers (so 0-100 becomes 0-1)", "🏷️ Convert text to numbers", "⚠️ Remove outliers (crazy values)"].map((s,i) => (
            <div key={i} style={{padding:"20px",background:"rgba(251,191,36,0.1)",borderRadius:"20px",border:"1px solid rgba(251,191,36,0.3)",fontSize:"15px"}}>{s}</div>
          ))}
        </div>
      )
    }]
  },
  { id: "feature-engineering", icon: "✨", title: "5. Feature Engineering", color: "#f472b6", tagline: "Creating smarter inputs",
    topics: [{ title: "Creating Magic Features", badge: "HIGH IMPACT", badgeColor: "#f472b6",
      content: <div><p style={{fontSize:"16px", lineHeight:"1.8", marginBottom:"20px"}}>🎯 <strong>Feature = Input to model.</strong> Good features = better predictions! Example: From "date" we create "IsWeekend", "Month", "Holiday".</p><div className="callout callout-blue">📌 "Better features often beat better algorithms" — ML experts say!</div></div>
    }]
  },
  { id: "model-creation", icon: "🧠", title: "6. Model Creation", color: "#6366f1", tagline: "Building the brain",
    topics: [
      { title: "How a Neuron Works", badge: "BUILDING BLOCK", badgeColor: "#6366f1", content: <NeuronDiagram /> },
      { title: "Neural Networks (Many Neurons Together)", badge: "DEEP LEARNING", badgeColor: "#f472b6", content: <div><p style={{fontSize:"16px"}}>Multiple layers of neurons: Input → Hidden Layers → Output. Each layer learns more complex patterns!</p><div className="callout callout-green">🌟 Deep Learning = Many hidden layers. That's how AI recognizes faces, translates languages!</div></div> }
    ]
  },
  { id: "model-evaluation", icon: "📏", title: "7. Model Evaluation", color: "#34d399", tagline: "Checking if model is good",
    topics: [
      { title: "Overfitting vs Underfitting", badge: "CRITICAL", badgeColor: "#f87171", content: <OverfitChart /> },
      { title: "Precision & Recall", badge: "METRICS", badgeColor: "#fbbf24", content: <PrecisionRecallDiagram /> }
    ]
  },
  { id: "prediction", icon: "🔮", title: "8. Prediction & Real Applications", color: "#2dd4bf", tagline: "ML in the real world",
    topics: [
      { title: "Making Predictions", badge: "INFERENCE", badgeColor: "#2dd4bf", content: <p style={{fontSize:"16px"}}>After training, model can predict instantly! Give new data → get answer in milliseconds (spam? price? cat or dog?)</p> },
      { title: "Where ML is Used Today", badge: "REAL WORLD", badgeColor: "#60a5fa",
        content: (
          <div className="simple-grid">
            {["🎬 Netflix Recommendations","📧 Gmail Spam Filter","📱 Face Unlock","🏥 Medical Diagnosis","💳 Fraud Detection","🚗 Self-driving Cars","💬 ChatGPT-like models","🎵 Spotify Playlists"].map((app,i) => (
              <div key={i} style={{padding:"18px", background:"rgba(96,165,250,0.1)", borderRadius:"20px", fontSize:"15px", fontWeight:"500"}}>{app}</div>
            ))}
          </div>
        )
      },
      { title: "Advanced: Ensemble Methods (Asking Multiple Models)", badge: "EXPERT", badgeColor: "#a78bfa", content: <EnsembleDiagram /> },
      { title: "Advanced: How AI Sees Images (CNN)", badge: "DEEP LEARNING", badgeColor: "#34d399", content: <CNNDiagram /> }
    ]
  }
];

export default function MLTutorialPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set([0]));

  const section = selected ? SECTIONS.find(s => s.id === selected) : null;
  const idx = SECTIONS.findIndex(s => s.id === selected);

  const goTo = (id: string) => {
    setSelected(id);
    setOpen(new Set([0]));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggle = (i: number) => {
    setOpen(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg0)", color: "var(--txt0)", fontFamily: "var(--fb)" }}>
      <style>{STYLES}</style>

      {/* Background Effect */}
      <div style={{position:"fixed", inset:0, zIndex:0, pointerEvents:"none", background:"radial-gradient(circle at 20% 30%, #0a0f1c, #03060f)"}} />

      {/* Navbar */}
      <nav style={{position:"sticky", top:0, zIndex:50, height:"72px", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 40px", background:"rgba(5,8,15,0.96)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--rim0)"}}>
        <div style={{display:"flex", alignItems:"center", gap:"14px"}}>
          <div style={{width:"40px", height:"40px", borderRadius:"14px", background:"linear-gradient(135deg,#6366f1,#a78bfa)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px"}}>🧠</div>
          <span style={{fontFamily:"var(--fd)", fontSize:"20px", fontWeight:"700"}}>ML Explained Simply</span>
        </div>
        <div>
          {selected && <button onClick={() => setSelected(null)} className="nav-pill">← All Sections</button>}
          <button onClick={() => router.push("/dashboard")} className="nav-pill" style={{marginLeft:"16px"}}>Dashboard</button>
        </div>
      </nav>

      <main style={{position:"relative", zIndex:1, width:"100%", maxWidth:"100%", margin:"0 auto", padding:"60px 40px 120px"}}>
        {!selected ? (
          <>
            <div style={{textAlign:"center", marginBottom:"80px"}}>
              <h1 style={{fontFamily:"var(--fd)", fontSize:"64px", fontWeight:"800", lineHeight:"1.05", letterSpacing:"-0.04em", background:"linear-gradient(135deg,#eef2f8,#a5b4fc)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent"}}>
                Machine Learning<br />Made Super Simple
              </h1>
              <p style={{fontSize:"19px", color:"var(--txt2)", maxWidth:"720px", margin:"24px auto 0", lineHeight:"1.6"}}>
                8 clear sections with diagrams and explanations that even a 5th grader can understand easily. Learn how AI really works!
              </p>
            </div>

            <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:"28px"}}>
              {SECTIONS.map((s, i) => (
                <div key={s.id} onClick={() => goTo(s.id)} className="sec-card rise" style={{animationDelay: `${i*50}ms`}}>
                  <div style={{padding:"42px 32px"}}>
                    <div style={{fontSize:"56px", marginBottom:"20px"}}>{s.icon}</div>
                    <h3 style={{fontFamily:"var(--fd)", fontSize:"26px", fontWeight:"700", marginBottom:"12px"}}>{s.title}</h3>
                    <p style={{color:"var(--txt2)", fontSize:"15px"}}>{s.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{marginBottom:"60px"}}>
              <div style={{display:"flex", alignItems:"center", gap:"24px", flexWrap:"wrap"}}>
                <span style={{fontSize:"72px"}}>{section?.icon}</span>
                <div>
                  <h1 style={{fontFamily:"var(--fd)", fontSize:"52px", fontWeight:"800", letterSpacing:"-0.03em"}}>{section?.title}</h1>
                  <p style={{color:"var(--txt2)", fontSize:"18px", marginTop:"8px"}}>{section?.tagline}</p>
                </div>
              </div>
            </div>

            <div className="full-width-content">
              {section?.topics.map((topic, i) => (
                <div key={i} className={`acc-item ${open.has(i) ? "open" : ""}`}>
                  <div className="acc-head" onClick={() => toggle(i)}>
                    <div style={{display:"flex", alignItems:"center", gap:"16px", flexWrap:"wrap"}}>
                      <span style={{fontSize:"26px"}}>📘</span>
                      <h3 style={{fontSize:"20px", fontWeight:"700"}}>{topic.title}</h3>
                      {topic.badge && <span style={{fontSize:"11px", padding:"4px 14px", borderRadius:"40px", background:`${topic.badgeColor}20`, color:topic.badgeColor, border:`1px solid ${topic.badgeColor}40`}}>{topic.badge}</span>}
                    </div>
                    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" style={{transform: open.has(i) ? "rotate(180deg)" : ""}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                  <div className={`acc-body ${open.has(i) ? "open" : ""}`}>
                    {topic.content}
                  </div>
                </div>
              ))}
            </div>

            <div style={{marginTop:"100px", padding:"48px 32px", borderRadius:"32px", background:"linear-gradient(145deg,rgba(99,102,241,0.2),rgba(167,139,250,0.08))", textAlign:"center", border:"1px solid rgba(99,102,241,0.4)"}}>
              <h3 style={{fontSize:"32px", marginBottom:"16px"}}>🎉 You completed the ML Journey!</h3>
              <p style={{color:"var(--txt1)", fontSize:"17px", maxWidth:"600px", margin:"0 auto 28px"}}>
                Now you understand how AI learns, from simple lines to neural networks. Ready to build your own model?
              </p>
              <button onClick={() => router.push("/dashboard")} style={{background:"linear-gradient(135deg,#6366f1,#818cf8)", color:"white", border:"none", padding:"16px 42px", borderRadius:"40px", fontSize:"16px", fontWeight:"700", cursor:"pointer", boxShadow:"0 8px 20px rgba(99,102,241,0.3)"}}>
                🚀 Go to Dashboard → Build Your First Model
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}