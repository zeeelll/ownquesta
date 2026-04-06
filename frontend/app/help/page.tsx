'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Database,
  Gauge,
  LayoutDashboard,
  Lock,
  Mail,
  MessageSquare,
  PlayCircle,
  ScanSearch,
  SquareTerminal,
  Upload,
  UserCircle2,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Logo from '../components/Logo';

type HelpApiResponse = {
  success: boolean;
  ticketId?: string;
  message?: string;
  error?: string;
};

type HelpCategory = {
  title: string;
  description: string;
  tags: string[];
  icon: LucideIcon;
};

const helpCategories: HelpCategory[] = [
  {
    title: 'Account',
    description: 'Login, register, and profile management help for secure account access.',
    tags: ['Login', 'Register', 'Profile'],
    icon: Lock,
  },
  {
    title: 'Dashboard',
    description: 'Understand project setup, layout navigation, and dashboard actions.',
    tags: ['Create Project', 'Navigation'],
    icon: LayoutDashboard,
  },
  {
    title: 'Lab',
    description: 'Work with Easy Mode or Code Mode and switch between workflows.',
    tags: ['Easy Mode', 'Code Mode'],
    icon: Bot,
  },
  {
    title: 'Dataset Upload',
    description: 'Fix upload errors, file format validation, and preprocessing issues.',
    tags: ['CSV', 'Validation'],
    icon: Upload,
  },
  {
    title: 'Model Training & Analysis',
    description: 'Tune training settings and interpret model output and analytics.',
    tags: ['Training', 'Insights'],
    icon: Workflow,
  },
  {
    title: 'Prediction & Accuracy',
    description: 'Run predictions with real data and verify accuracy and confusion matrix.',
    tags: ['Prediction', 'Accuracy'],
    icon: Gauge,
  },
  {
    title: 'Download Model / Python Script',
    description: 'Get trained model files and generated Python scripts for deployment.',
    tags: ['Export', 'Python Script'],
    icon: SquareTerminal,
  },
  {
    title: 'Payment & Access',
    description: 'Resolve payment confirmations, unlock access, and download issues.',
    tags: ['UPI', 'Order ID'],
    icon: CreditCard,
  },
];

const issueTypes = [
  { value: 'account', label: 'Account / Login' },
  { value: 'dashboard', label: 'Dashboard / Navigation' },
  { value: 'lab', label: 'Lab / Model Training' },
  { value: 'upload', label: 'Dataset Upload' },
  { value: 'prediction', label: 'Prediction / Accuracy' },
  { value: 'payment', label: 'Payment / Download Issue' },
  { value: 'other', label: 'Other Help' },
] as const;

const flowSteps = [
  'Home',
  'Login/Register',
  'Profile',
  'Dashboard',
  'Create Project',
  'Lab',
  'Upload Dataset',
  'Select Target',
  'Train Model',
  'Test with Real Data',
  'Get Accuracy',
  'Download Model',
];

const topHighlights = [
  {
    title: 'Fast onboarding',
    text: 'Get from upload to model results with guided workflows and contextual help.',
    icon: ScanSearch,
  },
  {
    title: 'Reliable troubleshooting',
    text: 'Search topics instantly and jump to FAQs or category-specific guidance.',
    icon: CircleHelp,
  },
  {
    title: 'Direct support',
    text: 'Contact support with issue details and get a ticket for follow-up.',
    icon: MessageSquare,
  },
];

const faqs = [
  {
    q: 'How do I create my first project from the dashboard?',
    a: 'Open Dashboard, click Create Project, choose your dataset and model objective, then continue to the Lab to configure training.',
  },
  {
    q: 'Which dataset formats are supported for upload?',
    a: 'Use clean CSV files with a clear target column. If upload fails, verify delimiter consistency and remove empty headers.',
  },
  {
    q: 'How can I improve low model accuracy?',
    a: 'Check class balance, remove noisy features, verify target labeling, then retrain with adjusted settings and compare metrics.',
  },
  {
    q: 'I completed payment but still cannot download. What should I do?',
    a: 'Wait a few seconds, refresh once, and retry download. If it still fails, share order ID, screenshot, and your account email via support form.',
  },
  {
    q: 'Can I export both model and Python script?',
    a: 'Yes. After training and validation, use the download tools to export model artifacts and script files for deployment.',
  },
];

