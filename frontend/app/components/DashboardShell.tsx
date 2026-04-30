"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { BookOpen, ChevronLeft, LayoutDashboard, Rocket, User, Wrench } from "lucide-react";

const SHELL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg0: #0a0a0a; --bg1: #111111; --bg2: #161616; --bg3: #1a1a1a; --bg4: #1f1f1f;
    --rim0: rgba(255,255,255,0.05); --rim1: rgba(255,255,255,0.08);
    --rim2: rgba(255,255,255,0.12); --rim3: rgba(255,255,255,0.18);
    --txt0: #e6eef8; --txt1: #c7d3e3; --txt2: #9caec2; --txt3: #6b7f97;
    --ind: #6366f1; --r-sm: 8px; --r-md: 12px;
    --font-body: 'Chillax', ui-sans-serif, system-ui, sans-serif;
  }
  @keyframes bg-drift { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(10px,-8px) scale(1.02)} 66%{transform:translate(-8px,6px) scale(0.99)} }
  .dsh-sidebar {
    height: 100vh; position: sticky; top: 0;
    display: flex; flex-direction: column;
    background: rgba(7,7,7,0.97);
    border-right: 1px solid var(--rim0);
    transition: width 0.26s cubic-bezier(0.4,0,0.2,1);
    will-change: width; transform: translateZ(0);
    z-index: 20; overflow: hidden; flex-shrink: 0;
  }
  .dsh-item {
    display: flex; align-items: center; gap: 11px;
    border-radius: var(--r-md); cursor: pointer;
    font-size: 12px; font-weight: 500; font-family: var(--font-body);
    color: var(--txt2); background: transparent; border: 1px solid transparent;
    width: 100%; text-align: left; transition: all 0.18s;
    white-space: nowrap; overflow: hidden; letter-spacing: -0.01em;
  }
  .dsh-item:hover { background: rgba(255,255,255,0.04); color: var(--txt0); border-color: var(--rim0); }
  .dsh-item.active { background: rgba(99,102,241,0.1); color: #a5b4fc; border-color: rgba(99,102,241,0.2); box-shadow: 0 0 14px rgba(99,102,241,0.06); }
  .dsh-item.danger:hover { background: rgba(248,113,113,0.06); color: #f87171; border-color: rgba(248,113,113,0.14); }
  @media(max-width:900px) { .dsh-sidebar { width: 64px !important; } .dsh-label { display: none !important; } }
`;

interface DashboardShellProps {
  children: React.ReactNode;
  activePath: string;
  userRole?: string;
  contentOverflow?: "auto" | "hidden";
}

export default function DashboardShell({ children, activePath, userRole, contentOverflow = "auto" }: DashboardShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      await fetch(`${BACKEND_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {}
    window.location.replace("/login");
  };

  const navItems = [
    { label: "Dashboard",      icon: <LayoutDashboard size={15} strokeWidth={2}/>, path: "/dashboard" },
    { label: "ML Tutorial",    icon: <BookOpen        size={15} strokeWidth={2}/>, path: "/ml-tutorial" },
    { label: "My Deployments", icon: <Rocket          size={15} strokeWidth={2}/>, path: "/my-deployments" },
    { label: "Profile",        icon: <User            size={15} strokeWidth={2}/>, path: "/profile" },
    ...(userRole === "admin" ? [{ label: "Admin", icon: <Wrench size={15} strokeWidth={2}/>, path: "/admin" }] : []),
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a", color: "#e6eef8", fontFamily: "var(--font-body)" }}>
      <style>{SHELL_STYLES}</style>

      {/* Background atmosphere */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg,#0a0a0a 0%,#080808 50%,#060606 100%)" }}/>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "radial-gradient(circle, rgba(200,200,200,0.9) 1px, transparent 1px)", backgroundSize: "32px 32px" }}/>
        <div style={{ position: "absolute", top: "8%", left: "30%", width: 700, height: 700, background: "radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 65%)", borderRadius: "50%", animation: "bg-drift 24s ease infinite" }}/>
        <div style={{ position: "absolute", bottom: "12%", right: "8%", width: 460, height: 460, background: "radial-gradient(circle,rgba(167,139,250,0.045) 0%,transparent 65%)", borderRadius: "50%", animation: "bg-drift 32s ease infinite reverse" }}/>
      </div>

      {/* Sidebar */}
      <aside className="dsh-sidebar" style={{ width: sidebarOpen ? 220 : 64 }}>
        <div style={{
          padding: sidebarOpen ? "13px 14px 10px" : "13px 0 10px",
          display: "flex", alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
          borderBottom: "1px solid var(--rim0)", marginBottom: 6, flexShrink: 0,
        }}>
          {sidebarOpen && <Logo href="/home" size="sm"/>}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.03)", border: "1px solid var(--rim1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--txt2)", flexShrink: 0, transition: "all 0.18s" }}
          >
            <ChevronLeft size={12} style={{ transform: sidebarOpen ? "none" : "rotate(180deg)", transition: "transform 0.26s" }}/>
          </button>
        </div>

        <nav style={{ padding: "0 8px", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`dsh-item${activePath === item.path ? " active" : ""}`}
              title={!sidebarOpen ? item.label : undefined}
              style={{ justifyContent: sidebarOpen ? "flex-start" : "center", padding: sidebarOpen ? "9px 12px" : "9px 0" }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span className="dsh-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div style={{ padding: "8px", borderTop: "1px solid var(--rim0)", flexShrink: 0 }}>
          <button
            onClick={handleLogout}
            className="dsh-item danger"
            title={!sidebarOpen ? "Sign out" : undefined}
            style={{ justifyContent: sidebarOpen ? "flex-start" : "center", padding: sidebarOpen ? "9px 12px" : "9px 0" }}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            {sidebarOpen && <span className="dsh-label">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Page content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, position: "relative", zIndex: 1, overflowY: contentOverflow, height: "100vh" }}>
        {children}
      </div>
    </div>
  );
}
