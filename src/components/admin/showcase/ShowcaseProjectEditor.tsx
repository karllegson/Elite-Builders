"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchShowcaseProjectForEditAction,
  saveShowcaseProjectAction,
} from "@/app/admin/(shell)/showcase/actions";
import { FeaturedImageModal } from "@/components/admin/posts/FeaturedImageModal";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import type { MediaAttachment } from "@/lib/admin/mediaLibrary";
import type { ShowcaseProjectImage } from "@/lib/admin/showcaseData";
import type { ProjectStatus, ProjectType } from "@/lib/site/projects";

const PROJECT_TYPES: ProjectType[] = [
  "Apartments",
  "Condominiums",
  "Custom Homes",
  "Production Homes",
  "Multi-Family",
];

type ShowcaseProjectEditorProps = {
  projectId?: string;
};

function toShowcaseImage(image: MediaAttachment): ShowcaseProjectImage {
  return {
    src: image.src,
    alt: image.alt || image.title,
    title: image.title,
  };
}

export function ShowcaseProjectEditor({ projectId }: ShowcaseProjectEditorProps) {
  const toast = useAdminToast();
  const router = useRouter();
  const isEditing = Boolean(projectId);
  const [loaded, setLoaded] = useState(!isEditing);
  const [missing, setMissing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [recordId, setRecordId] = useState<string | undefined>(projectId);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [builder, setBuilder] = useState("");
  const [type, setType] = useState<ProjectType>("Custom Homes");
  const [status, setStatus] = useState<ProjectStatus>("current");
  const [dueDate, setDueDate] = useState("");
  const [blurb, setBlurb] = useState("");
  const [details, setDetails] = useState("");
  const [featuredImage, setFeaturedImage] = useState<ShowcaseProjectImage | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [published, setPublished] = useState(true);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    void (async () => {
      const result = await fetchShowcaseProjectForEditAction(projectId);

      if (!result.project) {
        setMissing(true);
        setLoaded(true);
        return;
      }

      const project = result.project;
      setName(project.name);
      setLocation(project.location);
      setBuilder(project.builder);
      setType(project.type);
      setStatus(project.status);
      setDueDate(project.dueDate ?? "");
      setBlurb(project.blurb);
      setDetails(project.details);
      setFeaturedImage(project.featuredImage);
      setDisplayOrder(project.displayOrder);
      setPublished(project.published);
      setLoaded(true);
    })();
  }, [projectId]);

  const persistProject = async () => {
    if (!name.trim()) {
      toast.error("Project name is required.");
      return;
    }

    setIsSaving(true);

    const result = await saveShowcaseProjectAction({
      id: recordId,
      name,
      location,
      builder,
      type,
      status,
      dueDate: dueDate || null,
      blurb,
      details,
      featuredImage,
      displayOrder,
      published,
    });

    setIsSaving(false);

    if (result.error || !result.project) {
      toast.error(result.error ?? "Could not save project.");
      return;
    }

    if (!recordId) {
      setRecordId(result.project.id);
      router.replace(`/admin/showcase/${result.project.id}`);
    }

    toast.success(isEditing ? "Project updated." : "Project added.");
  };

  if (!loaded) {
    return <p className="admin-post-editor-status">Loading project…</p>;
  }

  if (missing) {
    return (
      <div className="admin-post-editor">
        <p className="admin-categories-status-message admin-post-editor-status" role="status">
          Project not found. <Link href="/admin/showcase">Return to showcase</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-post-editor">
      <div className="admin-post-editor-main">
        <label className="admin-post-title-label" htmlFor="showcase-name">
          {isEditing ? "Edit project" : "Add project"}
        </label>
        <input
          id="showcase-name"
          type="text"
          className="admin-post-title"
          placeholder="Project name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <div className="admin-showcase-editor-grid">
          <label className="admin-showcase-field">
            <span>Location</span>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
          <label className="admin-showcase-field">
            <span>Builder / GC</span>
            <input
              type="text"
              value={builder}
              onChange={(event) => setBuilder(event.target.value)}
            />
          </label>
          <label className="admin-showcase-field">
            <span>Project type</span>
            <select value={type} onChange={(event) => setType(event.target.value as ProjectType)}>
              {PROJECT_TYPES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-showcase-field">
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ProjectStatus)}
            >
              <option value="current">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label className="admin-showcase-field">
            <span>Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
          <label className="admin-showcase-field">
            <span>Display order</span>
            <input
              type="number"
              min={0}
              value={displayOrder}
              onChange={(event) => setDisplayOrder(Number(event.target.value) || 0)}
            />
          </label>
        </div>

        <label className="admin-showcase-field admin-showcase-field--full" htmlFor="showcase-blurb">
          <span>Short summary (calendar)</span>
          <textarea
            id="showcase-blurb"
            rows={3}
            value={blurb}
            onChange={(event) => setBlurb(event.target.value)}
          />
        </label>

        <label
          className="admin-showcase-field admin-showcase-field--full"
          htmlFor="showcase-details"
        >
          <span>Project details (TV slide)</span>
          <textarea
            id="showcase-details"
            rows={6}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
        </label>

        <label className="admin-showcase-checkbox">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
          />
          <span>Show on lobby TV</span>
        </label>
      </div>

      <div className="admin-post-editor-sidebar">
        <div className="admin-post-publish-box">
          <h2 className="admin-post-publish-title">Publish</h2>
          <button
            type="button"
            className="admin-btn-primary admin-post-publish-btn"
            disabled={isSaving}
            onClick={() => void persistProject()}
          >
            {isSaving ? "Saving…" : isEditing ? "Update Project" : "Add Project"}
          </button>
        </div>

        <div className="admin-metabox">
          <div className="admin-metabox-header">
            <h2>Job site photo</h2>
          </div>
          <div className="admin-metabox-body">
            {featuredImage ? (
              <div className="admin-featured-image-preview">
                <Image
                  src={featuredImage.src}
                  alt={featuredImage.alt || featuredImage.title}
                  width={260}
                  height={180}
                  className="admin-featured-image-thumb"
                  unoptimized={featuredImage.src.startsWith("blob:")}
                />
                <div className="admin-featured-image-actions">
                  <button
                    type="button"
                    className="admin-inline-link"
                    onClick={() => setImageModalOpen(true)}
                  >
                    Replace photo
                  </button>
                  <button
                    type="button"
                    className="admin-inline-link admin-media-delete-link"
                    onClick={() => setFeaturedImage(null)}
                  >
                    Remove photo
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="admin-showcase-hint">
                  Shown beside the project details on the lobby TV. Landscape photos
                  work best.
                </p>
                <button
                  type="button"
                  className="admin-inline-link"
                  onClick={() => setImageModalOpen(true)}
                >
                  Set job site photo
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <FeaturedImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSetFeaturedImage={(image) => setFeaturedImage(toShowcaseImage(image))}
      />
    </div>
  );
}
