import PageHero from "@/components/site/PageHero";
import { business } from "@/lib/site/config";

const GROUP_PHOTO = {
  src: "/images/team/group-photo.webp",
  alt: "Elite Builders team group photo",
  objectPosition: "60% 42%",
} as const;

export default function ContactPageHero() {
  return (
    <PageHero
      eyebrow="Contact Us"
      title="Request a Free Estimate or Ask a Question"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      image={GROUP_PHOTO}
      lede={
        <>
          <p>
            Tell us about your framing or home building project. Whether you need custom home
            framing, a new build, a home addition, or structural work for a remodel, our team is
            ready to help.
          </p>
          <p>
            We respond within one business day with straight answers and clear next steps.{" "}
            {business.license}.
          </p>
        </>
      }
    />
  );
}
