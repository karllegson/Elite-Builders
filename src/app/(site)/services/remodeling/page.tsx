import type { Metadata } from "next";
import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { serviceDetails } from "@/lib/site/scope";
import { buildPageMetadata } from "@/lib/site/seo";

const detail = serviceDetails["remodeling"];

export const metadata: Metadata = buildPageMetadata({
  title: detail.metaTitle,
  description: detail.metaDescription,
  path: "/services/remodeling",
});

export default function RemodelingPage() {
  return <ServicePageTemplate detail={detail} />;
}
