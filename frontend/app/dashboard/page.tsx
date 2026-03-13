"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import Logo from "../components/Logo";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Dataset {
  filename: string;
  filePath?: string;
  rowCount?: number;
  fileType?: string;
  sizeKb?: number;
}

type Stage =
  | "initialized"
  | "dataset_uploaded"
  | "eda_completed"
  | "model_selected"
  | "training"
  | "trained"
  | "evaluated"
  | "completed";

interface Project {
  _id: string;
  sessionId: string;
  name: string;
  dataset?: Dataset;
  stage: Stage;
  problemType?: string;
  targetColumn?: string;
  selectedModel?: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  completed: number;
}

// ── Stage configuration ───────────────────────────────────────────────────────

const PIPELINE_STEPS: { key: Stage; label: string; short: string }[] = [
  { key: "dataset_uploaded", label: "Dataset Uploaded",  short: "Upload"  },
  { key: "eda_completed",    label: "EDA Completed",     short: "EDA"     },
  { key: "trained",          label: "Model Trained",     short: "Train"   },
  { key: "evaluated",        label: "Evaluated",         short: "Evaluate"},
];

const STAGE_ORDER: Stage[] = [
  "initialized",
  "dataset_uploaded",
  "eda_completed",
  "model_selected",
  "training",
  "trained",
  "evaluated",
  "completed",
];

function stageIdx(s: Stage) {
  return STAGE_ORDER.indexOf(s);
}

function stageLabel(s: Stage): string {
  const map: Record<Stage, string> = {
    initialized:      "Initialized",
    dataset_uploaded: "Dataset Uploaded",
    eda_completed:    "EDA Completed",
    model_selected:   "Model Selected",
    training:         "Training…",
    trained:          "Model Trained",
    evaluated:        "Evaluated",
    completed:        "Completed",
  };
  return map[s] ?? s;
}

function stageBadgeColor(s: Stage): string {
  if (["trained", "evaluated", "completed"].includes(s)) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
  if (["eda_completed", "model_selected", "training"].includes(s)) return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
  if (s === "dataset_uploaded") return "bg-sky-500/20 text-sky-300 border-sky-500/30";
  return "bg-slate-600/20 text-slate-400 border-slate-600/30";
}

// ── Global styles injected once ───────────────────────────────────────────────
const DASH_STYLES = `
  @keyframes dash-fadein  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes dash-slideup { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes dash-shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes dash-pulse   { 0%,100%{opacity:1} 50%{opacity:0.55} }
  @keyframes dash-spin    { to { transform:rotate(360deg); } }
  @keyframes dash-countup { from{opacity:0;transform:scale(0.7);} to{opacity:1;transform:scale(1);} }
  @keyframes toast-in     { from{opacity:0;transform:translateX(20px);} to{opacity:1;transform:translateX(0);} }
  @keyframes bar-fill     { from{width:0} }

  .dash-card { animation: dash-fadein 0.35s ease both; }
  .dash-stat  { animation: dash-countup 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }

  .skel {
    background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%);
    background-size: 400px 100%;
    animation: dash-shimmer 1.4s ease infinite;
  }

  .proj-card {
    transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .proj-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.3);
  }

  .prog-bar { animation: bar-fill 0.8s cubic-bezier(0.4,0,0.2,1) both; }

  .action-btn {
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  .action-btn:hover { transform: translateY(-1px); }
  .action-btn:active { transform: scale(0.97); }

  .ghost-btn {
    transition: background 0.15s, border-color 0.15s, color 0.15s;
  }
  .ghost-btn:hover { background: rgba(255,255,255,0.08) !important; }

  .nav-btn {
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }

  .stage-dot {
    transition: background 0.3s, border-color 0.3s, box-shadow 0.3s;
  }

  .activity-row {
    transition: background 0.15s;
  }
  .activity-row:hover { background: rgba(255,255,255,0.025); }

  .new-proj-btn {
    transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  .new-proj-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(99,102,241,0.35);
  }
  .new-proj-btn:active { transform: scale(0.98); }

  .goal-option { transition: background 0.15s, border-color 0.15s, color 0.15s; }
  .goal-option:hover { border-color: rgba(99,102,241,0.45) !important; }

  .del-btn { transition: color 0.15s, background 0.15s; }
`;

// ── Sub-components ────────────────────────────────────────────────────────────

