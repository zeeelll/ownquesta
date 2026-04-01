"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";

// ── Stylesheet (matches dashboard style) ─────────────────────────────────────
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
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.7;transform:scale(0.9)} }
  @keyframes bg-drift  { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-14px) scale(1.04)} 66%{transform:translate(-12px,10px) scale(0.97)} }
  @keyframes float-up  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

  .d0{animation-delay:0ms}  .d1{animation-delay:60ms}  .d2{animation-delay:120ms}
  .d3{animation-delay:180ms}.d4{animation-delay:240ms} .d5{animation-delay:300ms}

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

  /* ── Tutorial card ── */
  .tut-card {
    position:relative;
    border-radius:var(--r-xl);
    overflow:hidden;
    transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
    background:linear-gradient(155deg,var(--bg3) 0%,var(--bg2) 100%);
    border:1px solid var(--rim1);
    cursor:pointer;
  }
  .tut-card:hover {
    transform:translateY(-4px) scale(1.01);
    box-shadow:0 20px 50px rgba(0,0,0,0.4);
  }

  /* ── Step card ── */
  .step-card {
    display:flex; align-items:flex-start; gap:16px;
    padding:20px 22px; border-radius:var(--r-lg);
    border:1px solid; position:relative; overflow:hidden;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s;
  }
  .step-card:hover {
    transform:translateY(-3px);
    box-shadow:0 12px 36px rgba(0,0,0,0.32);
  }

  /* ── Code block ── */
  .code-block {
    background:rgba(0,0,0,0.3);
    border:1px solid var(--rim1);
    border-radius:var(--r-md);
    padding:16px 18px;
    font-family:var(--font-mono);
    font-size:12px;
    color:#94a3b8;
    overflow-x:auto;
    line-height:1.6;
  }
  .code-block pre { margin:0; }

  /* ── Accordion ── */
  .accordion-item {
    border:1px solid var(--rim1);
    border-radius:var(--r-md);
    margin-bottom:10px;
    overflow:hidden;
    transition:all 0.3s;
  }
  .accordion-item:hover { border-color:var(--rim2); }
  .accordion-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 18px; cursor:pointer;
    background:rgba(255,255,255,0.02);
    transition:background 0.2s;
  }
  .accordion-header:hover { background:rgba(255,255,255,0.04); }
  .accordion-content {
    padding:0 18px;
    max-height:0;
    overflow:hidden;
    transition:max-height 0.3s ease, padding 0.3s ease;
  }
  .accordion-content.open {
    max-height:2000px;
    padding:16px 18px;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width:8px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.2); border-radius:4px; }
  ::-webkit-scrollbar-thumb:hover { background:rgba(99,102,241,0.35); }

  ::selection { background:rgba(99,102,241,0.25); }

  @media(max-width:820px) {
    .tut-grid { grid-template-columns:1fr !important; }
  }
