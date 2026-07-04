"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  SEO_PRIORITY_LABELS,
  type SeoPriority,
} from "@/lib/admin/seoChecklistCatalog";
import type {
  SeoCheckStatus,
  SeoChecklistGroup,
  SeoChecklistItem,
  SeoDashboardData,
  SeoRoadmapPhaseSummary,
  SeoTechnicalFile,
} from "@/lib/admin/seoDashboard.server";

type SeoDashboardProps = {
  data: SeoDashboardData;
};

type SeoView = "checklist" | "roadmap" | "files";
type PriorityFilter = "all" | SeoPriority;

const STATUS_LABELS: Record<SeoCheckStatus, string> = {
  pass: "Done",
  warn: "Needs attention",
  pending: "Not configured",
  placeholder: "Track manually",
};

const PRIORITY_STARS: Record<SeoPriority, string> = {
  critical: "★★★★★",
  important: "★★★★",
  helpful: "★★★",
  optional: "★★",
};

function ChecklistStatusBadge({ status }: { status: SeoCheckStatus }) {
  return (
    <span className={`admin-seo-status admin-seo-status-${status}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: SeoPriority }) {
  return (
    <span className={`admin-seo-priority admin-seo-priority-${priority}`}>
      {PRIORITY_STARS[priority]} {SEO_PRIORITY_LABELS[priority]}
    </span>
  );
}

function FileStatusBadge({ status }: { status: SeoTechnicalFile["status"] }) {
  return (
    <span
      className={`admin-seo-status admin-seo-status-${status === "active" ? "pass" : "placeholder"}`}
    >
      {status === "active" ? "Live" : "Placeholder"}
    </span>
  );
}

function ChecklistItemLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="admin-seo-item-link">
        {children}
        <ExternalLink size={14} aria-hidden />
      </a>
    );
  }

  return (
    <Link href={href} className="admin-seo-item-link">
      {children}
    </Link>
  );
}

function ChecklistGroupSection({
  group,
  filter,
}: {
  group: SeoChecklistGroup;
  filter: PriorityFilter;
}) {
  const items = useMemo(
    () => (filter === "all" ? group.items : group.items.filter((item) => item.priority === filter)),
    [filter, group.items],
  );

  if (items.length === 0) {
    return null;
  }

  const passCount = items.filter((item) => item.status === "pass").length;

  return (
    <section className="admin-card admin-seo-panel">
      <div className="admin-seo-panel-header">
        <h3>{group.title}</h3>
        <span className="admin-seo-panel-meta">
          {passCount}/{items.length} done
        </span>
      </div>
      <ul className="admin-seo-checklist">
        {items.map((item) => (
          <ChecklistItemRow key={item.id} item={item} />
        ))}
      </ul>
    </section>
  );
}

function ChecklistItemRow({ item }: { item: SeoChecklistItem }) {
  return (
    <li className="admin-seo-checklist-item">
      <div className="admin-seo-checklist-item-main">
        <div className="admin-seo-checklist-item-title-row">
          <strong>{item.label}</strong>
          <div className="admin-seo-checklist-badges">
            <PriorityBadge priority={item.priority} />
            <ChecklistStatusBadge status={item.status} />
          </div>
        </div>
        <p>{item.description}</p>
        {item.phase ? <p className="admin-seo-item-hint">Roadmap phase {item.phase}</p> : null}
        {item.hint ? <p className="admin-seo-item-hint">{item.hint}</p> : null}
      </div>
      {item.href ? (
        <ChecklistItemLink href={item.href} external={item.external}>
          {item.external ? "Open" : "Manage"}
        </ChecklistItemLink>
      ) : null}
    </li>
  );
}

function SummaryCards({ data }: { data: SeoDashboardData }) {
  const totalItems = data.checklist.reduce((sum, group) => sum + group.items.length, 0);
  const passItems = data.checklist.reduce(
    (sum, group) => sum + group.items.filter((item) => item.status === "pass").length,
    0,
  );
  const critical = data.priorityCounts.critical;

  return (
    <div className="admin-seo-cards">
      <div className="admin-seo-card">
        <span className="admin-seo-card-label">Full checklist</span>
        <span className="admin-seo-card-value">
          {passItems}/{totalItems}
        </span>
        <span className="admin-seo-card-hint">Items auto-detected as done</span>
      </div>
      <div className="admin-seo-card">
        <span className="admin-seo-card-label">Critical priority</span>
        <span className="admin-seo-card-value">
          {critical.pass}/{critical.total}
        </span>
        <span className="admin-seo-card-hint">Highest impact for local contractors</span>
      </div>
      <div className="admin-seo-card">
        <span className="admin-seo-card-label">Sitemap URLs</span>
        <span className="admin-seo-card-value">{data.sitemapUrlCount}</span>
        <span className="admin-seo-card-hint">
          <a href={`${data.siteUrl}/sitemap.xml`} target="_blank" rel="noopener noreferrer">
            View sitemap.xml
          </a>
        </span>
      </div>
      <div className="admin-seo-card">
        <span className="admin-seo-card-label">GA4</span>
        <span className="admin-seo-card-value">{data.ga4Configured ? "On" : "Off"}</span>
        <span className="admin-seo-card-hint">
          <Link href="/admin/analytics">Analytics settings</Link>
        </span>
      </div>
    </div>
  );
}

function PrioritySummary({ data }: { data: SeoDashboardData }) {
  const priorities: SeoPriority[] = ["critical", "important", "helpful", "optional"];

  return (
    <section className="admin-card admin-seo-panel">
      <h3>Priority summary</h3>
      <p className="admin-seo-panel-intro">
        Focus on Critical and Important first — they deliver the most value for a local contractor.
        Helpful and Optional items can wait until the foundation is solid.
      </p>
      <div className="admin-seo-priority-grid">
        {priorities.map((priority) => {
          const counts = data.priorityCounts[priority];
          return (
            <div key={priority} className="admin-seo-priority-card">
              <PriorityBadge priority={priority} />
              <span className="admin-seo-priority-count">
                {counts.pass}/{counts.total} done
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RoadmapSection({ phases }: { phases: SeoRoadmapPhaseSummary[] }) {
  return (
    <div className="admin-seo-roadmap">
      {phases.map((phase) => (
        <section key={phase.phase} className="admin-card admin-seo-panel admin-seo-roadmap-phase">
          <div className="admin-seo-panel-header">
            <h3>
              Phase {phase.phase} — {phase.title}
            </h3>
            <span className="admin-seo-panel-meta">
              {phase.passItems}/{phase.totalItems} done
            </span>
          </div>
          <p className="admin-seo-panel-intro">{phase.summary}</p>
        </section>
      ))}
    </div>
  );
}

function TechnicalFilesSection({ files, siteUrl }: { files: SeoTechnicalFile[]; siteUrl: string }) {
  return (
    <section className="admin-card admin-seo-panel">
      <div className="admin-seo-panel-header">
        <h3>Technical files</h3>
        <span className="admin-seo-panel-meta">{siteUrl}</span>
      </div>
      <p className="admin-seo-panel-intro">
        Core crawl and discovery files. Live files are served by the app; placeholders are tracked
        for future implementation (llms.txt, image/video sitemaps, RSS).
      </p>
      <div className="admin-seo-files-table-wrap">
        <table className="admin-seo-files-table">
          <thead>
            <tr>
              <th>File</th>
              <th>Path</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Notes</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td>
                  <strong>{file.label}</strong>
                  {file.source ? (
                    <span className="admin-seo-file-source">{file.source}</span>
                  ) : null}
                </td>
                <td>
                  <code>{file.path}</code>
                </td>
                <td>
                  <PriorityBadge priority={file.priority} />
                </td>
                <td>
                  <FileStatusBadge status={file.status} />
                </td>
                <td>{file.description}</td>
                <td className="admin-seo-files-actions">
                  {file.status === "active" ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-seo-item-link"
                    >
                      View
                      <ExternalLink size={14} aria-hidden />
                    </a>
                  ) : (
                    <span className="admin-seo-item-hint">Coming soon</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function SeoDashboard({ data }: SeoDashboardProps) {
  const [view, setView] = useState<SeoView>("checklist");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  const visibleGroups = useMemo(() => {
    if (view !== "checklist") {
      return [];
    }

    return data.checklist.filter((group) => {
      if (priorityFilter === "all") {
        return true;
      }

      return group.items.some((item) => item.priority === priorityFilter);
    });
  }, [data.checklist, priorityFilter, view]);

  return (
    <div className="admin-seo-page">
      <p className="admin-seo-intro">
        Comprehensive SEO checklist for Elite Builders — 20 categories covering technical SEO,
        local search, schema, content, off-page, AI crawlers, and maintenance. Not every item is
        required on day one; start with Critical priority and Phase 1 of the roadmap.
      </p>

      <SummaryCards data={data} />
      <PrioritySummary data={data} />

      <div className="admin-seo-tabs" role="tablist" aria-label="SEO dashboard views">
        <button
          type="button"
          role="tab"
          aria-selected={view === "checklist"}
          className={`admin-seo-tab${view === "checklist" ? " is-active" : ""}`}
          onClick={() => setView("checklist")}
        >
          Full checklist
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "roadmap"}
          className={`admin-seo-tab${view === "roadmap" ? " is-active" : ""}`}
          onClick={() => setView("roadmap")}
        >
          10-phase roadmap
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "files"}
          className={`admin-seo-tab${view === "files" ? " is-active" : ""}`}
          onClick={() => setView("files")}
        >
          Technical files
        </button>
      </div>

      {view === "checklist" ? (
        <>
          <div className="admin-seo-filter-row">
            <span className="admin-seo-filter-label">Filter by priority:</span>
            {(["all", "critical", "important", "helpful", "optional"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                className={`admin-seo-filter-btn${priorityFilter === filter ? " is-active" : ""}`}
                onClick={() => setPriorityFilter(filter)}
              >
                {filter === "all" ? "All" : SEO_PRIORITY_LABELS[filter]}
              </button>
            ))}
          </div>

          <div className="admin-seo-checklist-grid">
            {visibleGroups.map((group) => (
              <ChecklistGroupSection key={group.id} group={group} filter={priorityFilter} />
            ))}
          </div>
        </>
      ) : null}

      {view === "roadmap" ? <RoadmapSection phases={data.roadmap} /> : null}

      {view === "files" ? (
        <TechnicalFilesSection files={data.technicalFiles} siteUrl={data.siteUrl} />
      ) : null}

      <section className="admin-card admin-seo-panel">
        <h3>Quick links</h3>
        <ul className="admin-seo-links">
          <li>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-seo-external-link"
            >
              Google Search Console
              <ExternalLink size={14} aria-hidden />
            </a>
            <span>Indexing, coverage, and search performance</span>
          </li>
          <li>
            <a
              href="https://pagespeed.web.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-seo-external-link"
            >
              PageSpeed Insights
              <ExternalLink size={14} aria-hidden />
            </a>
            <span>Core Web Vitals and performance audits</span>
          </li>
          <li>
            <a
              href="https://business.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-seo-external-link"
            >
              Google Business Profile
              <ExternalLink size={14} aria-hidden />
            </a>
            <span>Maps, reviews, and local visibility</span>
          </li>
          <li>
            <Link href="/admin/analytics" className="admin-seo-external-link">
              Analytics settings
            </Link>
            <span>GA4, Clarity, and on-site event tracking</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
