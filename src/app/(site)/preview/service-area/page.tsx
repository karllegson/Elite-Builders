import type { Metadata } from "next";
import { ServiceAreaPreviewView } from "@/components/site/ServiceAreaPreviewView";

/** Editor previews are private drafts: never index them. */
export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export default function ServiceAreaPreviewPage() {
  return <ServiceAreaPreviewView />;
}
