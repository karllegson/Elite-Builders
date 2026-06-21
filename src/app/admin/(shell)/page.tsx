import Link from "next/link";
import { WelcomeNotice } from "@/components/admin/WelcomeNotice";

export default function AdminDashboardPage() {
  return (
    <>
      <WelcomeNotice />
      <div className="admin-dashboard-grid">
        <div className="admin-card">
          <h3>Dashboard</h3>
          <p>
            Elite Builders IX admin is ready. Content sections in the sidebar connect to Supabase
            and local admin stores — use Posts, Service Areas, FAQs, and Pages to manage the site.
          </p>
        </div>
        <Link href="/admin/analytics" className="admin-card admin-dashboard-card-link">
          <h3>Analytics</h3>
          <p>
            Configure Google Analytics 4, Search Console, and Microsoft Clarity. Track phone
            clicks, estimate forms, and outbound links on the live site.
          </p>
          <span className="admin-dashboard-card-cta">Open Analytics →</span>
        </Link>
        <Link href="/admin/forms/entries" className="admin-card admin-dashboard-card-link">
          <h3>Contact Submissions</h3>
          <p>
            View Contact Us and Free Estimate form leads from the homepage and contact page.
          </p>
          <span className="admin-dashboard-card-cta">View Submissions →</span>
        </Link>
      </div>
    </>
  );
}
