"use client";

import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { business } from "@/lib/site/config";
import type { ShowcaseProject, ShowcaseSettings } from "@/lib/admin/showcaseData";

type ShowcaseTvDisplayProps = {
  settings: ShowcaseSettings;
  projects: ShowcaseProject[];
};

type Slide = { kind: "calendar" } | { kind: "project"; project: ShowcaseProject };

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function parseDueDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatLongDate(value: string | null): string {
  const date = parseDueDate(value);

  if (!date) {
    return "To be scheduled";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

function countdownLabel(value: string | null): string {
  const days = daysUntil(value);

  if (days === null) {
    return "TBD";
  }

  if (days < 0) {
    return `${Math.abs(days)} days past`;
  }

  if (days === 0) {
    return "Due today";
  }

  if (days === 1) {
    return "1 day out";
  }

  return `${days} days out`;
}

function formatDeadlineParts(value: string | null): { day: string; month: string } {
  const date = parseDueDate(value);

  if (!date) {
    return { day: "—", month: "TBD" };
  }

  return {
    day: String(date.getDate()),
    month: date.toLocaleDateString("en-US", { month: "short" }),
  };
}

function urgencyTone(days: number | null): "soon" | "mid" | "later" | "tbd" {
  if (days === null) {
    return "tbd";
  }

  if (days <= 21) {
    return "soon";
  }

  if (days <= 60) {
    return "mid";
  }

  return "later";
}

function StatusLabel({ status }: { status: ShowcaseProject["status"] }) {
  const isCurrent = status === "current";

  return (
    <span className={`showcase-status ${isCurrent ? "showcase-status--current" : "showcase-status--completed"}`}>
      {isCurrent ? "In progress" : "Completed"}
    </span>
  );
}

function DeadlineCountdown({ dueDate }: { dueDate: string | null }) {
  const days = daysUntil(dueDate);
  const tone = urgencyTone(days);

  return (
    <span className={`showcase-deadline-countdown showcase-deadline-countdown--${tone}`}>
      {countdownLabel(dueDate)}
    </span>
  );
}

function ShowcaseHeader({ now }: { now: Date }) {
  return (
    <header className="showcase-header">
      <div className="showcase-brand">
        <Image
          src="/logo.png"
          alt=""
          width={96}
          height={96}
          priority
          quality={95}
          className="showcase-brand-logo"
        />
        <div className="showcase-brand-copy">
          <p className="showcase-brand-name">{business.displayName}</p>
          <p className="showcase-brand-tag">{business.slogan}</p>
        </div>
      </div>

      <div className="showcase-clock">
        <p className="showcase-clock-time">
          {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </p>
        <p className="showcase-clock-date">
          {now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </header>
  );
}

function ShowcaseFooter({
  slideCount,
  activeIndex,
}: {
  slideCount: number;
  activeIndex: number;
}) {
  return (
    <footer className="showcase-footer">
      <p className="showcase-footer-meta">
        {business.license} · Licensed &amp; Insured California Contractor
      </p>

      {slideCount > 1 ? (
        <div className="showcase-progress" aria-hidden>
          {Array.from({ length: slideCount }, (_, index) => (
            <span
              key={index}
              className={`showcase-progress-dot ${
                index === activeIndex ? "showcase-progress-dot--active" : ""
              }`}
            />
          ))}
        </div>
      ) : null}

      <p className="showcase-footer-meta showcase-footer-meta--end">{business.phone}</p>
    </footer>
  );
}

function CalendarMonth({ projects, now }: { projects: ShowcaseProject[]; now: Date }) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = now.toLocaleDateString("en-US", { month: "long" });
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();

  const dueByDay = useMemo(() => {
    const map = new Map<number, ShowcaseProject[]>();

    projects.forEach((project) => {
      const date = parseDueDate(project.dueDate);

      if (!date || date.getFullYear() !== year || date.getMonth() !== month) {
        return;
      }

      const day = date.getDate();
      map.set(day, [...(map.get(day) ?? []), project]);
    });

    return map;
  }, [month, projects, year]);

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  return (
    <div className="showcase-calendar">
      <header className="showcase-calendar-head">
        <h2 className="showcase-calendar-month">
          <span className="showcase-calendar-month-name">{monthLabel}</span>
          <span className="showcase-calendar-month-year">{year}</span>
        </h2>
      </header>

      <div className="showcase-calendar-grid">
        <div className="showcase-calendar-weekdays" aria-hidden>
          {WEEKDAYS.map((day) => (
            <span key={day}>{day.slice(0, 1)}</span>
          ))}
        </div>

        <div className="showcase-calendar-days">
          {cells.map((day, index) => {
            if (day === null) {
              return <span key={`pad-${index}`} className="showcase-day showcase-day--empty" />;
            }

            const due = dueByDay.get(day);

            return (
              <span
                key={day}
                className={`showcase-day${day === todayDate ? " showcase-day--today" : ""}${
                  due ? " showcase-day--due" : ""
                }`}
              >
                <span className="showcase-day-number">{day}</span>
                {due ? <span className="showcase-day-marker" aria-hidden /> : null}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CalendarSlide({ projects, now }: { projects: ShowcaseProject[]; now: Date }) {
  const upcoming = projects.slice(0, 5);

  return (
    <section className="showcase-slide showcase-slide--calendar">
      <header className="showcase-slide-intro">
        <p className="showcase-kicker">Project schedule</p>
        <h1 className="showcase-slide-title">
          Active <span className="showcase-title-accent">job sites</span>
        </h1>
        <p className="showcase-slide-lede">
          Target completion dates across current framing projects.
        </p>
      </header>

      <div className="showcase-calendar-layout">
        <CalendarMonth projects={projects} now={now} />

        <div className="showcase-deadlines">
          <h2 className="showcase-section-title">Upcoming deadlines</h2>

          {upcoming.length === 0 ? (
            <p className="showcase-empty">No published projects yet.</p>
          ) : (
            <ul className="showcase-deadline-list">
              {upcoming.map((project) => {
                const parts = formatDeadlineParts(project.dueDate);
                const tone = urgencyTone(daysUntil(project.dueDate));

                return (
                  <li key={project.id} className={`showcase-deadline showcase-deadline--${tone}`}>
                    <time className="showcase-deadline-when" dateTime={project.dueDate ?? undefined}>
                      <span className="showcase-deadline-day">{parts.day}</span>
                      <span className="showcase-deadline-month">{parts.month}</span>
                    </time>

                    <span className="showcase-deadline-copy">
                      <strong>{project.name}</strong>
                      <span>{project.builder}</span>
                    </span>

                    <DeadlineCountdown dueDate={project.dueDate} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ProjectPhoto({ project }: { project: ShowcaseProject }) {
  const photo = project.featuredImage;

  return (
    <figure className="showcase-project-photo">
      <div className="showcase-project-photo-frame">
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt || `${project.name} job site`}
            fill
            sizes="45vw"
            quality={90}
            className="showcase-project-photo-img"
            unoptimized={photo.src.startsWith("blob:")}
          />
        ) : (
          <div className="showcase-photo-placeholder">
            <ImageIcon className="showcase-photo-placeholder-icon" aria-hidden />
            <p className="showcase-photo-placeholder-text">Site photo coming soon</p>
          </div>
        )}
      </div>

      <figcaption className="showcase-project-photo-caption">
        <span className="showcase-photo-caption-copy">
          <span className="showcase-photo-caption-label">Target completion</span>
          <span className="showcase-photo-caption-date">{formatLongDate(project.dueDate)}</span>
        </span>
        <DeadlineCountdown dueDate={project.dueDate} />
      </figcaption>
    </figure>
  );
}

function ProjectSlide({ project }: { project: ShowcaseProject }) {
  return (
    <section className="showcase-slide showcase-slide--project">
      <div className="showcase-project-grid">
        <div className="showcase-project-main">
          <div className="showcase-project-meta">
            <span className="showcase-project-type">{project.type}</span>
            <StatusLabel status={project.status} />
          </div>

          <h1 className="showcase-slide-title showcase-project-title">{project.name}</h1>

          <p className="showcase-project-subline">
            <span className="showcase-project-builder">{project.builder}</span>
            {project.location ? (
              <span className="showcase-project-location">{project.location}</span>
            ) : null}
          </p>

          {project.details || project.blurb ? (
            <p className="showcase-project-details">{project.details || project.blurb}</p>
          ) : null}
        </div>

        <ProjectPhoto project={project} />
      </div>
    </section>
  );
}

export default function ShowcaseTvDisplay({ settings, projects }: ShowcaseTvDisplayProps) {
  const slides = useMemo<Slide[]>(
    () => [
      { kind: "calendar" as const },
      ...projects.map((project) => ({ kind: "project" as const, project })),
    ],
    [projects],
  );

  const [activeIndex, setActiveIndex] = useState(0);
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

    const current = slides[activeIndex % slides.length];
    const durationMs =
      (current.kind === "calendar"
        ? settings.calendarSlideDurationSeconds
        : settings.slideDurationSeconds) * 1000;

    const fadeOut = window.setTimeout(() => setVisible(false), durationMs - 500);
    const advance = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
      setVisible(true);
    }, durationMs);

    return () => {
      window.clearTimeout(fadeOut);
      window.clearTimeout(advance);
    };
  }, [activeIndex, settings.calendarSlideDurationSeconds, settings.slideDurationSeconds, slides]);

  // Pick up newly published projects without anyone touching the TV.
  useEffect(() => {
    const reload = window.setInterval(() => window.location.reload(), 5 * 60 * 1000);
    return () => window.clearInterval(reload);
  }, []);

  const slideIndex = slides.length > 0 ? activeIndex % slides.length : 0;
  const slide = slides[slideIndex];

  return (
    <div className="showcase-screen">
      <div className="showcase-backdrop" aria-hidden />

      <div className="showcase-shell">
        <ShowcaseHeader now={now} />

        <main className={`showcase-stage ${visible ? "showcase-stage--visible" : ""}`}>
          {slide?.kind === "calendar" ? (
            <CalendarSlide projects={projects} now={now} />
          ) : slide?.kind === "project" ? (
            <ProjectSlide project={slide.project} />
          ) : (
            <section className="showcase-slide showcase-slide--empty">
              <p className="showcase-empty">
                Add projects in the admin dashboard to populate this display.
              </p>
            </section>
          )}
        </main>

        <ShowcaseFooter slideCount={slides.length} activeIndex={slideIndex} />
      </div>
    </div>
  );
}
