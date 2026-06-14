import type { Metadata } from "next";
import ServicePageTemplate from "@/components/site/ServicePageTemplate";
import { serviceDetails } from "@/lib/site/scope";

const detail = serviceDetails.siding;

export const metadata: Metadata = {
  title: detail.metaTitle,
  description: detail.metaDescription,
};

export default function SidingPage() {
  return <ServicePageTemplate detail={detail} />;
}
