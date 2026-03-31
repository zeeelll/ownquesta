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

  useEffect(() => {
    if (!pathname || IGNORED_PATHS.has(pathname)) {
      return;
    }

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

  return null;
}
