'use client';

import Link from 'next/link';
import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Logo from '../components/Logo';

type HelpApiResponse = {
  success: boolean;
  ticketId?: string;
  message?: string;
  proofCount?: number;
  error?: string;
};

const issueTypes = [
  { value: 'account', label: 'Account / Login' },
  { value: 'dashboard', label: 'Dashboard / Navigation' },
  { value: 'lab', label: 'Lab / Model Training' },
  { value: 'script', label: 'Python / Notebook Export' },
  { value: 'payment', label: 'Payment / Download Issue' },
  { value: 'bug', label: 'Bug / Error Message' },
  { value: 'other', label: 'Other Help' },
] as const;

const pageAreas = ['Home', 'Login', 'Dashboard', 'Lab Playground', 'Script Editor', 'Payment Page', 'Profile', 'Other'];

const proofChecklist = [
  'Add a screenshot of the error, missing button, or failed step.',
  'Describe what you clicked before the issue happened.',
  'Paste any visible error text or payment/order ID if available.',
  'Attach logs, PDF proof, or screenshots to speed up support review.',
];

const quickHelpCards = [
  {
    title: 'Getting started',
    text: 'Upload your dataset, train a model, and export files from the lab in a few steps.',
  },
  {
    title: 'Payments & downloads',
    text: 'The first download is free for each type, then payment is required from the second time onward.',
  },
  {
    title: 'Bug reports with proof',
    text: 'Users can now submit a help request with screenshots, files, and a proper issue description.',
  },
];

const faqs = [
  {
    q: 'What proof should users attach?',
    a: 'Screenshots, screen recordings, order IDs, console errors, or short notes showing what went wrong.',
  },
  {
    q: 'Can users report payment problems?',
    a: 'Yes. They can choose the payment issue type and include proof like order ID, screenshot, or UPI details.',
  },
  {
    q: 'Can users quickly go back home?',
    a: 'Yes. The Help page includes a Home button at the top and a Back to Home button below.',
  },
];

