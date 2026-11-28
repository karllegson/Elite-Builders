"use client";

import { useEffect, useState } from "react";
import { SiteAdminBar } from "@/components/site/SiteAdminBar";

type AdminBarSession = {
  displayName: string;
  email: string | null;
  authBypass: boolean;
};

const ADMIN_BAR_HEIGHT = "32px";

/** Same cookie test the server used before (sb-* or *auth-token*), read in the browser. */
function hasAuthCookie(): boolean {
  return document.cookie.split(";").some((entry) => {
    const [rawName, ...rest] = entry.split("=");
    const name = rawName.trim();
    return name.includes("auth-token") || (name.startsWith("sb-") && rest.join("=").length > 0);
  });
}

/**
 * Shows the admin bar on cached public pages. Visitors without an auth cookie make no
 * request and get nothing rendered. Local dev always checks, for the auth bypass.
 */
export function SiteAdminBarGate() {
  const [session, setSession] = useState<AdminBarSession | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" && !hasAuthCookie()) {
      return;
    }

    let cancelled = false;

    fetch("/api/admin/session", { cache: "no-store", credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.isAdmin) {
          setSession({
            displayName: data.displayName ?? "Admin",
            email: data.email ?? null,
            authBypass: Boolean(data.authBypass),
          });
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) {
      return;
    }

    const root = document.querySelector<HTMLElement>("[data-site-root]");
    if (!root) {
      return;
    }

    root.classList.add("site-has-admin-bar");
    root.style.setProperty("--site-admin-bar-height", ADMIN_BAR_HEIGHT);

    return () => {
      root.classList.remove("site-has-admin-bar");
      root.style.removeProperty("--site-admin-bar-height");
    };
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <SiteAdminBar
      displayName={session.displayName}
      email={session.email}
      authBypass={session.authBypass}
    />
  );
}
