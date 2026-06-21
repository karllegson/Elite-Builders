import type { Metadata } from "next";
import "../admin.css";

export const metadata: Metadata = {
  title: "Admin | Elite Builders IX",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