export default function HelpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState('payment');
  const [pageArea, setPageArea] = useState('Payment Page');
  const [severity, setSeverity] = useState('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [stepsTried, setStepsTried] = useState('');
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

  const validateForm = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (!subject.trim()) return 'Please add a short issue subject.';
    if (description.trim().length < 20) return 'Please describe the issue with a little more detail.';
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
      formData.append('pageArea', pageArea);
      formData.append('severity', severity);
      formData.append('subject', subject.trim());
      formData.append('description', description.trim());
      formData.append('stepsTried', stepsTried.trim());
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
      setIssueType('payment');
      setPageArea('Payment Page');
      setSeverity('medium');
      setSubject('');
      setDescription('');
      setStepsTried('');
      setProofFiles([]);
    } catch (error: any) {
      setSubmitError(error?.message || 'Unable to submit your help request right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#0b1020_0%,#11162a_45%,#161b31_100%)] text-[#e6eef8] font-chillax">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(110,84,200,0.10),transparent_42%)]" />

      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-start border-b border-white/[0.06] bg-[rgba(12,16,31,0.88)] px-4 py-3 backdrop-blur-xl sm:px-6 md:px-10 md:py-4">
        <Logo href="/" size="md" />
      </nav>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col px-4 pb-16 pt-28 sm:px-6 md:px-8 md:pt-32">
        <section className="mb-8 rounded-[28px] border border-white/[0.08] bg-[rgba(13,16,31,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 md:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#a87edf]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a87edf]" />
            Help Center
          </div>

          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Ask for help and attach proof for any issue
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-[#8fa3c4] sm:text-base">
            This support page matches your Ownquesta web app and lets users clearly report payment issues, lab problems,
            login errors, download failures, and other bugs with screenshots or proof files.
          </p>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          {quickHelpCards.map((card) => (
            <div
              key={card.title}
              className="rounded-[24px] border border-[rgba(110,84,200,0.16)] bg-[rgba(13,16,31,0.72)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)] backdrop-blur-xl"
            >
              <h2 className="mb-2 text-lg font-semibold text-white">{card.title}</h2>
              <p className="text-sm leading-relaxed text-[#9fb3d9]">{card.text}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-white/[0.08] bg-[rgba(13,16,31,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Submit a support request</h2>
              <p className="mt-2 text-sm text-[#8fa3c4]">
                Users can explain the problem, tell what page it happened on, and upload proof to help with faster review.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d8e4f8]">Full name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#a87edf]/40 focus:bg-[#a87edf]/[0.04]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d8e4f8]">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  type="email"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#a87edf]/40 focus:bg-[#a87edf]/[0.04]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d8e4f8]">Issue type</span>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#a87edf]/40"
                >
                  {issueTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d8e4f8]">Page / area</span>
                <select
                  value={pageArea}
                  onChange={(e) => setPageArea(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#a87edf]/40"
                >
                  {pageAreas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-[0.7fr_1.3fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d8e4f8]">Priority</span>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#a87edf]/40"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#d8e4f8]">Issue subject</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Example: UPI payment confirmed but file did not download"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#a87edf]/40 focus:bg-[#a87edf]/[0.04]"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-[#d8e4f8]">Describe the issue</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us exactly what happened, what you expected, and what went wrong."
                rows={5}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#a87edf]/40 focus:bg-[#a87edf]/[0.04]"
              />
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-[#d8e4f8]">Steps already tried</span>
              <textarea
                value={stepsTried}
                onChange={(e) => setStepsTried(e.target.value)}
                placeholder="Example: refreshed page, re-logged in, tried payment again, checked lab session"
                rows={3}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#a87edf]/40 focus:bg-[#a87edf]/[0.04]"
              />
            </label>

            <div className="mt-4 rounded-[22px] border border-dashed border-[#a87edf]/35 bg-[#a87edf]/[0.05] p-4">
              <label className="block cursor-pointer">
                <span className="mb-2 block text-sm font-semibold text-white">Attach proof files</span>
                <span className="mb-3 block text-xs leading-relaxed text-[#9fb3d9]">
                  Upload screenshots, PDFs, logs, or short proof files. Up to 5 files can be selected.
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.txt,.log,.json"
                  onChange={handleProofChange}
                  className="block w-full text-sm text-[#d8e4f8] file:mr-3 file:rounded-xl file:border-0 file:bg-[#6e54c8] file:px-4 file:py-2 file:font-semibold file:text-white"
                />
              </label>

              {proofFiles.length > 0 && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-[rgba(8,10,20,0.45)] p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a87edf]">
                    Attached proof · {proofFiles.length} file(s) · {totalProofSizeMb} MB
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {proofFiles.map((file) => (
                      <span key={`${file.name}-${file.size}`} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-[#d8e4f8]">
                        {file.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {(submitError || submitMessage) && (
              <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${submitError ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'}`}>
                <div>{submitError || submitMessage}</div>
                {ticketId && <div className="mt-1 text-xs font-semibold text-emerald-200">Ticket ID: {ticketId}</div>}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6e54c8] to-[#7c49a9] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(110,84,200,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(110,84,200,0.45)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Submitting help request…' : 'Submit Help Request'}
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/[0.08] bg-[rgba(13,16,31,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
              <h2 className="mb-3 text-xl font-bold text-white">What proof should users add?</h2>
              <ul className="space-y-2 text-sm leading-relaxed text-[#9fb3d9]">
                {proofChecklist.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 text-[#a87edf]">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[28px] border border-white/[0.08] bg-[rgba(13,16,31,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
              <h2 className="mb-3 text-xl font-bold text-white">Quick answers</h2>
              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div key={faq.q} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-sm font-semibold text-white">{faq.q}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#9fb3d9]">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/[0.08] bg-[rgba(13,16,31,0.72)] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-7">
              <h2 className="mb-3 text-xl font-bold text-white">Need to go back?</h2>
              <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-[#8fa3c4]">
                Use the Home button to return to the main Ownquesta page and continue your work anytime.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6e54c8] to-[#7c49a9] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(110,84,200,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(110,84,200,0.45)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12l9-9 9 9" />
                  <path d="M9 21V9h6v12" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
