"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Lenis from "lenis";
import type { LucideIcon } from "lucide-react";
import Logo from "../components/Logo";
import {
	ArrowRight,
	Brain,
	CheckCircle2,
	Database,
	FlaskConical,
	History,
	LayoutDashboard,
	LineChart as LineChartIcon,
	Microscope,
	Sparkles,
	Target,
	Workflow,
	TrendingUp,
	Zap,
	GitBranch,
	Activity,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	Radar,
	RadarChart,
	PolarGrid,
	PolarAngleAxis,
	PolarRadiusAxis,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	Area,
	AreaChart,
	Scatter,
	ScatterChart,
	ZAxis,
	ComposedChart,
} from "recharts";

type SectionId =
	| "history"
	| "why-ml"
	| "types"
	| "data-preprocessing"
	| "model-building"
	| "training-prediction"
	| "evaluation-metrics"
	| "real-world";

type SectionMeta = {
	id: SectionId;
	title: string;
	icon: LucideIcon;
};

type TeachingStyle =
	| "timeline-story"
	| "problem-solution"
	| "comparison-table"
	| "pipeline-flow"
	| "mini-examples"
	| "student-analogy"
	| "exam-analogy"
	| "case-study";

const sections: SectionMeta[] = [
	{ id: "history", title: "History of Machine Learning", icon: History },
	{ id: "why-ml", title: "Why Machine Learning", icon: Target },
	{ id: "types", title: "Types of ML", icon: Brain },
	{
		id: "data-preprocessing",
		title: "Data Collection & Preprocessing",
		icon: Database,
	},
	{ id: "model-building", title: "Model Building", icon: FlaskConical },
	{
		id: "training-prediction",
		title: "Training & Prediction",
		icon: Workflow,
	},
	{
		id: "evaluation-metrics",
		title: "Evaluation Metrics",
		icon: LineChartIcon,
	},
	{
		id: "real-world",
		title: "Real-world Applications & ML in AI",
		icon: Sparkles,
	},
];

// Enhanced history data with more depth
const historyTimeline = [
	{
		year: "1950s",
		title: "Birth of AI",
		detail: "Alan Turing proposed the Turing Test. First neural networks explored pattern recognition in simple games.",
		milestone: "Perceptron Algorithm",
	},
	{
		year: "1980s",
		title: "Backpropagation Era",
		detail: "Backpropagation made training multi-layer networks possible. Expert systems gained business adoption.",
		milestone: "Neural Network Revival",
	},
	{
		year: "1990s",
		title: "Statistical Revolution",
		detail: "Support Vector Machines, Random Forests, and ensemble methods transformed practical ML applications.",
		milestone: "SVM & Ensemble Methods",
	},
	{
		year: "2010s",
		title: "Deep Learning Breakthrough",
		detail: "ImageNet competition showed CNNs could beat humans. GPUs enabled training of very deep networks.",
		milestone: "AlexNet & GPU Computing",
	},
	{
		year: "2020s",
		title: "Transformer Age",
		detail: "Large language models like GPT and BERT reshaped NLP. Foundation models emerged as general-purpose AI.",
		milestone: "GPT, BERT, Diffusion Models",
	},
];

const historyGrowthData = [
	{ decade: "1970", researchImpact: 12, computePower: 5, dataAvailable: 8 },
	{ decade: "1980", researchImpact: 20, computePower: 15, dataAvailable: 12 },
	{ decade: "1990", researchImpact: 36, computePower: 28, dataAvailable: 25 },
	{ decade: "2000", researchImpact: 48, computePower: 45, dataAvailable: 42 },
	{ decade: "2010", researchImpact: 72, computePower: 78, dataAvailable: 75 },
	{ decade: "2020", researchImpact: 95, computePower: 98, dataAvailable: 96 },
];

// Enhanced ML types with complexity scores
const mlTypesData = [
	{ name: "Supervised", value: 45, color: "#0ea5e9", complexity: 65 },
	{ name: "Unsupervised", value: 25, color: "#22c55e", complexity: 70 },
	{ name: "Semi-supervised", value: 12, color: "#f59e0b", complexity: 75 },
	{ name: "Reinforcement", value: 18, color: "#ef4444", complexity: 90 },
];

const algorithmComplexityData = [
	{ algorithm: "Linear Reg", trainTime: 20, accuracy: 65, interpretability: 95 },
	{ algorithm: "Logistic Reg", trainTime: 25, accuracy: 72, interpretability: 90 },
	{ algorithm: "Decision Tree", trainTime: 35, accuracy: 75, interpretability: 85 },
	{ algorithm: "Random Forest", trainTime: 60, accuracy: 84, interpretability: 60 },
	{ algorithm: "SVM", trainTime: 70, accuracy: 82, interpretability: 50 },
	{ algorithm: "XGBoost", trainTime: 75, accuracy: 88, interpretability: 55 },
	{ algorithm: "Neural Net", trainTime: 85, accuracy: 90, interpretability: 25 },
	{ algorithm: "Deep Learning", trainTime: 95, accuracy: 94, interpretability: 15 },
];

// Data preprocessing impact visualization
const dataQualityImpact = [
	{ stage: "Raw Data", modelScore: 45, dataQuality: 30 },
	{ stage: "Cleaned", modelScore: 62, dataQuality: 60 },
	{ stage: "Normalized", modelScore: 74, dataQuality: 75 },
	{ stage: "Engineered", modelScore: 85, dataQuality: 88 },
	{ stage: "Optimized", modelScore: 91, dataQuality: 95 },
];

const missingDataStrategies = [
	{ method: "Drop Rows", dataLoss: 85, biasRisk: 75, speed: 95 },
	{ method: "Mean Impute", dataLoss: 10, biasRisk: 45, speed: 90 },
	{ method: "KNN Impute", dataLoss: 5, biasRisk: 25, speed: 40 },
	{ method: "Model Predict", dataLoss: 0, biasRisk: 15, speed: 20 },
];

// Model building comparison - expanded
const modelComparisonData = [
	{
		model: "Linear Regression",
		simplicity: 95,
		interpretability: 90,
		nonlinearPower: 35,
		scalability: 90,
		trainingSpeed: 95,
	},
	{
		model: "Decision Tree",
		simplicity: 80,
		interpretability: 85,
		nonlinearPower: 70,
		scalability: 60,
		trainingSpeed: 75,
	},
	{
		model: "Random Forest",
		simplicity: 60,
		interpretability: 55,
		nonlinearPower: 85,
		scalability: 70,
		trainingSpeed: 50,
	},
	{
		model: "Neural Network",
		simplicity: 35,
		interpretability: 30,
		nonlinearPower: 95,
		scalability: 85,
		trainingSpeed: 30,
	},
	{
		model: "XGBoost",
		simplicity: 50,
		interpretability: 50,
		nonlinearPower: 90,
		scalability: 75,
		trainingSpeed: 55,
	},
];

// Training dynamics - bias-variance tradeoff
const biasVarianceData = [
	{ complexity: 1, bias: 85, variance: 10, totalError: 95 },
	{ complexity: 2, bias: 70, variance: 15, totalError: 85 },
	{ complexity: 3, bias: 55, variance: 22, totalError: 77 },
	{ complexity: 4, bias: 40, variance: 30, totalError: 70 },
	{ complexity: 5, bias: 28, variance: 42, totalError: 70 },
	{ complexity: 6, bias: 18, variance: 58, totalError: 76 },
	{ complexity: 7, bias: 12, variance: 75, totalError: 87 },
	{ complexity: 8, bias: 8, variance: 92, totalError: 100 },
];

const learningCurveData = [
	{ samples: 100, trainScore: 55, validScore: 52, testScore: 50 },
	{ samples: 500, trainScore: 68, validScore: 64, testScore: 62 },
	{ samples: 1000, trainScore: 76, validScore: 72, testScore: 70 },
	{ samples: 2000, trainScore: 82, validScore: 78, testScore: 76 },
	{ samples: 5000, trainScore: 87, validScore: 83, testScore: 81 },
	{ samples: 10000, trainScore: 90, validScore: 86, testScore: 85 },
	{ samples: 20000, trainScore: 91, validScore: 87, testScore: 86 },
];

// Evaluation metrics - confusion matrix visualization
const confusionMatrixData = [
	{ predicted: "Positive", actual: "Positive", value: 450, label: "TP: 450" },
	{ predicted: "Positive", actual: "Negative", value: 50, label: "FP: 50" },
	{ predicted: "Negative", actual: "Positive", value: 70, label: "FN: 70" },
	{ predicted: "Negative", actual: "Negative", value: 430, label: "TN: 430" },
];

const metricsComparison = [
	{ metric: "Accuracy", score: 88, useCase: "Balanced datasets" },
	{ metric: "Precision", score: 90, useCase: "Minimize false positives" },
	{ metric: "Recall", score: 86, useCase: "Catch all positives" },
	{ metric: "F1 Score", score: 88, useCase: "Balance precision-recall" },
	{ metric: "AUC-ROC", score: 92, useCase: "Ranking quality" },
	{ metric: "Log Loss", score: 0.28, useCase: "Probability calibration" },
];

// Real-world applications with detailed metrics
const industryAdoption = [
	{ industry: "Tech", adoption: 95, investment: 92, impact: 94 },
	{ industry: "Finance", adoption: 88, investment: 85, impact: 87 },
	{ industry: "Healthcare", adoption: 82, investment: 88, impact: 90 },
	{ industry: "Retail", adoption: 85, investment: 75, impact: 80 },
	{ industry: "Manufacturing", adoption: 78, investment: 80, impact: 82 },
	{ industry: "Transportation", adoption: 80, investment: 90, impact: 85 },
];

const mlCapabilityEvolution = [
	{ year: 2015, vision: 70, nlp: 60, speech: 65, reasoning: 40 },
	{ year: 2017, vision: 82, nlp: 72, speech: 78, reasoning: 50 },
	{ year: 2019, vision: 88, nlp: 82, speech: 85, reasoning: 60 },
	{ year: 2021, vision: 92, nlp: 90, speech: 90, reasoning: 72 },
	{ year: 2023, vision: 95, nlp: 96, speech: 94, reasoning: 85 },
	{ year: 2025, vision: 97, nlp: 98, speech: 96, reasoning: 92 },
];

