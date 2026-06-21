import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import BuilderPartnersSection from "@/components/site/BuilderPartnersSection";
import ContentImage from "@/components/site/ContentImage";
import { business } from "@/lib/site/config";
import { homeImages } from "@/lib/site/images";
import { completedProjects, currentProjects, type Project } from "@/lib/site/projects";
import { buildPageMetadata } from "@/lib/site/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Our Projects",
  description:
    "View completed and in-progress framing projects by Elite Builders — custom homes, condominiums, apartments, and production communities across Northern California.",
  path: "/projects",
});

function ProjectCard({ project }: { project: Project }) {
  const img = homeImages[project.image];
  return (
    <article className="overflow-hidden rounded-xl border border-solid border-gray-200 bg-white transition-shadow hover:shadow-lg">
      <ContentImage src={img.src} alt={img.alt} className="h-52" />
      <div className="p-6">
        <span className="text-xs font-bold uppercase tracking-wide text-brand-sky">
          {project.type}
        </span>
        <h3 className="mt-2 text-lg font-bold text-brand-navy">{project.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
          <MapPin size={14} aria-hidden />
          {project.citySlug ? (
            <Link
              href={`/service-areas/${project.citySlug}`}
              className="hover:text-brand-blue hover:underline"
            >
              {project.location}
            </Link>
          ) : (
            project.location
          )}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">{project.blurb}</p>
        <p className="mt-3 text-xs font-semibold text-brand-blue">Built for {project.builder}</p>
      </div>
    </article>
  );
}

export default function ProjectsPage() {
  return (
    <>
      <section className="bg-brand-navy py-20 text-white">
        <div className="site-container">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-brand-sky">
            Our Work
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Framing Projects Across Northern California
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85">
            From custom homes to multi-plan production communities, these are projects Elite Builders
            IX has completed and is currently building for general contractors and production builders
            across Northern California. {business.license}.
          </p>
        </div>
      </section>

      {/* ── Current projects ─────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
              In Progress
            </p>
            <h2 className="mt-3 text-3xl font-bold text-site-text-dark sm:text-4xl">
              Current Projects
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Completed projects ───────────────────────────────── */}
      <section className="border-y border-solid border-gray-100 bg-gray-50/60 py-20">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
              Completed
            </p>
            <h2 className="mt-3 text-3xl font-bold text-site-text-dark sm:text-4xl">
              Completed Projects
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-gray-400">
            And many more available upon request.
          </p>
        </div>
      </section>

      <BuilderPartnersSection />

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="border-t border-solid border-gray-100 bg-gray-50/60 py-20">
        <div className="site-container text-center">
          <h2 className="text-2xl font-bold text-brand-navy sm:text-3xl">
            Have a Project in Mind?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-gray-500">
            Whether you&apos;re a homeowner or a builder, tell us about your project and we&apos;ll
            respond within one business day.
          </p>
          <div className="mt-7">
            <Link
              href="/#estimate"
              className="inline-flex items-center gap-2 rounded-full bg-brand-red px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-red-dark"
            >
              Request a Free Estimate
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
