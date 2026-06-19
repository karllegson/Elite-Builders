"use client";

import { useSyncExternalStore } from "react";
import { business } from "@/lib/site/config";

/** Canonical production origin (www). Override with NEXT_PUBLIC_SITE_URL. */
const PRODUCTION_SITE_URL = "https://www.elitebuildersco.com";

function getDefaultSiteUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  return business.domain.replace(/\/$/, "");
}

export function getConfiguredSiteUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return configured ? configured.replace(/\/$/, "") : null;
}

function subscribe(): () => void {
  return () => {};
}

/** Site origin for admin permalink previews (sync; prefers env, then window on client). */
export function getAdminSiteUrl(): string {
  const configured = getConfiguredSiteUrl();
  if (configured) {
    return configured;
  }

  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "production") {
      return PRODUCTION_SITE_URL;
    }

    return window.location.origin;
  }

  return getDefaultSiteUrl();
}

/**
 * Client-safe site URL for admin permalink previews.
 * Uses the server snapshot during hydration, then the browser origin after mount.
 */
export function useAdminSiteUrl(): string {
  const configured = getConfiguredSiteUrl();
  const browserOrigin = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => getDefaultSiteUrl(),
  );

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  return browserOrigin;
}
