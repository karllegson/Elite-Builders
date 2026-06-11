import type { Metadata } from "next";
import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "Contact Us | Elite Builders IX",
  description:
    "Contact Elite Builders IX for a free framing, siding, or deck construction estimate in Modesto, CA.",
};

export default function ContactPage() {
  return (
    <PagePlaceholder
      title="Contact Us"
      description="A full contact page is coming soon. For now, request a free estimate from the homepage and we'll get back to you within one business day."
    />
  );
}
