import type { Metadata } from "next";
import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "Our Services | Elite Builders IX",
  description:
    "Framing, siding, deck construction, and general contracting services in Modesto and the Central Valley.",
};

export default function ServicesPage() {
  return (
    <PagePlaceholder
      title="Our Services"
      description="Framing, siding, deck construction, and general contracting — detailed service pages are coming soon."
    />
  );
}
