"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import {
  addJobAction,
  deleteJobAction,
  logoutAction,
  saveStagesAction,
  updateJobAction,
  type NewJobInput,
} from "@/app/dashboard/actions";
import type { ShowcaseJobPatch } from "@/lib/admin/showcase.server";
import { isOnBidsBoard, type ShowcaseProject } from "@/lib/admin/showcaseData";

type Tab = "bids" | "active" | "done";

function parseDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value: string | null): string {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
}

/** Office-facing countdown — unlike the lobby TV, late is worth saying here. */
function relativeDay(value: string | null): { label: string; tone: "late" | "soon" | "" } | null {
  const date = parseDate(value);

  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const days = Math.round((date.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) {
    return { label: `${-days}d late`, tone: "late" };
  }

  if (days === 0) {
    return { label: "Today", tone: "soon" };
  }

  return { label: days === 1 ? "Tomorrow" : `In ${days}d`, tone: days <= 3 ? "soon" : "" };
}

function byDate(key: "bidDueDate" | "dueDate") {
  return (a: ShowcaseProject, b: ShowcaseProject) => {
    const left = a[key] ?? "9999";
    const right = b[key] ?? "9999";
    return left.localeCompare(right) || a.name.localeCompare(b.name);
  };
}

const EMPTY_NEW_JOB: Omit<NewJobInput, "status"> = {
  name: "",
  location: "",
  builder: "",
  bidDueDate: null,
  dueDate: null,
};

export default function JobsBoard({
  initialJobs,
  initialStages,
}: {
  initialJobs: ShowcaseProject[];
  initialStages: string[];
}) {
  const [jobs, setJobs] = useState(initialJobs);
  const [stages, setStages] = useState(initialStages);
  const [editingStages, setEditingStages] = useState(false);
  const [tab, setTab] = useState<Tab>("bids");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Open bids first by due date, then recent results.
  const bids = useMemo(
    () =>
      jobs
        .filter(isOnBidsBoard)
        .sort(
          (a, b) =>
            Number(a.status !== "bidding") - Number(b.status !== "bidding") ||
            byDate("bidDueDate")(a, b),
        ),
    [jobs],
  );
  const active = useMemo(
    () => jobs.filter((job) => job.status === "current").sort(byDate("dueDate")),
    [jobs],
  );
  const done = useMemo(
    () =>
      jobs
        .filter((job) => job.status === "completed" || job.status === "lost")
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [jobs],
  );

  const replaceJob = (job: ShowcaseProject) =>
    setJobs((list) => list.map((item) => (item.id === job.id ? job : item)));

  /** Optimistic: show the change now, roll back if the save fails. */
  const update = (job: ShowcaseProject, patch: ShowcaseJobPatch) => {
    setError(null);
    replaceJob({ ...job, ...patch });

    startTransition(async () => {
      const result = await updateJobAction(job.id, patch);

      if (result.job) {
        replaceJob(result.job);
      } else {
        replaceJob(job);
        setError(result.error ?? "Could not save the change.");
      }
    });
  };

  const add = (input: NewJobInput) => {
    setError(null);

    startTransition(async () => {
      const result = await addJobAction(input);

      if (result.job) {
        setJobs((list) => [...list, result.job as ShowcaseProject]);
        setAdding(false);
      } else {
        setError(result.error ?? "Could not add the job.");
      }
    });
  };

  const remove = (job: ShowcaseProject) => {
    if (!window.confirm(`Delete “${job.name}”? This can't be undone.`)) {
      return;
    }

    setError(null);
    setJobs((list) => list.filter((item) => item.id !== job.id));

    startTransition(async () => {
      const result = await deleteJobAction(job.id);

      if (result.error) {
        setJobs((list) => [...list, job]);
        setError(result.error);
      }
    });
  };

  const saveStages = (next: string[]) => {
    setError(null);

    startTransition(async () => {
      const result = await saveStagesAction(next);

      if (result.stages) {
        setStages(result.stages);
        setEditingStages(false);
      } else {
        setError(result.error ?? "Could not save the stages.");
      }
    });
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "bids", label: "Bids", count: bids.filter((job) => job.status === "bidding").length },
    { key: "active", label: "Active jobs", count: active.length },
    { key: "done", label: "Done", count: done.length },
  ];

  const rowProps = {
    editingId,
    onEdit: (id: string | null) => setEditingId(id),
    onUpdate: update,
    onDelete: remove,
  };

  return (
    <div className="db-shell">
      <header className="db-header">
        <div className="db-brand">
          <Image src="/logo.png" alt="" width={40} height={40} />
          <div>
            <h1>Jobs Board</h1>
            <p>Changes show on the lobby TV within a few minutes.</p>
          </div>
        </div>
        <div className="db-header-actions">
          <a href="/showcase" target="_blank" rel="noreferrer" className="db-btn db-btn--ghost">
            View TV ↗
          </a>
          <form action={logoutAction}>
            <button type="submit" className="db-btn db-btn--ghost">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <nav className="db-tabs" aria-label="Job lists">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`db-tab${tab === item.key ? " db-tab--active" : ""}`}
            onClick={() => {
              setTab(item.key);
              setAdding(false);
              setEditingStages(false);
              setEditingId(null);
            }}
          >
            {item.label}
            <span className="db-tab-count">{item.count}</span>
          </button>
        ))}
      </nav>

      {error ? (
        <p className="db-error db-banner" role="alert">
          {error}
        </p>
      ) : null}

      <main className="db-main">
        {tab !== "done" && !adding && !editingStages ? (
          <div className="db-toolbar">
            <button type="button" className="db-btn db-btn--primary" onClick={() => setAdding(true)}>
              + {tab === "bids" ? "Add bid" : "Add active job"}
            </button>
            {tab === "active" ? (
              <button
                type="button"
                className="db-btn db-btn--ghost"
                onClick={() => setEditingStages(true)}
              >
                Edit stages
              </button>
            ) : null}
          </div>
        ) : null}

        {adding ? (
          <NewJobForm
            kind={tab === "bids" ? "bidding" : "current"}
            onCancel={() => setAdding(false)}
            onSubmit={add}
          />
        ) : null}

        {editingStages ? (
          <StagesEditor
            stages={stages}
            onCancel={() => setEditingStages(false)}
            onSave={saveStages}
          />
        ) : null}

        {tab === "bids" ? (
          <JobList empty="No bids on the board.">
            {bids.map((job) => (
              <BidRow key={job.id} job={job} {...rowProps} />
            ))}
          </JobList>
        ) : tab === "active" ? (
          <JobList empty="No active jobs.">
            {active.map((job) => (
              <ActiveRow key={job.id} job={job} stages={stages} {...rowProps} />
            ))}
          </JobList>
        ) : (
          <JobList empty="Nothing finished yet.">
            {done.map((job) => (
              <DoneRow key={job.id} job={job} {...rowProps} />
            ))}
          </JobList>
        )}
      </main>
    </div>
  );
}

