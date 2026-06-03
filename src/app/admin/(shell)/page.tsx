import { WelcomeNotice } from "@/components/admin/WelcomeNotice";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="admin-page-title">Administration</h1>
      <WelcomeNotice />
      <div className="admin-card">
        <h3>Dashboard</h3>
        <p>
          Elite Builders IX admin is ready. Content sections in the sidebar will
          be connected to Supabase in upcoming phases — starting with Posts and
          Pages.
        </p>
      </div>
    </>
  );
}
