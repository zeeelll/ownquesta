"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
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

const historyTimeline = [
	{
		year: "1950s",
		title: "Foundations",
		detail: "Alan Turing introduced the idea that machines can imitate intelligent behavior.",
	},
	{
		year: "1980s",
		title: "Statistical Learning",
		detail: "Researchers improved algorithms using probability, optimization, and better math tools.",
	},
	{
		year: "1990s",
		title: "Practical ML",
		detail: "Decision trees, SVM, and ensemble methods became useful for real business data.",
	},
	{
		year: "2010s",
		title: "Deep Learning Era",
		detail: "Big data and GPUs made neural networks powerful for vision, language, and speech.",
	},
	{
		year: "2020s",
		title: "AI at Scale",
		detail: "ML now powers recommendation engines, healthcare diagnostics, and generative AI systems.",
	},
];

const historyGrowthData = [
	{ decade: "1970", researchImpact: 12 },
	{ decade: "1980", researchImpact: 20 },
	{ decade: "1990", researchImpact: 36 },
	{ decade: "2000", researchImpact: 48 },
	{ decade: "2010", researchImpact: 72 },
	{ decade: "2020", researchImpact: 95 },
];

const mlTypesData = [
	{ name: "Supervised", value: 45, color: "#0ea5e9" },
	{ name: "Unsupervised", value: 25, color: "#22c55e" },
	{ name: "Semi-supervised", value: 12, color: "#f59e0b" },
	{ name: "Reinforcement", value: 18, color: "#ef4444" },
];

const modelComparisonData = [
	{
		model: "Linear Regression",
		simplicity: 95,
		interpretability: 90,
		nonlinearPower: 35,
	},
	{
		model: "Decision Tree",
		simplicity: 80,
		interpretability: 85,
		nonlinearPower: 70,
	},
	{ model: "KNN", simplicity: 75, interpretability: 70, nonlinearPower: 65 },
	{
		model: "Neural Network",
		simplicity: 35,
		interpretability: 30,
		nonlinearPower: 95,
	},
];

const fitCurveData = [
	{ complexity: 1, trainError: 38, testError: 42 },
	{ complexity: 2, trainError: 30, testError: 34 },
	{ complexity: 3, trainError: 24, testError: 27 },
	{ complexity: 4, trainError: 19, testError: 24 },
	{ complexity: 5, trainError: 14, testError: 23 },
	{ complexity: 6, trainError: 10, testError: 26 },
	{ complexity: 7, trainError: 7, testError: 32 },
];

const metricsData = [
	{ metric: "Accuracy", score: 88 },
	{ metric: "Precision", score: 83 },
	{ metric: "Recall", score: 79 },
	{ metric: "F1", score: 81 },
];

const appImpactData = [
	{ sector: "Netflix", personalization: 95, prediction: 88 },
	{ sector: "Amazon", personalization: 93, prediction: 90 },
	{ sector: "Healthcare", personalization: 82, prediction: 94 },
	{ sector: "Self-driving", personalization: 70, prediction: 97 },
];

function SectionContainer({
	id,
	index,
	title,
	icon: Icon,
	simpleExplanation,
	deepExplanation,
	realLifeExample,
	keyPoints,
	visualBlock,
}: {
	id: SectionId;
	index: number;
	title: string;
	icon: LucideIcon;
	simpleExplanation: string;
	deepExplanation: string[];
	realLifeExample: string;
	keyPoints: string[];
	visualBlock: JSX.Element;
}) {
	return (
		<motion.section
			id={id}
			data-doc-section="true"
			className="w-full scroll-mt-24 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur lg:p-10"
			initial={{ opacity: 0, y: 28 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: false, amount: 0.2 }}
			transition={{ duration: 0.55, ease: "easeOut" }}
			whileHover={{ y: -3 }}
		>
			<div className="flex items-center gap-4">
				<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
					<Icon className="h-6 w-6" />
				</div>
				<div>
					<p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
						Section {index}
					</p>
					<h2 className="text-3xl font-bold text-slate-900 lg:text-4xl">{title}</h2>
				</div>
			</div>

			<div className="mt-8 grid gap-6 lg:grid-cols-2">
				<article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
					<h3 className="text-lg font-semibold text-slate-900">Simple Explanation</h3>
					<p className="mt-3 text-[15px] leading-7 text-slate-700">{simpleExplanation}</p>
				</article>

				<article className="rounded-2xl border border-slate-200 bg-sky-50 p-5">
					<h3 className="text-lg font-semibold text-slate-900">Real-life Example</h3>
					<p className="mt-3 text-[15px] leading-7 text-slate-700">{realLifeExample}</p>
				</article>
			</div>

			<article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
				<h3 className="text-lg font-semibold text-slate-900">
					Deep Explanation (Step-by-step)
				</h3>
				<div className="mt-4 space-y-3">
					{deepExplanation.map((step, stepIndex) => (
						<div
							key={`${id}-step-${stepIndex}`}
							className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
						>
							<span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
								{stepIndex + 1}
							</span>
							<p className="text-sm leading-6 text-slate-700">{step}</p>
						</div>
					))}
				</div>
			</article>

			<article className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
				<h3 className="text-lg font-semibold text-slate-900">Key Points</h3>
				<div className="mt-4 grid gap-3 md:grid-cols-2">
					{keyPoints.map((point, pointIndex) => (
						<div
							key={`${id}-point-${pointIndex}`}
							className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
						>
							<CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
							<p className="text-sm leading-6 text-slate-700">{point}</p>
						</div>
					))}
				</div>
			</article>

			<article className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-sky-50 p-5">
				<h3 className="text-lg font-semibold text-slate-900">Visual Block</h3>
				<div className="mt-4">{visualBlock}</div>
			</article>
		</motion.section>
	);
}

