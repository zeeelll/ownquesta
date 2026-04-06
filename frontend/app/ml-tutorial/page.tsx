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
} from 'lucide-react';
import Logo from '../components/Logo';

type StepData = {
	id: number;
	title: string;
	shortDescription: string;
	icon: React.ComponentType<{ size?: number; className?: string }>;
	details: {
		simpleIdea: string;
		analogy: string;
		example: string;
		visualHint: string;
	};
};

const STORAGE_KEY = 'ownquesta_ml_tutorial_progress_v1';

const TUTORIAL_STEPS: StepData[] = [
	{
		id: 1,
		title: 'History of Machine Learning',
		shortDescription: 'How ML started and became part of everyday life.',
		icon: History,
		details: {
			simpleIdea:
				'Machine Learning started as a dream: can computers learn from experience like people do? Over time, better computers and more data made that dream real.',
			analogy:
				'Think of ML like a child learning to recognize animals. At first, the child guesses. After seeing many examples, the guesses become smarter.',
			example:
				'Long ago, spam filters were basic. Today, email apps learn from millions of messages and block spam much better.',
			visualHint: 'Timeline: 1950s idea -> 1990s growth -> today everywhere',
		},
	},
	{
		id: 2,
		title: 'Why Machine Learning',
		shortDescription: 'Why we use ML instead of writing every rule by hand.',
		icon: Lightbulb,
		details: {
			simpleIdea:
				'Some problems are too complex for fixed rules. ML helps computers find patterns by looking at examples.',
			analogy:
				'Instead of giving your friend a 1,000-rule book to spot fake news, you show many real and fake headlines. They learn the pattern naturally.',
			example:
				'A shopping app can suggest products because ML learns your taste from what you click and buy.',
			visualHint: 'Rule-based: if/else tree | ML-based: pattern cloud',
		},
	},
	{
		id: 3,
		title: 'Types of ML',
		shortDescription: 'Supervised, unsupervised, and reinforcement learning.',
		icon: Layers3,
		details: {
			simpleIdea:
				'There are three common learning styles. Supervised uses labeled answers, unsupervised finds hidden groups, reinforcement learns by rewards.',
			analogy:
				'Supervised: teacher checks homework. Unsupervised: sorting toys by similarity. Reinforcement: training a pet with treats.',
			example:
				'Supervised predicts house prices, unsupervised groups customers, reinforcement helps game-playing AI improve.',
			visualHint: 'Three boxes: labeled data | grouped data | reward loop',
		},
	},
	{
		id: 4,
		title: 'Data Collection & Preprocessing',
		shortDescription: 'Gather clean data before training a model.',
		icon: Database,
		details: {
			simpleIdea:
				'Good data is the foundation. We collect it, remove errors, fill missing values, and format it so the model can learn clearly.',
			analogy:
				'Cooking with dirty vegetables gives bad food. Wash and prepare ingredients first for better taste.',
			example:
				'If age values are missing in a student dataset, we fill or remove them so the model does not get confused.',
			visualHint: 'Raw messy table -> cleaned neat table',
		},
	},
	{
		id: 5,
		title: 'Model Building',
		shortDescription: 'Choose an algorithm and set up a model.',
		icon: Wrench,
		details: {
			simpleIdea:
				'A model is like a tool. Different tools solve different jobs, so we pick one that fits the problem and data type.',
			analogy:
				'You do not use a spoon to cut wood. You choose the right tool, like a saw. Same with ML models.',
			example:
				'Use linear regression for number prediction, or decision trees for yes/no decisions.',
			visualHint: 'Toolbox: regression, tree, neural network icons',
		},
	},
	{
		id: 6,
		title: 'Training & Prediction',
		shortDescription: 'Teach the model, then let it predict new answers.',
		icon: Brain,
		details: {
			simpleIdea:
				'Training means showing data many times until the model learns patterns. Prediction means using that learning on new unseen data.',
			analogy:
				'Practice exams train a student. Final exam is prediction on questions never seen before.',
			example:
				'A weather model learns from old weather records, then predicts tomorrow\'s temperature.',
			visualHint: 'Train cycle arrows -> crystal-ball style prediction icon',
		},
	},
	{
		id: 7,
		title: 'Evaluation Metrics',
		shortDescription: 'Measure how good and reliable your model is.',
		icon: BarChart3,
		details: {
			simpleIdea:
				'After prediction, we score performance using metrics like accuracy, precision, recall, and error values.',
			analogy:
				'A school test gives marks, not just pass/fail. Metrics are those marks for a model.',
			example:
				'If a disease model has high recall, it catches most sick patients, which is very important in healthcare.',
			visualHint: 'Gauge meter + score cards',
		},
	},
	{
		id: 8,
		title: 'Real-world Applications & ML in AI',
		shortDescription: 'How ML powers modern AI products and systems.',
		icon: Globe2,
		details: {
			simpleIdea:
				'ML is the engine behind many AI tools: voice assistants, recommendation systems, fraud detection, and smart cameras.',
			analogy:
				'If AI is a robot body, ML is the brain that helps it learn from experience.',
			example:
				'Streaming apps suggest movies, banks detect fraud, and maps predict travel time using ML.',
			visualHint: 'World map with app icons and AI spark lines',
		},
	},
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
						<div className="hidden h-8 w-px bg-white/20 sm:block" />
						<div>
							<p className="text-xs uppercase tracking-[0.16em] text-cyan-300/90">AutoML Playground</p>
							<h1 className="text-lg font-semibold text-white sm:text-xl">Machine Learning Tutorial Roadmap</h1>
						</div>
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
					<aside className="border-r border-white/10 bg-[#0d1230]/90 p-4 backdrop-blur-xl lg:h-full lg:overflow-y-auto">
						<div className="mb-5 rounded-xl border border-cyan-300/25 bg-[#131a3d]/80 p-4">
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

						<div className="space-y-3">
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
											className={`relative rounded-[11px] px-3 py-3 ${
												isActive
													? 'bg-gradient-to-br from-[#19305a] to-[#24153b]'
													: 'bg-gradient-to-br from-[#121935] to-[#0d142e]'
											}`}
										>
											<div className="mb-2 flex items-center justify-between">
												<span className="text-xs font-semibold tracking-[0.2em] text-cyan-200">{String(step.id).padStart(2, '0')}</span>

												{isCompleted ? (
													<CheckCircle2 size={16} className="text-emerald-300" />
												) : isLocked ? (
													<Lock size={14} className="text-slate-300" />
												) : (
													<StepIcon size={16} className="text-cyan-200" />
												)}
											</div>

											<h3 className="text-sm font-semibold text-white">{step.title}</h3>
											<p className="mt-1 text-xs leading-relaxed text-[#b9c8ef]">{step.shortDescription}</p>

											{!isLocked && (
												<span className="mt-2 inline-flex rounded-full border border-white/15 px-2 py-0.5 text-[10px] tracking-wide text-cyan-100">
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
							<div className="mb-4 flex items-center gap-3">
								<div className="rounded-xl border border-white/20 bg-white/10 p-2.5">
									<ActiveIcon size={22} className="text-cyan-100" />
								</div>
								<h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{activeStepData.title}</h2>
							</div>

							<div className="grid gap-3 sm:grid-cols-2">
								<article className="rounded-xl border border-white/15 bg-[#0f1e39]/80 p-4">
									<p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Simple idea</p>
									<p className="text-sm leading-relaxed text-[#dce8ff]">{activeStepData.details.simpleIdea}</p>
								</article>

								<article className="rounded-xl border border-white/15 bg-[#1c1a3d]/85 p-4">
									<p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-200">Analogy</p>
									<p className="text-sm leading-relaxed text-[#e9ddff]">{activeStepData.details.analogy}</p>
								</article>

								<article className="rounded-xl border border-white/15 bg-[#10273d]/85 p-4">
									<p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">Real example</p>
									<p className="text-sm leading-relaxed text-[#dafbee]">{activeStepData.details.example}</p>
								</article>

								<article className="rounded-xl border border-white/15 bg-[#251a36]/85 p-4">
									<p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-200">Visual hint</p>
									<p className="text-sm leading-relaxed text-[#fff1cd]">{activeStepData.details.visualHint}</p>
								</article>
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
