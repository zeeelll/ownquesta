'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
	ArrowLeft,
	ArrowRight,
	BarChart3,
	Brain,
	CheckCircle2,
	Database,
	Globe2,
	History,
	Layers3,
	Lightbulb,
	Lock,
	Sparkles,
	Wrench,
	TrendingUp,
	Target,
	AlertCircle,
	CheckSquare,
	XCircle,
	Code2,
	ChevronDown,
	ChevronUp,
} from 'lucide-react';
import Logo from '../components/Logo';

/* ─────────────────────────── types ─────────────────────────── */
type SectionType =
	| 'text'
	| 'timeline'
	| 'comparison'
	| 'process'
	| 'metrics'
	| 'examples'
	| 'diagram'
	| 'code'
	| 'visual_chart';

type Section = {
	title: string;
	content: string;
	type: SectionType;
	data?: any;
};

type StepData = {
	id: number;
	title: string;
	shortDescription: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	content: {
		intro: string;
		sections: Section[];
		keyTakeaways: string[];
	};
};

/* ─────────────────────────── helpers ─────────────────────────── */
const STORAGE_KEY = 'ownquesta_ml_tutorial_progress_v1';

/* ═══════════════════════════════════════════════════════════════
   TUTORIAL DATA  (all 8 steps, massively expanded)
═══════════════════════════════════════════════════════════════ */
const TUTORIAL_STEPS: StepData[] = [
	/* ───────────────────────── STEP 1 ───────────────────────── */
	{
		id: 1,
		title: 'History of Machine Learning',
		shortDescription: 'How ML started and became part of everyday life.',
		icon: History,
		content: {
			intro:
				"Machine Learning has evolved from theoretical concepts to practical applications touching nearly every aspect of modern life. Understanding this 80-year journey reveals why today's AI explosion was inevitable—and what's coming next.",
			sections: [
				{
					title: 'The Evolution Timeline',
					type: 'timeline',
					content:
						'Machine Learning progressed through distinct eras, each marked by breakthroughs that unlocked new possibilities.',
					data: [
						{
							year: '1943–1950s',
							event: 'Early Foundations',
							description:
								"McCulloch & Pitts model the first artificial neuron (1943). Turing proposes the Imitation Game / Turing Test (1950). Hebb's learning rule explains synaptic plasticity.",
						},
						{
							year: '1956',
							event: 'Birth of AI',
							description:
								'Dartmouth Conference coins "Artificial Intelligence." McCarthy, Minsky, Shannon gather to formalise the field. Logic Theorist program proves 38 of 52 mathematical theorems.',
						},
						{
							year: '1960s–1970s',
							event: 'Perceptrons & First Winter',
							description:
								'Rosenblatts Perceptron (1958) learns to classify patterns. Minsky & Papert prove XOR limitation (1969), triggering first AI winter. Funding collapses.',
						},
						{
							year: '1980s',
							event: 'Backpropagation Renaissance',
							description:
								'Rumelhart & Hinton popularise backpropagation (1986), reviving neural nets. Decision Trees (C4.5), SVMs, and expert systems emerge. Second AI winter follows due to hardware limits.',
						},
						{
							year: '1997',
							event: 'Deep Blue & Statistical ML',
							description:
								'IBM Deep Blue defeats Kasparov. LSTM (Hochreiter & Schmidhuber) solves vanishing gradients. Statistical learning theory (Vapnik) gains traction.',
						},
						{
							year: '2006–2012',
							event: 'Deep Learning Revolution',
							description:
								"Hinton's deep belief networks (2006) unlock deep architectures. ImageNet competition (2012): AlexNet cuts error rate by 10%, shocking the field. GPU training becomes viable.",
						},
						{
							year: '2017',
							event: 'Transformer Architecture',
							description:
								'"Attention Is All You Need" (Vaswani et al.) introduces Transformers. BERT, GPT follow. Attention mechanisms replace RNNs for language, then vision.',
						},
						{
							year: '2020–Present',
							event: 'Foundation Models & GenAI',
							description:
								'GPT-3 (175B params), AlphaFold 2 (protein structures), Stable Diffusion, ChatGPT (100M users in 60 days). AI becomes a mainstream product category.',
						},
					],
				},
				{
					title: 'Key Technological Enablers',
					type: 'examples',
					content:
						'Three converging forces made modern ML possible:',
					data: [
						{
							name: 'GPU Computing',
							impact:
								'NVIDIA CUDA (2007) enabled parallel matrix operations. Training time dropped from months to hours. A100 GPUs deliver 312 TFLOPS—1000× a 2010 CPU.',
						},
						{
							name: 'Big Data Explosion',
							impact:
								'Internet users generate 2.5 quintillion bytes/day. ImageNet (14M images), Common Crawl (petabytes of text) provided fuel for large models.',
						},
						{
							name: 'Cloud Computing',
							impact:
								'AWS SageMaker, Google Vertex AI, Azure ML let any team rent GPU clusters by the hour. Democratised access beyond large labs.',
						},
						{
							name: 'Open-Source Ecosystem',
							impact:
								'scikit-learn (2011), TensorFlow (2015), PyTorch (2016) cut development time from years to days. Hugging Face hosts 500K+ pre-trained models.',
						},
					],
				},
				{
					title: 'Algorithmic Milestones at a Glance',
					type: 'visual_chart',
					content: 'Key algorithms and the decade they went mainstream:',
					data: {
						type: 'horizontal_bar',
						items: [
							{ label: 'Linear Regression', decade: '1800s', bar: 10, color: '#38bdf8' },
							{ label: 'Perceptron', decade: '1958', bar: 20, color: '#818cf8' },
							{ label: 'Decision Trees', decade: '1986', bar: 35, color: '#c084fc' },
							{ label: 'SVMs', decade: '1995', bar: 50, color: '#f472b6' },
							{ label: 'Random Forest', decade: '2001', bar: 62, color: '#34d399' },
							{ label: 'Deep CNNs', decade: '2012', bar: 75, color: '#facc15' },
							{ label: 'Transformers', decade: '2017', bar: 88, color: '#fb923c' },
							{ label: 'LLMs / GenAI', decade: '2020+', bar: 100, color: '#f87171' },
						],
					},
				},
				{
					title: 'From Lab to Everyday Life',
					type: 'text',
					content:
						"The smartphone in your pocket runs dozens of ML models simultaneously—speech recognition, face unlock, autocorrect, camera scene detection. What once required a $10M supercomputer in 1990 now runs in a browser tab. This democratisation happened because hardware costs fell on an exponential curve (Moore's Law), data availability exploded with the internet, and open-source frameworks eliminated reinventing the wheel. The key insight: ML isn't magic—it's pattern matching at industrial scale, made possible by cheap compute and abundant data.",
				},
			],
			keyTakeaways: [
				'ML evolved over 80+ years; breakthroughs cluster around new hardware capabilities',
				'Backpropagation (1986), GPUs (2007), and Transformers (2017) were the three biggest inflection points',
				'GPU computing, big data, and open-source ecosystems jointly unlocked modern AI',
				'AlexNet 2012 and GPT-3 2020 are the two most impactful demonstrations of scale',
				'Understanding history prevents repeating mistakes of previous AI winters',
			],
		},
	},

	/* ───────────────────────── STEP 2 ───────────────────────── */
	{
		id: 2,
		title: 'Why Machine Learning',
		shortDescription: 'Why we use ML instead of writing every rule by hand.',
		icon: Lightbulb,
		content: {
			intro:
				"Traditional programming requires humans to explicitly define every rule. ML flips this: instead of programming rules, you provide examples and let the system discover patterns. Understanding when and why to use ML is the first engineering decision you'll make on every project.",
			sections: [
				{
					title: 'The Paradigm Shift',
					type: 'comparison',
					content: 'Two fundamentally different philosophies for solving problems:',
					data: {
						traditional: {
							approach: 'Rules + Data → Answers',
							strengths: [
								'Fully predictable and auditable',
								'Works with tiny datasets',
								'Easy to debug (traceable logic)',
								'No training time or compute cost',
							],
							weaknesses: [
								'Cannot handle exponential rule complexity',
								'Brittle to edge cases and variation',
								'Maintenance burden grows linearly with complexity',
								'Cannot discover patterns humans miss',
							],
							examples: ['Calculator', 'Form validation', 'IF-THEN business rules', 'Hard-coded game AI'],
						},
						ml: {
							approach: 'Data + Answers → Rules',
							strengths: [
								'Handles millions of edge cases automatically',
								'Adapts when data patterns shift',
								'Discovers non-obvious correlations',
								'Performance improves with more data',
							],
							weaknesses: [
								'Requires large labelled datasets',
								'Predictions can be unexplainable',
								'Debugging requires specialised skills',
								'Training is compute-intensive',
							],
							examples: [
								'Spam detection',
								'Image recognition',
								'Language translation',
								'Fraud detection',
							],
						},
					},
				},
				{
					title: 'The Spam Filter Story: Rules vs ML',
					type: 'text',
					content:
						"In 1995 a rule-based spam filter checked: does this email contain 'FREE', 'WIN', 'LOTTERY'? Spammers immediately responded: 'FR.EE', 'W!N'. You add more rules. They adapt within hours. By 2000, rule-based filters had 10,000+ rules and still let 30% of spam through. Naive Bayes ML (1998) changed everything: show it 50,000 spam/ham examples, it learns statistical fingerprints of spam—unusual character frequencies, suspicious sender patterns, link-to-text ratios. When spammers changed tactics, you simply retrained with new examples. Today's neural spam filters catch 99.9%+ because they learn from billions of fresh examples continuously. This is ML's core value proposition: the cost of improving is collecting data, not rewriting code.",
				},
				{
					title: 'When ML Beats Rules: Decision Framework',
					type: 'process',
					content:
						'Use this checklist before choosing ML over traditional programming:',
					data: [
						{
							step: 'Ask: Can I write the rules?',
							description:
								'If you can exhaustively enumerate all decision paths (< ~50 rules), traditional programming is simpler, cheaper, and more maintainable.',
							detail:
								'Example: Tax bracket calculation—clear rules, no ML needed.',
							challenges: '',
						},
						{
							step: 'Ask: Is the data labelled and available?',
							description:
								'ML requires examples with correct answers (supervised) or at least large volumes of data (unsupervised). No data = no ML.',
							detail: '10K samples minimum for simple tasks; millions for deep learning.',
							challenges: 'Labelling cost can exceed model development cost.',
						},
						{
							step: 'Ask: Do patterns change over time?',
							description:
								'If the rules drift (fraud tactics, user preferences), ML handles retraining automatically. Static problems favour hard-coded logic.',
							detail: 'Email spam patterns shift daily; tax rules change annually.',
							challenges: '',
						},
						{
							step: 'Ask: Is the signal-to-noise ratio adequate?',
							description:
								'ML needs a learnable signal. Purely random phenomena (lottery numbers) cannot be predicted.',
							detail:
								'Test: can a domain expert predict better than chance? If not, ML cannot either.',
							challenges: '',
						},
						{
							step: 'Ask: What is the cost of errors?',
							description:
								'Medical diagnosis mistakes can be fatal. When stakes are high, ML must be paired with human oversight and uncertainty quantification.',
							detail: '',
							challenges: 'High-stakes decisions may require explainability regulations (EU AI Act).',
						},
					],
				},
				{
					title: 'Real-World Performance Gains',
					type: 'metrics',
					content: 'Documented improvements of ML over rule-based systems:',
					data: [
						{ metric: 'Spam Detection Accuracy', traditional: '85–90%', ml: '99.9%', improvement: '+10–15pp' },
						{ metric: 'Image Classification (ImageNet)', traditional: '~75% (rules/hand features)', ml: '99%+', improvement: '+24pp' },
						{ metric: 'Language Translation (BLEU)', traditional: '20 (phrase tables)', ml: '45+ (Transformers)', improvement: '+125%' },
						{ metric: 'Fraud Detection F1', traditional: '0.60', ml: '0.92', improvement: '+53%' },
						{ metric: 'Medical Imaging (diabetic retinopathy)', traditional: '~70% sensitivity', ml: '97% sensitivity', improvement: '+27pp' },
					],
				},
				{
					title: 'The ML Landscape: What Can Go Wrong',
					type: 'examples',
					content:
						'ML is not always the answer. Common failure modes when ML is misapplied:',
					data: [
						{
							name: 'Data Hunger on Small Problems',
							impact:
								'Applying a neural network to 500 rows of tabular data. Logistic regression outperforms by 15% with 100× less effort.',
						},
						{
							name: 'Hidden Feedback Loops',
							impact:
								'Predictive policing sends more police to high-crime areas → more arrests → more predicted crime. The model amplifies systemic bias.',
						},
						{
							name: 'Spurious Correlations',
							impact:
								'A hospital model predicted pneumonia patients were low-risk if they also had asthma—because asthmatic patients were sent straight to ICU (hiding true severity).',
						},
						{
							name: 'Distribution Shift',
							impact:
								'COVID changed shopping patterns overnight. Demand-forecasting ML trained pre-pandemic predicted wrong by 400% for weeks.',
						},
					],
				},
			],
			keyTakeaways: [
				'ML learns rules from data; use it when rules are too complex to enumerate manually',
				'The spam filter analogy is the clearest illustration of ML advantage',
				'Use the 5-question decision framework before defaulting to ML',
				'No data, no ML—data quality and quantity determine ceiling performance',
				'Misapplied ML is often worse than a well-designed rule-based system',
			],
		},
	},

	/* ───────────────────────── STEP 3 ───────────────────────── */
	{
		id: 3,
		title: 'Types of ML',
		shortDescription: 'Supervised, unsupervised, and reinforcement learning.',
		icon: Layers3,
		content: {
			intro:
				'ML has three main learning paradigms—each answers a different question, uses different data, and suits different problems. Knowing which to reach for is a core engineering skill.',
			sections: [
				{
					title: 'Three Paradigms Overview',
					type: 'visual_chart',
					content: 'High-level comparison of the three learning paradigms:',
					data: {
						type: 'paradigm_cards',
						items: [
							{
								name: 'Supervised',
								color: '#38bdf8',
								icon: '🎓',
								signal: 'Labelled data (X→Y)',
								goal: 'Predict known targets',
								examples: ['Spam filter', 'Image classification', 'House prices'],
								algorithms: ['Linear Regression', 'Random Forest', 'Neural Nets'],
							},
							{
								name: 'Unsupervised',
								color: '#c084fc',
								icon: '🔍',
								signal: 'Unlabelled data (X only)',
								goal: 'Find hidden structure',
								examples: ['Customer segments', 'Topic modelling', 'Anomaly detection'],
								algorithms: ['K-Means', 'PCA', 'Autoencoders'],
							},
							{
								name: 'Reinforcement',
								color: '#34d399',
								icon: '🎮',
								signal: 'Reward signals from env',
								goal: 'Maximise cumulative reward',
								examples: ['AlphaGo', 'Robot walking', 'Trading bots'],
								algorithms: ['Q-Learning', 'PPO', 'Actor-Critic'],
							},
						],
					},
				},
				{
					title: 'Supervised Learning — Deep Dive',
					type: 'text',
					content:
						'Supervised learning trains on (input, label) pairs. The model minimises a loss function—measuring prediction error—until it generalises to unseen data. Two flavours: Classification (discrete labels: spam/ham, cat/dog, cancer/healthy) and Regression (continuous values: price, temperature, revenue). The bias-variance trade-off is central: a too-simple model underfits (high bias), a too-complex model overfits (high variance). We balance this with regularisation, cross-validation, and ensemble methods. Key supervised algorithms: Logistic Regression for linearly-separable binary classification; Decision Trees for interpretable hierarchical splits; Gradient Boosting (XGBoost/LightGBM) for structured data competitions; Convolutional Neural Networks for images; Transformers for language.',
				},
				{
					title: 'Supervised Learning Code Example',
					type: 'code',
					content: 'Complete supervised pipeline in scikit-learn:',
					data: {
						language: 'python',
						code: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score

# ── 1. Load data ──────────────────────────────────────────────
df = pd.read_csv('customer_churn.csv')
X = df.drop('churn', axis=1)
y = df['churn']

# ── 2. Train / test split (stratified preserves class balance)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── 3. Scale (required for logistic regression, not trees)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)   # fit on train ONLY
X_test_scaled  = scaler.transform(X_test)         # apply same scale

# ── 4. Compare multiple models with cross-validation
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000),
    "Random Forest":       RandomForestClassifier(n_estimators=100, random_state=42),
    "Gradient Boosting":   GradientBoostingClassifier(n_estimators=200, learning_rate=0.05),
}

for name, model in models.items():
    data = X_train_scaled if "Logistic" in name else X_train
    cv_auc = cross_val_score(model, data, y_train, cv=5, scoring='roc_auc').mean()
    print(f"{name:25s} CV-AUC: {cv_auc:.4f}")

# ── 5. Train best model & evaluate on hold-out test set
best = GradientBoostingClassifier(n_estimators=200, learning_rate=0.05)
best.fit(X_train, y_train)
y_pred  = best.predict(X_test)
y_proba = best.predict_proba(X_test)[:, 1]

print(classification_report(y_test, y_pred))
print(f"Test ROC-AUC: {roc_auc_score(y_test, y_proba):.4f}")`,
					},
				},
				{
					title: 'Unsupervised Learning — Deep Dive',
					type: 'text',
					content:
						"Unsupervised learning finds structure in data with no labels. K-Means clustering partitions data into K groups by minimising within-cluster variance—iterating: assign each point to nearest centroid, recompute centroids, repeat. DBSCAN finds arbitrarily-shaped clusters by density, marking low-density points as noise. PCA (Principal Component Analysis) is a dimensionality reduction technique: it finds orthogonal directions of maximum variance, projecting high-dimensional data to fewer components. This is critical for visualisation (reduce to 2D/3D), noise removal, and speeding up downstream algorithms. Autoencoders learn a compressed latent representation via a neural encoder-decoder and are powerful for anomaly detection: items that reconstruct poorly are anomalies.",
				},
				{
					title: 'Unsupervised Learning Code Example',
					type: 'code',
					content: 'K-Means clustering + PCA visualisation:',
					data: {
						language: 'python',
						code: `from sklearn.cluster import KMeans, DBSCAN
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# ── 1. Scale first (K-Means is distance-based — MUST scale)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# ── 2. Find optimal K using Elbow method
inertias = []
for k in range(2, 11):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(X_scaled)
    inertias.append(km.inertia_)

plt.plot(range(2, 11), inertias, 'bo-')
plt.xlabel('Number of clusters K')
plt.ylabel('Inertia (within-cluster variance)')
plt.title('Elbow Method — choose K at the "elbow"')
plt.show()

# ── 3. Fit final model
km = KMeans(n_clusters=4, random_state=42, n_init=10)
labels = km.fit_predict(X_scaled)

# ── 4. Reduce to 2D for visualisation
pca = PCA(n_components=2)
X_2d = pca.fit_transform(X_scaled)
print(f"Variance explained: {pca.explained_variance_ratio_.sum():.1%}")

plt.scatter(X_2d[:, 0], X_2d[:, 1], c=labels, cmap='tab10', alpha=0.6)
plt.title('K-Means Clusters in PCA space')
plt.colorbar(label='Cluster')
plt.show()

# ── 5. Analyse cluster profiles
df['cluster'] = labels
print(df.groupby('cluster').mean().round(2))`,
					},
				},
				{
					title: 'Reinforcement Learning — Deep Dive',
					type: 'text',
					content:
						"Reinforcement Learning (RL) frames learning as an agent interacting with an environment. The Markov Decision Process (MDP) formalises this: State (s) → Agent takes Action (a) → Environment returns Reward (r) and Next State (s'). The agent learns a Policy π(s)→a that maximises cumulative discounted reward Σ γᵗ rₜ, where γ (gamma, 0–1) is the discount factor—how much we care about future vs immediate rewards. Q-Learning learns Q(s,a): expected total reward from taking action a in state s. Deep Q-Networks (DQN) use a neural network to approximate Q-values for large state spaces (e.g., Atari pixels). Policy Gradient methods (PPO, A3C) directly optimise the policy without a value table—better for continuous action spaces like robotic control.",
				},
				{
					title: 'Comparing All Three Paradigms',
					type: 'comparison',
					content: 'Quick-reference decision table:',
					data: {
						headers: ['Aspect', 'Supervised', 'Unsupervised', 'Reinforcement'],
						rows: [
							['Data', 'Labelled (X,Y)', 'Unlabelled (X)', 'Environment rewards'],
							['Learning signal', 'Prediction error', 'Data structure', 'Reward signal'],
							['Goal', 'Predict Y for new X', 'Find patterns/groups', 'Maximise cumulative reward'],
							['Human effort', 'High (labelling)', 'Low', 'Medium (reward design)'],
							['Compute cost', 'Medium', 'Low–Medium', 'Very High (simulation)'],
							['Best for', 'Classification, regression', 'Clustering, compression, anomaly', 'Control, games, planning'],
							['Failure mode', 'Overfitting, label noise', 'Meaningless clusters', 'Reward hacking, instability'],
						],
					},
				},
			],
			keyTakeaways: [
				'Supervised: learn from (X, Y) pairs — classification and regression',
				'Unsupervised: find structure in X alone — clustering, compression, anomaly detection',
				'Reinforcement: maximise reward through trial-and-error — games, robotics, planning',
				'Most real systems combine paradigms (e.g., pre-train unsupervised → fine-tune supervised)',
				'Choosing the wrong paradigm wastes months; map problem type first',
			],
		},
	},

	/* ───────────────────────── STEP 4 ───────────────────────── */
	{
		id: 4,
		title: 'Data Collection & Preprocessing',
		shortDescription: 'Gather clean data before training a model.',
		icon: Database,
		content: {
			intro:
				'Garbage in, garbage out. Data preparation consumes 60–80% of project time but determines the performance ceiling no algorithm can exceed. This step covers the complete data pipeline from raw collection to model-ready tensors.',
			sections: [
				{
					title: 'The Complete Data Pipeline',
					type: 'process',
					content: 'Every ML project follows this sequence:',
					data: [
						{
							step: '1. Data Collection',
							description: 'Gather from databases (SQL), APIs (REST/GraphQL), web scraping, sensors, logs, surveys.',
							detail: 'Volume: prefer 10× more samples than features minimum. Variety: cover all sub-populations. Velocity: ensure freshness for time-sensitive tasks.',
							challenges: 'Privacy regulations (GDPR), data access rights, sampling bias.',
						},
						{
							step: '2. Exploratory Data Analysis (EDA)',
							description: 'Profile every feature: data type, null rate, unique values, distribution shape, outlier presence.',
							detail: 'Tools: df.describe(), df.info(), pair plots, correlation heatmaps. EDA reveals problems before they waste training time.',
							challenges: 'EDA can become endless — timebox it.',
						},
						{
							step: '3. Data Cleaning',
							description: 'Handle missing values, duplicates, impossible values, encoding errors, unit mismatches.',
							detail: 'Strategy depends on missingness mechanism: MCAR (random) → impute or drop. MAR → impute with model. MNAR → investigate root cause.',
							challenges: "Imputing incorrectly introduces bias; dropping rows loses information.",
						},
						{
							step: '4. Feature Engineering',
							description: 'Create new features, transform distributions, encode categoricals, extract signal from raw data.',
							detail: 'The single highest-leverage activity in ML. Domain experts outperform automated feature selection because they know which transformations carry physical meaning.',
							challenges: 'Risk of data leakage if future information leaks into features.',
						},
						{
							step: '5. Data Splitting',
							description: 'Partition into Train / Validation / Test before any preprocessing that involves learning statistics.',
							detail: 'Typical split: 70/15/15 or 80/10/10. Use stratified splits for classification. Use temporal splits for time-series to avoid look-ahead.',
							challenges: 'Never touch test set until final evaluation — it is your single, unbiased estimate.',
						},
						{
							step: '6. Scaling & Encoding',
							description: 'Standardise numeric features; encode categoricals. Fit scalers/encoders on train only, transform train+val+test.',
							detail: 'StandardScaler: (x−μ)/σ. MinMaxScaler: (x−min)/(max−min). RobustScaler: uses median/IQR, robust to outliers.',
							challenges: 'Fitting scaler on full dataset before split causes data leakage.',
						},
					],
				},
				{
					title: 'EDA Code: Profile Your Data in Minutes',
					type: 'code',
					content: 'Standard EDA workflow every project starts with:',
					data: {
						language: 'python',
						code: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('dataset.csv')

# ── 1. Shape & types ─────────────────────────────────────────
print(df.shape)         # (rows, cols)
print(df.dtypes)        # spot wrong types (e.g., price stored as string)
print(df.describe())    # mean, std, min, 25/50/75, max

# ── 2. Missing value audit ────────────────────────────────────
missing = df.isnull().sum() / len(df) * 100
print(missing[missing > 0].sort_values(ascending=False))

# ── 3. Class distribution (classification) ────────────────────
print(df['target'].value_counts(normalize=True))

# ── 4. Correlation heatmap ────────────────────────────────────
plt.figure(figsize=(12, 8))
sns.heatmap(df.corr(numeric_only=True), annot=True,
            fmt='.2f', cmap='coolwarm', center=0)
plt.title('Feature Correlation Matrix')
plt.tight_layout()
plt.show()

# ── 5. Distribution of all numeric features ───────────────────
df.select_dtypes(include='number').hist(bins=30, figsize=(16, 10))
plt.tight_layout()
plt.show()

# ── 6. Pairplot (first 5 features + target) ───────────────────
sns.pairplot(df[df.columns[:5].tolist() + ['target']], hue='target')
plt.show()`,
					},
				},
				{
					title: 'Handling Missing Values — Strategy Guide',
					type: 'examples',
					content: 'Missing data is the most common preprocessing challenge:',
					data: [
						{
							name: 'Drop Rows / Columns',
							impact: 'Safe when < 5% missing and data is MCAR. Drop columns when > 60% missing — they carry almost no signal.',
							example: 'df.dropna(subset=["age"])  →  removes rows where age is null',
						},
						{
							name: 'Simple Imputation',
							impact: 'Numeric: mean (symmetric), median (skewed/outliers), constant. Categorical: mode or literal "Missing" category.',
							example: "SimpleImputer(strategy='median')  →  fills numeric NaNs with column median",
						},
						{
							name: 'Iterative Imputation (MICE)',
							impact: 'Predicts each missing value using other features as regressors. Best accuracy but expensive.',
							example: "IterativeImputer(estimator=BayesianRidge(), max_iter=10)  →  multivariate imputation",
						},
						{
							name: 'Indicator Flag',
							impact: 'Add binary column: was_missing_X=1. Lets model learn if missingness itself is predictive (often is in fraud, churn).',
							example: "df['income_missing'] = df['income'].isnull().astype(int)",
						},
					],
				},
				{
					title: 'Feature Engineering — The Art of ML',
					type: 'text',
					content:
						"Feature engineering transforms raw data into model-ready signals. It's where domain knowledge meets mathematics. Common transformations: Log transform skewed distributions (prices, income) → approximate normality → log1p(x). Polynomial features capture interaction effects (height × weight = BMI proxy). Binning continuous values (age → age_group) helps when relationship is non-linear and non-monotonic. Date/time decomposition: extract hour, day_of_week, is_holiday, days_since_last_purchase. Text features: character count, exclamation marks, sentiment score, TF-IDF. Aggregation: customer's last-30-day purchase mean, std, max. Target encoding: replace category with mean of target in that category (careful: use out-of-fold means to avoid leakage). Embedding: map high-cardinality categoricals to dense vectors via neural network lookup tables. The best feature engineer isn't the one who knows the most algorithms—it's the one who understands the business problem deeply enough to know which information matters.",
				},
				{
					title: 'Feature Engineering Code',
					type: 'code',
					content: 'Practical feature engineering pipeline:',
					data: {
						language: 'python',
						code: `import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer

df = pd.read_csv('transactions.csv', parse_dates=['timestamp'])

# ── 1. Date/time features ─────────────────────────────────────
df['hour']        = df['timestamp'].dt.hour
df['day_of_week'] = df['timestamp'].dt.dayofweek      # 0=Mon
df['is_weekend']  = df['day_of_week'].isin([5, 6]).astype(int)
df['month']       = df['timestamp'].dt.month

# ── 2. Log-transform skewed numeric (amount) ─────────────────
df['log_amount'] = np.log1p(df['amount'])              # log1p handles 0s

# ── 3. Interaction feature ────────────────────────────────────
df['amount_per_item'] = df['amount'] / (df['item_count'] + 1)

# ── 4. Rolling aggregations (past behaviour) ─────────────────
df = df.sort_values(['user_id', 'timestamp'])
df['user_7d_spend'] = (
    df.groupby('user_id')['amount']
      .transform(lambda x: x.shift(1).rolling(7).sum())
)

# ── 5. Encode categoricals ───────────────────────────────────
cat_cols = ['category', 'payment_method', 'country']
num_cols = ['log_amount', 'amount_per_item', 'hour', 'day_of_week']

# Build sklearn ColumnTransformer pipeline (handles train/test correctly)
preprocessor = ColumnTransformer(transformers=[
    ('num', Pipeline([
        ('impute', SimpleImputer(strategy='median')),
        ('scale',  StandardScaler()),
    ]), num_cols),
    ('cat', Pipeline([
        ('impute', SimpleImputer(strategy='constant', fill_value='Unknown')),
        ('ohe',    OneHotEncoder(handle_unknown='ignore', sparse_output=False)),
    ]), cat_cols),
])

X_train_proc = preprocessor.fit_transform(X_train)
X_test_proc  = preprocessor.transform(X_test)   # uses train statistics`,
					},
				},
				{
					title: 'Data Quality Impact on Model Accuracy',
					type: 'visual_chart',
					content:
						'How data quality improvements stack up — each bar shows approximate accuracy gain:',
					data: {
						type: 'stacked_gains',
						items: [
							{ label: 'Baseline (raw data)', value: 72, color: '#475569' },
							{ label: '+ Clean missing values', value: 78, color: '#38bdf8' },
							{ label: '+ Remove outliers', value: 81, color: '#818cf8' },
							{ label: '+ Feature engineering', value: 87, color: '#c084fc' },
							{ label: '+ Balance classes', value: 90, color: '#34d399' },
							{ label: '+ Scale features', value: 92, color: '#facc15' },
						],
					},
				},
				{
					title: 'Avoiding Data Leakage',
					type: 'text',
					content:
						"Data leakage is the silent killer of ML projects. It occurs when information from outside the training window influences model training, inflating validation scores but causing catastrophic failure in production. Types: Target leakage — using features that are only known after the target is determined (e.g., 'loan was repaid' to predict default). Temporal leakage — using future data to predict past (train on 2023, test on 2022). Preprocessing leakage — fitting a scaler on the full dataset before splitting, so test statistics contaminate the scaler. Prevention rules: 1) Split first, preprocess after. 2) Use Pipeline to ensure fit() only sees train data. 3) For time series, always split chronologically. 4) Review every feature's creation logic: could this exist at prediction time? 5) Sanity-check: suspiciously high accuracy on validation is a red flag. Real-world leakage examples: a medical model using the treatment prescribed (which a doctor ordered because they already diagnosed the disease) to predict the diagnosis; a credit model using the credit bureau's post-default record to predict default.",
				},
			],
			keyTakeaways: [
				'Data prep = 60–80% of ML time; it determines performance ceiling',
				'EDA first: profile every feature before cleaning or modelling',
				'Split data before fitting any scalers/encoders to prevent leakage',
				'Feature engineering is the highest-leverage activity in an ML project',
				'Data leakage causes spectacular validation scores that collapse in production',
			],
		},
	},

	/* ───────────────────────── STEP 5 ───────────────────────── */
	{
		id: 5,
		title: 'Model Building',
		shortDescription: 'Choose an algorithm and set up a model.',
		icon: Wrench,
		content: {
			intro:
				'Choosing and configuring a model is both science and engineering. Each algorithm embeds assumptions about data structure. Violating those assumptions leads to poor performance. Understanding the internals helps you pick intelligently, tune effectively, and debug quickly.',
			sections: [
				{
					title: 'Algorithm Decision Tree',
					type: 'diagram',
					content: 'Navigate from problem type to recommended algorithm:',
					data: {
						question: 'What type of problem are you solving?',
						branches: [
							{
								answer: 'Supervised (labelled data)',
								next: {
									question: 'Predicting a category or a number?',
									branches: [
										{
											answer: 'Category → Classification',
											algorithms: [
												'Logistic Regression — linear boundary, interpretable coefficients',
												'Decision Trees — visual rules, handles non-linear splits',
												'Random Forest — 100–500 trees vote, robust to noise',
												'XGBoost / LightGBM — sequential correction, often wins on tabular data',
												'SVM — maximum-margin boundary, excellent for high-dim sparse',
												'Neural Network — complex patterns, needs 100K+ samples',
											],
										},
										{
											answer: 'Number → Regression',
											algorithms: [
												'Linear Regression — interpretable, fast, linear assumption',
												'Ridge / Lasso — linear + L2/L1 regularisation prevents overfitting',
												'Random Forest Regressor — non-linear, handles interactions',
												'XGBoost Regressor — highest accuracy on structured data',
												'Neural Network — complex non-linear mapping',
											],
										},
									],
								},
							},
							{
								answer: 'Unsupervised (no labels)',
								next: {
									question: "What's the goal?",
									branches: [
										{
											answer: 'Find groups → Clustering',
											algorithms: [
												'K-Means — fast, spherical clusters, choose K',
												'DBSCAN — arbitrary shapes, handles noise/outliers',
												'Agglomerative Hierarchical — dendrogram, no K needed',
												'Gaussian Mixture Models — soft probabilistic membership',
											],
										},
										{
											answer: 'Compress / Visualise → Dimensionality Reduction',
											algorithms: [
												'PCA — linear, preserves global variance structure',
												't-SNE — non-linear, excellent 2D/3D visualisation',
												'UMAP — faster than t-SNE, preserves local + global structure',
												'Autoencoders — non-linear compression via neural networks',
											],
										},
									],
								},
							},
							{
								answer: 'Reinforcement (sequential decisions)',
								algorithms: [
									'Q-Learning — tabular, discrete states, classic baseline',
									'DQN — neural Q-function, Atari-level complexity',
									'PPO — stable, on-policy, default for robotics / games',
									'SAC — off-policy, sample efficient, continuous control',
								],
							},
						],
					},
				},
				{
					title: 'How Key Algorithms Work Internally',
					type: 'examples',
					content: 'Intuition + mechanics for the most important algorithms:',
					data: [
						{
							name: 'Linear / Logistic Regression',
							description:
								'Fits a hyperplane: ŷ = w₁x₁ + w₂x₂ + … + b. Training minimises MSE (linear) or cross-entropy (logistic) via gradient descent. Logistic applies sigmoid σ(z) to output probability ∈ (0,1).',
							strengths: ['Extremely interpretable coefficients', 'No hyperparameter tuning needed', 'Probabilistic output', 'Training in milliseconds'],
							weaknesses: ['Linear assumption fails for curved boundaries', 'Needs feature scaling', 'Poor with high interaction effects'],
							bestFor: 'Baseline model, interpretability requirements, linear signals',
							example: 'Predict customer churn probability with coefficients showing which feature matters most',
						},
						{
							name: 'Decision Trees',
							description:
								'Greedily splits features by information gain (classification) or variance reduction (regression). Creates a binary tree of if-else rules. Depth controls complexity — deeper = more overfit.',
							strengths: ['No scaling required', 'Handles mixed types', 'Fully interpretable as rules', 'Captures non-linear splits'],
							weaknesses: ['Highly prone to overfitting', 'Unstable — small data changes → different tree', 'Biased toward features with many unique values'],
							bestFor: 'Creating human-readable rule sets, mixed data, non-linear patterns',
							example: 'Loan approval tree: if income > 50K AND credit_score > 700 → approve',
						},
						{
							name: 'Random Forest',
							description:
								'Builds N trees on random bootstrap samples of rows + random subsets of features (bagging). Final prediction = majority vote (classification) or mean (regression). Variance of ensemble < variance of individual tree.',
							strengths: ['Dramatically reduces overfitting vs single tree', 'Built-in feature importance', 'Handles missing values natively', 'Robust to outliers'],
							weaknesses: ['N× memory and compute of single tree', 'Less interpretable', 'Slow real-time prediction for N=500'],
							bestFor: 'General-purpose structured data, when accuracy > interpretability',
							example: 'Medical diagnosis with 50 clinical features — RF often top-3 without tuning',
						},
						{
							name: 'Gradient Boosting (XGBoost)',
							description:
								'Builds trees sequentially. Each new tree fits the residuals of all previous trees weighted by the gradient of the loss. Learning rate (η) controls how much each tree contributes. Regularisation (λ, α) prevents overfitting.',
							strengths: ['Consistently top performance on tabular data', 'Handles mixed feature types natively', 'Built-in L1/L2 regularisation', 'Fast parallel implementation'],
							weaknesses: ['3–5 hyperparameters to tune for peak performance', 'Longer training than RF', 'Can overfit without regularisation'],
							bestFor: 'Kaggle competitions, production tabular ML, maximum accuracy',
							example: 'XGBoost wins 75%+ of Kaggle structured data competitions',
						},
						{
							name: 'Neural Networks',
							description:
								'Stacked layers of linear transformations + non-linear activations (ReLU, GELU). Learn hierarchical representations: pixels → edges → shapes → objects. Backpropagation computes gradients, Adam/SGD updates weights.',
							strengths: ['Learns arbitrary complex functions', 'Transfer learning from pre-trained models', 'State-of-art for images, text, audio', 'Scales with data and compute'],
							weaknesses: ['Needs large datasets to outperform trees', 'Computationally expensive', 'Many hyperparameters', 'Black box — hard to interpret'],
							bestFor: 'Images, text, audio, video, time series with millions of samples',
							example: 'ResNet-50 achieves 98%+ on ImageNet classification',
						},
					],
				},
				{
					title: 'Model Building Code',
					type: 'code',
					content: 'Build, compare, and select the best model systematically:',
					data: {
						language: 'python',
						code: `from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold
from sklearn.metrics import roc_auc_score
import xgboost as xgb
import joblib

# ── 1. Build model pipelines (preprocessing already done above)

# Model A: Logistic Regression (baseline)
lr = Pipeline([
    ('clf', LogisticRegression(C=1.0, max_iter=1000, class_weight='balanced'))
])

# Model B: Random Forest
rf = Pipeline([
    ('clf', RandomForestClassifier(
        n_estimators=200, max_depth=10,
        min_samples_leaf=5, class_weight='balanced', random_state=42
    ))
])

# Model C: XGBoost (often best)
xgb_clf = xgb.XGBClassifier(
    n_estimators=500, learning_rate=0.05, max_depth=6,
    subsample=0.8, colsample_bytree=0.8,
    scale_pos_weight=10,          # handles class imbalance
    eval_metric='auc', random_state=42, tree_method='hist'
)

# ── 2. Hyperparameter search for XGBoost ─────────────────────
param_dist = {
    'learning_rate':    [0.01, 0.05, 0.1],
    'max_depth':        [4, 6, 8],
    'n_estimators':     [300, 500, 700],
    'subsample':        [0.7, 0.8, 1.0],
    'colsample_bytree': [0.6, 0.8, 1.0],
    'reg_alpha':        [0, 0.1, 1.0],    # L1 reg
    'reg_lambda':       [1, 5, 10],        # L2 reg
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
search = RandomizedSearchCV(
    xgb_clf, param_dist, n_iter=50, cv=cv,
    scoring='roc_auc', n_jobs=-1, random_state=42, verbose=1
)
search.fit(X_train, y_train)
print("Best CV AUC:", search.best_score_.round(4))
print("Best params:", search.best_params_)

# ── 3. Evaluate on held-out test set ─────────────────────────
best_model = search.best_estimator_
y_proba = best_model.predict_proba(X_test)[:, 1]
print(f"Test AUC: {roc_auc_score(y_test, y_proba):.4f}")

# ── 4. Save model for production ─────────────────────────────
joblib.dump(best_model, 'model_v1.pkl')`,
					},
				},
				{
					title: 'Hyperparameter Tuning Strategies',
					type: 'visual_chart',
					content: 'Comparison of tuning methods by efficiency and quality:',
					data: {
						type: 'quadrant',
						axes: { x: 'Compute Efficiency', y: 'Optimality' },
						points: [
							{ label: 'Manual Search', x: 90, y: 25, color: '#f87171' },
							{ label: 'Grid Search', x: 10, y: 60, color: '#fb923c' },
							{ label: 'Random Search', x: 65, y: 65, color: '#facc15' },
							{ label: 'Bayesian (Optuna)', x: 80, y: 85, color: '#34d399' },
							{ label: 'AutoML (H2O)', x: 40, y: 90, color: '#38bdf8' },
						],
					},
				},
			],
			keyTakeaways: [
				'Start with logistic/linear regression as baseline — always beat it before celebrating',
				'XGBoost / LightGBM wins most structured data tasks; Neural Nets for unstructured data',
				'Hyperparameter tuning with RandomizedSearchCV + 50 iterations is the sweet spot',
				'Use StratifiedKFold for imbalanced classification problems',
				'Save models with joblib; version-control hyperparameters alongside code',
			],
		},
	},

	/* ───────────────────────── STEP 6 ───────────────────────── */
	{
		id: 6,
		title: 'Training & Prediction',
		shortDescription: 'Teach the model, then let it predict new answers.',
		icon: Brain,
		content: {
			intro:
				"Training is where mathematics meets data: parameters are adjusted iteratively to minimise a loss function. Prediction is inference—applying the learned function to new inputs. Understanding gradient descent, the bias-variance trade-off, and regularisation lets you diagnose and fix training problems.",
			sections: [
				{
					title: 'Gradient Descent: The Engine of Learning',
					type: 'text',
					content:
						"All neural network training reduces to one idea: gradient descent. Imagine loss (error) as a mountain landscape. Parameters are your position. The gradient points uphill. Take small steps downhill (negative gradient). Eventually reach a valley (minimum). Mathematically: θ ← θ − η∇L(θ), where θ = parameters, η = learning rate, ∇L = gradient of loss. Learning rate is critical: too large → overshoot minima, diverge; too small → takes forever, gets stuck. Stochastic Gradient Descent (SGD) computes gradient on one random sample per step — noisy but fast. Mini-batch SGD uses 32–512 samples — GPU-efficient and stable. Adam (Adaptive Moment Estimation) is the default optimizer: it adapts the learning rate per parameter using first and second gradient moments. On 95% of problems, Adam with default settings (lr=1e-3) is the right starting point.",
				},
				{
					title: 'The Training Process Step-by-Step',
					type: 'process',
					content: 'What happens inside each training iteration:',
					data: [
						{
							step: '1. Initialise Parameters',
							description:
								'Weights set to small random values (Xavier/He initialisation). Biases to zero.',
							detail:
								'He init for ReLU: w ~ N(0, √(2/n_in)). Prevents vanishing/exploding gradients in deep nets.',
							challenges: '',
						},
						{
							step: '2. Forward Pass',
							description:
								'Input flows through layers: output = activation(W·x + b) at each layer.',
							detail: 'ReLU(x) = max(0,x) — most common. Sigmoid for final layer in binary classification. Softmax for multi-class.',
							challenges: '',
						},
						{
							step: '3. Compute Loss',
							description:
								'Binary Cross-Entropy: L = −[y·log(ŷ) + (1−y)·log(1−ŷ)]. MSE for regression: L = (1/n)Σ(y−ŷ)².',
							detail: 'Loss measures how wrong the current model is. Entire training aims to minimise expected loss on the data distribution.',
							challenges: '',
						},
						{
							step: '4. Backward Pass (Backpropagation)',
							description:
								'Chain rule propagates loss gradient backward through every layer: ∂L/∂W = ∂L/∂output × ∂output/∂W.',
							detail: 'Automatically computed by autograd engines (PyTorch, TensorFlow). No manual calculus needed.',
							challenges: 'Vanishing gradients in very deep networks — fixed by ResNet skip connections, BatchNorm, ReLU.',
						},
						{
							step: '5. Parameter Update',
							description: 'Adam: m = β₁m + (1−β₁)g;  v = β₂v + (1−β₂)g²;  θ = θ − η·m̂/√(v̂+ε)',
							detail: 'Default: β₁=0.9, β₂=0.999, ε=1e-8. Learning rate scheduler (cosine annealing, ReduceLROnPlateau) improves convergence.',
							challenges: '',
						},
						{
							step: '6. Epoch Loop',
							description:
								'Repeat steps 2–5 over all mini-batches until N epochs or early stopping triggers.',
							detail: 'Monitor val_loss every epoch. If val_loss increases for patience epochs, stop — model is overfitting.',
							challenges: 'Too few epochs = underfit. Too many = overfit. Early stopping is the practical solution.',
						},
					],
				},
				{
					title: 'Neural Network Training Code (PyTorch)',
					type: 'code',
					content: 'Complete training loop with validation and early stopping:',
					data: {
						language: 'python',
						code: `import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

# ── 1. Define model ───────────────────────────────────────────
class MLP(nn.Module):
    def __init__(self, input_dim, hidden_dims, output_dim, dropout=0.3):
        super().__init__()
        layers = []
        prev = input_dim
        for h in hidden_dims:
            layers += [nn.Linear(prev, h), nn.BatchNorm1d(h),
                       nn.ReLU(), nn.Dropout(dropout)]
            prev = h
        layers.append(nn.Linear(prev, output_dim))
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x)

model = MLP(input_dim=30, hidden_dims=[128, 64, 32], output_dim=1)
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model.to(device)

# ── 2. Data loaders ───────────────────────────────────────────
X_t = torch.FloatTensor(X_train)
y_t = torch.FloatTensor(y_train.values).unsqueeze(1)
train_loader = DataLoader(TensorDataset(X_t, y_t), batch_size=256, shuffle=True)

# ── 3. Optimiser + loss + scheduler ──────────────────────────
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3, weight_decay=1e-4)
criterion = nn.BCEWithLogitsLoss()   # sigmoid inside — numerically stable
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, patience=5, factor=0.5, verbose=True
)

# ── 4. Training loop with early stopping ─────────────────────
best_val_loss = float('inf')
patience, patience_count = 15, 0

for epoch in range(200):
    model.train()
    train_loss = 0
    for Xb, yb in train_loader:
        Xb, yb = Xb.to(device), yb.to(device)
        optimizer.zero_grad()
        loss = criterion(model(Xb), yb)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)  # gradient clip
        optimizer.step()
        train_loss += loss.item()

    # Validation
    model.eval()
    with torch.no_grad():
        X_val_t = torch.FloatTensor(X_val).to(device)
        y_val_t = torch.FloatTensor(y_val.values).unsqueeze(1).to(device)
        val_loss = criterion(model(X_val_t), y_val_t).item()

    scheduler.step(val_loss)

    if val_loss < best_val_loss:
        best_val_loss = val_loss
        torch.save(model.state_dict(), 'best_model.pt')   # checkpoint
        patience_count = 0
    else:
        patience_count += 1
        if patience_count >= patience:
            print(f"Early stopping at epoch {epoch}")
            break

    if epoch % 10 == 0:
        print(f"Epoch {epoch:3d} | train_loss={train_loss/len(train_loader):.4f} | val_loss={val_loss:.4f}")

# ── 5. Load best weights and predict ─────────────────────────
model.load_state_dict(torch.load('best_model.pt'))
model.eval()
with torch.no_grad():
    proba = torch.sigmoid(model(torch.FloatTensor(X_test).to(device))).cpu().numpy()`,
					},
				},
				{
					title: 'Overfitting vs Underfitting — Visual',
					type: 'visual_chart',
					content: 'Learning curves reveal the fitting problem:',
					data: {
						type: 'learning_curves',
						scenarios: [
							{
								name: 'Underfitting',
								color: '#f87171',
								train: [0.78, 0.79, 0.80, 0.80, 0.81],
								val: [0.77, 0.78, 0.79, 0.79, 0.80],
								note: 'Both curves high & close — model too simple',
							},
							{
								name: 'Good Fit',
								color: '#34d399',
								train: [0.85, 0.82, 0.80, 0.79, 0.78],
								val: [0.88, 0.84, 0.81, 0.80, 0.79],
								note: 'Both converge to low error — ideal',
							},
							{
								name: 'Overfitting',
								color: '#fb923c',
								train: [0.95, 0.92, 0.88, 0.82, 0.75],
								val: [0.89, 0.91, 0.94, 0.96, 0.98],
								note: 'Val rises while train falls — memorising noise',
							},
						],
					},
				},
				{
					title: 'Regularisation Techniques',
					type: 'examples',
					content: 'Methods to prevent overfitting systematically:',
					data: [
						{
							name: 'L2 Regularisation (Ridge / Weight Decay)',
							description: 'Adds λΣwᵢ² to loss. Penalises large weights, shrinking all towards zero but rarely to exactly zero.',
							impact: 'Reduces variance without eliminating features. Mandatory for linear models on noisy data. Equivalent to weight_decay in Adam.',
							example: 'Ridge(alpha=1.0)  →  alpha=λ is the regularisation strength; tune via cross-validation',
						},
						{
							name: 'L1 Regularisation (Lasso)',
							description: 'Adds λΣ|wᵢ| to loss. Drives irrelevant feature weights to exactly zero — performs automatic feature selection.',
							impact: 'Creates sparse models. Useful when you have many features and expect most to be irrelevant.',
							example: 'Lasso(alpha=0.01)  →  zero-weight features are effectively removed from the model',
						},
						{
							name: 'Dropout',
							description: 'During training, randomly zero p% of neuron activations. Forces network to learn redundant representations.',
							impact: 'Acts as ensemble of 2ⁿ different networks. Prevents co-adaptation of neurons. Standard p=0.2–0.5.',
							example: 'nn.Dropout(0.3)  →  30% of neurons are randomly disabled each forward pass during training',
						},
						{
							name: 'Early Stopping',
							description: 'Track validation loss each epoch. Stop training when it stops improving for `patience` epochs. Restore best weights.',
							impact: 'Free regularisation — no hyperparameter. Often more effective than L1/L2 alone.',
							example: 'patience=10  →  stop if val_loss has not improved in 10 consecutive epochs',
						},
						{
							name: 'Data Augmentation',
							description: 'Artificially expand training data with label-preserving transforms. For images: flip, rotate, crop, colour jitter. For text: synonym replacement, back-translation.',
							impact: 'Effectively multiplies dataset size 5–20×. Strongest regulariser for vision/NLP models.',
							example: 'torchvision.transforms.RandomHorizontalFlip()  →  doubles image training data for free',
						},
					],
				},
			],
			keyTakeaways: [
				'Gradient descent minimises loss by following the negative gradient of parameters',
				'Adam optimizer with lr=1e-3 is the right default for neural networks',
				'Early stopping prevents overfitting without adding any hyperparameters',
				'Dropout (0.2–0.5) is standard regularisation for neural networks',
				'Monitor both train and val loss — divergence signals overfitting',
			],
		},
	},

	/* ───────────────────────── STEP 7 ───────────────────────── */
	{
		id: 7,
		title: 'Evaluation Metrics',
		shortDescription: 'Measure how good and reliable your model is.',
		icon: BarChart3,
		content: {
			intro:
				'Metrics are the language you use to tell whether your model is actually good. Choosing the wrong metric is as dangerous as choosing the wrong algorithm—it optimises the system in the wrong direction. This step covers every major metric and when to use it.',
			sections: [
				{
					title: 'The Confusion Matrix — Foundation of Classification',
					type: 'diagram',
					content: 'All classification metrics derive from this 2×2 table:',
					data: {
						matrix: [
							['', 'Predicted Negative', 'Predicted Positive'],
							[
								'Actual Negative',
								'True Negative (TN)\n✓ Correct rejection',
								'False Positive (FP)\n✗ Type I error ("False alarm")',
							],
							[
								'Actual Positive',
								'False Negative (FN)\n✗ Type II error ("Miss")',
								'True Positive (TP)\n✓ Correct detection',
							],
						],
						calculations: {
							Accuracy: '(TP + TN) / (TP + TN + FP + FN)',
							Precision: 'TP / (TP + FP) — of positive predictions, how many correct?',
							Recall: 'TP / (TP + FN) — of actual positives, how many caught?',
							'F1 Score': '2 × Precision × Recall / (Precision + Recall)',
							Specificity: 'TN / (TN + FP) — of negatives, how many correctly identified?',
						},
						example: {
							scenario: 'Fraud detection: 10,000 transactions',
							tn: '9,800 (correctly identified as legit)',
							fp: '100 (legitimate flagged as fraud)',
							fn: '50 (fraud that got through)',
							tp: '50 (correctly caught fraud)',
							accuracy: '98.5% — MISLEADING (base rate dominates)',
							precision: '33% = 50/(50+100) — only 1 in 3 flagged is real fraud',
							recall: '50% = 50/(50+50) — missed half the fraud',
						},
					},
				},
				{
					title: 'Precision vs Recall: The Fundamental Trade-off',
					type: 'text',
					content:
						"Precision and Recall are in perpetual tension, controlled by the decision threshold. Lowering threshold from 0.5 to 0.2: more positives predicted → Recall ↑ (catch more fraud) → Precision ↓ (more false alarms). Raising threshold: fewer positives → Precision ↑ → Recall ↓. The Precision-Recall curve plots this trade-off at every threshold. Area Under PR Curve (PR-AUC) is the single number summary—better than ROC-AUC for severe class imbalance (fraud: 0.1% positive rate). F1 Score is the harmonic mean—punishes extreme imbalance between precision and recall more than the arithmetic mean. F-beta Score generalises: Fβ = (1+β²) × P×R / (β²P + R). Set β=2 to weigh recall 2× more (e.g., cancer screening). Set β=0.5 to weigh precision more (e.g., spam filter protecting important email).",
				},
				{
					title: 'All Classification Metrics',
					type: 'examples',
					content: 'When to use each metric and why:',
					data: [
						{
							name: 'Accuracy',
							description: '(TP+TN)/(All) — overall correctness.',
							impact: 'Use only on balanced datasets. On 99:1 imbalance, always predicting majority = 99% accuracy with zero recall on minority.',
							example: 'Digit recognition (MNIST) — 10 balanced classes, accuracy is fine.',
						},
						{
							name: 'Precision',
							description: 'TP/(TP+FP) — quality of positive predictions.',
							impact: 'Use when false positives are costly. Spam filter: marking real email as spam loses user trust.',
							example: 'Legal document classifier — flag only when very confident; costly to review false positives.',
						},
						{
							name: 'Recall (Sensitivity)',
							description: 'TP/(TP+FN) — completeness of positive detection.',
							impact: 'Use when false negatives are costly. Cancer screening: missing a positive is dangerous.',
							example: 'COVID screening — catch all cases even at cost of many false positives.',
						},
						{
							name: 'F1 Score',
							description: 'Harmonic mean of precision & recall.',
							impact: 'Use when both matter and classes are imbalanced. Default metric for NLP, information retrieval.',
							example: 'Named entity recognition, fraud detection — balanced precision and recall needed.',
						},
						{
							name: 'ROC-AUC',
							description: 'Area under Receiver Operating Characteristic curve.',
							impact: 'Threshold-independent ranking quality. Probability that model ranks random positive higher than random negative.',
							example: 'Credit scoring — need probability ranking, not binary decision.',
						},
						{
							name: 'PR-AUC (Average Precision)',
							description: 'Area under Precision-Recall curve.',
							impact: 'Better than ROC-AUC for severe class imbalance (< 5% positive rate). Less affected by TN dominance.',
							example: 'Fraud (0.1% rate), rare disease detection — ROC-AUC is too optimistic here.',
						},
					],
				},
				{
					title: 'Regression Metrics with Code',
					type: 'code',
					content: 'Computing and interpreting all regression metrics:',
					data: {
						language: 'python',
						code: `from sklearn.metrics import (
    mean_absolute_error, mean_squared_error,
    r2_score, mean_absolute_percentage_error
)
import numpy as np

y_true = np.array([100, 200, 300, 400, 500])  # house prices in $K
y_pred = np.array([110, 190, 280, 420, 490])

mae  = mean_absolute_error(y_true, y_pred)
mse  = mean_squared_error(y_true, y_pred)
rmse = np.sqrt(mse)
r2   = r2_score(y_true, y_pred)
mape = mean_absolute_percentage_error(y_true, y_pred) * 100

print(f"MAE  = \${mae:.1f}K   → average prediction error")
print(f"RMSE = \${rmse:.1f}K   → penalises large errors more than MAE")
print(f"R²   = {r2:.3f}     → {r2*100:.1f}% of price variance explained")
print(f"MAPE = {mape:.1f}%  → error as % of true value")

# ── Residual plot (reveals systematic errors) ─────────────────
import matplotlib.pyplot as plt
residuals = y_true - y_pred
plt.scatter(y_pred, residuals, alpha=0.6)
plt.axhline(0, color='red', linestyle='--')
plt.xlabel('Predicted values')
plt.ylabel('Residuals (actual - predicted)')
plt.title('Residual Plot — should be random scatter around 0')
plt.show()
# Patterns in residuals reveal: heteroscedasticity, non-linearity, outliers`,
					},
				},
				{
					title: 'Cross-Validation — Robust Performance Estimation',
					type: 'code',
					content: 'Why and how to use cross-validation properly:',
					data: {
						language: 'python',
						code: `from sklearn.model_selection import (
    StratifiedKFold, cross_validate, TimeSeriesSplit
)
from sklearn.ensemble import GradientBoostingClassifier
import numpy as np

model = GradientBoostingClassifier(n_estimators=200, learning_rate=0.05)

# ── Standard K-Fold for classification ───────────────────────
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
results = cross_validate(
    model, X, y, cv=cv,
    scoring=['roc_auc', 'f1', 'precision', 'recall'],
    return_train_score=True
)

print("=== 5-Fold Cross-Validation Results ===")
for metric in ['roc_auc', 'f1', 'precision', 'recall']:
    val_scores = results[f'test_{metric}']
    trn_scores = results[f'train_{metric}']
    print(f"{metric:12s}: val={val_scores.mean():.3f}±{val_scores.std():.3f}  "
          f"train={trn_scores.mean():.3f}±{trn_scores.std():.3f}")
    # Large gap (train >> val) = overfitting signal

# ── Time-series cross-validation (always split chronologically)
tscv = TimeSeriesSplit(n_splits=5, gap=30)  # gap=30 days between train/val
for fold, (train_idx, val_idx) in enumerate(tscv.split(X_time)):
    X_tr, X_vl = X_time.iloc[train_idx], X_time.iloc[val_idx]
    # train_end < val_start guaranteed — no look-ahead leakage`,
					},
				},
				{
					title: 'Metric Selection by Business Problem',
					type: 'comparison',
					content: 'Align metrics with business goals — not just technical defaults:',
					data: {
						headers: ['Business Problem', 'Primary Metric', 'Why', 'Avoid'],
						rows: [
							['Fraud detection', 'Recall + PR-AUC', 'Miss no fraud', 'Accuracy (always 99%)'],
							['Spam filter', 'Precision', 'Protect legitimate email', 'Recall alone'],
							['Cancer screening', 'Recall / Sensitivity', 'Never miss a case', 'Specificity alone'],
							['House price forecast', 'RMSE + R²', 'Penalise large errors', 'R² alone (no error scale)'],
							['Recommendation (top-10)', 'Precision@10 + NDCG', 'Top results must be relevant', 'Overall accuracy'],
							['Demand forecasting', 'MAPE', 'Stakeholders understand %', 'MSE (scale-dependent)'],
							['Churn prediction', 'F1 + Lift curve', 'Balance capture rate + cost', 'Accuracy'],
							['Credit scoring', 'ROC-AUC + KS statistic', 'Ranking quality at all thresholds', 'Threshold-specific metrics'],
						],
					},
				},
			],
			keyTakeaways: [
				'Accuracy is misleading on imbalanced data — always check precision, recall, F1',
				'Precision = quality of positives; Recall = completeness; F1 = harmonic balance',
				'ROC-AUC measures ranking; PR-AUC is better for severe class imbalance',
				'Cross-validation gives robust estimates; a single train-test split can be misleading',
				'Always connect model metrics to business outcomes before declaring success',
			],
		},
	},

	/* ───────────────────────── STEP 8 ───────────────────────── */
	{
		id: 8,
		title: 'Real-world Applications & ML in AI',
		shortDescription: 'How ML powers modern AI products and systems.',
		icon: Globe2,
		content: {
			intro:
				'Machine Learning is the engineering substrate of the AI revolution. Every major AI capability—language understanding, image generation, protein folding, autonomous driving—rests on ML algorithms applied at scale. Understanding real deployments shows both the potential and the hard limits.',
			sections: [
				{
					title: 'ML Across Industries',
					type: 'examples',
					content: 'Documented ML impact across six major sectors:',
					data: [
						{
							industry: 'Healthcare',
							applications: [
								'Medical image analysis (X-rays, MRIs, CT): detecting cancer, fractures, diabetic retinopathy',
								'Drug discovery: GNNs predicting molecular binding affinity 100× faster',
								'Clinical NLP: extracting diagnoses from unstructured physician notes',
								'AlphaFold 2: solved protein folding — 200M+ structures predicted in 2 years vs 50 years of lab work',
								'Epidemic forecasting using mobility data + time-series ML',
							],
							impact: 'FDA-cleared AI diagnostics: 100+ devices. Drug development cycle: 10 years → 3–4 years.',
							example: "DeepMind's DRG model matched retinal disease diagnosis accuracy of leading ophthalmologists across 50+ conditions.",
						},
						{
							industry: 'Finance',
							applications: [
								'Real-time fraud detection: GBMs + neural nets on 400+ features per transaction in < 50ms',
								'Algorithmic trading: 70%+ of US equity volume is automated ML strategies',
								'Credit scoring with alternative data: rent, utilities, phone payments for thin-file borrowers',
								"NLP on earnings calls and 10-Ks for sentiment-driven trading signals",
								'JPMC COIN: NLP parses 12,000 credit agreements in seconds vs 360,000 human-hours',
							],
							impact: 'Fraud losses down 40–60% with ML vs rule-based. Quant funds using ML: Citadel, Two Sigma, Renaissance.',
							example: 'PayPal processes 15M+ transactions/day through ML fraud detection at < 0.5% false positive rate.',
						},
						{
							industry: 'E-commerce & Retail',
							applications: [
								'Personalised recommendations: collaborative filtering + neural embedding models',
								'Dynamic pricing: demand elasticity models updating prices every 10 minutes (Amazon)',
								'Visual search: find product by photo using CNN image embeddings',
								'Inventory forecasting: LSTMs + Prophet on demand + seasonality signals',
								'Warehouse robotics: RL-trained arms for pick-and-place optimisation',
							],
							impact: 'Amazon: 35% revenue from recommendations. Netflix: 80% viewing from recommendations, $1B/yr retention value.',
							example: 'Amazon changes 2.5M prices/day using ML demand models — human analysts could manage ~5,000.',
						},
						{
							industry: 'Transportation & Autonomy',
							applications: [
								'Self-driving: sensor fusion (LIDAR + camera + radar) → object detection → trajectory planning',
								'Route optimisation: RL + graph neural nets on live traffic graphs (Google Maps)',
								'Predictive maintenance: vibration + temperature sensors → LSTM failure prediction 72h ahead',
								'Air traffic control: ML optimising departure sequences to reduce delay cascades',
								'Ride-sharing demand forecasting: temporal CNNs on geospatial demand grids',
							],
							impact: 'Waymo: 20M+ autonomous miles. Predictive maintenance: 30–50% downtime reduction.',
							example: "Uber's demand prediction positions drivers 15 min ahead, cutting wait times 30%.",
						},
					],
				},
				{
					title: 'The Full ML → AI Stack',
					type: 'text',
					content:
						"ML is the implementation layer of AI. The stack: Raw Data → Feature Engineering → ML Model → Predictions → AI Application → User Value. Classical AI (1950s–2000s) used hand-crafted rules and search algorithms. Modern AI uses learned representations. The breakthrough insight: instead of encoding knowledge, learn representations that capture knowledge from data. Deep Learning extended this to unstructured data: CNNs learn spatial features from pixels; Transformers learn contextual representations from token sequences. Foundation Models (GPT, CLIP, DALL-E) are trained on internet-scale data and fine-tuned for specific tasks—transfer learning at civilisational scale. ChatGPT's training used: (1) Supervised Fine-Tuning on human demonstrations, (2) Reward Model training on human preference rankings, (3) Reinforcement Learning from Human Feedback (RLHF) to align responses. This is ML pipelines all the way down.",
				},
				{
					title: 'Complete End-to-End ML Pipeline Code',
					type: 'code',
					content: 'Production-ready pipeline from data to deployed model:',
					data: {
						language: 'python',
						code: `"""
Full ML pipeline: data → preprocessing → model → evaluation → serving
"""
import pandas as pd
import numpy as np
import mlflow
import mlflow.sklearn
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.metrics import roc_auc_score, classification_report
import joblib, shap

# ── 1. Load & split ───────────────────────────────────────────
df = pd.read_csv('churn.csv')
X, y = df.drop('churn', axis=1), df['churn']
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# ── 2. Preprocessing pipeline ────────────────────────────────
num_feats = X.select_dtypes(include='number').columns.tolist()
cat_feats  = X.select_dtypes(include='object').columns.tolist()

prep = ColumnTransformer([
    ('num', Pipeline([('imp', SimpleImputer(strategy='median')),
                      ('sc',  StandardScaler())]), num_feats),
    ('cat', Pipeline([('imp', SimpleImputer(strategy='constant', fill_value='UNK')),
                      ('ohe', OneHotEncoder(handle_unknown='ignore'))]), cat_feats),
])

# ── 3. Full pipeline ──────────────────────────────────────────
full_pipe = Pipeline([
    ('prep', prep),
    ('clf',  GradientBoostingClassifier(
        n_estimators=300, learning_rate=0.05,
        max_depth=5, subsample=0.8, random_state=42
    ))
])

# ── 4. Cross-validate ─────────────────────────────────────────
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv_results = cross_validate(full_pipe, X_train, y_train, cv=cv,
    scoring=['roc_auc', 'f1'], return_train_score=True)
print(f"CV AUC: {cv_results['test_roc_auc'].mean():.4f} ± {cv_results['test_roc_auc'].std():.4f}")

# ── 5. Train final model + evaluate on test ───────────────────
with mlflow.start_run(run_name="GBM_v1"):
    full_pipe.fit(X_train, y_train)
    y_proba = full_pipe.predict_proba(X_test)[:, 1]
    test_auc = roc_auc_score(y_test, y_proba)
    mlflow.log_metric("test_auc", test_auc)
    mlflow.sklearn.log_model(full_pipe, "model")
    print(f"Test AUC: {test_auc:.4f}")
    print(classification_report(y_test, full_pipe.predict(X_test)))

# ── 6. Explainability with SHAP ───────────────────────────────
clf_only = full_pipe.named_steps['clf']
X_test_proc = full_pipe.named_steps['prep'].transform(X_test)
explainer = shap.TreeExplainer(clf_only)
shap_values = explainer.shap_values(X_test_proc)
shap.summary_plot(shap_values, X_test_proc)  # shows top features globally

# ── 7. Save + serve ───────────────────────────────────────────
joblib.dump(full_pipe, 'churn_pipeline_v1.pkl')

# In production (e.g., FastAPI):
# pipeline = joblib.load('churn_pipeline_v1.pkl')
# proba = pipeline.predict_proba(new_customer_df)[:, 1]
# return {"churn_probability": float(proba[0])}`,
					},
				},
				{
					title: 'Emerging Frontiers',
					type: 'examples',
					content: 'Cutting-edge directions shaping the next decade of ML:',
					data: [
						{
							name: 'Large Language Models (LLMs)',
							description: 'Transformers scaled to billions of parameters trained on internet text. Emergent capabilities at scale: reasoning, coding, multi-step planning.',
							impact: 'ChatGPT: 100M users in 60 days. GitHub Copilot: 46% of code written by AI. Revenue impact across all software companies.',
							example: 'GPT-4 passes bar exam (90th percentile), writes production code, translates between 100+ languages.',
						},
						{
							name: 'Multimodal Models',
							description: 'Single models processing text + images + audio + video. CLIP aligns image and text embedding spaces.',
							impact: 'GPT-4V, Gemini, Claude 3 — describe images, read charts, interpret medical scans in conversation.',
							example: 'DALL-E 3 generates photorealistic images from text; GPT-4o processes voice, image, text simultaneously.',
						},
						{
							name: 'Federated Learning',
							description: 'Train models across distributed devices without centralising data. Each device trains locally; only gradient updates are shared.',
							impact: 'Google Gboard keyboard: personalises next-word prediction without sending your typing to servers.',
							example: 'Healthcare: train on patient data across 100 hospitals without any hospital sharing raw records.',
						},
						{
							name: 'Autonomous Agents',
							description: 'LLMs equipped with tools (search, code execution, APIs) that plan and execute multi-step tasks with minimal human supervision.',
							impact: 'AutoGPT, Claude Computer Use, OpenAI Operator — perform research, write reports, manage calendars.',
							example: 'Software engineering agents (Devin, SWE-agent) resolve GitHub issues end-to-end autonomously.',
						},
						{
							name: 'Scientific ML',
							description: 'ML accelerating fundamental science: drug discovery, materials science, climate modelling, mathematics.',
							impact: 'AlphaFold 2: solved protein folding in 2020 — 50-year grand challenge. FunSearch: discovered new mathematical algorithms.',
							example: 'GNoME (DeepMind): discovered 2.2M new stable crystal structures — 45× more than entire prior history.',
						},
					],
				},
				{
					title: 'ML Deployment & MLOps',
					type: 'text',
					content:
						"Training a model is ~20% of the work; deploying and maintaining it is ~80%. MLOps (ML Operations) applies DevOps principles to ML systems. Key components: Model Registry — versioned storage of trained models (MLflow, Weights&Biases, SageMaker). Serving — REST API (FastAPI + Docker), batch inference (Spark), real-time streaming (Kafka + Flink). Monitoring — track prediction distribution drift (feature drift), target distribution drift (concept drift), model performance decay over time. When the world changes (COVID, new fraud patterns), model predictions degrade — you need automatic alerts and retraining triggers. A/B Testing — deploy new model to 10% of traffic, measure business metric (revenue, conversion, fraud rate) vs control. Promote if metric improves. Retraining Pipelines — automated pipelines that trigger when data drift detected or on schedule, retrain, evaluate, and promote if better. The ML lifecycle never ends: collect → label → train → evaluate → deploy → monitor → collect fresh data → retrain.",
				},
				{
					title: 'Key Challenges & Responsible AI',
					type: 'examples',
					content: 'Critical limitations every ML practitioner must address:',
					data: [
						{
							name: 'Algorithmic Bias & Fairness',
							description: 'Models trained on historical data inherit and amplify societal biases. Facial recognition 35% higher error for darker-skinned women vs lighter-skinned men (Buolamwini 2018).',
							impact: 'Hiring, lending, criminal justice, healthcare decisions made at scale with discriminatory effects.',
							example: 'Mitigation: demographic parity, equalised odds, adversarial debiasing, fairness-aware loss functions.',
						},
						{
							name: 'Interpretability & Explainability',
							description: 'Complex models are black boxes. EU AI Act mandates explainability for high-risk systems. SHAP and LIME provide post-hoc explanations.',
							impact: 'Regulators require explanation for credit denials (FCRA). Users distrust unexplained medical AI.',
							example: 'SHAP TreeExplainer: for any prediction, shows which features pushed probability up/down and by how much.',
						},
						{
							name: 'Data Privacy',
							description: 'Training on personal data raises GDPR concerns. Models can memorise and leak training data (membership inference attacks).',
							impact: 'Differential Privacy adds calibrated noise to gradients — Google, Apple use in production mobile ML.',
							example: 'Federated Learning + Differential Privacy: Apple Siri personalisation without centralising voice data.',
						},
						{
							name: 'Environmental Cost',
							description: "Training GPT-3: ~300 tonnes CO₂ equivalent. A single large model's training ≈ 5× car lifetime emissions.",
							impact: 'Growing concern as models scale. Green AI: smaller efficient models, renewable energy data centres.',
							example: 'Distillation: DistilBERT achieves 97% of BERT performance at 40% size — 4× faster, 60% less energy.',
						},
					],
				},
			],
			keyTakeaways: [
				'ML powers healthcare diagnostics, financial fraud detection, product recommendations, and autonomous systems at scale',
				'Foundation Models (GPT, CLIP, DALL-E) represent ML at civilisational scale — trained once, adapted everywhere',
				'MLOps (monitoring, drift detection, automated retraining) is 80% of production ML work',
				'Bias, explainability, and privacy are engineering requirements, not optional ethics extras',
				'The ML lifecycle is continuous: collect → train → deploy → monitor → retrain',
			],
		},
	},
];