function StageTracker({ stage }: { stage: Stage }) {
  const cur = stageIdx(stage);
  return (
    <div className="flex items-start gap-0 mt-3">
      {PIPELINE_STEPS.map((step, i) => {
        const stepIdx  = stageIdx(step.key);
        const done     = cur >= stepIdx;
        const isLast   = i === PIPELINE_STEPS.length - 1;
        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`stage-dot w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                  done
                    ? "bg-indigo-500 border-indigo-400 text-white shadow-sm shadow-indigo-500/40"
                    : "bg-slate-800 border-slate-600 text-slate-500"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span className={`text-[9px] mt-1 whitespace-nowrap font-medium ${done ? "text-indigo-400" : "text-slate-600"}`}>
                {step.short}
              </span>
            </div>
            {!isLast && (
              <div
                className={`h-px flex-1 mx-1 mb-4 transition-all duration-500 ${
                  done && cur > stepIdx ? "bg-gradient-to-r from-indigo-500 to-indigo-400" : "bg-slate-700/60"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  label, value, sub, color, icon, delay = 0,
}: { label: string; value: number | string; sub?: string; color: string; icon: string; delay?: number }) {
  return (
    <div
      className={`dash-stat rounded-2xl border p-5 relative overflow-hidden ${color} backdrop-blur-sm`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle glow orb */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-30 pointer-events-none"
        style={{ background: 'currentColor' }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
          <span className="text-lg opacity-70">{icon}</span>
        </div>
        <p className="text-4xl font-black text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1.5 font-medium">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]           = useState<{ name?: string; email?: string; avatar?: string; role?: string } | null>(null);
  const [projects, setProjects]   = useState<Project[]>([]);
  const [stats, setStats]         = useState<Stats>({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading]     = useState(true);
  const [backendOk, setBackendOk] = useState(true);
  const [notice, setNotice]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [dropOpen, setDropOpen]     = useState(false);
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [showNewProj, setShowNewProj]   = useState(false);

  const toast = useCallback((msg: string, ok = true) => {
    setNotice({ msg, ok });
    setTimeout(() => setNotice(null), 3000);
  }, []);

  // ── Load user + projects ─────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const me = await api("/api/auth/me");
      setUser(me.user);
    } catch {
      router.push("/login");
      return;
    }

    try {
      const [projRes, statsRes] = await Promise.all([
        api("/api/user/projects"),
        api("/api/user/projects/stats"),
      ]);
      setProjects(projRes.projects ?? []);
      setStats(statsRes);
      setBackendOk(true);
    } catch {
      setBackendOk(false);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [router]);

  function loadFromLocalStorage() {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("userProjects");
      if (!raw) return;
      const saved = JSON.parse(raw) as Array<{
        id: string; name: string; dataset: string; status: string; createdDate: string;
      }>;
      const mapped: Project[] = saved.map((p) => ({
        _id:       p.id,
        sessionId: p.id,
        name:      p.name,
        dataset:   { filename: p.dataset },
        stage:     p.status === "validated" ? "eda_completed" : "initialized",
        createdAt: p.createdDate,
        updatedAt: p.createdDate,
      }));
      setProjects(mapped);
      setStats({ total: mapped.length, active: mapped.filter(p => p.stage === "initialized").length, completed: mapped.filter(p => p.stage === "eda_completed").length });
    } catch { /* ignore parse errors */ }
  }

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("#user-menu")) setDropOpen(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
    try {
      await fetch(`${BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch { /* ignore */ }
    localStorage.removeItem("userAvatar");
    window.location.href = "/";
  };

  const handleDelete = (project: Project) => {
    setDeleteTarget(project);
  };

  const executeDelete = useCallback(async () => {
    const project = deleteTarget;
    if (!project) return;
    setDeleteTarget(null);
    setDeleting(project._id);
    try {
      if (backendOk) {
        await api(`/api/user/projects/${project._id}`, { method: "DELETE" });
      } else {
        const raw = localStorage.getItem("userProjects");
        if (raw) {
          const saved = JSON.parse(raw).filter((p: { id: string }) => p.id !== project._id);
          localStorage.setItem("userProjects", JSON.stringify(saved));
        }
      }
      setProjects(prev => prev.filter(p => p._id !== project._id));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
      toast("Project deleted");
    } catch {
      toast("Failed to delete project", false);
    } finally {
      setDeleting(null);
    }
  }, [deleteTarget, backendOk, toast]);

  const handleNewProject = useCallback((name: string, goal: string, targetCol: string) => {
    setShowNewProj(false);
    localStorage.setItem("mlNewProject", JSON.stringify({ name, goal, targetCol }));
    router.push("/lab");
  }, [router]);

  const handleContinue = (project: Project) => {
    const ctx = {
      sessionId:    project.sessionId,
      name:         project.name,
      stage:        project.stage,
      filename:     project.dataset?.filename,
      filePath:     project.dataset?.filePath,
      targetColumn: project.targetColumn,
      problemType:  project.problemType,
      selectedModel: project.selectedModel,
    };
    localStorage.setItem("mlContinueProject", JSON.stringify(ctx));
    router.push("/lab");
  };

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <style>{DASH_STYLES}</style>
        <div className="h-14 border-b border-white/5 bg-slate-950/60 flex items-center justify-between px-6">
          <div className="skel h-7 w-32 rounded-lg" />
          <div className="flex items-center gap-3">
            <div className="skel h-7 w-20 rounded-lg" />
            <div className="skel w-8 h-8 rounded-full" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="skel h-8 w-64 rounded-lg" />
              <div className="skel h-4 w-80 rounded" />
            </div>
            <div className="skel h-10 w-32 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0,1,2].map(i => (
              <div key={i} className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 space-y-3">
                <div className="skel h-4 w-28 rounded" />
                <div className="skel h-10 w-12 rounded-lg" />
                <div className="skel h-3 w-20 rounded" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-slate-700/30 bg-slate-900/40 p-5 space-y-4">
            <div className="skel h-3 w-36 rounded" />
            <div className="flex flex-wrap gap-6">
              {[0,1,2,3].map(i => (
                <div key={i} className="flex items-start gap-3 min-w-[180px]">
                  <div className="skel w-7 h-7 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <div className="skel h-4 w-28 rounded" />
                    <div className="skel h-3 w-40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="skel h-6 w-28 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0,1,2,3].map(i => (
                <div key={i} className="rounded-2xl border border-white/5 bg-slate-900/50 p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="skel h-5 w-36 rounded" />
                      <div className="skel h-3 w-24 rounded" />
                    </div>
                    <div className="skel h-6 w-20 rounded-full" />
                  </div>
                  <div className="skel h-1.5 w-full rounded-full" />
                  <div className="flex gap-2">
                    <div className="skel h-9 flex-1 rounded-xl" />
                    <div className="skel h-9 w-9 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recentProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
      <style>{DASH_STYLES}</style>

      {/* ── Background ────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-600/6 rounded-full blur-[60px]" />
        <div className="absolute top-3/4 left-1/4 w-48 h-48 bg-sky-600/5 rounded-full blur-[50px]" />
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {notice && (
        <div
          className={`fixed top-5 right-5 z-[999] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold backdrop-blur-xl ${
            notice.ok
              ? "bg-emerald-950/95 border-emerald-500/40 text-emerald-300 shadow-emerald-900/30"
              : "bg-red-950/95 border-red-500/40 text-red-300 shadow-red-900/30"
          }`}
          style={{ animation: "toast-in 0.25s ease" }}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${notice.ok ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
            {notice.ok ? "✓" : "✕"}
          </span>
          {notice.msg}
        </div>
      )}

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="relative z-10 h-14 flex items-center justify-between px-6 border-b border-white/[0.06] bg-slate-950/70 backdrop-blur-xl">
        <Logo href="/home" size="md" />

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/home")}
            className="nav-btn px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.14]"
          >
            ← Home
          </button>

          {/* User menu */}
          <div id="user-menu" className="relative">
            <button
              onClick={() => setDropOpen(o => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=4f46e5&color=fff`}
                alt="avatar"
                className="w-7 h-7 rounded-full border border-indigo-500/50 shadow-sm shadow-indigo-500/20"
              />
              <span className="text-sm text-slate-300 hidden sm:block font-medium">{user.name}</span>
              <svg
                className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 bg-slate-900/95 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 backdrop-blur-xl"
                style={{ animation: "dash-fadein 0.18s ease" }}
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-slate-700/40">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <button onClick={() => router.push("/profile")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-white transition-all text-left">
                  <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile
                </button>
                {user.role === "admin" && (
                  <button onClick={() => router.push("/admin")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-indigo-500/10 hover:text-white transition-all text-left">
                    <svg className="w-4 h-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Admin
                  </button>
                )}
                <div className="border-t border-slate-700/40 mt-1">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Page header */}
        <div className="flex items-center justify-between" style={{ animation: "dash-slideup 0.4s ease both" }}>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                {user.name?.split(" ")[0]}
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Your ML workspace — track every project from dataset to deployment.</p>
          </div>
          <button
            onClick={() => setShowNewProj(true)}
            className="new-proj-btn flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Projects"   value={stats.total}     sub="all time"             icon="📁" delay={0}   color="bg-slate-900/70 border-slate-700/40" />
          <StatCard label="Active Projects"  value={stats.active}    sub="in progress"          icon="⚡" delay={80}  color="bg-indigo-950/50 border-indigo-500/25" />
          <StatCard label="Trained Models"   value={stats.completed} sub="trained or evaluated" icon="🤖" delay={160} color="bg-emerald-950/50 border-emerald-500/25" />
        </div>

        {/* ── ML Workflow legend ────────────────────────────────────────── */}
        <div
          className="rounded-2xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm p-6 dash-card"
          style={{ animationDelay: "100ms" }}
        >
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-5">ML Pipeline Stages</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { n: 1, label: "Upload Dataset",  desc: "CSV / Excel file loaded",         icon: "📂", color: "bg-sky-500/10 border-sky-500/20 text-sky-300" },
              { n: 2, label: "EDA & Analysis",  desc: "AI profiles data & models",        icon: "🔍", color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" },
              { n: 3, label: "Model Training",  desc: "Pipeline generated & executed",    icon: "🏗️", color: "bg-purple-500/10 border-purple-500/20 text-purple-300" },
              { n: 4, label: "Evaluation",      desc: "Predictions tested with inputs",   icon: "✅", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" },
            ].map((s, i) => (
              <div
                key={s.n}
                className={`flex items-start gap-3 p-3.5 rounded-xl border ${s.color}`}
                style={{ animation: "dash-fadein 0.35s ease both", animationDelay: `${i * 60 + 200}ms` }}
              >
                <span className="text-xl shrink-0 mt-0.5">{s.icon}</span>
                <div>
                  <p className="text-xs font-bold text-slate-200 mb-0.5">{s.label}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Projects ──────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-white tracking-tight">My Projects</h2>
              {recentProjects.length > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-400">
                  {recentProjects.length}
                </span>
              )}
            </div>
            {!backendOk && (
              <span className="text-xs text-amber-400 border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 rounded-xl font-medium">
                ⚠ Local data — backend offline
              </span>
            )}
          </div>

          {recentProjects.length === 0 ? (
            /* ── Empty state ── */
            <div className="rounded-2xl border-2 border-dashed border-slate-700/50 bg-slate-900/25 flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-4xl shadow-xl shadow-indigo-500/5">
                🧪
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-200">No projects yet</p>
                <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                  Start a new ML project in the Lab Playground — upload a dataset and let the AI agent build a complete pipeline for you.
                </p>
              </div>
              <button
                onClick={() => setShowNewProj(true)}
                className="new-proj-btn px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/25"
              >
                + New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentProjects.map((project, i) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  deleting={deleting === project._id}
                  onContinue={() => handleContinue(project)}
                  onDelete={() => handleDelete(project)}
                  animDelay={i * 60}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Recent activity timeline ───────────────────────────────── */}
        {recentProjects.length > 0 && (
          <section style={{ animation: "dash-fadein 0.5s ease both", animationDelay: "300ms" }}>
            <h2 className="text-lg font-black text-white tracking-tight mb-5">Recent Activity</h2>
            <div className="rounded-2xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
              {recentProjects.slice(0, 6).map((project, i) => (
                <div
                  key={project._id}
                  className={`activity-row flex items-center gap-4 px-5 py-4 cursor-pointer ${
                    i < Math.min(recentProjects.length, 6) - 1 ? "border-b border-slate-700/20" : ""
                  }`}
                  onClick={() => handleContinue(project)}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 border font-bold ${stageBadgeColor(project.stage)}`}>
                    {project.stage === "evaluated" || project.stage === "completed" ? "✓" :
                     project.stage === "trained"          ? "🤖" :
                     project.stage === "eda_completed"    ? "🔍" :
                     project.stage === "dataset_uploaded" ? "📂" : "○"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{project.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {stageLabel(project.stage)}
                      {project.dataset?.filename && (
                        <span className="text-slate-600"> · {project.dataset.filename}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500">
                      {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    {project.selectedModel && (
                      <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{project.selectedModel}</p>
                    )}
                  </div>
                  <svg className="w-3.5 h-3.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteConfirmModal
          project={deleteTarget}
          onConfirm={executeDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {showNewProj && (
        <NewProjectModal
          onStart={handleNewProject}
          onCancel={() => setShowNewProj(false)}
        />
      )}
    </div>
  );
}

// ── Project Card ──────────────────────────────────────────────────────────────

function ProjectCard({
  project, deleting, onContinue, onDelete, animDelay = 0,
}: {
  project:    Project;
  deleting:   boolean;
  onContinue: () => void;
  onDelete:   () => void;
  animDelay?: number;
}) {
  const isFinished = ["trained", "evaluated", "completed"].includes(project.stage);
  const pct = Math.round((stageIdx(project.stage) / (STAGE_ORDER.length - 1)) * 100);

  return (
    <div
      className="proj-card dash-card rounded-2xl border border-slate-700/30 bg-slate-900/50 backdrop-blur-sm p-5 hover:border-indigo-500/35 hover:bg-slate-900/75 group"
      style={{ animationDelay: `${animDelay}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex items-start gap-3">
          {/* Project icon */}
          <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-base border ${
            isFinished
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
              : "bg-indigo-500/10 border-indigo-500/25 text-indigo-300"
          }`}>
            {isFinished ? "✓" : "🧪"}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm truncate group-hover:text-indigo-300 transition-colors leading-tight">
              {project.name}
            </h3>
            {project.dataset?.filename && (
              <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{project.dataset.filename}</p>
            )}
          </div>
        </div>

        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 whitespace-nowrap ${stageBadgeColor(project.stage)}`}>
          {stageLabel(project.stage)}
        </span>
      </div>

      {/* Meta chips */}
      <div className="flex items-center flex-wrap gap-1.5 text-[11px] mb-4 min-h-[22px]">
        {project.problemType && (
          <span className="capitalize px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/40 text-slate-400 font-medium">
            {project.problemType}
          </span>
        )}
        {project.targetColumn && (
          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/40 text-slate-500 font-mono truncate max-w-[130px]">
            target: {project.targetColumn}
          </span>
        )}
        {project.selectedModel && (
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono truncate max-w-[130px]">
            {project.selectedModel}
          </span>
        )}
        <span className="ml-auto text-slate-600 font-medium shrink-0">
          {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-1">
        <div className="flex justify-between text-[10px] text-slate-600 mb-1.5 font-medium">
          <span>Progress</span>
          <span className={pct === 100 ? "text-emerald-500" : "text-indigo-400"}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
          <div
            className={`prog-bar h-full rounded-full ${isFinished ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-indigo-500 to-purple-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stage tracker */}
      <StageTracker stage={project.stage} />

      {/* Action row */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/25">
        <button
          onClick={onContinue}
          className="action-btn flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600/85 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/15"
        >
          {isFinished ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              View in Lab
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Continue
            </>
          )}
        </button>

        <button
          onClick={onDelete}
          disabled={deleting}
          className="del-btn w-10 h-10 flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 disabled:opacity-40"
          title="Delete project"
        >
          {deleting ? (
            <div className="w-3.5 h-3.5 border border-slate-500 border-t-transparent rounded-full" style={{ animation: "dash-spin 0.7s linear infinite" }} />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────

function DeleteConfirmModal({
  project,
  onConfirm,
  onCancel,
}: {
  project: Project;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [input, setInput] = useState("");
  const canDelete = input === "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      style={{ animation: "dash-fadein 0.2s ease" }}>
      <div className="bg-slate-900/95 border border-slate-700/60 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/60 backdrop-blur-xl"
        style={{ animation: "dash-slideup 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-xl shrink-0">
            🗑️
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Delete Project</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          You are about to permanently delete{" "}
          <span className="font-bold text-white">"{project.name}"</span> and all its data.
        </p>

        <p className="text-xs text-slate-400 mb-2 font-medium">
          Type{" "}
          <code className="font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">
            delete
          </code>{" "}
          to confirm:
        </p>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='Type "delete" here'
          autoFocus
          onKeyDown={e => {
            if (e.key === "Enter" && canDelete) onConfirm();
            if (e.key === "Escape") onCancel();
          }}
          className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 mb-5 transition-all font-mono"
        />

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="ghost-btn flex-1 px-4 py-2.5 text-sm text-slate-400 border border-slate-600/50 rounded-xl hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete}
            className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
              canDelete
                ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 action-btn"
                : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/40"
            }`}
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New Project Modal ─────────────────────────────────────────────────────────

const GOAL_OPTIONS: { value: string; label: string; desc: string; icon: string }[] = [
  { value: "auto",           icon: "🤖", label: "Auto-detect",           desc: "Let the AI figure out the best approach" },
  { value: "classification", icon: "🏷️", label: "Predict a category",    desc: "e.g. spam detection, churn, diagnosis" },
  { value: "regression",     icon: "📈", label: "Predict a number",       desc: "e.g. house price, sales forecast" },
  { value: "clustering",     icon: "🔵", label: "Group similar items",    desc: "e.g. customer segments, topic discovery" },
  { value: "anomaly",        icon: "⚠️", label: "Detect anomalies",       desc: "e.g. fraud detection, equipment failure" },
];

function NewProjectModal({
  onStart,
  onCancel,
}: {
  onStart: (name: string, goal: string, targetCol: string) => void;
  onCancel: () => void;
}) {
  const [name,   setName]   = useState("");
  const [goal,   setGoal]   = useState("");
  const [target, setTarget] = useState("");

  const canStart = name.trim().length > 0 && goal !== "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      style={{ animation: "dash-fadein 0.2s ease" }}>
      <div className="bg-slate-900/95 border border-slate-700/60 rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/60 backdrop-blur-xl max-h-[90vh] overflow-y-auto"
        style={{ animation: "dash-slideup 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}>

        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
              🧪
            </div>
            <div>
              <h3 className="font-black text-white text-base tracking-tight">New Project</h3>
              <p className="text-xs text-slate-500 mt-0.5">Set up before uploading data</p>
            </div>
          </div>
          <button onClick={onCancel} className="ghost-btn w-8 h-8 flex items-center justify-center rounded-xl border border-slate-700/40 text-slate-500 hover:text-white text-lg">
            ×
          </button>
        </div>

        {/* Project Name */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
            Project Name <span className="text-red-400 normal-case tracking-normal">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Customer Churn Prediction"
            autoFocus
            onKeyDown={e => { if (e.key === "Escape") onCancel(); }}
            className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Prediction Goal */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
            Prediction Goal <span className="text-red-400 normal-case tracking-normal">*</span>
          </label>
          <div className="flex flex-col gap-1.5">
            {GOAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setGoal(opt.value)}
                className={`goal-option text-left px-3.5 py-2.5 rounded-xl border text-sm flex items-start gap-3 ${
                  goal === opt.value
                    ? "bg-indigo-600/20 border-indigo-500/60 text-white shadow-sm shadow-indigo-500/10"
                    : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:text-slate-300"
                }`}
              >
                <span className="text-base shrink-0 mt-0.5">{opt.icon}</span>
                <span>
                  <span className="font-semibold block">{opt.label}</span>
                  <span className="text-xs text-slate-500 mt-0.5 block">{opt.desc}</span>
                </span>
                {goal === opt.value && (
                  <span className="ml-auto shrink-0 w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[9px] text-white font-bold mt-1">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Target Column */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
            Target Column{" "}
            <span className="text-slate-500 font-normal normal-case tracking-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="e.g. Churn, Price, label — leave blank to auto-detect"
            className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
          />
        </div>

        {/* Validation hint */}
        {!canStart && (name.trim() || goal) && (
          <p className="text-xs text-amber-400/90 mb-4 flex items-center gap-1.5 font-medium">
            <span>⚠</span>
            {!name.trim() && !goal
              ? "Project Name and Prediction Goal are required."
              : !name.trim()
              ? "Project Name is required."
              : "Please select a Prediction Goal."}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="ghost-btn px-4 py-2.5 text-sm text-slate-400 border border-slate-600/50 rounded-xl hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={() => onStart(name.trim(), goal, target.trim())}
            disabled={!canStart}
            className={`action-btn flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all ${
              canStart
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25"
                : "bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/40"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Start Project
          </button>
        </div>
      </div>
    </div>
  );
}