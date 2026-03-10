'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import Logo from '../components/Logo';

// ─────────────────────────────────────────────
// QUESTA AI AGENT — calls FastAPI at 127.0.0.1:8000
// ─────────────────────────────────────────────
const BACKEND_URL = 'http://127.0.0.1:8000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'How does Ownquesta work?',
  'What is the validation page for?',
  'How do I upload my dataset?',
  'Which ML models does Ownquesta support?',
  'How do I deploy my model?',
  'What is EDA?',
  'Do I need coding knowledge?',
  'How long does training take?',
];

const formatMessage = (text: string) => {
  let f = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  f = f.replace(/\*(.*?)\*/g, '<em>$1</em>');
  f = f.replace(/\n/g, '<br/>');
  f = f.replace(
    /(\d+)\.\s(.+?)(?=<br\/>|$)/g,
    '<span style="display:flex;gap:8px;margin:2px 0"><span style="color:#a78bfa;font-weight:700;flex-shrink:0">$1.</span><span>$2</span></span>'
  );
  f = f.replace(
    /[-•]\s(.+?)(?=<br\/>|$)/g,
    '<span style="display:flex;gap:8px;margin:2px 0"><span style="color:#c084fc;flex-shrink:0">▸</span><span>$1</span></span>'
  );
  return f;
};

