import type { Metadata } from "next";
import PagePlaceholder from "@/components/site/PagePlaceholder";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Us",
  description:
    "Contact Elite Builders for a free framing, remodeling, siding, or deck estimate. Serving the Bay Area, Central Valley, and Southern California. CSLB #970551.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PagePlaceholder
      title="Contact Us"
      description="A full contact page is coming soon. For now, request a free estimate from the homepage and we'll get back to you within one business day."
    />
  );
}
