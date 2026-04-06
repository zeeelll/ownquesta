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
	Database,
	FlaskConical,
	History,
	LayoutDashboard,
	LineChart as LineChartIcon,
	Sparkles,
	Target,
	Workflow,
	TrendingUp,
	Zap,
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

// Data for History section visualization
const historyTimeline = [
	{
		year: "1950s",
		title: "Birth of AI",
		detail: "Alan Turing asked 'Can machines think?' and created the Turing Test. The Perceptron was invented - the first algorithm that could learn from examples.",
		milestone: "Perceptron Algorithm",
		example: "A simple program that could learn to recognize basic patterns, like distinguishing between circles and squares."
	},
	{
		year: "1980s",
		title: "Neural Networks Return",
		detail: "Backpropagation was discovered, allowing computers to learn from their mistakes layer by layer. This was like teaching someone by showing them what they got wrong.",
		milestone: "Backpropagation",
		example: "Computers could now learn complex patterns by adjusting tiny pieces of their 'brain' step by step."
	},
	{
		year: "1990s-2000s",
		title: "Practical ML Emerges",
		detail: "New methods like Support Vector Machines and Random Forests made ML useful for real businesses. These methods were more reliable than pure neural networks.",
		milestone: "SVM & Random Forests",
		example: "Banks started using ML to detect credit card fraud, and email providers began filtering spam automatically."
	},
	{
		year: "2010s",
		title: "Deep Learning Revolution",
		detail: "Combining neural networks with powerful GPUs and huge amounts of data led to breakthroughs. Computers could now recognize images better than humans.",
		milestone: "AlexNet & Deep Learning",
		example: "In 2012, a computer won an image recognition contest by correctly identifying cats, dogs, and other objects with 85% accuracy."
	},
	{
		year: "2020s",
		title: "AI Everywhere",
		detail: "Transformers and large language models changed everything. AI can now understand and generate human language, create images, and even write code.",
		milestone: "GPT, ChatGPT, DALL-E",
		example: "AI assistants can have conversations, create artwork from descriptions, and help programmers write better code."
	},
];

// Data for Types section visualization
const mlTypesComparison = [
	{
		type: "Supervised Learning",
		hasLabels: "Yes - every example has the correct answer",
		usage: "45%",
		color: "#0ea5e9",
		whenToUse: "When you know what you want to predict",
		examples: [
			"Predicting house prices (you have past sale prices)",
			"Detecting spam emails (you have labeled spam/not spam)",
			"Diagnosing diseases (you have patient records with diagnoses)"
		]
	},
	{
		type: "Unsupervised Learning",
		hasLabels: "No - data has no labels",
		usage: "25%",
		color: "#22c55e",
		whenToUse: "When you want to discover hidden patterns",
		examples: [
			"Grouping customers by shopping behavior",
			"Finding unusual transactions (fraud detection)",
			"Organizing documents by topic without reading them all"
		]
	},
	{
		type: "Reinforcement Learning",
		hasLabels: "Reward signals - told if action was good/bad",
		usage: "18%",
		color: "#f59e0b",
		whenToUse: "When learning through trial and error",
		examples: [
			"Training robots to walk (reward for staying upright)",
			"Game AI (reward for winning)",
			"Self-driving cars (reward for safe driving)"
		]
	},
	{
		type: "Semi-supervised",
		hasLabels: "Partially - few labels + lots unlabeled",
		usage: "12%",
		color: "#8b5cf6",
		whenToUse: "When labeling is expensive but you have lots of data",
		examples: [
			"Medical imaging (few expert diagnoses available)",
			"Speech recognition (expensive to transcribe all audio)",
			"Product categorization (few manual labels)"
		]
	}
];

// Bias-Variance visualization data
const biasVarianceData = [
	{ complexity: 1, bias: 85, variance: 10, totalError: 95, label: "Too Simple" },
	{ complexity: 2, bias: 70, variance: 15, totalError: 85, label: "Still Underfit" },
	{ complexity: 3, bias: 55, variance: 22, totalError: 77, label: "Getting Better" },
	{ complexity: 4, bias: 40, variance: 30, totalError: 70, label: "Good Balance" },
	{ complexity: 5, bias: 28, variance: 42, totalError: 70, label: "Sweet Spot" },
	{ complexity: 6, bias: 18, variance: 58, totalError: 76, label: "Starting to Overfit" },
	{ complexity: 7, bias: 12, variance: 75, totalError: 87, label: "Overfitting" },
	{ complexity: 8, bias: 8, variance: 92, totalError: 100, label: "Too Complex" },
];

const evaluationMetricsData = [
	{ metric: "Accuracy", value: 88, when: "Balanced datasets" },
	{ metric: "Precision", value: 90, when: "Minimize false positives" },
	{ metric: "Recall", value: 86, when: "Minimize false negatives" },
	{ metric: "F1 Score", value: 88, when: "Balance precision and recall" },
	{ metric: "AUC-ROC", value: 92, when: "Compare ranking quality" },
];

const industryAdoptionData = [
	{ industry: "Tech", adoption: 95, impact: 94 },
	{ industry: "Finance", adoption: 88, impact: 90 },
	{ industry: "Healthcare", adoption: 82, impact: 91 },
	{ industry: "Retail", adoption: 85, impact: 84 },
	{ industry: "Manufacturing", adoption: 78, impact: 83 },
	{ industry: "Education", adoption: 72, impact: 80 },
];

