import Link from "next/link";
import { MapPin } from "lucide-react";
import ContentImage from "@/components/site/ContentImage";
import { homeImages } from "@/lib/site/images";
import type { Project } from "@/lib/site/projects";

type ProjectCardProps = {
  project: Project;
  /** Link the location to its service-area page when one exists. */
  linkLocation?: boolean;
};

export default function ProjectCard({ project, linkLocation = false }: ProjectCardProps) {
  const img = homeImages[project.image];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-solid border-site-line bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_-32px_rgba(7,21,48,0.5)]">
      <div className="relative">
        <ContentImage src={img.src} alt={img.alt} className="img-zoom aspect-[4/3]" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-display text-xs font-semibold text-brand-ink backdrop-blur-md">
          {project.type}
        </span>
        {project.status === "current" ? (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand-red px-3 py-1 font-display text-xs font-semibold text-white">
            <span className="size-1.5 rounded-full bg-white" aria-hidden />
            In progress
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-xl font-semibold">{project.name}</h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-site-text-muted">
          <MapPin size={14} aria-hidden className="shrink-0 text-brand-red" />
          {linkLocation && project.citySlug ? (
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
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-site-text">{project.blurb}</p>
        <div className="mt-auto pt-6">
          <p className="border-t border-solid border-site-line pt-4 text-sm">
            <span className="text-site-text-muted">Built for </span>
            <span className="font-semibold text-brand-ink">{project.builder}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
