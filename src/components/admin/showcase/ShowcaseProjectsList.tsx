"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  deleteShowcaseProjectsAction,
  fetchShowcaseProjectsAction,
  saveShowcaseSettingsAction,
} from "@/app/admin/(shell)/showcase/actions";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import type {
  ShowcaseProject,
  ShowcaseSettings,
  ShowcaseStatus,
} from "@/lib/admin/showcaseData";

const STATUS_LABELS: Record<ShowcaseStatus, string> = {
  bidding: "Bidding",
  current: "In Progress",
  completed: "Completed",
  lost: "Bid declined",
};

function formatDueDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ShowcaseProjectsList() {
  const toast = useAdminToast();
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [settings, setSettings] = useState<ShowcaseSettings>({
    slideDurationSeconds: 12,
    calendarSlideDurationSeconds: 16,
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadProjects = async () => {
    const result = await fetchShowcaseProjectsAction();

    if (result.error) {
      toast.error(result.error);
    }

    setProjects(result.projects);
    setSettings(result.settings);
    setLoading(false);
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("Select at least one project to delete.");
      return;
    }

    startTransition(async () => {
      const result = await deleteShowcaseProjectsAction(selectedIds);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Project(s) deleted.");
      setSelectedIds([]);
      await loadProjects();
    });
  };

  const handleSaveSettings = () => {
    startTransition(async () => {
      const result = await saveShowcaseSettingsAction(settings);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.settings) {
        setSettings(result.settings);
      }

      toast.success("Showcase settings saved.");
    });
  };

  if (loading) {
    return <p className="admin-post-editor-status">Loading showcase projects…</p>;
  }

  return (
    <div className="admin-showcase-list">
      <div className="admin-showcase-settings">
        <h2 className="admin-showcase-settings-title">Lobby TV Settings</h2>
        <p className="admin-showcase-settings-help">
          Display URL:{" "}
          <a href="/showcase" target="_blank" rel="noreferrer">
            /showcase
          </a>{" "}
          — open fullscreen on your lobby TV.
        </p>
        <div className="admin-showcase-settings-grid">
          <label className="admin-showcase-field">
            <span>Project slide duration (seconds)</span>
            <input
              type="number"
              min={5}
              max={120}
              value={settings.slideDurationSeconds}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  slideDurationSeconds: Number(event.target.value) || 12,
                }))
              }
            />
          </label>
          <label className="admin-showcase-field">
            <span>Calendar slide duration (seconds)</span>
            <input
              type="number"
              min={5}
              max={120}
              value={settings.calendarSlideDurationSeconds}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  calendarSlideDurationSeconds: Number(event.target.value) || 16,
                }))
              }
            />
          </label>
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          disabled={isPending}
          onClick={handleSaveSettings}
        >
          Save TV Settings
        </button>
      </div>

      <div className="admin-posts-tablenav admin-posts-tablenav-top">
        <div className="admin-posts-tablenav-actions">
          <button
            type="button"
            className="admin-btn-secondary admin-posts-apply-btn"
            disabled={isPending || selectedIds.length === 0}
            onClick={handleDelete}
          >
            Delete Selected
          </button>
        </div>
        <div className="admin-posts-pagination">
          <span className="admin-posts-pagination-count">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>
      </div>

      <table className="admin-posts-table">
        <thead>
          <tr>
            <th className="admin-posts-col-check">
              <span className="screen-reader-text">Select</span>
            </th>
            <th>Project</th>
            <th>Builder</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <p className="admin-post-editor-status">No showcase projects yet.</p>
              </td>
            </tr>
          ) : (
            projects.map((project) => (
              <tr key={project.id}>
                <td className="admin-posts-col-check">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(project.id)}
                    onChange={() => toggleSelected(project.id)}
                    aria-label={`Select ${project.name}`}
                  />
                </td>
                <td>
                  <Link href={`/admin/showcase/${project.id}`} className="admin-post-title-link">
                    <strong>{project.name}</strong>
                  </Link>
                  <div className="admin-post-row-meta">{project.location}</div>
                </td>
                <td>{project.builder}</td>
                <td>{formatDueDate(project.dueDate)}</td>
                <td>{STATUS_LABELS[project.status]}</td>
                <td>{project.published ? "Yes" : "No"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
