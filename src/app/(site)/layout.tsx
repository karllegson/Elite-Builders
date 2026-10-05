import type { Metadata } from "next";
import { Suspense } from "react";
import { Archivo, Inter } from "next/font/google";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import SiteAnalytics from "@/components/site/SiteAnalytics";
import MobileStickyCta from "@/components/site/MobileStickyCta";
import EstimateHashScroll from "@/components/site/EstimateHashScroll";
import { SiteAdminBar } from "@/components/site/SiteAdminBar";
import { getSiteAdminSession } from "@/lib/admin/getSiteAdminSession";
import { siteDefaultMetadata } from "@/lib/site/seo";

export const metadata: Metadata = siteDefaultMetadata;

/** Inter body + Archivo headings, nav & buttons */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const adminSession = await getSiteAdminSession();

  return (
    <div
      className={`site ${inter.variable} ${archivo.variable} flex min-h-screen flex-col${
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
      <main className="flex-1">{children}</main>
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
