'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Logo from '../components/Logo';

const BACKEND_URL = 'http://127.0.0.1:8000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "How does Ownquesta work?",
    "What is the Lab Playground?",
    "How do I upload my dataset?",
    "What is Easy Mode vs Code Mode?",
    "How do I test my model?",
    "What is EDA?",
    "Do I need coding knowledge?",
    "How long does training take?",
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
    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 text-sm shadow-lg shadow-violet-500/30">✦</div>
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

  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', content: "Hi! I'm **Questa**, your Ownquesta assistant ✦ Ask me anything about the platform — how it works, what each step does, or how to get started!", timestamp: new Date() }]);
      setHasUnread(false);
    }
    if (isOpen) { setHasUnread(false); setTimeout(() => inputRef.current?.focus(), 300); }
  }, [isOpen, messages.length]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setShowSuggestions(false);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim(), timestamp: new Date() };
    const typingMsg: Message = { id: 'typing', role: 'assistant', content: '', timestamp: new Date(), isTyping: true };
    setMessages((prev) => [...prev, userMsg, typingMsg]);
    setInput('');
    setIsLoading(true);
    const history = messages.filter((m) => m.id !== 'typing' && m.id !== 'welcome' && !m.isTyping).map((m) => ({ role: m.role, content: m.content }));
    try {
      const res = await fetch(`${BACKEND_URL}/questa/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text.trim(), history }) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || `Server error ${res.status}`); }
      const data = await res.json();
      const replyText = data.reply || "I'm sorry, I couldn't process that. Please try again.";
      setMessages((prev) => [...prev.filter((m) => m.id !== 'typing'), { id: Date.now().toString() + '-reply', role: 'assistant', content: replyText, timestamp: new Date() }]);
      setBackendStatus('online');
    } catch (err: unknown) {
      const errorMessage = backendStatus === 'offline' ? 'Cannot reach the Ownquesta backend. Please make sure the server is running at http://127.0.0.1:8000' : `Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`;
      setMessages((prev) => [...prev.filter((m) => m.id !== 'typing'), { id: Date.now().toString() + '-err', role: 'assistant', content: errorMessage, timestamp: new Date() }]);
      setBackendStatus('offline');
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };
  const chatWidth = isExpanded ? 'w-[520px]' : 'w-[380px]';
  const chatHeight = isExpanded ? 'h-[640px]' : 'h-[520px]';
  const statusColor = backendStatus === 'online' ? 'bg-green-400' : backendStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse';
  const statusLabel = backendStatus === 'online' ? 'Connected' : backendStatus === 'offline' ? 'Backend offline' : 'Connecting...';
  const statusTextColor = backendStatus === 'online' ? 'text-green-400/70' : backendStatus === 'offline' ? 'text-red-400/70' : 'text-yellow-400/70';

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col items-end gap-3">
        {!isOpen && (
          <div onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-[rgba(15,10,30,0.95)] border border-violet-500/30 backdrop-blur-xl rounded-2xl px-4 py-2.5 shadow-xl shadow-violet-500/10 cursor-pointer hover:border-violet-400/50 transition-all" style={{ animation: 'fadeSlideUp 0.3s ease forwards' }}>
            <span className="text-violet-400 text-sm font-medium">Ask Questa anything</span>
            <span className="text-xs">💬</span>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/40 hover:scale-110 active:scale-95 transition-all duration-200">
          {isOpen ? (<svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>) : (<span className="text-xl">✦</span>)}
          {hasUnread && !isOpen && (<span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full border-2 border-[#060812] animate-pulse" />)}
          <span className={`absolute -bottom-1 -left-1 w-3 h-3 rounded-full border-2 border-[#060812] ${statusColor}`} title={`Backend: ${backendStatus}`} />
        </button>
      </div>
      {isOpen && (
        <div className={`fixed bottom-24 right-6 z-[199] ${chatWidth} ${chatHeight} flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-violet-900/50 border border-white/[0.08] bg-[rgba(8,6,20,0.97)] backdrop-blur-2xl transition-all duration-300`} style={{ animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)' }}>
          <div className="relative flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/5 pointer-events-none" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/30 text-lg flex-shrink-0">✦<span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#08061e] ${statusColor}`} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><h3 className="text-sm font-bold text-white">Questa</h3><span className="text-[10px] font-semibold text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-full border border-violet-400/20">Ownquesta AI</span></div>
              <p className={`text-[11px] mt-0.5 flex items-center gap-1.5 ${statusTextColor}`}><span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />{statusLabel}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white/60" title={isExpanded ? 'Compact' : 'Expand'}>
                {isExpanded ? (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15H4.5M9 15v4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>) : (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>)}
              </button>
              <button onClick={() => { setMessages([]); setShowSuggestions(true); }} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-white/30 hover:text-white/60" title="Clear chat">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.isTyping ? (<TypingDots />) : msg.role === 'assistant' ? (
                  <div className="flex items-start gap-2.5 max-w-[88%]">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 text-sm shadow-lg shadow-violet-500/20 mt-1">✦</div>
                    <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-md px-4 py-3">
                      <div className="text-[13px] text-white/85 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                      <p className="text-[10px] text-white/20 mt-2">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-gradient-to-br from-violet-600/80 to-fuchsia-600/80 rounded-2xl rounded-tr-md px-4 py-3 shadow-lg shadow-violet-500/10 border border-violet-400/20">
                      <p className="text-[13px] text-white leading-relaxed">{msg.content}</p>
                      <p className="text-[10px] text-violet-200/40 mt-1.5 text-right">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
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
                    <button key={q} onClick={() => sendMessage(q)} className="text-[11px] text-violet-300/80 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-400/40 rounded-xl px-3 py-1.5 transition-all hover:-translate-y-0.5 text-left">{q}</button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t border-white/[0.06] p-4 flex-shrink-0">
            {backendStatus === 'offline' && (
              <div className="mb-3 flex items-center gap-2 text-[11px] text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <span>⚠</span><span>Backend offline — run server at <code className="text-red-300">127.0.0.1:8000</code></span>
              </div>
            )}
            <div className="flex items-end gap-2 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 focus-within:border-violet-500/40 focus-within:bg-violet-500/[0.03] transition-all">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about Ownquesta..." rows={1} disabled={isLoading} className="flex-1 bg-transparent text-[13px] text-white placeholder-white/20 resize-none outline-none leading-relaxed max-h-24 overflow-y-auto disabled:opacity-50" style={{ scrollbarWidth: 'none' }} />
              <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-violet-500/20">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              </button>
            </div>
            <p className="text-[10px] text-white/15 text-center mt-2">Powered by Ownquesta AI · Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.3); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.5); }
      `}</style>
    </>
  );
}

// ─────────────────────────────────────────────
// HOME PAGE MOCKUP — Step 1
// ─────────────────────────────────────────────
function HomePageMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-900/40 bg-[#0e0b1e]" style={{ aspectRatio: '16/9' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#100c2a] via-[#0e0b22] to-[#060412]">
        {Array.from({ length: 60 }).map((_, i) => {
          const s1 = ((i + 1) * 2654435761) >>> 0; const s2 = (s1 ^ (s1 >>> 16)) * 0x45d9f3b >>> 0; const s3 = (s2 ^ (s2 >>> 16)) * 0x45d9f3b >>> 0; const s4 = (s3 ^ (s3 >>> 16)) >>> 0; const s5 = (s4 * 1664525 + 1013904223) >>> 0;
          const top = (s1 % 9901) / 100; const left = (s2 % 9901) / 100; const opacity = 0.1 + (s3 % 60) / 100; const w = (s4 % 5) > 3 ? '2px' : '1px'; const h = (s5 % 5) > 3 ? '2px' : '1px';
          return <div key={i} className="absolute rounded-full bg-white" style={{ width: w, height: h, top: `${top}%`, left: `${left}%`, opacity }} />;
        })}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-violet-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-indigo-800/20 rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 z-10 border-b border-white/[0.06]">
        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white">✦</div><span className="text-white text-sm font-bold tracking-tight">Ownquesta</span></div>
        <div className="flex items-center gap-2.5">
          <button className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-semibold text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] hover:text-white">
            Sign In
          </button>
          <button className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-semibold text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] hover:text-white">
            About
          </button>
          <button className="rounded-full border border-amber-300/35 bg-gradient-to-r from-amber-200 via-orange-300 to-fuchsia-500 px-3.5 py-1.5 text-[10px] font-bold text-slate-950 shadow-[0_10px_24px_rgba(251,191,36,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-100 hover:via-orange-200 hover:to-fuchsia-400 hover:shadow-[0_14px_32px_rgba(251,191,36,0.36)]">
            Tutorial
          </button>
          <button className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-semibold text-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.07] hover:text-white">
            Help
          </button>
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10 pt-6">
        <div className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/50 border border-white/10 rounded-full px-3 py-1 mb-4 bg-white/5"><span className="w-1 h-1 rounded-full bg-violet-400" />No-Code AI Platform</div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3 tracking-tight">From Raw Data to<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Intelligent Models</span></h1>
        <p className="text-[10px] sm:text-xs text-white/50 max-w-sm mb-5 leading-relaxed">A complete no-code AI platform to explore datasets, create features, and train production-ready ML and deep learning models—instantly.</p>
        <div className="flex gap-2 mb-5 w-full max-w-md">
          {[{ num: '01', title: 'Upload Dataset', sub: 'Any format, any size' }, { num: '02', title: 'Understand Data', sub: 'AI-powered analysis' }, { num: '03', title: 'Build Model', sub: 'One-click deployment' }].map((card) => (
            <div key={card.num} className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-2.5"><div className="text-[8px] text-violet-400/60 font-bold mb-1">{card.num}</div><div className="text-[10px] font-semibold text-white">{card.title}</div><div className="text-[8px] text-white/40">{card.sub}</div></div>
          ))}
        </div>
        <div className="flex gap-2.5"><div className="px-5 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl text-[11px] font-bold text-white shadow-lg shadow-violet-500/30">Get Started Free →</div><div className="px-5 py-2 border border-white/15 rounded-xl text-[11px] font-medium text-white/70 bg-white/5">Learn More</div></div>
      </div>
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
    </div>
  );
}

const homePageAnnotations = [
  { icon: '🔷', label: 'Navbar', color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', description: 'Fixed top bar with the Ownquesta logo (✦) on the left and three nav items on the right: Sign In, About, and Tutorial — which is highlighted in violet since you\'re already on this page.' },
  { icon: '✦', label: 'No-Code AI Platform Badge', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', description: 'A small pill badge just above the headline. It identifies Ownquesta as a "No-Code AI Platform" — meaning you don\'t write any machine learning code yourself.' },
  { icon: '🎯', label: 'Hero Headline', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', description: '"From Raw Data to Intelligent Models" — the main value proposition in two lines. "Intelligent Models" is rendered in a violet-to-fuchsia gradient to emphasize the AI-powered output.' },
  { icon: '📦', label: '3 Workflow Cards', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', description: 'Three numbered cards show the platform\'s pipeline: 01 Upload Dataset, 02 Understand Data, 03 Build Model. These map directly to the steps you\'ll follow in this tutorial.' },
  { icon: '🚀', label: 'Get Started Free', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', description: 'The primary CTA button — a violet gradient pill with an arrow. Clicking this takes you to the Sign In page, which is your next step (Step 2) in this tutorial.' },
  { icon: '📖', label: 'Learn More', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', description: 'A secondary ghost button next to "Get Started Free". It leads to the About / feature overview section — useful if you want to understand Ownquesta\'s capabilities before signing up.' },
];

function Step1Content({ accentColor }: { accentColor: string }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  return (
    <div className="space-y-12">
      <div className="space-y-4"><p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-4xl">When you navigate to <strong className="text-white">ownquesta.com</strong>, you land on the <strong className="text-white">Home Page</strong> — a dark, starfield-themed interface built around a single goal: get you from raw data to a deployed ML model with zero code. Below is an exact replica of what you'll see, followed by a breakdown of every UI element on the page.</p></div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full bg-violet-400" /><p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Ownquesta Home Page</p></div>
        <div className="mx-auto w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60"><HomePageMockup /></div>
        <p className="text-[11px] text-white/25 text-center max-w-3xl mx-auto">↑ Interactive replica of the actual Ownquesta home page</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5"><span className="w-2 h-2 rounded-full" style={{ background: accentColor }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — Click to Explore</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {homePageAnnotations.map((ann, i) => (
            <button key={i} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)} className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5" style={{ background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)', borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3 mb-2"><span className="text-xl">{ann.icon}</span><span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span><span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span></div>
              {activeAnnotation === i && <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-violet-500/15 bg-violet-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-violet-300 flex items-center gap-2"><span>✦</span> What To Do On The Home Page</h4>
        <div className="space-y-3">
          {[{ step: '1', text: 'Read the headline — "From Raw Data to Intelligent Models" tells you the full scope: you supply the data, Ownquesta handles analysis, training, and deployment.' }, { step: '2', text: 'Look at the 3 workflow cards (01 Upload Dataset → 02 Understand Data → 03 Build Model). These are the three macro-phases you\'ll go through in this tutorial.' }, { step: '3', text: 'Click "Get Started Free" (the violet gradient button) to go to the Sign In page — that\'s Step 2 of this tutorial.' }, { step: '4', text: 'Any time you want to return to this tutorial, click the "Tutorial" button in the top-right navbar — it\'s always there.' }].map((item) => (
            <div key={item.step} className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-[11px] font-bold text-violet-300 flex-shrink-0 mt-0.5">{item.step}</span><p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SIGN IN PAGE MOCKUP — Step 2
// ─────────────────────────────────────────────
function SignInMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-blue-500/20 shadow-2xl shadow-blue-900/40" style={{ aspectRatio: '16/9', background: '#0d0b1e' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 40%, #1a1040 0%, #0d0b1e 70%)' }}>
        {Array.from({ length: 55 }).map((_, i) => (<div key={i} className="absolute rounded-full bg-white" style={{ width: i % 5 === 0 ? '2px' : '1px', height: i % 5 === 0 ? '2px' : '1px', top: `${(i * 17 + 3) % 100}%`, left: `${(i * 23 + 7) % 100}%`, opacity: 0.15 + (i % 4) * 0.1 }} />))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex rounded-2xl overflow-hidden shadow-2xl" style={{ width: '68%', maxWidth: 520 }}>
          <div className="flex flex-col justify-between p-5 flex-shrink-0" style={{ width: '42%', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)' }}>
            <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-sm font-bold">✦</div><span className="text-white text-sm font-bold">Ownquesta</span></div>
            <div className="mt-4">
              <h2 className="text-white font-black text-base leading-snug mb-2">Unlock the power of your data</h2>
              <p className="text-white/65 text-[9px] leading-relaxed mb-4">Join thousands of teams using Ownquesta to build production-ready AI models without writing a single line of code.</p>
              <div className="space-y-1.5">{['Advanced AI-powered tools', 'Secure cloud storage', 'Explainable AI results'].map((feat) => (<div key={feat} className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-white/20 border border-white/40 flex items-center justify-center flex-shrink-0"><span className="text-white text-[7px]">✓</span></div><span className="text-white/80 text-[9px]">{feat}</span></div>))}</div>
            </div>
          </div>
          <div className="flex flex-col justify-center p-5 flex-1" style={{ background: '#111827' }}>
            <h3 className="text-white font-black text-base mb-0.5">Welcome Back</h3>
            <p className="text-[9px] text-white/45 mb-4">Don't have an account? <span className="text-violet-400 font-semibold">Create one</span></p>
            <div className="mb-3"><label className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1 block">EMAIL</label><div className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[9px] text-white/25">you@example.com</div></div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1"><label className="text-[8px] font-bold text-white/50 uppercase tracking-widest">PASSWORD</label><span className="text-[8px] text-white/35">Forgot password?</span></div>
              <div className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[9px] text-white/25 flex items-center justify-between"><span>Enter your password</span><span className="text-white/30 text-[10px]">👁</span></div>
            </div>
            <div className="w-full py-2 rounded-lg text-center text-[10px] font-bold text-white mb-3" style={{ background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)' }}>Sign In</div>
            <div className="flex items-center gap-2 mb-3"><div className="flex-1 h-px bg-white/10" /><span className="text-[8px] text-white/25">or continue with</span><div className="flex-1 h-px bg-white/10" /></div>
            <div className="w-full py-2 rounded-lg border border-white/10 bg-white/5 text-center text-[9px] text-white/70 flex items-center justify-center gap-2"><span className="font-bold text-[10px]">G</span><span>Continue with Google</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const signInAnnotations = [
  { icon: '🟣', label: 'Left Branding Panel', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', description: 'The violet left panel shows the Ownquesta logo and a short pitch: "Unlock the power of your data." Below it are three feature highlights — Advanced AI-powered tools, Secure cloud storage, and Explainable AI results.' },
  { icon: '👋', label: 'Welcome Back Heading', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', description: '"Welcome Back" is shown for returning users. If you don\'t have an account yet, click "Create one" (the violet link next to the subtext) to be taken to the registration form.' },
  { icon: '📧', label: 'Email Field', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', description: 'Enter the email address you used to register. The placeholder shows "you@example.com" as a hint. This field is required for both Sign In and account creation.' },
  { icon: '🔒', label: 'Password Field + Forgot', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', description: 'Enter your password here. The 👁 icon on the right toggles visibility. If you\'ve forgotten your password, click "Forgot password?" (top-right of this field) to receive a reset email.' },
  { icon: '🚀', label: 'Sign In Button', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', description: 'The full-width violet gradient "Sign In" button submits your email and password. On success, you\'re taken directly to your Dashboard or the Welcome page.' },
  { icon: '🔵', label: 'Continue with Google', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', description: 'Skip the form entirely — click this button to sign in (or register) using your Google account. No password needed. This is the fastest way to get started.' },
];

function Step2Content({ accentColor }: { accentColor: string }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  return (
    <div className="space-y-12">
      <p className="text-lg md:text-xl text-white/70 leading-relaxed">After clicking <strong className="text-white">"Get Started Free"</strong> on the home page, you land on the <strong className="text-white">Sign In page</strong> — a two-panel card centered on a dark starfield background. The left panel reinforces what Ownquesta offers; the right panel is where you authenticate.</p>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full bg-blue-400" /><p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Ownquesta Sign In Page</p></div>
        <div className="mx-auto w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60"><SignInMockup /></div>
        <p className="text-[11px] text-white/25 text-center max-w-3xl mx-auto">↑ Replica of the actual Ownquesta Sign In page</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5"><span className="w-2 h-2 rounded-full" style={{ background: accentColor }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — Click to Explore</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {signInAnnotations.map((ann, i) => (<button key={i} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)} className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5" style={{ background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)', borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)' }}><div className="flex items-center gap-3 mb-2"><span className="text-xl">{ann.icon}</span><span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span><span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span></div>{activeAnnotation === i && <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>}</button>))}
        </div>
      </div>
      <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-blue-300 flex items-center gap-2"><span>🔐</span> What To Do On The Sign In Page</h4>
        <div className="space-y-3">
          {[{ step: '1', text: 'New user? Click "Create one" next to "Don\'t have an account?" to register with your name, email, and password.' }, { step: '2', text: 'Returning user? Enter your email and password, then click "Sign In" — you\'ll be taken straight to your Dashboard.' }, { step: '3', text: 'Prefer Google? Click "Continue with Google" to authenticate instantly — no form-filling needed.' }, { step: '4', text: 'Forgot your password? Click "Forgot password?" above the password field to get a reset link sent to your email.' }].map((item) => (<div key={item.step} className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[11px] font-bold text-blue-300 flex-shrink-0 mt-0.5">{item.step}</span><p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p></div>))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// WELCOME PAGE MOCKUP — Step 3
// ─────────────────────────────────────────────
function WelcomeMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-orange-500/20 shadow-2xl shadow-purple-900/40" style={{ aspectRatio: '16/9', background: '#0d0b1e' }}>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, #1e1040 0%, #0d0b1e 65%)' }}>
        {Array.from({ length: 70 }).map((_, i) => (<div key={i} className="absolute rounded-full bg-white" style={{ width: i % 6 === 0 ? '2px' : '1px', height: i % 6 === 0 ? '2px' : '1px', top: `${(i * 13 + 5) % 100}%`, left: `${(i * 19 + 11) % 100}%`, opacity: 0.1 + (i % 5) * 0.08 }} />))}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-48 rounded-full blur-3xl" style={{ background: 'rgba(109,40,217,0.18)' }} />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 rounded-full blur-3xl" style={{ background: 'rgba(88,28,220,0.12)' }} />
      </div>
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-2.5 z-10">
        <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[10px] font-bold text-white">✦</div><span className="text-white text-xs font-bold tracking-tight">Ownquesta</span></div>
        <div className="flex items-center gap-1.5"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">S</div><span className="text-white/40 text-[9px]">▾</span></div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <div className="inline-flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/50 border border-white/10 rounded-full px-3 py-1 mb-4 bg-white/5"><span className="w-1 h-1 rounded-full bg-violet-400" />Welcome Back</div>
        <h1 className="font-black text-white leading-tight mb-2" style={{ fontSize: 'clamp(14px, 3vw, 28px)' }}>Hey sumit,{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-fuchsia-300">ready to build?</span></h1>
        <p className="text-[9px] text-white/40 max-w-xs mb-5 leading-relaxed">Transform your data into powerful AI models — no coding required. Your next breakthrough is just one click away.</p>
        <div className="flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold text-white mb-6 shadow-lg" style={{ background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}><span className="text-[11px]">⊞</span>Go to Dashboard</div>
        <div className="flex gap-2.5">{[{ value: '50+', label: 'Models' }, { value: 'Auto', label: 'Algorithms' }, { value: '95%', label: 'Time Saved' }].map((stat) => (<div key={stat.label} className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.06] text-center min-w-[60px]"><div className="text-white font-black text-sm leading-none mb-0.5">{stat.value}</div><div className="text-white/40 text-[8px]">{stat.label}</div></div>))}</div>
      </div>
    </div>
  );
}

const welcomeAnnotations = [
  { icon: '🔷', label: 'Top Navbar', color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', description: 'The top-left shows the Ownquesta logo. The top-right shows your profile avatar (a circular icon with your initial) plus a dropdown arrow — click it to access account settings or sign out.' },
  { icon: '✦', label: '"WELCOME BACK" Badge', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', description: 'A small pill badge at the top of the center content confirms you\'re authenticated and back in your workspace. It appears every time you return after signing in.' },
  { icon: '👋', label: 'Personalized Headline', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', description: '"Hey [your name], ready to build?" — the headline uses your actual account name. "ready to build?" is rendered in a violet-to-fuchsia gradient, reinforcing the platform\'s action-oriented tone.' },
  { icon: '💬', label: 'Subtitle Text', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', description: '"Transform your data into powerful AI models — no coding required." This confirms the no-code promise and primes you to click the CTA below.' },
  { icon: '🚀', label: '"Go to Dashboard" Button', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', description: 'The main CTA — a glowing violet button with a grid icon (⊞) and the label "Go to Dashboard". Clicking this takes you to Step 4: your project command center where all ML work happens.' },
  { icon: '📊', label: '3 Platform Stat Cards', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', description: 'Three dark rounded cards below the button highlight platform capabilities: 50+ Models (pre-built algorithms), Auto Algorithms (automatic model selection), and 95% Time Saved (vs manual ML coding).' },
];

function Step3Content({ accentColor }: { accentColor: string }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  return (
    <div className="space-y-12">
      <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-4xl">After signing in, you're taken directly to the <strong className="text-white">Welcome Page</strong> — a full-screen dark interface that greets you by name and gives you a one-click path to your workspace.</p>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full bg-orange-400" /><p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Ownquesta Welcome Page</p></div>
        <div className="mx-auto w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60"><WelcomeMockup /></div>
        <p className="text-[11px] text-white/25 text-center max-w-3xl mx-auto">↑ Replica of the actual Ownquesta Welcome page</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5"><span className="w-2 h-2 rounded-full" style={{ background: accentColor }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — Click to Explore</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {welcomeAnnotations.map((ann, i) => (<button key={i} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)} className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5" style={{ background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)', borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)' }}><div className="flex items-center gap-3 mb-2"><span className="text-xl">{ann.icon}</span><span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span><span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span></div>{activeAnnotation === i && <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>}</button>))}
        </div>
      </div>
      <div className="rounded-2xl border border-orange-500/15 bg-orange-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-orange-300 flex items-center gap-2"><span>🏠</span> What To Do On The Welcome Page</h4>
        <div className="space-y-3">
          {[{ step: '1', text: 'Confirm it greets you by name — if it shows the wrong name, check your account profile from the avatar dropdown in the top-right.' }, { step: '2', text: 'Note the 3 stat cards: 50+ Models, Auto Algorithms, and 95% Time Saved — these represent the platform\'s core strengths you\'ll experience through the tutorial.' }, { step: '3', text: 'Click "Go to Dashboard" (the violet button with the ⊞ icon) — this is your next step and takes you to your main project workspace.' }, { step: '4', text: 'This page reappears each time you sign in, so it\'s always a clean, focused entry point back into your work.' }].map((item) => (<div key={item.step} className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[11px] font-bold text-orange-300 flex-shrink-0 mt-0.5">{item.step}</span><p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p></div>))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD MOCKUP — Step 4
// ─────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-900/40" style={{ aspectRatio: '16/9', background: '#0b0d14' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0d0f1a 0%, #090b12 100%)' }} />
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 z-10 border-b border-white/[0.05]" style={{ background: '#0b0d14' }}>
        <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[8px] font-bold text-white">✦</div><span className="text-white text-[11px] font-bold">Ownquesta</span></div>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/10 bg-white/5 text-[8px] text-white/50"><span>→</span><span>Home</span></div><div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-[8px] font-bold text-white">S</div><span className="text-[8px] text-white/60">sumit sarodiya</span><span className="text-white/30 text-[8px]">▾</span></div></div>
      </div>
      <div className="absolute inset-0 pt-8 px-5 pb-3 overflow-hidden z-10">
        <div className="flex items-start justify-between mb-3">
          <div><h2 className="text-white font-black text-sm leading-none mb-0.5">Welcome back, <span className="text-violet-400">sumit</span></h2><p className="text-[8px] text-white/35">Your ML workspace — track every project from dataset to deployment.</p></div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[8px] font-bold text-white" style={{ background: 'linear-gradient(90deg,#7c3aed,#8b5cf6)' }}><span>+</span> New Project</div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[{ label: 'TOTAL PROJECTS', value: '0', sub: 'all time', border: 'border-white/[0.07]', bg: 'bg-white/[0.03]' }, { label: 'ACTIVE PROJECTS', value: '0', sub: 'in progress', border: 'border-white/[0.07]', bg: 'bg-white/[0.03]' }, { label: 'COMPLETED MODELS', value: '2', sub: 'trained or evaluated', border: 'border-green-500/20', bg: 'bg-green-500/[0.04]' }].map((card) => (<div key={card.label} className={`rounded-xl border ${card.border} ${card.bg} p-3`}><div className="text-[7px] font-bold uppercase tracking-widest text-white/30 mb-1">{card.label}</div><div className="text-white font-black text-xl leading-none mb-0.5">{card.value}</div><div className="text-[7px] text-white/30">{card.sub}</div></div>))}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 mb-3">
          <div className="text-[7px] font-bold uppercase tracking-widest text-white/30 mb-2">ML Pipeline Stages</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[{ n: '1', title: 'Upload Dataset', sub: 'CSV / Excel file loaded into the lab', color: '#7c3aed' }, { n: '2', title: 'EDA & Analysis', sub: 'AI profiles data and suggests models', color: '#6d28d9' }, { n: '3', title: 'Model Training', sub: 'Full ML pipeline generated & executed', color: '#5b21b6' }, { n: '4', title: 'Evaluation', sub: 'Predictions tested with real inputs', color: '#4c1d95' }].map((s) => (<div key={s.n} className="flex items-start gap-2"><div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[7px] font-bold flex-shrink-0 mt-0.5" style={{ background: s.color }}>{s.n}</div><div><div className="text-white text-[8px] font-semibold leading-none mb-0.5">{s.title}</div><div className="text-white/35 text-[7px] leading-tight">{s.sub}</div></div></div>))}
          </div>
        </div>
        <div>
          <div className="text-white text-[10px] font-black mb-2">My Projects</div>
          <div className="rounded-xl border border-white/[0.06] border-dashed bg-white/[0.015] p-4 flex flex-col items-center justify-center text-center" style={{ minHeight: 80 }}>
            <div className="w-7 h-7 rounded-xl bg-indigo-900/60 flex items-center justify-center text-sm mb-1.5">✏️</div>
            <div className="text-white text-[9px] font-bold mb-0.5">No projects yet</div>
            <div className="text-white/30 text-[7px] leading-relaxed mb-2 max-w-[180px]">Start a new ML project in the Lab Playground — upload a dataset and let the AI agent build a complete pipeline for you.</div>
            <div className="px-3 py-1 rounded-lg text-[8px] font-bold text-white" style={{ background: '#7c3aed' }}>New Project</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const dashboardAnnotations = [
  { icon: '🔷', label: 'Top Navbar', color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', description: 'Fixed top bar with the Ownquesta logo, a "→ Home" button to return to the Welcome page, and your profile (avatar + "sumit sarodiya" + dropdown arrow) for account settings and sign out.' },
  { icon: '👋', label: 'Welcome Header + New Project', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', description: '"Welcome back, sumit" with your name in violet, plus the subtitle "Your ML workspace — track every project from dataset to deployment." The "＋ New Project" violet button top-right starts a new ML project.' },
  { icon: '📊', label: '3 Stat Cards', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', description: 'Three cards show live workspace stats: Total Projects (all time), Active Projects (in progress), and Completed Models (trained or evaluated — shown in green). These update automatically as you work.' },
  { icon: '⚙️', label: 'ML Pipeline Stages', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', description: 'Four numbered stages show the full ML workflow: 1 Upload Dataset → 2 EDA & Analysis → 3 Model Training → 4 Evaluation. Each has a short description of what happens at that stage automatically.' },
  { icon: '📁', label: 'My Projects Section', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', description: 'Lists all your ML projects. When empty, it shows "No projects yet" with a ✏️ icon and an explanation. Once you create projects, each appears here with name, status, and model accuracy.' },
  { icon: '➕', label: '"New Project" CTA (in empty state)', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', description: 'The violet "New Project" button inside the empty projects area — clicking either this or the top-right button opens the project creation flow, which is covered in Step 5 of this tutorial.' },
];

function Step4Content({ accentColor }: { accentColor: string }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  return (
    <div className="space-y-12">
      <p className="text-lg md:text-xl text-white/70 leading-relaxed">After clicking <strong className="text-white">"Go to Dashboard"</strong> on the Welcome page, this is your central workspace — the <strong className="text-white">Dashboard</strong>. It shows your project stats, the ML pipeline overview, and all your projects at a glance.</p>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full bg-purple-400" /><p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Ownquesta Dashboard</p></div>
        <div className="mx-auto w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60"><DashboardMockup /></div>
        <p className="text-[11px] text-white/25 text-center max-w-3xl mx-auto">↑ Replica of the actual Ownquesta Dashboard</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5"><span className="w-2 h-2 rounded-full" style={{ background: accentColor }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — Click to Explore</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dashboardAnnotations.map((ann, i) => (<button key={i} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)} className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5" style={{ background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)', borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)' }}><div className="flex items-center gap-3 mb-2"><span className="text-xl">{ann.icon}</span><span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span><span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span></div>{activeAnnotation === i && <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>}</button>))}
        </div>
      </div>
      <div className="rounded-2xl border border-purple-500/15 bg-purple-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2"><span>📊</span> What To Do On The Dashboard</h4>
        <div className="space-y-3">
          {[{ step: '1', text: 'Check your 3 stat cards at the top — Total Projects, Active Projects, and Completed Models. These update in real time as you work.' }, { step: '2', text: 'Read the ML Pipeline Stages panel to understand the 4-step automated workflow: Upload Dataset → EDA & Analysis → Model Training → Evaluation.' }, { step: '3', text: 'When you\'re ready to start, click either "＋ New Project" button (top-right or inside the empty state) to begin building your first ML model.' }, { step: '4', text: 'As your projects grow, each will appear in "My Projects" with its status and accuracy. You can resume any project from here at any time.' }].map((item) => (<div key={item.step} className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[11px] font-bold text-purple-300 flex-shrink-0 mt-0.5">{item.step}</span><p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p></div>))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// NEW PROJECT MODAL MOCKUP — Step 5
// ─────────────────────────────────────────────
function NewProjectMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-pink-500/20 shadow-2xl shadow-purple-900/40" style={{ aspectRatio: '16/9', background: '#080a10' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0b0d18 0%,#070810 100%)' }} />
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="rounded-2xl border border-white/10 shadow-2xl w-[52%]" style={{ background: '#151929', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
          <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-white/[0.06]"><div className="w-7 h-7 rounded-xl bg-indigo-800/60 flex items-center justify-center text-sm">✏️</div><div><div className="text-white text-[11px] font-black">New Project</div><div className="text-white/35 text-[8px]">Set up your project before uploading data</div></div></div>
          <div className="px-5 py-3 space-y-3">
            <div><label className="text-[8px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1 mb-1">Project Name <span className="text-red-400">*</span></label><div className="w-full rounded-lg border border-violet-500/50 bg-white/[0.04] px-3 py-1.5 text-[9px] text-white/25 ring-1 ring-violet-500/20">🖊 Customer Churn Prediction</div></div>
            <div>
              <label className="text-[8px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-1 mb-1.5">Prediction Goal <span className="text-red-400">*</span></label>
              <div className="space-y-1">
                {[{ icon: '🤖', title: 'Auto-detect', sub: 'Let the AI figure out the best approach', color: '#6d28d9' }, { icon: '🏷️', title: 'Predict a category', sub: 'e.g. spam detection, churn, diagnosis', color: '#5b21b6' }, { icon: '🔢', title: 'Predict a number', sub: 'e.g. house price, sales forecast', color: '#4c1d95' }, { icon: '🔵', title: 'Group similar items', sub: 'e.g. customer segments, topic discovery', color: '#4338ca' }, { icon: '⚠️', title: 'Detect anomalies', sub: 'e.g. fraud detection, equipment failure', color: '#3730a3' }].map((opt) => (<div key={opt.title} className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03]"><div className="w-4 h-4 rounded flex items-center justify-center text-[9px] flex-shrink-0" style={{ background: `${opt.color}55` }}>{opt.icon}</div><div><div className="text-white text-[8px] font-semibold leading-none mb-0.5">{opt.title}</div><div className="text-white/30 text-[7px]">{opt.sub}</div></div></div>))}
              </div>
            </div>
            <div><label className="text-[8px] font-bold text-white/50 uppercase tracking-widest mb-1 flex items-center gap-1">Target Column <span className="text-white/25 font-normal normal-case">(optional – can be set later)</span></label><div className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[8px] text-white/20">e.g. Churn, Price, label — leave blank to auto-detect</div></div>
            <div className="flex items-center gap-1.5 text-[8px] text-yellow-400/80"><span>⚠</span><span>Project Name and Prediction Goal are required.</span></div>
            <div className="flex gap-2 pt-1 pb-1"><div className="px-4 py-1.5 rounded-lg border border-white/10 text-[9px] text-white/50 bg-white/[0.03]">Cancel</div><div className="flex-1 py-1.5 rounded-lg text-[9px] font-bold text-white text-center flex items-center justify-center gap-1.5" style={{ background: 'linear-gradient(90deg,#4f46e5,#7c3aed)' }}><span className="text-[10px]">⊞</span> Start Project</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const newProjectAnnotations = [
  { icon: '✏️', label: 'Modal Header', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', description: '"New Project" modal appears as an overlay on top of the Dashboard. The header shows a pencil icon, the title "New Project", and the subtitle "Set up your project before uploading data".' },
  { icon: '📝', label: 'Project Name Field (required)', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', description: 'A text input highlighted with a violet border. Type a descriptive name for your project — e.g. "Customer Churn Prediction". The red asterisk (*) means this field is required before you can proceed.' },
  { icon: '🤖', label: 'Auto-detect', color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', description: 'The first Prediction Goal option — "Let the AI figure out the best approach." Choose this if you\'re unsure what type of ML task your data needs. The AI will analyze and decide automatically.' },
  { icon: '🏷️', label: 'Predict a category / number / group / anomaly', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', description: 'Four specific goal options: Predict a category (classification), Predict a number (regression), Group similar items (clustering), and Detect anomalies (anomaly detection). Pick the one matching your use case.' },
  { icon: '🎯', label: 'Target Column (optional)', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', description: 'Optionally specify which column in your CSV is the output you want to predict — e.g. "Churn", "Price", or "label". If left blank, the AI will auto-detect the target column from your uploaded dataset.' },
  { icon: '🚀', label: 'Cancel / Start Project buttons', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', description: '"Cancel" dismisses the modal and returns to the Dashboard. "⊞ Start Project" (the indigo gradient button) submits the form and creates your project — only enabled when Project Name and Prediction Goal are filled.' },
];

function Step5Content({ accentColor }: { accentColor: string }) {
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  return (
    <div className="space-y-12">
      <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-4xl">From the Dashboard, click either <strong className="text-white">"＋ New Project"</strong> button and a modal appears over the page. This is where you name your project and choose what kind of ML prediction you want to make — before uploading any data.</p>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full bg-pink-400" /><p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — New Project Modal</p></div>
        <div className="mx-auto w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60"><NewProjectMockup /></div>
        <p className="text-[11px] text-white/25 text-center max-w-3xl mx-auto">↑ Replica of the actual New Project modal</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5"><span className="w-2 h-2 rounded-full" style={{ background: accentColor }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — Click to Explore</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {newProjectAnnotations.map((ann, i) => (<button key={i} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)} className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5" style={{ background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)', borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)' }}><div className="flex items-center gap-3 mb-2"><span className="text-xl">{ann.icon}</span><span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span><span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span></div>{activeAnnotation === i && <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>}</button>))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-3">
        <h4 className="text-sm font-bold text-white/70 flex items-center gap-2"><span>🎯</span> Prediction Goal Quick Reference</h4>
        <div className="space-y-2">
          {[{ goal: 'Auto-detect', when: 'Not sure what your data needs — let the AI decide', example: 'Any dataset' }, { goal: 'Predict a category', when: 'Output is a label or class', example: 'Spam / Not Spam, Churn / Stay' }, { goal: 'Predict a number', when: 'Output is a continuous value', example: 'House price, Sales revenue' }, { goal: 'Group similar items', when: 'No labels — find natural clusters', example: 'Customer segments, Topic groups' }, { goal: 'Detect anomalies', when: 'Find rare or unusual data points', example: 'Fraud, Equipment failures' }].map((row) => (<div key={row.goal} className="flex items-start gap-3 py-2 border-b border-white/[0.05] last:border-0"><span className="text-[11px] font-bold text-white/80 w-36 flex-shrink-0">{row.goal}</span><span className="text-[11px] text-white/45 flex-1">{row.when}</span><span className="text-[10px] text-white/25 italic hidden sm:block">{row.example}</span></div>))}
        </div>
      </div>
      <div className="rounded-2xl border border-pink-500/15 bg-pink-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-pink-300 flex items-center gap-2"><span>✨</span> What To Do In The New Project Modal</h4>
        <div className="space-y-3">
          {[{ step: '1', text: 'Type a clear, descriptive Project Name — e.g. "Customer Churn Prediction". The red * means this is required.' }, { step: '2', text: 'Choose a Prediction Goal. If unsure, pick "Auto-detect" and the AI will figure out the best ML approach from your data.' }, { step: '3', text: 'Optionally enter a Target Column name if you already know which column in your CSV is the prediction output. You can skip this — it can be set later.' }, { step: '4', text: 'Click "⊞ Start Project" — the button activates once both required fields are filled. The ⚠ warning at the bottom disappears when you\'re ready.' }].map((item) => (<div key={item.step} className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-[11px] font-bold text-pink-300 flex-shrink-0 mt-0.5">{item.step}</span><p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p></div>))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LAB PLAYGROUND MOCKUPS — Steps 6, 7, 8
// ─────────────────────────────────────────────
function LabPlaygroundMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-900/30" style={{ aspectRatio: '16/9', background: '#080a0f' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0a0c14 0%,#060810 100%)' }} />
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 z-10 border-b border-white/[0.06]" style={{ background: '#0b0d16' }}>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1 px-2 py-1 rounded-md border border-white/10 bg-white/[0.04] text-[7px] text-white/50"><span>←</span><span>Dashboard</span></div><div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[8px]">🧪</div><span className="text-white text-[10px] font-black">Lab Playground</span><span className="px-1.5 py-0.5 rounded text-[6px] font-bold uppercase tracking-widest text-white/50 border border-white/10 bg-white/5">BETA</span></div></div>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1 text-[7px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/70">backend</span></div><div className="flex items-center gap-1 text-[7px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/70">agent</span></div><div className="flex items-center gap-1 text-[7px]"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /><span className="text-white/30">no session</span></div><div className="flex items-center gap-1 px-2 py-1 rounded-md text-[7px] font-bold text-white border border-violet-500/40 bg-violet-500/10">✨ Easy Mode <span className="text-violet-300/60 font-normal ml-0.5">(active)</span></div><div className="flex items-center gap-1 px-2 py-1 rounded-md text-[7px] text-white/50 border border-white/10 bg-white/[0.03]">Reset Kernel</div></div>
      </div>
      <div className="absolute inset-0 top-8 flex z-10">
        <div className="flex-1 flex flex-col border-r border-white/[0.05]">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-yellow-500/20 bg-yellow-500/5"><span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" /><span className="text-[7px] text-yellow-300/80"><strong className="font-bold">pip install</strong> and heavy DL libraries are restricted.</span></div>
          <div className="m-2 rounded-lg border border-white/[0.07] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-2 py-1 border-b border-white/[0.05]"><span className="text-white/30 text-[7px]">[1]</span><div className="w-4 h-4 rounded-full border border-green-400/50 flex items-center justify-center"><span className="text-green-400 text-[8px]">▶</span></div><div className="ml-auto flex items-center gap-1">{['↑','↓','+','🗑'].map((ic) => (<div key={ic} className="w-4 h-4 rounded flex items-center justify-center text-[8px] text-white/30 border border-white/[0.06]">{ic}</div>))}</div></div>
            <div className="px-3 py-2 font-mono text-[8px] text-white/40"><span className="text-white/20 mr-2">1</span><span className="text-white/35"># Cell 1 — Ctrl+Enter to run</span></div>
          </div>
          <div className="mx-2 py-1.5 rounded-lg border border-dashed border-white/[0.07] text-center text-[7px] text-white/25">+ Add Cell</div>
        </div>
        <div className="w-48 flex flex-col border-l border-white/[0.05]" style={{ background: '#0a0c14' }}>
          <div className="px-3 py-2 border-b border-white/[0.05]"><div className="flex items-center gap-1.5 mb-1"><span className="text-[8px]">🤖</span><span className="text-white text-[9px] font-black">ML Agent</span><div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[6px] font-bold border border-violet-400/30 bg-violet-500/10 text-violet-300 ml-auto">✦ GPT-4O-MINI</div></div></div>
          <div className="px-3 py-2 space-y-2 border-b border-white/[0.05]"><div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] cursor-pointer"><span className="text-[9px]">📁</span><span className="text-[8px] text-white/60 font-medium">Upload CSV / Excel</span></div><div className="flex items-center gap-1 rounded-lg overflow-hidden border border-white/[0.08]"><input className="flex-1 bg-transparent px-2 py-1 text-[7px] text-white/30 outline-none pointer-events-none" placeholder="target column (optional)" readOnly /><div className="px-2 py-1 text-[7px] font-bold text-white border-l border-white/[0.08]" style={{ background: '#7c3aed' }}>Analyse</div></div></div>
          <div className="px-3 py-2 flex-1"><div className="flex items-start gap-1.5"><span className="text-[9px] mt-0.5">🤖</span><div><div className="text-[7px] font-bold text-white/60 mb-1">ML Agent</div><p className="text-[7px] text-white/40 leading-relaxed">Upload a CSV or Excel dataset to begin. The AI agent will analyse it, suggest top models, and build a complete ML pipeline for you.</p></div></div></div>
          <div className="px-3 py-2 border-t border-white/[0.05]"><div className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-[7px] text-white/20">Ask anything about your data or pipeline… (Enter to send)</div></div>
        </div>
      </div>
    </div>
  );
}

function EasyModeRealMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-900/30" style={{ aspectRatio: '16/9', background: '#0b0d14' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0d0f1a 0%,#090b12 100%)' }} />
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 z-10 border-b border-white/[0.06]" style={{ background: '#0b0d14' }}>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1 px-2 py-1 rounded-md border border-white/10 bg-white/[0.04] text-[7px] text-white/50"><span>←</span><span>Dashboard</span></div><div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[8px]">🧪</div><span className="text-white text-[10px] font-black">Lab Playground</span><span className="px-1.5 py-0.5 rounded text-[6px] font-bold uppercase tracking-widest text-white/50 border border-white/10 bg-white/5">BETA</span></div></div>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1 text-[7px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">backend</span></div><div className="flex items-center gap-1 text-[7px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">agent</span></div><div className="flex items-center gap-1 text-[7px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/30"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /><span>no session</span></div><div className="flex items-center gap-1 px-2 py-1 rounded-md text-[7px] font-bold text-white border border-blue-500/50 bg-blue-500/15">🖥 Code Mode <span className="text-blue-300/60 font-normal ml-0.5">(active)</span></div><div className="px-2 py-1 rounded-md text-[7px] text-white/50 border border-white/10 bg-white/[0.03]">Reset Kernel</div></div>
      </div>
      <div className="absolute inset-0 top-8 flex z-10">
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.05] px-3 py-2 space-y-2">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 flex items-start gap-2"><div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[11px] flex-shrink-0">✨</div><div><div className="text-white text-[9px] font-black">Easy Mode</div><div className="text-white/40 text-[7px]">No code needed — the AI handles everything. Use the panel on the right to upload & analyse.</div></div></div>
          <div className="flex items-center gap-0 px-1">{[{ n: '1', label: 'Upload' }, { n: '2', label: 'Analyse' }, { n: '3', label: 'Train Model' }, { n: '4', label: 'Done' }].map((s, i) => (<div key={s.label} className="flex items-center flex-1"><div className="flex flex-col items-center"><div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border border-white/20 text-white/30 bg-white/5">{s.n}</div><span className="text-[6px] mt-0.5 text-white/25">{s.label}</span></div>{i < 3 && <div className="flex-1 h-px mx-1 mb-3 bg-white/10" />}</div>))}</div>
          <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/[0.04] px-3 py-2 flex items-center gap-2"><span className="text-base">⏳</span><div><div className="text-yellow-300 text-[8px] font-black">Waiting for dataset</div><div className="text-white/35 text-[7px]">Upload a CSV or Excel file using the panel on the right to begin.</div></div></div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"><div className="flex items-center gap-1.5 mb-1.5"><span className="text-[9px]">💬</span><span className="text-[8px] font-bold text-white/60">Ask the AI Agent</span></div><div className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-[6.5px] text-white/20 flex items-center justify-between"><span>Ask anything: 'Show feature importance', 'Try a different model', 'Explain the results'… (Enter to send)</span><span className="text-white/20 ml-1">↑</span></div></div>
          <div className="flex-1 flex flex-col items-center justify-center text-center pt-2"><div className="text-4xl mb-2">📁</div><div className="text-[9px] font-bold text-violet-400">Upload your dataset to get started</div><div className="text-[7px] text-white/30 mt-0.5">Use the <span className="text-violet-300 font-semibold">ML Agent</span> panel on the right →</div></div>
        </div>
        <div className="w-52 flex flex-col" style={{ background: '#0a0c12' }}>
          <div className="px-3 py-2 border-b border-white/[0.05] flex items-center justify-between"><div className="flex items-center gap-1.5"><span className="text-sm">🤖</span><span className="text-white text-[9px] font-black">ML Agent</span></div><div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[6px] font-bold border border-violet-400/30 bg-violet-500/10 text-violet-300">✦ GPT-4O-MINI</div></div>
          <div className="px-3 py-2 border-b border-white/[0.05] space-y-2"><div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] cursor-pointer"><span className="text-[9px]">📁</span><span className="text-[8px] text-white/60 font-medium">Upload CSV / Excel</span></div><div className="flex items-center gap-1 rounded-lg overflow-hidden border border-white/[0.08]"><div className="flex-1 px-2 py-1 bg-white/[0.03] text-[7px] text-white/20">target column (optional)</div><div className="px-2 py-1 text-[7px] font-bold text-white border-l border-white/[0.08]" style={{ background: 'rgba(124,58,237,0.7)' }}>🔍 Analyse</div></div></div>
          <div className="px-3 py-2 flex-1"><div className="flex items-start gap-2"><span className="text-[10px] mt-0.5">🤖</span><div><div className="text-[7px] font-black text-white/50 mb-1">ML Agent</div><p className="text-[7px] text-white/40 leading-relaxed">Upload a CSV or Excel dataset to begin. The AI agent will analyse it, suggest top models, and build a complete ML pipeline for you.</p></div></div></div>
          <div className="px-3 py-2 border-t border-white/[0.05]"><div className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-[7px] text-white/20">Ask anything about your data or pipeline… (Enter to send)</div></div>
        </div>
      </div>
    </div>
  );
}

const easyModeRealAnnotations = [
  { icon: '✨', label: 'Easy Mode Banner', color: '#a78bfa', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', description: 'The purple gradient "Easy Mode" banner at the top of the left panel confirms you\'re in no-code mode — "No code needed — the AI handles everything." Switch anytime using the "🖥 Code Mode" button in the top-right navbar.' },
  { icon: '🔢', label: '4-Step Progress Bar', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', description: 'A horizontal stepper showing your position in the Easy Mode workflow: 1 Upload → 2 Analyse → 3 Train Model → 4 Done. All steps start inactive (grey circles). They light up green with a ✓ checkmark as you complete each stage.' },
  { icon: '⏳', label: '"Waiting for dataset" Card', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', description: 'A yellow status card saying "Waiting for dataset — Upload a CSV or Excel file using the panel on the right to begin." This is the default state before you upload a file. It disappears once your dataset is loaded.' },
  { icon: '💬', label: '"Ask the AI Agent" Chat Box', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', description: 'A chat input in the left panel where you can type questions before, during, or after analysis. Example prompts are shown as placeholders. Press Enter to send.' },
  { icon: '📁', label: 'Upload Empty State', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', description: 'The large yellow folder icon with "Upload your dataset to get started" fills the empty left panel area. This updates with EDA charts, model results, and pipeline steps once you upload and analyse your data.' },
  { icon: '🤖', label: 'ML Agent Right Panel', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)', description: 'Your AI co-pilot on the right. It has: "ML Agent" header with "✦ GPT-4O-MINI" badge, a "📁 Upload CSV / Excel" button, a "target column (optional)" input with a violet "🔍 Analyse" button, and a welcome message. This is where you start every analysis.' },
];

const codeModeAnnotations = [
  { icon: '🖥', label: 'Code Mode Toggle', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', description: 'The "🖥 Code Mode" button in the top-right navbar (blue border). Click it from Easy Mode to switch to the full Jupyter-style notebook. The button shows "⚡ Easy Mode" when you\'re in Code Mode, so you can always toggle back.' },
  { icon: '⚠️', label: 'pip install Warning Banner', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', description: 'A yellow notice at the top of the code editor: "pip install and heavy DL libraries are restricted." You can\'t install arbitrary packages — the platform provides a curated set of ML libraries (sklearn, pandas, numpy, xgboost, etc.).' },
  { icon: '💻', label: 'Code Cell Editor', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', description: 'A Jupyter-style code cell numbered [1]. The green ▶ button runs the cell (or press Ctrl+Enter). The toolbar has ↑↓ arrows to reorder cells, + to add a cell below, and 🗑 to delete.' },
  { icon: '➕', label: '+ Add Cell Button', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', description: 'Below each code cell, a dashed "＋ Add Cell" button lets you insert a new blank cell. Use this for custom analysis code, additional visualisations, or experimenting with model parameters beyond what the AI generates.' },
  { icon: '🟢', label: 'Status Indicators', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', description: 'Three status dots in the top navbar: green "backend" (server running), green "agent" (ML Agent ready), grey "no session" (kernel not yet started). Once you upload a file and click Analyse, the session dot turns blue.' },
  { icon: '🔄', label: 'Reset Kernel Button', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', description: '"Reset Kernel" clears the current execution session and all in-memory variables, then restarts fresh. Use it if the kernel gets stuck, or when you want to start a completely new analysis run without leftover state.' },
];

function Step6Content({ accentColor }: { accentColor: string }) {
  const [activeMode, setActiveMode] = useState<'easy' | 'code'>('easy');
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const annotations = activeMode === 'easy' ? codeModeAnnotations : easyModeRealAnnotations;
  return (
    <div className="space-y-12">
      <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-4xl">After clicking <strong className="text-white">"⊞ Start Project"</strong>, you land in the <strong className="text-white">Lab Playground</strong> — your AI-powered ML workspace. You get two modes: <strong className="text-white">Easy Mode</strong> (no code, AI does everything) and <strong className="text-white">Code Mode</strong> (full Jupyter notebook for custom Python). Toggle between them anytime using the button in the top-right navbar.</p>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => { setActiveMode('easy'); setActiveAnnotation(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border" style={{ background: activeMode === 'easy' ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'rgba(255,255,255,0.04)', color: activeMode === 'easy' ? '#fff' : 'rgba(255,255,255,0.4)', border: activeMode === 'easy' ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.08)' }}>✨ Easy Mode</button>
        <button onClick={() => { setActiveMode('code'); setActiveAnnotation(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border" style={{ background: activeMode === 'code' ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(255,255,255,0.04)', color: activeMode === 'code' ? '#fff' : 'rgba(255,255,255,0.4)', border: activeMode === 'code' ? '1px solid rgba(96,165,250,0.5)' : '1px solid rgba(255,255,255,0.08)' }}>🖥 Code Mode</button>
        <span className="text-[11px] text-white/25 italic">Click a tab to switch previews</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full" style={{ background: activeMode === 'easy' ? '#a78bfa' : '#60a5fa' }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Lab Playground ({activeMode === 'easy' ? 'Easy Mode' : 'Code Mode'})</p></div>
        <div className="mx-auto w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60">{activeMode === 'easy' ? <LabPlaygroundMockup /> : <EasyModeRealMockup />}</div>
        <p className="text-[11px] text-white/25 text-center max-w-3xl mx-auto">↑ Replica of the actual Ownquesta Lab Playground — {activeMode === 'easy' ? 'Easy Mode' : 'Code Mode'}</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5"><span className="w-2 h-2 rounded-full" style={{ background: accentColor }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — {activeMode === 'easy' ? 'Easy Mode' : 'Code Mode'} — Click to Explore</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {annotations.map((ann, i) => (<button key={`${activeMode}-${i}`} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)} className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5" style={{ background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)', borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)' }}><div className="flex items-center gap-3 mb-2"><span className="text-xl">{ann.icon}</span><span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span><span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span></div>{activeAnnotation === i && <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>}</button>))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3"><h4 className="text-sm font-bold text-violet-300 flex items-center gap-2"><span>✨</span> Easy Mode — Best For</h4><div className="space-y-2">{['No coding background or experience', 'Fast prototyping — upload, analyse, train in minutes', 'Letting the AI pick the best model automatically', 'Clear guided workflow: Upload → Analyse → Train → Done', 'Getting visual charts and results without writing code'].map((item, i) => (<div key={i} className="flex items-start gap-2 text-[12px] text-white/55"><span className="text-violet-400 flex-shrink-0 mt-0.5">✓</span><span>{item}</span></div>))}</div></div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-3"><h4 className="text-sm font-bold text-blue-300 flex items-center gap-2"><span>🖥</span> Code Mode — Best For</h4><div className="space-y-2">{['Python developers who want full control', 'Custom preprocessing or feature engineering logic', 'Reviewing and editing the AI-generated code', 'Running your own experiments cell by cell', 'Advanced users who want Jupyter-style flexibility'].map((item, i) => (<div key={i} className="flex items-start gap-2 text-[12px] text-white/55"><span className="text-blue-400 flex-shrink-0 mt-0.5">✓</span><span>{item}</span></div>))}</div></div>
      </div>
      <div className="rounded-2xl border border-yellow-500/15 bg-yellow-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-yellow-300 flex items-center gap-2"><span>⚡</span> What To Do In The Lab Playground</h4>
        <div className="space-y-3">
          {[{ step: '1', text: 'Check the top-right status dots — "backend" and "agent" should both be green. If grey, wait a few seconds for the server to initialize.' }, { step: '2', text: 'Choose your mode: "✨ Easy Mode" is the default (best for most users). If you\'re a developer, click "🖥 Code Mode" to switch to the Jupyter notebook view.' }, { step: '3', text: 'In Easy Mode: use the right ML Agent panel — click "📁 Upload CSV / Excel" to load your dataset file (.csv, .xlsx, .xls).' }, { step: '4', text: 'Optionally type your target column name (e.g. "Churn" or "Price") in the target field. Leave blank to let the AI detect it automatically.' }, { step: '5', text: 'Click the violet "🔍 Analyse" button. The ML Agent will profile your data, handle missing values, apply feature engineering, and suggest top models — all automatically.' }, { step: '6', text: 'Use the "💬 Ask the AI Agent" chat box at any time to ask questions like "Why did you choose this model?" or "Show feature importance".' }].map((item) => (<div key={item.step} className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-[11px] font-bold text-yellow-300 flex-shrink-0 mt-0.5">{item.step}</span><p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p></div>))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LAB RUNNING MOCKUP — Step 7
// ─────────────────────────────────────────────
function LabRunningMockup() {
  const codeLines = [
    { n: 1, color: '#60a5fa', text: 'import pandas as pd' }, { n: 2, color: '#60a5fa', text: 'import numpy as np' }, { n: 3, color: '', text: '' },
    { n: 4, color: '#4ade80', text: 'df = pd.read_csv("…/customer_data.csv")' }, { n: 5, color: '', text: '' },
    { n: 6, color: '#fbbf24', text: 'print("=== SHAPE ===")' }, { n: 7, color: '#fbbf24', text: 'print(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")' }, { n: 8, color: '', text: '' },
    { n: 9, color: '#fbbf24', text: 'print("\\n=== COLUMN INFO ===")' }, { n: 10, color: '#c084fc', text: 'for col in df.columns:' }, { n: 11, color: '#e2e8f0', text: '    print(f" {col} [{df[col].dtype}] unique=…")' },
  ];
  const outputLines = ['=== SHAPE ===', 'Rows: 20, Columns: 8', '', '=== COLUMN INFO ===', '  customer_id  [int64]   unique=20  null=0', '  age          [int64]   unique=20  null=0', '  gender       [object]  unique=2   null=0', '  income       [int64]   unique=20  null=0', '  credit_score [int64]   unique=20  null=0', '  loyalty_status [object] unique=4  null=0'];
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-900/20" style={{ aspectRatio: '16/9', background: '#080a0f' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0a0c14 0%,#060810 100%)' }} />
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2 z-10 border-b border-white/[0.06]" style={{ background: '#0b0d16' }}>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1 px-2 py-1 rounded-md border border-white/10 bg-white/[0.04] text-[7px] text-white/50"><span>←</span><span>Dashboard</span></div><div className="flex items-center gap-1.5"><div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[8px]">🧪</div><span className="text-white text-[10px] font-black">Lab Playground</span><span className="px-1.5 py-0.5 rounded text-[6px] font-bold uppercase tracking-widest text-white/50 border border-white/10 bg-white/5">BETA</span></div></div>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1 text-[7px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">backend</span></div><div className="flex items-center gap-1 text-[7px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">agent</span></div><div className="flex items-center gap-1 text-[7px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span>session 1a117b9…</span></div><div className="flex items-center gap-1 px-2 py-1 rounded-md text-[7px] font-bold text-white border border-violet-500/40 bg-violet-500/10">⚡ Easy Mode</div><div className="px-2 py-1 rounded-md text-[7px] text-white/50 border border-white/10 bg-white/[0.03]">Reset Kernel</div></div>
      </div>
      <div className="absolute inset-0 top-8 flex z-10">
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.05]">
          <div className="flex items-center gap-2 px-2 py-1 border-b border-white/[0.05] bg-white/[0.02]"><span className="text-[6px] text-white/30">[2]</span><div className="w-3.5 h-3.5 rounded-full border border-green-400/60 flex items-center justify-center"><span className="text-green-400 text-[7px]">▶</span></div><span className="text-[6px] text-green-400/60 font-medium">Done</span><div className="ml-auto flex gap-1">{['↑','↓','+','🗑'].map(ic => (<div key={ic} className="w-3.5 h-3.5 rounded text-[7px] text-white/25 border border-white/[0.05] flex items-center justify-center">{ic}</div>))}</div></div>
          <div className="px-2 py-1.5 font-mono overflow-hidden" style={{ fontSize: '6.5px', lineHeight: '1.6' }}>{codeLines.map(line => (<div key={line.n} className="flex gap-2"><span className="text-white/20 w-3 flex-shrink-0 text-right">{line.n}</span><span style={{ color: line.color || '#64748b' }}>{line.text}</span></div>))}</div>
          <div className="mx-2 mb-1 rounded border border-white/[0.06] bg-black/30 px-2 py-1.5 flex-1 overflow-hidden"><div className="text-[6px] text-white/25 mb-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white/20" /> output — ok</div><div className="font-mono" style={{ fontSize: '6px', lineHeight: '1.7', color: '#94a3b8' }}>{outputLines.map((l, i) => <div key={i}>{l || '\u00a0'}</div>)}</div></div>
        </div>
        <div className="w-52 flex flex-col" style={{ background: '#0a0c14' }}>
          <div className="px-3 py-2 border-b border-white/[0.05] flex items-center justify-between"><div className="flex items-center gap-1.5"><span className="text-[9px]">🤖</span><span className="text-white text-[9px] font-black">ML Agent</span></div><div className="px-1.5 py-0.5 rounded-full text-[6px] font-bold border border-violet-400/30 bg-violet-500/10 text-violet-300">✦ GPT-4O-MINI</div></div>
          <div className="px-3 py-1.5 border-b border-white/[0.05]"><div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-[7px] text-emerald-300"><span>📄</span><span className="font-medium">customer_data.csv</span><span className="ml-auto text-white/30">×</span></div><div className="flex items-center gap-1 mt-1.5 rounded-lg overflow-hidden border border-white/[0.08]"><div className="flex-1 px-2 py-1 text-[7px] text-violet-300 bg-white/[0.03] font-medium">loyalty_status</div><div className="px-2 py-1 text-[7px] font-bold text-white border-l border-white/[0.08]" style={{ background: '#7c3aed' }}>Analysing…</div></div></div>
          <div className="flex-1 px-3 py-2 space-y-2 overflow-hidden">
            <div><div className="text-[7px] font-black text-white mb-0.5">Missing Values</div><p className="text-[6.5px] text-white/45 leading-relaxed">There are no missing values in the dataset, so no imputation or dropping is necessary.</p></div>
            <div><div className="text-[7px] font-black text-emerald-300 mb-0.5">Feature Engineering</div><p className="text-[6.5px] text-white/45 leading-relaxed">The gender column needs to be encoded as categorical. The target variable loyalty_status also needs to be encoded for classification.</p></div>
            <div className="flex items-center gap-1.5 text-[6.5px] text-white/30"><span className="w-2 h-2 rounded-full border border-white/20 flex items-center justify-center text-[5px]">⚙</span>Applying feature engineering…</div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2 py-1.5"><div className="text-[7px] font-black text-emerald-300 mb-1 flex items-center gap-1"><span>⚙</span> Feature Engineering Applied</div><div className="font-mono text-[5.5px] text-white/40 space-y-0.5"><div>import numpy as np</div><div>import pandas as pd</div><div>from sklearn.preprocessing import</div><div className="pl-2">OneHotEncoder, LabelEncoder</div><div className="mt-1 text-emerald-300/60">df_processed = df.copy()</div><div className="mt-0.5 text-white/25"># 1. Strip comma/currency…</div></div><div className="mt-1 text-[6px] text-emerald-400/70">Feature engineering done. Shape: (20, 9)</div></div>
            <div className="flex items-center gap-1.5 text-[6.5px] text-white/30"><span className="animate-pulse">🔍</span> Running Exploratory Data Analysis…</div>
            <div className="flex items-center gap-1.5 text-[6.5px] text-white/30"><span className="animate-spin inline-block">◌</span> Agent is analysing your dataset…</div>
          </div>
          <div className="px-3 py-2 border-t border-white/[0.05]"><div className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-[7px] text-white/20">Ask anything about your data or pipeline…</div></div>
        </div>
      </div>
    </div>
  );
}

const labRunningAnnotations = [
  { icon: '🟢', label: 'Session Active (blue dot)', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', description: 'Once your dataset is uploaded and analysis begins, the top navbar shows a blue "session 1a117b9…" dot — meaning the kernel is live and code is executing. Both backend and agent dots stay green.' },
  { icon: '▶', label: 'Cell [2] — Running / Done', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', description: 'The ML Agent auto-generates Python code in cell [2] and runs it. The green ▶ button and "Done" label confirm execution completed. Code includes imports, pd.read_csv(), shape/column info, and categorical distributions.' },
  { icon: '📋', label: 'Code Output Panel', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', description: 'Below the code, the dark output panel shows "output — ok" and the printed results: dataset shape (Rows: 20, Columns: 8), column names with dtypes, unique counts, and null counts for each column.' },
  { icon: '📄', label: 'Uploaded File Pill', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.2)', description: 'The right panel shows "customer_data.csv" in a green pill — confirming your file was uploaded successfully. The target column "loyalty_status" is shown in the field beside the "Analysing…" button.' },
  { icon: '🔧', label: 'Missing Values + Feature Engineering', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', description: 'The ML Agent reports: no missing values found. Then it automatically detects categorical columns (gender, loyalty_status) and applies LabelEncoder / OneHotEncoder. Shape changes from (20,8) to (20,9) after encoding.' },
  { icon: '🔍', label: 'Running EDA + Agent Analysing', color: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.2)', description: 'After feature engineering, the agent continues with "Running Exploratory Data Analysis…" and "Agent is analysing your dataset…" — these live status messages mean the AI is building your full ML pipeline in the background.' },
];

const easyModeAnnotations = [
  { icon: '✨', label: 'Easy Mode Banner', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', description: 'The purple "Easy Mode" banner at the top of the left panel confirms you\'re in no-code mode. The navbar shows a "🖥 Code Mode" button you can click to switch to the Jupyter notebook view at any time.' },
  { icon: '✅', label: '4-Step Progress Bar', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', description: 'The stepper shows ✓ Upload → ✓ Analyse (both green and complete) → 3 Train Model → 4 Done. Step 3 activates when you click "▶ Build Pipeline" in the right panel. Step 4 lights up once training finishes.' },
  { icon: '🏆', label: 'Analysis Complete Banner', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', description: 'The gold "Analysis Complete" banner confirms EDA is done: "AI has analysed your data and suggested models. Select one in the AI panel to build the pipeline." This is your signal to review the charts and pick a model.' },
  { icon: '📊', label: '3 Visualisation Charts', color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)', border: 'rgba(45,212,191,0.2)', description: 'Three auto-generated charts: (1) Distribution of Loyalty Status — bar chart. (2) Correlation Heatmap — shows strong relationships between spending_score and purchase_frequency. (3) Spending Score by Loyalty Status — box plot.' },
  { icon: '⚙', label: 'Adjust Settings Panel', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', description: 'The expandable "Adjust Settings" section lets you tune: Test Split (default 20%) and CV Folds (default 5), plus an Additional Notes textarea for custom instructions. Click "✨ Apply Settings & Retrain" to re-run.' },
  { icon: '💬', label: 'Ask the AI Agent', color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)', description: 'The "Ask the AI Agent" chat box at the bottom lets you query the agent mid-session: "Show feature importance", "Try a different model", "Explain the results". Type and press Enter or click ↑ to send.' },
];

function EasyModeMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-violet-500/20 shadow-2xl shadow-violet-900/20" style={{ aspectRatio: '16/9', background: '#080a0f' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#0a0c14 0%,#060810 100%)' }} />
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 z-10 border-b border-white/[0.06]" style={{ background: '#0b0d16' }}>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-[7px] text-white/50"><span>←</span><span>Dashboard</span></div><div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[7px]">🧪</div><span className="text-white text-[9px] font-black">Lab Playground</span><span className="px-1 py-0.5 rounded text-[5.5px] font-bold uppercase tracking-widest text-white/40 border border-white/10 bg-white/5">BETA</span></div></div>
        <div className="flex items-center gap-1.5"><div className="flex items-center gap-1 text-[6.5px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">backend</span></div><div className="flex items-center gap-1 text-[6.5px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">agent</span></div><div className="flex items-center gap-1 text-[6.5px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span>session e4bea0…</span></div><div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[6.5px] font-bold text-white border border-blue-500/40 bg-blue-500/10">🖥 Code Mode</div><div className="px-2 py-0.5 rounded-md text-[6.5px] text-white/40 border border-white/10 bg-white/[0.03]">Reset Kernel</div></div>
      </div>
      <div className="absolute inset-0 top-7 flex z-10">
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.05] px-2.5 py-2 space-y-1.5">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 flex items-start gap-2"><div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[9px] flex-shrink-0">✨</div><div><div className="text-white text-[8px] font-black">Easy Mode</div><div className="text-white/40 text-[6.5px]">No code needed — the AI handles everything.</div></div></div>
          <div className="flex items-center px-1">{[{ n: '✓', label: 'Upload', done: true }, { n: '✓', label: 'Analyse', done: true }, { n: '3', label: 'Train Model', done: false }, { n: '4', label: 'Done', done: false }].map((s, i) => (<div key={s.label} className="flex items-center flex-1"><div className="flex flex-col items-center"><div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${s.done ? 'bg-green-500 text-white' : 'border border-white/20 text-white/30 bg-white/5'}`}>{s.n}</div><span className={`text-[5.5px] mt-0.5 ${s.done ? 'text-green-400/80' : 'text-white/25'}`}>{s.label}</span></div>{i < 3 && <div className={`flex-1 h-px mx-1 mb-3 ${s.done ? 'bg-green-500/60' : 'bg-white/10'}`} />}</div>))}</div>
          <div className="rounded-xl border border-yellow-500/35 bg-yellow-500/8 px-2.5 py-1.5 flex items-center gap-2"><span className="text-sm flex-shrink-0">🏆</span><div><div className="text-yellow-300 text-[7.5px] font-black">Analysis Complete</div><div className="text-white/40 text-[6px]">AI has analysed your data and suggested models. Select one in the AI panel to build the pipeline.</div></div></div>
          <div><div className="flex items-center gap-1.5 mb-1"><span className="w-1.5 h-1.5 rounded bg-white/25" /><span className="text-[6.5px] font-bold text-white/50 uppercase tracking-widest">Visualisations</span></div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-lg border border-white/[0.07] bg-[#0d0f18] p-1.5"><div className="text-[5px] text-white/30 text-center mb-1">Distribution of Loyalty Status</div><div className="flex items-end justify-around h-9 px-1">{[{ h: 30, label: 'Gold' }, { h: 22, label: 'Platinum' }, { h: 14, label: 'Silver' }, { h: 10, label: 'Bronze' }].map(b => (<div key={b.label} className="flex flex-col items-center gap-0.5"><div className="w-4 rounded-t" style={{ height: `${b.h}px`, background: '#2dd4bf55', border: '1px solid #2dd4bf88' }} /><span className="text-[4px] text-white/20">{b.label}</span></div>))}</div></div>
              <div className="rounded-lg border border-white/[0.07] bg-[#0d0f18] p-1.5"><div className="text-[5px] text-white/30 text-center mb-1">Correlation Heatmap</div><div className="grid gap-px" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>{[1,.23,.19,.21,.19,.17,.23,1,.96,.98,.89,.94,.19,.96,1,.97,.95,.95,.21,.98,.97,1,.94,.96,.19,.89,.95,.94,1,.96,.17,.94,.95,.96,.96,1].map((v, i) => (<div key={i} className="rounded-sm" style={{ height: '6px', background: v > 0.9 ? '#ef444499' : v > 0.5 ? '#f9731655' : '#1e2a3a' }} />))}</div></div>
              <div className="rounded-lg border border-white/[0.07] bg-[#0d0f18] p-1.5"><div className="text-[5px] text-white/30 text-center mb-1">Spending Score by Loyalty Status</div><div className="flex items-end justify-around h-9 px-1">{[{ label: 'Gold', h: 14, mt: 4 }, { label: 'Platinum', h: 12, mt: 8 }, { label: 'Silver', h: 10, mt: 2 }, { label: 'Bronze', h: 8, mt: 0 }].map(b => (<div key={b.label} className="flex flex-col items-center gap-0" style={{ marginBottom: `${b.mt}px` }}><div className="w-px bg-white/20" style={{ height: '3px' }} /><div className="w-4 rounded-sm border border-teal-400/60 bg-teal-400/15" style={{ height: `${b.h}px` }} /><div className="w-px bg-white/20" style={{ height: '3px' }} /><span className="text-[4px] text-white/20 mt-0.5">{b.label}</span></div>))}</div></div>
            </div>
          </div>
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-2.5 py-1.5 space-y-1.5">
            <div className="flex items-center justify-between"><div className="flex items-center gap-1"><span className="text-[8px]">⚙</span><span className="text-[7px] text-blue-400 font-bold">Adjust Settings</span></div><span className="text-white/20 text-[7px]">▲</span></div>
            <div className="grid grid-cols-2 gap-2"><div><div className="flex items-center justify-between mb-0.5"><span className="text-[6px] text-white/40">Test Split</span><span className="text-[6px] text-white/60 font-bold">20%</span></div><div className="relative w-full h-1 rounded-full bg-white/10"><div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: '20%' }} /><div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow" style={{ left: '18%' }} /></div></div><div><div className="flex items-center justify-between mb-0.5"><span className="text-[6px] text-white/40">CV Folds</span><span className="text-[6px] text-white/60 font-bold">5</span></div><div className="relative w-full h-1 rounded-full bg-white/10"><div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: '40%' }} /><div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow" style={{ left: '38%' }} /></div></div></div>
            <div className="w-full py-1 rounded-lg text-[6.5px] font-bold text-white text-center flex items-center justify-center gap-1" style={{ background: 'linear-gradient(90deg,#4f46e5,#7c3aed)' }}><span>✨</span><span>Apply Settings &amp; Retrain</span></div>
          </div>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5"><div className="flex items-center gap-1 mb-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-400" /><span className="text-[7px] text-white/55 font-bold">Ask the AI Agent</span></div><div className="flex items-center gap-1"><div className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[6px] text-white/20">Ask anything: 'Show feature importance', 'Try a different model', 'Explain the results'…</div><div className="w-5 h-5 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-[7px] text-white/30">↑</div></div></div>
        </div>
        <div className="w-48 flex flex-col flex-shrink-0" style={{ background: '#0a0c13' }}>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05] flex items-center justify-between"><div className="flex items-center gap-1"><span className="text-[9px]">🤖</span><span className="text-white text-[8px] font-black">ML Agent</span></div><div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[5.5px] font-bold border border-violet-400/30 bg-violet-500/10 text-violet-300">✦ GPT-4O-MINI</div></div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05] space-y-1"><div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-[6.5px] text-emerald-300"><span>📄</span><span>customer_data.csv</span></div></div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05]"><div className="w-full rounded-full overflow-hidden bg-white/[0.06]" style={{ height: '3px' }}><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: '72%' }} /></div><p className="text-[5.5px] text-white/30 mt-1 italic">Running Exploratory Data Analysis…</p></div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05] space-y-1"><div className="flex items-center justify-between px-2 py-1 rounded-lg border border-blue-500/25 bg-blue-500/5"><div className="flex items-center gap-1"><span className="text-[7px]">📊</span><span className="text-[6.5px] font-bold text-blue-300">Exploratory Data Analysis</span></div><span className="text-white/20 text-[6px]">▶</span></div><p className="text-[5.5px] text-white/35 leading-relaxed px-1">The exploratory data analysis will reveal the distribution of the target variable, correlations among numeric features, and the presence of any missing values.</p></div>
          <div className="px-2.5 py-1.5 flex-1 overflow-hidden space-y-1">
            <div className="text-[6.5px] font-black text-yellow-300 flex items-center gap-1"><span>🏆</span> Top 3 Recommended Models</div>
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-1.5 space-y-1"><div className="flex items-center justify-between"><span className="text-[6.5px] font-black text-white flex items-center gap-1"><span>🌲</span> Random Forest Classifier</span></div><p className="text-[5.5px] text-white/35 leading-relaxed">This model is robust to overfitting and handles categorical features well.</p><div className="space-y-0.5"><div className="text-[5.5px] text-emerald-400 flex items-center gap-1"><span>✓</span> Handles non-linear relationships</div><div className="text-[5.5px] text-emerald-400 flex items-center gap-1"><span>✓</span> Robust to outliers</div><div className="text-[5.5px] text-red-400/80 flex items-center gap-1"><span>✗</span> Can be slower on larger datasets</div></div><div className="w-full py-1 rounded-lg text-[6px] font-bold text-white text-center" style={{ background: 'linear-gradient(90deg,#4f46e5,#7c3aed)' }}>▶ Build Pipeline with Random Forest Classifier</div></div>
            <div className="flex items-center justify-between px-2 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02]"><div className="flex items-center gap-1"><span className="text-[7px]">🔵</span><span className="text-[6.5px] text-white/55 font-semibold">Logistic Regression</span></div></div>
            <div className="flex items-center justify-between px-2 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02]"><div className="flex items-center gap-1"><span className="text-[7px]">📈</span><span className="text-[6.5px] text-white/55 font-semibold">Gradient Boosting Classifier</span></div></div>
          </div>
          <div className="px-2.5 py-1.5 border-t border-white/[0.05]"><div className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[6px] text-white/20">Ask anything about your data or pipeline…</div></div>
        </div>
      </div>
    </div>
  );
}

