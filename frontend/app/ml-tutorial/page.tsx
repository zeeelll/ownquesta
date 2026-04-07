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
	Users,
	Target,
	Zap,
	AlertCircle,
	CheckSquare,
	XCircle,
} from 'lucide-react';
import Logo from '../components/Logo';

type StepData = {
	id: number;
	title: string;
	shortDescription: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	content: {
		intro: string;
		sections: {
			title: string;
			content: string;
			type: 'text' | 'timeline' | 'comparison' | 'process' | 'metrics' | 'examples' | 'diagram';
			data?: any;
		}[];
		keyTakeaways: string[];
	};
};

const STORAGE_KEY = 'ownquesta_ml_tutorial_progress_v1';

const TUTORIAL_STEPS: StepData[] = [
	{
		id: 1,
		title: 'History of Machine Learning',
		shortDescription: 'How ML started and became part of everyday life.',
		icon: History,
		content: {
			intro: 'Machine Learning has evolved from theoretical concepts to practical applications that touch nearly every aspect of modern life. Understanding its history helps us appreciate the technological revolution we\'re experiencing today.',
			sections: [
				{
					title: 'The Evolution Timeline',
					type: 'timeline',
					content: 'Machine Learning has progressed through distinct eras, each marked by breakthrough innovations and expanding capabilities.',
					data: [
						{ year: '1943-1950s', event: 'Early Foundations', description: 'Warren McCulloch and Walter Pitts create the first mathematical model of a neural network. Alan Turing proposes the "Turing Test" for machine intelligence.' },
						{ year: '1956', event: 'Birth of AI', description: 'The Dartmouth Conference coins the term "Artificial Intelligence" and launches AI as a formal field of study.' },
						{ year: '1960s-1970s', event: 'Early Algorithms', description: 'Development of basic algorithms like nearest neighbor and perceptron. First AI winter due to limited computing power.' },
						{ year: '1980s-1990s', event: 'Renaissance Era', description: 'Backpropagation algorithm revitalizes neural networks. Decision trees and support vector machines emerge.' },
						{ year: '1997', event: 'Deep Blue Victory', description: 'IBM\'s Deep Blue defeats world chess champion Garry Kasparov, demonstrating AI\'s strategic capabilities.' },
						{ year: '2006-2012', event: 'Deep Learning Revolution', description: 'Geoffrey Hinton\'s work on deep learning. ImageNet competition drives computer vision breakthroughs.' },
						{ year: '2016-Present', event: 'Modern AI Era', description: 'AlphaGo defeats world Go champion. GPT models revolutionize language understanding. AI becomes mainstream.' }
					]
				},
				{
					title: 'Key Technological Breakthroughs',
					type: 'examples',
					content: 'Several pivotal moments transformed ML from theory to practice:',
					data: [
						{ name: 'GPU Computing', impact: 'NVIDIA\'s GPUs enabled parallel processing, reducing training time from months to days' },
						{ name: 'Big Data', impact: 'The internet explosion provided massive datasets needed for training complex models' },
						{ name: 'Cloud Computing', impact: 'AWS, Google Cloud, and Azure democratized access to powerful computing resources' },
						{ name: 'Open Source', impact: 'TensorFlow, PyTorch, and scikit-learn made advanced ML accessible to everyone' }
					]
				},
				{
					title: 'From Research to Reality',
					type: 'text',
					content: 'What began in academic laboratories is now embedded in everyday technology. Early ML systems required expert knowledge and specialized hardware. Today, pre-trained models and user-friendly frameworks allow developers to integrate ML into applications within hours. The smartphone in your pocket contains more AI capability than entire research centers had in the 1990s. Voice assistants understand natural language, cameras recognize faces instantly, and recommendation systems predict preferences with remarkable accuracy. This transformation happened because of three converging factors: exponentially growing computational power (Moore\'s Law), unprecedented data availability from digital activities, and algorithmic innovations that make learning more efficient and effective.'
				}
			],
			keyTakeaways: [
				'ML evolved over 70+ years from theoretical concepts to practical applications',
				'Major breakthroughs include neural networks (1940s), backpropagation (1980s), and deep learning (2006+)',
				'GPU computing, big data, and cloud infrastructure accelerated ML adoption',
				'Modern ML is accessible to developers worldwide through open-source tools',
				'AI capabilities once requiring supercomputers now fit in smartphones'
			]
		}
	},
	{
		id: 2,
		title: 'Why Machine Learning',
		shortDescription: 'Why we use ML instead of writing every rule by hand.',
		icon: Lightbulb,
		content: {
			intro: 'Traditional programming requires humans to explicitly define every rule and decision path. Machine Learning takes a fundamentally different approach: instead of programming rules, we provide examples and let the system discover patterns automatically.',
			sections: [
				{
					title: 'Traditional Programming vs Machine Learning',
					type: 'comparison',
					content: 'Understanding the fundamental difference in approach:',
					data: {
						traditional: {
							approach: 'Rules + Data = Answers',
							strengths: ['Predictable behavior', 'Easy to debug', 'Complete control', 'Works with small datasets'],
							weaknesses: ['Cannot handle complexity', 'Brittle to edge cases', 'Time-consuming to update', 'Limited scalability'],
							examples: ['Calculator apps', 'Form validation', 'Database queries', 'Simple if-then logic']
						},
						ml: {
							approach: 'Data + Answers = Rules',
							strengths: ['Handles complexity', 'Adapts to new patterns', 'Scales with data', 'Discovers hidden insights'],
							weaknesses: ['Needs large datasets', 'Less predictable', 'Harder to debug', 'Requires expertise'],
							examples: ['Image recognition', 'Language translation', 'Fraud detection', 'Recommendation systems']
						}
					}
				},
				{
					title: 'When to Use Machine Learning',
					type: 'examples',
					content: 'ML excels in specific scenarios where traditional programming falls short:',
					data: [
						{
							scenario: 'Pattern Recognition',
							description: 'When visual or audio patterns are too complex to describe with rules',
							example: 'Identifying objects in images, speech recognition, medical image diagnosis'
						},
						{
							scenario: 'High Dimensional Data',
							description: 'When data has hundreds or thousands of features that interact in complex ways',
							example: 'Customer behavior prediction, genomic analysis, sensor data from IoT devices'
						},
						{
							scenario: 'Dynamic Environments',
							description: 'When rules change over time and the system must adapt',
							example: 'Stock market prediction, spam detection (spammers constantly evolve tactics), trending content'
						},
						{
							scenario: 'Personalization',
							description: 'When each user needs a unique experience based on their behavior',
							example: 'Netflix recommendations, Spotify playlists, e-commerce product suggestions'
						}
					]
				},
				{
					title: 'The Power of Learning from Data',
					type: 'text',
					content: 'Consider spam email detection. In 1990, you might write rules: "If email contains \'Nigerian prince\' or \'lottery winner\', mark as spam." Spammers adapted within days, misspelling words or using images. You\'d need thousands of rules, constantly updated, and still miss new variations. With ML, you show the system 100,000 examples of spam and legitimate emails. It discovers patterns you never noticed: suspicious sender domains, unusual punctuation patterns, timing of emails, even subtle linguistic styles. When spammers change tactics, you simply retrain with new examples. The system adapts automatically. This is ML\'s superpower: finding complex, subtle patterns in massive datasets that humans couldn\'t possibly encode as rules. Modern spam filters catch 99.9% of spam while traditional rule-based systems struggled to reach 90%.'
				},
				{
					title: 'Real-World Impact',
					type: 'metrics',
					content: 'Quantifying ML\'s advantages over traditional approaches:',
					data: [
						{ metric: 'Spam Detection Accuracy', traditional: '85-90%', ml: '99.9%', improvement: '+10-15%' },
						{ metric: 'Development Time (Complex Apps)', traditional: '6-12 months', ml: '2-4 months', improvement: '60% faster' },
						{ metric: 'Adaptation to Changes', traditional: 'Weeks (manual)', ml: 'Hours (automatic)', improvement: '100x faster' },
						{ metric: 'Pattern Discovery', traditional: '10-20 patterns', ml: '1000s of patterns', improvement: '50-100x more' }
					]
				}
			],
			keyTakeaways: [
				'ML learns patterns from data instead of requiring hand-coded rules',
				'Use ML for complex patterns, high-dimensional data, and dynamic environments',
				'ML systems adapt automatically when retrained with new data',
				'Traditional programming remains better for simple, well-defined logic',
				'ML excels at personalization and discovering hidden patterns humans miss'
			]
		}
	},
	{
		id: 3,
		title: 'Types of ML',
		shortDescription: 'Supervised, unsupervised, and reinforcement learning.',
		icon: Layers3,
		content: {
			intro: 'Machine Learning encompasses several distinct learning paradigms, each suited to different types of problems. The three main categories—supervised, unsupervised, and reinforcement learning—differ fundamentally in how they learn and what questions they answer.',
			sections: [
				{
					title: 'Supervised Learning',
					type: 'text',
					content: 'Supervised learning is like learning with a teacher who provides correct answers. You train the model with labeled data—inputs paired with their correct outputs. For example, showing photos labeled "cat" or "dog" until the model learns to classify new photos. This approach works for two main tasks: Classification (predicting categories like spam/not spam, disease/healthy) and Regression (predicting numbers like house prices, temperature). The model learns by comparing its predictions to actual answers, adjusting its internal parameters to minimize errors. Once trained, it can predict labels for new, unseen data. Common algorithms include linear regression (for numbers), logistic regression (for yes/no), decision trees (rule-based splits), random forests (multiple trees voting), and neural networks (brain-inspired layers).'
				},
				{
					title: 'Supervised Learning Applications',
					type: 'examples',
					content: 'Real-world supervised learning use cases:',
					data: [
						{ domain: 'Healthcare', task: 'Disease Diagnosis', input: 'Medical images, symptoms, test results', output: 'Disease present or absent', accuracy: '94-98%' },
						{ domain: 'Finance', task: 'Credit Scoring', input: 'Income, history, employment, assets', output: 'Loan approval probability', accuracy: '85-92%' },
						{ domain: 'E-commerce', task: 'Price Prediction', input: 'Product features, market demand, competition', output: 'Optimal price point', accuracy: '88-95%' },
						{ domain: 'Manufacturing', task: 'Quality Control', input: 'Sensor readings, visual inspection', output: 'Defective or acceptable', accuracy: '96-99%' }
					]
				},
				{
					title: 'Unsupervised Learning',
					type: 'text',
					content: 'Unsupervised learning works without labeled answers—the algorithm must find structure in unlabeled data on its own. Imagine dumping 10,000 documents on a table and asking "What natural groups exist here?" The system might cluster them into topics: sports, politics, technology, entertainment, based on word patterns it discovers. The main techniques are Clustering (grouping similar items), Dimensionality Reduction (simplifying complex data while preserving important patterns), and Anomaly Detection (finding unusual outliers). Popular algorithms include K-means (finds K groups by minimizing distances), Hierarchical clustering (builds tree of nested groups), DBSCAN (finds dense regions as clusters), PCA (reduces dimensions by finding main directions of variation), and Autoencoders (neural networks that compress then reconstruct data).'
				},
				{
					title: 'Unsupervised Learning Applications',
					type: 'examples',
					content: 'Discovering hidden patterns without labels:',
					data: [
						{ domain: 'Marketing', task: 'Customer Segmentation', purpose: 'Group customers by behavior patterns', benefit: 'Targeted campaigns increase conversion 2-3x' },
						{ domain: 'Cybersecurity', task: 'Anomaly Detection', purpose: 'Identify unusual network activity', benefit: 'Detect novel attacks with no prior examples' },
						{ domain: 'Genomics', task: 'Gene Expression Clustering', purpose: 'Find genes with similar activation patterns', benefit: 'Discover disease subtypes and drug targets' },
						{ domain: 'Retail', task: 'Market Basket Analysis', purpose: 'Find products purchased together', benefit: 'Optimize store layout and promotions' }
					]
				},
				{
					title: 'Reinforcement Learning',
					type: 'text',
					content: 'Reinforcement Learning (RL) is learning by trial and error with rewards and penalties—like training a dog with treats. An agent takes actions in an environment, receives rewards for good actions and penalties for bad ones, and learns which actions maximize long-term reward. Unlike supervised learning (which has correct answers) or unsupervised learning (which finds patterns), RL learns optimal behavior through experience. Key concepts include: Agent (the learner), Environment (the world it acts in), State (current situation), Action (what the agent can do), Reward (feedback signal), and Policy (strategy mapping states to actions). RL excels when: the optimal strategy isn\'t known in advance, outcomes depend on sequences of decisions, and learning requires exploration of possibilities.'
				},
				{
					title: 'Reinforcement Learning Successes',
					type: 'examples',
					content: 'RL achieving superhuman performance:',
					data: [
						{ system: 'AlphaGo (2016)', achievement: 'Defeated world Go champion', complexity: '10^170 possible positions', impact: 'Proved RL can master intuitive, strategic games' },
						{ system: 'OpenAI Five (2018)', achievement: 'Beat professional Dota 2 team', complexity: '10^20000 states, real-time decisions', impact: 'Demonstrated teamwork and long-term planning' },
						{ system: 'Waymo Self-Driving', achievement: '20M+ autonomous miles', complexity: 'Unpredictable traffic, weather, pedestrians', impact: 'Real-world navigation without human intervention' },
						{ system: 'AlphaFold (2020)', achievement: 'Solved protein folding', complexity: 'Predict 3D structure from sequence', impact: 'Accelerated drug discovery by 10-100x' }
					]
				},
				{
					title: 'Comparing the Three Paradigms',
					type: 'comparison',
					content: 'Understanding when to use each approach:',
					data: {
						headers: ['Aspect', 'Supervised', 'Unsupervised', 'Reinforcement'],
						rows: [
							['Data Required', 'Labeled examples', 'Unlabeled data', 'Environment interaction'],
							['Learning Signal', 'Correct answers', 'Data structure', 'Rewards/penalties'],
							['Goal', 'Predict labels', 'Find patterns', 'Maximize reward'],
							['Human Effort', 'High (labeling)', 'Low', 'Medium (reward design)'],
							['Best For', 'Classification, regression', 'Clustering, compression', 'Sequential decisions, control'],
							['Example', 'Email spam filter', 'Customer segments', 'Game playing, robotics']
						]
					}
				}
			],
			keyTakeaways: [
				'Supervised learning uses labeled data to predict outcomes (classification/regression)',
				'Unsupervised learning finds patterns in unlabeled data (clustering/dimensionality reduction)',
				'Reinforcement learning optimizes sequential decisions through trial and error',
				'Choose supervised when you have labels, unsupervised for exploration, RL for control',
				'Modern systems often combine multiple paradigms for complex problems'
			]
		}
	},
	{
		id: 4,
		title: 'Data Collection & Preprocessing',
		shortDescription: 'Gather clean data before training a model.',
		icon: Database,
		content: {
			intro: 'Data is the foundation of machine learning—models are only as good as the data they learn from. The process of collecting, cleaning, and preparing data often takes 60-80% of a data scientist\'s time, yet it\'s the most critical phase determining project success.',
			sections: [
				{
					title: 'The Data Pipeline',
					type: 'process',
					content: 'A systematic approach to preparing data for ML:',
					data: [
						{
							step: '1. Data Collection',
							description: 'Gather data from databases, APIs, web scraping, sensors, or manual entry',
							challenges: 'Ensuring sufficient volume, variety, and representativeness',
							tools: 'SQL, web scrapers, API clients, data warehouses'
						},
						{
							step: '2. Data Exploration',
							description: 'Understand data structure, distributions, and relationships',
							challenges: 'Identifying patterns, outliers, and data quality issues',
							tools: 'Pandas, visualization libraries, statistical analysis'
						},
						{
							step: '3. Data Cleaning',
							description: 'Handle missing values, remove duplicates, fix errors',
							challenges: 'Deciding how to impute or remove problematic data',
							tools: 'Pandas, OpenRefine, custom scripts'
						},
						{
							step: '4. Feature Engineering',
							description: 'Create new features, transform variables, encode categories',
							challenges: 'Finding meaningful representations, avoiding data leakage',
							tools: 'Scikit-learn, domain expertise, creativity'
						},
						{
							step: '5. Data Splitting',
							description: 'Divide into training, validation, and test sets',
							challenges: 'Ensuring sets are representative and independent',
							tools: 'Train-test-split, cross-validation, stratification'
						},
						{
							step: '6. Scaling & Normalization',
							description: 'Standardize feature ranges for algorithm efficiency',
							challenges: 'Choosing appropriate scaling method, avoiding data leakage',
							tools: 'StandardScaler, MinMaxScaler, normalization'
						}
					]
				},
				{
					title: 'Common Data Quality Issues',
					type: 'examples',
					content: 'Problems encountered and their solutions:',
					data: [
						{
							issue: 'Missing Values',
							impact: 'Models crash or make poor predictions',
							solutions: [
								'Remove rows/columns (if <5% missing)',
								'Mean/median imputation (for numbers)',
								'Mode imputation (for categories)',
								'Predictive imputation (ML-based)',
								'Special "missing" category'
							],
							example: 'Age missing for 15% of customers → Use median age or predict based on other features'
						},
						{
							issue: 'Outliers',
							impact: 'Skew statistical measures, harm model performance',
							solutions: [
								'Remove if data errors',
								'Cap at percentiles (e.g., 1st-99th)',
								'Transform (log, square root)',
								'Use robust algorithms (tree-based)',
								'Keep if legitimate edge cases'
							],
							example: 'Income of $10M when median is $50K → Verify if real or data entry error'
						},
						{
							issue: 'Imbalanced Classes',
							impact: 'Model ignores minority class, poor predictions',
							solutions: [
								'Oversample minority (SMOTE)',
								'Undersample majority',
								'Class weights in loss function',
								'Generate synthetic examples',
								'Use appropriate metrics'
							],
							example: 'Fraud detection: 99.9% normal, 0.1% fraud → Model learns to always predict "normal"'
						},
						{
							issue: 'Data Leakage',
							impact: 'Inflated performance in testing, fails in production',
							solutions: [
								'Split data before any preprocessing',
								'Only use information available at prediction time',
								'Careful temporal validation',
								'Review feature creation logic',
								'Test on truly unseen data'
							],
							example: 'Using future information to predict past → Model looks perfect but useless in reality'
						}
					]
				},
				{
					title: 'Feature Engineering: The Art of ML',
					type: 'text',
					content: 'Feature engineering transforms raw data into meaningful representations that ML algorithms can effectively learn from. It requires domain knowledge, creativity, and experimentation. Numeric features might need binning (age → age_group), polynomial terms (height, weight → BMI), or temporal features (timestamp → hour_of_day, day_of_week). Categorical features need encoding: one-hot for nominal categories (color: red, blue, green → three binary columns), label encoding for ordinal data (size: small=1, medium=2, large=3), or target encoding (replacing categories with their mean outcome). Text requires tokenization, vectorization (TF-IDF, word embeddings), and cleaning (removing stopwords, stemming). Good features can make a simple model outperform a complex model with poor features. For example, predicting flight delays: raw features might be departure_time and airline. Engineered features could include: is_holiday, is_rush_hour, airport_congestion_score, historical_delay_rate_by_route, weather_severity—each adding predictive signal beyond the originals.'
				},
				{
					title: 'Data Quality Impact on Model Performance',
					type: 'metrics',
					content: 'How data quality affects outcomes:',
					data: [
						{ factor: 'Dataset Size', poor: '1,000 samples', good: '100,000 samples', performance_gain: '+25-40%' },
						{ factor: 'Feature Quality', poor: 'Raw features only', good: 'Engineered features', performance_gain: '+15-35%' },
						{ factor: 'Missing Data Handling', poor: 'Ignored or deleted', good: 'Proper imputation', performance_gain: '+10-20%' },
						{ factor: 'Class Balance', poor: '99:1 imbalance', good: 'Balanced or weighted', performance_gain: '+30-50%' },
						{ factor: 'Data Cleanliness', poor: '20% errors/noise', good: '<2% errors', performance_gain: '+20-30%' }
					]
				}
			],
			keyTakeaways: [
				'Data preparation typically takes 60-80% of ML project time but determines success',
				'Handle missing values through deletion, imputation, or prediction based on context',
				'Feature engineering creates meaningful representations from raw data',
				'Avoid data leakage by splitting data before preprocessing and using only available info',
				'Quality data with good features beats complex models with poor data every time'
			]
		}
	},
	{
		id: 5,
		title: 'Model Building',
		shortDescription: 'Choose an algorithm and set up a model.',
		icon: Wrench,
		content: {
			intro: 'Selecting and configuring the right model is both science and art. Different algorithms have different strengths, assumptions, and suitable use cases. Understanding these helps you choose the best tool for your specific problem.',
			sections: [
				{
					title: 'The Model Selection Framework',
					type: 'diagram',
					content: 'A decision tree for choosing algorithms:',
					data: {
						question: 'What type of problem?',
						branches: [
							{
								answer: 'Supervised (have labels)',
								next: {
									question: 'Predicting category or number?',
									branches: [
										{
											answer: 'Category (Classification)',
											algorithms: [
												'Logistic Regression: Simple, interpretable baseline',
												'Decision Trees: Visual rules, handles non-linear',
												'Random Forest: Robust, less overfitting',
												'Gradient Boosting (XGBoost): Often best performance',
												'Neural Networks: Complex patterns, needs lots of data'
											]
										},
										{
											answer: 'Number (Regression)',
											algorithms: [
												'Linear Regression: Simple relationships, interpretable',
												'Ridge/Lasso: Linear + regularization',
												'Decision Trees: Non-linear, captures interactions',
												'Random Forest: Robust to outliers',
												'Neural Networks: Complex non-linear patterns'
											]
										}
									]
								}
							},
							{
								answer: 'Unsupervised (no labels)',
								next: {
									question: 'What\'s the goal?',
									branches: [
										{
											answer: 'Find groups',
											algorithms: [
												'K-Means: Fast, simple, spherical clusters',
												'DBSCAN: Arbitrary shapes, handles noise',
												'Hierarchical: Nested clusters, dendrograms',
												'GMM: Soft clustering, probabilistic'
											]
										},
										{
											answer: 'Reduce dimensions',
											algorithms: [
												'PCA: Linear, preserves variance',
												't-SNE: Non-linear, great for visualization',
												'UMAP: Faster than t-SNE, preserves structure',
												'Autoencoders: Neural network approach'
											]
										}
									]
								}
							},
							{
								answer: 'Reinforcement (sequential decisions)',
								algorithms: [
									'Q-Learning: Simple, discrete states/actions',
									'Deep Q-Networks: Handles high-dimensional inputs',
									'Policy Gradients: Direct policy optimization',
									'Actor-Critic: Combines value and policy learning',
									'PPO: Stable, widely used for robotics/games'
								]
							}
						]
					}
				},
				{
					title: 'Popular Algorithms Deep Dive',
					type: 'examples',
					content: 'Understanding core algorithms and when to use them:',
					data: [
						{
							name: 'Linear/Logistic Regression',
							type: 'Regression/Classification',
							howItWorks: 'Fits a straight line (or hyperplane) through data points, minimizing prediction errors',
							strengths: ['Fast training and prediction', 'Highly interpretable coefficients', 'Works well with small datasets', 'Probabilistic outputs'],
							weaknesses: ['Assumes linear relationships', 'Sensitive to outliers', 'Cannot capture complex patterns', 'Needs feature engineering'],
							bestFor: 'Baseline models, interpretable predictions, linear relationships',
							example: 'Predicting house prices from size and location (linear trends)'
						},
						{
							name: 'Decision Trees',
							type: 'Classification/Regression',
							howItWorks: 'Creates branching rules by splitting data on features that best separate outcomes',
							strengths: ['Easy to visualize and explain', 'Handles non-linear relationships', 'No scaling needed', 'Captures feature interactions'],
							weaknesses: ['Prone to overfitting', 'Unstable (small changes → different trees)', 'Biased to dominant classes', 'Not great for extrapolation'],
							bestFor: 'Interpretable models, mixed data types, non-linear patterns',
							example: 'Loan approval (creates readable if-then rules)'
						},
						{
							name: 'Random Forest',
							type: 'Classification/Regression',
							howItWorks: 'Builds many decision trees on random subsets of data/features, then averages predictions',
							strengths: ['Reduces overfitting vs single trees', 'Handles missing values', 'Feature importance scores', 'Robust and accurate'],
							weaknesses: ['Less interpretable than single tree', 'Slower than single tree', 'Large memory footprint', 'Can overfit noisy data'],
							bestFor: 'General-purpose workhorse, when accuracy > interpretability',
							example: 'Customer churn prediction with many mixed features'
						},
						{
							name: 'Gradient Boosting (XGBoost/LightGBM)',
							type: 'Classification/Regression',
							howItWorks: 'Sequentially builds trees where each corrects errors of previous ones, optimizing loss function',
							strengths: ['Often best performance', 'Handles mixed types well', 'Built-in regularization', 'Feature engineering power'],
							weaknesses: ['Easy to overfit without tuning', 'Requires careful hyperparameter tuning', 'Longer training time', 'Less interpretable'],
							bestFor: 'Winning competitions, maximum accuracy, structured data',
							example: 'Kaggle competition winner for structured data problems'
						},
						{
							name: 'Neural Networks',
							type: 'Classification/Regression/Many others',
							howItWorks: 'Layers of interconnected nodes learn complex patterns through backpropagation',
							strengths: ['Handles very complex patterns', 'Scales to massive datasets', 'Transfer learning possible', 'State-of-art for images/text/audio'],
							weaknesses: ['Needs large datasets', 'Computationally expensive', 'Black box (hard to interpret)', 'Many hyperparameters to tune'],
							bestFor: 'Image/text/audio, massive datasets, cutting-edge performance',
							example: 'Image classification with millions of photos'
						}
					]
				},
				{
					title: 'Hyperparameter Tuning',
					type: 'text',
					content: 'Every algorithm has hyperparameters—settings you configure before training that control how the model learns. Unlike parameters learned from data (like coefficients), hyperparameters are set by you. Examples include: learning rate (how fast to update), regularization strength (penalty for complexity), number of trees (in forests), tree depth (complexity), batch size (samples per update). Finding optimal hyperparameters dramatically impacts performance. Methods include: Grid Search (try all combinations of values—exhaustive but slow), Random Search (randomly sample combinations—more efficient, often finds good values faster), Bayesian Optimization (intelligently select next values to try based on previous results—most efficient), and Automated ML (AutoML tools like H2O, Auto-sklearn automatically search). Start with default values to establish a baseline, then tune the most impactful parameters first, use cross-validation to evaluate each configuration, and balance performance vs training time based on your constraints.'
				},
				{
					title: 'Algorithm Selection Guidelines',
					type: 'comparison',
					content: 'Quick reference for choosing models:',
					data: {
						headers: ['Scenario', 'Recommended Approach', 'Why'],
						rows: [
							['Small dataset (<1K samples)', 'Logistic/Linear Regression, Decision Trees', 'Simple models avoid overfitting with limited data'],
							['Large dataset (>100K samples)', 'Gradient Boosting, Neural Networks', 'Complex models need data to learn intricate patterns'],
							['Interpretability critical', 'Linear Regression, Decision Tree, Logistic Regression', 'Transparent models show exactly how predictions are made'],
							['Maximum accuracy needed', 'Gradient Boosting, Neural Networks, Ensemble', 'Complex models capture subtle patterns'],
							['Fast prediction required', 'Linear models, Small trees', 'Simple models have lowest inference latency'],
							['Mixed feature types', 'Tree-based (RF, XGBoost)', 'Naturally handle numeric and categorical together'],
							['High-dimensional sparse data', 'Linear models with regularization', 'Work well with many features, few samples'],
							['Images/Audio/Video', 'Convolutional Neural Networks', 'Specialized for spatial and temporal patterns'],
							['Text/Language', 'Transformers, RNNs, LSTM', 'Capture sequential dependencies in language'],
							['Time series', 'ARIMA, LSTMs, Prophet', 'Model temporal dependencies and seasonality']
						]
					}
				}
			],
			keyTakeaways: [
				'Start simple (linear/logistic regression) to establish baseline performance',
				'Tree-based models (Random Forest, XGBoost) work well for most structured data',
				'Neural networks excel with large datasets and unstructured data (images, text)',
				'Hyperparameter tuning can improve performance by 10-30% over defaults',
				'Consider interpretability, speed, and accuracy requirements when choosing algorithms'
			]
		}
	},
	{
		id: 6,
		title: 'Training & Prediction',
		shortDescription: 'Teach the model, then let it predict new answers.',
		icon: Brain,
		content: {
			intro: 'Training is where the magic happens—the model learns patterns from data by adjusting internal parameters to minimize errors. Prediction is applying that learned knowledge to make decisions on new, unseen data. Understanding this process helps you train effective models and diagnose problems.',
			sections: [
				{
					title: 'The Training Process',
					type: 'process',
					content: 'Step-by-step breakdown of how models learn:',
					data: [
						{
							step: '1. Initialize',
							description: 'Set model parameters to small random values or zeros',
							detail: 'Random initialization breaks symmetry, allowing different neurons to learn different patterns',
							visual: 'Weights start scattered randomly'
						},
						{
							step: '2. Forward Pass',
							description: 'Feed training data through the model to generate predictions',
							detail: 'Each layer transforms inputs using current parameters, passing results to the next layer',
							visual: 'Data flows left to right through network'
						},
						{
							step: '3. Calculate Loss',
							description: 'Measure how wrong predictions are using a loss function',
							detail: 'Common losses: Mean Squared Error (regression), Cross-Entropy (classification)',
							visual: 'Distance between predictions and true values'
						},
						{
							step: '4. Backward Pass',
							description: 'Calculate gradients showing how to adjust parameters to reduce loss',
							detail: 'Backpropagation computes derivatives using chain rule from calculus',
							visual: 'Error signals flow right to left'
						},
						{
							step: '5. Update Parameters',
							description: 'Adjust weights in direction that reduces loss, scaled by learning rate',
							detail: 'Optimization algorithms (SGD, Adam) determine exact update strategy',
							visual: 'Weights shift toward better values'
						},
						{
							step: '6. Repeat',
							description: 'Iterate through entire dataset multiple times (epochs) until convergence',
							detail: 'Training stops when validation loss stops improving (early stopping)',
							visual: 'Loss curve decreasing over iterations'
						}
					]
				},
				{
					title: 'Batch Training Strategies',
					type: 'comparison',
					content: 'Different approaches to feeding data during training:',
					data: {
						batch: {
							name: 'Batch Gradient Descent',
							description: 'Use entire dataset for each update',
							pros: ['Stable, smooth convergence', 'Guaranteed to reach minimum', 'Vectorization efficient'],
							cons: ['Slow with large datasets', 'Requires dataset in memory', 'Can get stuck in local minima'],
							usage: 'Small datasets (<10K samples)'
						},
						stochastic: {
							name: 'Stochastic Gradient Descent',
							description: 'Use one sample at a time',
							pros: ['Fast updates', 'Can escape local minima', 'Online learning possible'],
							cons: ['Noisy, erratic convergence', 'Requires more epochs', 'Harder to parallelize'],
							usage: 'Online learning, very large datasets'
						},
						minibatch: {
							name: 'Mini-Batch Gradient Descent',
							description: 'Use small batches (32-512 samples)',
							pros: ['Best of both worlds', 'GPU-friendly', 'Stable yet fast convergence'],
							cons: ['Need to choose batch size', 'May need learning rate adjustment'],
							usage: 'Default choice for most deep learning'
						}
					}
				},
				{
					title: 'Overfitting vs Underfitting',
					type: 'examples',
					content: 'The fundamental trade-off in machine learning:',
					data: [
						{
							concept: 'Underfitting',
							description: 'Model is too simple and fails to capture patterns in training data',
							signs: ['High training error', 'High test error', 'Model predictions look overly simplistic', 'Similar performance on train and test'],
							causes: ['Model too simple', 'Insufficient features', 'Over-regularization', 'Not enough training'],
							solutions: ['Use more complex model', 'Add features', 'Reduce regularization', 'Train longer'],
							example: 'Fitting a straight line to curved data—misses the pattern entirely'
						},
						{
							concept: 'Good Fit',
							description: 'Model captures true patterns and generalizes well to new data',
							signs: ['Low training error', 'Low test error (close to training)', 'Predictions look reasonable', 'Stable across datasets'],
							characteristics: ['Right model complexity', 'Good features', 'Appropriate regularization', 'Sufficient data'],
							achievement: ['Cross-validation', 'Balanced hyperparameters', 'Representative data', 'Domain knowledge'],
							example: 'Model learns underlying relationship, ignores noise'
						},
						{
							concept: 'Overfitting',
							description: 'Model memorizes training data including noise, fails on new data',
							signs: ['Very low training error', 'High test error (much worse than training)', 'Perfect on training, terrible on test', 'Sensitive to small data changes'],
							causes: ['Model too complex', 'Too many features', 'Insufficient data', 'Training too long'],
							solutions: ['Simplify model', 'Add regularization', 'Get more data', 'Early stopping', 'Dropout'],
							example: 'Memorizing textbook questions vs understanding concepts'
						}
					]
				},
				{
					title: 'Regularization Techniques',
					type: 'text',
					content: 'Regularization prevents overfitting by constraining model complexity. L1 Regularization (Lasso) adds penalty proportional to absolute value of weights—drives some weights to exactly zero, performing feature selection. L2 Regularization (Ridge) penalizes squared weights—shrinks all weights, keeping them small but non-zero. Elastic Net combines both. Dropout randomly deactivates neurons during training—forces network to learn robust features that work even when parts are missing. Early Stopping monitors validation performance and stops training when it starts degrading—prevents learning noise in later epochs. Data Augmentation artificially expands training data with transformations (rotate images, paraphrase text)—model sees more varied examples. Ensemble Methods combine multiple models—averaging reduces overfitting as errors cancel out. The right amount of regularization is crucial: too little allows overfitting, too much causes underfitting. Use validation data to tune regularization strength.'
				},
				{
					title: 'Making Predictions',
					type: 'process',
					content: 'Using trained models in production:',
					data: [
						{
							step: '1. Preprocess Input',
							description: 'Apply same transformations used during training',
							detail: 'Use saved scalers, encoders; maintain exact preprocessing pipeline',
							critical: 'Mismatch between training and prediction preprocessing causes silent failures'
						},
						{
							step: '2. Forward Pass Only',
							description: 'Feed preprocessed data through model (no backward pass)',
							detail: 'Much faster than training; can batch multiple predictions',
							optimization: 'Use GPU/TPU for large batches, CPU for single predictions'
						},
						{
							step: '3. Post-process Output',
							description: 'Convert model outputs to usable predictions',
							detail: 'Apply softmax for probabilities, threshold for decisions, inverse scaling for regression',
							considerations: 'Calibrate probabilities if needed, handle edge cases'
						},
						{
							step: '4. Add Uncertainty',
							description: 'Provide confidence intervals or probability distributions',
							detail: 'Use prediction variance, ensembles, or Bayesian approaches',
							value: 'Users can make informed decisions based on confidence'
						},
						{
							step: '5. Monitor Performance',
							description: 'Track prediction quality in production',
							detail: 'Log predictions, compare to ground truth when available, watch for drift',
							action: 'Retrain when performance degrades'
						}
					]
				},
				{
					title: 'Training Performance Optimization',
					type: 'metrics',
					content: 'Techniques to speed up training:',
					data: [
						{ technique: 'GPU Acceleration', speedup: '10-100x', when: 'Large batches, matrix operations', tools: 'CUDA, cuDNN, PyTorch, TensorFlow' },
						{ technique: 'Mixed Precision Training', speedup: '2-3x', when: 'Modern GPUs (Tensor Cores)', tools: 'Automatic Mixed Precision (AMP)' },
						{ technique: 'Distributed Training', speedup: 'Linear with devices', when: 'Very large models/datasets', tools: 'Horovod, PyTorch DDP, TensorFlow MultiWorkerMirroredStrategy' },
						{ technique: 'Learning Rate Scheduling', speedup: '20-40% faster convergence', when: 'Most deep learning', tools: 'ReduceLROnPlateau, Cosine annealing' },
						{ technique: 'Gradient Accumulation', speedup: 'Enables larger effective batch sizes', when: 'GPU memory limited', tools: 'Manual accumulation loops' },
						{ technique: 'Transfer Learning', speedup: '5-10x less training time', when: 'Similar tasks exist', tools: 'Pre-trained models, fine-tuning' }
					]
				}
			],
			keyTakeaways: [
				'Training iteratively adjusts parameters to minimize loss on training data',
				'Overfitting (memorizing) and underfitting (too simple) are the key challenges',
				'Regularization techniques (L1/L2, dropout, early stopping) prevent overfitting',
				'Use same preprocessing pipeline for training and prediction to avoid errors',
				'Monitor validation performance during training; stop when it stops improving'
			]
		}
	},
	{
		id: 7,
		title: 'Evaluation Metrics',
		shortDescription: 'Measure how good and reliable your model is.',
		icon: BarChart3,
		content: {
			intro: 'Evaluation metrics quantify model performance, helping you compare models, diagnose problems, and communicate results. Different metrics highlight different aspects of performance, and choosing the right metrics for your use case is crucial.',
			sections: [
				{
					title: 'Classification Metrics',
					type: 'examples',
					content: 'Measuring performance for categorical predictions:',
					data: [
						{
							metric: 'Accuracy',
							formula: '(Correct Predictions) / (Total Predictions)',
							range: '0-100%, higher is better',
							interpretation: 'Overall percentage of correct predictions',
							whenGood: 'Balanced datasets where all classes equally important',
							whenBad: 'Imbalanced data (99% negative, 1% positive → 99% accuracy by always predicting negative)',
							example: 'Email: 95% accuracy means 95 out of 100 emails classified correctly'
						},
						{
							metric: 'Precision',
							formula: '(True Positives) / (True Positives + False Positives)',
							range: '0-100%, higher is better',
							interpretation: 'Of all positive predictions, how many were actually positive?',
							whenGood: 'When false positives are costly (spam filter marking good email as spam)',
							whenBad: 'When missing positives is worse than false alarms',
							example: 'Spam detector: 90% precision = 90% of emails marked spam really are spam'
						},
						{
							metric: 'Recall (Sensitivity)',
							formula: '(True Positives) / (True Positives + False Negatives)',
							range: '0-100%, higher is better',
							interpretation: 'Of all actual positives, how many did we catch?',
							whenGood: 'When missing positives is costly (disease detection, fraud)',
							whenBad: 'When false alarms are expensive',
							example: 'Cancer screening: 95% recall = catches 95% of actual cancer cases'
						},
						{
							metric: 'F1 Score',
							formula: '2 × (Precision × Recall) / (Precision + Recall)',
							range: '0-100%, higher is better',
							interpretation: 'Harmonic mean balancing precision and recall',
							whenGood: 'Need balance between precision and recall, imbalanced classes',
							whenBad: 'When one metric clearly more important than the other',
							example: 'Fraud detection: F1 of 85% balances catching fraud (recall) and minimizing false alarms (precision)'
						},
						{
							metric: 'ROC-AUC',
							formula: 'Area Under Receiver Operating Characteristic Curve',
							range: '0.5-1.0, higher is better (0.5 = random guessing)',
							interpretation: 'Probability model ranks random positive higher than random negative',
							whenGood: 'Evaluating model at all thresholds, comparing models',
							whenBad: 'Severe class imbalance (use PR-AUC instead)',
							example: 'Credit scoring: AUC of 0.85 means 85% chance a random defaulter scored higher risk than random non-defaulter'
						}
					]
				},
				{
					title: 'Confusion Matrix Explained',
					type: 'diagram',
					content: 'Understanding the foundation of classification metrics:',
					data: {
						matrix: [
							['', 'Predicted Negative', 'Predicted Positive'],
							['Actual Negative', 'True Negative (TN)\n✓ Correct rejection', 'False Positive (FP)\n✗ Type I error\n"False alarm"'],
							['Actual Positive', 'False Negative (FN)\n✗ Type II error\n"Missed detection"', 'True Positive (TP)\n✓ Correct detection']
						],
						calculations: {
							accuracy: '(TP + TN) / (TP + TN + FP + FN)',
							precision: 'TP / (TP + FP)',
							recall: 'TP / (TP + FN)',
							specificity: 'TN / (TN + FP)',
							f1: '2TP / (2TP + FP + FN)'
						},
						example: {
							scenario: 'Email spam filter analyzed 1000 emails',
							tn: '850 (correctly identified as not spam)',
							fp: '50 (incorrectly marked as spam)',
							fn: '30 (spam that got through)',
							tp: '70 (correctly caught spam)',
							accuracy: '92% = (850+70)/1000',
							precision: '58% = 70/(70+50) — of emails marked spam, 58% really were',
							recall: '70% = 70/(70+30) — caught 70% of actual spam'
						}
					}
				},
				{
					title: 'Regression Metrics',
					type: 'examples',
					content: 'Measuring performance for numerical predictions:',
					data: [
						{
							metric: 'Mean Absolute Error (MAE)',
							formula: 'Average of |Predicted - Actual|',
							interpretation: 'Average prediction error in original units',
							pros: 'Easy to interpret, robust to outliers, same units as target',
							cons: 'Doesn\'t penalize large errors more than small ones',
							example: 'House prices: MAE of $15,000 means predictions off by $15K on average'
						},
						{
							metric: 'Mean Squared Error (MSE)',
							formula: 'Average of (Predicted - Actual)²',
							interpretation: 'Average squared error—penalizes large errors heavily',
							pros: 'Differentiable (good for optimization), emphasizes large errors',
							cons: 'Units are squared (harder to interpret), sensitive to outliers',
							example: 'Temperature: MSE of 4 means average squared error is 4°²'
						},
						{
							metric: 'Root Mean Squared Error (RMSE)',
							formula: '√(MSE)',
							interpretation: 'Square root of MSE—back in original units',
							pros: 'Interpretable units, penalizes large errors, standard choice',
							cons: 'Still sensitive to outliers',
							example: 'Sales forecast: RMSE of 1000 units means typical error is ~1000 units'
						},
						{
							metric: 'R² (Coefficient of Determination)',
							formula: '1 - (Sum of Squared Errors) / (Total Variance)',
							range: '-∞ to 1.0, higher is better (1.0 = perfect, 0 = predicting mean)',
							interpretation: 'Proportion of variance explained by model',
							pros: 'Scale-independent, intuitive percentage interpretation',
							cons: 'Can be negative for terrible models, doesn\'t indicate error magnitude',
							example: 'Student grades: R² of 0.75 means model explains 75% of grade variance'
						},
						{
							metric: 'Mean Absolute Percentage Error (MAPE)',
							formula: 'Average of |Predicted - Actual| / |Actual| × 100%',
							interpretation: 'Average percentage error',
							pros: 'Scale-independent, easy to explain to non-technical stakeholders',
							cons: 'Undefined when actual = 0, asymmetric (penalizes over-predictions more)',
							example: 'Demand forecast: MAPE of 8% means predictions off by 8% on average'
						}
					]
				},
				{
					title: 'Cross-Validation',
					type: 'text',
					content: 'Cross-validation provides robust performance estimates by training and evaluating on multiple data splits. K-Fold Cross-Validation divides data into K parts (typically 5 or 10). For each fold: train on K-1 parts, validate on the remaining part. Average results across all K runs. This gives a more reliable estimate than a single train-test split and uses all data for both training and validation. Stratified K-Fold maintains class proportions in each fold—crucial for imbalanced datasets. Time Series Cross-Validation respects temporal order: train on past, predict future, using expanding or rolling windows. Leave-One-Out uses each single sample as validation once—expensive but maximum data usage. Cross-validation helps detect overfitting (large gap between train and validation scores), choose hyperparameters (select values with best average validation score), and compare models fairly (same folds for all models). The cost is K times more training, but the reliability is worth it for important decisions.'
				},
				{
					title: 'Choosing the Right Metric',
					type: 'comparison',
					content: 'Matching metrics to business goals:',
					data: {
						headers: ['Use Case', 'Primary Metric', 'Why', 'Secondary Metrics'],
						rows: [
							['Fraud Detection', 'Recall', 'Catch all fraud, even with false alarms', 'Precision, F1, ROC-AUC'],
							['Spam Filter', 'Precision', 'Avoid blocking legitimate email', 'Recall, F1'],
							['Medical Diagnosis', 'Recall', 'Never miss a disease case', 'Sensitivity, Specificity'],
							['Recommendation System', 'Precision@K', 'Top recommendations must be relevant', 'Recall@K, NDCG'],
							['House Price Prediction', 'RMSE', 'Penalize large price errors', 'MAE, R², MAPE'],
							['Click-Through Rate', 'AUC', 'Rank items by likelihood', 'Log Loss, Brier Score'],
							['Churn Prediction', 'F1', 'Balance catching churners and avoiding annoyance', 'Precision, Recall, Lift'],
							['Image Classification (balanced)', 'Accuracy', 'All classes equally important', 'Per-class Precision/Recall'],
							['Anomaly Detection', 'Recall', 'Find all anomalies', 'Precision, F1, Average Precision'],
							['A/B Testing', 'Lift, Gain', 'Measure improvement over baseline', 'Confidence Intervals, p-value']
						]
					}
				},
				{
					title: 'Business Metrics vs Model Metrics',
					type: 'text',
					content: 'Model metrics (accuracy, RMSE) measure technical performance, but business metrics measure real-world impact. A click prediction model with 90% AUC might seem great, but if it increases revenue by only 1%, that\'s what matters to the business. Always connect model metrics to business outcomes: will higher recall reduce fraud losses enough to justify more investigations? Will better RMSE in demand forecasting reduce inventory costs? Define success criteria before modeling: "Increase customer retention by 15%" not "maximize F1 score." Track both during deployment: model metrics can degrade while business metrics improve (or vice versa). For example, a slightly less accurate model that runs 10x faster might generate more revenue by enabling real-time personalization. Regularly validate that optimizing model metrics improves business KPIs—if not, you\'re optimizing the wrong thing. The best model isn\'t the most accurate one; it\'s the one that best achieves business goals within operational constraints.'
				}
			],
			keyTakeaways: [
				'Accuracy misleads on imbalanced datasets; use precision, recall, and F1 instead',
				'Precision matters when false positives are costly; recall when false negatives are costly',
				'For regression, RMSE penalizes large errors more than MAE; R² shows variance explained',
				'Use cross-validation for robust performance estimates, not single train-test split',
				'Align evaluation metrics with business goals, not just technical performance'
			]
		}
	},
	{
		id: 8,
		title: 'Real-world Applications & ML in AI',
		shortDescription: 'How ML powers modern AI products and systems.',
		icon: Globe2,
		content: {
			intro: 'Machine Learning is the engine powering the AI revolution, transforming industries and daily life. From the moment you wake up to your phone\'s alarm (trained on your sleep patterns) to bedtime Netflix recommendations, ML is everywhere. Understanding real-world applications shows both the technology\'s potential and its limitations.',
			sections: [
				{
					title: 'ML Across Industries',
					type: 'examples',
					content: 'How different sectors leverage machine learning:',
					data: [
						{
							industry: 'Healthcare',
							applications: [
								'Medical image analysis (X-rays, MRIs, CT scans) detecting cancer, fractures, abnormalities',
								'Drug discovery predicting molecular interactions 100x faster than traditional methods',
								'Patient outcome prediction identifying high-risk patients for early intervention',
								'Personalized treatment recommendations based on genetic and clinical data',
								'Epidemic forecasting tracking disease spread patterns'
							],
							impact: 'Radiologists aided by ML are 31% more accurate; drug development time reduced from 10 years to 3-4 years',
							example: 'Google\'s DeepMind AI detected 50+ eye diseases from retinal scans with 94% accuracy, matching expert ophthalmologists'
						},
						{
							industry: 'Finance',
							applications: [
								'Fraud detection analyzing transaction patterns in real-time to flag suspicious activity',
								'Credit scoring assessing loan risk with alternative data beyond credit history',
								'Algorithmic trading executing trades in milliseconds based on market signals',
								'Risk assessment modeling portfolio risk and stress testing scenarios',
								'Customer churn prediction identifying customers likely to leave'
							],
							impact: 'ML fraud detection reduces losses by 40-60%; 70% of stock market trades are algorithmic',
							example: 'JPMorgan\'s COIN processes 12,000 annual commercial loan agreements in seconds vs 360,000 human hours'
						},
						{
							industry: 'E-commerce & Retail',
							applications: [
								'Product recommendations personalizing suggestions for each user ("customers who bought X also bought Y")',
								'Dynamic pricing adjusting prices in real-time based on demand, competition, inventory',
								'Inventory optimization predicting demand to minimize overstock and stockouts',
								'Customer segmentation grouping customers by behavior for targeted marketing',
								'Visual search finding products from photos instead of keywords'
							],
							impact: '35% of Amazon revenue comes from recommendations; dynamic pricing increases revenue 5-10%',
							example: 'Netflix saves $1B annually in customer retention through its recommendation engine'
						},
						{
							industry: 'Transportation',
							applications: [
								'Self-driving cars perceiving environment, planning routes, making driving decisions',
								'Route optimization finding fastest paths considering real-time traffic, weather',
								'Demand prediction for ride-sharing services balancing drivers and riders',
								'Predictive maintenance detecting vehicle problems before failure',
								'Traffic management optimizing signal timing to reduce congestion'
							],
							impact: 'Waymo autonomous vehicles drove 20M+ miles; route optimization saves logistics companies 10-20% fuel costs',
							example: 'Uber\'s ML predicts demand surges 15 minutes ahead, positioning drivers to reduce wait times by 30%'
						},
						{
							industry: 'Manufacturing',
							applications: [
								'Quality control inspecting products for defects with computer vision',
								'Predictive maintenance forecasting equipment failures to schedule repairs',
								'Supply chain optimization coordinating inventory, production, distribution',
								'Process optimization finding ideal parameters for maximum efficiency',
								'Demand forecasting predicting product demand for production planning'
							],
							impact: 'Predictive maintenance reduces downtime 30-50%; quality control improves defect detection to 99%+',
							example: 'Siemens gas turbines use ML to predict failures 24 hours ahead, preventing $millions in unplanned downtime'
						},
						{
							industry: 'Entertainment & Media',
							applications: [
								'Content recommendations personalizing shows, movies, music, articles',
								'Content creation generating music, art, writing with generative models',
								'Automated video editing cutting footage, adding effects, generating highlights',
								'Audience analytics predicting what content will succeed',
								'Real-time translation translating speech/text across languages instantly'
							],
							impact: 'Spotify\'s Discover Weekly generates 2.3B recommendations weekly; 80% of Netflix viewing comes from recommendations',
							example: 'OpenAI\'s DALL-E generates photorealistic images from text descriptions in seconds'
						}
					]
				},
				{
					title: 'Consumer Applications You Use Daily',
					type: 'examples',
					content: 'ML in everyday technology:',
					data: [
						{ app: 'Voice Assistants', ml_tech: 'Speech recognition, NLP, intent classification', examples: 'Siri, Alexa, Google Assistant understanding commands, answering questions' },
						{ app: 'Photo Apps', ml_tech: 'Face detection, object recognition, scene understanding', examples: 'Auto-tagging people, searching "beach sunset", portrait mode blur' },
						{ app: 'Email', ml_tech: 'Spam filtering, smart compose, priority inbox', examples: 'Gmail blocks 99.9% spam, suggests reply text, surfaces important emails' },
						{ app: 'Maps', ml_tech: 'Traffic prediction, route optimization, ETA estimation', examples: 'Google Maps predicts traffic 30 min ahead, suggests fastest route' },
						{ app: 'Social Media', ml_tech: 'Feed ranking, content moderation, ad targeting', examples: 'Facebook/Instagram show most engaging posts first, remove harmful content' },
						{ app: 'Streaming', ml_tech: 'Recommendation engines, thumbnail optimization, encoding', examples: 'Netflix suggests shows, tests which thumbnail gets most clicks' },
						{ app: 'Keyboard', ml_tech: 'Autocorrect, next-word prediction, swipe typing', examples: 'Smartphone keyboards learn your writing style, predict next word' },
						{ app: 'Translation', ml_tech: 'Neural machine translation, language detection', examples: 'Google Translate converts speech/text across 100+ languages instantly' },
						{ app: 'Shopping', ml_tech: 'Visual search, size recommendations, fraud detection', examples: 'Search by photo, "customers also bought", block stolen credit cards' },
						{ app: 'Finance Apps', ml_tech: 'Expense categorization, fraud alerts, investment advice', examples: 'Mint auto-categorizes transactions, banks detect unusual spending' }
					]
				},
				{
					title: 'ML as the Foundation of Modern AI',
					type: 'text',
					content: 'Machine Learning is the practical realization of Artificial Intelligence. While AI is the broad vision of intelligent machines, ML provides the concrete methods to achieve it. Classical AI used hand-crafted rules and logic (expert systems, decision trees). Modern AI uses ML to learn from data. Deep Learning, a subset of ML using neural networks, powers today\'s most impressive AI: GPT models understanding and generating human-like text, DALL-E creating images from descriptions, AlphaFold predicting protein structures. The AI stack: Data feeds ML algorithms, which learn patterns, creating models that power AI applications. For example, ChatGPT is trained using ML techniques (transformer architecture, supervised fine-tuning, reinforcement learning from human feedback) on massive text data, resulting in an AI that can converse naturally. The terms overlap: ML is a approach to achieving AI, Deep Learning is a powerful ML technique, and AI is the end goal of creating intelligent systems. Understanding this relationship clarifies how recent AI breakthroughs emerged: better ML algorithms + more data + more compute = more capable AI.'
				},
				{
					title: 'Emerging Frontiers',
					type: 'examples',
					content: 'Cutting-edge ML applications shaping the future:',
					data: [
						{
							frontier: 'Generative AI',
							description: 'Models that create novel content: text, images, music, video, code',
							examples: 'GPT-4 writing essays, DALL-E 3 generating art, GitHub Copilot coding, Midjourney creating designs',
							impact: 'Transforming creative industries, software development, education',
							challenge: 'Quality control, copyright concerns, distinguishing real from generated'
						},
						{
							frontier: 'Autonomous Systems',
							description: 'Machines that perceive, reason, and act independently in complex environments',
							examples: 'Self-driving cars, delivery drones, warehouse robots, surgical robots',
							impact: 'Reshaping transportation, logistics, manufacturing, healthcare',
							challenge: 'Safety validation, edge cases, ethical decision-making, regulation'
						},
						{
							frontier: 'Personalized Medicine',
							description: 'Tailoring treatment to individual genetic and clinical profiles',
							examples: 'Custom cancer therapies, drug dosage optimization, disease risk prediction',
							impact: 'More effective treatments with fewer side effects, preventive care',
							challenge: 'Data privacy, rare disease data scarcity, clinical validation, cost'
						},
						{
							frontier: 'Climate & Sustainability',
							description: 'ML optimizing energy use and accelerating climate research',
							examples: 'Smart grids balancing renewable energy, climate modeling, material discovery for batteries',
							impact: 'Accelerating carbon reduction, improving weather/disaster prediction',
							challenge: 'ML model training itself consumes significant energy'
						},
						{
							frontier: 'Brain-Computer Interfaces',
							description: 'Direct communication between brain and external devices',
							examples: 'Neuralink enabling paralyzed patients to control devices by thought',
							impact: 'Restoring mobility, treating neurological conditions, augmenting cognition',
							challenge: 'Invasiveness, long-term stability, ethical implications'
						}
					]
				},
				{
					title: 'Challenges & Limitations',
					type: 'examples',
					content: 'Important limitations to understand:',
					data: [
						{
							challenge: 'Data Requirements',
							issue: 'Most ML needs thousands to millions of labeled examples',
							consequence: 'Limits applications in rare diseases, new products, niche domains',
							mitigation: 'Transfer learning, data augmentation, synthetic data, active learning'
						},
						{
							challenge: 'Bias & Fairness',
							issue: 'Models learn and amplify biases present in training data',
							consequence: 'Discriminatory hiring, lending, criminal justice, facial recognition',
							mitigation: 'Diverse training data, bias detection tools, fairness constraints, human oversight'
						},
						{
							challenge: 'Interpretability',
							issue: 'Complex models (deep learning) are "black boxes"—hard to explain decisions',
							consequence: 'Difficulty debugging, getting user trust, meeting regulations',
							mitigation: 'Simpler models when possible, SHAP/LIME explanations, attention visualization'
						},
						{
							challenge: 'Robustness',
							issue: 'Models can fail on slightly unusual inputs (adversarial examples)',
							consequence: 'Security vulnerabilities, unreliable in edge cases',
							mitigation: 'Adversarial training, robust optimization, extensive testing'
						},
						{
							challenge: 'Deployment Challenges',
							issue: 'Models trained offline may not work well in real-time, changing environments',
							consequence: 'Performance degrades over time (data drift), latency issues',
							mitigation: 'Monitoring, retraining pipelines, A/B testing, model compression'
						}
					]
				},
				{
					title: 'The Future of ML',
					type: 'text',
					content: 'Machine Learning is rapidly evolving. Key trends include: Few-shot and Zero-shot Learning—models learning from just a few examples or even generalizing to tasks they weren\'t explicitly trained for (GPT-3 can translate languages it barely saw in training). Multimodal AI—systems processing text, images, audio, video together (CLIP understands images through text descriptions). Automated ML (AutoML)—tools that automatically select models, features, and hyperparameters, democratizing ML beyond experts. Edge AI—running ML on devices (phones, IoT sensors) instead of cloud for privacy and low latency. Federated Learning—training on distributed data without centralizing it, preserving privacy. Quantum ML—using quantum computers to solve problems classical computers can\'t. As ML advances, we\'ll see: more personalized experiences, scientific breakthroughs accelerated, dangerous tasks automated, and new ethical challenges. The technology is neutral—its impact depends on how we develop and deploy it. Understanding ML empowers you to use it responsibly and shape its future.'
				}
			],
			keyTakeaways: [
				'ML powers applications across healthcare, finance, retail, transportation, and entertainment',
				'You interact with dozens of ML systems daily, often without realizing it',
				'ML is the practical foundation enabling modern AI capabilities',
				'Emerging frontiers include generative AI, autonomous systems, and personalized medicine',
				'Key challenges: data requirements, bias, interpretability, robustness, deployment complexity'
			]
		}
	}
];

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

			const parsed = JSON.parse(saved) as {
				activeStep?: number;
				completedSteps?: number[];
			};

			const normalizedCompleted = Array.from(
				new Set((parsed.completedSteps ?? []).filter((step) => step >= 1 && step <= 8)),
			).sort((a, b) => a - b);

			const safeActive =
				parsed.activeStep && parsed.activeStep >= 1 && parsed.activeStep <= 8
					? parsed.activeStep
					: 1;

			const maxUnlockedFromSaved = Math.min(8, (normalizedCompleted.length ? Math.max(...normalizedCompleted) : 0) + 1);

			setCompletedSteps(normalizedCompleted);
			setActiveStep(Math.min(safeActive, maxUnlockedFromSaved));
		} catch {
			setActiveStep(1);
			setCompletedSteps([]);
		}
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				activeStep,
				completedSteps,
			}),
		);
	}, [activeStep, completedSteps]);

	const markCompleted = (stepId: number) => {
		setCompletedSteps((previous) => {
			if (previous.includes(stepId)) return previous;
			return [...previous, stepId].sort((a, b) => a - b);
		});
	};

	const handleStepClick = (stepId: number) => {
		if (stepId > unlockedUntil) return;
		setActiveStep(stepId);
	};

	const goNext = () => {
		markCompleted(activeStep);
		if (activeStep < unlockedUntil && activeStep < 8) {
			setActiveStep((current) => current + 1);
			return;
		}
		if (activeStep === unlockedUntil && unlockedUntil < 8) {
			setActiveStep((current) => current + 1);
		}
	};

	const goPrevious = () => {
		if (activeStep > 1) setActiveStep((current) => current - 1);
	};

	const activeStepData = TUTORIAL_STEPS.find((step) => step.id === activeStep) ?? TUTORIAL_STEPS[0];
	const ActiveIcon = activeStepData.icon;

	const renderSection = (section: StepData['content']['sections'][0], index: number) => {
		switch (section.type) {
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
						{section.data?.traditional && section.data?.ml ? (
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
													<span>{s}</span>
												</li>
											))}
										</ul>
									</div>
									<div className="mb-2">
										<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-300">Weaknesses:</p>
										<ul className="space-y-0.5 text-xs text-[#dce8ff]">
											{section.data.traditional.weaknesses.map((w: string, i: number) => (
												<li key={i} className="flex items-start gap-1.5">
													<AlertCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
													<span>{w}</span>
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
													<span>{s}</span>
												</li>
											))}
										</ul>
									</div>
									<div className="mb-2">
										<p className="mb-1 text-xs font-semibold uppercase tracking-wider text-red-300">Weaknesses:</p>
										<ul className="space-y-0.5 text-xs text-[#dce8ff]">
											{section.data.ml.weaknesses.map((w: string, i: number) => (
												<li key={i} className="flex items-start gap-1.5">
													<AlertCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
													<span>{w}</span>
												</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						) : section.data?.headers ? (
							<div className="overflow-x-auto">
								<table className="w-full text-xs">
									<thead>
										<tr className="border-b border-cyan-300/30">
											{section.data.headers.map((header: string, i: number) => (
												<th key={i} className="p-2 text-left font-semibold text-cyan-200">{header}</th>
											))}
										</tr>
									</thead>
									<tbody>
										{section.data.rows.map((row: string[], i: number) => (
											<tr key={i} className="border-b border-white/5">
												{row.map((cell: string, j: number) => (
													<td key={j} className="p-2 text-[#dce8ff]">{cell}</td>
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
									<div className="mb-2 flex items-start gap-3">
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
									{item.task && <p className="mb-1 text-xs text-[#e9ddff]"><strong className="text-fuchsia-200">Task:</strong> {item.task}</p>}
									{item.purpose && <p className="mb-1 text-xs text-[#e9ddff]"><strong className="text-fuchsia-200">Purpose:</strong> {item.purpose}</p>}
									{item.howItWorks && <p className="mb-2 text-xs text-[#e9ddff]"><strong className="text-fuchsia-200">How it works:</strong> {item.howItWorks}</p>}
									{item.ml_tech && <p className="mb-1 text-xs text-[#e9ddff]"><strong className="text-fuchsia-200">ML Tech:</strong> {item.ml_tech}</p>}
									{item.applications && (
										<div className="mb-2">
											<p className="mb-1 text-xs font-semibold text-fuchsia-200">Applications:</p>
											<ul className="ml-4 list-disc space-y-0.5 text-xs text-[#e9ddff]">
												{item.applications.map((app: string, j: number) => (
													<li key={j}>{app}</li>
												))}
											</ul>
										</div>
									)}
									{item.solutions && (
										<div className="mb-2">
											<p className="mb-1 text-xs font-semibold text-emerald-200">Solutions:</p>
											<ul className="ml-4 list-disc space-y-0.5 text-xs text-[#e9ddff]">
												{item.solutions.map((sol: string, j: number) => (
													<li key={j}>{sol}</li>
												))}
											</ul>
										</div>
									)}
									{item.strengths && (
										<div className="mb-2">
											<p className="mb-1 text-xs font-semibold text-green-200">Strengths:</p>
											<ul className="ml-4 list-disc space-y-0.5 text-xs text-[#e9ddff]">
												{item.strengths.map((s: string, j: number) => (
													<li key={j}>{s}</li>
												))}
											</ul>
										</div>
									)}
									{item.weaknesses && (
										<div className="mb-2">
											<p className="mb-1 text-xs font-semibold text-red-200">Weaknesses:</p>
											<ul className="ml-4 list-disc space-y-0.5 text-xs text-[#e9ddff]">
												{item.weaknesses.map((w: string, j: number) => (
													<li key={j}>{w}</li>
												))}
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
														className={`border border-white/10 p-3 ${
															i === 0 || j === 0
																? 'bg-indigo-400/10 font-semibold text-indigo-100'
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
										<div className="mt-4 space-y-1 rounded bg-cyan-400/5 p-3">
											<p className="mb-2 text-xs font-semibold text-cyan-200">Formulas:</p>
											{Object.entries(section.data.calculations).map(([key, value]: [string, any]) => (
												<p key={key} className="text-xs text-[#dce8ff]">
													<strong className="text-cyan-200">{key}:</strong> {value}
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
											<div className="mt-2 space-y-1 border-t border-white/10 pt-2">
												<p className="text-emerald-200"><strong>Accuracy:</strong> {section.data.example.accuracy}</p>
												<p className="text-emerald-200"><strong>Precision:</strong> {section.data.example.precision}</p>
												<p className="text-emerald-200"><strong>Recall:</strong> {section.data.example.recall}</p>
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
													{branch.next.branches?.map((subBranch: any, k: number) => (
														<div key={k} className="ml-3 mb-2">
															<p className="mb-1 text-xs font-semibold text-fuchsia-200">→ {subBranch.answer}</p>
															{subBranch.algorithms && (
																<ul className="ml-3 space-y-0.5">
																	{subBranch.algorithms.map((alg: string, l: number) => (
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

			case 'text':
			default:
				return (
					<div key={index} className="mb-6">
						<h3 className="mb-3 text-lg font-bold text-white">{section.title}</h3>
						<p className="text-sm leading-relaxed text-[#dce8ff]">{section.content}</p>
					</div>
				);
		}
	};

	return (
		<main className="min-h-screen lg:h-screen lg:overflow-hidden bg-[radial-gradient(circle_at_top,#172047_0%,#080b1f_45%,#050712_100%)] text-[#edf2ff] font-chillax">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -left-24 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl" />
				<div className="absolute top-24 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
				<div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />
			</div>

			<div className="relative flex h-full w-full flex-col gap-0 pb-0 pt-0">
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

				<section className="grid flex-1 gap-0 lg:min-h-0 lg:grid-cols-[380px_minmax(0,1fr)]">
					<aside className="flex flex-col border-r border-white/10 bg-[#0d1230]/90 p-3 backdrop-blur-xl lg:h-full lg:overflow-hidden">
						<div className="mb-3 rounded-xl border border-cyan-300/25 bg-[#131a3d]/80 p-3">
							<div className="mb-2 flex items-center justify-between text-sm">
								<span className="text-cyan-200">Progress</span>
								<span className="font-semibold text-white">{completedSteps.length}/8 completed</span>
							</div>

							<div className="h-2 overflow-hidden rounded-full bg-white/10">
								<div
									className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-fuchsia-400 transition-all duration-700 ease-out"
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
											isActive
												? 'scale-[1.01] shadow-[0_0_24px_rgba(129,140,248,0.45)]'
												: 'hover:scale-[1.01] hover:shadow-[0_0_16px_rgba(56,189,248,0.2)]'
										} ${isLocked ? 'cursor-not-allowed opacity-65 blur-[0.4px]' : ''}`}
										style={{
											background: isActive
												? 'linear-gradient(130deg, rgba(34,211,238,0.95), rgba(99,102,241,0.95), rgba(236,72,153,0.9))'
												: 'linear-gradient(130deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
										}}
									>
										<div
											className={`relative rounded-[11px] px-3 py-2 ${
												isActive
													? 'bg-gradient-to-br from-[#19305a] to-[#24153b]'
													: 'bg-gradient-to-br from-[#121935] to-[#0d142e]'
											}`}
										>
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
											<p
												className="mt-1 text-[11px] leading-tight text-[#b9c8ef]"
												style={{
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
												}}
											>
												{step.shortDescription}
											</p>

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

							{activeStepData.content.sections.map((section, index) => renderSection(section, index))}

							<div className="mt-6 rounded-xl border border-emerald-300/20 bg-emerald-400/5 p-4">
								<h3 className="mb-3 flex items-center gap-2 text-base font-bold text-emerald-100">
									<Target size={18} />
									Key Takeaways
								</h3>
								<ul className="space-y-2">
									{activeStepData.content.keyTakeaways.map((takeaway, index) => (
										<li key={index} className="flex items-start gap-2 text-sm text-[#dce8ff]">
											<CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" />
											<span>{takeaway}</span>
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