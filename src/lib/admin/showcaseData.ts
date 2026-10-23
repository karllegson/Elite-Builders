import { homeImages } from "@/lib/site/images";
import type { ProjectType } from "@/lib/site/projects";
import { currentProjects } from "@/lib/site/projects";

export type ShowcaseProjectImage = {
  src: string;
  alt: string;
  title: string;
};

/**
 * One list of jobs, mirroring the office whiteboard:
 * bidding (takeoff → sent) → current (awarded, with a work stage) → completed,
 * or a bid ends as lost (declined).
 */
export type ShowcaseStatus = "bidding" | "current" | "completed" | "lost";

/**
 * Stages for an active job, in order — framing, plus siding when it's in scope
 * (framing-only jobs go Sheathing → Punch list). Edit this list to change the dropdown.
 */
export const JOB_STAGES = [
  "Starting",
  "Layout",
  "Walls",
  "Roof",
  "Sheathing",
  "Siding",
  "Punch list",
] as const;

/** How long an awarded or declined bid stays on the TV bids board. */
export const BID_RESULT_VISIBLE_DAYS = 14;

export type ShowcaseProject = {
  id: string;
  name: string;
  location: string;
  builder: string;
  type: ProjectType;
  status: ShowcaseStatus;
  /** Target completion, ISO date YYYY-MM-DD */
  dueDate: string | null;
  /** Date the bid has to be sent, ISO date YYYY-MM-DD */
  bidDueDate: string | null;
  takeoffDone: boolean;
  bidSent: boolean;
  /** When the bid was awarded or declined — null for jobs that never went through bidding here. */
  bidResultAt: string | null;
  /** Current framing stage for an active job (one of JOB_STAGES, or free text) */
  stage: string;
  blurb: string;
  /** Extra detail shown on the lobby TV project slide */
  details: string;
  /** Job-site photo shown on the lobby TV project slide */
  featuredImage: ShowcaseProjectImage | null;
  displayOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ShowcaseSettings = {
  slideDurationSeconds: number;
  calendarSlideDurationSeconds: number;
};

export type ShowcaseStore = {
  version: 1;
  settings: ShowcaseSettings;
  projects: ShowcaseProject[];
};

export type UpsertShowcaseProjectInput = {
  id?: string;
  name: string;
  location: string;
  builder: string;
  type: ProjectType;
  status: ShowcaseStatus;
  dueDate: string | null;
  bidDueDate?: string | null;
  takeoffDone?: boolean;
  bidSent?: boolean;
  bidResultAt?: string | null;
  stage?: string;
  blurb: string;
  details: string;
  featuredImage: ShowcaseProjectImage | null;
  displayOrder: number;
  published: boolean;
};

export function createShowcaseProjectId(): string {
  return `showcase-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function addDaysIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Stand-in job-site photos so the TV looks finished before real ones are uploaded. */
const SAMPLE_PROJECT_IMAGES: ShowcaseProjectImage[] = [
  { ...homeImages.twoStoryHomeFramingExterior, title: "Two-story home framing" },
  { ...homeImages.residentialRoofFraming, title: "Rough framing aerial" },
  { ...homeImages.customHomeFramingCrew, title: "Custom home framing crew" },
  { ...homeImages.commercialRoofFramingAerial, title: "Commercial roof framing" },
  { ...homeImages.residentialWallFramingSky, title: "Residential wall framing" },
  { ...homeImages.customHomeFramingInterior, title: "Custom home framing interior" },
];

export function createDefaultShowcaseStore(): ShowcaseStore {
  const now = new Date().toISOString();

  const projects: ShowcaseProject[] = currentProjects.map((project, index) => ({
    id: project.id,
    name: project.name,
    location: project.location,
    builder: project.builder,
    type: project.type,
    status: project.status,
    dueDate: addDaysIso(14 + index * 21),
    bidDueDate: null,
    takeoffDone: false,
    bidSent: false,
    bidResultAt: null,
    stage: "",
    blurb: project.blurb,
    details: project.blurb,
    featuredImage: SAMPLE_PROJECT_IMAGES[index % SAMPLE_PROJECT_IMAGES.length],
    displayOrder: index,
    published: true,
    createdAt: now,
    updatedAt: now,
  }));

  return {
    version: 1,
    settings: {
      slideDurationSeconds: 12,
      calendarSlideDurationSeconds: 16,
    },
    projects,
  };
}

export function normalizeShowcaseStore(store: ShowcaseStore): ShowcaseStore {
  const settings = store.settings ?? {
    slideDurationSeconds: 12,
    calendarSlideDurationSeconds: 16,
  };

  const projects = Array.isArray(store.projects)
    ? store.projects.map((project, index) => normalizeShowcaseProject(project, index))
    : [];

  return {
    version: 1,
    settings: {
      slideDurationSeconds: Math.max(5, settings.slideDurationSeconds ?? 12),
      calendarSlideDurationSeconds: Math.max(
        5,
        settings.calendarSlideDurationSeconds ?? 16,
      ),
    },
    projects: projects.sort((a, b) => a.displayOrder - b.displayOrder),
  };
}

function normalizeShowcaseImage(
  image: ShowcaseProjectImage | null | undefined,
): ShowcaseProjectImage | null {
  const src = image?.src?.trim();

  if (!src) {
    return null;
  }

  return {
    src,
    alt: image?.alt?.trim() || image?.title?.trim() || "",
    title: image?.title?.trim() || "",
  };
}

function normalizeShowcaseProject(
  project: ShowcaseProject,
  fallbackOrder: number,
): ShowcaseProject {
  const now = new Date().toISOString();

  return {
    id: project.id,
    name: project.name?.trim() || "Untitled Project",
    location: project.location?.trim() || "",
    builder: project.builder?.trim() || "",
    type: project.type ?? "Custom Homes",
    status: project.status ?? "current",
    dueDate: project.dueDate ?? null,
    bidDueDate: project.bidDueDate ?? null,
    takeoffDone: project.takeoffDone ?? false,
    bidSent: project.bidSent ?? false,
    bidResultAt: project.bidResultAt ?? null,
    stage: project.stage?.trim() || "",
    blurb: project.blurb?.trim() || "",
    details: project.details?.trim() || project.blurb?.trim() || "",
    featuredImage: normalizeShowcaseImage(project.featuredImage),
    displayOrder: project.displayOrder ?? fallbackOrder,
    published: project.published ?? true,
    createdAt: project.createdAt ?? now,
    updatedAt: project.updatedAt ?? now,
  };
}

/** Days since an ISO timestamp — Infinity when missing. */
function daysSince(value: string | null): number {
  if (!value) {
    return Infinity;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Infinity : (Date.now() - time) / 86_400_000;
}

/** Bids still open, plus bids awarded or declined recently enough to show the result. */
export function isOnBidsBoard(project: ShowcaseProject): boolean {
  if (project.status === "bidding") {
    return true;
  }

  return (
    (project.status === "current" || project.status === "lost") &&
    daysSince(project.bidResultAt) <= BID_RESULT_VISIBLE_DAYS
  );
}

/** Jobs that are won — the ones the showcase slides and active-jobs board are about. */
export function isWonJob(project: ShowcaseProject): boolean {
  return project.status === "current" || project.status === "completed";
}

export function sortShowcaseProjectsForDisplay(
  projects: ShowcaseProject[],
): ShowcaseProject[] {
  return [...projects].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      const dateCompare = a.dueDate.localeCompare(b.dueDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }
    } else if (a.dueDate) {
      return -1;
    } else if (b.dueDate) {
      return 1;
    }

    return a.displayOrder - b.displayOrder;
  });
}
