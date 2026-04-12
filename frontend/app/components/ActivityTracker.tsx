"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackUserActivity } from "@/services/api";

const IGNORED_PATHS = new Set(["/login", "/register"]);

const formatPageLabel = (pathname: string) => {
  if (!pathname || pathname === "/") return "home";

  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/[-_]/g, " "))
    .join(" / ");
};

export default function ActivityTracker() {
  const pathname = usePathname();
  const lastTrackedRef = useRef<string | null>(null);
  const pathStartRef = useRef<{ path: string; startedAt: number } | null>(null);

  const sendPageExitActivity = async (path: string, startedAt: number) => {
    const endedAt = Date.now();
    const durationMs = Math.max(endedAt - startedAt, 0);

    if (!path || IGNORED_PATHS.has(path) || durationMs < 1000) {
      return;
    }

    await trackUserActivity(
      "page_exit",
      `Left ${formatPageLabel(path)} page after ${Math.round(durationMs / 1000)}s`,
      {
        path,
        page: formatPageLabel(path),
        source: "web_app",
        durationMs,
        durationSeconds: Number((durationMs / 1000).toFixed(1)),
        startedAt: new Date(startedAt).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
      }
    );
  };

  useEffect(() => {
    if (!pathname || IGNORED_PATHS.has(pathname)) {
      return;
    }

    const previousPath = pathStartRef.current;
    if (previousPath && previousPath.path !== pathname) {
      sendPageExitActivity(previousPath.path, previousPath.startedAt).catch(() => {
        // Ignore guests or temporary backend issues.
      });
    }

    pathStartRef.current = { path: pathname, startedAt: Date.now() };

    const dedupeKey = `ownq-page-view:${pathname}`;
    const lastTrackedAt = Number(sessionStorage.getItem(dedupeKey) || 0);

    if (lastTrackedRef.current === dedupeKey || Date.now() - lastTrackedAt < 10000) {
      return;
    }

    lastTrackedRef.current = dedupeKey;
    sessionStorage.setItem(dedupeKey, String(Date.now()));

    trackUserActivity(
      "page_view",
      `Visited ${formatPageLabel(pathname)} page`,
      {
        path: pathname,
        page: formatPageLabel(pathname),
        source: "web_app",
        title: typeof document !== "undefined" ? document.title : undefined,
      }
    ).catch(() => {
      // Ignore guests or temporary backend issues.
    });
  }, [pathname]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentPath = pathStartRef.current;
      if (!currentPath) {
        return;
      }

      const endedAt = Date.now();
      const durationMs = Math.max(endedAt - currentPath.startedAt, 0);
      if (durationMs < 1000) {
        return;
      }

      const payload = {
        action: "page_exit",
        description: `Left ${formatPageLabel(currentPath.path)} page after ${Math.round(durationMs / 1000)}s`,
        metadata: {
          path: currentPath.path,
          page: formatPageLabel(currentPath.path),
          source: "web_app",
          durationMs,
          durationSeconds: Number((durationMs / 1000).toFixed(1)),
          startedAt: new Date(currentPath.startedAt).toISOString(),
          endedAt: new Date(endedAt).toISOString(),
        },
      };

      fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/user/activity`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          keepalive: true,
          body: JSON.stringify(payload),
        }
      ).catch(() => {
        // no-op for unload failures
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return null;
}
