import type { Metadata } from "next";
import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { serviceDetails } from "@/lib/site/scope";
import { buildPageMetadata } from "@/lib/site/seo";

const detail = serviceDetails.decks;

export const metadata: Metadata = buildPageMetadata({
  title: detail.metaTitle,
  description: detail.metaDescription,
  path: "/services/decks",
});

export default function DecksPage() {
  return <ServicePageTemplate detail={detail} />;
}