function Step7Content({ accentColor }: { accentColor: string }) {
  const [activeMode, setActiveMode] = useState<'easy' | 'code'>('easy');
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const annotations = activeMode === 'easy' ? labRunningAnnotations : easyModeAnnotations;
  return (
    <div className="space-y-12">
      <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-4xl">After uploading your dataset and clicking <strong className="text-white">"Analyse"</strong>, the ML Agent processes your data and delivers results — differently depending on your mode. In <strong className="text-white">Easy Mode</strong>, you see charts, a progress bar, and top model picks. In <strong className="text-white">Code Mode</strong>, the agent auto-generates Python, runs it live, and streams every step in the sidebar.</p>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => { setActiveMode('easy'); setActiveAnnotation(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border" style={activeMode === 'easy' ? { background: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.4)', color: '#a78bfa' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>✨ Easy Mode</button>
        <button onClick={() => { setActiveMode('code'); setActiveAnnotation(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border" style={activeMode === 'code' ? { background: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.4)', color: '#60a5fa' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>🖥 Code Mode</button>
        <span className="text-xs text-white/25 ml-1">Toggle to see how each mode looks after analysis</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full" style={{ background: activeMode === 'easy' ? '#a78bfa' : '#60a5fa' }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — After Analysis ({activeMode === 'easy' ? 'Easy Mode' : 'Code Mode'})</p></div>
        <div className="mx-auto w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60">{activeMode === 'easy' ? <LabRunningMockup /> : <EasyModeMockup />}</div>
        <p className="text-[11px] text-white/25 text-center max-w-3xl mx-auto">↑ {activeMode === 'easy' ? 'Code Mode — ML Agent auto-generates and runs Python, streams results live' : 'Easy Mode — analysis complete, charts and top 3 models shown'}</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5"><span className="w-2 h-2 rounded-full" style={{ background: accentColor }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — {activeMode === 'easy' ? 'Easy Mode' : 'Code Mode'} — Click to Explore</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {annotations.map((ann, i) => (<button key={`${activeMode}-${i}`} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)} className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5" style={{ background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)', borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)' }}><div className="flex items-center gap-3 mb-2"><span className="text-xl">{ann.icon}</span><span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span><span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span></div>{activeAnnotation === i && <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>}</button>))}
        </div>
      </div>
      <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2"><span>⚡</span> What To Do After Analysis</h4>
        <div className="space-y-3">
          {[{ step: '1', text: 'In Easy Mode — confirm the progress bar shows ✓ Upload and ✓ Analyse both green. Review the 3 auto-generated charts in the left panel for your data distribution and correlations.' }, { step: '2', text: 'In Easy Mode — read the Top 3 Recommended Models in the right sidebar. Check the pros and cons listed under each one, then click "▶ Build Pipeline" on your preferred model.' }, { step: '3', text: 'In Code Mode — check the left panel code output for your dataset\'s shape and column info. This confirms your data was loaded and encoded correctly.' }, { step: '4', text: 'In Code Mode — watch the right sidebar stream live: missing value check → feature engineering → EDA → model recommendations appear one by one as the agent works.' }, { step: '5', text: 'In either mode — use the chat input to ask: "Which model is best for my data?", "Why did you encode gender?", or "Show feature importance" at any time.' }].map((item) => (<div key={item.step} className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-[11px] font-bold text-cyan-300 flex-shrink-0 mt-0.5">{item.step}</span><p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p></div>))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 8 — MODEL SELECTION MOCKUP (reuses EasyModeMockup + ModelingCodeModeMockup)
// ─────────────────────────────────────────────
function ModelingCodeModeMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-900/20" style={{ aspectRatio: '16/9', background: '#080a10' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#090b14 0%,#06080f 100%)' }} />
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 z-10 border-b border-white/[0.06]" style={{ background: '#0b0d16' }}>
        <div className="flex items-center gap-2"><div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-[7px] text-white/50"><span>←</span><span>Dashboard</span></div><div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[7px]">🧪</div><span className="text-white text-[9px] font-black">Lab Playground</span><span className="px-1 py-0.5 rounded text-[5.5px] font-bold uppercase tracking-widest text-white/40 border border-white/10 bg-white/5">BETA</span></div></div>
        <div className="flex items-center gap-1.5"><div className="flex items-center gap-1 text-[6.5px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">backend</span></div><div className="flex items-center gap-1 text-[6.5px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">agent</span></div><div className="flex items-center gap-1 text-[6.5px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span>session e4bea0…</span></div><div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[6.5px] font-bold text-white border border-violet-500/40 bg-violet-500/10">⚡ Easy Mode</div><div className="px-2 py-0.5 rounded-md text-[6.5px] text-white/40 border border-white/10 bg-white/[0.03]">Reset Kernel</div></div>
      </div>
      <div className="absolute inset-0 top-7 flex z-10">
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.05]">
          <div className="px-3 py-1 border-b border-white/[0.04] flex items-center gap-2"><span className="text-[6px] text-white/30">• output —</span><span className="text-[6px] text-emerald-400 font-bold">ok</span></div>
          <div className="mx-3 mt-1.5 mb-1 flex items-center gap-2 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" /><span className="text-[6.5px] text-emerald-300">No missing values found in this dataset — no imputation required.</span></div>
          <div className="mx-3 mt-1 rounded-lg border border-white/[0.07] bg-white/[0.02] overflow-hidden flex-1">
            <div className="flex items-center gap-2 px-2 py-1 border-b border-white/[0.05]"><span className="text-[6px] text-white/30">[7]</span><div className="w-4 h-4 rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-[7px] text-emerald-400">▶</div><div className="flex items-center gap-1 ml-auto">{['↑','↓','⊕','🗑'].map(i => <span key={i} className="text-[7px] text-white/20 px-1">{i}</span>)}</div></div>
            <div className="px-3 py-1.5 space-y-0.5 font-mono">{[{ n: 1, color: '#60a5fa', text: 'import seaborn as sns, matplotlib.pyplot as plt' }, { n: 2, color: '#c084fc', text: "sns.set_theme(style='darkgrid', palette='muted')" }, { n: 3, color: '#c084fc', text: "plt.style.use('dark_background')" }, { n: 4, color: '#fbbf24', text: "plt.rcParams.update({'figure.facecolor':'#0d1117',…})" }, { n: 5, color: '#4ade80', text: "sns.boxplot(data=df, x='loyalty_status', y='spending_score')" }, { n: 6, color: '#fbbf24', text: "plt.title('Spending Score by Loyalty Status')" }, { n: 7, color: '#fbbf24', text: "plt.xlabel('Loyalty Status')" }, { n: 8, color: '#fbbf24', text: "plt.ylabel('Spending Score')" }, { n: 9, color: '#fbbf24', text: 'plt.tight_layout()' }, { n: 10, color: '#e2e8f0', text: "print('The box plot indicates that higher spending…')" }].map(l => (<div key={l.n} className="flex items-start gap-2"><span className="text-[5.5px] text-white/20 w-3 text-right flex-shrink-0">{l.n}</span><span className="text-[6px] leading-relaxed" style={{ color: l.color }}>{l.text}</span></div>))}</div>
            <div className="px-3 py-1 border-t border-white/[0.04] flex items-center gap-2"><span className="text-[6px] text-white/25">• output —</span><span className="text-[6px] text-emerald-400 font-bold">ok</span><span className="text-[6px] text-blue-400 ml-1">— 1 chart</span></div>
            <div className="px-3 py-1 border-t border-white/[0.03]"><p className="text-[6px] text-white/40 leading-relaxed">The box plot indicates that higher spending scores are associated with Gold and Platinum loyalty statuses.</p></div>
            <div className="mx-3 mb-2 mt-1 rounded-lg border border-white/[0.07] bg-[#0d1117] p-2">
              <div className="text-[6px] text-white/50 text-center mb-1.5 font-medium">Spending Score by Loyalty Status</div>
              <div className="flex gap-1.5" style={{ height: '42px' }}><div className="flex flex-col justify-between text-[4.5px] text-white/25 pr-0.5" style={{ width: '10px' }}>{['95','90','85','80','75','70','65','60'].map(v => <span key={v}>{v}</span>)}</div><div className="flex-1 relative border-l border-b border-white/10"><div className="absolute inset-0 flex items-end justify-around px-2 pb-0.5">{[{ h: 14, mt: 4 }, { h: 12, mt: 8 }, { h: 10, mt: 2 }, { h: 8, mt: 0 }].map((b, i) => (<div key={i} className="flex flex-col items-center gap-0" style={{ width: '14px', marginBottom: `${b.mt}px` }}><div className="w-px bg-white/20" style={{ height: '4px' }} /><div className="w-full rounded-sm border border-teal-400/60 bg-teal-400/15" style={{ height: `${b.h}px` }} /><div className="w-px bg-white/20" style={{ height: '3px' }} /></div>))}</div></div></div>
              <div className="flex justify-around mt-0.5 pl-3">{['Gold','Platinum','Silver','Bronze'].map(l => (<span key={l} className="text-[5px] text-white/30">{l}</span>))}</div>
            </div>
          </div>
          <div className="mx-3 my-1.5 flex items-center justify-center gap-1 py-1 rounded-lg border border-dashed border-white/[0.08] text-[6.5px] text-white/25"><span>+</span><span>Add Cell</span></div>
        </div>
        <div className="w-48 flex flex-col flex-shrink-0" style={{ background: '#0a0c13' }}>
          <div className="px-3 py-1.5 border-b border-white/[0.05] flex items-center justify-between"><div className="flex items-center gap-1"><span className="text-[9px]">🤖</span><span className="text-white text-[8px] font-black">ML Agent</span></div><div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[5.5px] font-bold border border-violet-400/30 bg-violet-500/10 text-violet-300">✦ GPT-4O-MINI</div></div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05] space-y-1"><div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-[6.5px] text-emerald-300"><span>📄</span><span>customer_data.csv</span></div></div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05]"><div className="w-full rounded-full overflow-hidden bg-white/[0.06]" style={{ height: '3px' }}><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: '72%' }} /></div><p className="text-[5.5px] text-white/30 mt-1 italic">Running Exploratory Data Analysis…</p></div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05] space-y-1"><div className="flex items-center justify-between px-2 py-1 rounded-lg border border-blue-500/25 bg-blue-500/5"><div className="flex items-center gap-1"><span className="text-[7px]">📊</span><span className="text-[6.5px] font-bold text-blue-300">Exploratory Data Analysis</span></div><span className="text-white/20 text-[6px]">▶</span></div><p className="text-[5.5px] text-white/35 leading-relaxed px-1">The exploratory data analysis will reveal the distribution of the target variable, correlations among numeric features, and missing values.</p></div>
          <div className="px-2.5 py-1 border-b border-white/[0.05] space-y-0.5"><div className="flex items-center justify-between px-2 py-1 rounded-lg border border-yellow-500/20 bg-yellow-500/5"><div className="flex items-center gap-1"><span className="text-[6.5px]">⭐</span><span className="text-[6px] text-yellow-300 font-bold">Feature Importance Notes</span></div><span className="text-white/20 text-[6px]">▶</span></div><div className="flex items-center justify-between px-2 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02]"><div className="flex items-center gap-1"><span className="text-[6.5px]">⚙</span><span className="text-[6px] text-white/45 font-bold">Preprocessing Recommendations</span></div><span className="text-white/20 text-[6px]">▶</span></div></div>
          <div className="px-2.5 py-1.5 flex-1 overflow-hidden space-y-1">
            <div className="text-[6.5px] font-black text-yellow-300 flex items-center gap-1"><span>🏆</span> Top 3 Recommended Models</div>
            <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-2 space-y-1"><div className="flex items-center justify-between"><span className="text-[6.5px] font-black text-white flex items-center gap-1"><span>🌲</span> Random Forest Classifier</span></div><p className="text-[5.5px] text-white/35 leading-relaxed">This model is robust to overfitting and handles categorical features well.</p><div className="space-y-0.5"><div className="text-[5.5px] text-emerald-400 flex items-center gap-1"><span>✓</span> Handles non-linear relationships</div><div className="text-[5.5px] text-emerald-400 flex items-center gap-1"><span>✓</span> Robust to outliers</div><div className="text-[5.5px] text-red-400/80 flex items-center gap-1"><span>✗</span> Can be slower on larger datasets</div></div><div className="w-full py-1 rounded-lg text-[6px] font-bold text-white text-center" style={{ background: 'linear-gradient(90deg,#4f46e5,#7c3aed)' }}>▶ Build Pipeline with Random Forest Classifier</div></div>
            <div className="flex items-center justify-between px-2 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02]"><div className="flex items-center gap-1"><span className="text-[7px]">🔵</span><span className="text-[6.5px] text-white/55 font-semibold">Logistic Regression</span></div></div>
            <div className="flex items-center justify-between px-2 py-1 rounded-lg border border-white/[0.06] bg-white/[0.02]"><div className="flex items-center gap-1"><span className="text-[7px]">📈</span><span className="text-[6.5px] text-white/55 font-semibold">Gradient Boosting Classifier</span></div></div>
          </div>
          <div className="px-2.5 py-1.5 border-t border-white/[0.05]"><div className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[6px] text-white/20">Ask anything about your data or pipeline…</div></div>
        </div>
      </div>
    </div>
  );
}

