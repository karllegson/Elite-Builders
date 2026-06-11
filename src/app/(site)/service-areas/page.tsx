import type { Metadata } from "next";
import PagePlaceholder from "@/components/site/PagePlaceholder";

export const metadata: Metadata = {
  title: "Service Areas | Elite Builders IX",
  description:
    "Elite Builders serves Modesto, the Central Valley, San Jose, Livermore, Fremont, and communities across the Bay Area.",
};

export default function ServiceAreasPage() {
  return (
    <PagePlaceholder
      title="Service Areas"
      description="We serve Modesto, Stockton, Manteca, Tracy, Turlock, Ceres, San Jose, Livermore, Fremont, Pleasanton, Dublin, Walnut Creek, and the greater Bay Area. Dedicated city pages are coming soon."
    />
  );
}
