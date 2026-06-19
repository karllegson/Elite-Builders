import { Home, RotateCw, Search } from "lucide-react";
import { logout } from "@/app/admin/actions";
import { siteConfig } from "@/lib/admin/config";

type AdminToolbarProps = {
  displayName?: string | null;
  userEmail?: string | null;
  userRole?: string;
  authBypass?: boolean;
};

function getInitials(displayName?: string | null, email?: string | null) {
  const source = displayName || email || "A";
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AdminToolbar({
  displayName,
  userEmail,
  userRole = siteConfig.defaultUserRole,
  authBypass = false,
}: AdminToolbarProps) {
  const greetingName = displayName || userEmail?.split("@")[0] || "Admin";
  const initials = getInitials(displayName, userEmail);

  return (
    <header className="admin-toolbar" id="admin-toolbar">
      <div className="admin-toolbar-left">
        <a href="/admin" className="admin-toolbar-brand" title={siteConfig.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="admin-toolbar-brand-icon" />
        </a>

        <a href="/" className="admin-toolbar-item admin-toolbar-site-name">
          {siteConfig.shortName}
        </a>

        <span className="admin-toolbar-divider" aria-hidden />

        <a href="/admin" className="admin-toolbar-item" title="Dashboard">
          <Home size={16} strokeWidth={1.75} aria-hidden />
          <span className="admin-toolbar-count">0</span>
        </a>

        <button type="button" className="admin-toolbar-item" title="Refresh">
          <RotateCw size={16} strokeWidth={1.75} aria-hidden />
        </button>

        <button type="button" className="admin-toolbar-item admin-toolbar-search">
          <Search size={16} strokeWidth={1.75} aria-hidden />
          <span>Ctrl+K</span>
        </button>

        <span className="admin-toolbar-divider" aria-hidden />

        <button type="button" className="admin-toolbar-item">
          Purge Cache
        </button>
      </div>

      <div className="admin-toolbar-right">
        <span className="admin-toolbar-greeting">
          Hello {greetingName}
          {!authBypass && <> &mdash; {userRole}</>}
          {authBypass && <> &mdash; Dev Mode</>}
        </span>

        <form action={logout} className="admin-toolbar-logout-form">
          <button type="submit" className="admin-toolbar-item admin-toolbar-logout">
            Log Out
          </button>
        </form>

        {!authBypass ? (
          <form action={logout} className="admin-toolbar-avatar-form">
            <button
              type="submit"
              className="admin-toolbar-avatar"
              title="Log out"
              aria-label="Log out"
            >
              {initials}
            </button>
          </form>
        ) : (
          <span className="admin-toolbar-avatar" aria-hidden>
            {initials}
          </span>
        )}
      </div>
    </header>
  );
}