export default function MLTutorialPage() {
	const [activeSection, setActiveSection] = useState<SectionId>("history");

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
		<div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_90%_10%,rgba(14,165,233,0.16),transparent_35%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_45%,#e2e8f0_100%)] text-slate-900">
			<header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
				<div className="mx-auto flex h-16 w-full max-w-none items-center justify-between px-4 md:px-6 xl:px-10">
					<Logo href="/home" size="md" />
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
					>
						<LayoutDashboard className="h-4 w-4" />
						Dashboard
					</Link>
				</div>
			</header>

			<div className="relative pt-16 md:grid md:grid-cols-[18rem_minmax(0,1fr)]">
				<aside className="hidden border-r border-slate-200/70 bg-white/75 px-4 py-6 backdrop-blur-md md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)] md:overflow-y-auto xl:px-5">
					<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
							Tutorial Topics
						</p>
						<h2 className="mt-2 text-lg font-bold text-slate-900">Machine Learning</h2>
						<p className="mt-2 text-sm text-slate-600">
							Click any section to jump and learn end-to-end.
						</p>
					</div>

					<nav className="mt-5 space-y-2">
						{sections.map((section, index) => {
							const Icon = section.icon;
							const isActive = activeSection === section.id;
							return (
								<button
									key={section.id}
									onClick={() => scrollToSection(section.id)}
									className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
										isActive
											? "border-sky-500 bg-sky-50 text-sky-900"
											: "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
									}`}
								>
									<span
										className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
											isActive
												? "bg-sky-600 text-white"
												: "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
										}`}
									>
										<Icon className="h-4 w-4" />
									</span>
									<div>
										<p className="text-xs font-semibold text-slate-500">{`0${index + 1}`}</p>
										<p className="text-sm font-semibold leading-5">{section.title}</p>
									</div>
								</button>
							);
						})}
					</nav>
				</aside>

				<main className="w-full min-w-0">
					<div className="w-full px-4 py-6 md:px-6 xl:px-10 xl:py-8">
						<motion.section
							className="mb-6 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_55px_-35px_rgba(15,23,42,0.5)] backdrop-blur lg:p-10"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.55, ease: "easeOut" }}
						>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
								Premium Learning Documentation
							</p>
							<h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 lg:text-5xl">
								Complete Machine Learning Tutorial for Beginners to Builders
							</h1>
							<p className="mt-4 max-w-none text-base leading-8 text-slate-700 lg:text-lg">
								This page is structured like professional course documentation. You will learn
								what Machine Learning is, why it matters, how models are built, and how ML powers
								real AI products step-by-step using clear explanations and visuals.
							</p>

							<div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
								<h3 className="text-lg font-bold text-slate-900">ML Pipeline Diagram</h3>
								<div className="mt-4 flex flex-wrap items-center gap-3">
									{[
										"Data",
										"Preprocess",
										"Model",
										"Train",
										"Predict",
										"Evaluate",
									].map((step, idx, arr) => (
										<div key={step} className="flex items-center gap-3">
											<div className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
												{step}
											</div>
											{idx < arr.length - 1 ? <ArrowRight className="h-4 w-4 text-sky-700" /> : null}
										</div>
									))}
								</div>
							</div>
						</motion.section>

						<div className="space-y-6">
							<SectionContainer
								id="history"
								index={1}
								title={sectionMap.history.title}
								icon={sectionMap.history.icon}
								simpleExplanation="Machine Learning did not appear overnight. It evolved over decades from simple ideas about teaching machines to a modern technology that can understand images, language, and behavior patterns."
								deepExplanation={[
									"Early researchers asked if machines could imitate human decision-making and pattern recognition.",
									"Mathematics and statistics helped create algorithms that improve based on examples instead of fixed rules.",
									"As computers became faster, ML methods moved from theory to practical business and science applications.",
									"The rise of cloud computing, GPUs, and large datasets accelerated deep learning and modern AI.",
								]}
								realLifeExample="Your phone's voice assistant understands your speech because decades of ML progress improved language and audio models."
								keyPoints={[
									"ML evolved from foundational AI research in the 1950s.",
									"Better compute and data unlocked practical ML adoption.",
									"Deep learning became mainstream in the 2010s.",
									"Today, ML is core infrastructure in products and services.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="grid gap-3 md:grid-cols-5">
											{historyTimeline.map((item) => (
												<div
													key={item.year}
													className="rounded-xl border border-slate-200 bg-white p-4"
												>
													<p className="text-xs font-bold uppercase tracking-[0.12em] text-sky-700">
														{item.year}
													</p>
													<p className="mt-2 text-sm font-semibold text-slate-900">{item.title}</p>
													<p className="mt-2 text-xs leading-5 text-slate-600">{item.detail}</p>
												</div>
											))}
										</div>
										<div className="h-64 w-full rounded-xl border border-slate-200 bg-white p-3">
											<ResponsiveContainer width="100%" height="100%">
												<LineChart data={historyGrowthData}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="decade" stroke="#334155" />
													<YAxis stroke="#334155" />
													<Tooltip />
													<Line
														type="monotone"
														dataKey="researchImpact"
														stroke="#0ea5e9"
														strokeWidth={3}
														dot={{ r: 4 }}
													/>
												</LineChart>
											</ResponsiveContainer>
										</div>
									</div>
								}
							/>

							<SectionContainer
								id="why-ml"
								index={2}
								title={sectionMap["why-ml"].title}
								icon={sectionMap["why-ml"].icon}
								simpleExplanation="Traditional coding requires explicit instructions for every case. ML learns patterns from data, so it can handle complex situations that are hard to manually program."
								deepExplanation={[
									"In traditional coding, developers write fixed rules like 'if this, then that'.",
									"For complex problems like spam detection, there are too many rules to write manually.",
									"ML algorithms learn from examples and detect hidden patterns by themselves.",
									"As new data comes in, ML models can be retrained and improved without rewriting all logic.",
								]}
								realLifeExample="Email spam filters cannot rely on a few hardcoded keywords because spam constantly changes. ML models learn evolving patterns from millions of emails."
								keyPoints={[
									"Traditional coding is precise but rigid.",
									"ML is data-driven and adapts to changing patterns.",
									"ML works best when explicit rules are too many or unknown.",
									"Retraining allows systems to improve over time.",
								]}
								visualBlock={
									<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
										<table className="w-full min-w-[650px] border-collapse text-left text-sm">
											<thead>
												<tr className="bg-slate-100 text-slate-800">
													<th className="border-b border-slate-200 px-4 py-3 font-semibold">Aspect</th>
													<th className="border-b border-slate-200 px-4 py-3 font-semibold">
														Traditional Coding
													</th>
													<th className="border-b border-slate-200 px-4 py-3 font-semibold">
														Machine Learning
													</th>
												</tr>
											</thead>
											<tbody>
												{[
													["Logic", "Written by developer", "Learned from data"],
													["Adaptability", "Low", "High"],
													["Best For", "Clear deterministic tasks", "Pattern-heavy tasks"],
													["Maintenance", "Rule updates", "Model retraining"],
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
								}
							/>

							<SectionContainer
								id="types"
								index={3}
								title={sectionMap.types.title}
								icon={sectionMap.types.icon}
								simpleExplanation="Machine Learning has different learning styles depending on the type of data and the goal: predicting known labels, finding hidden groups, or learning by rewards."
								deepExplanation={[
									"Supervised learning uses labeled data where the correct answer is already known.",
									"Unsupervised learning finds structure in data without labeled answers.",
									"Semi-supervised learning combines a small labeled dataset with a larger unlabeled one.",
									"Reinforcement learning improves by trying actions and receiving rewards or penalties.",
								]}
								realLifeExample="Movie recommendation starts with supervised and unsupervised approaches: one model predicts your rating while another groups users with similar tastes."
								keyPoints={[
									"Supervised is common for classification and regression.",
									"Unsupervised is useful for segmentation and pattern discovery.",
									"Semi-supervised helps when labeling data is expensive.",
									"Reinforcement is powerful for control and strategy tasks.",
								]}
								visualBlock={
									<div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
										<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
											<table className="w-full min-w-[620px] border-collapse text-left text-sm">
												<thead>
													<tr className="bg-slate-100 text-slate-800">
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Type
														</th>
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Data Needed
														</th>
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Goal
														</th>
														<th className="border-b border-slate-200 px-4 py-3 font-semibold">
															Example
														</th>
													</tr>
												</thead>
												<tbody>
													{[
														[
															"Supervised",
															"Labeled",
															"Predict known target",
															"Spam detection",
														],
														[
															"Unsupervised",
															"Unlabeled",
															"Find hidden patterns",
															"Customer clustering",
														],
														[
															"Semi-supervised",
															"Few labels + many unlabeled",
															"Improve with limited labels",
															"Medical imaging",
														],
														[
															"Reinforcement",
															"Reward signal",
															"Learn best action policy",
															"Game AI / robots",
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

										<div className="h-72 rounded-xl border border-slate-200 bg-white p-3">
											<ResponsiveContainer width="100%" height="100%">
												<PieChart>
													<Pie
														data={mlTypesData}
														dataKey="value"
														nameKey="name"
														innerRadius={55}
														outerRadius={95}
														paddingAngle={3}
													>
														{mlTypesData.map((entry) => (
															<Cell key={entry.name} fill={entry.color} />
														))}
													</Pie>
													<Legend verticalAlign="bottom" />
													<Tooltip />
												</PieChart>
											</ResponsiveContainer>
										</div>
									</div>
								}
							/>

							<SectionContainer
								id="data-preprocessing"
								index={4}
								title={sectionMap["data-preprocessing"].title}
								icon={sectionMap["data-preprocessing"].icon}
								simpleExplanation="Good data is more important than a fancy algorithm. Data collection and preprocessing prepare raw information so models can learn correctly and reliably."
								deepExplanation={[
									"Collect data from reliable sources such as product logs, forms, sensors, or public datasets.",
									"Clean missing, duplicate, and inconsistent values to avoid misleading patterns.",
									"Transform categorical and textual features into numerical representations.",
									"Normalize numerical values so models treat features fairly and training becomes stable.",
									"Split data into train, validation, and test sets to evaluate performance honestly.",
								]}
								realLifeExample="In healthcare prediction, if patient ages are missing or stored in different formats, the model can learn wrong relationships. Preprocessing standardizes everything before training."
								keyPoints={[
									"Garbage in, garbage out: poor data leads to poor models.",
									"Cleaning and transformation prevent hidden bias and leakage.",
									"Feature engineering can improve accuracy significantly.",
									"Proper data split protects against over-optimistic results.",
								]}
								visualBlock={
									<div className="space-y-4">
										<div className="grid gap-3 md:grid-cols-5">
											{[
												"Collect",
												"Clean",
												"Transform",
												"Normalize",
												"Split",
											].map((step, idx) => (
												<div
													key={step}
													className="rounded-xl border border-slate-200 bg-white p-4 text-center"
												>
													<p className="text-xs font-bold text-sky-700">Step {idx + 1}</p>
													<p className="mt-2 text-sm font-semibold text-slate-900">{step}</p>
												</div>
											))}
										</div>
										<div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
											Data Flow: Raw Sources -&gt; Quality Checks -&gt; Feature Table -&gt; Train/Validation/Test
										</div>
									</div>
								}
							/>

							<SectionContainer
								id="model-building"
								index={5}
								title={sectionMap["model-building"].title}
								icon={sectionMap["model-building"].icon}
								simpleExplanation="Model building is choosing the right algorithm for your problem and data. Different models learn in different ways, so understanding their behavior helps you pick wisely."
								deepExplanation={[
									"Linear Regression fits a straight-line relationship between input features and a continuous output.",
									"Decision Tree splits data into branches using feature-based questions to reach a prediction.",
									"KNN finds the closest examples in the dataset and predicts based on nearby neighbors.",
									"Neural Networks stack layers of learned weights to capture complex non-linear patterns.",
									"Model selection depends on data size, explainability needs, speed, and expected accuracy.",
								]}
								realLifeExample="House price prediction can start with Linear Regression for explainability, then move to Decision Trees or Neural Networks if relationships become more complex."
								keyPoints={[
									"Linear Regression is simple and interpretable.",
									"Decision Trees are intuitive and handle non-linearity.",
									"KNN is easy to understand but slower with huge datasets.",
									"Neural Networks are powerful but require more data and tuning.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
											{[
												{
													name: "Linear Regression",
													how: "Learns best-fit line by minimizing error.",
												},
												{
													name: "Decision Tree",
													how: "Splits feature space through conditional questions.",
												},
												{
													name: "KNN",
													how: "Uses nearest data points to vote or average.",
												},
												{
													name: "Neural Network",
													how: "Learns layered feature representations via backpropagation.",
												},
											].map((item) => (
												<div
													key={item.name}
													className="rounded-xl border border-slate-200 bg-white p-4"
												>
													<p className="text-sm font-bold text-slate-900">{item.name}</p>
													<p className="mt-2 text-xs leading-5 text-slate-600">{item.how}</p>
												</div>
											))}
										</div>
										<div className="h-72 rounded-xl border border-slate-200 bg-white p-3">
											<ResponsiveContainer width="100%" height="100%">
												<RadarChart data={modelComparisonData}>
													<PolarGrid />
													<XAxis dataKey="model" tick={{ fontSize: 11 }} />
													<YAxis />
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
														name="Nonlinear Power"
														dataKey="nonlinearPower"
														stroke="#f59e0b"
														fill="#f59e0b"
														fillOpacity={0.2}
													/>
												</RadarChart>
											</ResponsiveContainer>
										</div>
									</div>
								}
							/>

							<SectionContainer
								id="training-prediction"
								index={6}
								title={sectionMap["training-prediction"].title}
								icon={sectionMap["training-prediction"].icon}
								simpleExplanation="Training teaches a model from historical data. Prediction is when the trained model makes decisions for new unseen inputs. Testing checks if it generalizes well."
								deepExplanation={[
									"Training phase: the model sees labeled examples and adjusts parameters to reduce error.",
									"Validation phase: hyperparameters are tuned without touching test data.",
									"Testing phase: final performance is measured on unseen data to estimate real-world behavior.",
									"Overfitting means model memorizes training data and fails on new data.",
									"Underfitting means model is too simple and misses important patterns.",
								]}
								realLifeExample="If a student memorizes old exam questions but cannot solve new ones, that is overfitting. If they never understood the topic at all, that is underfitting."
								keyPoints={[
									"Separate train/validation/test is essential.",
									"Low train error alone is not enough.",
									"Generalization on unseen data is the real goal.",
									"Balance model complexity to avoid overfit and underfit.",
								]}
								visualBlock={
									<div className="h-72 rounded-xl border border-slate-200 bg-white p-3">
										<ResponsiveContainer width="100%" height="100%">
											<LineChart data={fitCurveData}>
												<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
												<XAxis dataKey="complexity" stroke="#334155" />
												<YAxis stroke="#334155" />
												<Tooltip />
												<Legend />
												<Line
													type="monotone"
													dataKey="trainError"
													name="Training Error"
													stroke="#0ea5e9"
													strokeWidth={3}
												/>
												<Line
													type="monotone"
													dataKey="testError"
													name="Testing Error"
													stroke="#ef4444"
													strokeWidth={3}
												/>
											</LineChart>
										</ResponsiveContainer>
									</div>
								}
							/>

							<SectionContainer
								id="evaluation-metrics"
								index={7}
								title={sectionMap["evaluation-metrics"].title}
								icon={sectionMap["evaluation-metrics"].icon}
								simpleExplanation="Evaluation metrics tell you how good your model is from different angles. One number is not enough because each metric answers a different performance question."
								deepExplanation={[
									"Accuracy: overall percentage of correct predictions.",
									"Precision: when model predicts positive, how often is it correct?",
									"Recall: of all real positives, how many did the model find?",
									"F1 Score: balance between precision and recall, useful when classes are imbalanced.",
								]}
								realLifeExample="In disease screening, recall is crucial because missing a sick patient is dangerous. Precision also matters to reduce unnecessary panic from false alarms."
								keyPoints={[
									"Accuracy can be misleading on imbalanced data.",
									"Precision controls false positives.",
									"Recall controls false negatives.",
									"F1 is a strong balanced metric for many practical tasks.",
								]}
								visualBlock={
									<div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
										<div className="h-72 rounded-xl border border-slate-200 bg-white p-3">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart data={metricsData}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="metric" stroke="#334155" />
													<YAxis stroke="#334155" domain={[0, 100]} />
													<Tooltip />
													<Bar dataKey="score" radius={[8, 8, 0, 0]}>
														{metricsData.map((entry) => (
															<Cell
																key={entry.metric}
																fill={
																	entry.metric === "Accuracy"
																		? "#0ea5e9"
																		: entry.metric === "Precision"
																		? "#22c55e"
																		: entry.metric === "Recall"
																		? "#f59e0b"
																		: "#ef4444"
																}
															/>
														))}
													</Bar>
												</BarChart>
											</ResponsiveContainer>
										</div>
										<div className="rounded-xl border border-slate-200 bg-white p-4">
											<h4 className="text-sm font-bold text-slate-900">Simple Analogy</h4>
											<p className="mt-3 text-sm leading-6 text-slate-700">
												Imagine a security guard checking visitors:
											</p>
											<ul className="mt-3 space-y-2 text-sm text-slate-700">
												<li>Accuracy: how often the guard made the right decision overall.</li>
												<li>Precision: among those stopped, how many were truly suspicious.</li>
												<li>Recall: among all suspicious people, how many were caught.</li>
												<li>F1: balanced quality score for both precision and recall.</li>
											</ul>
										</div>
									</div>
								}
							/>

							<SectionContainer
								id="real-world"
								index={8}
								title={sectionMap["real-world"].title}
								icon={sectionMap["real-world"].icon}
								simpleExplanation="Machine Learning is the engine that enables many modern AI systems. AI is the broad goal of intelligent behavior, and ML is the practical way many systems learn that behavior from data."
								deepExplanation={[
									"Streaming platforms use ML to rank content and personalize recommendations.",
									"E-commerce uses ML for product ranking, demand forecasting, and fraud detection.",
									"Healthcare uses ML for medical image analysis, risk prediction, and treatment support.",
									"Self-driving systems combine vision, planning, and control models for safe navigation.",
									"Generative AI relies on large-scale ML models to produce text, images, and audio.",
								]}
								realLifeExample="Netflix predicts what you want to watch next, Amazon predicts what you may buy, hospitals predict disease risk, and autonomous vehicles predict movement in traffic scenes."
								keyPoints={[
									"ML powers personalization, prediction, and automation.",
									"AI products often combine multiple ML models together.",
									"Better data loops make AI systems improve continuously.",
									"Responsible ML design is essential for fairness and trust.",
								]}
								visualBlock={
									<div className="space-y-5">
										<div className="h-72 rounded-xl border border-slate-200 bg-white p-3">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart data={appImpactData}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="sector" stroke="#334155" />
													<YAxis stroke="#334155" domain={[0, 100]} />
													<Tooltip />
													<Legend />
													<Bar dataKey="personalization" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
													<Bar dataKey="prediction" fill="#22c55e" radius={[6, 6, 0, 0]} />
												</BarChart>
											</ResponsiveContainer>
										</div>

										<div className="rounded-xl border border-slate-200 bg-white p-5">
											<h4 className="text-base font-bold text-slate-900">Practical Toolkit (Short)</h4>
											<p className="mt-3 text-sm text-slate-700">
												Language: Python for data analysis, modeling, and deployment workflows.
											</p>
											<p className="mt-2 text-sm text-slate-700">
												Libraries: NumPy (arrays), Pandas (data tables), Scikit-learn (classic ML),
												TensorFlow (deep learning).
											</p>
										</div>
									</div>
								}
							/>
						</div>

						<footer className="mt-6 rounded-3xl border border-slate-200 bg-white/90 p-6 text-center shadow-sm">
							<p className="text-base font-semibold text-slate-900">
								End of Documentation • Ownquesta Machine Learning Tutorial
							</p>
							<p className="mt-2 text-sm text-slate-600">
								Continue to Dashboard to practice with labs, quizzes, and project workflows.
							</p>
						</footer>
					</div>
				</main>
			</div>
		</div>
	);
}
