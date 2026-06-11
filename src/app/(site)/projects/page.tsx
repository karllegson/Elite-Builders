import type { Metadata } from "next";
import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "Our Projects | Elite Builders IX",
  description:
    "Recent framing, siding, deck, and general contracting projects across Modesto and the Central Valley.",
};

export default function ProjectsPage() {
  return (
    <PagePlaceholder
      title="Our Projects"
      description="Our project portfolio with before & after photos is coming soon."
    />
  );
}