const modelingCodeAnnotations = [
  { icon: '📦', label: 'No Missing Values Banner', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', description: 'The green banner confirms "No missing values found in this dataset — no imputation required." This appears after the agent\'s data quality check completes, meaning your dataset is clean and ready for EDA.' },
  { icon: '🖥', label: 'Cell [7] — Seaborn Box Plot', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', description: 'The agent auto-generates a seaborn box plot in cell [7]. It sets a dark theme, plots spending_score vs loyalty_status, and prints an interpretation. The green ▶ "Done" button and "ok — 1 chart" confirm execution succeeded.' },
  { icon: '📊', label: 'Box Plot Chart', color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)', border: 'rgba(45,212,191,0.2)', description: 'The rendered "Spending Score by Loyalty Status" box plot shows Gold and Platinum customers have higher spending scores. This is a key insight the agent uses to justify its model recommendations.' },
  { icon: '📋', label: 'EDA Summary (right panel)', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', description: 'The "Exploratory Data Analysis" and "EDA Summary" accordion items in the right panel stream the agent\'s findings — target variable distribution, numeric correlations, missing value summary.' },
  { icon: '⭐', label: 'Feature Importance & Preprocessing', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', description: '"Feature Importance Notes" lists which columns drive predictions most. "Preprocessing Recommendations" tells you what encoding or scaling was applied. Both are collapsible cards — click ▶ to expand.' },
  { icon: '🏆', label: 'Top 3 Recommended Models', color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)', description: 'The agent recommends 3 models: 🌲 Random Forest Classifier (top pick — with pros, cons, and an expected accuracy note), 🔵 Logistic Regression, and 📈 Gradient Boosting Classifier. Click "▶ Build Pipeline" on any to start training.' },
];

const modelingEasyAnnotations = [
  { icon: '✅', label: '4-Step Progress Bar', color: '#4ade80', bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', description: 'Steps ✓ Upload and ✓ Analyse are green and complete. Step 3 "Train Model" activates when you click "▶ Build Pipeline" in the right panel. Step 4 "Done" lights up once training finishes.' },
  { icon: '🏆', label: 'Analysis Complete Banner', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', description: 'The gold "Analysis Complete" banner confirms EDA is done: "AI has analysed your data and suggested models." This is your cue to review the 3 visualisation charts and pick a model from the right panel.' },
  { icon: '📊', label: '3 Visualisation Charts', color: '#2dd4bf', bg: 'rgba(45,212,191,0.08)', border: 'rgba(45,212,191,0.2)', description: 'Three auto-generated charts: (1) Distribution of Loyalty Status — bar chart showing Gold is the most common tier. (2) Correlation Heatmap — red cells highlight strong relationships. (3) Spending Score by Loyalty Status — box plot.' },
  { icon: '⚙', label: 'Adjust Settings Panel', color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', description: 'The expanded "Adjust Settings" section shows two sliders: Test Split (20%) and CV Folds (5), plus a free-text notes field. Click "✨ Apply Settings & Retrain" to re-run with your changes.' },
  { icon: '🌲', label: 'Top 3 Recommended Models', color: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)', description: 'The right panel shows 3 ranked models: 🌲 Random Forest (top pick with pros/cons and "▶ Build Pipeline" button), 🔵 Logistic Regression, and 📈 Gradient Boosting Classifier. Pick any one to start training.' },
  { icon: '💬', label: 'Ask the AI Agent', color: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.2)', description: 'The "Ask the AI Agent" chat box lets you send questions at any time: "Show feature importance", "Try a different model", "Explain the results". Press Enter or click ↑ to send.' },
];

function Step8Content({ accentColor }: { accentColor: string }) {
  const [activeMode, setActiveMode] = useState<'easy' | 'code'>('easy');
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const annotations = activeMode === 'easy' ? modelingCodeAnnotations : modelingEasyAnnotations;
  return (
    <div className="space-y-12">
      <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-4xl">Once analysis completes, you're ready to pick a model and build your ML pipeline. In <strong className="text-white">Easy Mode</strong>, you see visualisation charts and a clean model picker. In <strong className="text-white">Code Mode</strong>, the agent renders a seaborn box plot, streams EDA results, and shows the Top 3 models — all in the right sidebar.</p>
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => { setActiveMode('easy'); setActiveAnnotation(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border" style={activeMode === 'easy' ? { background: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.4)', color: '#a78bfa' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>✨ Easy Mode</button>
        <button onClick={() => { setActiveMode('code'); setActiveAnnotation(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 border" style={activeMode === 'code' ? { background: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.4)', color: '#60a5fa' } : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>🖥 Code Mode</button>
        <span className="text-xs text-white/25 ml-1">Toggle to see model selection in each mode</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full" style={{ background: activeMode === 'easy' ? '#a78bfa' : '#60a5fa' }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Model Selection ({activeMode === 'easy' ? 'Easy Mode' : 'Code Mode'})</p></div>
        <div className="mx-auto w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60">{activeMode === 'easy' ? <ModelingCodeModeMockup /> : <EasyModeMockup />}</div>
        <p className="text-[11px] text-white/25 text-center max-w-3xl mx-auto">↑ {activeMode === 'easy' ? 'Code Mode — seaborn box plot rendered, EDA summary and Top 3 models in right panel' : 'Easy Mode — analysis complete, charts and top 3 models ready to pick'}</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5"><span className="w-2 h-2 rounded-full" style={{ background: accentColor }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — {activeMode === 'easy' ? 'Easy Mode' : 'Code Mode'} — Click to Explore</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {annotations.map((ann, i) => (<button key={`${activeMode}-${i}`} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)} className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5" style={{ background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)', borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)' }}><div className="flex items-center gap-3 mb-2"><span className="text-xl">{ann.icon}</span><span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span><span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span></div>{activeAnnotation === i && <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>}</button>))}
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2"><span>🚀</span> How To Pick Your Model & Build the Pipeline</h4>
        <div className="space-y-3">
          {[{ step: '1', text: 'In Easy Mode — check the 3 charts (distribution, correlation heatmap, income distribution) to understand your data profile before choosing a model.' }, { step: '2', text: 'In Code Mode — read the box plot insight text below the chart. It tells you which loyalty tiers have higher spending scores.' }, { step: '3', text: 'In the right sidebar (both modes) — scroll to "Top 3 Recommended Models". Read the pros, cons, and expected accuracy note for each one.' }, { step: '4', text: 'Click "▶ Build Pipeline with [Model Name]" on your chosen model. The agent will auto-generate the full training pipeline and move to Step 3 of the progress bar.' }, { step: '5', text: 'Not sure which model to pick? Ask in the chat: "Which model is best for predicting loyalty_status?" — the agent explains its reasoning based on your specific dataset.' }].map((item) => (<div key={item.step} className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-300 flex-shrink-0 mt-0.5">{item.step}</span><p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p></div>))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STEP 9 — TRAINING RESULTS + TEST YOUR MODEL
// ─────────────────────────────────────────────

// Easy Mode: "Model Trained Successfully!" view (matches screenshot)
function TrainingResultsEasyMockup() {
  const fields: [string, string][] = [
    ['age', '23'], ['income', '23,000'], ['credit_score', '434'], ['spending_score', '34354'],
    ['purchase_frequency', '54'], ['gender_Male', 'male'],
    ['loyalty_status_Bronze', 'silver'], ['loyalty_status_Gold', '344'],
    ['loyalty_status_Platinum', '453'], ['loyalty_status_Silver', '4'],
  ];
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-teal-500/20 shadow-2xl shadow-teal-900/20" style={{ aspectRatio: '16/9', background: '#080a10' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#090b14 0%,#06080f 100%)' }} />
      {/* NAVBAR */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 z-10 border-b border-white/[0.06]" style={{ background: '#0b0d16' }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-[7px] text-white/50"><span>←</span><span>Dashboard</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[7px]">🧪</div><span className="text-white text-[9px] font-black">Lab Playground</span><span className="px-1 py-0.5 rounded text-[5.5px] font-bold uppercase tracking-widest text-white/40 border border-white/10 bg-white/5">BETA</span></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-[6.5px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">backend</span></div>
          <div className="flex items-center gap-1 text-[6.5px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">agent</span></div>
          <div className="flex items-center gap-1 text-[6.5px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span>session e4bea0…</span></div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[6.5px] font-bold text-white border border-white/20 bg-white/10">⬇ Download Model</div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[6.5px] font-bold text-yellow-300 border border-yellow-500/40 bg-yellow-500/10">🐍 Python Script</div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[6.5px] font-bold text-white border border-blue-500/40 bg-blue-500/15">🖥 Code Mode</div>
          <div className="px-2 py-0.5 rounded-md text-[6.5px] text-white/40 border border-white/10 bg-white/[0.03]">Reset Kernel</div>
        </div>
      </div>
      {/* MAIN LAYOUT */}
      <div className="absolute inset-0 top-7 flex z-10">
        {/* LEFT panel — Easy Mode content */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.05] px-2.5 py-2 space-y-1.5">
          {/* Easy Mode banner */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 flex items-start gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[9px] flex-shrink-0">✨</div>
            <div><div className="text-white text-[8px] font-black">Easy Mode</div><div className="text-white/40 text-[6.5px]">No code needed — the AI handles everything.</div></div>
          </div>
          {/* Progress bar — all 4 done */}
          <div className="flex items-center px-1">
            {[{ n: '✓', label: 'Upload', done: true }, { n: '✓', label: 'Analyse', done: true }, { n: '✓', label: 'Train Model', done: true }, { n: '✓', label: 'Done', done: true }].map((s, i) => (
              <div key={s.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold bg-green-500 text-white">{s.n}</div>
                  <span className="text-[5.5px] mt-0.5 text-green-400/80">{s.label}</span>
                </div>
                {i < 3 && <div className="flex-1 h-px mx-1 mb-3 bg-green-500/60" />}
              </div>
            ))}
          </div>
          {/* Model Trained Successfully banner */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 flex items-center gap-2">
            <span className="text-sm flex-shrink-0">✅</span>
            <div>
              <div className="text-emerald-300 text-[7.5px] font-black">Model Trained Successfully!</div>
              <div className="text-white/40 text-[6px]">Your RandomForestClassifier model is ready. View results and charts above, or download the model below.</div>
            </div>
          </div>
          {/* Model Performance */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
            <div className="text-[6.5px] font-bold text-white/50 uppercase tracking-widest mb-1 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-white/30" />Model Performance</div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-teal-500/30 bg-teal-500/5 px-3 py-1.5 text-center">
                <div className="text-[13px] font-black text-teal-300">25.0%</div>
                <div className="text-[6px] text-white/30">Accuracy</div>
              </div>
              <p className="text-[6px] text-white/30 leading-relaxed flex-1">Accuracy reflects the proportion of correct predictions. A 25% score on a 20-row dataset is expected — results improve dramatically with more data.</p>
            </div>
          </div>
          {/* Test Your Model */}
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-2.5 py-1.5 flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1"><span className="text-[9px]">✏</span><span className="text-[7.5px] font-black text-white">Test Your Model</span></div>
              <span className="text-[5.5px] text-amber-400 font-medium">Enter values → Predict</span>
            </div>
            <div className="grid grid-cols-2 gap-1 mb-1.5">
              {fields.slice(0, 8).map(([name, val]) => (
                <div key={name} className="rounded-md border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                  <div className="text-[5.5px] text-white/30 px-1.5 pt-0.5">{name}</div>
                  <div className="text-[6.5px] text-white/70 font-medium px-1.5 pb-0.5">{val}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 mb-1.5">
              {fields.slice(8).map(([name, val]) => (
                <div key={name} className="rounded-md border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                  <div className="text-[5.5px] text-white/30 px-1.5 pt-0.5">{name}</div>
                  <div className="text-[6.5px] text-white/70 font-medium px-1.5 pb-0.5">{val}</div>
                </div>
              ))}
            </div>
            <div className="w-full py-1.5 rounded-lg text-[7px] font-black text-white text-center flex items-center justify-center gap-1" style={{ background: 'linear-gradient(90deg,#d97706,#f59e0b)', boxShadow: '0 3px 10px rgba(245,158,11,0.25)' }}><span>▶</span> Run Prediction</div>
          </div>
          {/* Adjust Settings */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1"><span className="text-[8px]">⚙</span><span className="text-[7px] text-blue-400 font-bold">Adjust Settings</span></div>
            <span className="text-white/20 text-[7px]">›</span>
          </div>
          {/* Ask the AI Agent */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-1.5">
            <div className="flex items-center gap-1 mb-1"><span className="text-[8px]">💬</span><span className="text-[7px] text-white/55 font-bold">Ask the AI Agent</span></div>
            <div className="flex items-center gap-1"><div className="flex-1 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[6px] text-white/20">Ask anything: 'Show feature importance', 'Try a different model', 'Explain the results'…</div><div className="w-5 h-5 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-[7px] text-white/30">↑</div></div>
          </div>
        </div>
        {/* RIGHT PANEL */}
        <div className="w-48 flex flex-col flex-shrink-0" style={{ background: '#0a0c13' }}>
          <div className="px-3 py-1.5 border-b border-white/[0.05] flex items-center justify-between"><div className="flex items-center gap-1"><span className="text-[9px]">🤖</span><span className="text-white text-[8px] font-black">ML Agent</span></div><div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[5.5px] font-bold border border-violet-400/30 bg-violet-500/10 text-violet-300">✦ GPT-4O-MINI</div></div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05] space-y-1">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-[6.5px] text-emerald-300"><span>📄</span><span>customer_data.csv</span></div>
            <div className="flex items-center justify-between text-[6px]"><span className="text-white/30">target column (optional)</span><span className="text-emerald-400 font-bold">✓ Pipeline built</span></div>
          </div>
          <div className="px-2.5 py-2 border-b border-white/[0.05] flex-shrink-0">
            <p className="text-[6px] text-white/40 leading-relaxed">In predicting customer loyalty status, the confusion matrix shows true positives and true negatives, indicating strong predictive accuracy. A significant number of false positives or negatives suggests areas for improvement. This insight guides further model tuning or feature engineering to enhance classification accuracy and better understand customer engagement patterns.</p>
          </div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05]">
            <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <span className="text-[9px] flex-shrink-0">🟢</span>
              <p className="text-[6px] text-emerald-300 leading-relaxed">Pipeline complete! All cells have been added to the notebook.</p>
            </div>
          </div>
          {/* Right: Test Your Model mirror */}
          <div className="px-2.5 py-1.5 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-1.5"><div className="flex items-center gap-1"><span className="text-[8px]">✏</span><span className="text-[7.5px] font-black text-white">Test Your Model</span></div><span className="text-[5.5px] text-violet-400">Enter values → Predict</span></div>
            <div className="space-y-1">
              {fields.map(([name, val]) => (
                <div key={name} className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                  <span className="text-[6px] text-white/45 px-2 py-1 flex-shrink-0 min-w-[70px] font-medium">{name}</span>
                  <div className="w-px self-stretch bg-white/[0.06]" />
                  <div className="flex-1 px-2 py-1 text-[6px] text-white/60">{val}</div>
                </div>
              ))}
            </div>
            <div className="mt-1.5 w-full py-2 rounded-xl text-[7px] font-black text-white text-center flex items-center justify-center gap-1.5" style={{ background: 'linear-gradient(90deg,#7c3aed,#a855f7)', boxShadow: '0 4px 10px rgba(124,58,237,0.3)' }}><span>▶</span> Run Prediction</div>
          </div>
          <div className="px-2.5 py-1.5 border-t border-white/[0.05]"><div className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[6px] text-white/20">Ask anything about your data or pipeline…</div></div>
        </div>
      </div>
    </div>
  );
}

// Code Mode: cells [7], [9], [10] with confusion matrix (existing TrainingResultsMockup renamed)
function TrainingResultsMockup() {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-emerald-500/20 shadow-2xl shadow-emerald-900/20" style={{ aspectRatio: '16/9', background: '#080a10' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg,#090b14 0%,#06080f 100%)' }} />
      {/* NAVBAR */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 z-10 border-b border-white/[0.06]" style={{ background: '#0b0d16' }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.04] text-[7px] text-white/50"><span>←</span><span>Dashboard</span></div>
          <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[7px]">🧪</div><span className="text-white text-[9px] font-black">Lab Playground</span><span className="px-1 py-0.5 rounded text-[5.5px] font-bold uppercase tracking-widest text-white/40 border border-white/10 bg-white/5">BETA</span></div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 text-[6.5px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">backend</span></div>
          <div className="flex items-center gap-1 text-[6.5px]"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-green-400/80">agent</span></div>
          <div className="flex items-center gap-1 text-[6.5px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/40"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span>session e4bea0…</span></div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[6.5px] font-bold text-white border border-white/20 bg-white/10">⬇ Download Model</div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[6.5px] font-bold text-yellow-300 border border-yellow-500/40 bg-yellow-500/10">🐍 Python Script</div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[6.5px] font-bold text-white border border-violet-500/40 bg-violet-500/10">⚡ Easy Mode</div>
          <div className="px-2 py-0.5 rounded-md text-[6.5px] text-white/40 border border-white/10 bg-white/[0.03]">Reset Kernel</div>
        </div>
      </div>
      {/* MAIN LAYOUT */}
      <div className="absolute inset-0 top-7 flex z-10">
        {/* LEFT — Code cells */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.05] px-2 py-1.5 space-y-1.5">
          {/* Previous cell output */}
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
            <div className="flex items-center gap-2 mb-1"><span className="text-[6px] text-white/25">[7]</span><span className="text-[6px] text-emerald-400 font-bold">✓ done</span></div>
            <div className="font-mono text-[5.5px] text-violet-300/70"><div><span className="text-[5px] text-white/20 mr-2">1</span>print('Data cleaning and preparation complete. Shape of X:', X.shape)</div></div>
            <div className="mt-1 pt-1 border-t border-white/[0.04]"><span className="text-[5.5px] text-white/25">• output — </span><span className="text-[5.5px] text-emerald-400">ok</span><p className="text-[5.5px] text-white/50 mt-0.5 font-mono">Data cleaning and preparation complete. Shape of X: (20, 7)</p></div>
          </div>
          {/* Cell [9] */}
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-2 py-1 border-b border-white/[0.05]"><span className="text-[6px] text-white/30">[9]</span><div className="w-4 h-4 rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-[7px] text-emerald-400">▶</div><div className="flex gap-1 ml-auto">{['↑','↓','⊕','🗑'].map(ic => <span key={ic} className="text-[6.5px] text-white/20 px-0.5">{ic}</span>)}</div></div>
            <div className="px-3 py-1.5 font-mono space-y-0.5">
              <div className="flex gap-2"><span className="text-[5.5px] text-white/20 w-3 text-right">1</span><span className="text-[6px] text-emerald-300">model = RandomForestClassifier(n_estimators=100, max_depth=15, n_jobs=-1, random_state=42)</span></div>
              <div className="flex gap-2"><span className="text-[5.5px] text-white/20 w-3 text-right">2</span><span className="text-[6px] text-blue-300">model.fit(X_train, y_train)</span></div>
              <div className="flex gap-2"><span className="text-[5.5px] text-white/20 w-3 text-right">3</span><span className="text-[6px] text-yellow-300">print('Model training complete.')</span></div>
            </div>
            <div className="px-2 py-1 border-t border-white/[0.04]"><span className="text-[5.5px] text-white/25">• output — </span><span className="text-[5.5px] text-emerald-400">ok</span><p className="text-[5.5px] text-white/50 mt-0.5 font-mono">Model training complete.</p></div>
          </div>
          {/* Cell [10] */}
          <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <div className="flex items-center gap-2 px-2 py-1 border-b border-white/[0.05]"><span className="text-[6px] text-white/30">[10]</span><div className="w-4 h-4 rounded-full border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center text-[7px] text-emerald-400">▶</div><div className="flex gap-1 ml-auto">{['↑','↓','⊕','🗑'].map(ic => <span key={ic} className="text-[6.5px] text-white/20 px-0.5">{ic}</span>)}</div></div>
            <div className="px-3 py-1.5 font-mono space-y-0.5">
              {[{ n:1, color:'#60a5fa', text:'y_pred = model.predict(X_test)' }, { n:2, color:'#4ade80', text:'accuracy = accuracy_score(y_test, y_pred)' }, { n:3, color:'#4ade80', text:'report = classification_report(y_test, y_pred)' }, { n:4, color:'#4ade80', text:'cm = confusion_matrix(y_test, y_pred)' }, { n:5, color:'#64748b', text:'' }, { n:6, color:'#fbbf24', text:"print('Accuracy:', accuracy)" }, { n:7, color:'#fbbf24', text:"print('Classification Report:\\n', report)" }, { n:8, color:'#64748b', text:'' }, { n:9, color:'#94a3b8', text:'# Confusion Matrix' }, { n:10, color:'#a78bfa', text:"sns.heatmap(cm, cmap='Blues', annot=True, fmt='d')" }, { n:11, color:'#fbbf24', text:"plt.xlabel('Predicted Label')" }, { n:12, color:'#fbbf24', text:"plt.ylabel('True Label')" }, { n:13, color:'#fbbf24', text:"plt.title('Confusion Matrix')" }, { n:14, color:'#fbbf24', text:'plt.tight_layout()' }].map(l => (<div key={l.n} className="flex gap-2"><span className="text-[5.5px] text-white/20 w-3 text-right flex-shrink-0">{l.n}</span><span className="text-[6px] leading-relaxed" style={{ color: l.color || '#64748b' }}>{l.text || '\u00a0'}</span></div>))}
            </div>
            <div className="px-2 py-1 border-t border-white/[0.04]"><span className="text-[5.5px] text-white/25">• output — </span><span className="text-[5.5px] text-emerald-400">ok</span><span className="text-[5.5px] text-blue-400 ml-1">— 1 chart</span></div>
            {/* Classification report */}
            <div className="px-3 pb-1.5 font-mono" style={{ fontSize: '5.5px', lineHeight: '1.7', color: '#94a3b8' }}>
              <div>Accuracy: 0.25</div>
              <div>Classification Report:</div>
              <div className="pl-2 grid" style={{ gridTemplateColumns: '60px 40px 40px 40px 40px', gap: '0 4px' }}>
                <span className="text-white/30"></span><span className="text-white/50">precision</span><span className="text-white/50">recall</span><span className="text-white/50">f1-score</span><span className="text-white/50">support</span>
                <span className="text-white/50">Gold</span><span>0.00</span><span>0.00</span><span>0.00</span><span>2</span>
                <span className="text-white/50">Platinum</span><span>0.00</span><span>0.00</span><span>0.00</span><span>1</span>
                <span className="text-white/50">Silver</span><span>0.33</span><span>1.00</span><span>0.50</span><span>1</span>
                <span className="text-white/50">accuracy</span><span></span><span></span><span className="text-white">0.25</span><span>4</span>
                <span className="text-white/50">macro avg</span><span>0.11</span><span>0.33</span><span>0.17</span><span>4</span>
                <span className="text-white/50">weighted avg</span><span>0.08</span><span>0.25</span><span>0.12</span><span>4</span>
              </div>
            </div>
            {/* Confusion Matrix */}
            <div className="mx-3 mb-2 rounded-lg border border-white/[0.07] bg-[#0d1117] p-1.5">
              <div className="text-[6px] text-white/40 text-center mb-1.5 font-medium">Confusion Matrix</div>
              <div className="flex items-start gap-1">
                <div className="flex items-center justify-center text-[5px] text-white/30" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '44px', width: '8px' }}>True Label</div>
                <div className="flex-1">
                  <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                    {[['0','0','2','0'],['0','0','1','0'],['0','0','1','0'],['0','0','0','0']].map((row, ri) => row.map((v, ci) => (<div key={`${ri}-${ci}`} className="rounded-sm flex items-center justify-center text-[6px] font-bold text-white" style={{ height: '11px', background: parseInt(v) >= 2 ? '#2563eb' : parseInt(v) === 1 ? '#1d4ed8' : '#1e3a5f' }}>{v}</div>)))}
                  </div>
                  <div className="flex justify-around mt-1">{['Gold','Platinum','Silver','Bronze'].map(l => (<span key={l} className="text-[4.5px] text-white/30">{l}</span>))}</div>
                  <div className="text-[5px] text-white/25 text-center mt-0.5">Predicted Label</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 py-1 rounded-lg border border-dashed border-white/[0.07] text-[6.5px] text-white/25"><span>+</span><span>Add Cell</span></div>
        </div>
        {/* RIGHT PANEL */}
        <div className="w-52 flex flex-col flex-shrink-0" style={{ background: '#0a0c13' }}>
          <div className="px-3 py-1.5 border-b border-white/[0.05] flex items-center justify-between"><div className="flex items-center gap-1"><span className="text-[9px]">🤖</span><span className="text-white text-[8px] font-black">ML Agent</span></div><div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[5.5px] font-bold border border-violet-400/30 bg-violet-500/10 text-violet-300">✦ GPT-4O-MINI</div></div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05] space-y-1"><div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-[6.5px] text-emerald-300"><span>📄</span><span>customer_data.csv</span></div><div className="flex items-center gap-1.5 text-[6.5px] text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" /><span>✓ Pipeline built</span></div></div>
          <div className="px-2.5 py-2 border-b border-white/[0.05] flex-shrink-0"><p className="text-[6px] text-white/40 leading-relaxed">In predicting customer loyalty status, it shows the number of true positives, true negatives, false positives, and false negatives, allowing us to assess how well the model distinguishes between different loyalty tiers. If the model has a high number of true positives and true negatives, it indicates strong predictive accuracy, while a significant number of false positives or false negatives suggests areas for improvement. This insight can guide further model tuning or feature engineering to enhance classification accuracy and better understand customer engagement patterns.</p></div>
          <div className="px-2.5 py-1.5 border-b border-white/[0.05]"><div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5"><span className="text-[9px] flex-shrink-0">🟢</span><p className="text-[6px] text-emerald-300 leading-relaxed">Pipeline complete! All cells have been added to the notebook.</p></div></div>
          {/* Test Your Model */}
          <div className="px-2.5 py-1.5 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-1"><span className="text-[8px]">✏</span><span className="text-[7.5px] font-black text-white">Test Your Model</span></div><span className="text-[6px] text-violet-400 font-medium">Enter values → Predict</span></div>
            <div className="space-y-1">
              {['age','income','credit_score','spending_score','purchase_frequency','gender_Male','loyalty_status_Bronze','loyalty_status_Gold','loyalty_status_Platinum','loyalty_status_Silver'].map((field) => (
                <div key={field} className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden">
                  <span className="text-[6px] text-white/45 px-2 py-1 flex-shrink-0 min-w-[72px] font-medium">{field}</span>
                  <div className="w-px self-stretch bg-white/[0.06]" />
                  <div className="flex-1 px-2 py-1 text-[6px] text-white/20">value</div>
                </div>
              ))}
            </div>
            <div className="mt-2 w-full py-2 rounded-xl text-[7.5px] font-black text-white text-center flex items-center justify-center gap-1.5" style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}><span>▶</span> Run Prediction</div>
          </div>
          <div className="px-2.5 py-1.5 border-t border-white/[0.05]"><div className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] px-2 py-1 text-[6px] text-white/20">Ask anything about your data or pipeline… (Enter to send)</div></div>
        </div>
      </div>
    </div>
  );
}

const trainingResultsEasyAnnotations = [
  { icon: '⬇', label: 'Download Model & Python Script', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', description: 'Two new buttons appear in the top navbar once training completes: "⬇ Download Model" saves your trained model as a .pkl file. "🐍 Python Script" exports the full pipeline as a standalone Python script you can run anywhere.' },
  { icon: '✅', label: '4-Step Progress — All Done', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', description: 'All four steps (Upload ✓, Analyse ✓, Train Model ✓, Done ✓) are now green with checkmarks. This confirms the full Easy Mode ML pipeline has completed — no further action required to get a trained model.' },
  { icon: '🏆', label: 'Model Trained Successfully! Banner', color: '#34d399', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)', description: 'The green "✅ Model Trained Successfully!" banner confirms your RandomForestClassifier is ready. It tells you to view results and charts above, or use the download buttons below to save your model.' },
  { icon: '📊', label: 'Model Performance — 25.0% Accuracy', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', description: 'The "Model Performance" card shows Accuracy: 25.0%. This is the percentage of test samples predicted correctly. Low accuracy on a 20-row dataset is expected — the same model on 1,000+ rows would score much higher.' },
  { icon: '✏', label: 'Test Your Model — Grid Input Fields', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.25)', description: 'The "Test Your Model" section shows 10 input fields in a 2-column grid: age, income, credit_score, spending_score, purchase_frequency, gender_Male, and all 4 loyalty_status one-hot encoded columns. Enter real values and click "▶ Run Prediction" to get a live prediction from your model.' },
  { icon: '▶', label: 'Run Prediction & Adjust Settings', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', description: 'The amber "▶ Run Prediction" button submits all input values to your trained model and returns the predicted loyalty tier. Below it, "⚙ Adjust Settings" lets you change Test Split and CV Folds and retrain with different hyperparameters.' },
];

const trainingResultsCodeAnnotations = [
  { icon: '⬇', label: 'Download Model & Python Script buttons', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)', description: 'Two new buttons appear in the top navbar once training completes: "⬇ Download Model" saves your trained model as a .pkl file for use in external apps. "🐍 Python Script" exports the full pipeline as a standalone Python script you can run anywhere.' },
  { icon: '🌲', label: 'Cell [9] — Model Training', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)', description: 'Cell [9] contains the auto-generated training code: RandomForestClassifier(n_estimators=100, max_depth=15, n_jobs=-1, random_state=42) followed by model.fit(X_train, y_train). The output "Model training complete." confirms the model has been fitted on your training data.' },
  { icon: '📋', label: 'Cell [10] — Evaluation & Confusion Matrix', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', description: 'Cell [10] runs predictions on the held-out test set, computes accuracy_score and classification_report, then renders a seaborn heatmap confusion matrix. The output shows "ok — 1 chart" plus the full text report below.' },
  { icon: '📊', label: 'Classification Report', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)', description: 'The text output shows per-class precision, recall, f1-score, and support for each loyalty tier (Gold, Platinum, Silver), plus the overall accuracy (0.25), macro avg, and weighted avg. Low accuracy on a small 20-row dataset is expected — more data improves results significantly.' },
  { icon: '🟦', label: 'Confusion Matrix Heatmap', color: '#2dd4bf', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.25)', description: 'The blue "Blues" seaborn heatmap shows a 4×4 grid of true vs predicted labels. Each cell shows how many test samples were classified into each loyalty tier. Darker blue = more predictions. The diagonal (top-left to bottom-right) represents correct predictions.' },
  { icon: '✏', label: '"Test Your Model" Panel (right sidebar)', color: '#f472b6', bg: 'rgba(244,114,182,0.1)', border: 'rgba(244,114,182,0.25)', description: 'The right panel shows "Test Your Model" with input fields for every feature column. Fill in values (e.g. age=23, income=23000, credit_score=434) and click "▶ Run Prediction" to test your model live directly from Code Mode.' },
];

function Step9Content({ accentColor }: { accentColor: string }) {
  const [activeMode, setActiveMode] = useState<'easy' | 'code'>('easy');
  const [activeAnnotation, setActiveAnnotation] = useState<number | null>(null);
  const annotations = activeMode === 'easy' ? trainingResultsCodeAnnotations : trainingResultsEasyAnnotations;

  return (
    <div className="space-y-12">
      <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-4xl">
        After clicking <strong className="text-white">"▶ Build Pipeline"</strong>, the ML Agent trains your model and evaluates it. In <strong className="text-white">Easy Mode</strong>, you see a clean success banner, your accuracy score, and a <strong className="text-white">"Test Your Model"</strong> form with all feature inputs. In <strong className="text-white">Code Mode</strong>, Cell [9] trains the model and Cell [10] runs the full evaluation — generating a classification report and a confusion matrix heatmap.
      </p>
      {/* Mode toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => { setActiveMode('easy'); setActiveAnnotation(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border" style={{ background: activeMode === 'easy' ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(255,255,255,0.04)', color: activeMode === 'easy' ? '#fff' : 'rgba(255,255,255,0.4)', border: activeMode === 'easy' ? '1px solid rgba(96,165,250,0.5)' : '1px solid rgba(255,255,255,0.08)' }}>✨ Easy Mode</button>
        <button onClick={() => { setActiveMode('code'); setActiveAnnotation(null); }} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border" style={{ background: activeMode === 'code' ? 'linear-gradient(135deg,#0d9488,#14b8a6)' : 'rgba(255,255,255,0.04)', color: activeMode === 'code' ? '#fff' : 'rgba(255,255,255,0.4)', border: activeMode === 'code' ? '1px solid rgba(20,184,166,0.5)' : '1px solid rgba(255,255,255,0.08)' }}>🖥 Code Mode</button>
        <span className="text-[11px] text-white/25 italic">Click a tab to switch previews</span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4"><span className="w-2 h-2 rounded-full" style={{ background: activeMode === 'easy' ? '#60a5fa' : '#34d399' }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">Live Preview — Training Results ({activeMode === 'easy' ? 'Easy Mode' : 'Code Mode'})</p></div>
        <div className="mx-auto w-full max-w-3xl rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl shadow-black/60">
          {activeMode === 'easy' ? <TrainingResultsMockup /> : <TrainingResultsEasyMockup />}
        </div>
        <p className="text-[11px] text-white/25 text-center max-w-3xl mx-auto">↑ {activeMode === 'easy' ? 'Easy Mode — cells [7], [9], [10] with classification report + confusion matrix heatmap' : 'Code Mode — all steps ✓ complete, model performance + Test Your Model form'}</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-5"><span className="w-2 h-2 rounded-full" style={{ background: accentColor }} /><p className="text-xs font-bold uppercase tracking-widest text-white/30">UI Element Breakdown — {activeMode === 'easy' ? 'Easy Mode' : 'Code Mode'} — Click to Explore</p></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {annotations.map((ann, i) => (<button key={`${activeMode}-${i}`} onClick={() => setActiveAnnotation(activeAnnotation === i ? null : i)} className="text-left p-4 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5" style={{ background: activeAnnotation === i ? ann.bg : 'rgba(255,255,255,0.03)', borderColor: activeAnnotation === i ? ann.border : 'rgba(255,255,255,0.07)' }}><div className="flex items-center gap-3 mb-2"><span className="text-xl">{ann.icon}</span><span className="text-sm font-bold" style={{ color: ann.color }}>{ann.label}</span><span className="ml-auto text-white/20 text-xs">{activeAnnotation === i ? '▲' : '▼'}</span></div>{activeAnnotation === i && <p className="text-[13px] text-white/65 leading-relaxed mt-1">{ann.description}</p>}</button>))}
        </div>
      </div>
      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-3"><h4 className="text-sm font-bold text-blue-300 flex items-center gap-2"><span>✨</span> Easy Mode — What You See</h4><div className="space-y-2">{['Cell [7] output — data shape (20, 7) confirmed', 'Cell [9] — RandomForestClassifier training + "Model training complete."', 'Cell [10] — accuracy_score, classification_report, confusion_matrix', 'Seaborn Blues heatmap rendered inline in the notebook', 'Right panel: "Test Your Model" with feature inputs + Run Prediction', '"⬇ Download Model" & "🐍 Python Script" buttons in navbar'].map((item, i) => (<div key={i} className="flex items-start gap-2 text-[12px] text-white/55"><span className="text-blue-400 flex-shrink-0 mt-0.5">✓</span><span>{item}</span></div>))}</div></div>
        <div className="rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5 space-y-3"><h4 className="text-sm font-bold text-teal-300 flex items-center gap-2"><span>🖥</span> Code Mode — What You See</h4><div className="space-y-2">{['All 4 progress steps show ✓ green checkmarks', '"Model Trained Successfully!" banner with model name', 'Accuracy % shown in a metric card', '"Test Your Model" 2-column input grid — fill & predict', '"Adjust Settings" to change split/folds and retrain', '"Ask the AI Agent" chat for questions or re-runs'].map((item, i) => (<div key={i} className="flex items-start gap-2 text-[12px] text-white/55"><span className="text-teal-400 flex-shrink-0 mt-0.5">✓</span><span>{item}</span></div>))}</div></div>
      </div>
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 space-y-4">
        <h4 className="text-sm font-bold text-white/70 flex items-center gap-2"><span>📊</span> Understanding Your Evaluation Metrics</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[{ metric: 'Accuracy', what: 'Overall % of correct predictions across all classes.', note: 'Low accuracy (e.g. 0.25) is common with very small test sets — more rows = better signal.' }, { metric: 'Precision', what: 'Of all the times the model predicted class X, how often was it right?', note: 'High precision = fewer false alarms. Important when false positives are costly.' }, { metric: 'Recall', what: 'Of all the real class X samples, how many did the model catch?', note: 'High recall = fewer misses. Important when missing a positive case is costly.' }, { metric: 'F1-Score', what: 'Harmonic mean of precision and recall — balances both metrics in one number.', note: 'Best metric when classes are imbalanced (unequal support counts).' }].map((item) => (<div key={item.metric} className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]"><div className="text-[12px] font-black text-white mb-1">{item.metric}</div><div className="text-[11px] text-white/55 leading-relaxed mb-1">{item.what}</div><div className="text-[10px] text-white/30 italic">{item.note}</div></div>))}
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-6 space-y-4">
        <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2"><span>🧪</span> What To Do After Training</h4>
        <div className="space-y-3">
          {[{ step: '1', text: 'Read the classification report in the Cell [10] output. Look at the f1-score column — a score above 0.7 is generally good. Very small datasets (< 100 rows) will show lower scores.' }, { step: '2', text: 'Look at the Confusion Matrix heatmap — the diagonal (top-left to bottom-right) should have the highest numbers. Off-diagonal cells are mis-classifications.' }, { step: '3', text: 'Use the "Test Your Model" panel on the right — enter real feature values (e.g. age=35, income=65000, credit_score=720) and click "▶ Run Prediction" to see a live prediction.' }, { step: '4', text: 'Not happy with accuracy? Go back to Step 8, pick a different model ("▶ Build Pipeline with Gradient Boosting"), or click "⚙ Adjust Settings" and change the Test Split or CV Folds, then retrain.' }, { step: '5', text: 'Want to save your model? Click "⬇ Download Model" in the top navbar to get a .pkl file, or "🐍 Python Script" to export the full runnable pipeline as a Python script.' }].map((item) => (<div key={item.step} className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-300 flex-shrink-0 mt-0.5">{item.step}</span><p className="text-[13px] text-white/65 leading-relaxed">{item.text}</p></div>))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TUTORIAL PAGE
// ─────────────────────────────────────────────
export default function TutorialPage() {
  const shouldReduceMotion = useReducedMotion();
  const steps = [
    { number: 1, title: 'Home Page (About, Help)', icon: '⌂', color: 'from-violet-600/20 to-purple-800/20', accentColor: '#a78bfa', borderColor: 'border-violet-500/40', badge: 'Entry' },
    { number: 2, title: 'Login / Register', icon: '⇥', color: 'from-blue-600/20 to-indigo-800/20', accentColor: '#60a5fa', borderColor: 'border-blue-500/40', badge: 'Auth' },
    { number: 3, title: 'Welcome Page (Profile Update)', icon: '◉', color: 'from-orange-500/20 to-amber-700/20', accentColor: '#fb923c', borderColor: 'border-orange-500/40', badge: 'Onboarding' },
    { number: 4, title: 'Dashboard (Create Project)', icon: '▦', color: 'from-purple-600/20 to-pink-800/20', accentColor: '#c084fc', borderColor: 'border-purple-500/40', badge: 'Workspace' },
    { number: 5, title: 'AutoML Playground (Easy Mode / Code Mode)', icon: '◬', color: 'from-pink-500/20 to-rose-700/20', accentColor: '#f472b6', borderColor: 'border-pink-500/40', badge: 'Mode' },
    { number: 6, title: 'Upload Dataset + Select Target Column', icon: '⤴', color: 'from-yellow-600/20 to-amber-800/20', accentColor: '#fbbf24', borderColor: 'border-yellow-500/40', badge: 'Data' },
    { number: 7, title: 'Auto Analysis -> Model Generation', icon: '∑', color: 'from-cyan-600/20 to-teal-800/20', accentColor: '#67e8f9', borderColor: 'border-cyan-500/40', badge: 'AutoML' },
    { number: 8, title: 'Real Values -> Prediction + Accuracy', icon: '◎', color: 'from-emerald-600/20 to-green-800/20', accentColor: '#4ade80', borderColor: 'border-emerald-500/40', badge: 'Inference' },
    { number: 9, title: 'Payment', icon: '$', color: 'from-teal-600/20 to-emerald-800/20', accentColor: '#34d399', borderColor: 'border-teal-500/40', badge: 'Plan' },
    { number: 10, title: 'Download Model / Python Script (.py)', icon: '↓', color: 'from-sky-600/20 to-cyan-800/20', accentColor: '#38bdf8', borderColor: 'border-sky-500/40', badge: 'Export' },
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
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { const step = Number(entry.target.getAttribute('data-step')); if (step) setCurrentStep(step); } }); },
      { threshold: 0.3, rootMargin: '-10% 0px -10% 0px' }
    );
    sectionRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  const scrollToStep = (stepNumber: number) => {
    const section = document.querySelector(`section[data-step="${stepNumber}"]`);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  };

  const stepGuides: Record<number, { summary: string; actions: string[]; buttons: { name: string; behavior: string; outcome: string }[]; note: string }> = {
    1: {
      summary: 'Home is the discovery page. Users check product value first, then decide whether to read About/Help or move directly to account access.',
      actions: ['Open Home page and review top navigation and hero actions.', 'Visit About/Help when user needs feature or support context.', 'Continue to Login/Register to start authenticated flow.'],
      buttons: [
        { name: 'About', behavior: 'Opens product overview.', outcome: 'User understands capabilities before signup.' },
        { name: 'Help', behavior: 'Opens support and FAQs.', outcome: 'User can resolve doubts before proceeding.' },
        { name: 'Sign In / Get Started', behavior: 'Routes to authentication page.', outcome: 'Starts user onboarding process.' },
      ],
      note: 'Transition: Home -> Login / Register.',
    },
    2: {
      summary: 'Login/Register validates identity and creates user session. This is the secure gateway to all project and lab actions.',
      actions: ['Choose Login for existing account or Register for new account.', 'Submit credentials/details and complete verification.', 'System redirects to Welcome page on success.'],
      buttons: [
        { name: 'Login', behavior: 'Authenticates existing user.', outcome: 'Access to protected workspace is granted.' },
        { name: 'Register', behavior: 'Creates a new user account.', outcome: 'New user enters platform workflow.' },
        { name: 'Forgot Password', behavior: 'Starts reset flow.', outcome: 'User regains account access.' },
      ],
      note: 'Transition: Login/Register -> Welcome page.',
    },
    3: {
      summary: 'Welcome page confirms successful entry and prompts profile completion for cleaner project ownership and account settings.',
      actions: ['Review welcome instructions and next-step guidance.', 'Open profile settings and complete required fields.', 'Continue to Dashboard for project operations.'],
      buttons: [
        { name: 'Update Profile', behavior: 'Navigates to profile edit section.', outcome: 'Account details become complete and usable.' },
        { name: 'Continue to Dashboard', behavior: 'Moves to main workspace.', outcome: 'User can create and manage projects.' },
      ],
      note: 'Transition: Welcome -> Profile update -> Dashboard.',
    },
    4: {
      summary: 'Dashboard is the command center for projects. Users create a new project or continue an existing one from here.',
      actions: ['Inspect project cards/status and available quick actions.', 'Create a new project or open existing project.', 'Proceed into Lab Playground with selected project context.'],
      buttons: [
        { name: 'Create Project', behavior: 'Opens project creation flow.', outcome: 'New workspace is initialized.' },
        { name: 'Open Project', behavior: 'Loads project details.', outcome: 'User continues model work in lab.' },
      ],
      note: 'Transition: Dashboard -> Lab Playground.',
    },
    5: {
      summary: 'Lab Playground starts model workflow. User chooses Easy Mode for guided flow or Code Mode for advanced control.',
      actions: ['Open Lab from dashboard for selected project.', 'Choose Easy Mode or Code Mode based on expertise.', 'Enter data input stage after mode selection.'],
      buttons: [
        { name: 'Easy Mode', behavior: 'Starts guided visual workflow.', outcome: 'Fast setup for no-code users.' },
        { name: 'Code Mode', behavior: 'Starts advanced technical workflow.', outcome: 'More control over processing and training.' },
      ],
      note: 'Transition: Mode selection -> Upload dataset step.',
    },
    6: {
      summary: 'User uploads dataset and selects the target column. Target selection defines what the model should predict.',
      actions: ['Upload dataset and confirm successful parsing.', 'Select target column from available columns.', 'Start analysis after data and target are validated.'],
      buttons: [
        { name: 'Upload Dataset', behavior: 'Ingests dataset file.', outcome: 'Data becomes available for training workflow.' },
        { name: 'Select Target Column', behavior: 'Sets prediction objective.', outcome: 'Model goal is configured.' },
        { name: 'Analyse', behavior: 'Starts automated analysis pipeline.', outcome: 'Auto analysis/model generation begins.' },
      ],
      note: 'Transition: Upload + target -> Auto analysis.',
    },
    7: {
      summary: 'Auto analysis performs preprocessing, insight generation, and model candidate creation. This step prepares training-ready model options.',
      actions: ['System checks missing values and feature quality.', 'System generates model recommendations and training options.', 'User selects model option to continue.'],
      buttons: [
        { name: 'Run Analysis', behavior: 'Executes automated data analysis.', outcome: 'Insights and candidate models are produced.' },
        { name: 'Build Pipeline / Train', behavior: 'Launches selected model training.', outcome: 'Trained model and metrics are generated.' },
      ],
      note: 'Transition: Auto analysis -> Prediction testing.',
    },
    8: {
      summary: 'User enters real-world feature values and tests model output. Accuracy and metrics confirm prediction reliability.',
      actions: ['Fill prediction form with practical input values.', 'Run prediction using trained model.', 'Review predicted class/value and accuracy metrics.'],
      buttons: [
        { name: 'Run Prediction', behavior: 'Performs inference on entered values.', outcome: 'Returns prediction result.' },
        { name: 'View Accuracy', behavior: 'Shows accuracy and evaluation scores.', outcome: 'User validates model performance.' },
      ],
      note: 'Transition: Prediction verified -> Payment (if feature/export requires).',
    },
    9: {
      summary: 'Payment step unlocks subscription-based features and export permissions when required by selected plan.',
      actions: ['Open payment page and compare plan options.', 'Complete transaction with selected plan.', 'Confirm unlock status in app.'],
      buttons: [
        { name: 'Choose Plan', behavior: 'Selects pricing tier.', outcome: 'Correct entitlement is assigned.' },
        { name: 'Pay Now', behavior: 'Completes payment processing.', outcome: 'Restricted features become available.' },
      ],
      note: 'Transition: Payment success -> Download step.',
    },
    10: {
      summary: 'Final step exports model artifacts and generated Python script for external use, deployment, or reproducibility.',
      actions: ['Open export/download options.', 'Download trained model and .py script.', 'Store files with version naming for reuse.'],
      buttons: [
        { name: 'Download Model', behavior: 'Exports trained model artifact.', outcome: 'Model can be used outside the app.' },
        { name: 'Download Python Script (.py)', behavior: 'Exports runnable generated script.', outcome: 'Pipeline is reproducible in external environment.' },
      ],
      note: 'Transition: Download complete -> App user flow finished.',
    },
  };

  const renderStepContent = (stepNumber: number, accentColor: string) => {
    const guide = stepGuides[stepNumber];
    if (!guide) return null;

    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
          <h3 className="text-lg md:text-xl font-semibold text-white">How This Page Works</h3>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-white/65">{guide.summary}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.04),rgba(124,92,191,0.08))] p-6 md:p-7">
          <h4 className="text-sm uppercase tracking-[0.14em] font-semibold text-white/75">Process Flow</h4>
          <div className="mt-4 space-y-3">
            {guide.actions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3">
                <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-[11px] font-bold" style={{ background: `${accentColor}33`, color: accentColor }}>{idx + 1}</span>
                <p className="text-sm leading-relaxed text-white/70">{action}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:p-7">
          <h4 className="text-sm uppercase tracking-[0.14em] font-semibold text-white/75">Buttons and What They Do</h4>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {guide.buttons.map((btn, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">{btn.name}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-white/65"><span className="text-white/85">Action:</span> {btn.behavior}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/65"><span className="text-white/85">Result:</span> {btn.outcome}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border px-4 py-3" style={{ borderColor: `${accentColor}55`, background: `${accentColor}14` }}>
          <p className="text-sm font-medium text-white/80">{guide.note}</p>
        </div>
      </div>
    );
  };

  const topicDescriptions: Record<number, string> = {
    1: 'Home entry with About and Help guidance.',
    2: 'Authenticate using Login or Register.',
    3: 'Complete Welcome onboarding and profile update.',
    4: 'Use dashboard to create and manage projects.',
    5: 'Choose Easy Mode or Code Mode in Lab Playground.',
    6: 'Upload dataset and set prediction target column.',
    7: 'Run auto analysis and generate model options.',
    8: 'Enter real values and check prediction + accuracy.',
    9: 'Complete payment for required access.',
    10: 'Download model artifact and Python script (.py).',
  };

  return (
    <div className="relative text-[#e6eef8] overflow-x-hidden font-chillax bg-[#060812]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#060812] via-[#0d0a1f] to-[#060812]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <nav className={`fixed top-0 left-0 right-0 px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex justify-between items-center z-[100] transition-all duration-500 ${isScrolled ? 'bg-[rgba(6,8,18,0.85)] backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'}`}>
        <Logo href="/" size="md" />
        <div className="flex items-center gap-3">
          <span className="hidden sm:flex items-center gap-2 text-xs text-white/40 font-medium"><span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />Step {currentStep} of {steps.length}</span>
          <Link href="/" className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:-translate-y-0.5 border border-white/10 bg-white/5 backdrop-blur-sm text-[#c5d4ed] hover:text-white hover:border-white/20">Home</Link>
        </div>
      </nav>

      <div className="fixed top-0 left-0 right-0 h-[2px] z-[200]">
        <div className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-500" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
      </div>

      <div className="relative z-10">
        {/* Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[300px] bg-[linear-gradient(170deg,rgba(10,12,30,0.95)_0%,rgba(7,9,21,0.88)_100%)] backdrop-blur-2xl border-r border-violet-400/15 overflow-y-auto z-40">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
          <div className="p-6 pt-20">
            <div className="space-y-1">
              {steps.map((step) => {
                const isActive = currentStep === step.number;
                const isPast = currentStep > step.number;
                return (
                  <button key={step.number} onClick={() => scrollToStep(step.number)} className={`w-full text-left px-3.5 py-3 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 ${isActive ? 'bg-violet-500/15 border-violet-400/35 text-white shadow-[0_0_24px_rgba(124,92,191,0.28)]' : 'border-white/10 text-white/45 hover:text-white/80 hover:bg-white/[0.04] hover:border-white/20'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 transition-all ${isActive ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30' : isPast ? 'bg-white/10' : 'bg-white/[0.04] border border-white/10'}`}>{isPast && !isActive ? '✓' : step.icon}</div>
                    <div className="min-w-0"><div className="text-[10px] text-white/35 font-medium">Topic {step.number}</div><div className="text-xs font-medium line-clamp-2 leading-snug">{step.title}</div></div>
                    {isActive && <div className="ml-auto w-1 h-4 rounded-full bg-gradient-to-b from-violet-400 to-fuchsia-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[rgba(6,8,18,0.95)] backdrop-blur-xl border-t border-white/[0.06] z-40">
          <div className="flex overflow-x-auto gap-1.5 p-2.5 scroll-smooth hide-scrollbar">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isPast = currentStep > step.number;
              return (
                <button key={step.number} onClick={() => scrollToStep(step.number)} className={`flex-shrink-0 px-3 py-2 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[60px] ${isActive ? 'bg-white/10' : isPast ? 'bg-white/[0.04]' : 'hover:bg-white/5'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${isActive ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' : isPast ? 'bg-white/10 text-white/60' : 'bg-white/[0.04] text-white/40'}`}>{isPast && !isActive ? '✓' : step.icon}</div>
                  <span className={`text-[9px] font-medium ${isActive ? 'text-white' : 'text-white/30'}`}>{step.number}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Steps */}
        <main className="lg:ml-[300px] pb-24 lg:pb-0">
          <section className="relative border-b border-white/[0.04] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.09] via-fuchsia-500/[0.06] to-transparent pointer-events-none" />
            <div className="relative px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 pt-28 pb-14 lg:pt-32 lg:pb-16">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="max-w-5xl"
              >
                <p className="text-[11px] sm:text-xs tracking-[0.18em] uppercase font-semibold text-violet-300/80 mb-3">Tutorial Overview</p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">Ownquesta App User Flow</h1>
                <p className="mt-4 text-sm sm:text-base text-white/65 max-w-3xl leading-relaxed">This guide explains each page, how each button works, and how user actions move from Home to Login, Lab, Payment, and final downloads.</p>
              </motion.div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {steps.map((step, index) => (
                  <motion.button
                    key={`topic-card-${step.number}`}
                    onClick={() => scrollToStep(step.number)}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
                    whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : index * 0.04, ease: 'easeOut' }}
                    whileHover={shouldReduceMotion ? {} : { scale: 1.02, y: -4 }}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
                    className="group text-left rounded-3xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06)_0%,rgba(124,92,191,0.07)_45%,rgba(255,255,255,0.03)_100%)] p-5 shadow-[0_8px_25px_rgba(0,0,0,0.35)] hover:border-violet-300/35 hover:shadow-[0_14px_40px_rgba(124,92,191,0.28)] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-xl group-hover:shadow-[0_0_24px_rgba(124,92,191,0.5)] transition-shadow">{step.icon}</div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Topic {step.number}</span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-white leading-snug min-h-[48px]">{step.title}</h3>
                    <p className="mt-2 text-[13px] text-white/60 leading-relaxed min-h-[58px]">{topicDescriptions[step.number]}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-violet-200 group-hover:text-white transition-colors">
                      <span className="px-2.5 py-1 rounded-full border border-violet-300/30 bg-violet-500/10">Start Learning</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 pt-8 pb-4 border-b border-white/[0.04]">
            <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Detailed Step-by-Step Lessons</h2>
            <p className="mt-2 text-sm text-white/55">Each lesson below includes page behavior, button processing, and step-to-step transition details.</p>
          </section>

          {steps.map((step, index) => (
            <section key={step.number} data-step={step.number} ref={(el) => { sectionRefs.current[index] = el; }} className="min-h-screen w-full flex items-start border-b border-white/[0.04] relative overflow-hidden bg-[#060810]">
              <div className={`absolute inset-0 bg-gradient-to-br ${step.color} pointer-events-none`} />
              <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20 -translate-y-1/2" style={{ background: step.accentColor }} /></div>
              <div className="relative w-full px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20 py-16 lg:py-20">
                <div className="mb-6"><span className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full border ${step.borderColor} bg-white/5`}><span className="w-1.5 h-1.5 rounded-full" style={{ background: step.accentColor }} />{step.badge}</span></div>
                <div className="flex items-center gap-4 mb-5"><div className="text-6xl md:text-7xl" style={{ filter: `drop-shadow(0 0 20px ${step.accentColor}60)` }}>{step.icon}</div><div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" /><span className="text-4xl font-black text-white/5 tabular-nums tracking-tight">{String(step.number).padStart(2, '0')}</span></div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">{step.title}</h2>
                {renderStepContent(step.number, step.accentColor)}
                <div className="mt-12 pt-8 border-t border-white/[0.06] flex items-center justify-between">
                  {step.number > 1 ? (<button onClick={() => scrollToStep(step.number - 1)} className="text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-2">← Previous step</button>) : <div />}
                  {step.number < steps.length ? (
                    <button onClick={() => scrollToStep(step.number + 1)} className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-sm font-medium text-white/70 hover:text-white">
                      Next: {steps[index + 1]?.title}<span className="group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  ) : (
                    <Link href="/home" className="group flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all" style={{ background: `linear-gradient(135deg, ${step.accentColor}40, ${step.accentColor}20)`, border: `1px solid ${step.accentColor}40` }}>
                      Start Building<span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          ))}

          {/* Final CTA */}
          <section className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/10 to-pink-600/10 pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" /></div>
            <div className="relative text-center px-8 max-w-2xl mx-auto">
              <div className="text-8xl mb-8 animate-bounce">◎</div>
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">You Know<br /><span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">Ownquesta!</span></h2>
              <p className="text-lg text-white/60 mb-10 leading-relaxed">From signing in to deploying a live AI model — you've walked through the complete AutoML workflow. Now it's time to build something real.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/home" className="px-8 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 transition-all hover:scale-105 shadow-xl shadow-violet-500/20">Start Building Your Model</Link>
                <button onClick={() => scrollToStep(1)} className="px-8 py-4 rounded-2xl font-semibold text-white/60 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all">↑ Review Tutorial</button>
              </div>
            </div>
          </section>
        </main>

        <QuestaAgent />
      </div>
    </div>
  );
}