`;

// ── Tutorial Content Data ────────────────────────────────────────────────────
const TUTORIAL_SECTIONS = [
  {
    id: "intro",
    icon: "🚀",
    title: "Getting Started",
    color: "#60a5fa",
    topics: [
      {
        title: "What is Machine Learning?",
        content: `Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn from data and make decisions without being explicitly programmed. Instead of following rigid instructions, ML models identify patterns in data and use those patterns to make predictions.`
      },
      {
        title: "Types of Machine Learning",
        content: `
          <strong>Supervised Learning:</strong> Learn from labeled data (e.g., predicting house prices)
          <br/><br/>
          <strong>Unsupervised Learning:</strong> Find patterns in unlabeled data (e.g., customer segmentation)
          <br/><br/>
          <strong>Reinforcement Learning:</strong> Learn through trial and error (e.g., game playing AI)
        `
      }
    ]
  },
  {
    id: "workflow",
    icon: "⚙️",
    title: "ML Workflow",
    color: "#c084fc",
    topics: [
      {
        title: "1. Data Collection",
        content: `Gather relevant data from various sources. Quality and quantity of data are crucial for model performance. Your data should be representative of the problem you're trying to solve.`
      },
      {
        title: "2. Data Preprocessing",
        content: `Clean and prepare your data:
          <br/>• Handle missing values
          <br/>• Remove duplicates
          <br/>• Handle outliers
          <br/>• Encode categorical variables
          <br/>• Scale numerical features`
      },
      {
        title: "3. Exploratory Data Analysis (EDA)",
        content: `Understand your data through visualization and statistics:
          <br/>• Distribution of features
          <br/>• Correlations between variables
          <br/>• Identify patterns and anomalies
          <br/>• Feature importance`
      },
      {
        title: "4. Feature Engineering",
        content: `Create new features or transform existing ones to improve model performance. This is often where domain expertise becomes valuable.`
      },
      {
        title: "5. Model Selection",
        content: `Choose appropriate algorithms based on your problem type:
          <br/>• Classification: Logistic Regression, Random Forest, SVM
          <br/>• Regression: Linear Regression, Gradient Boosting
          <br/>• Clustering: K-Means, DBSCAN`
      },
      {
        title: "6. Model Training",
        content: `Train your model on the prepared data. Split data into training and validation sets (typically 80/20 or 70/30) to evaluate performance on unseen data.`
      },
      {
        title: "7. Model Evaluation",
        content: `Assess model performance using appropriate metrics:
          <br/>• Classification: Accuracy, Precision, Recall, F1-Score
          <br/>• Regression: RMSE, MAE, R²
          <br/>• Use cross-validation for robust evaluation`
      },
      {
        title: "8. Hyperparameter Tuning",
        content: `Optimize model parameters to improve performance using techniques like Grid Search or Random Search.`
      },
      {
        title: "9. Deployment",
        content: `Deploy your model to production where it can make predictions on new data in real-time.`
      }
    ]
  },
  {
    id: "algorithms",
    icon: "🧠",
    title: "Common Algorithms",
    color: "#34d399",
    topics: [
      {
        title: "Linear Regression",
        content: `<strong>Use Case:</strong> Predicting continuous values (e.g., house prices, sales)
          <br/><br/>
          <strong>How it works:</strong> Finds the best-fitting line through data points to model relationships between variables.
          <br/><br/>
          <strong>Pros:</strong> Simple, interpretable, fast
          <br/><strong>Cons:</strong> Assumes linear relationships, sensitive to outliers`
      },
      {
        title: "Logistic Regression",
        content: `<strong>Use Case:</strong> Binary classification (e.g., spam detection, churn prediction)
          <br/><br/>
          <strong>How it works:</strong> Uses a sigmoid function to model probability of class membership.
          <br/><br/>
          <strong>Pros:</strong> Probabilistic output, interpretable
          <br/><strong>Cons:</strong> Assumes linear decision boundary`
      },
      {
        title: "Decision Trees",
        content: `<strong>Use Case:</strong> Both classification and regression tasks
          <br/><br/>
          <strong>How it works:</strong> Makes decisions by splitting data based on feature values, creating a tree-like structure.
          <br/><br/>
          <strong>Pros:</strong> Easy to interpret, handles non-linear relationships
          <br/><strong>Cons:</strong> Prone to overfitting, unstable`
      },
      {
        title: "Random Forest",
        content: `<strong>Use Case:</strong> Complex classification and regression problems
          <br/><br/>
          <strong>How it works:</strong> Ensemble of decision trees that vote on predictions.
          <br/><br/>
          <strong>Pros:</strong> High accuracy, reduces overfitting, handles missing values
          <br/><strong>Cons:</strong> Less interpretable, slower training`
      },
      {
        title: "Support Vector Machines (SVM)",
        content: `<strong>Use Case:</strong> Classification with clear margin of separation
          <br/><br/>
          <strong>How it works:</strong> Finds the optimal hyperplane that maximally separates classes.
          <br/><br/>
          <strong>Pros:</strong> Effective in high dimensions, memory efficient
          <br/><strong>Cons:</strong> Slow on large datasets, requires feature scaling`
      },
      {
        title: "K-Nearest Neighbors (KNN)",
        content: `<strong>Use Case:</strong> Classification and regression based on similarity
          <br/><br/>
          <strong>How it works:</strong> Classifies data points based on majority vote of k nearest neighbors.
          <br/><br/>
          <strong>Pros:</strong> Simple, no training phase
          <br/><strong>Cons:</strong> Slow prediction, sensitive to scale and irrelevant features`
      },
      {
        title: "Gradient Boosting (XGBoost, LightGBM)",
        content: `<strong>Use Case:</strong> Winning solution for many competitions, handles complex patterns
          <br/><br/>
          <strong>How it works:</strong> Builds models sequentially, each correcting errors of previous ones.
          <br/><br/>
          <strong>Pros:</strong> High accuracy, handles missing values, feature importance
          <br/><strong>Cons:</strong> Prone to overfitting, requires careful tuning`
      },
      {
        title: "K-Means Clustering",
        content: `<strong>Use Case:</strong> Customer segmentation, pattern discovery
          <br/><br/>
          <strong>How it works:</strong> Groups data into k clusters based on similarity.
          <br/><br/>
          <strong>Pros:</strong> Fast, scalable, simple
          <br/><strong>Cons:</strong> Must specify k, sensitive to outliers`
      }
    ]
  },
  {
    id: "evaluation",
    icon: "📊",
    title: "Model Evaluation",
    color: "#f59e0b",
    topics: [
      {
        title: "Classification Metrics",
        content: `<strong>Accuracy:</strong> (TP + TN) / Total — Overall correctness
          <br/><br/>
          <strong>Precision:</strong> TP / (TP + FP) — How many predicted positives are actually positive
          <br/><br/>
          <strong>Recall (Sensitivity):</strong> TP / (TP + FN) — How many actual positives were captured
          <br/><br/>
          <strong>F1-Score:</strong> Harmonic mean of precision and recall — Balance between precision and recall
          <br/><br/>
          <strong>ROC-AUC:</strong> Area under ROC curve — Model's ability to distinguish between classes`
      },
      {
        title: "Regression Metrics",
        content: `<strong>Mean Absolute Error (MAE):</strong> Average absolute difference between predicted and actual values
          <br/><br/>
          <strong>Mean Squared Error (MSE):</strong> Average squared difference — Penalizes large errors more
          <br/><br/>
          <strong>Root Mean Squared Error (RMSE):</strong> Square root of MSE — In same units as target
          <br/><br/>
          <strong>R² Score:</strong> Proportion of variance explained — 1 is perfect, 0 is baseline`
      },
      {
        title: "Cross-Validation",
        content: `Split data into k folds, train on k-1 folds and validate on remaining fold. Repeat k times. This provides a more robust estimate of model performance and helps detect overfitting.
          <br/><br/>
          <strong>Common approaches:</strong>
          <br/>• K-Fold Cross-Validation
          <br/>• Stratified K-Fold (maintains class distribution)
          <br/>• Time Series Split (for temporal data)`
      },
      {
        title: "Confusion Matrix",
        content: `A table showing correct and incorrect predictions:
          <br/><br/>
          • <strong>True Positives (TP):</strong> Correctly predicted positive
          <br/>• <strong>True Negatives (TN):</strong> Correctly predicted negative
          <br/>• <strong>False Positives (FP):</strong> Incorrectly predicted positive
          <br/>• <strong>False Negatives (FN):</strong> Incorrectly predicted negative`
      }
    ]
  },
  {
    id: "best-practices",
    icon: "✨",
    title: "Best Practices",
    color: "#ec4899",
    topics: [
      {
        title: "Data Splitting",
        content: `Always split your data into separate sets:
          <br/><br/>
          • <strong>Training Set (60-80%):</strong> Used to train the model
          <br/>• <strong>Validation Set (10-20%):</strong> Used to tune hyperparameters
          <br/>• <strong>Test Set (10-20%):</strong> Final evaluation on unseen data
          <br/><br/>
          Never use test data during training or tuning — it should remain completely unseen until final evaluation.`
      },
      {
        title: "Handling Overfitting",
        content: `Overfitting occurs when model memorizes training data instead of learning patterns:
          <br/><br/>
          <strong>Prevention techniques:</strong>
          <br/>• Use more training data
          <br/>• Feature selection / dimensionality reduction
          <br/>• Regularization (L1, L2)
          <br/>• Cross-validation
          <br/>• Early stopping
          <br/>• Ensemble methods`
      },
      {
        title: "Feature Scaling",
        content: `Many algorithms require features to be on similar scales:
          <br/><br/>
          • <strong>Standardization:</strong> (x - mean) / std — Centers data around 0
          <br/>• <strong>Normalization:</strong> (x - min) / (max - min) — Scales to [0, 1]
          <br/><br/>
          Required for: SVM, KNN, Neural Networks, Gradient Descent-based algorithms`
      },
      {
        title: "Handling Imbalanced Data",
        content: `When one class dominates the dataset:
          <br/><br/>
          <strong>Techniques:</strong>
          <br/>• Oversampling minority class (SMOTE)
          <br/>• Undersampling majority class
          <br/>• Class weights adjustment
          <br/>• Use appropriate metrics (F1, ROC-AUC instead of accuracy)
          <br/>• Ensemble methods`
      },
      {
        title: "Feature Importance",
        content: `Understand which features drive predictions:
          <br/><br/>
          • Tree-based models provide built-in feature importance
          <br/>• Use SHAP values for detailed explanations
          <br/>• Remove irrelevant features to reduce noise
          <br/>• Domain expertise helps interpret importance`
      },
      {
        title: "Model Interpretability",
        content: `Make your models explainable:
          <br/><br/>
          • Use simpler models when possible (Linear, Decision Trees)
          <br/>• LIME and SHAP for black-box explanations
          <br/>• Feature importance plots
          <br/>• Partial dependence plots
          <br/>• Document assumptions and limitations`
      }
    ]
  },
  {
    id: "tips",
    icon: "💡",
    title: "Pro Tips",
    color: "#8b5cf6",
    topics: [
      {
        title: "Start Simple",
        content: `Always begin with simple baseline models (Linear Regression, Logistic Regression) before trying complex ones. Simple models:
          <br/>• Train faster
          <br/>• Easier to debug
          <br/>• More interpretable
          <br/>• Often perform surprisingly well
          <br/><br/>
          Move to complex models only if simple ones underperform.`
      },
      {
        title: "Understand Your Data First",
        content: `Spend significant time on EDA before modeling:
          <br/>• What do distributions look like?
          <br/>• Are there missing values?
          <br/>• Are there outliers?
          <br/>• What are the relationships between features?
          <br/><br/>
          Good understanding of data > fancy algorithms.`
      },
      {
        title: "Feature Engineering is Key",
        content: `Often more important than algorithm choice:
          <br/>• Create domain-specific features
          <br/>• Combine existing features
          <br/>• Extract time-based features from dates
          <br/>• One-hot encode categorical variables
          <br/>• Create interaction terms`
      },
      {
        title: "Monitor for Data Drift",
        content: `In production, data distributions can change over time:
          <br/>• Set up monitoring
          <br/>• Track prediction distributions
          <br/>• Compare with training data
          <br/>• Retrain models periodically
          <br/>• A/B test new models`
      },
      {
        title: "Version Control Everything",
        content: `Track not just code, but also:
          <br/>• Data versions
          <br/>• Model versions
          <br/>• Hyperparameters
          <br/>• Metrics and results
          <br/>• Use tools like MLflow, DVC, or Weights & Biases`
      },
      {
        title: "Learn from Kaggle",
        content: `Kaggle competitions are excellent learning resources:
          <br/>• Study winning solutions
          <br/>• Read discussion forums
          <br/>• Participate in competitions
          <br/>• Practice on diverse datasets
          <br/>• Learn from the community`
      }
    ]
  }
];