function SectionContainer({
	id,
	index,
	title,
	icon: Icon,
	teachingStyle,
	simpleExplanation,
	deepExplanation,
	realLifeExample,
	keyPoints,
	visualBlock,
	technicalNote,
}: {
	id: SectionId;
	index: number;
	title: string;
	icon: LucideIcon;
	teachingStyle: TeachingStyle;
	simpleExplanation: string;
	deepExplanation: string[];
	realLifeExample: string;
	keyPoints: string[];
	visualBlock: JSX.Element;
	technicalNote?: string;
}) {
	const styleCopy: Record<
		TeachingStyle,
		{ quickTitle: string; exampleTitle: string; detailTitle: string; keyTitle: string }
	> = {
		"timeline-story": {
			quickTitle: "Story Snapshot",
			exampleTitle: "Turning Point",
			detailTitle: "Narrative Walkthrough",
			keyTitle: "Era Highlights",
		},
		"problem-solution": {
			quickTitle: "Core Challenge",
			exampleTitle: "Practical Fix",
			detailTitle: "How the Fix Works",
			keyTitle: "Decision Rules",
		},
		"comparison-table": {
			quickTitle: "Quick Orientation",
			exampleTitle: "Where It Fits",
			detailTitle: "Type-by-Type Breakdown",
			keyTitle: "Selection Hints",
		},
		"pipeline-flow": {
			quickTitle: "Pipeline Overview",
			exampleTitle: "Data Journey Example",
			detailTitle: "Step Details",
			keyTitle: "Pipeline Checklist",
		},
		"mini-examples": {
			quickTitle: "Model Intuition",
			exampleTitle: "Mini Scenario",
			detailTitle: "Deep Dive with Examples",
			keyTitle: "Model Selection Notes",
		},
		"student-analogy": {
			quickTitle: "Classroom View",
			exampleTitle: "Student Analogy",
			detailTitle: "What Happens During Training",
			keyTitle: "Practice Lessons",
		},
		"exam-analogy": {
			quickTitle: "Scorecard View",
			exampleTitle: "Exam Analogy",
			detailTitle: "Metric-by-Metric Reasoning",
			keyTitle: "Evaluation Rules",
		},
		"case-study": {
			quickTitle: "Case Brief",
			exampleTitle: "Industry Story",
			detailTitle: "Case-study Breakdown",
			keyTitle: "Production Lessons",
		},
	};

	const copy = styleCopy[teachingStyle];

	const renderTeachingPanel = () => {
		switch (teachingStyle) {
			case "timeline-story":
				return (
					<div className="mt-7 rounded-2xl border border-sky-500/30 bg-slate-900/70 p-5">
						<p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">
							Story Mode
						</p>
						<p className="mt-3 text-sm leading-7 text-slate-200">{simpleExplanation}</p>
						<div className="mt-5 space-y-3">
							{deepExplanation.map((step, stepIndex) => (
								<div
									key={`${id}-story-${stepIndex}`}
									className="rounded-xl border border-slate-700/80 bg-slate-950/70 p-4"
								>
									<p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-300">
										Chapter {stepIndex + 1}
									</p>
									<p className="mt-2 text-sm leading-6 text-slate-200">{step}</p>
								</div>
							))}
						</div>
					</div>
				);
			case "problem-solution":
				return (
					<div className="mt-7 grid gap-4 lg:grid-cols-2">
						<div className="rounded-2xl border border-rose-500/35 bg-rose-950/20 p-5">
							<h3 className="text-lg font-semibold text-rose-200">Common Problems</h3>
							<div className="mt-3 space-y-2">
								{deepExplanation.slice(0, 4).map((point, idx) => (
									<p
										key={`${id}-problem-${idx}`}
										className="rounded-lg border border-rose-500/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
									>
										{point}
									</p>
								))}
							</div>
						</div>
						<div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/20 p-5">
							<h3 className="text-lg font-semibold text-emerald-200">ML Solutions</h3>
							<div className="mt-3 space-y-2">
								{deepExplanation.slice(4).map((point, idx) => (
									<p
										key={`${id}-solution-${idx}`}
										className="rounded-lg border border-emerald-500/20 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
									>
										{point}
									</p>
								))}
							</div>
						</div>
					</div>
				);
			case "comparison-table":
				return (
					<div className="mt-7 overflow-x-auto rounded-2xl border border-slate-700 bg-slate-950/70">
						<table className="w-full min-w-[640px] border-collapse text-left text-sm">
							<thead>
								<tr className="bg-slate-900 text-slate-100">
									<th className="border-b border-slate-700 px-4 py-3 font-semibold">What You Need</th>
									<th className="border-b border-slate-700 px-4 py-3 font-semibold">Simple Guidance</th>
								</tr>
							</thead>
							<tbody>
								{keyPoints.map((point, idx) => (
									<tr key={`${id}-table-${idx}`} className="odd:bg-slate-950/60 even:bg-slate-900/50">
										<td className="border-b border-slate-800 px-4 py-3 font-medium text-sky-200">
											Type Insight {idx + 1}
										</td>
										<td className="border-b border-slate-800 px-4 py-3 text-slate-200">{point}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				);
			case "pipeline-flow":
				return (
					<div className="mt-7 rounded-2xl border border-fuchsia-500/30 bg-slate-900/70 p-5">
						<p className="text-sm text-slate-200">{simpleExplanation}</p>
						<div className="mt-5 flex flex-wrap items-center gap-2">
							{deepExplanation.map((step, stepIndex, arr) => (
								<div key={`${id}-pipe-${stepIndex}`} className="flex items-center gap-2">
									<div className="rounded-lg border border-fuchsia-400/35 bg-slate-950/70 px-3 py-2">
										<p className="text-[11px] font-semibold text-fuchsia-300">Step {stepIndex + 1}</p>
										<p className="mt-1 text-xs leading-5 text-slate-200">{step}</p>
									</div>
									{stepIndex < arr.length - 1 ? (
										<ArrowRight className="h-4 w-4 text-fuchsia-300" />
									) : null}
								</div>
							))}
						</div>
					</div>
				);
			case "mini-examples":
				return (
					<div className="mt-7 grid gap-4 md:grid-cols-2">
						{deepExplanation.map((step, idx) => (
							<div
								key={`${id}-mini-${idx}`}
								className="rounded-2xl border border-indigo-500/35 bg-slate-950/70 p-4"
							>
								<p className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-300">
									Mini Example {idx + 1}
								</p>
								<p className="mt-2 text-sm leading-6 text-slate-200">{step}</p>
							</div>
						))}
					</div>
				);
			case "student-analogy":
				return (
					<div className="mt-7 rounded-2xl border border-amber-400/35 bg-amber-950/20 p-5">
						<h3 className="text-lg font-semibold text-amber-200">Think Like a Teacher</h3>
						<p className="mt-3 text-sm leading-7 text-slate-200">{realLifeExample}</p>
						<div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
							<p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-300">Lesson Summary</p>
							<p className="mt-2 text-sm leading-6 text-slate-200">{simpleExplanation}</p>
						</div>
					</div>
				);
			case "exam-analogy":
				return (
					<div className="mt-7 rounded-2xl border border-cyan-500/35 bg-slate-900/70 p-5">
						<h3 className="text-lg font-semibold text-cyan-200">Exam Marks Analogy</h3>
						<p className="mt-3 text-sm leading-7 text-slate-200">{realLifeExample}</p>
						<div className="mt-4 grid gap-3 md:grid-cols-2">
							{keyPoints.slice(0, 4).map((point, idx) => (
								<div
									key={`${id}-exam-${idx}`}
									className="rounded-xl border border-cyan-500/30 bg-slate-950/70 p-3"
								>
									<p className="text-xs font-semibold text-cyan-300">Metric Card {idx + 1}</p>
									<p className="mt-1 text-sm text-slate-200">{point}</p>
								</div>
							))}
						</div>
					</div>
				);
			case "case-study":
				return (
					<div className="mt-7 rounded-2xl border border-emerald-500/30 bg-slate-900/70 p-5">
						<p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
							Case Study Lens
						</p>
						<p className="mt-3 text-sm leading-7 text-slate-200">{realLifeExample}</p>
						<div className="mt-4 grid gap-3 md:grid-cols-3">
							{deepExplanation.slice(0, 6).map((step, idx) => (
								<div
									key={`${id}-case-${idx}`}
									className="rounded-lg border border-emerald-500/25 bg-slate-950/70 p-3"
								>
									<p className="text-[11px] font-semibold text-emerald-300">Case Point {idx + 1}</p>
									<p className="mt-1 text-xs leading-5 text-slate-200">{step}</p>
								</div>
							))}
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<motion.section
			id={id}
			data-doc-section="true"
			className="w-full scroll-mt-24 rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-[0_24px_60px_-30px_rgba(99,102,241,0.42)] backdrop-blur lg:p-10"
			initial={{ opacity: 0, y: 28 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: false, amount: 0.2 }}
			transition={{ duration: 0.55, ease: "easeOut" }}
			whileHover={{ y: -3 }}
		>
			<div className="flex items-center gap-4">
				<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300 shadow-[0_0_24px_rgba(129,140,248,0.35)]">
					<Icon className="h-6 w-6" />
				</div>
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-300">
						Section {index}
					</p>
					<h2 className="text-3xl font-bold text-slate-100 lg:text-4xl">{title}</h2>
				</div>
			</div>

			{renderTeachingPanel()}

			<div className="mt-8 grid gap-6 lg:grid-cols-2">
				<article className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
					<h3 className="text-lg font-semibold text-slate-100">{copy.quickTitle}</h3>
					<p className="mt-3 text-[15px] leading-7 text-slate-300">{simpleExplanation}</p>
				</article>

				<article className="rounded-2xl border border-indigo-500/25 bg-indigo-950/20 p-5">
					<h3 className="text-lg font-semibold text-slate-100">{copy.exampleTitle}</h3>
					<p className="mt-3 text-[15px] leading-7 text-slate-300">{realLifeExample}</p>
				</article>
			</div>

			<article className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
				<h3 className="text-lg font-semibold text-slate-100">
					{copy.detailTitle}
				</h3>
				<div className="mt-4 space-y-3">
					{deepExplanation.map((step, stepIndex) => (
						<div
							key={`${id}-step-${stepIndex}`}
							className="flex gap-3 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3"
						>
							<span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/85 text-xs font-bold text-slate-950">
								{stepIndex + 1}
							</span>
							<p className="text-sm leading-6 text-slate-300">{step}</p>
						</div>
					))}
				</div>
			</article>

			{technicalNote && (
				<article className="mt-6 rounded-2xl border-2 border-amber-400/40 bg-amber-950/25 p-5 shadow-[0_0_24px_rgba(245,158,11,0.18)]">
					<div className="flex items-center gap-2">
						<Zap className="h-5 w-5 text-amber-300" />
						<h3 className="text-lg font-semibold text-amber-100">Technical Insight</h3>
					</div>
					<p className="mt-3 text-[15px] leading-7 text-amber-200">{technicalNote}</p>
				</article>
			)}

			<article className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
				<h3 className="text-lg font-semibold text-slate-100">{copy.keyTitle}</h3>
				<div className="mt-4 grid gap-3 md:grid-cols-2">
					{keyPoints.map((point, pointIndex) => (
						<div
							key={`${id}-point-${pointIndex}`}
							className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3"
						>
							<CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
							<p className="text-sm leading-6 text-slate-300">{point}</p>
						</div>
					))}
				</div>
			</article>

			<article className="mt-6 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/45 p-5">
				<h3 className="text-lg font-semibold text-slate-100">Visual Analytics</h3>
				<div className="mt-4 [&_.bg-white]:!bg-slate-900/85 [&_.bg-slate-50]:!bg-slate-900/70 [&_.bg-slate-100]:!bg-slate-800 [&_.text-slate-900]:!text-slate-100 [&_.text-slate-800]:!text-slate-200 [&_.text-slate-700]:!text-slate-300 [&_.text-slate-600]:!text-slate-400 [&_.border-slate-200]:!border-slate-700 [&_.border-slate-300]:!border-slate-600 [&_table_thead_tr]:!bg-slate-800 [&_table_tr]:!bg-transparent">{visualBlock}</div>
			</article>

			<div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-indigo-400/55 to-transparent" />
		</motion.section>
	);
}

export default function MLTutorialPage() {
	const [activeSection, setActiveSection] = useState<SectionId>("history");

	useEffect(() => {
		const lenis = new Lenis({
			duration: 1.05,
			smoothWheel: true,
			touchMultiplier: 1.2,
		});

		let rafId = 0;
		const raf = (time: number) => {
			lenis.raf(time);
			rafId = requestAnimationFrame(raf);
		};

		rafId = requestAnimationFrame(raf);

		return () => {
			cancelAnimationFrame(rafId);
			lenis.destroy();
		};
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id as SectionId);
					}
				});
			},
			{
				rootMargin: "-30% 0px -55% 0px",
				threshold: [0.2, 0.4, 0.6],
			}
		);

		const observed = document.querySelectorAll("[data-doc-section='true']");
		observed.forEach((element) => observer.observe(element));

		return () => {
			observed.forEach((element) => observer.unobserve(element));
			observer.disconnect();
		};
	}, []);

	const scrollToSection = (id: SectionId) => {
		const target = document.getElementById(id);
		if (target) {
			target.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const sectionMap = useMemo(() => {
		return sections.reduce<Record<SectionId, SectionMeta>>((acc, section) => {
			acc[section.id] = section;
			return acc;
		}, {} as Record<SectionId, SectionMeta>);
	}, []);

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_14%_16%,rgba(99,102,241,0.28),transparent_36%),radial-gradient(circle_at_86%_10%,rgba(168,85,247,0.2),transparent_34%),radial-gradient(circle_at_70%_80%,rgba(129,140,248,0.14),transparent_42%),linear-gradient(180deg,#050813_0%,#0a1021_46%,#10192f_100%)] text-slate-100">
			<header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-700/80 bg-slate-950/80 backdrop-blur-md">
				<div className="mx-auto flex h-16 w-full max-w-none items-center justify-between px-4 md:px-6 xl:px-10">
					<div className="flex items-center gap-2.5">
						<Logo href="/home" size="md" showText={false} />
						<Link href="/home" className="text-xl font-bold tracking-tight text-slate-100">
							Ownquesta
						</Link>
					</div>
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(129,140,248,0.42)] transition hover:bg-indigo-400"
					>
						<LayoutDashboard className="h-4 w-4" />
						Dashboard
					</Link>
				</div>
			</header>

			<div className="relative pt-16 md:grid md:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
				<aside className="hidden border-r border-slate-800/80 bg-gradient-to-b from-slate-950/80 to-slate-950/55 px-4 py-6 backdrop-blur-md md:sticky md:top-16 md:block md:self-start xl:px-5">
					<nav className="space-y-2.5">
						{sections.map((section, index) => {
							const Icon = section.icon;
							const isActive = activeSection === section.id;
							return (
								<button
									key={section.id}
									onClick={() => scrollToSection(section.id)}
									className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
										isActive
											? "border-indigo-300/80 bg-gradient-to-r from-indigo-500/22 to-violet-500/12 text-indigo-50 shadow-[0_10px_30px_-18px_rgba(129,140,248,0.7)]"
											: "border-slate-700 bg-slate-900/65 text-slate-200 hover:-translate-y-0.5 hover:border-slate-500 hover:bg-slate-900/85"
									}`}
								>
									<span
										className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
											isActive
												? "bg-gradient-to-br from-indigo-300 to-violet-300 text-slate-950"
												: "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
										}`}
									>
										<Icon className="h-4 w-4" />
									</span>
									<div>
										<p className="text-[11px] font-semibold tracking-[0.08em] text-slate-500">{`0${index + 1}`}</p>
										<p className="text-sm font-semibold leading-snug">{section.title}</p>
									</div>
								</button>
							);
						})}
					</nav>
				</aside>

				<main className="w-full min-w-0">
					<div className="w-full px-4 py-6 md:px-6 xl:px-10 xl:py-8">
						<motion.section
							className="mb-6 rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-[0_20px_55px_-35px_rgba(99,102,241,0.5)] backdrop-blur lg:p-10"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.55, ease: "easeOut" }}
						>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
								Advanced Learning Documentation
							</p>
							<h1 className="mt-3 text-4xl font-black leading-tight text-slate-100 lg:text-5xl">
								Complete Machine Learning Tutorial: From Foundations to Production
							</h1>
							<p className="mt-4 max-w-none text-base leading-8 text-slate-300 lg:text-lg">
								Master Machine Learning through comprehensive explanations, visual analytics, and real-world applications. This advanced tutorial covers theory, mathematics, implementation strategies, and production best practices—all explained in clear, accessible language.
							</p>

							<div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
								<h3 className="text-lg font-bold text-slate-100">Complete ML Pipeline</h3>
								<div className="mt-4 flex flex-wrap items-center gap-3">
									{[
										{ step: "Data Collection", icon: Database },
										{ step: "Preprocessing", icon: FlaskConical },
										{ step: "Model Selection", icon: Brain },
										{ step: "Training", icon: Activity },
										{ step: "Validation", icon: Target },
										{ step: "Prediction", icon: TrendingUp },
										{ step: "Evaluation", icon: LineChartIcon },
										{ step: "Deployment", icon: Sparkles },
									].map(({ step, icon: StepIcon }, idx, arr) => (
										<div key={step} className="flex items-center gap-3">
											<div className="group rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 transition hover:border-indigo-400 hover:bg-slate-800">
												<div className="flex items-center gap-2">
													<StepIcon className="h-4 w-4 text-indigo-300" />
													<span className="text-sm font-semibold text-slate-200">{step}</span>
												</div>
											</div>
											{idx < arr.length - 1 ? (
												<ArrowRight className="h-4 w-4 text-indigo-300" />
											) : null}
										</div>
									))}
								</div>
							</div>
						</motion.section>

						<div className="space-y-6">
							{/* Section 1: History - Timeline + Multi-line Growth Chart */}
							<SectionContainer
								id="history"
								index={1}
								title={sectionMap.history.title}
								icon={sectionMap.history.icon}
								teachingStyle="timeline-story"
								simpleExplanation="Machine Learning evolved from simple pattern recognition in the 1950s to today's powerful deep learning systems. Each decade brought breakthrough algorithms, faster computers, and larger datasets that expanded what machines could learn."
								deepExplanation={[
									"The 1950s introduced the concept of machines that could learn from examples, starting with the Perceptron algorithm for basic pattern classification.",
									"Early neural networks faced limitations due to slow computers and the mathematical challenge of training deep layers effectively.",
									"The 1980s brought backpropagation, enabling multi-layer networks to learn complex patterns by calculating gradients layer by layer.",
									"Statistical methods like Support Vector Machines and ensemble techniques emerged in the 1990s, making ML practical for business problems.",
									"The 2010s deep learning revolution happened when researchers combined neural networks with GPUs and massive datasets like ImageNet.",
									"Modern transformers and attention mechanisms now power language models, enabling machines to understand context across long sequences of text.",
									"Today's foundation models can transfer knowledge across different tasks, reducing the need to train specialized models from scratch.",
								]}
								realLifeExample="ImageNet 2012 was a turning point. AlexNet, a deep neural network trained on GPUs, achieved 85% accuracy on image recognition—far better than traditional methods. This proved that deep learning could solve real-world vision problems at scale, sparking massive investment in AI research."
								keyPoints={[
									"ML progress depended on three factors: better algorithms, more computing power, and bigger datasets.",
									"Backpropagation made deep networks trainable, but they only became practical with GPU acceleration.",
									"Each era solved specific bottlenecks: 1990s improved generalization, 2010s scaled neural networks.",
									"Transfer learning is the latest shift, letting models reuse knowledge instead of learning from zero.",
									"Understanding history helps you pick the right tool—not every problem needs deep learning.",
									"Modern ML builds on decades of research; techniques from different eras are still used together.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="grid gap-3 md:grid-cols-5">
											{historyTimeline.map((item) => (
												<div
													key={item.year}
													className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-400 hover:shadow-lg"
												>
													<p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-700">
														{item.year}
													</p>
													<p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
													<p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
													<div className="mt-3 rounded-lg bg-sky-50 px-2 py-1">
														<p className="text-[11px] font-medium text-sky-900">{item.milestone}</p>
													</div>
												</div>
											))}
										</div>
										<div className="h-80 w-full rounded-xl border border-slate-200 bg-white p-4">
											<p className="mb-3 text-sm font-semibold text-slate-900">
												Evolution of ML: Research Impact, Computing Power & Data Availability
											</p>
											<ResponsiveContainer width="100%" height="90%">
												<LineChart data={historyGrowthData}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="decade" stroke="#334155" />
													<YAxis stroke="#334155" />
													<Tooltip />
													<Legend />
													<Line
														type="monotone"
														dataKey="researchImpact"
														stroke="#0ea5e9"
														strokeWidth={3}
														dot={{ r: 5 }}
														name="Research Impact"
													/>
													<Line
														type="monotone"
														dataKey="computePower"
														stroke="#22c55e"
														strokeWidth={3}
														dot={{ r: 5 }}
														name="Compute Power"
													/>
													<Line
														type="monotone"
														dataKey="dataAvailable"
														stroke="#f59e0b"
														strokeWidth={3}
														dot={{ r: 5 }}
														name="Data Available"
													/>
												</LineChart>
											</ResponsiveContainer>
										</div>
									</div>
								}
								technicalNote="The convergence of algorithm innovation, GPU computing, and big data in the 2010s created a compounding effect. Each improvement amplified the others: better algorithms utilized more compute, more compute enabled larger datasets, and larger datasets justified better algorithms."
							/>

							{/* Section 2: Why ML - Comparison Table + Scatter Plot */}
							<SectionContainer
								id="why-ml"
								index={2}
								title={sectionMap["why-ml"].title}
								icon={sectionMap["why-ml"].icon}
								teachingStyle="problem-solution"
								simpleExplanation="Traditional programming works when rules are known and fixed. Machine Learning shines when patterns are complex, hidden in data, or change over time. ML automatically discovers these patterns instead of requiring programmers to code every rule manually."
								deepExplanation={[
									"Rule-based systems need explicit instructions for every scenario, which becomes impossible when dealing with millions of edge cases.",
									"ML models learn decision boundaries from examples, discovering patterns that humans might miss or cannot easily express in code.",
									"When business rules change frequently (like fraud patterns or customer preferences), retraining a model is faster than rewriting code.",
									"ML excels at high-dimensional problems where many variables interact in non-obvious ways, like image recognition or natural language understanding.",
									"Probabilistic reasoning in ML provides confidence scores, helping systems handle uncertainty better than binary if-else logic.",
									"Modern ML can adapt to individual users through personalization, something impossible with one-size-fits-all rule systems.",
									"As data accumulates, ML models can continuously improve without human intervention, creating self-optimizing systems.",
								]}
								realLifeExample="Google Translate switched from rule-based translation to neural machine translation in 2016. The rule-based system required linguists to manually code grammar rules for each language pair. The ML system learned patterns from millions of translated documents, improving translation quality dramatically and supporting more language pairs with less effort."
								keyPoints={[
									"Choose rules-based when logic is clear, stable, and legally required to be explainable in detail.",
									"Choose ML when patterns are complex, hidden, or when you have historical data but unclear rules.",
									"Hybrid approaches work best: use rules for critical edge cases, ML for pattern-heavy decisions.",
									"ML needs quality training data—garbage in means garbage out, no matter how sophisticated the model.",
									"Retraining enables ML systems to adapt to changing environments without code changes.",
									"ML provides probability estimates, not just binary predictions, enabling better risk management.",
									"Consider maintenance costs: rule systems need code updates, ML systems need data pipelines and monitoring.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
											<table className="w-full min-w-[700px] border-collapse text-left text-sm">
												<thead>
													<tr className="bg-slate-100 text-slate-800">
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Aspect
														</th>
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Traditional Programming
														</th>
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Machine Learning
														</th>
													</tr>
												</thead>
												<tbody>
													{[
														["Decision Logic", "Explicitly coded by developers", "Learned automatically from data patterns"],
														["Adaptability", "Low - requires code changes", "High - adapts through retraining"],
														["Best Use Cases", "Clear rules, deterministic logic, legal compliance", "Complex patterns, ambiguous rules, personalization"],
														["Maintenance", "Update code for rule changes", "Retrain model with new data"],
														["Handling Complexity", "Struggles with >100 rules", "Excels with millions of features"],
														["Uncertainty Handling", "Binary decisions (yes/no)", "Probabilistic confidence scores"],
														["Performance Over Time", "Static unless updated", "Can improve with more data"],
														["Explainability", "Fully transparent logic", "Varies by model (simple to black-box)"],
													].map((row) => (
														<tr key={row[0]} className="odd:bg-white even:bg-slate-50">
															<td className="border-b border-slate-200 px-4 py-3 font-medium text-slate-900">
																{row[0]}
															</td>
															<td className="border-b border-slate-200 px-4 py-3 text-slate-700">
																{row[1]}
															</td>
															<td className="border-b border-slate-200 px-4 py-3 text-slate-700">
																{row[2]}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>

										<div className="h-80 rounded-xl border border-slate-200 bg-white p-4">
											<p className="mb-3 text-sm font-semibold text-slate-900">
												Algorithm Complexity vs Performance Tradeoff
											</p>
											<ResponsiveContainer width="100%" height="90%">
												<ScatterChart>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis
														type="number"
														dataKey="trainTime"
														name="Training Time"
														stroke="#334155"
														label={{ value: "Training Time", position: "insideBottom", offset: -5 }}
													/>
													<YAxis
														type="number"
														dataKey="accuracy"
														name="Accuracy"
														stroke="#334155"
														label={{ value: "Accuracy Score", angle: -90, position: "insideLeft" }}
													/>
													<ZAxis type="number" dataKey="interpretability" range={[50, 400]} />
													<Tooltip cursor={{ strokeDasharray: "3 3" }} />
													<Legend />
													<Scatter
														name="Algorithms"
														data={algorithmComplexityData}
														fill="#0ea5e9"
													>
														{algorithmComplexityData.map((entry, index) => (
															<Cell
																key={`cell-${index}`}
																fill={
																	entry.interpretability > 70
																		? "#22c55e"
																		: entry.interpretability > 40
																		? "#f59e0b"
																		: "#ef4444"
																}
															/>
														))}
													</Scatter>
												</ScatterChart>
											</ResponsiveContainer>
											<p className="mt-2 text-xs text-slate-600">
												Bubble size = interpretability. Green = highly interpretable, Red = black-box
											</p>
										</div>
									</div>
								}
								technicalNote="The choice between rules and ML isn't binary. Production systems often use 'guardrails': ML makes predictions, but rule-based checks validate outputs before they reach users. This hybrid approach combines ML's pattern recognition with rules' reliability for critical decisions."
							/>

							{/* Section 3: Types - Enhanced Table + Donut Chart */}
							<SectionContainer
								id="types"
								index={3}
								title={sectionMap.types.title}
								icon={sectionMap.types.icon}
								teachingStyle="comparison-table"
								simpleExplanation="Machine Learning isn't one technique—it's a family of approaches. The type you choose depends on your data (labeled vs unlabeled), your goal (prediction vs discovery), and your feedback mechanism (historical answers vs trial-and-error rewards)."
								deepExplanation={[
									"Supervised Learning uses labeled historical data where you already know the correct answer. The model learns to map inputs to outputs by minimizing prediction errors.",
									"Common supervised tasks include classification (predicting categories like spam/not spam) and regression (predicting numbers like house prices or temperatures).",
									"Unsupervised Learning finds hidden patterns in unlabeled data. It's used for customer segmentation, anomaly detection, and discovering natural groupings you didn't know existed.",
									"Clustering algorithms group similar items together, while dimensionality reduction techniques find lower-dimensional representations of complex data.",
									"Semi-Supervised Learning combines small amounts of labeled data with large amounts of unlabeled data, reducing labeling costs while maintaining accuracy.",
									"Reinforcement Learning trains agents through trial and error. The model receives rewards or penalties for actions, learning optimal strategies over time.",
									"Self-Supervised Learning creates its own training labels from data structure (like predicting the next word in a sentence), enabling models to learn from unlabeled text.",
									"Real-world systems often combine multiple types: supervised for predictions, unsupervised for feature discovery, and reinforcement for decision optimization.",
								]}
								realLifeExample="Netflix uses multiple ML types together: supervised learning predicts your rating for movies based on past ratings, unsupervised clustering groups users with similar tastes, and reinforcement learning optimizes which recommendations to show first based on click-through rewards. Each type solves a different part of the recommendation problem."
								keyPoints={[
									"Supervised learning requires labeled data but provides the most accurate predictions when labels are available.",
									"Unsupervised learning discovers unexpected patterns but requires domain expertise to interpret results.",
									"Semi-supervised bridges the gap when labeling is expensive—common in medical imaging or specialized domains.",
									"Reinforcement learning excels at sequential decision-making but requires careful reward function design.",
									"The 'best' ML type depends on your data availability, business goal, and evaluation criteria.",
									"Transfer learning allows models trained on one task to accelerate learning on related tasks.",
									"Active learning strategically selects which unlabeled examples to label next, maximizing learning efficiency.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
											<table className="w-full min-w-[750px] border-collapse text-left text-sm">
												<thead>
													<tr className="bg-slate-100 text-slate-800">
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Type
														</th>
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Data Required
														</th>
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Primary Goal
														</th>
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Example Use Case
														</th>
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Key Algorithm
														</th>
													</tr>
												</thead>
												<tbody>
													{[
														[
															"Supervised",
															"Labeled examples (X → Y)",
															"Predict known outcomes",
															"Email spam detection",
															"Random Forest, Neural Nets",
														],
														[
															"Unsupervised",
															"Unlabeled data",
															"Discover hidden structure",
															"Customer segmentation",
															"K-Means, PCA",
														],
														[
															"Semi-supervised",
															"Few labels + many unlabeled",
															"Learn with limited labels",
															"Medical image classification",
															"Self-training, Co-training",
														],
														[
															"Reinforcement",
															"Environment + reward signal",
															"Learn optimal actions",
															"Game AI, robotics control",
															"Q-Learning, Policy Gradient",
														],
														[
															"Self-supervised",
															"Unlabeled (creates own labels)",
															"Learn representations",
															"Language models (GPT)",
															"Masked Language Modeling",
														],
													].map((row) => (
														<tr key={row[0]} className="odd:bg-white even:bg-slate-50">
															{row.map((cell, idx) => (
																<td
																	key={`${row[0]}-${idx}`}
																	className="border-b border-slate-200 px-4 py-3 text-slate-700"
																>
																	{cell}
																</td>
															))}
														</tr>
													))}
												</tbody>
											</table>
										</div>

										<div className="grid gap-5 lg:grid-cols-2">
											<div className="h-72 rounded-xl border border-slate-200 bg-white p-3">
												<p className="mb-2 text-sm font-semibold text-slate-900">
													ML Type Distribution in Production Systems
												</p>
												<ResponsiveContainer width="100%" height="90%">
													<PieChart>
														<Pie
															data={mlTypesData}
															dataKey="value"
															nameKey="name"
															cx="50%"
															cy="50%"
															innerRadius={60}
															outerRadius={90}
															paddingAngle={3}
															label={(entry) => `${entry.name}: ${entry.value}%`}
														>
															{mlTypesData.map((entry) => (
																<Cell key={entry.name} fill={entry.color} />
															))}
														</Pie>
														<Tooltip />
													</PieChart>
												</ResponsiveContainer>
											</div>

											<div className="rounded-xl border border-slate-700 bg-slate-900/85 p-4">
												<h4 className="text-sm font-bold text-slate-100">When to Use Each Type</h4>
												<div className="mt-3 space-y-3">
													{[
														{
															type: "Supervised",
															when: "You have historical data with known outcomes and want to predict future cases.",
															color: "border border-indigo-500/35 bg-indigo-950/35 text-indigo-200",
														},
														{
															type: "Unsupervised",
															when: "You want to explore data structure or find groups without predefined categories.",
															color: "border border-emerald-500/35 bg-emerald-950/35 text-emerald-200",
														},
														{
															type: "Semi-supervised",
															when: "Labeling is expensive but you have lots of unlabeled data to leverage.",
															color: "border border-amber-500/35 bg-amber-950/35 text-amber-200",
														},
														{
															type: "Reinforcement",
															when: "You need to learn optimal sequential decisions through trial and error.",
															color: "border border-rose-500/35 bg-rose-950/35 text-rose-200",
														},
													].map((item) => (
														<div key={item.type} className={`rounded-lg p-3 ${item.color}`}>
															<p className="text-xs font-bold">{item.type}</p>
															<p className="mt-1 text-xs leading-5">{item.when}</p>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								}
								technicalNote="Modern deep learning blurs these boundaries. Self-supervised pretraining (unsupervised) followed by fine-tuning (supervised) is now standard for large language models. This two-stage approach learns general representations from unlabeled data, then specializes to specific tasks with minimal labeled examples."
							/>

							{/* Section 4: Data Preprocessing - Area Chart + Radar */}
							<SectionContainer
								id="data-preprocessing"
								index={4}
								title={sectionMap["data-preprocessing"].title}
								icon={sectionMap["data-preprocessing"].icon}
								teachingStyle="pipeline-flow"
								simpleExplanation="Data preprocessing transforms raw, messy real-world data into clean, structured formats that ML algorithms can effectively learn from. Quality preprocessing often improves model performance more than sophisticated algorithm choices. Most ML practitioners spend 60-80% of their time on data preparation."
								deepExplanation={[
									"Data collection starts with identifying relevant sources and ensuring data quality at the source. Automated pipelines reduce manual errors and enable continuous updates.",
									"Missing value handling requires domain knowledge: dropping rows works for random missingness, but can introduce bias if data is missing systematically.",
									"Outlier detection separates legitimate extreme values from data errors. Domain expertise helps determine whether outliers should be kept, transformed, or removed.",
									"Feature scaling ensures numerical features have similar ranges. Standardization (zero mean, unit variance) suits most algorithms, while normalization (0-1 range) helps neural networks.",
									"Categorical encoding converts text labels into numbers. One-hot encoding works for low-cardinality features, while target encoding helps with high-cardinality categories.",
									"Feature engineering creates new variables from existing ones, like extracting day-of-week from timestamps or calculating ratios between numerical columns.",
									"Data splitting separates training, validation, and test sets. Stratified splitting maintains class proportions, while time-based splitting respects temporal dependencies.",
									"Feature selection removes irrelevant or redundant variables, reducing overfitting and improving model interpretability without sacrificing predictive power.",
								]}
								realLifeExample="In healthcare ML, patient data often has missing values because tests weren't performed or results got lost. Simply dropping patients with any missing value could bias the model toward healthier patients (who need fewer tests). Instead, sophisticated imputation methods predict missing values based on similar patients, preserving the full patient population while maintaining data quality."
								keyPoints={[
									"Clean data beats complex models—a simple algorithm on quality data outperforms advanced models on messy data.",
									"Document all preprocessing steps to ensure reproducibility and enable consistent application to new data.",
									"Fit preprocessing transformations only on training data, then apply the same transformations to validation and test sets.",
									"Automated feature engineering tools can generate thousands of candidate features, but domain knowledge identifies the most meaningful ones.",
									"Missing data patterns themselves can be informative—create 'missingness indicators' as additional features.",
									"Data leakage (using future information) is a common preprocessing mistake that creates falsely optimistic results.",
									"Cross-validation helps verify that preprocessing choices generalize beyond the training set.",
									"Keep raw data immutable and version all preprocessing code to enable auditing and reproducibility.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="h-80 rounded-xl border border-slate-200 bg-white p-4">
											<p className="mb-3 text-sm font-semibold text-slate-900">
												Impact of Data Quality on Model Performance
											</p>
											<ResponsiveContainer width="100%" height="90%">
												<AreaChart data={dataQualityImpact}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="stage" stroke="#334155" />
													<YAxis stroke="#334155" />
													<Tooltip />
													<Legend />
													<Area
														type="monotone"
														dataKey="dataQuality"
														stackId="1"
														stroke="#22c55e"
														fill="#22c55e"
														fillOpacity={0.6}
														name="Data Quality Score"
													/>
													<Area
														type="monotone"
														dataKey="modelScore"
														stackId="2"
														stroke="#0ea5e9"
														fill="#0ea5e9"
														fillOpacity={0.6}
														name="Model Accuracy"
													/>
												</AreaChart>
											</ResponsiveContainer>
										</div>

										<div className="grid gap-5 lg:grid-cols-2">
											<div className="h-72 rounded-xl border border-slate-200 bg-white p-3">
												<p className="mb-2 text-sm font-semibold text-slate-900">
													Missing Data Strategy Comparison
												</p>
												<ResponsiveContainer width="100%" height="90%">
													<RadarChart data={missingDataStrategies}>
														<PolarGrid />
														<PolarAngleAxis dataKey="method" tick={{ fontSize: 11 }} />
														<PolarRadiusAxis />
														<Tooltip />
														<Legend />
														<Radar
															name="Data Loss"
															dataKey="dataLoss"
															stroke="#ef4444"
															fill="#ef4444"
															fillOpacity={0.3}
														/>
														<Radar
															name="Bias Risk"
															dataKey="biasRisk"
															stroke="#f59e0b"
															fill="#f59e0b"
															fillOpacity={0.3}
														/>
														<Radar
															name="Processing Speed"
															dataKey="speed"
															stroke="#22c55e"
															fill="#22c55e"
															fillOpacity={0.3}
														/>
													</RadarChart>
												</ResponsiveContainer>
											</div>

											<div className="rounded-xl border border-slate-200 bg-white p-4">
												<h4 className="text-sm font-bold text-slate-900">
													Preprocessing Pipeline Checklist
												</h4>
												<div className="mt-3 space-y-2">
													{[
														"Load raw data and perform initial exploratory analysis",
														"Handle missing values based on missingness patterns",
														"Detect and address outliers (keep, transform, or remove)",
														"Encode categorical variables (one-hot, ordinal, target)",
														"Scale numerical features (standardize or normalize)",
														"Engineer domain-specific features from existing data",
														"Select relevant features using correlation and importance",
														"Split data into train/validation/test with stratification",
														"Document all transformations for production deployment",
													].map((step, idx) => (
														<div key={idx} className="flex items-start gap-2">
															<CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
															<p className="text-xs leading-5 text-slate-700">{step}</p>
														</div>
													))}
												</div>
											</div>
										</div>
									</div>
								}
								technicalNote="Feature engineering is where domain expertise creates the most value. In financial fraud detection, features like 'transaction amount divided by user's average' or 'time since last transaction' often predict fraud better than raw transaction amounts. Automated feature engineering tools can generate candidates, but humans identify which combinations are meaningful."
							/>

							{/* Section 5: Model Building - Enhanced Radar + Info Cards */}
							<SectionContainer
								id="model-building"
								index={5}
								title={sectionMap["model-building"].title}
								icon={sectionMap["model-building"].icon}
								teachingStyle="mini-examples"
								simpleExplanation="Model building is the art and science of selecting algorithms that match your problem's characteristics. Simple models offer interpretability and speed but may underfit complex patterns. Complex models capture intricate relationships but risk overfitting and require more data and computational resources."
								deepExplanation={[
									"Linear models (Linear/Logistic Regression) assume a straight-line relationship between features and outcomes. They're fast, interpretable, and work well when this assumption holds.",
									"Decision Trees split data using yes/no questions about features. They handle non-linear patterns and don't require feature scaling, but single trees can overfit easily.",
									"Ensemble methods combine multiple weak models into a strong predictor. Random Forests use many trees with random feature subsets, while XGBoost adds trees sequentially to correct previous errors.",
									"K-Nearest Neighbors makes predictions by averaging the K most similar training examples. It's simple and requires no training, but becomes slow with large datasets.",
									"Support Vector Machines find the optimal boundary separating classes by maximizing the margin. They work well in high dimensions but can be computationally expensive.",
									"Neural Networks learn hierarchical representations through layers of connected neurons. Shallow networks suit tabular data, while deep networks excel at images, text, and sequences.",
									"Gradient Boosting builds an ensemble by sequentially adding models that focus on examples the previous models got wrong, achieving state-of-the-art results on many tasks.",
									"Model selection requires comparing multiple algorithms using cross-validation, considering accuracy, training time, inference speed, and interpretability requirements.",
								]}
								realLifeExample="For predicting credit defaults, a bank might test multiple models: Logistic Regression provides baseline interpretability for regulators, Random Forest improves accuracy while maintaining some explainability through feature importances, and XGBoost achieves the best performance. The final choice balances performance gains against the regulatory need to explain why specific loan applications were denied."
								keyPoints={[
									"Start with a simple baseline model (like logistic regression) before trying complex algorithms.",
									"Use cross-validation to compare models fairly on the same data splits and avoid lucky/unlucky random splits.",
									"Simple models generalize better with small datasets; complex models need thousands or millions of examples.",
									"Ensemble methods usually outperform single models but take longer to train and deploy.",
									"Interpretability matters for regulated industries, high-stakes decisions, and debugging model failures.",
									"Consider inference speed for real-time applications—neural networks may be too slow for millisecond requirements.",
									"No Free Lunch Theorem: no single algorithm is best for all problems—always test multiple approaches.",
									"Domain knowledge guides feature engineering, which often matters more than algorithm choice.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="h-96 rounded-xl border border-slate-200 bg-white p-4">
											<p className="mb-3 text-sm font-semibold text-slate-900">
												Multi-dimensional Model Comparison
											</p>
											<ResponsiveContainer width="100%" height="92%">
												<RadarChart data={modelComparisonData}>
													<PolarGrid stroke="#dbeafe" />
													<PolarAngleAxis dataKey="model" tick={{ fontSize: 10 }} />
													<PolarRadiusAxis angle={90} domain={[0, 100]} />
													<Tooltip />
													<Legend />
													<Radar
														name="Simplicity"
														dataKey="simplicity"
														stroke="#0ea5e9"
														fill="#0ea5e9"
														fillOpacity={0.25}
													/>
													<Radar
														name="Interpretability"
														dataKey="interpretability"
														stroke="#22c55e"
														fill="#22c55e"
														fillOpacity={0.2}
													/>
													<Radar
														name="Non-linear Power"
														dataKey="nonlinearPower"
														stroke="#f59e0b"
														fill="#f59e0b"
														fillOpacity={0.2}
													/>
													<Radar
														name="Scalability"
														dataKey="scalability"
														stroke="#8b5cf6"
														fill="#8b5cf6"
														fillOpacity={0.2}
													/>
													<Radar
														name="Training Speed"
														dataKey="trainingSpeed"
														stroke="#ec4899"
														fill="#ec4899"
														fillOpacity={0.2}
													/>
												</RadarChart>
											</ResponsiveContainer>
										</div>

										<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
											{[
												{
													name: "Linear Regression",
													math: "y = β₀ + β₁x₁ + ... + βₙxₙ",
													strength: "Fast, interpretable coefficients",
													weakness: "Assumes linear relationships",
												},
												{
													name: "Decision Tree",
													math: "if-else rules on features",
													strength: "Handles non-linearity, no scaling needed",
													weakness: "Prone to overfitting",
												},
												{
													name: "Random Forest",
													math: "Ensemble of decision trees",
													strength: "Robust, handles complex patterns",
													weakness: "Slower inference, harder to interpret",
												},
												{
													name: "Neural Network",
													math: "Layered transformations: h = σ(Wx + b)",
													strength: "Learns hierarchical features",
													weakness: "Needs lots of data, black-box",
												},
												{
													name: "XGBoost",
													math: "Gradient-boosted trees",
													strength: "State-of-the-art tabular performance",
													weakness: "Sensitive to hyperparameters",
												},
											].map((model) => (
												<div
													key={model.name}
													className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-400 hover:shadow-md"
												>
													<p className="text-sm font-bold text-slate-900">{model.name}</p>
													<div className="mt-2 rounded bg-slate-100 px-2 py-1">
														<p className="text-[11px] font-mono text-slate-700">{model.math}</p>
													</div>
													<p className="mt-3 text-xs leading-5 text-emerald-700">
														<span className="font-semibold">✓</span> {model.strength}
													</p>
													<p className="mt-1 text-xs leading-5 text-amber-700">
														<span className="font-semibold">⚠</span> {model.weakness}
													</p>
												</div>
											))}
										</div>
									</div>
								}
								technicalNote="The bias-variance tradeoff is fundamental: simple models have high bias (underfitting) but low variance, while complex models have low bias but high variance (overfitting). Ensemble methods like Random Forest reduce variance by averaging many high-variance trees, while boosting reduces bias by sequentially correcting errors. Finding the sweet spot requires validation data to detect when complexity stops helping."
							/>

							{/* Section 6: Training - Dual-line Chart + Learning Curves */}
							<SectionContainer
								id="training-prediction"
								index={6}
								title={sectionMap["training-prediction"].title}
								icon={sectionMap["training-prediction"].icon}
								teachingStyle="student-analogy"
								simpleExplanation="Training optimizes model parameters to minimize errors on historical data. Validation guides hyperparameter tuning. Testing measures real-world performance. The goal is generalization—models that perform well on new, unseen data, not just memorization of training examples."
								deepExplanation={[
									"Training uses optimization algorithms (like gradient descent) to iteratively adjust model parameters, reducing the difference between predictions and actual values.",
									"Loss functions quantify prediction errors: mean squared error for regression, cross-entropy for classification. The training process minimizes this loss.",
									"Validation data provides an unbiased estimate during training to detect overfitting and tune hyperparameters like learning rate, tree depth, or regularization strength.",
									"Test data is held out completely until final evaluation, ensuring the performance estimate reflects how the model will perform on truly new data.",
									"Overfitting occurs when models learn training data noise instead of underlying patterns. Signs include high training accuracy but poor validation/test performance.",
									"Underfitting means the model is too simple to capture the data's complexity. Both training and test errors remain high.",
									"Regularization techniques (L1, L2, dropout) penalize model complexity, trading some training accuracy for better generalization to new data.",
									"Learning curves plot performance versus training set size, revealing whether more data or model complexity would help most.",
									"Early stopping monitors validation loss during training and stops when it starts increasing, preventing overfitting without manual intervention.",
								]}
								realLifeExample="Imagine teaching a student for an exam. If they memorize every practice problem exactly (overfitting), they fail on slightly different exam questions. If they barely study basic concepts (underfitting), they struggle everywhere. Good learning means understanding principles (patterns) that apply to new problems. Validation is like practice tests that help tune study strategies before the real exam (test set)."
								keyPoints={[
									"Never touch test data during model development—it must remain unseen until final evaluation.",
									"Use k-fold cross-validation when data is limited, training k different models on different splits.",
									"Stratified splitting maintains class proportions in classification tasks, preventing imbalanced train/test sets.",
									"Time-series data requires temporal splits—train on past, validate on intermediate future, test on recent future.",
									"Hyperparameter tuning on training data creates overfitting; validation data provides honest performance estimates.",
									"Learning rate is often the most important hyperparameter—too high causes instability, too low slows convergence.",
									"Batch size affects training speed and memory usage; larger batches are faster but may hurt generalization.",
									"Random seeds control reproducibility; set them for debugging, but test multiple seeds for robustness.",
									"Monitor training and validation metrics together to detect overfitting the moment they diverge.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="grid gap-5 lg:grid-cols-2">
											<div className="h-80 rounded-xl border border-slate-200 bg-white p-4">
												<p className="mb-3 text-sm font-semibold text-slate-900">
													Bias-Variance Tradeoff
												</p>
												<ResponsiveContainer width="100%" height="90%">
													<ComposedChart data={biasVarianceData}>
														<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
														<XAxis
															dataKey="complexity"
															label={{ value: "Model Complexity →", position: "insideBottom", offset: -5 }}
															stroke="#334155"
														/>
														<YAxis
															label={{ value: "← Error", angle: -90, position: "insideLeft" }}
															stroke="#334155"
														/>
														<Tooltip />
														<Legend />
														<Area
															type="monotone"
															dataKey="bias"
															fill="#0ea5e9"
															fillOpacity={0.3}
															stroke="#0ea5e9"
															name="Bias (Underfitting)"
														/>
														<Area
															type="monotone"
															dataKey="variance"
															fill="#ef4444"
															fillOpacity={0.3}
															stroke="#ef4444"
															name="Variance (Overfitting)"
														/>
														<Line
															type="monotone"
															dataKey="totalError"
															stroke="#22c55e"
															strokeWidth={3}
															name="Total Error"
															dot={{ r: 4 }}
														/>
													</ComposedChart>
												</ResponsiveContainer>
												<p className="mt-2 text-xs text-slate-600">
													Optimal complexity minimizes total error (green line)
												</p>
											</div>

											<div className="h-80 rounded-xl border border-slate-200 bg-white p-4">
												<p className="mb-3 text-sm font-semibold text-slate-900">
													Learning Curves: Performance vs Training Data Size
												</p>
												<ResponsiveContainer width="100%" height="90%">
													<LineChart data={learningCurveData}>
														<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
														<XAxis
															dataKey="samples"
															label={{ value: "Training Examples →", position: "insideBottom", offset: -5 }}
															stroke="#334155"
														/>
														<YAxis
															label={{ value: "← Accuracy", angle: -90, position: "insideLeft" }}
															stroke="#334155"
														/>
														<Tooltip />
														<Legend />
														<Line
															type="monotone"
															dataKey="trainScore"
															stroke="#0ea5e9"
															strokeWidth={3}
															name="Training Score"
															dot={{ r: 4 }}
														/>
														<Line
															type="monotone"
															dataKey="validScore"
															stroke="#f59e0b"
															strokeWidth={3}
															name="Validation Score"
															dot={{ r: 4 }}
														/>
														<Line
															type="monotone"
															dataKey="testScore"
															stroke="#22c55e"
															strokeWidth={3}
															name="Test Score"
															dot={{ r: 4 }}
														/>
													</LineChart>
												</ResponsiveContainer>
												<p className="mt-2 text-xs text-slate-600">
													Converging curves suggest more data won't help much
												</p>
											</div>
										</div>

										<div className="grid gap-3 md:grid-cols-3">
											{[
												{
													title: "Underfitting (High Bias)",
													signs: "Both train and test scores are low",
													solution: "Increase model complexity, add features, reduce regularization",
															color: "border-blue-500/35 bg-blue-950/30",
												},
												{
													title: "Good Fit (Balanced)",
													signs: "Train and test scores are similar and high",
													solution: "Deploy the model, monitor performance over time",
															color: "border-emerald-500/35 bg-emerald-950/30",
												},
												{
													title: "Overfitting (High Variance)",
													signs: "High train score, low test score (large gap)",
													solution: "Get more data, reduce complexity, add regularization, use ensembles",
															color: "border-rose-500/35 bg-rose-950/30",
												},
											].map((scenario) => (
												<div
													key={scenario.title}
													className={`rounded-xl border-2 p-4 ${scenario.color}`}
												>
															<h4 className="text-sm font-bold text-slate-100">{scenario.title}</h4>
															<p className="mt-2 text-xs text-slate-300">
																<span className="font-semibold text-slate-200">Signs:</span> {scenario.signs}
													</p>
															<p className="mt-2 text-xs text-slate-300">
																<span className="font-semibold text-slate-200">Solution:</span> {scenario.solution}
													</p>
												</div>
											))}
										</div>
									</div>
								}
								technicalNote="The bias-variance decomposition shows that prediction error = bias² + variance + irreducible error. Bias comes from wrong assumptions (like using linear model for non-linear data). Variance comes from sensitivity to training data fluctuations. Regularization increases bias slightly but reduces variance significantly, often lowering total error. This is why ensemble methods work: averaging many high-variance models reduces their collective variance."
							/>

							{/* Section 7: Evaluation - Bar Chart + Metric Cards */}
							<SectionContainer
								id="evaluation-metrics"
								index={7}
								title={sectionMap["evaluation-metrics"].title}
								icon={sectionMap["evaluation-metrics"].icon}
								teachingStyle="exam-analogy"
								simpleExplanation="Metrics translate model predictions into business-relevant numbers. Different metrics highlight different aspects of performance. Choosing the right metric depends on the cost of different error types and your business priorities, not just mathematical convenience."
								deepExplanation={[
									"Accuracy measures overall correctness: (correct predictions / total predictions). It's intuitive but misleading for imbalanced datasets.",
									"Precision answers: of all positive predictions, how many were actually positive? High precision minimizes false alarms.",
									"Recall (Sensitivity) answers: of all actual positives, how many did we catch? High recall minimizes missed cases.",
									"F1-Score harmonically averages precision and recall, balancing both concerns. Useful when you care about both false positives and false negatives.",
									"ROC-AUC evaluates ranking quality across all possible decision thresholds. Higher AUC means better separation between positive and negative classes.",
									"Precision-Recall curves are better than ROC for imbalanced datasets, showing the tradeoff between precision and recall as threshold varies.",
									"Confusion matrices show all four prediction outcomes: true positives, false positives, true negatives, false negatives, revealing specific error patterns.",
									"Regression metrics include MAE (mean absolute error) for interpretable average error and RMSE (root mean squared error) which penalizes large errors more heavily.",
									"Log loss (cross-entropy) measures probability calibration, rewarding confident correct predictions and penalizing confident wrong predictions.",
								]}
								realLifeExample="In cancer screening, false negatives (missing cancer) are far worse than false positives (unnecessary further tests). Optimize for high recall even if it lowers precision. In spam filtering, false positives (blocking important emails) are worse than false negatives (letting spam through). Optimize for high precision even if spam recall drops. The same model accuracy could hide opposite business priorities."
								keyPoints={[
									"Never rely on accuracy alone—it fails spectacularly on imbalanced datasets (99% negatives → predicting all negative gets 99% accuracy).",
									"Choose metrics aligned with business costs: what's more expensive, a false alarm or a missed case?",
									"Report multiple metrics to understand different aspects: accuracy, precision, recall, F1, and AUC together paint a complete picture.",
									"Use confusion matrices to identify specific error patterns—do errors concentrate in certain classes?",
									"Calibration matters for probability-based decisions: predicted probabilities should match actual frequencies.",
									"Stratified metrics reveal performance differences across subgroups, detecting bias or quality issues in specific segments.",
									"Statistical significance testing determines if model improvements are real or due to random chance.",
									"Business metrics (revenue impact, user satisfaction) matter more than ML metrics—track both and understand their relationship.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="h-80 rounded-xl border border-slate-200 bg-white p-4">
											<p className="mb-3 text-sm font-semibold text-slate-900">
												Metric Scores and Typical Use Cases
											</p>
											<ResponsiveContainer width="100%" height="90%">
												<BarChart data={metricsComparison} layout="vertical">
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis type="number" domain={[0, 100]} stroke="#334155" />
													<YAxis dataKey="metric" type="category" width={100} stroke="#334155" />
													<Tooltip />
													<Bar dataKey="score" radius={[0, 8, 8, 0]}>
														{metricsComparison.map((entry, index) => (
															<Cell
																key={`cell-${index}`}
																fill={
																	index === 0
																		? "#0ea5e9"
																		: index === 1
																		? "#22c55e"
																		: index === 2
																		? "#f59e0b"
																		: index === 3
																		? "#8b5cf6"
																		: index === 4
																		? "#ec4899"
																		: "#ef4444"
																}
															/>
														))}
													</Bar>
												</BarChart>
											</ResponsiveContainer>
										</div>

										<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
											{metricsComparison.map((metric) => (
												<div
													key={metric.metric}
													className="rounded-xl border border-slate-200 bg-white p-4"
												>
													<div className="flex items-center justify-between">
														<h4 className="text-sm font-bold text-slate-900">{metric.metric}</h4>
														<span className="rounded-lg bg-sky-100 px-2 py-1 text-xs font-bold text-sky-900">
															{metric.metric === "Log Loss" ? metric.score.toFixed(2) : `${metric.score}%`}
														</span>
													</div>
													<p className="mt-3 text-xs leading-5 text-slate-600">
														<span className="font-semibold">Best for:</span> {metric.useCase}
													</p>
												</div>
											))}
										</div>

										<div className="rounded-xl border-2 border-slate-700 bg-slate-900/85 p-5">
											<h4 className="text-base font-bold text-slate-100">
												Confusion Matrix Breakdown (1000 Predictions)
											</h4>
											<div className="mt-4 grid grid-cols-3 gap-2">
												<div />
												<div className="text-center text-xs font-semibold text-slate-300">
													Predicted Positive
												</div>
												<div className="text-center text-xs font-semibold text-slate-300">
													Predicted Negative
												</div>

												<div className="flex items-center text-xs font-semibold text-slate-300">
													Actual Positive
												</div>
												<div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-950/30 p-4 text-center">
													<p className="text-2xl font-bold text-emerald-200">450</p>
													<p className="mt-1 text-xs text-emerald-300">True Positives (TP)</p>
													<p className="mt-1 text-[11px] text-emerald-300">Correctly identified</p>
												</div>
												<div className="rounded-lg border-2 border-rose-500/60 bg-rose-950/30 p-4 text-center">
													<p className="text-2xl font-bold text-rose-200">70</p>
													<p className="mt-1 text-xs text-rose-300">False Negatives (FN)</p>
													<p className="mt-1 text-[11px] text-rose-300">Missed cases</p>
												</div>

												<div className="flex items-center text-xs font-semibold text-slate-300">
													Actual Negative
												</div>
												<div className="rounded-lg border-2 border-amber-500/60 bg-amber-950/30 p-4 text-center">
													<p className="text-2xl font-bold text-amber-200">50</p>
													<p className="mt-1 text-xs text-amber-300">False Positives (FP)</p>
													<p className="mt-1 text-[11px] text-amber-300">False alarms</p>
												</div>
												<div className="rounded-lg border-2 border-indigo-500/60 bg-indigo-950/30 p-4 text-center">
													<p className="text-2xl font-bold text-indigo-200">430</p>
													<p className="mt-1 text-xs text-indigo-300">True Negatives (TN)</p>
													<p className="mt-1 text-[11px] text-indigo-300">Correctly rejected</p>
												</div>
											</div>
											<div className="mt-4 grid grid-cols-2 gap-3 text-xs">
												<div className="rounded-lg bg-slate-800 p-3">
													<p className="font-semibold text-slate-100">Accuracy = (TP + TN) / Total</p>
													<p className="mt-1 text-slate-300">= (450 + 430) / 1000 = 88%</p>
												</div>
												<div className="rounded-lg bg-slate-800 p-3">
													<p className="font-semibold text-slate-100">Precision = TP / (TP + FP)</p>
													<p className="mt-1 text-slate-300">= 450 / (450 + 50) = 90%</p>
												</div>
												<div className="rounded-lg bg-slate-800 p-3">
													<p className="font-semibold text-slate-100">Recall = TP / (TP + FN)</p>
													<p className="mt-1 text-slate-300">= 450 / (450 + 70) = 86.5%</p>
												</div>
												<div className="rounded-lg bg-slate-800 p-3">
													<p className="font-semibold text-slate-100">F1 = 2 × (P × R) / (P + R)</p>
													<p className="mt-1 text-slate-300">= 2 × (0.90 × 0.865) / 1.765 = 88.2%</p>
												</div>
											</div>
										</div>
									</div>
								}
								technicalNote="Optimizing for different metrics leads to different models. Maximizing accuracy might predict the majority class always. Maximizing recall might classify everything as positive. In production, define a composite metric that weights multiple objectives, or use multi-objective optimization to explore the Pareto frontier of models that balance competing goals."
							/>

							{/* Section 8: Real-world - Stacked Area + Industry Adoption */}
							<SectionContainer
								id="real-world"
								index={8}
								title={sectionMap["real-world"].title}
								icon={sectionMap["real-world"].icon}
								teachingStyle="case-study"
								simpleExplanation="Machine Learning powers countless products we use daily. From personalized recommendations to fraud detection, medical diagnosis to self-driving cars, ML transforms raw data into intelligent decisions at scale. Understanding ML's real-world applications helps you identify opportunities and avoid common pitfalls in production systems."
								deepExplanation={[
									"Recommendation systems use collaborative filtering and content-based methods to suggest products, movies, or content based on user behavior and preferences.",
									"Computer vision applications include facial recognition, medical image analysis, autonomous vehicles, and quality control in manufacturing using convolutional neural networks.",
									"Natural language processing powers search engines, chatbots, machine translation, sentiment analysis, and document summarization using transformer architectures.",
									"Fraud detection systems analyze transaction patterns in real-time, flagging suspicious activities while minimizing false alarms that frustrate legitimate customers.",
									"Predictive maintenance uses sensor data to forecast equipment failures before they occur, reducing downtime and maintenance costs in manufacturing and logistics.",
									"Healthcare ML assists in diagnosis (detecting diseases in medical images), drug discovery (predicting molecular properties), and personalized treatment recommendations.",
									"Generative AI creates new content—text, images, code, music—using large pre-trained models fine-tuned for specific creative or functional tasks.",
									"Production ML systems require monitoring (detecting distribution drift), A/B testing (validating improvements), and continuous retraining to maintain performance over time.",
									"Responsible AI considers fairness (avoiding bias), privacy (protecting user data), transparency (explaining decisions), and robustness (handling adversarial inputs).",
								]}
								realLifeExample="Spotify's Discover Weekly playlist combines multiple ML models: collaborative filtering identifies users with similar listening patterns, content-based models analyze audio features (tempo, energy, genre), and neural networks process listening context (time of day, sequence patterns). The system also incorporates popularity signals and diversity constraints to create personalized yet fresh recommendations each week. This multi-model ensemble demonstrates how real-world ML combines techniques to solve complex problems."
								keyPoints={[
									"Production ML is 10% model training, 90% data pipelines, monitoring, and infrastructure.",
									"Model performance degrades over time as real-world distributions shift; continuous monitoring detects this drift.",
									"A/B testing is critical—test new models against production systems to measure real business impact.",
									"Feature stores centralize feature engineering, ensuring consistency between training and serving.",
									"Model versioning and reproducibility enable debugging, compliance, and rollback when deployments fail.",
									"Explainability builds trust—users and regulators need to understand why ML systems make decisions.",
									"Fairness requires proactive testing across demographic groups to prevent disparate impact.",
									"Edge deployment brings ML to devices (phones, IoT), enabling low-latency, privacy-preserving inference.",
									"MLOps practices automate the ML lifecycle from data ingestion to model deployment and monitoring.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="h-80 rounded-xl border border-slate-200 bg-white p-4">
											<p className="mb-3 text-sm font-semibold text-slate-900">
												ML Capability Evolution Across Domains (2015-2025)
											</p>
											<ResponsiveContainer width="100%" height="90%">
												<AreaChart data={mlCapabilityEvolution}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="year" stroke="#334155" />
													<YAxis domain={[0, 100]} stroke="#334155" />
													<Tooltip />
													<Legend />
													<Area
														type="monotone"
														dataKey="vision"
														stackId="1"
														stroke="#0ea5e9"
														fill="#0ea5e9"
														fillOpacity={0.7}
														name="Computer Vision"
													/>
													<Area
														type="monotone"
														dataKey="nlp"
														stackId="2"
														stroke="#22c55e"
														fill="#22c55e"
														fillOpacity={0.7}
														name="Natural Language"
													/>
													<Area
														type="monotone"
														dataKey="speech"
														stackId="3"
														stroke="#f59e0b"
														fill="#f59e0b"
														fillOpacity={0.7}
														name="Speech Recognition"
													/>
													<Area
														type="monotone"
														dataKey="reasoning"
														stackId="4"
														stroke="#8b5cf6"
														fill="#8b5cf6"
														fillOpacity={0.7}
														name="Reasoning"
													/>
												</AreaChart>
											</ResponsiveContainer>
											<p className="mt-2 text-xs text-slate-600">
												All domains show rapid improvement, with NLP leaping ahead recently due to transformers
											</p>
										</div>

										<div className="h-80 rounded-xl border border-slate-200 bg-white p-4">
											<p className="mb-3 text-sm font-semibold text-slate-900">
												Industry ML Adoption, Investment & Impact
											</p>
											<ResponsiveContainer width="100%" height="90%">
												<BarChart data={industryAdoption}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="industry" stroke="#334155" />
													<YAxis domain={[0, 100]} stroke="#334155" />
													<Tooltip />
													<Legend />
													<Bar dataKey="adoption" fill="#0ea5e9" name="Adoption Rate" />
													<Bar dataKey="investment" fill="#22c55e" name="Investment Level" />
													<Bar dataKey="impact" fill="#f59e0b" name="Business Impact" />
												</BarChart>
											</ResponsiveContainer>
										</div>

										<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
											{[
												{
													domain: "E-commerce",
													apps: "Product recommendations, dynamic pricing, demand forecasting, visual search",
													icon: "🛒",
												},
												{
													domain: "Healthcare",
													apps: "Medical imaging, drug discovery, patient risk scoring, treatment optimization",
													icon: "🏥",
												},
												{
													domain: "Finance",
													apps: "Fraud detection, credit scoring, algorithmic trading, customer churn prediction",
													icon: "💰",
												},
												{
													domain: "Transportation",
													apps: "Autonomous vehicles, route optimization, demand prediction, predictive maintenance",
													icon: "🚗",
												},
												{
													domain: "Entertainment",
													apps: "Content recommendation, personalization, content moderation, audience analytics",
													icon: "🎬",
												},
												{
													domain: "Manufacturing",
													apps: "Quality inspection, predictive maintenance, supply chain optimization, robot control",
													icon: "🏭",
												},
												{
													domain: "Marketing",
													apps: "Customer segmentation, campaign optimization, sentiment analysis, chatbots",
													icon: "📊",
												},
												{
													domain: "Security",
													apps: "Anomaly detection, facial recognition, threat intelligence, access control",
													icon: "🔒",
												},
											].map((item) => (
												<div
													key={item.domain}
													className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-4 transition hover:border-indigo-400 hover:shadow-md"
												>
													<div className="flex items-center gap-2">
														<span className="text-2xl">{item.icon}</span>
														<h4 className="text-sm font-bold text-slate-100">{item.domain}</h4>
													</div>
													<p className="mt-3 text-xs leading-5 text-slate-300">{item.apps}</p>
												</div>
											))}
										</div>

										<div className="rounded-xl border-2 border-indigo-500/35 bg-indigo-950/30 p-5">
											<h4 className="text-base font-bold text-indigo-200">Production ML Tech Stack</h4>
											<div className="mt-4 grid gap-3 md:grid-cols-3">
												<div>
													<p className="text-xs font-bold uppercase tracking-wide text-indigo-300">
														Languages & Frameworks
													</p>
													<p className="mt-2 text-sm text-slate-300">
														Python (scikit-learn, TensorFlow, PyTorch), R, Julia for research; C++, Rust for
														low-latency inference
													</p>
												</div>
												<div>
													<p className="text-xs font-bold uppercase tracking-wide text-indigo-300">
														Data & Infrastructure
													</p>
													<p className="mt-2 text-sm text-slate-300">
														Cloud platforms (AWS, GCP, Azure), Spark for big data, MLflow for experiments,
														Kubernetes for deployment
													</p>
												</div>
												<div>
													<p className="text-xs font-bold uppercase tracking-wide text-indigo-300">
														Monitoring & Ops
													</p>
													<p className="mt-2 text-sm text-slate-300">
														Model monitoring (Evidently, Arize), feature stores (Feast, Tecton), CI/CD
														(GitHub Actions), A/B testing platforms
													</p>
												</div>
											</div>
										</div>
									</div>
								}
								technicalNote="The MLOps maturity model has five levels: Level 0 is manual scripts and notebooks. Level 1 adds ML pipelines. Level 2 introduces CI/CD for models. Level 3 implements automated retraining. Level 4 achieves full automation with continuous learning from production data. Most companies are at Level 1-2, working toward automated workflows that reduce time from idea to production deployment."
							/>
						</div>

						<footer className="mt-6 rounded-3xl border border-slate-700 bg-slate-900/85 p-8 text-center shadow-sm">
							<div className="mx-auto max-w-2xl">
								<p className="text-xl font-bold text-slate-100">
									End of Advanced ML Tutorial
								</p>
								<p className="mt-3 text-base leading-7 text-slate-300">
									You've completed a comprehensive journey through Machine Learning fundamentals,
									algorithms, training strategies, evaluation metrics, and real-world applications.
									Continue practicing with hands-on projects, explore specialized domains like deep
									learning or NLP, and stay current with the rapidly evolving field.
								</p>
								<div className="mt-6 flex flex-wrap justify-center gap-3">
									<Link
										href="/dashboard"
										className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_22px_rgba(129,140,248,0.42)] transition hover:bg-indigo-400"
									>
										<LayoutDashboard className="h-4 w-4" />
										Go to Dashboard
									</Link>
								</div>
							</div>
						</footer>
					</div>
				</main>
			</div>
		</div>
	);
}