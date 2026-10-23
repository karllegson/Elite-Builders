import Image from "next/image";
import { redirect } from "next/navigation";
import DashboardLoginForm from "@/components/dashboard/DashboardLoginForm";
import { hasDashboardSession, isDashboardConfigured } from "@/lib/dashboard/session";

export const dynamic = "force-dynamic";

export default async function DashboardLoginPage() {
  if (await hasDashboardSession()) {
    redirect("/dashboard");
  }

  return (
    <main className="db-login">
      <div className="db-login-card">
        <Image src="/logo.png" alt="Elite Builders" width={64} height={64} priority />
        <h1>Jobs Board</h1>
        <p>Office sign-in</p>
        {isDashboardConfigured() ? (
          <DashboardLoginForm />
        ) : (
          <p className="db-error">The office password hasn&apos;t been set up yet (DASHBOARD_PASSWORD).</p>
        )}
      </div>
    </main>
  );
}