function SectionContainer({
	id,
	index,
	title,
	icon: Icon,
	children,
}: {
	id: SectionId;
	index: number;
	title: string;
	icon: LucideIcon;
	children: React.ReactNode;
}) {
	const sectionThemes: Record<SectionId, {
		shell: string;
		iconWrap: string;
		iconText: string;
		sectionText: string;
	}> = {
		history: {
			shell: "border-sky-500/35 shadow-[0_24px_60px_-30px_rgba(56,189,248,0.45)]",
			iconWrap: "bg-sky-500/20",
			iconText: "text-sky-300",
			sectionText: "text-sky-300",
		},
		"why-ml": {
			shell: "border-rose-500/35 shadow-[0_24px_60px_-30px_rgba(244,63,94,0.4)]",
			iconWrap: "bg-rose-500/20",
			iconText: "text-rose-300",
			sectionText: "text-rose-300",
		},
		types: {
			shell: "border-violet-500/35 shadow-[0_24px_60px_-30px_rgba(139,92,246,0.42)]",
			iconWrap: "bg-violet-500/20",
			iconText: "text-violet-300",
			sectionText: "text-violet-300",
		},
		"data-preprocessing": {
			shell: "border-emerald-500/35 shadow-[0_24px_60px_-30px_rgba(16,185,129,0.42)]",
			iconWrap: "bg-emerald-500/20",
			iconText: "text-emerald-300",
			sectionText: "text-emerald-300",
		},
		"model-building": {
			shell: "border-amber-500/35 shadow-[0_24px_60px_-30px_rgba(245,158,11,0.42)]",
			iconWrap: "bg-amber-500/20",
			iconText: "text-amber-300",
			sectionText: "text-amber-300",
		},
		"training-prediction": {
			shell: "border-fuchsia-500/35 shadow-[0_24px_60px_-30px_rgba(217,70,239,0.42)]",
			iconWrap: "bg-fuchsia-500/20",
			iconText: "text-fuchsia-300",
			sectionText: "text-fuchsia-300",
		},
		"evaluation-metrics": {
			shell: "border-cyan-500/35 shadow-[0_24px_60px_-30px_rgba(6,182,212,0.42)]",
			iconWrap: "bg-cyan-500/20",
			iconText: "text-cyan-300",
			sectionText: "text-cyan-300",
		},
		"real-world": {
			shell: "border-indigo-500/35 shadow-[0_24px_60px_-30px_rgba(99,102,241,0.45)]",
			iconWrap: "bg-indigo-500/20",
			iconText: "text-indigo-300",
			sectionText: "text-indigo-300",
		},
	};

	const theme = sectionThemes[id];

	return (
		<motion.section
			id={id}
			data-doc-section="true"
			className={`w-full scroll-mt-24 rounded-3xl border bg-slate-900/80 p-6 backdrop-blur lg:p-10 ${theme.shell}`}
			initial={{ opacity: 0, y: 28 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: false, amount: 0.2 }}
			transition={{ duration: 0.55, ease: "easeOut" }}
			whileHover={{ y: -3 }}
		>
			<div className="flex items-center gap-4">
				<div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.iconWrap} ${theme.iconText}`}>
					<Icon className="h-6 w-6" />
				</div>
				<div>
					<p className={`text-sm font-semibold uppercase tracking-[0.16em] ${theme.sectionText}`}>
						Section {index}
					</p>
					<h2 className="text-3xl font-bold text-slate-100 lg:text-4xl">{title}</h2>
				</div>
			</div>

			{children}
		</motion.section>
	);
}

export default function MLTutorialPage() {
	const [activeSection, setActiveSection] = useState<SectionId>("history");
	const [availableSections, setAvailableSections] = useState<SectionMeta[]>(sections);

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
		const updateAvailableSections = () => {
			const nextSections = sections.filter((section) => Boolean(document.getElementById(section.id)));

			if (!nextSections.length) {
				setAvailableSections(sections);
				return;
			}

			setAvailableSections(nextSections);
			if (!nextSections.some((section) => section.id === activeSection)) {
				setActiveSection(nextSections[0].id);
			}
		};

		updateAvailableSections();
		window.addEventListener("resize", updateAvailableSections);

		return () => {
			window.removeEventListener("resize", updateAvailableSections);
		};
	}, [activeSection]);

	useEffect(() => {
		const setCurrentSectionFromScroll = () => {
			const sectionElements = availableSections
				.map((section) => document.getElementById(section.id))
				.filter((element): element is HTMLElement => Boolean(element));

			if (!sectionElements.length) {
				return;
			}

			const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
			if (atPageBottom) {
				setActiveSection(sectionElements[sectionElements.length - 1].id as SectionId);
				return;
			}

			const targetOffset = 190;
			const passedSections = sectionElements.filter(
				(sectionElement) => sectionElement.getBoundingClientRect().top <= targetOffset
			);

			const currentSection =
				passedSections.length > 0
					? passedSections[passedSections.length - 1]
					: sectionElements[0];

			setActiveSection(currentSection.id as SectionId);
		};

		let ticking = false;
		const onScrollOrResize = () => {
			if (ticking) {
				return;
			}

			ticking = true;
			requestAnimationFrame(() => {
				setCurrentSectionFromScroll();
				ticking = false;
			});
		};

		setCurrentSectionFromScroll();
		window.addEventListener("scroll", onScrollOrResize, { passive: true });
		window.addEventListener("resize", onScrollOrResize);

		return () => {
			window.removeEventListener("scroll", onScrollOrResize);
			window.removeEventListener("resize", onScrollOrResize);
		};
	}, [availableSections]);

	const scrollToSection = (id: SectionId) => {
		const target = document.getElementById(id);
		if (target) {
			setActiveSection(id);
			target.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const formatSectionNumber = (index: number) => String(index + 1).padStart(2, "0");

	const sectionMap = useMemo(() => {
		return sections.reduce<Record<SectionId, SectionMeta>>((acc, section) => {
			acc[section.id] = section;
			return acc;
		}, {} as Record<SectionId, SectionMeta>);
	}, []);

	return (
		<div className="relative min-h-screen overflow-x-hidden bg-[#060812] text-[#e6eef8]">
			<div className="pointer-events-none fixed inset-0">
				<div className="absolute inset-0 bg-gradient-to-br from-[#060812] via-[#0d0a1f] to-[#060812]" />
				<div
					className="absolute inset-0 opacity-[0.03]"
					style={{
						backgroundImage:
							"linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
						backgroundSize: "60px 60px",
					}}
				/>
				<div className="absolute left-1/4 top-1/4 h-[460px] w-[460px] rounded-full bg-violet-600/10 blur-[120px]" />
				<div className="absolute bottom-1/4 right-1/4 h-[360px] w-[360px] rounded-full bg-blue-600/10 blur-[100px]" />
				<div className="absolute right-1/4 top-1/4 h-[340px] w-[340px] rounded-full bg-amber-500/12 blur-[110px]" />
			</div>

			<header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[rgba(6,8,18,0.88)] backdrop-blur-2xl">
				<div className="mx-auto flex h-16 w-full max-w-none items-center justify-between px-4 md:px-6 xl:px-10">
					<div className="flex items-center gap-2.5">
						<Logo href="/home" size="md" showText={false} />
						<Link href="/home" className="text-xl font-bold tracking-tight text-white">
							Ownquesta
						</Link>
					</div>
					<Link
						href="/dashboard"
						className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-gradient-to-r from-amber-200 via-orange-300 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(251,191,36,0.2),0_14px_34px_rgba(251,191,36,0.28)] transition duration-200 hover:-translate-y-0.5 hover:from-amber-100 hover:via-orange-200 hover:to-fuchsia-400 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.26),0_18px_42px_rgba(251,191,36,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060812]"
					>
						<LayoutDashboard className="h-4 w-4" />
						Dashboard
					</Link>
				</div>
			</header>

			<div className="relative pt-16 lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
				<aside className="hidden border-r border-white/[0.06] bg-[rgba(6,8,18,0.7)] px-3 backdrop-blur-xl lg:sticky lg:top-16 lg:flex lg:h-[calc(100vh-4rem)] lg:items-start lg:overflow-y-auto lg:py-4">
					<nav
						aria-label="ML tutorial sections"
						className="w-full space-y-3 rounded-3xl border border-white/10 bg-[rgba(6,8,18,0.7)] p-3 shadow-[0_22px_42px_-28px_rgba(124,58,237,0.4)] backdrop-blur-xl"
					>
						{sections.map((section, index) => {
							const Icon = section.icon;
							const isActive = activeSection === section.id;
							return (
								<button
									type="button"
									key={section.id}
									onClick={() => scrollToSection(section.id)}
									aria-current={isActive ? "page" : undefined}
									className={`group relative flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ${
										isActive
											? "border-white/20 bg-white/10 text-white shadow-[0_14px_30px_-18px_rgba(124,58,237,0.7)]"
											: "border-white/10 bg-white/[0.03] text-white/75 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
									}`}
								>
									{isActive ? (
										<span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-gradient-to-b from-violet-300 to-fuchsia-300" />
									) : null}
									<span
										className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${
											isActive
												? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"
												: "border border-white/10 bg-white/[0.04] text-white/60 group-hover:bg-white/[0.08]"
										}`}
									>
										<Icon className="h-4 w-4" />
									</span>
									<div>
										<p className="text-[11px] font-semibold tracking-[0.08em] text-white/35">{formatSectionNumber(index)}</p>
										<p className="text-[15px] font-semibold leading-snug">{section.title}</p>
									</div>
								</button>
							);
						})}
					</nav>
				</aside>

				<main className="relative z-10 w-full min-w-0">
					<div className="w-full px-4 py-6 md:px-6 xl:px-10 xl:py-8">
						<div className="mb-5 overflow-x-auto pb-1 md:hidden">
							<div className="flex w-max gap-2.5 pr-2">
								{availableSections.map((section, index) => {
									const Icon = section.icon;
									const isActive = activeSection === section.id;
									return (
										<button
											key={`mobile-${section.id}`}
											onClick={() => scrollToSection(section.id)}
											className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
												isActive
													? "border-white/20 bg-white/10 text-white"
													: "border-white/10 bg-white/[0.03] text-white/75"
											}`}
										>
											<span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/80">
												<Icon className="h-3.5 w-3.5" />
											</span>
											<div>
												<p className="text-[10px] font-semibold tracking-[0.08em] text-white/35">
													{formatSectionNumber(index)}
												</p>
												<p className="whitespace-nowrap text-xs font-semibold">{section.title}</p>
											</div>
										</button>
									);
								})}
							</div>
						</div>

						{/* Introduction */}
						<motion.section
							className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_20px_55px_-35px_rgba(251,191,36,0.26)] backdrop-blur lg:p-10"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.55, ease: "easeOut" }}
						>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
								Complete Beginner's Guide
							</p>
							<h1 className="mt-3 text-4xl font-black leading-tight text-white lg:text-5xl">
								Machine Learning: From Zero to Understanding
							</h1>
							<p className="mt-4 max-w-none text-base leading-8 text-white/70 lg:text-lg">
								Welcome to the world of Machine Learning! This guide will take you from knowing nothing about ML to understanding how it works, when to use it, and how to build your first projects. Everything is explained in simple terms with real-world examples.
							</p>

							<div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
								<h3 className="text-lg font-bold text-white">What You'll Learn</h3>
								<div className="mt-4 grid gap-3 md:grid-cols-2">
									{[
										{ icon: History, text: "How ML evolved from simple rules to powerful AI" },
										{ icon: Target, text: "Why ML is better than traditional programming for certain tasks" },
										{ icon: Brain, text: "Different types of ML and when to use each" },
										{ icon: Database, text: "How to prepare data for machine learning" },
										{ icon: FlaskConical, text: "Building and choosing the right ML models" },
										{ icon: Activity, text: "Training models and avoiding common mistakes" },
										{ icon: LineChartIcon, text: "Measuring if your model actually works" },
										{ icon: Sparkles, text: "Real-world applications and best practices" },
									].map(({ icon: ItemIcon, text }, idx) => (
										<div key={idx} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
											<ItemIcon className="h-5 w-5 flex-shrink-0 text-violet-300" />
											<span className="text-sm text-white/85">{text}</span>
										</div>
									))}
								</div>
							</div>
						</motion.section>

						<div className="space-y-6">
							{/* Section 1: History */}
							<SectionContainer
								id="history"
								index={1}
								title={sectionMap.history.title}
								icon={sectionMap.history.icon}
							>
								<div className="mt-7 space-y-6">
									{/* Simple Explanation */}
									<div className="rounded-2xl border border-sky-500/35 bg-sky-950/20 p-6">
										<h3 className="text-xl font-bold text-sky-200">The Simple Story</h3>
										<p className="mt-4 text-base leading-7 text-slate-200">
											Machine Learning didn't appear overnight. It started in the 1950s when scientists wondered: "Can machines learn like humans do?" At first, computers could only follow strict rules that programmers wrote. But ML changed this - computers could now learn patterns from examples, just like how you learn to recognize faces or understand language.
										</p>
										<p className="mt-3 text-base leading-7 text-slate-200">
											Think of it like teaching a child. You don't give them a rulebook for recognizing dogs. Instead, you show them many dogs, and they learn what "dog" means. Machine Learning works the same way - we show computers many examples, and they figure out the patterns.
										</p>
									</div>

									{/* Timeline with detailed explanations */}
									<div className="space-y-4">
										<h3 className="text-xl font-bold text-slate-100">The Journey Through Time</h3>
										{historyTimeline.map((era, idx) => (
											<div
												key={era.year}
												className="rounded-xl border border-sky-500/30 bg-slate-900/70 p-5"
											>
												<div className="flex items-start gap-4">
													<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-lg font-bold text-sky-200">
														{idx + 1}
													</div>
													<div className="flex-1">
														<div className="flex items-center gap-3">
															<span className="text-sm font-bold uppercase tracking-wider text-sky-300">
																{era.year}
															</span>
															<h4 className="text-lg font-bold text-slate-100">{era.title}</h4>
														</div>
														<p className="mt-3 text-sm leading-6 text-slate-300">{era.detail}</p>
														
														<div className="mt-4 rounded-lg border border-sky-500/20 bg-sky-950/30 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-sky-300">Key Breakthrough</p>
															<p className="mt-1 text-sm font-medium text-slate-200">{era.milestone}</p>
														</div>

														<div className="mt-3 rounded-lg border border-cyan-500/20 bg-cyan-950/20 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Real Example</p>
															<p className="mt-1 text-sm text-slate-200">{era.example}</p>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>

									{/* Key Takeaways */}
									<div className="rounded-2xl border border-sky-500/30 bg-slate-950/70 p-6">
										<h3 className="text-xl font-bold text-sky-200">Key Lessons from History</h3>
										<div className="mt-4 space-y-3">
											{[
												"ML progress needed three things: smart algorithms, powerful computers, and lots of data. Missing any one of these stopped progress.",
												"Each decade solved a specific problem: 1950s proved machines could learn, 1980s figured out how to train deep networks, 2010s made it practical with GPUs.",
												"The 2012 ImageNet competition was a turning point - it proved that neural networks could beat traditional methods when given enough data and computing power.",
												"Modern ML builds on decades of research. Today's ChatGPT and image generators use ideas from every era of ML history.",
												"What seemed impossible in one decade became common in the next. This teaches us that current limitations may not last long."
											].map((point, idx) => (
												<div key={idx} className="flex gap-3 rounded-xl border border-sky-500/25 bg-slate-900/70 px-4 py-3">
													<span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-sky-500/90 text-xs font-bold text-slate-950">
														{idx + 1}
													</span>
													<p className="text-sm leading-6 text-slate-300">{point}</p>
												</div>
											))}
										</div>
									</div>

									{/* Why This Matters */}
									<div className="rounded-2xl border-2 border-sky-400/40 bg-sky-950/25 p-6">
										<div className="flex items-center gap-2">
											<Zap className="h-6 w-6 text-sky-300" />
											<h3 className="text-xl font-bold text-sky-200">Why Understanding History Matters</h3>
										</div>
										<p className="mt-4 text-base leading-7 text-sky-100">
											Knowing ML's history helps you understand that what we call "AI" today is not magic - it's the result of decades of incremental improvements. When you face a problem, you'll know which era's techniques might help. For example, if you have limited data, 1990s methods like Support Vector Machines might work better than modern deep learning. History teaches you that newer isn't always better - it depends on your specific situation.
										</p>
									</div>
								</div>
							</SectionContainer>

							{/* Section 2: Why ML */}
							<SectionContainer
								id="why-ml"
								index={2}
								title={sectionMap["why-ml"].title}
								icon={sectionMap["why-ml"].icon}
							>
								<div className="mt-7 space-y-6">
									{/* Simple Explanation */}
									<div className="rounded-2xl border border-rose-500/35 bg-rose-950/20 p-6">
										<h3 className="text-xl font-bold text-rose-200">The Core Idea</h3>
										<p className="mt-4 text-base leading-7 text-slate-200">
											Imagine you need to write a program to detect spam emails. With traditional programming, you'd write rules like: "If the email contains 'FREE MONEY' and has 10+ exclamation marks, it's spam." But what about clever spammers who write "F-R-E-E M0NEY"? You'd need to write thousands of rules for every trick spammers use.
										</p>
										<p className="mt-3 text-base leading-7 text-slate-200">
											Machine Learning takes a different approach: show the computer 10,000 examples of spam and 10,000 examples of real emails. The ML algorithm learns patterns you might never think of - like "spam emails often use ALL CAPS" or "spam comes from suspicious domains." When spammers change tactics, you just train the model on new examples rather than rewriting code.
										</p>
									</div>

									{/* Traditional vs ML Comparison */}
									<div className="grid gap-5 lg:grid-cols-2">
										<div className="rounded-2xl border border-blue-500/35 bg-blue-950/20 p-6">
											<h3 className="text-lg font-bold text-blue-200">Traditional Programming</h3>
											<div className="mt-4 space-y-3">
												<div className="rounded-lg border border-blue-500/25 bg-slate-950/60 p-4">
													<p className="text-sm font-semibold text-blue-300">How it works:</p>
													<p className="mt-2 text-sm leading-6 text-slate-300">
														Programmer writes explicit rules: IF this happens, THEN do that. The computer follows these rules exactly.
													</p>
												</div>
												<div className="rounded-lg border border-blue-500/25 bg-slate-950/60 p-4">
													<p className="text-sm font-semibold text-blue-300">Best for:</p>
													<ul className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
														<li>• Calculating taxes (rules are clear and legal)</li>
														<li>• Banking transactions (need exact control)</li>
														<li>• Traffic lights (fixed logic works best)</li>
													</ul>
												</div>
												<div className="rounded-lg border border-blue-500/25 bg-slate-950/60 p-4">
													<p className="text-sm font-semibold text-blue-300">Limitations:</p>
													<ul className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
														<li>• Can't handle unexpected situations</li>
														<li>• Breaks when rules change</li>
														<li>• Too complex when rules exceed 100+</li>
													</ul>
												</div>
											</div>
										</div>

										<div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/20 p-6">
											<h3 className="text-lg font-bold text-emerald-200">Machine Learning</h3>
											<div className="mt-4 space-y-3">
												<div className="rounded-lg border border-emerald-500/25 bg-slate-950/60 p-4">
													<p className="text-sm font-semibold text-emerald-300">How it works:</p>
													<p className="mt-2 text-sm leading-6 text-slate-300">
														Algorithm learns patterns from examples. Give it data, it figures out the rules automatically.
													</p>
												</div>
												<div className="rounded-lg border border-emerald-500/25 bg-slate-950/60 p-4">
													<p className="text-sm font-semibold text-emerald-300">Best for:</p>
													<ul className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
														<li>• Image recognition (too complex for rules)</li>
														<li>• Speech understanding (patterns vary greatly)</li>
														<li>• Recommendation systems (personalized)</li>
													</ul>
												</div>
												<div className="rounded-lg border border-emerald-500/25 bg-slate-950/60 p-4">
													<p className="text-sm font-semibold text-emerald-300">Limitations:</p>
													<ul className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
														<li>• Needs lots of good quality data</li>
														<li>• Can be hard to explain why it decided something</li>
														<li>• May fail in unexpected ways</li>
													</ul>
												</div>
											</div>
										</div>
									</div>

									{/* Real World Examples */}
									<div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
										<h3 className="text-xl font-bold text-slate-100">When ML Wins: Real Examples</h3>
										<div className="mt-4 grid gap-4 md:grid-cols-2">
											{[
												{
													title: "Email Spam Filtering",
													before: "Traditional: Write rules for every spam trick. Update code monthly when spammers adapt.",
													after: "ML: Train on examples. Automatically adapts to new spam patterns without code changes.",
													improvement: "99% accuracy vs 80% with rules"
												},
												{
													title: "Photo Tagging",
													before: "Traditional: Impossible to write rules for 'what is a cat' that work for all cat photos.",
													after: "ML: Show 10,000 cat photos. The model learns patterns like fur, ears, whiskers, eyes.",
													improvement: "Facebook tags billions of photos automatically"
												},
												{
													title: "Voice Assistants",
													before: "Traditional: Can't handle accents, background noise, or natural speech variations.",
													after: "ML: Learns from millions of voice recordings. Understands different accents and contexts.",
													improvement: "Siri, Alexa work for most people"
												},
												{
													title: "Fraud Detection",
													before: "Traditional: Rules like 'flag purchases over $1000.' Fraudsters quickly learn the limits.",
													after: "ML: Learns normal behavior per user. Detects unusual patterns even if they're subtle.",
													improvement: "Catches 60% more fraud cases"
												}
											].map((example, idx) => (
												<div key={idx} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
													<h4 className="font-bold text-amber-300">{example.title}</h4>
													<div className="mt-3 space-y-2">
														<div className="rounded bg-red-950/40 px-3 py-2">
															<p className="text-xs font-semibold text-red-300">❌ Old Way</p>
															<p className="mt-1 text-xs leading-5 text-slate-300">{example.before}</p>
														</div>
														<div className="rounded bg-emerald-950/40 px-3 py-2">
															<p className="text-xs font-semibold text-emerald-300">✅ ML Way</p>
															<p className="mt-1 text-xs leading-5 text-slate-300">{example.after}</p>
														</div>
														<div className="rounded bg-blue-950/40 px-3 py-2">
															<p className="text-xs font-bold text-blue-300">Result: {example.improvement}</p>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Decision Guide */}
									<div className="rounded-2xl border border-amber-500/35 bg-amber-950/20 p-6">
										<h3 className="text-xl font-bold text-amber-200">Should You Use ML? Ask These Questions</h3>
										<div className="mt-4 space-y-3">
											{[
												{ q: "Do you have data with examples?", yes: "ML might work", no: "Use traditional programming" },
												{ q: "Are the rules complex or unclear?", yes: "ML is better", no: "Simple rules might suffice" },
												{ q: "Does the pattern change over time?", yes: "ML adapts automatically", no: "Fixed rules work fine" },
												{ q: "Do you need to explain every decision?", yes: "Traditional or simple ML", no: "Can use complex ML" },
												{ q: "Is 100% accuracy critical?", yes: "Be very careful with ML", no: "ML is great" }
											].map((item, idx) => (
												<div key={idx} className="rounded-xl border border-amber-500/25 bg-slate-900/70 p-4">
													<p className="font-semibold text-amber-200">{item.q}</p>
													<div className="mt-2 flex gap-3">
														<span className="text-sm text-emerald-300">✓ Yes: {item.yes}</span>
														<span className="text-sm text-rose-300">✗ No: {item.no}</span>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Key Takeaway */}
									<div className="rounded-2xl border-2 border-rose-400/40 bg-rose-950/25 p-6">
										<div className="flex items-center gap-2">
											<Zap className="h-6 w-6 text-rose-300" />
											<h3 className="text-xl font-bold text-rose-200">The Bottom Line</h3>
										</div>
										<p className="mt-4 text-base leading-7 text-rose-100">
											Machine Learning isn't magic and isn't always the answer. Use it when patterns are complex, data is available, and adaptability matters more than perfect explainability. For simple, stable problems with clear rules, traditional programming is often better, faster, and more reliable. The best systems often combine both: ML for pattern recognition, rules for critical decisions.
										</p>
									</div>
								</div>
							</SectionContainer>

							{/* Section 3: Types of ML */}
							<SectionContainer
								id="types"
								index={3}
								title={sectionMap.types.title}
								icon={sectionMap.types.icon}
							>
								<div className="mt-7 space-y-6">
									{/* Simple Explanation */}
									<div className="rounded-2xl border border-violet-500/35 bg-violet-950/20 p-6">
										<h3 className="text-xl font-bold text-violet-200">Understanding ML Types Through Examples</h3>
										<p className="mt-4 text-base leading-7 text-slate-200">
											Machine Learning has different "types" based on what kind of data you have and what you're trying to achieve. Think of it like different teaching methods:
										</p>
										<ul className="mt-3 space-y-2 text-base leading-7 text-slate-200">
											<li className="flex gap-3">
												<span className="text-violet-300">•</span>
												<span><strong className="text-violet-300">Supervised Learning</strong> is like learning with an answer key - every practice problem has the correct answer shown.</span>
											</li>
											<li className="flex gap-3">
												<span className="text-violet-300">•</span>
												<span><strong className="text-violet-300">Unsupervised Learning</strong> is like being given data and asked to find patterns yourself - no answer key provided.</span>
											</li>
											<li className="flex gap-3">
												<span className="text-violet-300">•</span>
												<span><strong className="text-violet-300">Reinforcement Learning</strong> is like learning to play a game - you try actions and get rewarded or punished based on results.</span>
											</li>
										</ul>
									</div>

									{/* Detailed breakdown of each type */}
									{mlTypesComparison.map((mlType, idx) => (
										<div key={mlType.type} className="rounded-2xl border border-violet-500/30 bg-slate-900/70 p-6">
											<div className="flex items-start gap-4">
												<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${mlType.color}33` }}>
													<span className="text-lg font-bold" style={{ color: mlType.color }}>{idx + 1}</span>
												</div>
												<div className="flex-1">
													<h4 className="text-xl font-bold text-slate-100">{mlType.type}</h4>
													
													<div className="mt-4 grid gap-4 md:grid-cols-2">
														<div className="rounded-lg border border-violet-500/25 bg-slate-950/60 p-4">
															<p className="text-xs font-bold uppercase tracking-wider text-violet-300">Data Format</p>
															<p className="mt-2 text-sm leading-6 text-slate-200">{mlType.hasLabels}</p>
														</div>
														<div className="rounded-lg border border-violet-500/25 bg-slate-950/60 p-4">
															<p className="text-xs font-bold uppercase tracking-wider text-violet-300">When to Use</p>
															<p className="mt-2 text-sm leading-6 text-slate-200">{mlType.whenToUse}</p>
														</div>
													</div>

													<div className="mt-4 rounded-lg border border-fuchsia-500/25 bg-fuchsia-950/20 p-4">
														<p className="text-xs font-bold uppercase tracking-wider text-fuchsia-300">Real-World Examples</p>
														<ul className="mt-2 space-y-2">
															{mlType.examples.map((example, exIdx) => (
																<li key={exIdx} className="flex gap-2 text-sm leading-6 text-slate-200">
																	<span className="text-fuchsia-400">•</span>
																	<span>{example}</span>
																</li>
															))}
														</ul>
													</div>

													{/* Beginner explanation for each type */}
													{mlType.type === "Supervised Learning" && (
														<div className="mt-4 rounded-lg border border-blue-500/25 bg-blue-950/20 p-4">
															<p className="text-xs font-bold uppercase tracking-wider text-blue-300">Beginner's Guide</p>
															<p className="mt-2 text-sm leading-6 text-slate-200">
																Supervised learning is the most common and easiest to understand. You have historical data where you know the correct answer. For example, you have 1000 house records with features (size, location, age) and their actual sale prices. The ML algorithm learns the relationship between features and price, so it can predict prices for new houses.
															</p>
															<p className="mt-2 text-sm font-semibold text-blue-200">
																Think of it as: "Here are the questions AND answers. Learn the pattern so you can answer new questions."
															</p>
														</div>
													)}

													{mlType.type === "Unsupervised Learning" && (
														<div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-950/20 p-4">
															<p className="text-xs font-bold uppercase tracking-wider text-emerald-300">Beginner's Guide</p>
															<p className="mt-2 text-sm leading-6 text-slate-200">
																Unsupervised learning finds hidden patterns in data without being told what to look for. For example, a store has purchase data but doesn't know which customer groups exist. Unsupervised learning can discover "budget shoppers," "luxury buyers," "health-conscious buyers" automatically by finding patterns in purchase behavior.
															</p>
															<p className="mt-2 text-sm font-semibold text-emerald-200">
																Think of it as: "Here's data. Find interesting patterns or groups that I didn't know existed."
															</p>
														</div>
													)}

													{mlType.type === "Reinforcement Learning" && (
														<div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-950/20 p-4">
															<p className="text-xs font-bold uppercase tracking-wider text-amber-300">Beginner's Guide</p>
															<p className="mt-2 text-sm leading-6 text-slate-200">
																Reinforcement learning learns through trial and error with rewards. Imagine teaching a robot to walk: it tries moving its legs, falls down (negative reward), tries differently, takes a step (positive reward), and gradually learns to walk by maximizing rewards. This is how game AI learns to play chess or how self-driving cars learn to navigate.
															</p>
															<p className="mt-2 text-sm font-semibold text-amber-200">
																Think of it as: "Try different actions, see what happens, and learn from rewards and punishments."
															</p>
														</div>
													)}

													{mlType.type === "Semi-supervised" && (
														<div className="mt-4 rounded-lg border border-purple-500/25 bg-purple-950/20 p-4">
															<p className="text-xs font-bold uppercase tracking-wider text-purple-300">Beginner's Guide</p>
															<p className="mt-2 text-sm leading-6 text-slate-200">
																Semi-supervised learning combines both approaches. You have a small amount of labeled data (expensive to get) and a large amount of unlabeled data (cheap to collect). The algorithm uses the labeled data to learn initial patterns, then applies those patterns to find structure in the unlabeled data, gradually improving its understanding.
															</p>
															<p className="mt-2 text-sm font-semibold text-purple-200">
																Think of it as: "I have a few answered questions and many unanswered ones. Use the answers to make educated guesses about the rest."
															</p>
														</div>
													)}
												</div>
											</div>
										</div>
									))}

									{/* Comparison visualization */}
									<div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/45 p-5">
										<h3 className="text-xl font-bold text-violet-100">Quick Comparison: Which Type Should You Use?</h3>
										<div className="mt-5 h-80 rounded-xl border border-slate-200 bg-white p-4">
											<ResponsiveContainer width="100%" height="100%">
												<PieChart>
													<Pie
														data={mlTypesComparison.map(t => ({ name: t.type, value: parseInt(t.usage) }))}
														dataKey="value"
														nameKey="name"
														cx="50%"
														cy="50%"
														outerRadius={100}
														label={(entry) => `${entry.name}: ${entry.value}%`}
														labelLine={true}
													>
														{mlTypesComparison.map((entry, index) => (
															<Cell key={`cell-${index}`} fill={entry.color} />
														))}
													</Pie>
													<Tooltip />
													<Legend />
												</PieChart>
											</ResponsiveContainer>
										</div>
										<p className="mt-3 text-center text-sm text-violet-200">
											Usage distribution in production ML systems worldwide
										</p>
									</div>

									{/* Decision flowchart in text */}
									<div className="rounded-2xl border border-violet-500/30 bg-slate-950/70 p-6">
										<h3 className="text-xl font-bold text-violet-200">Decision Guide: Choosing Your ML Type</h3>
										<div className="mt-4 space-y-4">
											<div className="flex items-start gap-3">
												<span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/90 text-sm font-bold text-slate-950">1</span>
												<div className="flex-1">
													<p className="font-semibold text-slate-100">Do you have labeled data (examples with correct answers)?</p>
													<p className="mt-1 text-sm text-emerald-300">✓ YES → Use <strong>Supervised Learning</strong></p>
													<p className="mt-1 text-sm text-slate-400">✗ NO → Continue to question 2</p>
												</div>
											</div>

											<div className="flex items-start gap-3">
												<span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/90 text-sm font-bold text-slate-950">2</span>
												<div className="flex-1">
													<p className="font-semibold text-slate-100">Do you want to discover patterns/groups in your data?</p>
													<p className="mt-1 text-sm text-emerald-300">✓ YES → Use <strong>Unsupervised Learning</strong></p>
													<p className="mt-1 text-sm text-slate-400">✗ NO → Continue to question 3</p>
												</div>
											</div>

											<div className="flex items-start gap-3">
												<span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/90 text-sm font-bold text-slate-950">3</span>
												<div className="flex-1">
													<p className="font-semibold text-slate-100">Are you making sequential decisions where each action affects future options?</p>
													<p className="mt-1 text-sm text-emerald-300">✓ YES → Use <strong>Reinforcement Learning</strong></p>
													<p className="mt-1 text-sm text-slate-400">✗ NO → Continue to question 4</p>
												</div>
											</div>

											<div className="flex items-start gap-3">
												<span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/90 text-sm font-bold text-slate-950">4</span>
												<div className="flex-1">
													<p className="font-semibold text-slate-100">Do you have some labeled data but labeling more is expensive?</p>
													<p className="mt-1 text-sm text-emerald-300">✓ YES → Use <strong>Semi-supervised Learning</strong></p>
												</div>
											</div>
										</div>
									</div>

									{/* Key Takeaway */}
									<div className="rounded-2xl border-2 border-violet-400/40 bg-violet-950/25 p-6">
										<div className="flex items-center gap-2">
											<Zap className="h-6 w-6 text-violet-300" />
											<h3 className="text-xl font-bold text-violet-200">What Beginners Need to Remember</h3>
										</div>
										<div className="mt-4 space-y-3 text-base leading-7 text-violet-100">
											<p>
												<strong>Start with Supervised Learning:</strong> It's the easiest to understand and most commonly used. If you have historical data with known outcomes (sales figures, past diagnoses, labeled images), supervised learning is your starting point.
											</p>
											<p>
												<strong>Most Real Projects Combine Types:</strong> A complete system might use unsupervised learning to clean and group data, supervised learning to make predictions, and reinforcement learning to optimize sequential decisions. Don't feel locked into one type.
											</p>
											<p>
												<strong>The Type Matters Less Than the Problem:</strong> Understanding your problem clearly is more important than memorizing types. Once you know what you're trying to achieve and what data you have, the right type becomes obvious.
											</p>
										</div>
									</div>
								</div>
							</SectionContainer>

							{/* Section 4: Data Preprocessing */}
							<SectionContainer
								id="data-preprocessing"
								index={4}
								title={sectionMap["data-preprocessing"].title}
								icon={sectionMap["data-preprocessing"].icon}
							>
								<div className="mt-7 space-y-6">
									{/* Simple Explanation */}
									<div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/20 p-6">
										<h3 className="text-xl font-bold text-emerald-200">Why Data Preparation Matters Most</h3>
										<p className="mt-4 text-base leading-7 text-slate-200">
											Here's the truth that surprises most beginners: in real ML projects, you'll spend 60-80% of your time preparing data, not building fancy algorithms. Raw data from the real world is messy - it has missing values, errors, inconsistencies, and needs to be transformed before any ML algorithm can use it.
										</p>
										<p className="mt-3 text-base leading-7 text-slate-200">
											Think of it like cooking: you can't make a great meal without washing vegetables, cutting meat, and measuring ingredients first. Similarly, you can't build a good ML model without cleaning, organizing, and formatting your data properly. <strong className="text-emerald-300">Good data preparation can improve your model's accuracy by 20-30% or more!</strong>
										</p>
									</div>

									{/* Step-by-step preprocessing pipeline */}
									<div className="space-y-4">
										<h3 className="text-xl font-bold text-slate-100">The Complete Data Preparation Process</h3>
										
										{[
											{
												step: "Data Collection",
												color: "emerald",
												badgeClass: "bg-emerald-500/20 text-emerald-300",
												description: "Gather data from all relevant sources. This could be databases, CSV files, APIs, web scraping, or sensors.",
												example: "For a house price predictor, collect data on past sales: address, size, bedrooms, bathrooms, sale price, sale date.",
												tips: [
													"More data is usually better, but quality beats quantity",
													"Make sure your data represents what you'll see in production",
													"Document where each piece of data came from"
												],
												beginner: "Start small! Get 100-1000 examples working perfectly before scaling to millions."
											},
											{
												step: "Initial Exploration",
												color: "teal",
												badgeClass: "bg-teal-500/20 text-teal-300",
												description: "Look at your data to understand what you're working with. Check data types, ranges, and distributions.",
												example: "Look at the first 10 rows. Check if prices range from $50K to $5M, sizes from 500 to 5000 sqft. Are there any weird values like negative prices or 0 bedrooms?",
												tips: [
													"Plot histograms to see value distributions",
													"Check for outliers (extremely high/low values)",
													"Look for missing values in each column"
												],
												beginner: "Use pandas.describe() and pandas.info() to get a quick overview. This shows you min, max, mean, and missing counts."
											},
											{
												step: "Handle Missing Data",
												color: "cyan",
												badgeClass: "bg-cyan-500/20 text-cyan-300",
												description: "Real-world data always has missing values. You need to decide what to do with them.",
												example: "20% of houses don't have 'year renovated' recorded. Option 1: Fill with 0 (meaning never renovated). Option 2: Fill with original build year. Option 3: Remove those houses from data.",
												tips: [
													"If <5% missing: safe to remove those rows",
													"If >5% missing: fill with mean, median, or mode",
													"For important features: use advanced imputation methods"
												],
												beginner: "For numbers: use median (middle value). For categories: use mode (most common). Don't guess randomly!"
											},
											{
												step: "Remove or Fix Outliers",
												color: "blue",
												badgeClass: "bg-blue-500/20 text-blue-300",
												description: "Outliers are extreme values that could be errors or genuine rare cases.",
												example: "You find a house listed as $50 (probably missing zeros) and another at $50 million (genuine mansion). The $50 is an error - fix it or remove it. The mansion is real - keep it.",
												tips: [
													"Use domain knowledge: is this value possible?",
													"Box plots help visualize outliers",
													"Don't automatically remove all outliers - some are valuable data"
												],
												beginner: "Values more than 3 standard deviations from the mean are often outliers. But check each one before deleting!"
											},
											{
												step: "Feature Scaling",
												color: "indigo",
												badgeClass: "bg-indigo-500/20 text-indigo-300",
												description: "Put all numerical features on similar scales so larger numbers don't dominate the model.",
												example: "House size ranges 500-5000 (scale: 4500), while bedrooms range 1-5 (scale: 4). Without scaling, the model thinks size is 1000x more important!",
												tips: [
													"Standardization: mean=0, std=1 (works for most algorithms)",
													"Normalization: scale to 0-1 range (good for neural networks)",
													"Don't scale the target variable (what you're predicting)"
												],
												beginner: "Use StandardScaler from sklearn. It's the safest default choice for beginners."
											},
											{
												step: "Encode Categorical Variables",
												color: "purple",
												badgeClass: "bg-purple-500/20 text-purple-300",
												description: "ML algorithms need numbers, not text. Convert categories like 'color' or 'city' into numbers.",
												example: "House type: 'Apartment', 'House', 'Condo'. Convert to numbers: Apartment=0, House=1, Condo=2. Or use one-hot: create 3 columns (is_apartment, is_house, is_condo) with 1s and 0s.",
												tips: [
													"One-hot encoding: best when categories have no natural order",
													"Label encoding: use when categories have order (small, medium, large)",
													"Too many categories? Group rare ones into 'Other'"
												],
												beginner: "Use pd.get_dummies() for one-hot encoding. It's simple and works well for categories with <10 values."
											},
											{
												step: "Feature Engineering",
												color: "pink",
												badgeClass: "bg-pink-500/20 text-pink-300",
												description: "Create new, useful features from existing ones. This is where creativity and domain knowledge shine!",
												example: "From house data, create: house_age = current_year - year_built, price_per_sqft = price / size, has_renovation = (year_renovated > year_built).",
												tips: [
													"Combine features: ratios, differences, products",
													"Extract from dates: day of week, month, season, year",
													"Domain-specific: for houses, distance to schools matters"
												],
												beginner: "Start simple: create age from birth year, total from sum of parts, ratios between related numbers."
											},
											{
												step: "Split Data",
												color: "rose",
												badgeClass: "bg-rose-500/20 text-rose-300",
												description: "Separate your data into training, validation, and test sets. Never train and test on the same data!",
												example: "1000 houses: 700 for training (70%), 150 for validation (15%), 150 for testing (15%). Train on 700, tune on 150 validation, final test on 150 test.",
												tips: [
													"Standard split: 70% train, 15% validation, 15% test",
													"For time series: split by time, not randomly",
													"Stratify: keep same class proportions in each split"
												],
												beginner: "Use train_test_split from sklearn with test_size=0.2. That gives you 80% train, 20% test automatically."
											},
											{
												step: "Final Verification",
												color: "amber",
												badgeClass: "bg-amber-500/20 text-amber-300",
												description: "Check that preprocessing worked correctly before training any models.",
												example: "Verify: no missing values remain, all features are numeric, training and test sets have similar distributions, no data leakage from future to past.",
												tips: [
													"Print first few rows and summary statistics",
													"Check that all steps are reproducible",
													"Save your preprocessing pipeline"
												],
												beginner: "Create a checklist and tick off each item. One mistake in preprocessing can ruin your entire model!"
											}
										].map((item, idx) => (
											<div key={idx} className="rounded-xl border border-emerald-500/30 bg-slate-900/70 p-5">
												<div className="flex items-start gap-4">
													<span className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold ${item.badgeClass}`}>
														{idx + 1}
													</span>
													<div className="flex-1">
														<h4 className="text-lg font-bold text-slate-100">{item.step}</h4>
														<p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>

														<div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-950/30 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Example</p>
															<p className="mt-1 text-sm leading-6 text-slate-200">{item.example}</p>
														</div>

														<div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-950/20 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Pro Tips</p>
															<ul className="mt-2 space-y-1">
																{item.tips.map((tip, tipIdx) => (
																	<li key={tipIdx} className="flex gap-2 text-sm leading-6 text-slate-200">
																		<span className="text-blue-400">•</span>
																		<span>{tip}</span>
																	</li>
																))}
															</ul>
														</div>

														<div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-950/20 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Beginner Advice</p>
															<p className="mt-1 text-sm leading-6 text-amber-100">{item.beginner}</p>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>

									{/* Common Mistakes */}
									<div className="rounded-2xl border border-red-500/35 bg-red-950/20 p-6">
										<h3 className="text-xl font-bold text-red-200">Common Preprocessing Mistakes (And How to Avoid Them)</h3>
										<div className="mt-4 space-y-3">
											{[
												{
													mistake: "Data Leakage",
													description: "Using information from the test set during training, or using future information to predict the past.",
													example: "Scaling all data together before splitting. This lets the training set 'see' the test set's values!",
													fix: "Always split first, THEN scale. Fit the scaler on training data only, then transform both train and test."
												},
												{
													mistake: "Ignoring Missing Data Patterns",
													description: "Missing data isn't always random. Sometimes missing values themselves are informative.",
													example: "Rich people don't report income. Removing all rows with missing income removes all wealthy people from your data!",
													fix: "Before filling missing values, check if 'is_missing' is correlated with your target. If yes, keep it as a feature!"
												},
												{
													mistake: "Removing Outliers Too Aggressively",
													description: "Automatically removing all outliers can delete your most important examples.",
													example: "Fraud detection: fraudulent transactions ARE outliers. Remove them and you have nothing to learn from!",
													fix: "Understand WHY values are outliers before removing. Domain knowledge is crucial here."
												},
												{
													mistake: "Not Saving Preprocessing Steps",
													description: "You preprocess training data but forget how to preprocess new data the exact same way.",
													example: "You scaled training data but lost the mean/std values. Now you can't scale new data correctly!",
													fix: "Save your preprocessing pipeline (use joblib or pickle). Apply the SAME transformations to new data."
												}
											].map((item, idx) => (
												<div key={idx} className="rounded-xl border border-red-500/25 bg-slate-950/60 p-4">
													<div className="flex gap-2">
														<span className="text-lg">❌</span>
														<div className="flex-1">
															<p className="font-bold text-red-300">{item.mistake}</p>
															<p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
															<div className="mt-2 rounded bg-red-950/40 px-3 py-2">
																<p className="text-xs font-semibold text-red-400">Bad Example:</p>
																<p className="mt-1 text-xs text-slate-300">{item.example}</p>
															</div>
															<div className="mt-2 rounded bg-emerald-950/40 px-3 py-2">
																<p className="text-xs font-semibold text-emerald-400">How to Fix:</p>
																<p className="mt-1 text-xs text-slate-300">{item.fix}</p>
															</div>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Key Takeaway */}
									<div className="rounded-2xl border-2 border-emerald-400/40 bg-emerald-950/25 p-6">
										<div className="flex items-center gap-2">
											<Zap className="h-6 w-6 text-emerald-300" />
											<h3 className="text-xl font-bold text-emerald-200">What Every Beginner Should Remember</h3>
										</div>
										<div className="mt-4 space-y-3 text-base leading-7 text-emerald-100">
											<p>
												<strong>Data preparation isn't boring grunt work - it's where you win or lose.</strong> A simple algorithm on well-prepared data beats a sophisticated algorithm on messy data every single time. Many beginners rush to try fancy algorithms when their real problem is dirty data.
											</p>
											<p>
												<strong>Follow this order religiously:</strong> Collect → Explore → Clean → Scale → Encode → Engineer → Split → Verify. Skipping steps or doing them in the wrong order leads to bugs that are nearly impossible to find later.
											</p>
											<p>
												<strong>Document everything you do.</strong> Write down which columns you removed, how you filled missing values, what scaling you used. Six months later, when you need to update the model, you'll thank yourself. Use version control for your preprocessing code!
											</p>
											<p>
												<strong>Start simple, then iterate.</strong> Don't try to build the perfect preprocessing pipeline on day one. Get a basic version working end-to-end, then gradually improve each step. This helps you learn what matters most for YOUR specific data.
											</p>
										</div>
									</div>
								</div>
							</SectionContainer>

							{/* Section 5: Model Building */}
							<SectionContainer
								id="model-building"
								index={5}
								title={sectionMap["model-building"].title}
								icon={sectionMap["model-building"].icon}
							>
								<div className="mt-7 space-y-6">
									{/* Simple Explanation */}
									<div className="rounded-2xl border border-amber-500/35 bg-amber-950/20 p-6">
										<h3 className="text-xl font-bold text-amber-200">Choosing the Right Model: The Foundation</h3>
										<p className="mt-4 text-base leading-7 text-slate-200">
											After preparing your data, you need to choose which ML algorithm to use. This is like choosing the right tool: you could use a hammer for everything, but a screwdriver works better for screws! Different algorithms are designed for different types of problems.
										</p>
										<p className="mt-3 text-base leading-7 text-slate-200">
											The good news? You don't need to understand complex math to choose wisely. You just need to ask yourself three questions: <strong className="text-amber-300">(1) What am I trying to predict?</strong> <strong className="text-amber-300">(2) How much data do I have?</strong> <strong className="text-amber-300">(3) Do I need to explain the model's decisions?</strong>
										</p>
									</div>

									{/* Problem type guide */}
									<div className="space-y-4">
										<h3 className="text-xl font-bold text-slate-100">Step 1: Match Your Problem to a Model Family</h3>
										
										{[
											{
												family: "Regression Models",
												icon: "📈",
												color: "blue",
												use: "Predicting numbers (prices, temperatures, sales)",
												goodFor: [
													"House price prediction",
													"Stock price forecasting",
													"Sales revenue estimation",
													"Temperature prediction",
													"Age estimation from photos"
												],
												algorithms: [
													{ name: "Linear Regression", when: "Start here! Simple, fast, interpretable. Works when relationship is roughly linear.", difficulty: "Easiest" },
													{ name: "Ridge/Lasso", when: "Use when you have many features. Prevents overfitting better than plain linear regression.", difficulty: "Easy" },
													{ name: "Random Forest Regressor", when: "When relationships are complex and non-linear. Handles any type of data automatically.", difficulty: "Medium" },
													{ name: "XGBoost/LightGBM", when: "When you need the best accuracy and have time to tune hyperparameters. Often wins competitions.", difficulty: "Medium-Hard" }
												],
												tip: "Always start with Linear Regression as your baseline. If it performs badly, move to more complex models."
											},
											{
												family: "Classification Models",
												icon: "🎯",
												color: "emerald",
												use: "Predicting categories (spam/not spam, disease/healthy)",
												goodFor: [
													"Email spam detection",
													"Customer churn prediction",
													"Fraud detection",
													"Image classification",
													"Sentiment analysis (positive/negative/neutral)"
												],
												algorithms: [
													{ name: "Logistic Regression", when: "Start here for binary classification (yes/no). Fast and interpretable.", difficulty: "Easiest" },
													{ name: "Decision Tree", when: "When you need to explain every decision. Creates a flowchart anyone can follow.", difficulty: "Easy" },
													{ name: "Random Forest", when: "Your default choice. Handles most problems well without much tuning.", difficulty: "Medium" },
													{ name: "XGBoost", when: "When accuracy is critical. Wins most Kaggle competitions for tabular data.", difficulty: "Medium-Hard" },
													{ name: "Neural Networks", when: "For images, text, or audio. Needs lots of data (1000s of examples minimum).", difficulty: "Hard" }
												],
												tip: "For imbalanced data (like fraud: 99% normal, 1% fraud), regular accuracy is misleading. Use precision, recall, and F1 score instead."
											},
											{
												family: "Clustering Models",
												icon: "🔍",
												color: "purple",
												use: "Finding groups in data without labels",
												goodFor: [
													"Customer segmentation",
													"Document organization",
													"Anomaly detection",
													"Gene sequence grouping",
													"Image compression"
												],
												algorithms: [
													{ name: "K-Means", when: "Start here. Fast and simple. You need to specify number of groups.", difficulty: "Easiest" },
													{ name: "DBSCAN", when: "When you don't know how many groups exist. Finds clusters of arbitrary shapes.", difficulty: "Medium" },
													{ name: "Hierarchical Clustering", when: "When you want to see how groups relate to each other at different levels.", difficulty: "Medium" }
												],
												tip: "Clustering is subjective. There's no 'right' answer. Validate clusters by checking if they make business sense."
											},
											{
												family: "Neural Networks",
												icon: "🧠",
												color: "indigo",
												use: "Complex patterns in images, text, and audio",
												goodFor: [
													"Image recognition",
													"Natural language processing",
													"Speech recognition",
													"Game playing AI",
													"Generative AI (creating images/text)"
												],
												algorithms: [
													{ name: "Multilayer Perceptron (MLP)", when: "For tabular data when Random Forest doesn't work well. Start simple: 2-3 layers.", difficulty: "Medium-Hard" },
													{ name: "Convolutional Neural Network (CNN)", when: "For any image-related task. Automatically learns visual features.", difficulty: "Hard" },
													{ name: "Recurrent Neural Network (RNN/LSTM)", when: "For sequences: text, time series, audio. Remembers past information.", difficulty: "Hard" },
													{ name: "Transformer", when: "State-of-the-art for text (GPT, BERT). Requires significant compute and data.", difficulty: "Very Hard" }
												],
												tip: "Neural networks need lots of data (10,000+ examples) and computing power. Start with simpler models first!"
											}
										].map((family, idx) => (
											<div key={idx} className="rounded-xl border border-amber-500/30 bg-slate-900/70 p-5">
												<div className="flex items-start gap-4">
													<span className="text-4xl">{family.icon}</span>
													<div className="flex-1">
														<h4 className="text-xl font-bold text-slate-100">{family.family}</h4>
														<p className="mt-2 text-sm font-semibold text-amber-300">Use for: {family.use}</p>

														<div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-950/20 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Perfect For</p>
															<ul className="mt-2 space-y-1">
																{family.goodFor.map((item, itemIdx) => (
																	<li key={itemIdx} className="flex gap-2 text-sm text-slate-200">
																		<span className="text-emerald-400">✓</span>
																		<span>{item}</span>
																	</li>
																))}
															</ul>
														</div>

														<div className="mt-4 space-y-2">
															<p className="text-sm font-bold text-slate-100">Algorithm Options (from simple to complex):</p>
															{family.algorithms.map((algo, algoIdx) => (
																<div key={algoIdx} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
																	<div className="flex items-start justify-between gap-3">
																		<div className="flex-1">
																			<p className="font-semibold text-blue-300">{algo.name}</p>
																			<p className="mt-1 text-xs leading-5 text-slate-300">{algo.when}</p>
																		</div>
																		<span className={`rounded px-2 py-1 text-xs font-bold ${
																			algo.difficulty === "Easiest" ? "bg-emerald-500/20 text-emerald-300" :
																			algo.difficulty === "Easy" ? "bg-green-500/20 text-green-300" :
																			algo.difficulty === "Medium" ? "bg-amber-500/20 text-amber-300" :
																			algo.difficulty === "Medium-Hard" ? "bg-orange-500/20 text-orange-300" :
																			algo.difficulty === "Hard" ? "bg-red-500/20 text-red-300" :
																			"bg-rose-500/20 text-rose-300"
																		}`}>
																			{algo.difficulty}
																		</span>
																	</div>
																</div>
															))}
														</div>

														<div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-950/20 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-amber-300">Pro Tip</p>
															<p className="mt-1 text-sm text-amber-100">{family.tip}</p>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>

									{/* Beginner's model selection flowchart */}
									<div className="rounded-2xl border border-amber-500/30 bg-slate-950/70 p-6">
										<h3 className="text-xl font-bold text-amber-200">Beginner's Quick Selection Guide</h3>
										<div className="mt-4 space-y-4">
											<div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
												<p className="font-bold text-slate-100">If you're predicting a NUMBER (price, temperature, count):</p>
												<ol className="mt-3 space-y-2 pl-5 text-sm text-slate-300">
													<li className="list-decimal">Start with <span className="font-semibold text-blue-300">Linear Regression</span></li>
													<li className="list-decimal">If accuracy is poor, try <span className="font-semibold text-blue-300">Random Forest Regressor</span></li>
													<li className="list-decimal">If you need maximum accuracy, use <span className="font-semibold text-blue-300">XGBoost</span></li>
												</ol>
											</div>

											<div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
												<p className="font-bold text-slate-100">If you're predicting a CATEGORY (spam/not, yes/no, type A/B/C):</p>
												<ol className="mt-3 space-y-2 pl-5 text-sm text-slate-300">
													<li className="list-decimal">Start with <span className="font-semibold text-emerald-300">Logistic Regression</span> (for 2 categories) or <span className="font-semibold text-emerald-300">Decision Tree</span></li>
													<li className="list-decimal">If accuracy is poor, try <span className="font-semibold text-emerald-300">Random Forest</span></li>
													<li className="list-decimal">For images/text, use <span className="font-semibold text-emerald-300">Neural Networks (CNN/RNN)</span></li>
												</ol>
											</div>

											<div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
												<p className="font-bold text-slate-100">If you want to FIND GROUPS in unlabeled data:</p>
												<ol className="mt-3 space-y-2 pl-5 text-sm text-slate-300">
													<li className="list-decimal">Start with <span className="font-semibold text-purple-300">K-Means</span> (you need to guess number of groups)</li>
													<li className="list-decimal">If you don't know how many groups, try <span className="font-semibold text-purple-300">DBSCAN</span></li>
												</ol>
											</div>
										</div>
									</div>

									{/* Things to consider */}
									<div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6">
										<h3 className="text-xl font-bold text-slate-100">Other Important Considerations</h3>
										<div className="mt-4 grid gap-4 md:grid-cols-2">
											{[
												{
													factor: "Interpretability",
													question: "Do you need to explain WHY the model made a decision?",
													high: "Use: Linear Regression, Logistic Regression, Decision Trees",
													low: "Can use: Random Forest, Neural Networks (black boxes)"
												},
												{
													factor: "Data Size",
													question: "How many training examples do you have?",
													high: "<1000 examples: Simple models (Linear, Logistic) work best",
													low: "1000-100K: Random Forest, XGBoost shine | 100K+: Neural Networks become viable"
												},
												{
													factor: "Training Time",
													question: "How fast do you need to train the model?",
													high: "Fast (<1 min): Linear models, Decision Trees",
													low: "Slow (hours): Neural Networks, especially deep ones"
												},
												{
													factor: "Prediction Speed",
													question: "How fast must the model make predictions?",
													high: "Real-time (<1ms): Linear models, small Decision Trees",
													low: "Batch (seconds OK): Random Forests, Neural Networks"
												}
											].map((item, idx) => (
												<div key={idx} className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
													<h4 className="font-bold text-amber-300">{item.factor}</h4>
													<p className="mt-2 text-sm italic text-slate-400">{item.question}</p>
													<div className="mt-3 space-y-2 text-xs">
														<div className="rounded bg-emerald-950/40 p-2">
															<p className="text-emerald-200">{item.high}</p>
														</div>
														<div className="rounded bg-blue-950/40 p-2">
															<p className="text-blue-200">{item.low}</p>
														</div>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Key Takeaway */}
									<div className="rounded-2xl border-2 border-amber-400/40 bg-amber-950/25 p-6">
										<div className="flex items-center gap-2">
											<Zap className="h-6 w-6 text-amber-300" />
											<h3 className="text-xl font-bold text-amber-200">The Most Important Rule for Beginners</h3>
										</div>
										<div className="mt-4 space-y-3 text-base leading-7 text-amber-100">
											<p>
												<strong>Always start simple!</strong> Many beginners jump straight to neural networks because they sound cool. But simple models like Linear Regression or Random Forest often work just as well (or better!) with less effort, less data, and faster training.
											</p>
											<p>
												<strong>The "ladder of complexity" strategy:</strong> Start with the simplest model that could possibly work. If it performs poorly, move up one step in complexity. Linear Regression → Ridge/Lasso → Random Forest → XGBoost → Neural Networks. Each step up requires more data, more tuning, and more expertise.
											</p>
											<p>
												<strong>Perfect is the enemy of good.</strong> A simple model that you understand and can deploy tomorrow is worth more than a complex model that takes months to get working. Start simple, deploy, then iterate and improve based on real feedback.
											</p>
										</div>
									</div>
								</div>
							</SectionContainer>

							{/* Section 6: Training & Prediction */}
							<SectionContainer
								id="training-prediction"
								index={6}
								title={sectionMap["training-prediction"].title}
								icon={sectionMap["training-prediction"].icon}
							>
								<div className="mt-7 space-y-6">
									{/* Simple Explanation with Analogy */}
									<div className="rounded-2xl border border-fuchsia-500/35 bg-fuchsia-950/20 p-6">
										<h3 className="text-xl font-bold text-fuchsia-200">Understanding Training: The Student Learning Analogy</h3>
										<p className="mt-4 text-base leading-7 text-slate-200">
											Imagine training an ML model like teaching a student for an exam:
										</p>
										<ul className="mt-3 space-y-3 text-base leading-7 text-slate-200">
											<li className="flex gap-3">
												<span className="text-fuchsia-300">📚</span>
												<span><strong className="text-fuchsia-300">Training Data</strong> = Practice problems with answer keys. The student studies these to learn patterns.</span>
											</li>
											<li className="flex gap-3">
												<span className="text-fuchsia-300">🎯</span>
												<span><strong className="text-fuchsia-300">Training</strong> = The student practices, makes mistakes, and adjusts their understanding.</span>
											</li>
											<li className="flex gap-3">
												<span className="text-fuchsia-300">📝</span>
												<span><strong className="text-fuchsia-300">Validation Data</strong> = Practice tests taken during studying to see if the student is ready.</span>
											</li>
											<li className="flex gap-3">
												<span className="text-fuchsia-300">📋</span>
												<span><strong className="text-fuchsia-300">Test Data</strong> = The final exam. Student has never seen these questions before!</span>
											</li>
										</ul>
										<p className="mt-4 text-base leading-7 text-slate-200">
											The goal isn't to memorize practice problems (that's <strong className="text-red-300">overfitting</strong>). The goal is to understand principles well enough to solve NEW problems on the final exam (that's <strong className="text-emerald-300">generalization</strong>).
										</p>
									</div>

									{/* Three types of performance */}
									<div className="grid gap-5 lg:grid-cols-3">
										<div className="rounded-2xl border-2 border-rose-500/40 bg-rose-950/25 p-5">
											<h4 className="text-lg font-bold text-rose-200">Underfitting 😔</h4>
											<p className="mt-3 text-sm leading-6 text-slate-300">
												Like a student who barely studied. They perform badly on practice problems AND the exam.
											</p>
											<div className="mt-4 space-y-2 text-sm">
												<p className="text-rose-300">Signs:</p>
												<ul className="space-y-1 pl-4">
													<li className="text-slate-300">• Low accuracy on training data</li>
													<li className="text-slate-300">• Low accuracy on test data</li>
													<li className="text-slate-300">• Model is too simple for the problem</li>
												</ul>
											</div>
											<div className="mt-4 rounded-lg bg-emerald-950/30 p-3">
												<p className="text-xs font-semibold text-emerald-300">Solution:</p>
												<p className="mt-1 text-xs text-slate-300">Use a more complex model, add more features, or train longer</p>
											</div>
										</div>

										<div className="rounded-2xl border-2 border-emerald-500/40 bg-emerald-950/25 p-5">
											<h4 className="text-lg font-bold text-emerald-200">Good Fit 🎉</h4>
											<p className="mt-3 text-sm leading-6 text-slate-300">
												Like a student who studied well. They do well on practice AND the exam because they understood the concepts.
											</p>
											<div className="mt-4 space-y-2 text-sm">
												<p className="text-emerald-300">Signs:</p>
												<ul className="space-y-1 pl-4">
													<li className="text-slate-300">• High accuracy on training data</li>
													<li className="text-slate-300">• High accuracy on test data (similar to training)</li>
													<li className="text-slate-300">• Model generalizes well</li>
												</ul>
											</div>
											<div className="mt-4 rounded-lg bg-blue-950/30 p-3">
												<p className="text-xs font-semibold text-blue-300">Outcome:</p>
												<p className="mt-1 text-xs text-slate-300">Deploy this model! It's ready for production.</p>
											</div>
										</div>

										<div className="rounded-2xl border-2 border-amber-500/40 bg-amber-950/25 p-5">
											<h4 className="text-lg font-bold text-amber-200">Overfitting 😰</h4>
											<p className="mt-3 text-sm leading-6 text-slate-300">
												Like a student who memorized practice problems without understanding. Aces practice but fails the exam!
											</p>
											<div className="mt-4 space-y-2 text-sm">
												<p className="text-amber-300">Signs:</p>
												<ul className="space-y-1 pl-4">
													<li className="text-slate-300">• Very high accuracy on training data</li>
													<li className="text-slate-300">• Much lower accuracy on test data</li>
													<li className="text-slate-300">• Large gap between train and test scores</li>
												</ul>
											</div>
											<div className="mt-4 rounded-lg bg-emerald-950/30 p-3">
												<p className="text-xs font-semibold text-emerald-300">Solution:</p>
												<p className="mt-1 text-xs text-slate-300">Get more data, simplify model, or use regularization</p>
											</div>
										</div>
									</div>

									{/* Bias-Variance Visualization */}
									<div className="rounded-2xl border border-fuchsia-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-fuchsia-950/40 p-5">
										<h3 className="text-xl font-bold text-fuchsia-100">The Bias-Variance Tradeoff</h3>
										<p className="mt-3 text-sm leading-6 text-slate-200">
											This is one of the most important concepts in ML. Every model has two types of errors:
										</p>
										<div className="mt-4 grid gap-4 md:grid-cols-2">
											<div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-4">
												<h4 className="font-bold text-blue-200">Bias (Underfitting)</h4>
												<p className="mt-2 text-sm text-slate-300">
													Error from wrong assumptions. Like assuming all relationships are linear when they're not.
												</p>
												<p className="mt-2 text-sm font-semibold text-blue-300">
													High bias = model is too simple
												</p>
											</div>
											<div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4">
												<h4 className="font-bold text-rose-200">Variance (Overfitting)</h4>
												<p className="mt-2 text-sm text-slate-300">
													Error from being too sensitive to training data. Model learns noise instead of signal.
												</p>
												<p className="mt-2 text-sm font-semibold text-rose-300">
													High variance = model is too complex
												</p>
											</div>
										</div>

										<div className="mt-5 h-80 rounded-xl border border-slate-200 bg-white p-4">
											<ResponsiveContainer width="100%" height="100%">
												<ComposedChart data={biasVarianceData}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="label" stroke="#334155" angle={-15} textAnchor="end" height={60} />
													<YAxis stroke="#334155" label={{ value: 'Error', angle: -90, position: 'insideLeft' }} />
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
														name="Total Error (Goal: Minimize)"
														dot={{ r: 5 }}
													/>
												</ComposedChart>
											</ResponsiveContainer>
										</div>
										<p className="mt-3 text-center text-sm text-fuchsia-200">
											Sweet spot: Where total error is lowest (around complexity 4-5 in this example)
										</p>
									</div>

									{/* Training Process Step by Step */}
									<div className="space-y-4">
										<h3 className="text-xl font-bold text-slate-100">The Training Process: Step by Step</h3>
										
										{[
											{
												step: "Split Your Data",
												description: "Separate data into training, validation, and test sets BEFORE doing anything else.",
												why: "You need completely unseen data to know if your model actually works.",
												how: [
													"Training set (70-80%): Used to train the model",
													"Validation set (10-15%): Used to tune hyperparameters and detect overfitting",
													"Test set (10-15%): Used ONLY at the very end to measure final performance"
												],
												mistake: "Training and testing on the same data gives falsely high accuracy!",
												code: "from sklearn.model_selection import train_test_split\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)"
											},
											{
												step: "Choose Your Starting Model",
												description: "Based on section 5, pick a simple model to start with.",
												why: "Simple models train fast and help you understand if ML can even solve your problem.",
												how: [
													"For regression: Start with LinearRegression()",
													"For classification: Start with LogisticRegression() or DecisionTreeClassifier()",
													"For clustering: Start with KMeans(n_clusters=3)"
												],
												mistake: "Jumping to neural networks without trying simpler models first.",
												code: "from sklearn.linear_model import LinearRegression\nmodel = LinearRegression()"
											},
											{
												step: "Train the Model",
												description: "Feed training data to the model so it can learn patterns.",
												why: "This is where the model adjusts its internal parameters to minimize errors.",
												how: [
													"Call model.fit(X_train, y_train)",
													"The model iterates through data, making predictions and correcting errors",
													"Training stops when model converges or reaches max iterations"
												],
												mistake: "Forgetting to check if training actually improved the model's accuracy.",
												code: "model.fit(X_train, y_train)\n# Model is now trained!"
											},
											{
												step: "Make Predictions",
												description: "Use the trained model to predict on new data.",
												why: "This tests whether the model learned useful patterns or just memorized training data.",
												how: [
													"predictions = model.predict(X_test)",
													"For classification: Can also get probabilities with predict_proba()",
													"Compare predictions to actual y_test values"
												],
												mistake: "Making predictions on training data and thinking the model is great (it memorized those!).",
												code: "predictions = model.predict(X_test)\n# Now compare to y_test"
											},
											{
												step: "Evaluate Performance",
												description: "Measure how well the model performs using appropriate metrics.",
												why: "You need objective numbers to know if the model is good enough to deploy.",
												how: [
													"Regression: Use MAE, RMSE, R² score",
													"Classification: Use accuracy, precision, recall, F1-score",
													"Always evaluate on test data, NOT training data"
												],
												mistake: "Only looking at accuracy without understanding what it means for your specific problem.",
												code: "from sklearn.metrics import mean_squared_error, r2_score\nrmse = mean_squared_error(y_test, predictions, squared=False)\nr2 = r2_score(y_test, predictions)"
											},
											{
												step: "Check for Overfitting/Underfitting",
												description: "Compare training performance to test performance.",
												why: "This tells you if the model learned general patterns (good) or memorized data (bad).",
												how: [
													"Calculate accuracy on both training and test sets",
													"If training accuracy >> test accuracy: Overfitting",
													"If both are low: Underfitting",
													"If both are high and similar: Perfect! 🎉"
												],
												mistake: "Ignoring the gap between training and test accuracy.",
												code: "train_acc = model.score(X_train, y_train)\ntest_acc = model.score(X_test, y_test)\nprint(f'Train: {train_acc:.3f}, Test: {test_acc:.3f}')"
											},
											{
												step: "Tune Hyperparameters",
												description: "Adjust model settings to improve performance.",
												why: "Default settings rarely give the best results. Tuning can boost accuracy by 5-20%.",
												how: [
													"Use GridSearchCV or RandomizedSearchCV",
													"Try different learning rates, tree depths, number of neurons, etc.",
													"Use validation set to evaluate each combination"
												],
												mistake: "Tuning hyperparameters based on test set performance (causes overfitting to test set!).",
												code: "from sklearn.model_selection import GridSearchCV\nparam_grid = {'max_depth': [3, 5, 7], 'n_estimators': [50, 100, 200]}\ngrid = GridSearchCV(model, param_grid, cv=5)\ngrid.fit(X_train, y_train)"
											},
											{
												step: "Validate and Deploy",
												description: "Final check on test set, then deploy if performance is acceptable.",
												why: "Test set gives unbiased estimate of how model will perform in production.",
												how: [
													"Run final evaluation on test set (only once!)",
													"If performance is good: Deploy!",
													"If performance is bad: Go back and improve data or model"
												],
												mistake: "Deploying without monitoring. Model performance can degrade over time as data changes.",
												code: "final_score = model.score(X_test, y_test)\nif final_score > 0.85:\n    joblib.dump(model, 'production_model.pkl')\n    print('Model ready for deployment!')"
											}
										].map((item, idx) => (
											<div key={idx} className="rounded-xl border border-fuchsia-500/30 bg-slate-900/70 p-5">
												<div className="flex items-start gap-4">
													<span className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/20 text-lg font-bold text-fuchsia-300">
														{idx + 1}
													</span>
													<div className="flex-1">
														<h4 className="text-lg font-bold text-slate-100">{item.step}</h4>
														<p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>

														<div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-950/20 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Why This Matters</p>
															<p className="mt-1 text-sm text-slate-200">{item.why}</p>
														</div>

														<div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">How to Do It</p>
															<ul className="mt-2 space-y-1">
																{item.how.map((point, pointIdx) => (
																	<li key={pointIdx} className="flex gap-2 text-sm text-slate-200">
																		<span className="text-emerald-400">•</span>
																		<span>{point}</span>
																	</li>
																))}
															</ul>
														</div>

														<div className="mt-3 rounded-lg border border-red-500/20 bg-red-950/20 p-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-red-300">Common Mistake</p>
															<p className="mt-1 text-sm text-red-200">{item.mistake}</p>
														</div>

														{item.code && (
															<div className="mt-3 rounded-lg border border-slate-600 bg-slate-950 p-3">
																<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Example Code</p>
																<pre className="mt-2 overflow-x-auto text-xs text-green-300">
																	<code>{item.code}</code>
																</pre>
															</div>
														)}
													</div>
												</div>
											</div>
										))}
									</div>

									{/* Key Takeaway */}
									<div className="rounded-2xl border-2 border-fuchsia-400/40 bg-fuchsia-950/25 p-6">
										<div className="flex items-center gap-2">
											<Zap className="h-6 w-6 text-fuchsia-300" />
											<h3 className="text-xl font-bold text-fuchsia-200">What Every Beginner Must Remember</h3>
										</div>
										<div className="mt-4 space-y-3 text-base leading-7 text-fuchsia-100">
											<p>
												<strong>Never touch test data until the very end!</strong> Test data must be completely unseen during model development. If you use it to make decisions, you're essentially "cheating" and your accuracy estimates will be wrong.
											</p>
											<p>
												<strong>Overfitting is the #1 beginner mistake.</strong> A model that gets 99% accuracy on training data but 60% on test data is useless. Always check both numbers and be suspicious if training accuracy is much higher than test accuracy.
											</p>
											<p>
												<strong>Training is iterative, not one-and-done.</strong> Train simple model → Evaluate → Find problems → Fix them → Retrain → Evaluate again. Repeat until performance is good enough. This cycle is normal and expected.
											</p>
											<p>
												<strong>Save your models!</strong> After spending hours training, save the model file (using joblib or pickle). You don't want to retrain from scratch every time. Also save preprocessing steps so you can apply them to new data identically.
											</p>
										</div>
									</div>
								</div>
							</SectionContainer>

							{/* Section 7: Evaluation Metrics */}
							<SectionContainer
								id="evaluation-metrics"
								index={7}
								title={sectionMap["evaluation-metrics"].title}
								icon={sectionMap["evaluation-metrics"].icon}
							>
								<div className="mt-7 space-y-6">
									<div className="rounded-2xl border border-cyan-500/35 bg-cyan-950/20 p-6">
										<h3 className="text-xl font-bold text-cyan-200">How To Measure If Your Model Is Actually Good</h3>
										<p className="mt-4 text-base leading-7 text-slate-200">
											Evaluation is where many projects fail. A model is only useful if its metric aligns with business goals.
											 For example, in disease detection you care about high recall, while in spam filtering you often care about high precision.
										</p>
									</div>

									<div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-5">
										<h3 className="text-xl font-bold text-cyan-100">Metric Comparison</h3>
										<div className="mt-5 h-80 rounded-xl border border-slate-200 bg-white p-4">
											<ResponsiveContainer width="100%" height="100%">
												<BarChart data={evaluationMetricsData}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="metric" stroke="#334155" />
													<YAxis domain={[0, 100]} stroke="#334155" />
													<Tooltip />
													<Bar dataKey="value" radius={[8, 8, 0, 0]}>
														{evaluationMetricsData.map((entry, idx) => (
															<Cell key={`${entry.metric}-${idx}`} fill={["#0ea5e9", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"][idx % 5]} />
														))}
													</Bar>
												</BarChart>
											</ResponsiveContainer>
										</div>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										{evaluationMetricsData.map((item) => (
											<div key={item.metric} className="rounded-xl border border-cyan-500/30 bg-slate-900/70 p-4">
												<p className="text-sm font-bold text-cyan-200">{item.metric}</p>
												<p className="mt-2 text-sm text-slate-300">Score: {item.value}%</p>
												<p className="mt-1 text-xs text-cyan-100">Best used when: {item.when}</p>
											</div>
										))}
									</div>

									<div className="rounded-2xl border-2 border-cyan-400/40 bg-cyan-950/25 p-6">
										<div className="flex items-center gap-2">
											<Zap className="h-6 w-6 text-cyan-300" />
											<h3 className="text-xl font-bold text-cyan-200">Golden Rule</h3>
										</div>
										<p className="mt-4 text-base leading-7 text-cyan-100">
											Do not optimize a metric that does not reflect business risk. Pick the metric first,
											 then build and tune the model around it.
										</p>
									</div>
								</div>
							</SectionContainer>

							{/* Section 8: Real-world Applications */}
							<SectionContainer
								id="real-world"
								index={8}
								title={sectionMap["real-world"].title}
								icon={sectionMap["real-world"].icon}
							>
								<div className="mt-7 space-y-6">
									<div className="rounded-2xl border border-indigo-500/35 bg-indigo-950/20 p-6">
										<h3 className="text-xl font-bold text-indigo-200">Where ML Creates Real Value</h3>
										<p className="mt-4 text-base leading-7 text-slate-200">
											The biggest success stories come from combining good data, practical models, and strong operations.
											 Real-world ML is not just training once; it is monitoring, retraining, and improving continuously.
										</p>
									</div>

									<div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/45 p-5">
										<h3 className="text-xl font-bold text-indigo-100">Industry Adoption and Impact</h3>
										<div className="mt-5 h-80 rounded-xl border border-slate-200 bg-white p-4">
											<ResponsiveContainer width="100%" height="100%">
												<AreaChart data={industryAdoptionData}>
													<CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
													<XAxis dataKey="industry" stroke="#334155" />
													<YAxis domain={[0, 100]} stroke="#334155" />
													<Tooltip />
													<Legend />
													<Area type="monotone" dataKey="adoption" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} name="Adoption" />
													<Area type="monotone" dataKey="impact" stroke="#22c55e" fill="#22c55e" fillOpacity={0.35} name="Business Impact" />
												</AreaChart>
											</ResponsiveContainer>
										</div>
									</div>

									<div className="grid gap-4 md:grid-cols-2">
										{[
											"Use feature stores to keep training and inference consistent.",
											"Track model drift continuously; production data always changes.",
											"A/B test model updates before full rollout.",
											"Design fallbacks for failure cases and low-confidence predictions.",
											"Prioritize explainability for high-stakes domains.",
											"Build an MLOps loop: monitor -> retrain -> validate -> deploy.",
										].map((point, idx) => (
											<div key={idx} className="rounded-xl border border-indigo-500/30 bg-slate-900/70 p-4">
												<p className="text-sm leading-6 text-slate-200">{point}</p>
											</div>
										))}
									</div>

									<div className="rounded-2xl border-2 border-indigo-400/40 bg-indigo-950/25 p-6">
										<div className="flex items-center gap-2">
											<Zap className="h-6 w-6 text-indigo-300" />
											<h3 className="text-xl font-bold text-indigo-200">Final Success Formula</h3>
										</div>
										<p className="mt-4 text-base leading-7 text-indigo-100">
											Great ML products follow this sequence: clear business objective, then a strong data pipeline,
											then a simple baseline, followed by iterative improvement, monitoring, and responsible governance.
										</p>
									</div>
								</div>
							</SectionContainer>

						</div>

						<footer className="mt-6 rounded-3xl border border-slate-700 bg-slate-900/85 p-8 text-center shadow-sm">
							<div className="mx-auto max-w-2xl">
								<p className="text-xl font-bold text-slate-100">
									Congratulations! You've Completed the Beginner's ML Journey 🎉
								</p>
								<p className="mt-3 text-base leading-7 text-slate-300">
									You now understand the fundamentals of Machine Learning: its history, when to use it, different types, how to prepare data, build models, train them properly, and avoid common pitfalls. The next step is practice - build projects, make mistakes, and learn from them. Machine Learning is learned by doing!
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