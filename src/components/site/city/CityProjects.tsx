import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProjectCard from "@/components/site/ProjectCard";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import type { CityPageConfig } from "@/lib/site/cityPages";
import type { Project } from "@/lib/site/projects";

type CityProjectsProps = {
  config: CityPageConfig["projects"];
  projects: Project[];
  showDrafts: boolean;
};

export function CityProjects({ config, projects, showDrafts }: CityProjectsProps) {
  if (projects.length === 0 && !showDrafts) {
    return null;
  }

  return (
    <section className="section bg-site-surface" aria-labelledby="city-projects-heading">
      <div className="site-container">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="spec-label">Work</p>
            <h2 id="city-projects-heading" className="section-title mt-4">
              {config.heading}
            </h2>
            <p className="section-lede mt-5">{config.lede}</p>
          </div>
          <Link href="/projects" className="link-arrow shrink-0">
            View all projects
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        {config.todo ? <ClientTodoNote todo={config.todo} show={showDrafts} className="mt-6 max-w-3xl" /> : null}

        {/* Swipe row on phones, grid from tablet up. */}
        <ul className="-mx-[var(--site-container-margin)] mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--site-container-margin)] scroll-px-[var(--site-container-margin)] pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id} className="w-[85%] shrink-0 snap-start sm:w-auto">
              <ProjectCard project={project} linkLocation />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
