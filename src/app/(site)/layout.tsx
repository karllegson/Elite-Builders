import Link from "next/link";
import type { Metadata } from "next";
import { Fira_Sans, Poppins } from "next/font/google";
import { Phone } from "lucide-react";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteAdminBar } from "@/components/site/SiteAdminBar";
import { getSiteAdminSession } from "@/lib/admin/getSiteAdminSession";
import { business } from "@/lib/site/config";
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

      {/* Sticky mobile call-to-action bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 sm:hidden">
        <a
          href={business.phoneHref}
          className="flex items-center justify-center gap-2 bg-brand-navy py-3.5 text-sm font-bold text-white"
        >
          <Phone size={16} aria-hidden />
          Call Now
        </a>
        <Link
          href="/#estimate"
          className="flex items-center justify-center bg-brand-red py-3.5 text-sm font-bold text-white"
        >
          Free Estimate
        </Link>
      </div>
    </div>
  );
}