/* ═══════════════════════════════════════════════════════════════
   CODE BLOCK COMPONENT
═══════════════════════════════════════════════════════════════ */
function CodeBlock({ code, language }: { code: string; language: string }) {
	const [copied, setCopied] = useState(false);
	const [collapsed, setCollapsed] = useState(false);

	const copy = () => {
		navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const lines = code.split('\n');

	const highlight = (line: string) => {
		if (line.trim().startsWith('#')) return 'text-emerald-300/80 italic';
		if (line.match(/^\s*(import|from|def |class |return|for |if |else|elif|with|try|except|print|raise)/))
			return 'text-sky-300';
		if (line.match(/["'`]/)) return 'text-amber-200';
		return 'text-slate-200';
	};

	return (
		<div className="rounded-xl border border-cyan-400/20 bg-[#040d1a] overflow-hidden">
			<div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0a1628]">
				<div className="flex items-center gap-2">
					<Code2 size={14} className="text-cyan-400" />
					<span className="text-xs font-semibold text-cyan-300 tracking-widest uppercase">{language}</span>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => setCollapsed((c) => !c)}
						className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-300 hover:bg-white/10 transition"
					>
						{collapsed ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
						{collapsed ? 'Expand' : 'Collapse'}
					</button>
					<button
						onClick={copy}
						className="px-2 py-1 rounded text-xs text-slate-300 hover:bg-white/10 transition"
					>
						{copied ? '✓ Copied' : 'Copy'}
					</button>
				</div>
			</div>
			{!collapsed && (
				<div className="overflow-x-auto p-4">
					<pre className="text-xs leading-relaxed font-mono">
						{lines.map((line, i) => (
							<div key={i} className="flex">
								<span className="select-none text-slate-600 w-6 shrink-0 text-right mr-4">{i + 1}</span>
								<span className={highlight(line)}>{line || ' '}</span>
							</div>
						))}
					</pre>
				</div>
			)}
		</div>
	);
}

/* ═══════════════════════════════════════════════════════════════
   VISUAL CHART COMPONENT
═══════════════════════════════════════════════════════════════ */
function VisualChart({ data }: { data: any }) {
	if (data.type === 'horizontal_bar') {
		return (
			<div className="space-y-2">
				{data.items.map((item: any, i: number) => (
					<div key={i} className="flex items-center gap-3">
						<span className="w-32 shrink-0 text-xs text-right text-slate-300">{item.label}</span>
						<div className="flex-1 h-6 rounded bg-white/5 overflow-hidden relative">
							<div
								className="h-full rounded transition-all duration-700"
								style={{ width: `${item.bar}%`, backgroundColor: item.color, opacity: 0.75 }}
							/>
							<span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/70">{item.decade}</span>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (data.type === 'stacked_gains') {
		return (
			<div className="space-y-3">
				{data.items.map((item: any, i: number) => (
					<div key={i}>
						<div className="flex justify-between mb-1">
							<span className="text-xs text-slate-300">{item.label}</span>
							<span className="text-xs font-bold" style={{ color: item.color }}>{item.value}%</span>
						</div>
						<div className="h-4 rounded-full bg-white/5 overflow-hidden">
							<div
								className="h-full rounded-full transition-all"
								style={{ width: `${item.value}%`, backgroundColor: item.color, opacity: 0.8 }}
							/>
						</div>
					</div>
				))}
			</div>
		);
	}

	if (data.type === 'paradigm_cards') {
		return (
			<div className="grid gap-4 sm:grid-cols-3">
				{data.items.map((item: any, i: number) => (
					<div
						key={i}
						className="rounded-xl p-4 border"
						style={{ borderColor: `${item.color}40`, background: `${item.color}08` }}
					>
						<div className="flex items-center gap-2 mb-3">
							<span className="text-2xl">{item.icon}</span>
							<h4 className="font-bold text-white">{item.name}</h4>
						</div>
						<p className="text-xs mb-2" style={{ color: item.color }}>{item.signal}</p>
						<p className="text-xs text-slate-400 mb-3">{item.goal}</p>
						<div className="mb-2">
							<p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Use Cases</p>
							{item.examples.map((ex: string, j: number) => (
								<p key={j} className="text-xs text-slate-300">• {ex}</p>
							))}
						</div>
						<div>
							<p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Algorithms</p>
							{item.algorithms.map((alg: string, j: number) => (
								<p key={j} className="text-[10px] text-slate-400">• {alg}</p>
							))}
						</div>
					</div>
				))}
			</div>
		);
	}

	if (data.type === 'quadrant') {
		return (
			<div className="relative w-full h-56 border border-white/10 rounded-xl bg-white/5 overflow-hidden">
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="w-px h-full bg-white/15 absolute left-1/2" />
					<div className="h-px w-full bg-white/15 absolute top-1/2" />
				</div>
				<span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-slate-500">{data.axes.x} →</span>
				<span className="absolute top-1/2 left-1 -translate-y-1/2 text-[10px] text-slate-500" style={{ writingMode: 'vertical-rl' }}>← {data.axes.y}</span>
				{data.points.map((pt: any, i: number) => (
					<div
						key={i}
						className="absolute flex flex-col items-center"
						style={{ left: `${pt.x}%`, bottom: `${pt.y}%`, transform: 'translate(-50%, 50%)' }}
					>
						<div className="w-3 h-3 rounded-full border-2 border-white/30" style={{ backgroundColor: pt.color }} />
						<span className="text-[9px] text-white/70 whitespace-nowrap mt-0.5">{pt.label}</span>
					</div>
				))}
			</div>
		);
	}

	if (data.type === 'learning_curves') {
		const epochs = [1, 2, 3, 4, 5];
		return (
			<div className="grid gap-3 sm:grid-cols-3">
				{data.scenarios.map((sc: any, i: number) => {
					const maxErr = Math.max(...sc.train, ...sc.val);
					const minErr = Math.min(...sc.train, ...sc.val);
					const range = maxErr - minErr || 1;
					return (
						<div key={i} className="rounded-xl border border-white/10 bg-white/5 p-3">
							<h5 className="text-xs font-bold mb-2" style={{ color: sc.color }}>{sc.name}</h5>
							<div className="relative h-24">
								<svg width="100%" height="100%" viewBox="0 0 100 80">
									{/* Train line */}
									<polyline
										fill="none"
										strokeWidth="2"
										stroke={sc.color}
										strokeOpacity="1"
										points={sc.train.map((v: number, j: number) =>
											`${j * 25},${80 - ((v - minErr) / range) * 70}`
										).join(' ')}
									/>
									{/* Val line */}
									<polyline
										fill="none"
										strokeWidth="2"
										stroke={sc.color}
										strokeOpacity="0.4"
										strokeDasharray="4"
										points={sc.val.map((v: number, j: number) =>
											`${j * 25},${80 - ((v - minErr) / range) * 70}`
										).join(' ')}
									/>
								</svg>
							</div>
							<div className="flex gap-3 mt-1">
								<span className="flex items-center gap-1 text-[9px] text-slate-400">
									<span className="inline-block w-4 h-0.5" style={{ backgroundColor: sc.color }} /> Train
								</span>
								<span className="flex items-center gap-1 text-[9px] text-slate-400">
									<span className="inline-block w-4 h-0.5 border-t border-dashed" style={{ borderColor: sc.color }} /> Val
								</span>
							</div>
							<p className="text-[9px] text-slate-500 mt-1">{sc.note}</p>
						</div>
					);
				})}
			</div>
		);
	}

	return null;
}

/* ═══════════════════════════════════════════════════════════════
   RENDER SECTION
═══════════════════════════════════════════════════════════════ */
function renderSection(section: Section, index: number) {
	switch (section.type) {
		case 'code':
			return (
				<div key={index} className="mb-6">
					<h3 className="mb-2 text-lg font-bold text-white">{section.title}</h3>
					<p className="mb-3 text-sm text-[#c5d4f7]">{section.content}</p>
					<CodeBlock code={section.data.code} language={section.data.language} />
				</div>
			);

		case 'visual_chart':
			return (
				<div key={index} className="mb-6">
					<h3 className="mb-2 text-lg font-bold text-white">{section.title}</h3>
					<p className="mb-3 text-sm text-[#c5d4f7]">{section.content}</p>
					<div className="rounded-xl border border-indigo-300/20 bg-[#0f1e39]/60 p-4">
						<VisualChart data={section.data} />
					</div>
				</div>
			);

		case 'timeline':
			return (
				<div key={index} className="mb-6">
					<h3 className="mb-3 text-lg font-bold text-white">{section.title}</h3>
					<p className="mb-4 text-sm leading-relaxed text-[#c5d4f7]">{section.content}</p>
					<div className="space-y-3">
						{section.data?.map((item: any, i: number) => (
							<div key={i} className="relative pl-8 pb-4 border-l-2 border-cyan-400/30 last:border-transparent">
								<div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-cyan-400 bg-[#0c122c]" />
								<div className="rounded-lg border border-white/10 bg-[#0f1e39]/60 p-3">
									<div className="mb-1 flex items-center gap-2">
										<span className="rounded bg-cyan-400/20 px-2 py-0.5 text-xs font-semibold text-cyan-200">{item.year}</span>
										<span className="text-sm font-bold text-white">{item.event}</span>
									</div>
									<p className="text-xs leading-relaxed text-[#b9c8ef]">{item.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			);

		case 'comparison':
			return (
				<div key={index} className="mb-6">
					<h3 className="mb-3 text-lg font-bold text-white">{section.title}</h3>
					<p className="mb-4 text-sm leading-relaxed text-[#c5d4f7]">{section.content}</p>
					{section.data?.traditional ? (
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-xl border border-orange-300/20 bg-gradient-to-br from-orange-900/20 to-orange-950/30 p-4">
								<div className="mb-3 flex items-center gap-2">
									<XCircle size={18} className="text-orange-300" />
									<h4 className="font-bold text-orange-100">Traditional Programming</h4>
								</div>
								<p className="mb-3 text-xs italic text-orange-200/80">{section.data.traditional.approach}</p>
								<div className="mb-2">
									<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-green-300">Strengths:</p>
									<ul className="space-y-0.5 text-xs text-[#dce8ff]">
										{section.data.traditional.strengths.map((s: string, i: number) => (
											<li key={i} className="flex items-start gap-1.5">
												<CheckSquare size={12} className="mt-0.5 shrink-0 text-green-400" />
												{s}
											</li>
										))}
									</ul>
								</div>
								<div>
									<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-300">Weaknesses:</p>
									<ul className="space-y-0.5 text-xs text-[#dce8ff]">
										{section.data.traditional.weaknesses.map((w: string, i: number) => (
											<li key={i} className="flex items-start gap-1.5">
												<AlertCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
												{w}
											</li>
										))}
									</ul>
								</div>
							</div>
							<div className="rounded-xl border border-cyan-300/20 bg-gradient-to-br from-cyan-900/20 to-indigo-950/30 p-4">
								<div className="mb-3 flex items-center gap-2">
									<Sparkles size={18} className="text-cyan-300" />
									<h4 className="font-bold text-cyan-100">Machine Learning</h4>
								</div>
								<p className="mb-3 text-xs italic text-cyan-200/80">{section.data.ml.approach}</p>
								<div className="mb-2">
									<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-green-300">Strengths:</p>
									<ul className="space-y-0.5 text-xs text-[#dce8ff]">
										{section.data.ml.strengths.map((s: string, i: number) => (
											<li key={i} className="flex items-start gap-1.5">
												<CheckSquare size={12} className="mt-0.5 shrink-0 text-green-400" />
												{s}
											</li>
										))}
									</ul>
								</div>
								<div>
									<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-300">Weaknesses:</p>
									<ul className="space-y-0.5 text-xs text-[#dce8ff]">
										{section.data.ml.weaknesses.map((w: string, i: number) => (
											<li key={i} className="flex items-start gap-1.5">
												<AlertCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
												{w}
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					) : section.data?.headers ? (
						<div className="overflow-x-auto rounded-xl border border-white/10">
							<table className="w-full text-xs">
								<thead>
									<tr className="border-b border-cyan-300/30 bg-cyan-400/5">
										{section.data.headers.map((h: string, i: number) => (
											<th key={i} className="p-3 text-left font-semibold text-cyan-200">{h}</th>
										))}
									</tr>
								</thead>
								<tbody>
									{section.data.rows.map((row: string[], i: number) => (
										<tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/2' : ''}`}>
											{row.map((cell: string, j: number) => (
												<td key={j} className="p-3 text-[#dce8ff]">{cell}</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : null}
				</div>
			);

		case 'process':
			return (
				<div key={index} className="mb-6">
					<h3 className="mb-3 text-lg font-bold text-white">{section.title}</h3>
					<p className="mb-4 text-sm leading-relaxed text-[#c5d4f7]">{section.content}</p>
					<div className="space-y-3">
						{section.data?.map((item: any, i: number) => (
							<div key={i} className="rounded-lg border border-indigo-300/20 bg-[#1a2347]/60 p-4">
								<div className="flex items-start gap-3">
									<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-400/20 text-xs font-bold text-indigo-200">
										{i + 1}
									</div>
									<div className="flex-1">
										<h4 className="mb-1 font-bold text-white">{item.step}</h4>
										<p className="text-xs leading-relaxed text-[#c5d4f7]">{item.description}</p>
										{item.detail && (
											<p className="mt-1 text-xs italic text-indigo-200/70">💡 {item.detail}</p>
										)}
										{item.challenges && (
											<p className="mt-1 text-xs text-amber-200/80">⚠️ {item.challenges}</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			);

		case 'metrics':
			return (
				<div key={index} className="mb-6">
					<h3 className="mb-3 text-lg font-bold text-white">{section.title}</h3>
					<p className="mb-4 text-sm leading-relaxed text-[#c5d4f7]">{section.content}</p>
					<div className="space-y-2">
						{section.data?.map((item: any, i: number) => (
							<div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#0f1e39]/40 p-3">
								<TrendingUp size={16} className="shrink-0 text-emerald-400" />
								<div className="flex-1">
									<p className="text-sm font-semibold text-white">{item.metric || item.technique || item.factor}</p>
									<p className="text-xs text-[#b9c8ef]">
										{item.traditional && `Traditional: ${item.traditional} → ML: ${item.ml}`}
										{item.speedup && `Speedup: ${item.speedup}`}
										{item.poor && `Poor: ${item.poor} → Good: ${item.good}`}
									</p>
								</div>
								<div className="shrink-0 rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-bold text-emerald-200">
									{item.improvement || item.performance_gain || '↑'}
								</div>
							</div>
						))}
					</div>
				</div>
			);

		case 'examples':
			return (
				<div key={index} className="mb-6">
					<h3 className="mb-3 text-lg font-bold text-white">{section.title}</h3>
					<p className="mb-4 text-sm leading-relaxed text-[#c5d4f7]">{section.content}</p>
					<div className="space-y-3">
						{section.data?.map((item: any, i: number) => (
							<div key={i} className="rounded-lg border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-950/20 to-purple-950/30 p-4">
								<h4 className="mb-2 font-bold text-fuchsia-100">
									{item.name || item.domain || item.scenario || item.app || item.system || item.issue || item.challenge || item.frontier || item.industry || item.metric}
								</h4>
								{item.description && <p className="mb-2 text-xs text-[#e9ddff]">{item.description}</p>}
								{item.applications && (
									<div className="mb-2">
										<p className="mb-1 text-xs font-semibold text-fuchsia-200">Applications:</p>
										<ul className="ml-4 list-disc space-y-0.5 text-xs text-[#e9ddff]">
											{item.applications.map((app: string, j: number) => <li key={j}>{app}</li>)}
										</ul>
									</div>
								)}
								{item.solutions && (
									<div className="mb-2">
										<p className="mb-1 text-xs font-semibold text-emerald-200">Solutions:</p>
										<ul className="ml-4 list-disc space-y-0.5 text-xs text-[#e9ddff]">
											{item.solutions.map((s: string, j: number) => <li key={j}>{s}</li>)}
										</ul>
									</div>
								)}
								{item.strengths && (
									<div className="mb-2">
										<p className="mb-1 text-xs font-semibold text-green-200">Strengths:</p>
										<ul className="ml-4 list-disc space-y-0.5 text-xs text-[#e9ddff]">
											{item.strengths.map((s: string, j: number) => <li key={j}>{s}</li>)}
										</ul>
									</div>
								)}
								{item.weaknesses && (
									<div className="mb-2">
										<p className="mb-1 text-xs font-semibold text-red-200">Weaknesses:</p>
										<ul className="ml-4 list-disc space-y-0.5 text-xs text-[#e9ddff]">
											{item.weaknesses.map((w: string, j: number) => <li key={j}>{w}</li>)}
										</ul>
									</div>
								)}
								{item.impact && (
									<p className="mt-2 rounded bg-emerald-400/10 p-2 text-xs text-emerald-200">
										<strong>Impact:</strong> {item.impact}
									</p>
								)}
								{item.example && (
									<p className="mt-2 rounded bg-cyan-400/10 p-2 text-xs italic text-cyan-200">
										💡 {item.example}
									</p>
								)}
								{item.bestFor && <p className="mt-2 text-xs text-amber-200">⭐ <strong>Best for:</strong> {item.bestFor}</p>}
							</div>
						))}
					</div>
				</div>
			);

		case 'diagram':
			return (
				<div key={index} className="mb-6">
					<h3 className="mb-3 text-lg font-bold text-white">{section.title}</h3>
					<p className="mb-4 text-sm leading-relaxed text-[#c5d4f7]">{section.content}</p>
					<div className="rounded-xl border border-indigo-300/30 bg-[#1a2347]/60 p-4">
						{section.data?.matrix ? (
							<div className="overflow-x-auto">
								<table className="w-full border-collapse text-xs">
									{section.data.matrix.map((row: string[], i: number) => (
										<tr key={i}>
											{row.map((cell: string, j: number) => (
												<td
													key={j}
													className={`border border-white/10 p-3 whitespace-pre-line ${
														i === 0 || j === 0
															? 'bg-indigo-400/10 font-semibold text-indigo-100'
															: j === 1 && i === 2
															? 'text-amber-200'
															: j === 2 && i === 1
															? 'text-orange-200'
															: 'bg-[#0f1e39]/40 text-[#dce8ff]'
													}`}
												>
													{cell}
												</td>
											))}
										</tr>
									))}
								</table>
								{section.data.calculations && (
									<div className="mt-4 rounded bg-cyan-400/5 p-3 space-y-1">
										<p className="mb-2 text-xs font-semibold text-cyan-200">Formulas:</p>
										{Object.entries(section.data.calculations).map(([k, v]: [string, any]) => (
											<p key={k} className="text-xs text-[#dce8ff]">
												<strong className="text-cyan-200">{k}:</strong> {v}
											</p>
										))}
									</div>
								)}
								{section.data.example && (
									<div className="mt-4 rounded bg-emerald-400/5 p-3">
										<p className="mb-2 text-xs font-semibold text-emerald-200">Example: {section.data.example.scenario}</p>
										<div className="grid gap-2 text-xs text-[#dce8ff] sm:grid-cols-2">
											<p>True Negatives: {section.data.example.tn}</p>
											<p>False Positives: {section.data.example.fp}</p>
											<p>False Negatives: {section.data.example.fn}</p>
											<p>True Positives: {section.data.example.tp}</p>
										</div>
										<div className="mt-2 border-t border-white/10 pt-2 space-y-1">
											<p className="text-emerald-200"><strong>Accuracy:</strong> {section.data.example.accuracy}</p>
											<p className="text-orange-200"><strong>Precision:</strong> {section.data.example.precision}</p>
											<p className="text-sky-200"><strong>Recall:</strong> {section.data.example.recall}</p>
										</div>
									</div>
								)}
							</div>
						) : section.data?.question ? (
							<div className="space-y-3">
								<p className="text-sm font-semibold text-indigo-100">{section.data.question}</p>
								{section.data.branches?.map((branch: any, i: number) => (
									<div key={i} className="ml-4 rounded-lg border border-white/10 bg-[#0f1e39]/40 p-3">
										<p className="mb-2 text-xs font-semibold text-cyan-200">→ {branch.answer}</p>
										{branch.algorithms ? (
											<ul className="ml-3 space-y-1">
												{branch.algorithms.map((alg: string, j: number) => (
													<li key={j} className="text-xs text-[#dce8ff]">• {alg}</li>
												))}
											</ul>
										) : branch.next ? (
											<div className="ml-2">
												<p className="mb-2 text-xs italic text-indigo-200">{branch.next.question}</p>
												{branch.next.branches?.map((sub: any, k: number) => (
													<div key={k} className="ml-3 mb-2">
														<p className="mb-1 text-xs font-semibold text-fuchsia-200">→ {sub.answer}</p>
														{sub.algorithms && (
															<ul className="ml-3 space-y-0.5">
																{sub.algorithms.map((alg: string, l: number) => (
																	<li key={l} className="text-xs text-[#dce8ff]">• {alg}</li>
																))}
															</ul>
														)}
													</div>
												))}
											</div>
										) : null}
									</div>
								))}
							</div>
						) : null}
					</div>
				</div>
			);

		default:
			return (
				<div key={index} className="mb-6">
					<h3 className="mb-3 text-lg font-bold text-white">{section.title}</h3>
					<p className="text-sm leading-relaxed text-[#dce8ff]">{section.content}</p>
				</div>
			);
	}
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function MLTutorialPage() {
	const [activeStep, setActiveStep] = useState(1);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);

	const highestCompleted = useMemo(
		() => (completedSteps.length ? Math.max(...completedSteps) : 0),
		[completedSteps],
	);
	const unlockedUntil = Math.min(TUTORIAL_STEPS.length, highestCompleted + 1);
	const progressPercent = (completedSteps.length / TUTORIAL_STEPS.length) * 100;

	useEffect(() => {
		if (typeof window === 'undefined') return;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (!saved) return;
			const parsed = JSON.parse(saved) as { activeStep?: number; completedSteps?: number[] };
			const nc = Array.from(new Set((parsed.completedSteps ?? []).filter((s) => s >= 1 && s <= 8))).sort((a, b) => a - b);
			const sa = parsed.activeStep && parsed.activeStep >= 1 && parsed.activeStep <= 8 ? parsed.activeStep : 1;
			const maxU = Math.min(8, (nc.length ? Math.max(...nc) : 0) + 1);
			setCompletedSteps(nc);
			setActiveStep(Math.min(sa, maxU));
		} catch {
			setActiveStep(1);
			setCompletedSteps([]);
		}
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeStep, completedSteps }));
	}, [activeStep, completedSteps]);

	const markCompleted = (id: number) =>
		setCompletedSteps((prev) => (prev.includes(id) ? prev : [...prev, id].sort((a, b) => a - b)));

	const handleStepClick = (id: number) => {
		if (id > unlockedUntil) return;
		setActiveStep(id);
	};

	const goNext = () => {
		markCompleted(activeStep);
		if (activeStep < 8) setActiveStep((c) => c + 1);
	};
	const goPrevious = () => {
		if (activeStep > 1) setActiveStep((c) => c - 1);
	};

	const activeStepData = TUTORIAL_STEPS.find((s) => s.id === activeStep) ?? TUTORIAL_STEPS[0];
	const ActiveIcon = activeStepData.icon;

	return (
		<main className="min-h-screen lg:h-screen lg:overflow-hidden bg-[radial-gradient(circle_at_top,#172047_0%,#080b1f_45%,#050712_100%)] text-[#edf2ff] font-chillax">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -left-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
				<div className="absolute top-24 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
				<div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
			</div>

			<div className="relative flex h-full w-full flex-col">
				{/* Header */}
				<header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#0f1430]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
					<div className="flex items-center gap-4">
						<Logo href="/home" size="md" showText={true} variant="light" />
					</div>
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300/20 hover:shadow-[0_0_18px_rgba(34,211,238,0.35)]"
					>
						<Sparkles size={16} />
						Go to Dashboard
					</Link>
				</header>

				{/* Body */}
				<section className="grid flex-1 gap-0 lg:min-h-0 lg:grid-cols-[380px_minmax(0,1fr)]">
					{/* Sidebar */}
					<aside className="flex flex-col border-r border-white/10 bg-[#0d1230]/90 p-3 backdrop-blur-xl lg:h-full lg:overflow-hidden">
						<div className="mb-3 rounded-xl border border-cyan-300/25 bg-[#131a3d]/80 p-3">
							<div className="mb-2 flex items-center justify-between text-sm">
								<span className="text-cyan-200">Progress</span>
								<span className="font-semibold text-white">{completedSteps.length}/8 completed</span>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-white/10">
								<div
									className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 transition-all duration-700"
									style={{ width: `${progressPercent}%`, boxShadow: '0 0 16px rgba(34,211,238,0.7)' }}
								/>
							</div>
						</div>

						<div className="grid flex-1 grid-cols-1 gap-2 content-start overflow-y-auto">
							{TUTORIAL_STEPS.map((step) => {
								const StepIcon = step.icon;
								const isCompleted = completedSteps.includes(step.id);
								const isActive = activeStep === step.id;
								const isLocked = step.id > unlockedUntil;
								return (
									<button
										key={step.id}
										type="button"
										onClick={() => handleStepClick(step.id)}
										disabled={isLocked}
										className={`group relative w-full overflow-hidden rounded-xl p-[1px] text-left transition-all duration-300 ${
											isActive ? 'scale-[1.01] shadow-[0_0_24px_rgba(129,140,248,0.45)]' : 'hover:scale-[1.01]'
										} ${isLocked ? 'cursor-not-allowed opacity-65 blur-[0.4px]' : ''}`}
										style={{
											background: isActive
												? 'linear-gradient(130deg,rgba(34,211,238,.95),rgba(99,102,241,.95),rgba(236,72,153,.9))'
												: 'linear-gradient(130deg,rgba(255,255,255,.18),rgba(255,255,255,.06))',
										}}
									>
										<div className={`relative rounded-[11px] px-3 py-2 ${isActive ? 'bg-gradient-to-br from-[#19305a] to-[#24153b]' : 'bg-gradient-to-br from-[#121935] to-[#0d142e]'}`}>
											<div className="mb-1 flex items-center justify-between">
												<span className="text-xs font-semibold tracking-[0.2em] text-cyan-200">{String(step.id).padStart(2, '0')}</span>
												{isCompleted ? (
													<CheckCircle2 size={16} className="text-emerald-300" />
												) : isLocked ? (
													<Lock size={14} className="text-slate-300" />
												) : (
													<StepIcon size={16} className="text-cyan-200" />
												)}
											</div>
											<h3 className="text-[13px] font-semibold leading-snug text-white">{step.title}</h3>
											<p className="mt-1 text-[11px] leading-tight text-[#b9c8ef] line-clamp-2">{step.shortDescription}</p>
											{!isLocked && (
												<span className="mt-1.5 inline-flex rounded-full border border-white/15 px-2 py-0.5 text-[10px] tracking-wide text-cyan-100">
													{isCompleted ? 'Completed' : isActive ? 'Active' : 'Unlocked'}
												</span>
											)}
										</div>
									</button>
								);
							})}
						</div>
					</aside>

					{/* Main content */}
					<section className="bg-[#0c122c]/90 p-5 backdrop-blur-xl sm:p-6 lg:h-full lg:overflow-y-auto lg:p-8">
						<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
							<div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold tracking-[0.15em] text-cyan-100">
								Step {String(activeStepData.id).padStart(2, '0')} of 08
							</div>
							<button
								type="button"
								onClick={() => markCompleted(activeStepData.id)}
								className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
							>
								<CheckCircle2 size={14} />
								Mark as completed
							</button>
						</div>

						<div className="rounded-2xl border border-indigo-300/30 bg-gradient-to-br from-[#172a4f] via-[#20184a] to-[#10243f] p-5 shadow-[0_0_32px_rgba(99,102,241,0.25)] sm:p-7">
							<div className="mb-5 flex items-center gap-3">
								<div className="rounded-xl border border-white/20 bg-white/10 p-2.5">
									<ActiveIcon size={22} className="text-cyan-100" />
								</div>
								<h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{activeStepData.title}</h2>
							</div>

							<div className="mb-6 rounded-xl border border-cyan-300/20 bg-cyan-400/5 p-4">
								<p className="text-sm leading-relaxed text-[#dce8ff]">{activeStepData.content.intro}</p>
							</div>

							{activeStepData.content.sections.map((section, idx) =>
								renderSection(section as Section, idx)
							)}

							<div className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-400/5 p-4">
								<h3 className="mb-3 flex items-center gap-2 text-base font-bold text-emerald-100">
									<Target size={18} />
									Key Takeaways
								</h3>
								<ul className="space-y-2">
									{activeStepData.content.keyTakeaways.map((t, i) => (
										<li key={i} className="flex items-start gap-2 text-sm text-[#dce8ff]">
											<CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
											{t}
										</li>
									))}
								</ul>
							</div>

							<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
								<button
									type="button"
									onClick={goPrevious}
									disabled={activeStepData.id === 1}
									className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-45"
								>
									<ArrowLeft size={16} />
									Previous
								</button>
								<button
									type="button"
									onClick={goNext}
									disabled={activeStepData.id === 8}
									className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-gradient-to-r from-cyan-400/30 to-indigo-400/30 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:from-cyan-300/40 hover:to-indigo-300/40 disabled:cursor-not-allowed disabled:opacity-45"
								>
									Next
									<ArrowRight size={16} />
								</button>
							</div>
						</div>
					</section>
				</section>
			</div>
		</main>
	);
}