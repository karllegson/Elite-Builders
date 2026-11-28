import type { Metadata } from "next";
import { Suspense } from "react";
import { Archivo, Inter } from "next/font/google";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import SiteAnalytics from "@/components/site/SiteAnalytics";
import MobileStickyCta from "@/components/site/MobileStickyCta";
import EstimateHashScroll from "@/components/site/EstimateHashScroll";
import { SiteAdminBarGate } from "@/components/site/SiteAdminBarGate";
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

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // No cookies() here so public pages can be cached; the admin bar is checked in the browser.
  return (
    <div data-site-root className={`site ${inter.variable} ${archivo.variable} flex min-h-screen flex-col`}>
      <SiteAdminBarGate />
      <SiteHeader />
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
