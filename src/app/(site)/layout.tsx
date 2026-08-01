import type { Metadata } from "next";
import { Suspense } from "react";
import { Fira_Sans, Poppins } from "next/font/google";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import SiteAnalytics from "@/components/site/SiteAnalytics";
import MobileStickyCta from "@/components/site/MobileStickyCta";
import EstimateHashScroll from "@/components/site/EstimateHashScroll";
import { SiteAdminBar } from "@/components/site/SiteAdminBar";
import { getSiteAdminSession } from "@/lib/admin/getSiteAdminSession";
import { siteDefaultMetadata } from "@/lib/site/seo";

export const metadata: Metadata = siteDefaultMetadata;

/** Fira Sans body + Poppins headings & nav */
const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fira",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const adminSession = await getSiteAdminSession();

  return (
    <div
      className={`site ${firaSans.variable} ${poppins.variable} flex min-h-screen flex-col${
        adminSession.isAdmin ? " site-has-admin-bar" : ""
      }`}
      style={
        adminSession.isAdmin
          ? ({ "--site-admin-bar-height": "32px" } as React.CSSProperties)
          : undefined
      }
    >
      {adminSession.isAdmin ? (
        <SiteAdminBar
          displayName={adminSession.displayName ?? "Admin"}
          email={adminSession.email}
          authBypass={adminSession.authBypass}
        />
      ) : null}
      <SiteHeader hasAdminBar={adminSession.isAdmin} />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <SiteFooter />
      <Suspense fallback={null}>
        <SiteAnalytics />
      </Suspense>
      <EstimateHashScroll />

      {/* Sticky mobile call-to-action bar — hidden until past hero / top of page */}
      <MobileStickyCta />
    </div>
  );
}
