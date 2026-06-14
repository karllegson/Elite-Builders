import type { Metadata } from "next";
import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "Blog | Elite Builders IX",
  description:
    "Framing, siding, and construction tips for homeowners across the Bay Area and Northern California.",
};

export default function BlogPage() {
  return (
    <PagePlaceholder
      title="Blog"
      description="Construction tips, framing guides, and project stories are coming soon."
    />
  );
}