const TypingDots = () => (
  <div className="flex items-end gap-2.5 max-w-[85%]">
    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 text-sm shadow-lg shadow-violet-500/30">
      ✦
    </div>
    <div className="bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tl-md px-4 py-3">
      <div className="flex gap-1.5 items-center h-4">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

function QuestaAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'online' | 'offline'>('unknown');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/questa/health`)
      .then((r) => setBackendStatus(r.ok ? 'online' : 'offline'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm **Questa**, your Ownquesta assistant ✦ Ask me anything about the platform — how it works, what each step does, or how to get started!",
        timestamp: new Date(),
      }]);
      setHasUnread(false);
    }
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setShowSuggestions(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };
    const typingMsg: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages
      .filter((m) => m.id !== 'typing' && m.id !== 'welcome' && !m.isTyping)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(`${BACKEND_URL}/questa/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || "I'm sorry, I couldn't process that. Please try again.";

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'typing'),
        {
          id: Date.now().toString() + '-reply',
          role: 'assistant',
          content: replyText,
          timestamp: new Date(),
        },
      ]);
      setBackendStatus('online');

    } catch (err: unknown) {
      const errorMessage = backendStatus === 'offline'
        ? 'Cannot reach the Ownquesta backend. Please make sure the server is running at http://127.0.0.1:8000'
        : `Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`;

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'typing'),
        {
          id: Date.now().toString() + '-err',
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
        },
      ]);
      setBackendStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const chatWidth = isExpanded ? 'w-[520px]' : 'w-[380px]';
  const chatHeight = isExpanded ? 'h-[640px]' : 'h-[520px]';

  const statusColor =
    backendStatus === 'online' ? 'bg-green-400' :
    backendStatus === 'offline' ? 'bg-red-400' :
    'bg-yellow-400 animate-pulse';

  const statusLabel =
    backendStatus === 'online' ? 'Connected' :
    backendStatus === 'offline' ? 'Backend offline' :
    'Connecting...';

  const statusTextColor =
    backendStatus === 'online' ? 'text-green-400/70' :
    backendStatus === 'offline' ? 'text-red-400/70' :
    'text-yellow-400/70';

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-[rgba(15,10,30,0.95)] border border-violet-500/30 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-xl shadow-violet-500/10 cursor-pointer hover:border-violet-400/50 transition-all"
            style={{ animation: 'fadeSlideUp 0.3s ease forwards' }}
          >
            <span className="text-violet-400 text-sm font-medium">Ask Questa anything</span>
            <span className="text-xs">💬</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/40 hover:scale-110 active:scale-95 transition-all duration-200"
        >
          {isOpen ? (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span className="text-xl">✦</span>
          )}
          {hasUnread && !isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-[#060812] animate-pulse" />
          )}
          <span className={`absolute -bottom-1 -left-1 w-3 h-3 rounded-full border-2 border-[#060812] ${statusColor}`} title={`Backend: ${backendStatus}`} />
        </button>
      </div>

      {isOpen && (
        <div
          className={`fixed bottom-24 right-6 z-[199] ${chatWidth} ${chatHeight} flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-violet-900/50 border border-white/[0.08] bg-[rgba(8,6,20,0.97)] backdrop-blur-2xl transition-all duration-300`}
          style={{ animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          <div className="relative flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/5 pointer-events-none" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30 text-lg flex-shrink-0">
              ✦
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#08061e] ${statusColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Questa</h3>
                <span className="text-[10px] font-semibold text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full border border-violet-400/20">
                  Ownquesta AI
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 flex items-center gap-1.5 ${statusTextColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                {statusLabel}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white/60"
                title={isExpanded ? 'Compact' : 'Expand'}
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => { setMessages([]); setShowSuggestions(true); }}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white/60"
                title="Clear chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.isTyping ? (
                  <TypingDots />
                ) : msg.role === 'assistant' ? (
                  <div className="flex items-start gap-2.5 max-w-[88%]">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 text-sm shadow-lg shadow-violet-500/20 mt-1">
                      ✦
                    </div>
                    <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-md px-4 py-3">
                      <div
                        className="text-[13px] text-white/85 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                      />
                      <p className="text-[10px] text-white/20 mt-2">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-gradient-to-br from-violet-600/80 to-fuchsia-600/80 rounded-2xl rounded-tr-md px-4 py-3 shadow-lg shadow-violet-500/10 border border-violet-400/20">
                      <p className="text-[13px] text-white leading-relaxed">{msg.content}</p>
                      <p className="text-[10px] text-violet-200/40 mt-1.5 text-right">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {showSuggestions && messages.length <= 1 && (
              <div className="mt-2">
                <p className="text-[11px] text-white/30 font-medium mb-2 px-1">Suggested questions</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.slice(0, 6).map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-[11px] text-violet-300/80 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-400/40 rounded-xl px-3 py-1.5 transition-all hover:-translate-y-0.5 text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/[0.06] p-4 flex-shrink-0">
            {backendStatus === 'offline' && (
              <div className="mb-3 flex items-center gap-2 text-[11px] text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <span>⚠</span>
                <span>Backend offline — run server at <code className="text-red-300">127.0.0.1:8000</code></span>
              </div>
            )}
            <div className="flex items-end gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 focus-within:bg-violet-500/[0.03] transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Ownquesta..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-[13px] text-white placeholder-white/20 resize-none outline-none leading-relaxed max-h-24 overflow-y-auto disabled:opacity-50"
                style={{ scrollbarWidth: 'none' }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-violet-500/20"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-white/15 text-center mt-2">
              Powered by Ownquesta AI · Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.5); }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE MOCKUP — Step 1 Visual Component
// ─────────────────────────────────────────────
function HomePageMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-900/40 bg-[#0e0b1e]"
      style={{ aspectRatio: '16/9' }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#100c2a] via-[#0e0b22] to-[#060412]">
        {/* Stars */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() > 0.8 ? '2px' : '1px',
              height: Math.random() > 0.8 ? '2px' : '1px',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.1,
            }}
          />
        ))}
        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-violet-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-indigo-800/20 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-10 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white">✦</div>
          <span className="text-white text-sm font-bold tracking-tight">Ownquesta</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-white/60 font-medium cursor-pointer">Sign In</div>
          <div className="text-[10px] text-white/60 font-medium cursor-pointer">About</div>
          <div className="px-3 py-1 text-[10px] text-white bg-violet-600 hover:bg-violet-500 rounded-lg font-semibold">Tutorial</div>
        </div>
      </div>

      {/* Hero content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10 pt-6">
        <div className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/50 border border-white/10 rounded-full px-3 py-1 mb-4 bg-white/5">
          <span className="w-1 h-1 rounded-full bg-violet-400" />
          No-Code AI Platform
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3 tracking-tight">
          From Raw Data to<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
            Intelligent Models
          </span>
        </h1>

        <p className="text-[10px] sm:text-xs text-white/50 max-w-sm mb-5 leading-relaxed">
          A complete no-code AI platform to explore datasets, create features,
          and train production-ready ML and deep learning models—instantly.
        </p>

        {/* 3 cards */}
        <div className="flex gap-2 mb-5 w-full max-w-md">
          {[
            { num: '01', title: 'Upload Dataset', sub: 'Any format, any size' },
            { num: '02', title: 'Understand Data', sub: 'AI-powered analysis' },
            { num: '03', title: 'Build Model', sub: 'One-click deployment' },
          ].map((card) => (
            <div key={card.num} className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5">
              <div className="text-[8px] text-violet-400/60 font-bold mb-1">{card.num}</div>
              <div className="text-[10px] font-semibold text-white">{card.title}</div>
              <div className="text-[8px] text-white/40">{card.sub}</div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex gap-2.5">
          <div className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-[11px] font-bold text-white shadow-lg shadow-violet-500/30">
            Get Started Free →
          </div>
          <div className="px-5 py-2 border border-white/15 rounded-xl text-[11px] font-medium text-white/70 bg-white/5">
            Learn More
          </div>
        </div>
      </div>

      {/* Browser chrome overlay - top bar shine */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
    </div>
  );
}

// ─────────────────────────────────────────────
// ANNOTATION CALLOUTS for Step 1
// ─────────────────────────────────────────────
const homePageAnnotations = [
  {
    icon: '🔷',
    label: 'Navbar',
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.25)',
    description: 'Fixed top bar with the Ownquesta logo (✦) on the left and three nav items on the right: Sign In, About, and Tutorial — which is highlighted in violet since you\'re already on this page.',
  },
  {
    icon: '✦',
    label: 'No-Code AI Platform Badge',
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.25)',
    description: 'A small pill badge just above the headline. It identifies Ownquesta as a "No-Code AI Platform" — meaning you don\'t write any machine learning code yourself.',
  },
  {
    icon: '🎯',
    label: 'Hero Headline',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.1)',
    border: 'rgba(192,132,252,0.25)',
    description: '"From Raw Data to Intelligent Models" — the main value proposition in two lines. "Intelligent Models" is rendered in a violet-to-fuchsia gradient to emphasize the AI-powered output.',
  },
  {
    icon: '📦',
    label: '3 Workflow Cards',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.25)',
    description: 'Three numbered cards show the platform\'s pipeline: 01 Upload Dataset, 02 Understand Data, 03 Build Model. These map directly to the steps you\'ll follow in this tutorial.',
  },
  {
    icon: '🚀',
    label: 'Get Started Free',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)',
    border: 'rgba(74,222,128,0.25)',
    description: 'The primary CTA button — a violet gradient pill with an arrow. Clicking this takes you to the Sign In page, which is your next step (Step 2) in this tutorial.',
  },
  {
    icon: '📖',
    label: 'Learn More',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
    border: 'rgba(251,146,60,0.25)',
    description: 'A secondary ghost button next to "Get Started Free". It leads to the About / feature overview section — useful if you want to understand Ownquesta\'s capabilities before signing up.',
  },
];