type RowProps = {
  job: ShowcaseProject;
  editingId: string | null;
  onEdit: (id: string | null) => void;
  onUpdate: (job: ShowcaseProject, patch: ShowcaseJobPatch) => void;
  onDelete: (job: ShowcaseProject) => void;
};

function JobList({ empty, children }: { empty: string; children: React.ReactNode[] }) {
  return children.length > 0 ? (
    <ul className="db-list">{children}</ul>
  ) : (
    <p className="db-empty">{empty}</p>
  );
}

function JobTitle({ job }: { job: ShowcaseProject }) {
  return (
    <div className="db-job-title">
      <strong>{job.name}</strong>
      <span>{[job.location, job.builder].filter(Boolean).join(" · ") || "—"}</span>
    </div>
  );
}

function DueChip({
  label,
  value,
  countdown = true,
}: {
  label: string;
  value: string | null;
  countdown?: boolean;
}) {
  const relative = countdown ? relativeDay(value) : null;

  return (
    <div className="db-due">
      <span className="db-due-label">{label}</span>
      <span className="db-due-date">{formatDate(value)}</span>
      {relative ? (
        <span className={`db-due-rel${relative.tone ? ` db-due-rel--${relative.tone}` : ""}`}>
          {relative.label}
        </span>
      ) : null}
    </div>
  );
}

