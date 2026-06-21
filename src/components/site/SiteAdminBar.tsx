"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { logout } from "@/app/admin/actions";
import { siteConfig } from "@/lib/admin/config";
import {
  getFrontendAdminBarItems,
  type FrontendAdminBarItem,
} from "@/lib/admin/frontendAdminBar";
import {
  SERVICE_AREAS_CHANGED_EVENT,
} from "@/lib/admin/serviceAreasData";
import { resolveServiceAreaAdminIdFromPath } from "@/lib/site/serviceAreaUrls";

type SiteAdminBarProps = {
  displayName: string;
  email?: string | null;
  authBypass?: boolean;
};

function getInitials(displayName: string, email?: string | null) {
  const source = displayName || email || "A";
  const parts = source.trim().split(/\s+/);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

function resolveItemHref(
  item: FrontendAdminBarItem,
  pathname: string,
  serviceAreaAdminId: string | null,
): string {
  if (!item.resolveServiceAreaId) {
    return item.href;
  }

  if (serviceAreaAdminId) {
    return `/admin/service-areas/${serviceAreaAdminId}`;
  }

  return item.href;
}

export function SiteAdminBar({
  displayName,
  email,
  authBypass = false,
}: SiteAdminBarProps) {
  const pathname = usePathname();
  const [serviceAreaAdminId, setServiceAreaAdminId] = useState<string | null>(null);

  const baseItems = useMemo(() => getFrontendAdminBarItems(pathname), [pathname]);

  useEffect(() => {
    const syncServiceAreaId = () => {
      setServiceAreaAdminId(resolveServiceAreaAdminIdFromPath(pathname));
    };

    syncServiceAreaId();
    window.addEventListener(SERVICE_AREAS_CHANGED_EVENT, syncServiceAreaId);

    return () => {
      window.removeEventListener(SERVICE_AREAS_CHANGED_EVENT, syncServiceAreaId);
    };
  }, [pathname]);

  const items = baseItems.map((item) => ({
    ...item,
    href: resolveItemHref(item, pathname, serviceAreaAdminId),
  }));

  const initials = getInitials(displayName, email);

  return (
    <header className="site-admin-bar" id="site-admin-bar">
      <div className="site-admin-bar-inner">
        <div className="site-admin-bar-left">
          <Link href="/admin" className="site-admin-bar-brand" title={siteConfig.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="site-admin-bar-brand-icon" />
          </Link>

          <Link href="/" className="site-admin-bar-item site-admin-bar-site-name">
            {siteConfig.shortName}
          </Link>

          <span className="site-admin-bar-divider" aria-hidden />

          {items.map((item) => (
            <Link key={`${item.label}-${item.href}`} href={item.href} className="site-admin-bar-item">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="site-admin-bar-right">
          <span className="site-admin-bar-greeting">
            Hello {displayName}
            {authBypass ? " — Dev Mode" : ""}
          </span>

          <form action={logout} className="site-admin-bar-logout-form">
            <button type="submit" className="site-admin-bar-item site-admin-bar-logout">
              Log Out
            </button>
          </form>

          {!authBypass ? (
            <form action={logout} className="site-admin-bar-avatar-form">
              <button
                type="submit"
                className="site-admin-bar-avatar"
                title={`Log out (${displayName})`}
                aria-label={`${initials}, log out`}
              >
                {initials}
              </button>
            </form>
          ) : (
            <span className="site-admin-bar-avatar" aria-hidden>
              {initials}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
