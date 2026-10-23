import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./dashboard.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jobs Board | Elite Builders IX",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${archivo.variable} db-root`}>{children}</div>;
}