function Check({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={`db-check${checked ? " db-check--on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="db-check-box" aria-hidden>
        {checked ? "✓" : ""}
      </span>
      {label}
    </button>
  );
}

function BidRow({ job, editingId, onEdit, onUpdate, onDelete }: RowProps) {
  const resolved = job.status !== "bidding";

  return (
    <li className={`db-row${resolved ? " db-row--resolved" : ""}`}>
      <div className="db-row-main">
        <JobTitle job={job} />
        <DueChip label="Bid due" value={job.bidDueDate} countdown={!resolved} />

        <div className="db-row-steps">
          {resolved ? (
            <>
              <span className={`db-badge db-badge--${job.status === "lost" ? "lost" : "won"}`}>
                {job.status === "lost" ? "Declined" : "Awarded"}
              </span>
              <button
                type="button"
                className="db-link"
                onClick={() => onUpdate(job, { status: "bidding" })}
              >
                Undo
              </button>
            </>
          ) : (
            <>
              <Check
                checked={job.takeoffDone}
                label="Takeoff"
                onChange={(value) => onUpdate(job, { takeoffDone: value })}
              />
              <Check
                checked={job.bidSent}
                label="Sent"
                onChange={(value) => onUpdate(job, { bidSent: value })}
              />
              <span className="db-row-result">
                <button
                  type="button"
                  className="db-btn db-btn--won"
                  onClick={() => onUpdate(job, { status: "current" })}
                >
                  Awarded
                </button>
                <button
                  type="button"
                  className="db-btn db-btn--lost"
                  onClick={() => onUpdate(job, { status: "lost" })}
                >
                  Declined
                </button>
              </span>
            </>
          )}
        </div>

        <EditToggle job={job} editingId={editingId} onEdit={onEdit} />
      </div>

      {editingId === job.id ? (
        <JobEditor job={job} dateKey="bidDueDate" onUpdate={onUpdate} onDelete={onDelete} onClose={() => onEdit(null)} />
      ) : null}
    </li>
  );
}

function ActiveRow({
  job,
  stages: stageList,
  editingId,
  onEdit,
  onUpdate,
  onDelete,
}: RowProps & { stages: string[] }) {
  // Keep a since-removed stage selectable so the job doesn't silently change.
  const stages = job.stage && !stageList.includes(job.stage) ? [...stageList, job.stage] : stageList;

  return (
    <li className="db-row">
      <div className="db-row-main">
        <JobTitle job={job} />
        <DueChip label="Target" value={job.dueDate} />

        <div className="db-row-steps">
          <label className="db-stage">
            <span>Stage</span>
            <select value={job.stage} onChange={(event) => onUpdate(job, { stage: event.target.value })}>
              {job.stage ? null : <option value="">—</option>}
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="db-btn db-btn--won"
            onClick={() => onUpdate(job, { status: "completed" })}
          >
            Complete
          </button>
        </div>

        <EditToggle job={job} editingId={editingId} onEdit={onEdit} />
      </div>

      {editingId === job.id ? (
        <JobEditor job={job} dateKey="dueDate" onUpdate={onUpdate} onDelete={onDelete} onClose={() => onEdit(null)} />
      ) : null}
    </li>
  );
}

function DoneRow({ job, editingId, onEdit, onUpdate, onDelete }: RowProps) {
  const lost = job.status === "lost";

  return (
    <li className="db-row db-row--resolved">
      <div className="db-row-main">
        <JobTitle job={job} />
        <div className="db-due">
          <span className="db-due-label">Updated</span>
          <span className="db-due-date">{formatDate(job.updatedAt.slice(0, 10))}</span>
        </div>

        <div className="db-row-steps">
          <span className={`db-badge db-badge--${lost ? "lost" : "won"}`}>
            {lost ? "Bid declined" : "Completed"}
          </span>
          <button
            type="button"
            className="db-link"
            onClick={() => onUpdate(job, { status: lost ? "bidding" : "current" })}
          >
            {lost ? "Back to bids" : "Back to active"}
          </button>
        </div>

        <EditToggle job={job} editingId={editingId} onEdit={onEdit} />
      </div>

      {editingId === job.id ? (
        <JobEditor
          job={job}
          dateKey={lost ? "bidDueDate" : "dueDate"}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={() => onEdit(null)}
        />
      ) : null}
    </li>
  );
}

function EditToggle({
  job,
  editingId,
  onEdit,
}: Pick<RowProps, "job" | "editingId" | "onEdit">) {
  const open = editingId === job.id;

  return (
    <button
      type="button"
      className="db-btn db-btn--ghost db-edit-toggle"
      aria-expanded={open}
      onClick={() => onEdit(open ? null : job.id)}
    >
      {open ? "Close" : "Edit"}
    </button>
  );
}

function JobEditor({
  job,
  dateKey,
  onUpdate,
  onDelete,
  onClose,
}: {
  job: ShowcaseProject;
  dateKey: "bidDueDate" | "dueDate";
  onUpdate: RowProps["onUpdate"];
  onDelete: RowProps["onDelete"];
  onClose: () => void;
}) {
  const [name, setName] = useState(job.name);
  const [location, setLocation] = useState(job.location);
  const [builder, setBuilder] = useState(job.builder);
  const [date, setDate] = useState(job[dateKey] ?? "");
  const [published, setPublished] = useState(job.published);

  return (
    <form
      className="db-editor"
      onSubmit={(event) => {
        event.preventDefault();
        onUpdate(job, { name, location, builder, [dateKey]: date || null, published });
        onClose();
      }}
    >
      <JobFields
        name={name}
        location={location}
        builder={builder}
        date={date}
        dateLabel={dateKey === "bidDueDate" ? "Bid due" : "Target completion"}
        onName={setName}
        onLocation={setLocation}
        onBuilder={setBuilder}
        onDate={setDate}
      />
      <label className="db-toggle">
        <input
          type="checkbox"
          checked={published}
          onChange={(event) => setPublished(event.target.checked)}
        />
        Show on lobby TV
      </label>
      <div className="db-editor-actions">
        <button type="button" className="db-link db-link--danger" onClick={() => onDelete(job)}>
          Delete job
        </button>
        <button type="button" className="db-btn db-btn--ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="db-btn db-btn--primary">
          Save
        </button>
      </div>
    </form>
  );
}

function StagesEditor({
  stages,
  onCancel,
  onSave,
}: {
  stages: string[];
  onCancel: () => void;
  onSave: (stages: string[]) => void;
}) {
  const [draft, setDraft] = useState(stages);

  const move = (index: number, offset: number) => {
    const next = [...draft];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item);
    setDraft(next);
  };

  return (
    <form
      className="db-editor db-editor--new"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(draft);
      }}
    >
      <h2>Job stages</h2>
      <p className="db-hint">
        In order, first to last. New and newly awarded jobs start on the first one. The TV shows
        progress along this list.
      </p>
      <ol className="db-stage-list">
        {draft.map((stage, index) => (
          <li key={index}>
            <span className="db-stage-num">{index + 1}</span>
            <input
              value={stage}
              aria-label={`Stage ${index + 1}`}
              onChange={(event) =>
                setDraft(draft.map((item, position) => (position === index ? event.target.value : item)))
              }
            />
            <button
              type="button"
              className="db-icon-btn"
              aria-label="Move up"
              disabled={index === 0}
              onClick={() => move(index, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              className="db-icon-btn"
              aria-label="Move down"
              disabled={index === draft.length - 1}
              onClick={() => move(index, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              className="db-icon-btn db-icon-btn--danger"
              aria-label="Remove stage"
              disabled={draft.length === 1}
              onClick={() => setDraft(draft.filter((_, position) => position !== index))}
            >
              ✕
            </button>
          </li>
        ))}
      </ol>
      <div className="db-editor-actions">
        <button type="button" className="db-link db-link--push" onClick={() => setDraft([...draft, ""])}>
          + Add stage
        </button>
        <button type="button" className="db-btn db-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="db-btn db-btn--primary">
          Save stages
        </button>
      </div>
    </form>
  );
}

function JobFields(props: {
  name: string;
  location: string;
  builder: string;
  date: string;
  dateLabel: string;
  onName: (value: string) => void;
  onLocation: (value: string) => void;
  onBuilder: (value: string) => void;
  onDate: (value: string) => void;
}) {
  return (
    <div className="db-fields">
      <label className="db-field db-field--wide">
        <span>Job name</span>
        <input
          value={props.name}
          onChange={(event) => props.onName(event.target.value)}
          placeholder="2181 Camino de los Robles"
          required
        />
      </label>
      <label className="db-field">
        <span>City</span>
        <input
          value={props.location}
          onChange={(event) => props.onLocation(event.target.value)}
          placeholder="Menlo Park"
        />
      </label>
      <label className="db-field">
        <span>Developer</span>
        <input
          value={props.builder}
          onChange={(event) => props.onBuilder(event.target.value)}
          placeholder="TJH"
        />
      </label>
      <label className="db-field">
        <span>{props.dateLabel}</span>
        <input type="date" value={props.date} onChange={(event) => props.onDate(event.target.value)} />
      </label>
    </div>
  );
}

function NewJobForm({
  kind,
  onCancel,
  onSubmit,
}: {
  kind: NewJobInput["status"];
  onCancel: () => void;
  onSubmit: (input: NewJobInput) => void;
}) {
  const [draft, setDraft] = useState(EMPTY_NEW_JOB);
  const [date, setDate] = useState("");
  const isBid = kind === "bidding";

  return (
    <form
      className="db-editor db-editor--new"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit({
          ...draft,
          status: kind,
          bidDueDate: isBid ? date || null : null,
          dueDate: isBid ? null : date || null,
        });
      }}
    >
      <h2>{isBid ? "New bid" : "New active job"}</h2>
      <JobFields
        name={draft.name}
        location={draft.location}
        builder={draft.builder}
        date={date}
        dateLabel={isBid ? "Bid due" : "Target completion"}
        onName={(name) => setDraft({ ...draft, name })}
        onLocation={(location) => setDraft({ ...draft, location })}
        onBuilder={(builder) => setDraft({ ...draft, builder })}
        onDate={setDate}
      />
      <div className="db-editor-actions">
        <button type="button" className="db-btn db-btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="db-btn db-btn--primary">
          {isBid ? "Add bid" : "Add job"}
        </button>
      </div>
    </form>
  );
}
