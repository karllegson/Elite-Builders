"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { builders } from "@/lib/site/builders";
import { business } from "@/lib/site/config";
import {
  compareBidsBoard,
  isOnBidsBoard,
  isWonJob,
  type ShowcaseProject,
  type ShowcaseSettings,
} from "@/lib/admin/showcaseData";

type ShowcaseTvDisplayProps = {
  settings: ShowcaseSettings;
  projects: ShowcaseProject[];
  /** Zero-based slide to open on (from ?slide=N) — for checking one slide without waiting. */
  initialSlide?: number;
};

type ClientGroup = {
  key: string;
  name: string;
  logo: string | null;
  projects: ShowcaseProject[];
};

type Slide =
  | { kind: "intro" }
  | { kind: "bids"; rows: ShowcaseProject[]; page: number; pages: number }
  | { kind: "jobs"; rows: ShowcaseProject[]; page: number; pages: number }
  | { kind: "calendar" }
  | { kind: "spotlight"; group: ClientGroup }
  | { kind: "roster"; groups: ClientGroup[] }
  | { kind: "feature"; project: ShowcaseProject };

const AMBIENT_VIDEO_SRC = "/videos/elite-builders-hero-loop.mp4";
const AMBIENT_VIDEO_POSTER = "/videos/elite-builders-hero-poster.jpg";

/** Clients with at least this many jobs get their own full-screen spotlight. */
const SPOTLIGHT_MIN_JOBS = 2;

/** Rows that fit a spotlight's job list before collapsing to "+N more". */
const SPOTLIGHT_MAX_ROWS = 6;

/** Smaller clients share one roster slide, up to this many per slide. */
const ROSTER_PER_SLIDE = 6;

/** Client names in the jobs list that differ from the logo roster in builders.ts. */
const CLIENT_LOGO_ALIASES: Record<string, string> = {
  "riviera construction": "Riviera Development Company",
  durkin: "Durkin Inc",
  tjh: "Thomas James Homes",
};

/**
 * White-on-transparent logo versions for the dark TV (public/images/builders/tv),
 * keyed by the site logo in builders.ts. Builders missing here show as a wordmark.
 */
/** TV logos that are a monogram only, so the client name is printed beside them. */
const MONOGRAM_LOGOS = new Set(["/images/builders/tv/thomas-james-homes-white.png"]);

const TV_LOGOS: Record<string, string> = {
  "/images/builders/city-ventures-dark.svg": "/images/builders/city-ventures-dark.svg",
  "/images/builders/branagh-development.png": "/images/builders/tv/branagh-development-white.png",
  "/images/builders/durkin-inc.png": "/images/builders/tv/durkin-inc-white.png",
  "/images/builders/riviera-development-company.png":
    "/images/builders/tv/riviera-development-company-white.png",
  "/images/builders/thomas-james-homes.jpg": "/images/builders/tv/thomas-james-homes-white.png",
};

/** Table rows that fit on one bids / active-jobs slide before paging. */
const BOARD_ROWS_PER_SLIDE = 8;

/** Job chips that fit in one calendar day box before collapsing to "+N more". */
const CALENDAR_CHIPS_PER_DAY = 2;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** Only call out the countdown when it is close enough to matter. */
const COUNTDOWN_WINDOW_DAYS = 45;

function parseDueDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Whole-day difference from today — negative once the date has passed. */
function daysUntil(value: string | null): number | null {
  const date = parseDueDate(value);

  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

function formatShortDate(value: string | null, now: Date): string | null {
  const date = parseDueDate(value);

  if (!date) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

function formatLongDate(value: string | null): string | null {
  const date = parseDueDate(value);

  if (!date) {
    return null;
  }

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/**
 * Lobby-safe countdown: only upcoming dates get one. Past targets are never
 * shown as "overdue" to visitors.
 */
function countdownLabel(value: string | null): string | null {
  const days = daysUntil(value);

  if (days === null || days < 0 || days > COUNTDOWN_WINDOW_DAYS) {
    return null;
  }

  if (days === 0) {
    return "Today";
  }

  return days === 1 ? "Tomorrow" : `In ${days} days`;
}

function normalizeClient(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function findClientLogo(name: string): string | null {
  const key = normalizeClient(name);
  const target = normalizeClient(CLIENT_LOGO_ALIASES[key] ?? name);
  const logo = builders.find((builder) => normalizeClient(builder.name) === target)?.logo;
  return logo ? (TV_LOGOS[logo] ?? null) : null;
}

/** "850 Glenview Dr, San Bruno" → "San Bruno" */
function cityOf(location: string): string {
  const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
  const last = parts.at(-1) ?? "";
  return /^(CA|California)$/i.test(last) ? (parts.at(-2) ?? "") : last;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function groupByClient(projects: ShowcaseProject[]): ClientGroup[] {
  const groups = new Map<string, ClientGroup>();

  projects.forEach((project) => {
    const key = normalizeClient(project.builder) || "other";
    const group = groups.get(key) ?? {
      key,
      name: project.builder.trim() || "Other",
      logo: findClientLogo(project.builder),
      projects: [],
    };
    group.projects.push(project);
    groups.set(key, group);
  });

  return [...groups.values()].sort((a, b) => b.projects.length - a.projects.length);
}

function byDateField(key: "bidDueDate" | "dueDate") {
  return (a: ShowcaseProject, b: ShowcaseProject) =>
    (a[key] ?? "9999").localeCompare(b[key] ?? "9999") || a.name.localeCompare(b.name);
}

function pageBoard(kind: "bids" | "jobs", rows: ShowcaseProject[]): Slide[] {
  const pages = Math.ceil(rows.length / BOARD_ROWS_PER_SLIDE);

  return Array.from({ length: pages }, (_, page) => ({
    kind,
    rows: rows.slice(page * BOARD_ROWS_PER_SLIDE, (page + 1) * BOARD_ROWS_PER_SLIDE),
    page,
    pages,
  }));
}

/**
 * Intro → bids board → active jobs board → calendar → client spotlights
 * interleaved with job-site photos → roster of smaller clients.
 */
function buildSlides(allProjects: ShowcaseProject[]): Slide[] {
  const projects = allProjects.filter(isWonJob);
  const bids = allProjects.filter(isOnBidsBoard).sort(compareBidsBoard);
  const active = allProjects
    .filter((project) => project.status === "current")
    .sort(byDateField("dueDate"));
  const groups = groupByClient(projects);
  const spotlights = groups.filter((group) => group.projects.length >= SPOTLIGHT_MIN_JOBS);
  const rest = groups.filter((group) => group.projects.length < SPOTLIGHT_MIN_JOBS);
  const features = projects.filter((project) => project.featuredImage);
  const slides: Slide[] = [
    { kind: "intro" },
    ...pageBoard("bids", bids),
    ...pageBoard("jobs", active),
    { kind: "calendar" },
  ];

  for (let index = 0; index < Math.max(spotlights.length, features.length); index += 1) {
    if (spotlights[index]) {
      slides.push({ kind: "spotlight", group: spotlights[index] });
    }

    if (features[index]) {
      slides.push({ kind: "feature", project: features[index] });
    }
  }

  for (let start = 0; start < rest.length; start += ROSTER_PER_SLIDE) {
    slides.push({ kind: "roster", groups: rest.slice(start, start + ROSTER_PER_SLIDE) });
  }

  return slides;
}

/** Eases a number up from zero when the slide mounts. */
function useCountUp(target: number, durationMs = 1600): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const started = performance.now();

    const tick = (time: number) => {
      const progress = Math.min(1, (time - started) / durationMs);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [durationMs, target]);

  return value;
}

/** Stagger index for entrance animations (see .tv-rise in showcase.css). */
function rise(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}

/** Client logo rendered as a white mark, or the name set as a wordmark when no file exists. */
function ClientMark({ group, size }: { group: Pick<ClientGroup, "name" | "logo">; size: "lg" | "sm" }) {
  return group.logo ? (
    <span className={`tv-mark tv-mark--${size}`}>
      <Image src={group.logo} alt={group.name} width={480} height={160} unoptimized />
    </span>
  ) : (
    <span className={`tv-wordmark tv-wordmark--${size}`}>{group.name}</span>
  );
}

function TopBar({ now }: { now: Date }) {
  return (
    <header className="tv-topbar">
      <div className="tv-brand">
        <span className="tv-brand-mark">
          <Image src="/logo.png" alt="" width={120} height={120} priority quality={95} />
        </span>
        <span className="tv-brand-copy">
          <span className="tv-brand-name">{business.displayName}</span>
          <span className="tv-brand-tag">Framing Contractor · Since {business.foundedYear}</span>
        </span>
      </div>

      <div className="tv-clock">
        <span className="tv-clock-time">
          {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>
        <span className="tv-clock-date">
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </span>
      </div>
    </header>
  );
}

function BottomBar({ activeIndex, durationsMs }: { activeIndex: number; durationsMs: number[] }) {
  return (
    <footer className="tv-bottombar">
      <div className="tv-bottombar-row">
        <span>{business.license} · Licensed &amp; Insured</span>
        <span className="tv-bottombar-contact">
          {business.domain.replace(/^https?:\/\/(www\.)?/, "")}
          <span className="tv-bottombar-sep" aria-hidden />
          {business.phone}
        </span>
      </div>

      {durationsMs.length > 1 ? (
        <div className="tv-progress" aria-hidden>
          {durationsMs.map((duration, index) => (
            <span
              key={index}
              className={`tv-progress-seg${index < activeIndex ? " tv-progress-seg--done" : ""}`}
            >
              {index === activeIndex ? (
                <span
                  key={`fill-${activeIndex}`}
                  className="tv-progress-fill"
                  style={{ animationDuration: `${duration}ms` }}
                />
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </footer>
  );
}

function IntroSlide({ projects }: { projects: ShowcaseProject[] }) {
  const groups = useMemo(() => groupByClient(projects), [projects]);
  const jobs = useCountUp(projects.length);
  const clients = useCountUp(groups.length);
  const years = useCountUp(new Date().getFullYear() - business.foundedYear);

  // Everyone on the board, plus past builders from the site roster that have logos.
  const marks = useMemo(() => {
    const seen = new Set<string>();
    const list: Pick<ClientGroup, "name" | "logo">[] = [];

    [...groups, ...builders.map((builder) => ({ name: builder.name, logo: TV_LOGOS[builder.logo] ?? null }))].forEach(
      (mark) => {
        const key = normalizeClient(CLIENT_LOGO_ALIASES[normalizeClient(mark.name)] ?? mark.name);

        if (!seen.has(key)) {
          seen.add(key);
          list.push({ name: mark.name, logo: mark.logo });
        }
      },
    );

    return list;
  }, [groups]);

  return (
    <section className="tv-slide tv-intro">
      <div className="tv-intro-body">
        <p className="tv-eyebrow tv-eyebrow--light tv-rise" style={rise(0)}>
          Now framing across Northern California
        </p>
        <h1 className="tv-intro-title tv-rise" style={rise(1)}>
          Framing the Bay Area
          <br />
          &amp; Central Valley.
        </h1>

        <dl className="tv-stats">
          {[
            { value: jobs, label: "Active jobs" },
            { value: clients, label: "Builders & GCs" },
            { value: years, label: "Years framing" },
          ].map((stat, index) => (
            <div key={stat.label} className="tv-stat tv-rise" style={rise(index + 2)}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="tv-marquee tv-rise" style={rise(5)} aria-label="Builders we work with">
        <span className="tv-marquee-label">Trusted by</span>
        <div className="tv-marquee-window">
          <div className="tv-marquee-track">
            {[...marks, ...marks].map((mark, index) => (
              <span key={`${mark.name}-${index}`} className="tv-marquee-item">
                <ClientMark group={mark} size="sm" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CalendarSlide({ projects, now }: { projects: ShowcaseProject[]; now: Date }) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dueByDay = useMemo(() => {
    const map = new Map<number, ShowcaseProject[]>();

    projects.forEach((project) => {
      const date = parseDueDate(project.dueDate);

      if (date && date.getFullYear() === year && date.getMonth() === month) {
        map.set(date.getDate(), [...(map.get(date.getDate()) ?? []), project]);
      }
    });

    return map;
  }, [month, projects, year]);

  const dueThisMonth = [...dueByDay.values()].reduce((total, list) => total + list.length, 0);
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return (
    <section className="tv-slide tv-panel tv-calendar">
      <header className="tv-panel-head tv-rise" style={rise(0)}>
        <div>
          <p className="tv-eyebrow">Project calendar</p>
          <h1 className="tv-panel-title">
            {now.toLocaleDateString("en-US", { month: "long" })}{" "}
            <span className="tv-calendar-year">{year}</span>
          </h1>
        </div>
        <p className="tv-panel-count">
          <span className="tv-panel-count-num">{dueThisMonth}</span>
          <span className="tv-panel-count-label">
            {dueThisMonth === 1 ? "Job finishing" : "Jobs finishing"}
            <span className="tv-panel-count-sub">This month</span>
          </span>
        </p>
      </header>

      <div className="tv-calendar-weekdays tv-rise" style={rise(1)} aria-hidden>
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div
        className="tv-calendar-grid tv-rise"
        style={{ ...rise(2), gridTemplateRows: `repeat(${cellCount / 7}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: cellCount }, (_, index) => {
          const day = index - firstWeekday + 1;

          if (day < 1 || day > daysInMonth) {
            return <span key={`pad-${index}`} className="tv-day tv-day--pad" />;
          }

          const due = dueByDay.get(day) ?? [];
          const isToday = day === todayDate;
          const hidden = due.length - CALENDAR_CHIPS_PER_DAY;

          return (
            <div
              key={day}
              className={`tv-day${isToday ? " tv-day--today" : ""}${
                day < todayDate ? " tv-day--past" : ""
              }`}
            >
              <span className="tv-day-head">
                <span className="tv-day-num">{day}</span>
                {isToday ? <span className="tv-day-today">Today</span> : null}
              </span>

              {due.slice(0, CALENDAR_CHIPS_PER_DAY).map((project) => (
                <span key={project.id} className="tv-day-job">
                  <span className="tv-day-job-name">{project.name}</span>
                  <span className="tv-day-job-builder">{project.builder}</span>
                </span>
              ))}

              {hidden > 0 ? <span className="tv-day-more">+{hidden} more</span> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SpotlightSlide({ group, now }: { group: ClientGroup; now: Date }) {
  const count = useCountUp(group.projects.length, 1200);
  const photo = group.projects.find((project) => project.featuredImage)?.featuredImage ?? null;
  const cities = unique(group.projects.map((project) => cityOf(project.location)));
  const scopes = unique(group.projects.map((project) => project.type));
  const shown = group.projects.slice(0, SPOTLIGHT_MAX_ROWS);
  const hidden = group.projects.length - shown.length;

  return (
    <section className={`tv-slide tv-spotlight${photo ? " tv-spotlight--photo" : ""}`}>
      {photo ? (
        <div className="tv-spotlight-photo" aria-hidden>
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="100vw"
            quality={85}
            className="tv-feature-img"
          />
        </div>
      ) : null}

      <div className="tv-spotlight-grid">
        <div className="tv-spotlight-id">
          <p className="tv-eyebrow tv-eyebrow--light tv-rise" style={rise(0)}>
            Client spotlight
          </p>
          <div className="tv-spotlight-mark tv-rise" style={rise(1)}>
            <ClientMark group={group} size="lg" />
          </div>
          {group.logo && MONOGRAM_LOGOS.has(group.logo) ? (
            <p className="tv-spotlight-name tv-rise" style={rise(2)}>
              {group.name}
            </p>
          ) : null}

          <div className="tv-spotlight-count tv-rise" style={rise(3)}>
            <span className="tv-spotlight-count-num">{count}</span>
            <span className="tv-spotlight-count-label">
              Active {group.projects.length === 1 ? "build" : "builds"}
              <span>{scopes.join(" · ")}</span>
            </span>
          </div>

          {cities.length > 0 ? (
            <p className="tv-spotlight-cities tv-rise" style={rise(4)}>
              {cities.join("  ·  ")}
            </p>
          ) : null}
        </div>

        <ol className="tv-spotlight-jobs">
          {shown.map((project, index) => {
            const target = formatShortDate(project.dueDate, now);

            return (
              <li key={project.id} className="tv-spotlight-job tv-rise" style={rise(index + 3)}>
                <span className="tv-spotlight-job-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="tv-spotlight-job-copy">
                  <span className="tv-spotlight-job-name">{project.name}</span>
                  {project.location ? (
                    <span className="tv-spotlight-job-location">{project.location}</span>
                  ) : null}
                </span>
                <span className="tv-spotlight-job-date">
                  {project.status === "completed" ? "Completed" : target ? `Due ${target}` : ""}
                </span>
              </li>
            );
          })}
          {hidden > 0 ? (
            <li className="tv-spotlight-more tv-rise" style={rise(shown.length + 3)}>
              +{hidden} more
            </li>
          ) : null}
        </ol>
      </div>
    </section>
  );
}

function RosterSlide({ groups, now }: { groups: ClientGroup[]; now: Date }) {
  return (
    <section className="tv-slide tv-panel tv-roster">
      <header className="tv-panel-head tv-rise" style={rise(0)}>
        <div>
          <p className="tv-eyebrow">Also on the schedule</p>
          <h1 className="tv-panel-title">More builders we frame for</h1>
        </div>
      </header>

      <div className="tv-roster-grid">
        {groups.map((group, index) => (
          <article key={group.key} className="tv-roster-item tv-rise" style={rise(index + 1)}>
            <div className="tv-roster-mark">
              <ClientMark group={group} size="sm" />
            </div>
            {group.logo && MONOGRAM_LOGOS.has(group.logo) ? (
              <p className="tv-roster-name">{group.name}</p>
            ) : null}
            <ul className="tv-roster-jobs">
              {group.projects.map((project) => {
                const target = formatShortDate(project.dueDate, now);

                return (
                  <li key={project.id}>
                    <span>{project.name}</span>
                    <span className="tv-roster-meta">
                      {[project.type, target ? `Due ${target}` : ""].filter(Boolean).join(" · ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function BoardHead({
  eyebrow,
  title,
  count,
  countLabel,
  page,
  pages,
}: {
  eyebrow: string;
  title: string;
  count: number;
  countLabel: string;
  page: number;
  pages: number;
}) {
  return (
    <header className="tv-panel-head tv-rise" style={rise(0)}>
      <div>
        <p className="tv-eyebrow">
          {eyebrow}
          {pages > 1 ? ` · ${page + 1} of ${pages}` : ""}
        </p>
        <h1 className="tv-panel-title">{title}</h1>
      </div>
      <p className="tv-panel-count">
        <span className="tv-panel-count-num">{count}</span>
        <span className="tv-panel-count-label">{countLabel}</span>
      </p>
    </header>
  );
}

function BidStatus({ project }: { project: ShowcaseProject }) {
  if (project.status === "lost") {
    return <span className="tv-pill tv-pill--lost">Declined</span>;
  }

  if (project.status === "awarded") {
    return <span className="tv-pill tv-pill--won">Awarded</span>;
  }

  return (
    <span className="tv-steps">
      {[
        { label: "Takeoff", done: project.takeoffDone },
        { label: "Sent", done: project.bidSent },
      ].map((step) => (
        <span key={step.label} className={`tv-step${step.done ? " tv-step--done" : ""}`}>
          <span className="tv-step-box" aria-hidden>
            {step.done ? "✓" : ""}
          </span>
          {step.label}
        </span>
      ))}
    </span>
  );
}

function BidsSlide({
  rows,
  total,
  page,
  pages,
  now,
}: {
  rows: ShowcaseProject[];
  total: number;
  page: number;
  pages: number;
  now: Date;
}) {
  return (
    <section className="tv-slide tv-panel tv-board">
      <BoardHead
        eyebrow="Estimating"
        title="Upcoming bids"
        count={total}
        countLabel={total === 1 ? "Open bid" : "Open bids"}
        page={page}
        pages={pages}
      />

      <div className="tv-board-table tv-board-table--bids" role="table">
        <div className="tv-board-row tv-board-row--head tv-rise" style={rise(1)} role="row">
          <span role="columnheader">Job</span>
          <span role="columnheader">Developer</span>
          <span role="columnheader">Bid due</span>
          <span role="columnheader">Status</span>
        </div>
        {rows.map((project, index) => {
          const due = formatShortDate(project.bidDueDate, now);
          const countdown = project.status === "bidding" ? countdownLabel(project.bidDueDate) : null;

          return (
            <div
              key={project.id}
              className={`tv-board-row tv-rise${project.status === "lost" ? " tv-board-row--muted" : ""}`}
              style={rise(index + 2)}
              role="row"
            >
              <span className="tv-board-job" role="cell">
                {project.name}
                {project.location ? <span className="tv-board-city">{cityOf(project.location) || project.location}</span> : null}
              </span>
              <span className="tv-board-dev" role="cell">
                {project.builder || "—"}
              </span>
              <span className="tv-board-date" role="cell">
                {due ?? "—"}
                {countdown ? <span className="tv-board-countdown">{countdown}</span> : null}
              </span>
              <span role="cell">
                <BidStatus project={project} />
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StageTrack({ stage, stages }: { stage: string; stages: string[] }) {
  const index = stages.findIndex((item) => item === stage);

  return (
    <span className="tv-stage-track">
      <span className="tv-stage-name">{stage || "—"}</span>
      {index >= 0 ? (
        <span className="tv-stage-bar" aria-hidden>
          {stages.map((item, position) => (
            <span
              key={item}
              className={`tv-stage-seg${position < index ? " tv-stage-seg--done" : ""}${
                position === index ? " tv-stage-seg--now" : ""
              }`}
            />
          ))}
        </span>
      ) : null}
    </span>
  );
}

function JobsSlide({
  rows,
  stages,
  total,
  page,
  pages,
  now,
}: {
  rows: ShowcaseProject[];
  stages: string[];
  total: number;
  page: number;
  pages: number;
  now: Date;
}) {
  const targetOf = (project: ShowcaseProject) => {
    const daysLeft = daysUntil(project.dueDate);
    return daysLeft !== null && daysLeft >= 0 ? formatShortDate(project.dueDate, now) : null;
  };
  const showTarget = rows.some((project) => targetOf(project));

  return (
    <section className="tv-slide tv-panel tv-board">
      <BoardHead
        eyebrow="In the field"
        title="Active jobs"
        count={total}
        countLabel={total === 1 ? "Job framing" : "Jobs framing"}
        page={page}
        pages={pages}
      />

      <div
        className={`tv-board-table tv-board-table--jobs${showTarget ? "" : " tv-board-table--no-target"}`}
        role="table"
      >
        <div className="tv-board-row tv-board-row--head tv-rise" style={rise(1)} role="row">
          <span role="columnheader">Job</span>
          <span role="columnheader">Developer</span>
          <span role="columnheader">Current stage</span>
          {showTarget ? <span role="columnheader">Target</span> : null}
        </div>
        {rows.map((project, index) => {
          const target = targetOf(project);

          return (
            <div key={project.id} className="tv-board-row tv-rise" style={rise(index + 2)} role="row">
              <span className="tv-board-job" role="cell">
                {project.name}
                {project.location ? <span className="tv-board-city">{cityOf(project.location) || project.location}</span> : null}
              </span>
              <span className="tv-board-dev" role="cell">
                {project.builder || "—"}
              </span>
              <span role="cell">
                <StageTrack stage={project.stage} stages={stages} />
              </span>
              {showTarget ? (
                <span className="tv-board-date" role="cell">
                  {target ?? "—"}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FeatureSlide({ project, durationMs }: { project: ShowcaseProject; durationMs: number }) {
  const photo = project.featuredImage;
  const completed = project.status === "completed";
  const daysLeft = daysUntil(project.dueDate);
  const target = formatLongDate(project.dueDate);
  const countdown = countdownLabel(project.dueDate);
  const description = project.details || project.blurb;

  return (
    <section className="tv-slide tv-feature">
      {photo ? (
        <div className="tv-feature-photo" style={{ animationDuration: `${durationMs + 1000}ms` }}>
          <Image
            src={photo.src}
            alt={photo.alt || `${project.name} job site`}
            fill
            priority
            sizes="100vw"
            quality={90}
            className="tv-feature-img"
            unoptimized={photo.src.startsWith("blob:")}
          />
        </div>
      ) : null}
      <div className="tv-feature-scrim" aria-hidden />

      <div className="tv-feature-body">
        <div className="tv-feature-copy">
          <p className="tv-eyebrow tv-eyebrow--light tv-rise" style={rise(0)}>
            {completed ? "Recently completed" : "Now building"}
            <span className="tv-eyebrow-sep" aria-hidden />
            {project.type}
          </p>
          <h1 className="tv-feature-title tv-rise" style={rise(1)}>
            {project.name}
          </h1>
          <p className="tv-feature-subline tv-rise" style={rise(2)}>
            <span className="tv-feature-builder">{project.builder}</span>
            {project.location ? <span>{project.location}</span> : null}
          </p>
          {description ? (
            <p className="tv-feature-details tv-rise" style={rise(3)}>
              {description}
            </p>
          ) : null}
        </div>

        {!completed && target && daysLeft !== null && daysLeft >= 0 ? (
          <div className="tv-feature-target tv-rise" style={rise(3)}>
            <span className="tv-feature-target-label">Target completion</span>
            <span className="tv-feature-target-date">{target}</span>
            {countdown ? <span className="tv-feature-target-countdown">{countdown}</span> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function ShowcaseTvDisplay({
  settings,
  projects,
  initialSlide = 0,
}: ShowcaseTvDisplayProps) {
  const slides = useMemo(() => buildSlides(projects), [projects]);
  const wonProjects = useMemo(() => projects.filter(isWonJob), [projects]);
  const openBids = useMemo(
    () => projects.filter((project) => project.status === "bidding").length,
    [projects],
  );
  const activeJobs = useMemo(
    () => projects.filter((project) => project.status === "current").length,
    [projects],
  );

  const durationsMs = useMemo(
    () =>
      slides.map(
        (slide) =>
          (slide.kind === "feature"
            ? settings.slideDurationSeconds
            : settings.calendarSlideDurationSeconds) * 1000,
      ),
    [settings.calendarSlideDurationSeconds, settings.slideDurationSeconds, slides],
  );

  const [activeIndex, setActiveIndex] = useState(initialSlide);
  const [visible, setVisible] = useState(true);
  const [now, setNow] = useState(() => new Date());

  const goToSlide = useCallback(
    (direction: "prev" | "next") => {
      if (slides.length <= 1) {
        return;
      }

      setVisible(true);
      setActiveIndex((index) =>
        direction === "next"
          ? (index + 1) % slides.length
          : (index - 1 + slides.length) % slides.length,
      );
    },
    [slides.length],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToSlide("next");
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToSlide("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToSlide]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const durationMs = durationsMs[activeIndex % slides.length];
    const fadeOut = window.setTimeout(() => setVisible(false), durationMs - 600);
    const advance = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
      setVisible(true);
    }, durationMs);

    return () => {
      window.clearTimeout(fadeOut);
      window.clearTimeout(advance);
    };
  }, [activeIndex, durationsMs, slides.length]);

  // Pick up newly published projects without anyone touching the TV.
  useEffect(() => {
    const reload = window.setInterval(() => window.location.reload(), 5 * 60 * 1000);
    return () => window.clearInterval(reload);
  }, []);

  const slideIndex = slides.length > 0 ? activeIndex % slides.length : 0;
  const slide = slides[slideIndex];

  return (
    <div className={`tv-screen tv-screen--${slide?.kind ?? "intro"}`}>
      {/* One continuous video under every slide — full strength on the intro, a dim texture elsewhere */}
      <div className="tv-ambient" aria-hidden>
        <video
          className="tv-ambient-video"
          src={AMBIENT_VIDEO_SRC}
          poster={AMBIENT_VIDEO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      </div>

      <main key={slideIndex} className={`tv-stage${visible ? " tv-stage--visible" : ""}`}>
        {slide?.kind === "intro" ? (
          <IntroSlide projects={wonProjects} />
        ) : slide?.kind === "bids" ? (
          <BidsSlide rows={slide.rows} total={openBids} page={slide.page} pages={slide.pages} now={now} />
        ) : slide?.kind === "jobs" ? (
          <JobsSlide rows={slide.rows} stages={settings.jobStages} total={activeJobs} page={slide.page} pages={slide.pages} now={now} />
        ) : slide?.kind === "calendar" ? (
          <CalendarSlide projects={wonProjects} now={now} />
        ) : slide?.kind === "spotlight" ? (
          <SpotlightSlide group={slide.group} now={now} />
        ) : slide?.kind === "roster" ? (
          <RosterSlide groups={slide.groups} now={now} />
        ) : slide?.kind === "feature" ? (
          <FeatureSlide project={slide.project} durationMs={durationsMs[slideIndex]} />
        ) : null}
      </main>

      <TopBar now={now} />
      <BottomBar activeIndex={slideIndex} durationsMs={durationsMs} />
    </div>
  );
}
