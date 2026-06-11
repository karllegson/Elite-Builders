import type { Metadata } from "next";
import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "Blog | Elite Builders IX",
  description:
    "Framing, siding, and construction tips for homeowners in Modesto and the Central Valley.",
};

export default function BlogPage() {
  return (
    <PagePlaceholder
      title="Blog"
      description="Construction tips, framing guides, and project stories are coming soon."
    />
  );
}
