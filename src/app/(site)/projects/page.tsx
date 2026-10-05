import type { Metadata } from "next";
import BuilderPartnersSection from "@/components/site/BuilderPartnersSection";
import CtaBand from "@/components/site/CtaBand";
import PageHero from "@/components/site/PageHero";
import ProjectCard from "@/components/site/ProjectCard";
import SectionIntro from "@/components/site/SectionIntro";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { completedProjects, currentProjects } from "@/lib/site/projects";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Our Projects",
  description:
    "View completed and in-progress framing projects by Elite Builders — custom homes, condominiums, apartments, and production communities across Northern California.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Work"
        title="Framing Projects Across Northern California"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Projects" }]}
        image={homeImages.commercialRoofFramingAerial}
        lede={
          <p>
            From custom homes to multi-plan production communities, these are projects Elite
            Builders IX has completed and is currently building for general contractors and
            production builders across Northern California. {business.license}.
          </p>
        }
      />

      {/* ── Current projects ─────────────────────────────────── */}
      <section className="section bg-white">
        <div className="site-container">
          <SectionIntro eyebrow="In Progress" title="Current Projects" align="left" />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} linkLocation />
            ))}
          </div>
        </div>
      </section>

      {/* ── Completed projects ───────────────────────────────── */}
      <section className="section bg-site-surface">
        <div className="site-container">
          <SectionIntro eyebrow="Completed" title="Completed Projects" align="left" />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} linkLocation />
            ))}
          </div>
          <p className="mt-12 text-center text-sm text-site-text-muted">
            And many more available upon request.
          </p>
        </div>
      </section>

      <BuilderPartnersSection />

      <CtaBand
        title="Have a project in mind?"
        body="Whether you're a homeowner or a builder, tell us about your project and we'll respond within one business day."
      />
    </>
  );
}
