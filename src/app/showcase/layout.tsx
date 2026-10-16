import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./showcase.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lobby Showcase | Elite Builders IX",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050d1f",
};

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${archivo.variable} tv-root`}>{children}</div>;
}
