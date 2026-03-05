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
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all duration-300 ${
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
                className={`h-px flex-1 mx-1 mb-4 transition-all duration-300 ${
                  done && cur > stepIdx ? "bg-indigo-500" : "bg-slate-700"
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
  label, value, sub, color,
}: { label: string; value: number | string; sub?: string; color: string }) {
  return (
    <div className={`rounded-xl border p-5 ${color} backdrop-blur-sm`}>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
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
      // Backend project API not available — fall back to localStorage
      setBackendOk(false);
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [router]);

  /** Fallback: reconstruct a minimal project list from localStorage (old flow). */
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

  // Opens the type-to-confirm modal
  const handleDelete = (project: Project) => {
    setDeleteTarget(project);
  };

  // Runs after the user types "delete" and confirms
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

  // Collects new-project fields then navigates to /lab
  const handleNewProject = useCallback((name: string, goal: string, targetCol: string) => {
    setShowNewProj(false);
    localStorage.setItem("mlNewProject", JSON.stringify({ name, goal, targetCol }));
    router.push("/lab");
  }, [router]);

  const handleContinue = (project: Project) => {
    // Store full project context so the lab page can restore the session,
    // pre-fill the filename/filePath, and show the correct resume message.
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const recentProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">

      {/* ── Background ────────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40" />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {notice && (
        <div className={`fixed top-5 right-5 z-[999] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all ${
          notice.ok
            ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
            : "bg-red-950/90 border-red-500/30 text-red-300"
        } backdrop-blur-md`}>
          <span>{notice.ok ? "✓" : "✕"}</span>
          {notice.msg}
        </div>
      )}

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="relative z-10 h-14 flex items-center justify-between px-6 border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
        <Logo href="/home" size="md" />

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/home")}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            ← Home
          </button>

          {/* User menu */}
          <div id="user-menu" className="relative">
            <button
              onClick={() => setDropOpen(o => !o)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-all"
            >
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=4f46e5&color=fff`}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-indigo-500/40"
              />
              <span className="text-sm text-slate-300 hidden sm:block">{user.name}</span>
              <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-700/50 rounded-xl shadow-xl overflow-hidden z-50">
                <button onClick={() => router.push("/profile")} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-indigo-500/10 transition-all text-left border-b border-slate-700/30">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Profile
                </button>
                {user.role === "admin" && (
                  <button onClick={() => router.push("/admin")} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-indigo-500/10 transition-all text-left border-b border-slate-700/30">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Admin
                  </button>
                )}
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all text-left">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-indigo-400">{user.name?.split(" ")[0]}</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">Your ML workspace — track every project from dataset to deployment.</p>
          </div>
          <button
            onClick={() => setShowNewProj(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Projects"    value={stats.total}     sub="all time"                        color="bg-slate-900/60 border-slate-700/40" />
          <StatCard label="Active Projects"   value={stats.active}    sub="in progress"                     color="bg-indigo-950/40 border-indigo-500/20" />
          <StatCard label="Completed Models"  value={stats.completed} sub="trained or evaluated"            color="bg-emerald-950/40 border-emerald-500/20" />
        </div>

        {/* ── ML Workflow legend ────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">ML Pipeline Stages</p>
          <div className="flex flex-wrap gap-6">
            {[
              { n: 1, label: "Upload Dataset",    desc: "CSV / Excel file loaded into the lab" },
              { n: 2, label: "EDA & Analysis",    desc: "AI profiles data and suggests models" },
              { n: 3, label: "Model Training",    desc: "Full ML pipeline generated & executed" },
              { n: 4, label: "Evaluation",        desc: "Predictions tested with real inputs" },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3 min-w-[180px]">
                <div className="w-7 h-7 shrink-0 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300 mt-0.5">
                  {s.n}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{s.label}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Projects ──────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">My Projects</h2>
            {!backendOk && (
              <span className="text-xs text-amber-400 border border-amber-500/20 bg-amber-500/10 px-2 py-1 rounded-lg">
                ⚠ Showing local data — backend unavailable
              </span>
            )}
          </div>

          {recentProjects.length === 0 ? (
            /* ── Empty state ── */
            <div className="rounded-2xl border-2 border-dashed border-slate-700/60 bg-slate-900/30 flex flex-col items-center justify-center py-20 gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">
                🧪
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-200">No projects yet</p>
                <p className="text-sm text-slate-500 mt-1 max-w-xs">
                  Start a new ML project in the Lab Playground — upload a dataset and let the AI agent build a complete pipeline for you.
                </p>
              </div>
              <button
                onClick={() => setShowNewProj(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recentProjects.map(project => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  deleting={deleting === project._id}
                  onContinue={() => handleContinue(project)}
                  onDelete={() => handleDelete(project)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Recent activity timeline ───────────────────────────────── */}
        {recentProjects.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">Recent Activity</h2>
            <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 backdrop-blur-sm divide-y divide-slate-700/20">
              {recentProjects.slice(0, 6).map((project, i) => {
                const isLast = i === Math.min(recentProjects.length, 6) - 1;
                return (
                  <div key={project._id} className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-all ${isLast ? "rounded-b-xl" : ""} ${i === 0 ? "rounded-t-xl" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 border ${stageBadgeColor(project.stage)}`}>
                      {project.stage === "evaluated" || project.stage === "completed" ? "✓" :
                       project.stage === "trained"          ? "🤖" :
                       project.stage === "eda_completed"    ? "🔍" :
                       project.stage === "dataset_uploaded" ? "📂" : "○"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{project.name}</p>
                      <p className="text-xs text-slate-500">
                        {stageLabel(project.stage)}
                        {project.dataset?.filename && ` · ${project.dataset.filename}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">
                        {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                      {project.selectedModel && (
                        <p className="text-[10px] text-indigo-400 font-mono">{project.selectedModel}</p>
                      )}
                    </div>
                  </div>
                );
              })}
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
  project, deleting, onContinue, onDelete,
}: {
  project:    Project;
  deleting:   boolean;
  onContinue: () => void;
  onDelete:   () => void;
}) {
  const isFinished = ["trained", "evaluated", "completed"].includes(project.stage);
  const pct = Math.round((stageIdx(project.stage) / (STAGE_ORDER.length - 1)) * 100);

  return (
    <div className="rounded-xl border border-slate-700/30 bg-slate-900/50 backdrop-blur-sm p-5 hover:border-indigo-500/30 hover:bg-slate-900/70 transition-all group">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
            {project.name}
          </h3>
          {project.dataset?.filename && (
            <p className="text-xs text-slate-500 font-mono truncate mt-0.5">{project.dataset.filename}</p>
          )}
        </div>

        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${stageBadgeColor(project.stage)}`}>
          {stageLabel(project.stage)}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
        {project.problemType && (
          <span className="capitalize">{project.problemType}</span>
        )}
        {project.targetColumn && (
          <span className="font-mono text-slate-600 truncate max-w-[120px]">target: {project.targetColumn}</span>
        )}
        {project.selectedModel && (
          <span className="font-mono text-indigo-400 truncate max-w-[120px]">{project.selectedModel}</span>
        )}
        <span className="ml-auto shrink-0">
          {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-1">
        <div className="flex justify-between text-[10px] text-slate-600 mb-1">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isFinished ? "bg-emerald-500" : "bg-indigo-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stage tracker */}
      <StageTracker stage={project.stage} />

      {/* Action row */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-700/30">
        <button
          onClick={onContinue}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-all"
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
          className="px-3 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40"
          title="Delete project"
        >
          {deleting ? (
            <div className="w-3.5 h-3.5 border border-slate-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 w-full max-w-sm shadow-2xl">

        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-xl shrink-0">
            🗑️
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">Delete Project</h3>
            <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          You are about to permanently delete{" "}
          <span className="font-semibold text-white">"{project.name}"</span> and all its data.
        </p>

        {/* Type-to-confirm */}
        <p className="text-xs text-slate-400 mb-2">
          Type{" "}
          <code className="font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
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
          className="w-full bg-slate-800/80 border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/20 mb-5 transition-all font-mono"
        />

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm text-slate-400 border border-slate-600/50 rounded-xl hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete}
            className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              canDelete
                ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
            🧪
          </div>
          <div>
            <h3 className="font-bold text-white text-base">New Project</h3>
            <p className="text-xs text-slate-500 mt-0.5">Set up your project before uploading data</p>
          </div>
        </div>

        {/* Project Name — required */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Project Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Customer Churn Prediction"
            autoFocus
            onKeyDown={e => { if (e.key === "Escape") onCancel(); }}
            className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        {/* Prediction Goal — required */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Prediction Goal <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-col gap-1.5">
            {GOAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setGoal(opt.value)}
                className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all flex items-start gap-3 ${
                  goal === opt.value
                    ? "bg-indigo-600/20 border-indigo-500/60 text-white"
                    : "bg-slate-800/50 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                }`}
              >
                <span className="text-base shrink-0 mt-0.5">{opt.icon}</span>
                <span>
                  <span className="font-semibold block">{opt.label}</span>
                  <span className="text-xs text-slate-500 mt-0.5 block">{opt.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Target Column — optional */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Target Column{" "}
            <span className="text-slate-500 font-normal">(optional — can be set later)</span>
          </label>
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="e.g. Churn, Price, label — leave blank to auto-detect"
            className="w-full bg-slate-800/80 border border-slate-600/50 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono"
          />
        </div>

        {/* Validation hint */}
        {!canStart && (
          <p className="text-xs text-amber-400/80 mb-4 flex items-center gap-1.5">
            <span>⚠</span>
            {!name.trim() && !goal
              ? "Project Name and Prediction Goal are required."
              : !name.trim()
              ? "Project Name is required."
              : "Please select a Prediction Goal."}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm text-slate-400 border border-slate-600/50 rounded-xl hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onStart(name.trim(), goal, target.trim())}
            disabled={!canStart}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              canStart
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
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