// ── Components ────────────────────────────────────────────────────────────────
function TutorialCard({ section, onClick, delay }: any) {
  return (
    <div 
      className="tut-card rise" 
      onClick={onClick}
      style={{ animationDelay:`${delay}ms` }}
    >
      {/* Glow orb */}
      <div style={{
        position:"absolute", top:-30, right:-16, width:100, height:100,
        borderRadius:"50%", background:section.color, filter:"blur(36px)", 
        opacity:0.12, pointerEvents:"none",
      }}/>
      
      {/* Bottom accent */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:1,
        background:`linear-gradient(90deg, ${section.color}50, transparent)`, 
        opacity:0.7,
      }}/>

      <div style={{ padding:"24px 26px", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
          <div style={{
            width:48, height:48, borderRadius:14, flexShrink:0,
            background:`linear-gradient(140deg, ${section.color}14, ${section.color}05)`,
            border:`1px solid ${section.color}25`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22,
          }}>{section.icon}</div>
          
          <div style={{ flex:1 }}>
            <h3 style={{
              fontFamily:"var(--font-display)", fontSize:17, fontWeight:700,
              color:"var(--txt0)", letterSpacing:"-0.02em",
            }}>{section.title}</h3>
            <p style={{
              fontFamily:"var(--font-mono)", fontSize:9, color:"var(--txt2)",
              marginTop:4, letterSpacing:"0.05em",
            }}>{section.topics.length} Topics</p>
          </div>

          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--txt2)">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
          </svg>
        </div>

        <div style={{
          height:1.5, borderRadius:100,
          background:`linear-gradient(90deg, ${section.color}70, ${section.color}18, transparent)`,
          width:"40%",
        }}/>
      </div>
    </div>
  );
}