function CategoryCard({ title, description, tags, icon: Icon }: HelpCategory) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.24)] transition-all duration-300 hover:-translate-y-1 hover:border-[#80f6d8]/40 hover:bg-[#80f6d8]/[0.06]"
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#80f6d8]/15 text-[#80f6d8]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#b4c2de]">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-white/15 bg-[#091022] px-3 py-1 text-xs text-[#d1dcf3]">
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1428]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-white sm:text-base">{question}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-[#80f6d8] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="faq-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-sm leading-relaxed text-[#aec0df]">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState('other');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [submitError, setSubmitError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalProofSizeMb = useMemo(() => {
    const totalBytes = proofFiles.reduce((sum, file) => sum + file.size, 0);
    return (totalBytes / (1024 * 1024)).toFixed(2);
  }, [proofFiles]);

  const handleProofChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, 5);
    setProofFiles(files);
  };

  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return helpCategories;

    return helpCategories.filter((category) => {
      return (
        category.title.toLowerCase().includes(q) ||
        category.description.toLowerCase().includes(q) ||
        category.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [searchTerm]);

  const filteredFaqs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return faqs;

    return faqs.filter((item) => {
      return item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q);
    });
  }, [searchTerm]);

  const validateForm = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!subject.trim()) return 'Please add a short issue subject.';
    if (message.trim().length < 20) return 'Please describe your issue with a little more detail.';
    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setSubmitError(validationError);
      setSubmitMessage('');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');
    setTicketId('');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('issueType', issueType);
      formData.append('pageArea', 'Help Page');
      formData.append('severity', 'medium');
      formData.append('subject', subject.trim());
      formData.append('description', message.trim());
      formData.append('stepsTried', 'Submitted from Help page contact form.');
      proofFiles.forEach((file) => formData.append('proof', file));

      const response = await fetch('/api/help', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as HelpApiResponse;
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to submit your help request right now.');
      }

      setTicketId(data.ticketId ?? '');
      setSubmitMessage(data.message || 'Your help request was submitted successfully.');
      setName('');
      setEmail('');
      setIssueType('other');
      setSubject('');
      setMessage('');
      setProofFiles([]);
    } catch (error: any) {
      setSubmitError(error?.message || 'Unable to submit your help request right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_10%_12%,#14314a_0%,#0c1326_36%,#060a16_100%)] text-[#f0f5ff] font-chillax scroll-smooth">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(40,220,180,0.08),transparent_30%,rgba(90,140,255,0.08)_70%,transparent_100%)]" />

      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-start border-b border-white/[0.06] bg-[rgba(12,16,31,0.88)] px-4 py-3 backdrop-blur-xl sm:px-6 md:px-10 md:py-4">
        <Logo href="/" size="md" />
      </nav>

      <main className="relative z-10 w-full pt-24 sm:pt-28">
        <section className="w-full px-6 py-16 lg:px-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(6,18,36,0.95)_0%,rgba(11,30,52,0.88)_45%,rgba(6,22,26,0.88)_100%)] p-7 shadow-[0_24px_75px_rgba(0,0,0,0.35)] sm:p-10 lg:p-14"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#80f6d8]/35 bg-[#80f6d8]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#80f6d8]">
              <CircleHelp className="h-3.5 w-3.5" />
              Help Center
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-6xl">Help &amp; Support</h1>
            <p className="mt-4 text-sm leading-relaxed text-[#bfd0ef] sm:text-base lg:text-lg">
              Find answers, guides, and support for using the platform.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {topHighlights.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#80f6d8]/15 text-[#80f6d8]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-semibold text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#b8c9e9]">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="w-full px-6 pb-12 lg:px-16" id="search">
          <div className="rounded-3xl border border-white/10 bg-[#0b152c]/85 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.3)] sm:p-6">
            <label className="mb-2 block text-sm font-semibold text-[#d8e6ff]">Search help topics</label>
            <div className="relative">
              <ScanSearch className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#80f6d8]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search account, training, payment, download, dataset..."
                className="h-14 w-full rounded-2xl border border-white/10 bg-[#081224] pl-12 pr-4 text-base text-white outline-none transition focus:border-[#80f6d8]/50"
              />
            </div>
            <p className="mt-3 text-xs text-[#9fb3d9]">
              Showing {filteredCategories.length} categories and {filteredFaqs.length} FAQs.
            </p>
          </div>
        </section>

        <section className="w-full px-6 pb-12 lg:px-16" id="categories">
          <div className="mb-5 flex items-center gap-3">
            <Database className="h-5 w-5 text-[#80f6d8]" />
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Help Categories</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredCategories.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>
        </section>

        <section className="w-full px-6 pb-12 lg:px-16" id="faq">
          <div className="mb-5 flex items-center gap-3">
            <CircleHelp className="h-5 w-5 text-[#80f6d8]" />
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-[#0b152b]/80 p-4 sm:p-6">
            {filteredFaqs.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-[#b1c3e5]">
                No FAQ matched your search. Try terms like training, dataset, payment, or download.
              </p>
            )}

            {filteredFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <FaqItem
                  key={faq.q}
                  question={faq.q}
                  answer={faq.a}
                  isOpen={isOpen}
                  onToggle={() => setOpenFaqIndex(isOpen ? null : index)}
                />
              );
            })}
          </div>
        </section>

        <section className="w-full px-6 pb-12 lg:px-16" id="guide">
          <div className="mb-5 flex items-center gap-3">
            <Workflow className="h-5 w-5 text-[#80f6d8]" />
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Step-by-Step Guide</h2>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(13,26,49,0.9)_0%,rgba(8,17,35,0.9)_100%)] p-6 shadow-[0_16px_45px_rgba(0,0,0,0.32)]">
            <p className="mb-4 text-sm text-[#c0d1ef]">Home → Login/Register → Profile → Dashboard → Create Project → Lab → Upload Dataset → Select Target → Train Model → Test with Real Data → Get Accuracy → Download Model</p>
            <div className="flex flex-wrap items-center gap-2">
              {flowSteps.map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="rounded-xl border border-white/15 bg-[#0a1328] px-3 py-2 text-xs font-semibold text-[#d7e4ff] sm:text-sm">
                    {step}
                  </span>
                  {index !== flowSteps.length - 1 && <ArrowRight className="h-4 w-4 text-[#80f6d8]" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-6 pb-12 lg:px-16" id="tutorial">
          <div className="mb-5 flex items-center gap-3">
            <PlayCircle className="h-5 w-5 text-[#80f6d8]" />
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Video Tutorial</h2>
          </div>
          <div className="rounded-3xl border border-dashed border-[#80f6d8]/35 bg-[#081327] p-8 text-center">
            <PlayCircle className="mx-auto h-12 w-12 text-[#80f6d8]" />
            <p className="mt-4 text-base font-semibold text-white">Tutorial video placeholder</p>
            <p className="mt-2 text-sm text-[#adc0e0]">
              Embed your walkthrough video here to demonstrate upload, training, prediction, and download steps.
            </p>
          </div>
        </section>

        <section className="w-full px-6 pb-12 lg:px-16" id="contact">
          <div className="mb-5 flex items-center gap-3">
            <Mail className="h-5 w-5 text-[#80f6d8]" />
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Contact Support</h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-white/10 bg-[#0b152b]/85 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.35)] sm:p-7"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d9e6ff]">Full name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#081224] px-4 text-sm text-white outline-none transition focus:border-[#80f6d8]/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d9e6ff]">Email</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  type="email"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#081224] px-4 text-sm text-white outline-none transition focus:border-[#80f6d8]/50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d9e6ff]">Issue type</span>
                <select
                  value={issueType}
                  onChange={(event) => setIssueType(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#081224] px-4 text-sm text-white outline-none transition focus:border-[#80f6d8]/50"
                >
                  {issueTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d9e6ff]">Subject</span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Short issue title"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-[#081224] px-4 text-sm text-white outline-none transition focus:border-[#80f6d8]/50"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-[#d9e6ff]">Message</span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe what happened, expected result, and what you tried."
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-[#081224] px-4 py-3 text-sm text-white outline-none transition focus:border-[#80f6d8]/50"
              />
            </label>

            <label className="mt-4 block cursor-pointer rounded-2xl border border-dashed border-[#80f6d8]/35 bg-[#80f6d8]/[0.06] p-4">
              <span className="block text-sm font-semibold text-white">Attach files (optional)</span>
              <span className="mt-1 block text-xs text-[#b4c8ea]">Up to 5 files: screenshots, logs, text, json, pdf.</span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.log,.json"
                onChange={handleProofChange}
                className="mt-3 block w-full text-sm text-[#d8e4f8] file:mr-3 file:rounded-xl file:border-0 file:bg-[#0ebc90] file:px-4 file:py-2 file:font-semibold file:text-[#04121e]"
              />
            </label>

            {proofFiles.length > 0 && (
              <p className="mt-3 text-xs text-[#9ec2dd]">Attached: {proofFiles.length} file(s), {totalProofSizeMb} MB total</p>
            )}

            {(submitError || submitMessage) && (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${submitError ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}>
                <div>{submitError || submitMessage}</div>
                {ticketId && <div className="mt-1 text-xs font-semibold text-emerald-200">Ticket ID: {ticketId}</div>}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0ebc90] to-[#39a8ff] px-7 py-3 text-sm font-semibold text-[#05111b] shadow-[0_10px_25px_rgba(57,168,255,0.3)] transition duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Mail className="h-4 w-4" />
                {isSubmitting ? 'Sending request...' : 'Contact Support'}
              </button>

              <a href="mailto:support@ownquesta.com" className="text-sm font-medium text-[#8fd7ff] underline underline-offset-4">
                support@ownquesta.com
              </a>
            </div>
          </form>
        </section>

        <section className="w-full px-6 pb-16 lg:px-16">
          <div className="rounded-3xl border border-white/10 bg-[#081123] px-6 py-8 text-center">
            <p className="text-lg font-semibold text-white">Still need help? We are here for you</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <a href="#contact" className="rounded-xl border border-white/20 bg-white/[0.04] px-4 py-2 text-sm text-[#d7e6ff] transition hover:border-[#80f6d8]/50 hover:text-white">
                Contact section
              </a>
              <Link
                href="/"
                className="rounded-xl bg-gradient-to-r from-[#0ebc90] to-[#39a8ff] px-4 py-2 text-sm font-semibold text-[#041320]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
