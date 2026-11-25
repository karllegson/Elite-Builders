import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import SectionIntro from "@/components/site/SectionIntro";
import { homeImages } from "@/lib/site/images";
import type { Project } from "@/lib/site/projects";

function StatusTag({ status }: { status: Project["status"] }) {
  return status === "current" ? (
    <span className="inline-flex items-center gap-1.5 self-start rounded-md bg-brand-red px-2.5 py-1 font-display text-xs font-semibold text-white">
      <span className="size-1.5 rounded-full bg-white" aria-hidden />
      In progress
    </span>
  ) : (
    <span className="inline-flex items-center self-start rounded-md bg-brand-ink px-2.5 py-1 font-display text-xs font-semibold text-white">
      Completed
    </span>
  );
}

/** Home page project card. The whole card opens the portfolio (/projects). */
function HomeProjectCard({
  project,
  featured,
  index,
}: {
  project: Project;
  featured: boolean;
  /** Stagger step for the scroll reveal. */
  index: number;
}) {
  const img = homeImages[project.image];

  return (
    // Reveal sits on a wrapper: the card's own transition (hover lift) would override its timing.
    <div className="reveal-up h-full" style={{ "--reveal-i": index } as CSSProperties}>
      <Link
        href="/projects"
        className={`group flex h-full overflow-hidden rounded-3xl border border-solid border-site-line bg-white transition-all duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0 hover:shadow-[0_28px_56px_-32px_rgba(7,21,48,0.5)] ${
          featured ? "flex-col" : "flex-col sm:flex-row"
        }`}
      >
        <div className={`relative shrink-0 ${featured ? "" : "sm:w-[44%]"}`}>
          <ContentImage
            src={img.src}
            alt={img.alt}
            className={`img-zoom reveal-rise ${featured ? "aspect-[4/3] lg:aspect-[5/4]" : "aspect-[4/3] sm:h-full sm:min-h-56 sm:aspect-auto"}`}
            sizes={
              featured ? "(max-width: 1024px) 100vw, 640px" : "(max-width: 640px) 100vw, 320px"
            }
          />
          <span className="absolute left-4 top-4 rounded-md bg-white px-2.5 py-1 font-display text-xs font-semibold text-brand-ink">
            {project.type}
          </span>
        </div>

        <div className={`flex flex-1 flex-col ${featured ? "p-7 sm:p-9" : "p-6 sm:p-7"}`}>
          <StatusTag status={project.status} />
          <h3
            className={`mt-4 font-display font-semibold text-brand-ink transition-colors group-hover:text-brand-blue ${
              featured ? "text-2xl sm:text-[1.75rem]" : "text-xl"
            }`}
          >
            {project.name}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-site-text-muted">
            <MapPin size={14} aria-hidden className="shrink-0 text-brand-red" />
            {project.location}
          </p>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-site-text">{project.blurb}</p>
          <div className="mt-auto pt-6">
            <p className="border-t border-solid border-site-line pt-4 text-sm">
              <span className="text-site-text-muted">Built for </span>
              <span className="font-semibold text-brand-ink">{project.builder}</span>
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function HomeProjectsSection({ projects }: { projects: readonly Project[] }) {
  const [first, ...others] = projects;

  return (
    <section className="section bg-site-surface">
      <div className="site-container">
        <SectionIntro
          eyebrow="Recent Work"
          title="Framing Projects Across Northern California"
          lede="A look at recent framing projects across the Bay Area and Northern California."
          align="left"
          className="reveal-up"
          action={
            <Link href="/projects" className="btn btn-outline">
              View All Projects
              <ArrowRight size={16} aria-hidden className="btn-arrow" />
            </Link>
          }
        />

        <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-2 lg:gap-8">
          {first ? <HomeProjectCard project={first} featured index={0} /> : null}
          <div className="grid gap-6 lg:gap-8">
            {others.map((project, index) => (
              <HomeProjectCard
                key={project.id}
                project={project}
                featured={false}
                index={index + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