function AccordionItem({ topic, isOpen, onToggle }: any) {
  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={onToggle}>
        <h4 style={{
          fontFamily:"var(--font-body)", fontSize:14, fontWeight:600,
          color:"var(--txt0)", letterSpacing:"-0.01em",
        }}>{topic.title}</h4>
        <svg 
          width="14" 
          height="14" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="var(--txt1)"
          style={{ 
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s"
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div 
          style={{
            fontFamily:"var(--font-body)", 
            fontSize:13, 
            color:"var(--txt1)",
            lineHeight:1.8,
          }}
          dangerouslySetInnerHTML={{ __html: topic.content }}
        />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MLTutorialPage() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [openTopics, setOpenTopics] = useState<Set<number>>(new Set());

  const currentSection = selectedSection 
    ? TUTORIAL_SECTIONS.find(s => s.id === selectedSection) 
    : null;

  const toggleTopic = (index: number) => {
    setOpenTopics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(170deg,#060b18 0%,#050910 50%,#040711 100%)" }}/>
        <div style={{
          position:"absolute", inset:0, opacity:0.022,
          backgroundImage:"radial-gradient(circle, rgba(148,163,184,0.9) 1px, transparent 1px)",
          backgroundSize:"32px 32px",
        }}/>
        <div style={{
          position:"absolute", top:"8%", left:"30%", width:700, height:700,
          background:"radial-gradient(circle,rgba(192,132,252,0.045) 0%,transparent 65%)",
          borderRadius:"50%", animation:"bg-drift 24s ease infinite",
        }}/>
        <div style={{
          position:"absolute", bottom:"12%", right:"8%", width:460, height:460,
          background:"radial-gradient(circle,rgba(99,102,241,0.035) 0%,transparent 65%)",
          borderRadius:"50%", animation:"bg-drift 32s ease infinite reverse",
        }}/>
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", opacity:0.012 }}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)"/>
        </svg>
      </div>

      {/* ── Navigation ── */}
      <nav style={{
        position:"relative", zIndex:10, height:56,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 26px",
        borderBottom:"1px solid var(--rim0)",
        background:"rgba(5,8,17,0.82)",
        backdropFilter:"blur(28px)",
      }}>
        <div style={{
          position:"absolute", bottom:0, left:0, right:0, height:1,
          background:"linear-gradient(90deg,transparent,rgba(192,132,252,0.14),rgba(99,102,241,0.1),transparent)",
        }}/>

        <Logo href="/home" size="md"/>

        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <button onClick={() => router.push("/dashboard")} className="nav-pill">
            <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Dashboard
          </button>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main style={{
        position:"relative", zIndex:1,
        maxWidth:1200, margin:"0 auto",
        padding:"48px 24px 96px",
      }}>
        
        {!selectedSection ? (
          // ── Section Selection View ──
          <>
            <div className="rise d0" style={{ marginBottom:40 }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
                <span style={{
                  width:5, height:5, borderRadius:"50%",
                  background:"#c084fc",
                  boxShadow:"0 0 8px rgba(192,132,252,0.7)",
                  display:"inline-block",
                  animation:"pulse-dot 2.4s ease infinite",
                }}/>
                <span style={{
                  fontFamily:"var(--font-mono)", fontSize:9, fontWeight:400,
                  letterSpacing:"0.14em", textTransform:"uppercase", color:"var(--txt2)",
                }}>Interactive Learning</span>
              </div>

              <h1 style={{
                fontFamily:"var(--font-display)", fontSize:34, fontWeight:800,
                letterSpacing:"-0.04em", lineHeight:1.1, color:"var(--txt0)",
                marginBottom:12,
              }}>
                Machine Learning{" "}
                <span style={{
                  background:"linear-gradient(120deg,#a5b4fc 0%,#c084fc 50%,#ec4899 100%)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  backgroundClip:"text",
                }}>Tutorial</span>
              </h1>
              
              <p style={{
                fontFamily:"var(--font-body)", fontSize:14, color:"var(--txt2)",
                fontWeight:400, lineHeight:1.7, maxWidth:560,
              }}>
                Master the fundamentals of machine learning. From basic concepts to advanced techniques, learn everything you need to build powerful ML models.
              </p>
            </div>

            <div className="tut-grid" style={{ 
              display:"grid", 
              gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", 
              gap:16 
            }}>
              {TUTORIAL_SECTIONS.map((section, i) => (
                <TutorialCard
                  key={section.id}
                  section={section}
                  onClick={() => setSelectedSection(section.id)}
                  delay={i * 60}
                />
              ))}
            </div>
          </>
        ) : (
          // ── Topic Detail View ──
          <>
            <button 
              onClick={() => {
                setSelectedSection(null);
                setOpenTopics(new Set());
              }}
              className="nav-pill rise d0"
              style={{ marginBottom:32 }}
            >
              <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              Back to Topics
            </button>

            <div className="rise d1" style={{ marginBottom:32 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                <div style={{
                  width:56, height:56, borderRadius:16, flexShrink:0,
                  background:`linear-gradient(140deg, ${currentSection?.color}14, ${currentSection?.color}05)`,
                  border:`1px solid ${currentSection?.color}25`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:26,
                  boxShadow:`0 0 20px ${currentSection?.color}15`,
                }}>{currentSection?.icon}</div>
                
                <div>
                  <h1 style={{
                    fontFamily:"var(--font-display)", fontSize:28, fontWeight:800,
                    color:"var(--txt0)", letterSpacing:"-0.03em",
                  }}>{currentSection?.title}</h1>
                  <p style={{
                    fontFamily:"var(--font-mono)", fontSize:10, color:"var(--txt2)",
                    marginTop:4, letterSpacing:"0.05em",
                  }}>{currentSection?.topics.length} Topics to Explore</p>
                </div>
              </div>

              <div style={{
                height:2, borderRadius:100,
                background:`linear-gradient(90deg, ${currentSection?.color}70, ${currentSection?.color}18, transparent)`,
                width:"30%",
              }}/>
            </div>

            <div className="rise d2">
              {currentSection?.topics.map((topic, index) => (
                <AccordionItem
                  key={index}
                  topic={topic}
                  isOpen={openTopics.has(index)}
                  onToggle={() => toggleTopic(index)}
                />
              ))}
            </div>

            {/* Quick actions */}
            <div className="rise d3" style={{ 
              marginTop:48, 
              padding:"28px 32px", 
              borderRadius:"var(--r-xl)",
              background:"linear-gradient(145deg, rgba(99,102,241,0.08), rgba(192,132,252,0.04))",
              border:"1px solid rgba(99,102,241,0.15)",
            }}>
              <h3 style={{
                fontFamily:"var(--font-display)", fontSize:18, fontWeight:700,
                color:"var(--txt0)", marginBottom:12, letterSpacing:"-0.02em",
              }}>Ready to practice?</h3>
              <p style={{
                fontFamily:"var(--font-body)", fontSize:13, color:"var(--txt1)",
                lineHeight:1.7, marginBottom:20,
              }}>
                Apply what you've learned by starting a new ML project. Upload your dataset and let our AI-powered pipeline guide you through the entire workflow.
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  background:"linear-gradient(140deg,#4f4fdc 0%,#6366f1 55%,#8b5cf6 100%)",
                  color:"#fff", border:"none", cursor:"pointer",
                  fontFamily:"var(--font-body)", fontWeight:700,
                  borderRadius:12, padding:"11px 22px", fontSize:13,
                  boxShadow:"0 4px 16px rgba(99,102,241,0.28)",
                  transition:"transform 0.22s, box-shadow 0.22s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px) scale(1.015)";
                  e.currentTarget.style.boxShadow = "0 10px 28px rgba(99,102,241,0.42)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.28)";
                }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Start New Project
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}