// ─────────────────────────────────────────────
// STEP 1 ENHANCED COMPONENT
// ─────────────────────────────────────────────
function Step1Content({ accentColor }: { accentColor: string }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);

  return (
    <div className="space-y-10">
      {/* Intro text */}
      <div className="space-y-4">
        <p className="text-base md:text-lg text-white/70 leading-relaxed">
          When you navigate to <strong className="text-white">ownquesta.com</strong>, you land on the <strong className="text-white">Home Page</strong> — a dark, starfield-themed interface built around a single goal: get you from raw data to a deployed ML model with zero code. Below is an exact replica of what you'll see, followed by a breakdown of every UI element on the page.
        </p>
      </div>

      {/* Home Page Mockup */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Ownquesta Home Page</p>
        </div>
        <HomePageMockup />
        <p className="text-[11px] text-white/25 text-center">↑ Interactive replica of the actual Ownquesta home page</p>
      </div>

      {/* Annotation cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
          <p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — Click to Explore</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {homePageAnnotations.map((ann, i) => (
            <button
              key={i}
              onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)}
              className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)',
                borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{ann.icon}</span>
                <span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span>
                <span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span>
              </div>
              {activeAnnotation === i && (
                <p className="text-[13px] text-white/65 leading-relaxed mt-1">
                  {ann.description}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* What to do on the home page */}
      <div className="rounded-2xl border border-violet-500/15 bg-violet-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-violet-300 flex items-center gap-2">
          <span>✦</span> What To Do On The Home Page
        </h4>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Read the headline — "From Raw Data to Intelligent Models" tells you the full scope: you supply the data, Ownquesta handles analysis, training, and deployment.' },
            { step: '2', text: 'Look at the 3 workflow cards (01 Upload Dataset → 02 Understand Data → 03 Build Model). These are the three macro-phases you\'ll go through in this tutorial.' },
            { step: '3', text: 'Click "Get Started Free" (the violet gradient button) to go to the Sign In page — that\'s Step 2 of this tutorial.' },
            { step: '4', text: 'Any time you want to return to this tutorial, click the "Tutorial" button in the top-right navbar — it\'s always there.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[11px] font-bold text-violet-300 flex-shrink-0 mt-0.5">
                {item.step}
              </span>
              <p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SIGN IN PAGE MOCKUP — Step 2 Visual Component
// ─────────────────────────────────────────────
function SignInMockup() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-blue-500/20 shadow-2xl shadow-blue-900/40"
      style={{ aspectRatio: '16/9', background: '#0d0b1e' }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 40%, #1a1040 0%, #0d0b1e 70%)' }}>
        {Array.from({ length: 55 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: i % 5 === 0 ? '2px' : '1px',
              height: i % 5 === 0 ? '2px' : '1px',
              top: `${(i * 17 + 3) % 100}%`,
              left: `${(i * 23 + 7) % 100}%`,
              opacity: 0.15 + (i % 4) * 0.1,
            }}
          />
        ))}
      </div>

      {/* Centered card container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex rounded-2xl overflow-hidden shadow-2xl" style={{ width: '68%', maxWidth: 520 }}>

          {/* LEFT PANEL — violet branding */}
          <div className="flex flex-col justify-between p-5 flex-shrink-0" style={{ width: '42%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)' }}>
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm font-bold">✦</div>
              <span className="text-white text-sm font-bold">Ownquesta</span>
            </div>
            {/* Tagline */}
            <div className="mt-4">
              <h2 className="text-white font-black text-base leading-snug mb-2">
                Unlock the power of your data
              </h2>
              <p className="text-white/65 text-[9px] leading-relaxed mb-4">
                Join thousands of teams using Ownquesta to build production-ready AI models without writing a single line of code.
              </p>
              <div className="space-y-1.5">
                {['Advanced AI-powered tools', 'Secure cloud storage', 'Explainable AI results'].map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-white/20 border border-white/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[7px]">✓</span>
                    </div>
                    <span className="text-white/80 text-[9px]">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT PANEL — sign in form */}
          <div className="flex flex-col justify-center p-5 flex-1" style={{ background: '#111827' }}>
            <h3 className="text-white font-black text-base mb-0.5">Welcome Back</h3>
            <p className="text-[9px] text-white/45 mb-4">
              Don't have an account? <span className="text-violet-400 font-semibold">Create one</span>
            </p>

            {/* Email field */}
            <div className="mb-3">
              <label className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1 block">EMAIL</label>
              <div className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[9px] text-white/25">
                you@example.com
              </div>
            </div>

            {/* Password field */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[8px] font-bold text-white/50 uppercase tracking-widest">PASSWORD</label>
                <span className="text-[8px] text-white/35">Forgot password?</span>
              </div>
              <div className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[9px] text-white/25 flex items-center justify-between">
                <span>Enter your password</span>
                <span className="text-white/30 text-[10px]">👁</span>
              </div>
            </div>

            {/* Sign In button */}
            <div className="w-full py-2 rounded-lg text-center text-[10px] font-bold text-white mb-3"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)' }}>
              Sign In
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[8px] text-white/25">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google button */}
            <div className="w-full py-2 rounded-lg border border-white/10 bg-white/5 text-center text-[9px] text-white/70 flex items-center justify-center gap-2">
              <span className="font-bold text-[10px]">G</span>
              <span>Continue with Google</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANNOTATIONS for Step 2
// ─────────────────────────────────────────────
const signInAnnotations = [
  {
    icon: '🟣',
    label: 'Left Branding Panel',
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.25)',
    description: 'The violet left panel shows the Ownquesta logo and a short pitch: "Unlock the power of your data." Below it are three feature highlights — Advanced AI-powered tools, Secure cloud storage, and Explainable AI results.',
  },
  {
    icon: '👋',
    label: 'Welcome Back Heading',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.25)',
    description: '"Welcome Back" is shown for returning users. If you don\'t have an account yet, click "Create one" (the violet link next to the subtext) to be taken to the registration form.',
  },
  {
    icon: '📧',
    label: 'Email Field',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    border: 'rgba(52,211,153,0.25)',
    description: 'Enter the email address you used to register. The placeholder shows "you@example.com" as a hint. This field is required for both Sign In and account creation.',
  },
  {
    icon: '🔒',
    label: 'Password Field + Forgot',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.25)',
    description: 'Enter your password here. The 👁 icon on the right toggles visibility. If you\'ve forgotten your password, click "Forgot password?" (top-right of this field) to receive a reset email.',
  },
  {
    icon: '🚀',
    label: 'Sign In Button',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.1)',
    border: 'rgba(192,132,252,0.25)',
    description: 'The full-width violet gradient "Sign In" button submits your email and password. On success, you\'re taken directly to your Dashboard or the Welcome page.',
  },
  {
    icon: '🔵',
    label: 'Continue with Google',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
    border: 'rgba(251,146,60,0.25)',
    description: 'Skip the form entirely — click this button to sign in (or register) using your Google account. No password needed. This is the fastest way to get started.',
  },
];

