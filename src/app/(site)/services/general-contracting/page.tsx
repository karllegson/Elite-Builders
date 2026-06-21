import type { Metadata } from "next";
import PagePlaceholder from "@/components/site/PagePlaceholder";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "General Contractor Modesto CA",
  description:
    "Full-service general contracting in Modesto and the Central Valley — project management, new construction, and remodeling from a licensed California contractor.",
  path: "/services/general-contracting",
});

export default function GeneralContractingPage() {
  return <PagePlaceholder title="General Contracting" />;
}
