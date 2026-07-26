import type { Metadata, Viewport } from "next";
import { Fira_Sans, Poppins } from "next/font/google";
import "./showcase.css";

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

export const metadata: Metadata = {
  title: "Lobby Showcase | Elite Builders IX",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00205b",
};

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${firaSans.variable} ${poppins.variable} showcase-root`}>{children}</div>
  );
}