// ─────────────────────────────────────────────
// STEP 2 ENHANCED COMPONENT
// ─────────────────────────────────────────────
function Step2Content({ accentColor }: { accentColor: string }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);

  return (
    <div className="space-y-10">
      {/* Intro */}
      <p className="text-base md:text-lg text-white/70 leading-relaxed">
        After clicking <strong className="text-white">"Get Started Free"</strong> on the home page, you land on the <strong className="text-white">Sign In page</strong> — a two-panel card centered on a dark starfield background. The left panel reinforces what Ownquesta offers; the right panel is where you authenticate. Here's everything you'll see.
      </p>

      {/* Mockup */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Ownquesta Sign In Page</p>
        </div>
        <SignInMockup />
        <p className="text-[11px] text-white/25 text-center">↑ Replica of the actual Ownquesta Sign In page</p>
      </div>

      {/* Annotation cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
          <p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — Click to Explore</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {signInAnnotations.map((ann, i) => (
            <button
              key={i}
              onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)}
              className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)',
                borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{ann.icon}</span>
                <span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span>
                <span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span>
              </div>
              {activeAnnotation === i && (
                <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action guide */}
      <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-blue-300 flex items-center gap-2">
          <span>🔐</span> What To Do On The Sign In Page
        </h4>
        <div className="space-y-3">
          {[
            { step: '1', text: 'New user? Click "Create one" next to "Don\'t have an account?" to register with your name, email, and password.' },
            { step: '2', text: 'Returning user? Enter your email and password, then click "Sign In" — you\'ll be taken straight to your Dashboard.' },
            { step: '3', text: 'Prefer Google? Click "Continue with Google" to authenticate instantly — no form-filling needed.' },
            { step: '4', text: 'Forgot your password? Click "Forgot password?" above the password field to get a reset link sent to your email.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[11px] font-bold text-blue-300 flex-shrink-0 mt-0.5">
                {item.step}
              </span>
              <p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// WELCOME PAGE MOCKUP — Step 3 Visual Component
// ─────────────────────────────────────────────
function WelcomeMockup() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-orange-500/20 shadow-2xl shadow-purple-900/40"
      style={{ aspectRatio: '16/9', background: '#0d0b1e' }}
    >
      {/* Deep purple starfield */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, #1e1040 0%, #0d0b1e 65%)' }}>
        {Array.from({ length: 70 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: i % 6 === 0 ? '2px' : '1px',
              height: i % 6 === 0 ? '2px' : '1px',
              top: `${(i * 13 + 5) % 100}%`,
              left: `${(i * 19 + 11) % 100}%`,
              opacity: 0.1 + (i % 5) * 0.08,
            }}
          />
        ))}
        {/* Purple glow blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-48 rounded-full blur-3xl" style={{ background: 'rgba(109,40,217,0.18)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(88,28,220,0.12)' }} />
      </div>

      {/* Top navbar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-2.5 z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white">✦</div>
          <span className="text-white text-xs font-bold tracking-tight">Ownquesta</span>
        </div>
        {/* User avatar */}
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">S</div>
          <span className="text-white/40 text-[9px]">▾</span>
        </div>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        {/* WELCOME BACK badge */}
        <div className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/50 border border-white/10 rounded-full px-3 py-1 mb-4 bg-white/5">
          <span className="w-1 h-1 rounded-full bg-violet-400" />
          Welcome Back
        </div>

        {/* Hero headline */}
        <h1 className="font-black text-white leading-tight mb-2" style={{ fontSize: 'clamp(14px, 3vw, 28px)' }}>
          Hey sumit,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">
            ready to build?
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-[9px] text-white/40 max-w-xs mb-5 leading-relaxed">
          Transform your data into powerful AI models — no coding required. Your next breakthrough is just one click away.
        </p>

        {/* Go to Dashboard button */}
        <div className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold text-white mb-6 shadow-lg"
          style={{ background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
          <span className="text-[11px]">⊞</span>
          Go to Dashboard
        </div>

        {/* 3 stat cards */}
        <div className="flex gap-2.5">
          {[
            { value: '50+', label: 'Models' },
            { value: 'Auto', label: 'Algorithms' },
            { value: '95%', label: 'Time Saved' },
          ].map((stat) => (
            <div key={stat.label} className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.06] text-center min-w-[60px]">
              <div className="text-white font-black text-sm leading-none mb-0.5">{stat.value}</div>
              <div className="text-white/40 text-[8px]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANNOTATIONS for Step 3
// ─────────────────────────────────────────────
const welcomeAnnotations = [
  {
    icon: '🔷',
    label: 'Top Navbar',
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.1)',
    border: 'rgba(99,102,241,0.25)',
    description: 'The top-left shows the Ownquesta logo. The top-right shows your profile avatar (a circular icon with your initial) plus a dropdown arrow — click it to access account settings or sign out.',
  },
  {
    icon: '✦',
    label: '"WELCOME BACK" Badge',
    color: '#a78bfa',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.25)',
    description: 'A small pill badge at the top of the center content confirms you\'re authenticated and back in your workspace. It appears every time you return after signing in.',
  },
  {
    icon: '👋',
    label: 'Personalized Headline',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.1)',
    border: 'rgba(192,132,252,0.25)',
    description: '"Hey [your name], ready to build?" — the headline uses your actual account name. "ready to build?" is rendered in a violet-to-fuchsia gradient, reinforcing the platform\'s action-oriented tone.',
  },
  {
    icon: '💬',
    label: 'Subtitle Text',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.25)',
    description: '"Transform your data into powerful AI models — no coding required. Your next breakthrough is just one click away." This confirms the no-code promise and primes you to click the CTA below.',
  },
  {
    icon: '🚀',
    label: '"Go to Dashboard" Button',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)',
    border: 'rgba(74,222,128,0.25)',
    description: 'The main CTA — a glowing violet button with a grid icon (⊞) and the label "Go to Dashboard". Clicking this takes you to Step 4: your project command center where all ML work happens.',
  },
  {
    icon: '📊',
    label: '3 Platform Stat Cards',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
    border: 'rgba(251,146,60,0.25)',
    description: 'Three dark rounded cards below the button highlight platform capabilities: 50+ Models (pre-built algorithms), Auto Algorithms (automatic model selection), and 95% Time Saved (vs manual ML coding).',
  },
];

// ─────────────────────────────────────────────
// STEP 3 ENHANCED COMPONENT
// ─────────────────────────────────────────────
function Step3Content({ accentColor }: { accentColor: string }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);

  return (
    <div className="space-y-10">
      {/* Intro */}
      <p className="text-base md:text-lg text-white/70 leading-relaxed">
        After signing in, you're taken directly to the <strong className="text-white">Welcome Page</strong> — a full-screen dark interface that greets you by name and gives you a one-click path to your workspace. Below is an exact replica of what you'll see, with a breakdown of every element.
      </p>

      {/* Mockup */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-orange-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Ownquesta Welcome Page</p>
        </div>
        <WelcomeMockup />
        <p className="text-[11px] text-white/25 text-center">↑ Replica of the actual Ownquesta Welcome page</p>
      </div>

      {/* Annotation cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
          <p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — Click to Explore</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {welcomeAnnotations.map((ann, i) => (
            <button
              key={i}
              onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)}
              className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)',
                borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{ann.icon}</span>
                <span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span>
                <span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span>
              </div>
              {activeAnnotation === i && (
                <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action guide */}
      <div className="rounded-2xl border border-orange-500/15 bg-orange-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-orange-300 flex items-center gap-2">
          <span>🏠</span> What To Do On The Welcome Page
        </h4>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Confirm it greets you by name — if it shows the wrong name, check your account profile from the avatar dropdown in the top-right.' },
            { step: '2', text: 'Note the 3 stat cards: 50+ Models, Auto Algorithms, and 95% Time Saved — these represent the platform\'s core strengths you\'ll experience through the tutorial.' },
            { step: '3', text: 'Click "Go to Dashboard" (the violet button with the ⊞ icon) — this is your next step and takes you to your main project workspace.' },
            { step: '4', text: 'This page reappears each time you sign in, so it\'s always a clean, focused entry point back into your work.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[11px] font-bold text-orange-300 flex-shrink-0 mt-0.5">
                {item.step}
              </span>
              <p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TUTORIAL PAGE
// ─────────────────────────────────────────────
export default function TutorialPage() {
  const steps = [
    {
      number: 1,
      title: 'Open Ownquesta & Explore the Home Page',
      icon: '🌟',
      color: 'from-violet-600/20 to-purple-800/20',
      accentColor: '#a78bfa',
      borderColor: 'border-violet-500/40',
      badge: 'Getting Started',
      isCustom: true, // uses Step1Content component
      fullDescription: '',
    },
    {
      number: 2,
      title: 'Sign In or Create Your Account',
      icon: '🔐',
      color: 'from-blue-600/20 to-indigo-800/20',
      accentColor: '#60a5fa',
      borderColor: 'border-blue-500/40',
      badge: 'Authentication',
      isCustom: true,
      fullDescription: '',
    },
    {
      number: 3,
      title: 'Welcome Page',
      icon: '🏠',
      color: 'from-orange-500/20 to-amber-700/20',
      accentColor: '#fb923c',
      borderColor: 'border-orange-500/40',
      badge: 'Onboarding',
      isCustom: true,
      fullDescription: '',
    },
    {
      number: 4,
      title: 'Navigate Your Dashboard',
      icon: '📊',
      color: 'from-purple-600/20 to-pink-800/20',
      accentColor: '#c084fc',
      borderColor: 'border-purple-500/40',
      badge: 'Command Center',
      fullDescription: `The Dashboard is your central command center. Everything you've done and everything you'll build lives here.

At the top, four stat cards track your progress in real time:

• ML Verify Dataset — validated datasets count
• Datasets Uploaded — all files you've submitted
• Avg Confidence % — accuracy across all trained models
• Total Rows Analyzed — total data volume processed

The ML Workflow Pipeline shows your 5-step journey visually: Upload Data → Feature Engineering → Model Building → Model Comparison → Deployment. Each phase unlocks as you advance.

Your projects table lists every project with name, dataset, task type, status, accuracy, and creation date. An Activity Timeline at the bottom logs everything — uploads, validations, training runs, and more.

Ready to build? You can use a demo dataset to explore the platform, or upload your own dataset to start a real project.`,
    },
    {
      number: 5,
      title: 'Create a Project & Choose Your Path',
      icon: '✨',
      color: 'from-pink-500/20 to-rose-700/20',
      accentColor: '#f472b6',
      borderColor: 'border-pink-500/40',
      badge: 'Project Setup',
      fullDescription: `Click "Start Validation" from the Dashboard to kick off a new project. A modal appears asking you to name your project — make it descriptive and meaningful.

Good project name examples:
• "Customer Churn Prediction Q4"
• "House Price Forecasting Model"
• "Fraud Detection System"

After naming your project, you choose your ML type:

🤖 Machine Learning — for structured/tabular data tasks like classification, regression, and clustering
🧠 Deep Learning — for complex patterns, image data, and advanced neural network tasks

Select Machine Learning to continue. Any previous projects appear below so you can resume where you left off.`,
    },
    {
      number: 6,
      title: 'Setup — Define Goal & Upload Dataset',
      icon: '📤',
      color: 'from-green-500/20 to-emerald-700/20',
      accentColor: '#4ade80',
      borderColor: 'border-green-500/40',
      badge: 'ML Setup Page',
      fullDescription: `The ML Setup page is your starting point for the AutoML pipeline. It has two key actions:

1. Define Your ML Goal
Type your objective in plain language — no technical terms needed. Examples:
• "Predict which customers are likely to churn in the next 3 months"
• "Forecast property sale prices based on location and features"
• "Detect fraudulent transactions in real time"

Be specific. Mention key variables if you know them.

2. Upload Your Dataset
Drag and drop your CSV or Excel file onto the upload zone, or click to browse your files. A preview of your data will appear so you can confirm it looks correct before proceeding.

Supported: .csv, .xlsx, .xls
Recommended size: Under 10 MB for fast results (up to 100 MB supported)

Once both are complete, click "Next" to hand things over to the AI validation agent.`,
    },
    {
      number: 7,
      title: 'Validate — AI Agent Runs EDA & Validation',
      icon: '🔍',
      color: 'from-cyan-500/20 to-teal-700/20',
      accentColor: '#22d3ee',
      borderColor: 'border-cyan-500/40',
      badge: 'Validation Agent',
      fullDescription: `This is where the intelligence kicks in. The Validation Agent takes over and performs a deep analysis of your dataset automatically.

What the agent does:
• Exploratory Data Analysis (EDA) — scans distributions, correlations, and patterns
• Missing Value Detection — identifies incomplete fields and their severity
• Data Type Validation — checks if columns are correctly typed
• Class Balance Check — flags imbalanced target variables
• ML Readiness Assessment — scores your data from 0–100%

You watch the agent work in real time. Progress indicators show each validation step completing. When it's done, you see a clean summary of your data health.

Status indicators:
🟢 Green — Data is ready, good to go
🟡 Yellow — Some issues, proceed with caution
🔴 Red — Significant problems, consider cleaning first

You can still proceed even with warnings — the system will do its best with what you have.`,
    },
    {
      number: 8,
      title: 'Config — Validation Report & Preprocessing',
      icon: '⚙️',
      color: 'from-indigo-500/20 to-blue-800/20',
      accentColor: '#818cf8',
      borderColor: 'border-indigo-500/40',
      badge: 'Configuration Page',
      fullDescription: `The Config page presents your Validation Report Summary — a complete breakdown of what the agent discovered about your data.

Report highlights include:
• Total Rows & Columns
• Data Quality Score
• Missing values per column
• Numerical statistics (mean, median, min, max)
• Feature correlations and distributions

After reviewing the report, you begin the Model Configuration Pipeline:

Step 1 — Preprocessing
The system suggests the right preprocessing steps for your data: handling missing values, outlier removal, normalization/standardization, and class balancing.

Step 2 — Encoding & Feature Selection
You see which encoding strategy is recommended (one-hot, label, target encoding) and which features are selected as most informative. You can review and adjust as needed.

Once preprocessing and feature configuration are set, click "Start Modeling" to let the agents do the heavy lifting.`,
    },
    {
      number: 9,
      title: 'Modeling — Train, Evaluate & Compare',
      icon: '🤖',
      color: 'from-violet-500/20 to-purple-800/20',
      accentColor: '#a78bfa',
      borderColor: 'border-violet-500/40',
      badge: 'Modeling Agent',
      fullDescription: `The Modeling Agent now creates, trains, and evaluates multiple ML models simultaneously — you don't have to pick just one.

Models trained in parallel (classification example):
• Logistic Regression
• Random Forest
• XGBoost / Gradient Boosting
• Support Vector Machine (SVM)
• Neural Network

For each model, the agent:
• Splits data: 80% training / 10% validation / 10% testing
• Trains with optimal hyperparameters
• Evaluates using Accuracy, Precision, Recall, F1-Score, and AUC-ROC
• Generates a confusion matrix and feature importance chart

Progress bars show real-time training status for each model. You can leave the page and return — everything continues in the background.

Once all models complete, the agent presents a side-by-side Comparison View. It highlights the top performer with a 🏆 badge and explains its recommendation. You can review all models and select whichever best fits your business priorities.`,
    },
    {
      number: 10,
      title: 'Testing — Test Your Best Model',
      icon: '🧪',
      color: 'from-yellow-500/20 to-orange-700/20',
      accentColor: '#facc15',
      borderColor: 'border-yellow-500/40',
      badge: 'Model Testing',
      fullDescription: `Before deployment, the Testing Page lets you validate your best model on real data with the help of the AI agent.

Two testing options:

Manual Input Testing
Fill in values for each feature your model expects (e.g., Customer Age, Account Balance, Monthly Usage). Click "Predict" and instantly receive:
• Prediction result (e.g., "Will Churn" or "Won't Churn")
• Confidence Score (e.g., "87.3% confidence")
• Feature contribution breakdown — which inputs drove the prediction

Batch Testing
Upload a test CSV with multiple rows. The agent processes all records at once and returns predictions for every row. Download the results file with predictions and confidence scores included.

The agent also explains how the model works on your data in plain language, helping you understand not just what it predicts, but why — building your confidence before going live.`,
    },
    {
      number: 11,
      title: 'Explain & Deploy — Understand, Then Go Live',
      icon: '🚀',
      color: 'from-red-500/20 to-pink-800/20',
      accentColor: '#f87171',
      borderColor: 'border-red-500/40',
      badge: 'Explain & Deploy',
      fullDescription: `The final page combines explainability with deployment — because you should understand your model before you ship it.

Explain Section (Powered by Generative AI)
The system generates a clear, human-readable explanation of why your model was selected as the best:
• Which features matter most and why
• How the model performs across different data segments
• SHAP value visualizations showing individual prediction reasoning
• Business implications of the model's behavior

This makes your AI decisions transparent, auditable, and trustworthy.

Deploy Section
When you're ready to go live, click "Deploy Model". In 30–90 seconds, your model becomes a live REST API:

• 🌐 API Endpoint URL — the address developers call for predictions
• 🔑 API Key — your secure authentication token (keep it private!)
• 💻 Code Samples — ready-to-use Python, JavaScript, and cURL snippets
• 📈 Live Dashboard — shows status (🟢 LIVE), prediction count, avg response time (~142ms), and 99.9% uptime

Download Option: Don't need an API? Download your trained model as a file to use in your own environment.

Your model is now live, making real predictions 24/7. Congratulations — you've built and shipped a production AI model! 🎉`,
    },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = Number(entry.target.getAttribute('data-step'));
            if (step) setCurrentStep(step);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-10% 0px -10% 0px' }
    );
    sectionRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  const scrollToStep = (stepNumber: number) => {
    const section = document.querySelector(`section[data-step="${stepNumber}"]`);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative text-[#e6eef8] overflow-x-hidden font-chillax bg-[#060812]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#060812] via-[#0d0a1f] to-[#060812]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex justify-between items-center z-[100] transition-all duration-500 ${isScrolled ? 'bg-[rgba(6,8,18,0.85)] backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'}`}>
        <Logo href="/" size="md" />
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs text-white/40 font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Step {currentStep} of {steps.length}
          </span>
          <Link
            href="/"
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 border border-white/10 bg-white/5 backdrop-blur-sm text-[#c5d4ed] hover:text-white hover:border-white/20"
          >
            Home
          </Link>
        </div>
      </nav>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[200]">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-500"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      <div className="relative z-10">
        {/* Sidebar */}
        <div className="hidden lg:block fixed left-0 top-0 h-screen w-[260px] bg-[rgba(6,8,18,0.7)] backdrop-blur-xl border-r border-white/[0.06] overflow-y-auto z-40">
          <div className="p-5 pt-20">
            <div className="mb-5">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">Tutorial</p>
              <h3 className="text-sm font-semibold text-white/60">Ownquesta Workflow</h3>
            </div>
            <div className="space-y-1">
              {steps.map((step) => {
                const isActive = currentStep === step.number;
                const isPast = currentStep > step.number;
                return (
                  <button
                    key={step.number}
                    onClick={() => scrollToStep(step.number)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 ${isActive ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 transition-all ${isActive ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30' : isPast ? 'bg-white/10' : 'bg-white/[0.04] border border-white/10'}`}>
                      {isPast && !isActive ? '✓' : step.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-white/30 font-medium">Step {step.number}</div>
                      <div className="text-xs font-medium truncate">{step.title}</div>
                    </div>
                    {isActive && <div className="ml-auto w-1 h-4 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[rgba(6,8,18,0.95)] backdrop-blur-xl border-t border-white/[0.06] z-40">
          <div className="flex overflow-x-auto gap-1.5 p-2.5 scroll-smooth hide-scrollbar">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isPast = currentStep > step.number;
              return (
                <button
                  key={step.number}
                  onClick={() => scrollToStep(step.number)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'bg-white/10' : isPast ? 'bg-white/[0.04]' : 'hover:bg-white/5'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${isActive ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' : isPast ? 'bg-white/10 text-white/60' : 'bg-white/[0.04] text-white/40'}`}>
                    {isPast && !isActive ? '✓' : step.icon}
                  </div>
                  <span className={`text-[9px] font-medium ${isActive ? 'text-white' : 'text-white/30'}`}>{step.number}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Steps */}
        <div className="lg:ml-[260px] pb-24 lg:pb-0">
          {steps.map((step, index) => (
            <section
              key={step.number}
              data-step={step.number}
              ref={(el) => { sectionRefs.current[index] = el; }}
              className="min-h-screen w-full flex items-start border-b border-white/[0.04] relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} pointer-events-none`} />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 -translate-y-1/2" style={{ background: step.accentColor }} />
              </div>

              <div className="relative w-full max-w-3xl px-8 sm:px-12 md:px-16 lg:px-12 py-20 lg:py-24">
                <div className="mb-6">
                  <span className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border ${step.borderColor} bg-white/5`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: step.accentColor }} />
                    {step.badge}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <div className="text-6xl md:text-7xl" style={{ filter: `drop-shadow(0 0 20px ${step.accentColor}60)` }}>
                    {step.icon}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-4xl font-black text-white/5 tabular-nums tracking-tight">
                    {String(step.number).padStart(2, '0')}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                  {step.title}
                </h2>

                {/* Step 1 gets the custom component, all others use the original prose renderer */}
                {step.number === 1 ? (
                  <Step1Content accentColor={step.accentColor} />
                ) : step.number === 2 ? (
                  <Step2Content accentColor={step.accentColor} />
                ) : step.number === 3 ? (
                  <Step3Content accentColor={step.accentColor} />
                ) : (
                  <div className="space-y-0">
                    {step.fullDescription.split('\n\n').map((para, i) => {
                      if (para.trim().startsWith('•')) {
                        const lines = para.trim().split('\n').filter(l => l.trim());
                        return (
                          <div key={i} className="my-5 space-y-2">
                            {lines.map((line, j) => {
                              if (line.trim().startsWith('•')) {
                                return (
                                  <div key={j} className="flex items-start gap-3">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: step.accentColor }} />
                                    <span className="text-base md:text-lg text-white/70 leading-relaxed">{line.replace('•', '').trim()}</span>
                                  </div>
                                );
                              }
                              return <p key={j} className="text-base md:text-lg text-white/80 font-semibold leading-relaxed">{line.trim()}</p>;
                            })}
                          </div>
                        );
                      }
                      return <p key={i} className="text-base md:text-lg text-white/70 leading-relaxed my-4">{para.trim()}</p>;
                    })}
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-between">
                  {step.number > 1 ? (
                    <button onClick={() => scrollToStep(step.number - 1)} className="text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-2">
                      ← Previous step
                    </button>
                  ) : <div />}
                  {step.number < steps.length ? (
                    <button onClick={() => scrollToStep(step.number + 1)} className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-white/70 hover:text-white">
                      Next: {steps[index + 1]?.title}
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  ) : (
                    <Link href="/home" className="group flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all" style={{ background: `linear-gradient(135deg, ${step.accentColor}40, ${step.accentColor}20)`, border: `1px solid ${step.accentColor}40` }}>
                      Start Building
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          ))}

          {/* Final CTA */}
          <section className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/10 to-pink-600/10 pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
            </div>
            <div className="relative text-center px-8 max-w-2xl mx-auto">
              <div className="text-8xl mb-8 animate-bounce">🎉</div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                You Know<br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  Ownquesta!
                </span>
              </h2>
              <p className="text-lg text-white/60 mb-10 leading-relaxed">
                From signing in to deploying a live AI model — you've walked through the complete AutoML workflow. Now it's time to build something real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/home" className="px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 transition-all hover:scale-105 shadow-xl shadow-violet-500/20">
                  🚀 Start Building Your Model
                </Link>
                <button onClick={() => scrollToStep(1)} className="px-8 py-4 rounded-2xl font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all">
                  ↑ Review Tutorial
                </button>
              </div>
            </div>
          </section>
        </div>

        <QuestaAgent />
      </div>
    </div>
  );
}