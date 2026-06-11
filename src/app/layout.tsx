import type { Metadata } from "next";
import "./globals.css";
import "./admin.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://elitebuildersco.com"),
  title: "Elite Builders IX",
  description: "Elite Builders contractor administration and website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
