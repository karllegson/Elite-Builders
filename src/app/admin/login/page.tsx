import { login } from "@/app/admin/actions";
import { siteConfig } from "@/lib/admin/config";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; setup?: string; logged_out?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt={siteConfig.name} />
        <h1>Log In</h1>

        {!configured && (
          <div className="admin-setup-notice">
            <strong>Supabase not configured yet.</strong>
            <br />
            Copy <code>.env.local.example</code> to <code>.env.local</code>, add
            your Supabase URL and publishable key, then create an admin user in the
            Supabase dashboard.
          </div>
        )}

        {params.logged_out && (
          <div className="admin-setup-notice">You have been logged out.</div>
        )}

        {params.error && <div className="admin-error">{params.error}</div>}

        <form action={login}>
          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              disabled={!configured}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={!configured}
            />
          </div>
          <button type="submit" className="admin-btn-primary" disabled={!configured}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
