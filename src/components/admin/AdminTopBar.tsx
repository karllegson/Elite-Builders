import { logout } from "@/app/admin/actions";

type AdminTopBarProps = {
  userEmail?: string | null;
  displayName?: string | null;
  authBypass?: boolean;
};

export function AdminTopBar({
  userEmail,
  displayName,
  authBypass = false,
}: AdminTopBarProps) {
  const greeting = displayName || userEmail || "Admin";

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <a href="/">Elite Builders IX</a>
        {authBypass && (
          <span style={{ fontSize: 11, opacity: 0.85 }}>(auth bypass)</span>
        )}
      </div>
      <div className="admin-topbar-right">
        <span>Hello {greeting}</span>
        {!authBypass && (
          <form action={logout}>
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                color: "inherit",
                cursor: "pointer",
                font: "inherit",
                padding: 0,
              }}
            >
              Log out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
