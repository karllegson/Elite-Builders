"use client";

import { BarChart2, Calendar, Eye, KeyRound } from "lucide-react";
import { useEffect, useMemo, useState, type MutableRefObject } from "react";
import { useAdminToast } from "@/components/admin/toast/useAdminToast";
import type { PostSeoSnippet } from "@/lib/admin/postSeo";
import {
  buildPublishDate,
  calculateSeoScore,
  createDefaultPublishSettings,
  formatPublishScheduleLabel,
  formatStatusLabel,
  formatVisibilityLabel,
  getSeoScoreTone,
  MONTH_OPTIONS,
  padTwo,
  POST_STATUS_OPTIONS,
  type PostStatus,
  type PostVisibility,
  type PublishEditPanel,
  type PublishSettings,
} from "@/lib/admin/postPublish";

type PublishMetaboxProps = {
  postTitle?: string;
  postContent?: string;
  seoSnippet?: PostSeoSnippet;
  hasFeaturedImage?: boolean;
  previewHref?: string;
  initialSettings?: PublishSettings;
  publishSettingsRef?: MutableRefObject<PublishSettings | null>;
  onSettingsChange?: (settings: PublishSettings) => void;
  onPublish?: () => void;
  onSaveDraft?: () => void;
  onMoveToTrash?: () => void;
  primaryActionLabel?: string;
};

type PublishDateDraft = {
  month: number;
  day: string;
  year: string;
  hour: string;
  minute: string;
};

function dateToDraft(date: Date): PublishDateDraft {
  return {
    month: date.getMonth(),
    day: String(date.getDate()),
    year: String(date.getFullYear()),
    hour: padTwo(date.getHours()),
    minute: padTwo(date.getMinutes()),
  };
}

export function PublishMetabox({
  postTitle = "",
  postContent = "",
  seoSnippet = { seoTitle: "", permalink: "", metaDescription: "" },
  hasFeaturedImage = false,
  previewHref = "/blog",
  initialSettings,
  publishSettingsRef,
  onSettingsChange,
  onPublish,
  onSaveDraft,
  onMoveToTrash,
  primaryActionLabel = "Publish",
}: PublishMetaboxProps) {
  const toast = useAdminToast();
  const [settings, setSettings] = useState<PublishSettings>(
    () => initialSettings ?? createDefaultPublishSettings(),
  );
  const [activePanel, setActivePanel] = useState<PublishEditPanel>(null);
  const [statusDraft, setStatusDraft] = useState<PostStatus>("draft");
  const [visibilityDraft, setVisibilityDraft] = useState<PostVisibility>("public");
  const [passwordDraft, setPasswordDraft] = useState("");
  const [stickDraft, setStickDraft] = useState(false);
  const [publishDateDraft, setPublishDateDraft] = useState<PublishDateDraft>(() =>
    dateToDraft(new Date()),
  );

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    publishSettingsRef && (publishSettingsRef.current = settings);
    onSettingsChange?.(settings);
  }, [onSettingsChange, publishSettingsRef, settings]);

  const updateSettings = (updater: (current: PublishSettings) => PublishSettings) => {
    setSettings(updater);
  };

  const seoScore = useMemo(
    () =>
      calculateSeoScore({
        postTitle,
        postContent,
        seoTitle: seoSnippet.seoTitle,
        permalink: seoSnippet.permalink,
        metaDescription: seoSnippet.metaDescription,
        hasFeaturedImage,
      }),
    [hasFeaturedImage, postContent, postTitle, seoSnippet],
  );

  const seoTone = getSeoScoreTone(seoScore);
  const publishLabel = formatPublishScheduleLabel(settings.publishDate);

  const openPanel = (panel: PublishEditPanel) => {
    if (panel === "status") {
      setStatusDraft(settings.status);
    }

    if (panel === "visibility") {
      setVisibilityDraft(settings.visibility);
      setPasswordDraft(settings.password);
      setStickDraft(settings.stickToFrontPage);
    }

    if (panel === "publish") {
      setPublishDateDraft(dateToDraft(settings.publishDate));
    }

    setActivePanel(panel);
  };

  const closePanel = () => {
    setActivePanel(null);
  };

  const applyStatus = () => {
    updateSettings((current) => ({ ...current, status: statusDraft }));
    closePanel();
  };

  const applyVisibility = () => {
    updateSettings((current) => ({
      ...current,
      visibility: visibilityDraft,
      password: visibilityDraft === "password" ? passwordDraft : "",
      stickToFrontPage: visibilityDraft === "public" ? stickDraft : false,
    }));
    closePanel();
  };

  const applyPublishDate = () => {
    const day = Number.parseInt(publishDateDraft.day, 10);
    const year = Number.parseInt(publishDateDraft.year, 10);
    const hour = Number.parseInt(publishDateDraft.hour, 10);
    const minute = Number.parseInt(publishDateDraft.minute, 10);

    if (
      Number.isNaN(day) ||
      Number.isNaN(year) ||
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      day < 1 ||
      day > 31
    ) {
      return;
    }

    updateSettings((current) => ({
      ...current,
      publishDate: buildPublishDate(
        publishDateDraft.month,
        day,
        year,
        hour,
        minute,
      ),
    }));
    closePanel();
  };

  const handlePublish = () => {
    const next: PublishSettings = {
      ...settings,
      status: "published",
      publishDate:
        settings.publishDate.getTime() <= Date.now()
          ? settings.publishDate
          : new Date(),
    };

    publishSettingsRef && (publishSettingsRef.current = next);
    updateSettings(() => next);
    onPublish?.();
  };

  const handleSaveDraft = () => {
    const next: PublishSettings = { ...settings, status: "draft" };
    publishSettingsRef && (publishSettingsRef.current = next);
    updateSettings(() => next);
    onSaveDraft?.();
  };

  const handleMoveToTrash = () => {
    onMoveToTrash?.();
  };

  const handleSyncExternal = () => {
    toast.info("External sync is not connected yet.");
  };

  return (
    <div className="admin-metabox">
      <div className="admin-metabox-header">
        <span>Publish</span>
        <span className="admin-metabox-toggle" aria-hidden>
          ▲
        </span>
      </div>
      <div className="admin-metabox-body">
        <div className="admin-publish-actions">
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() =>
              window.open(previewHref, "_blank", "noopener,noreferrer")
            }
          >
            Preview
          </button>
        </div>

        <ul className="admin-publish-meta">
          <li className={activePanel === "status" ? "is-editing" : ""}>
            <div className="admin-publish-meta-row">
              <KeyRound size={16} strokeWidth={1.75} aria-hidden />
              <span>
                Status: <strong>{formatStatusLabel(settings.status)}</strong>
              </span>
              {activePanel !== "status" ? (
                <button
                  type="button"
                  className="admin-inline-link"
                  onClick={() => openPanel("status")}
                >
                  Edit
                </button>
              ) : null}
            </div>
            {activePanel === "status" ? (
              <div className="admin-publish-edit-panel">
                <label className="admin-publish-field-inline">
                  <span className="screen-reader-text">Status</span>
                  <select
                    value={statusDraft}
                    onChange={(event) =>
                      setStatusDraft(event.target.value as PostStatus)
                    }
                  >
                    {POST_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="admin-publish-edit-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={applyStatus}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className="admin-inline-link"
                    onClick={closePanel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </li>

          <li className={activePanel === "visibility" ? "is-editing" : ""}>
            <div className="admin-publish-meta-row">
              <Eye size={16} strokeWidth={1.75} aria-hidden />
              <span>
                Visibility:{" "}
                <strong>
                  {formatVisibilityLabel(settings.visibility, settings.password)}
                </strong>
              </span>
              {activePanel !== "visibility" ? (
                <button
                  type="button"
                  className="admin-inline-link"
                  onClick={() => openPanel("visibility")}
                >
                  Edit
                </button>
              ) : null}
            </div>
            {activePanel === "visibility" ? (
              <div className="admin-publish-edit-panel">
                <fieldset className="admin-publish-visibility-fieldset">
                  <legend className="screen-reader-text">Visibility</legend>
                  <label className="admin-publish-radio">
                    <input
                      type="radio"
                      name="post-visibility"
                      checked={visibilityDraft === "public"}
                      onChange={() => setVisibilityDraft("public")}
                    />
                    Public
                  </label>
                  {visibilityDraft === "public" ? (
                    <label className="admin-publish-checkbox-nested">
                      <input
                        type="checkbox"
                        checked={stickDraft}
                        onChange={(event) => setStickDraft(event.target.checked)}
                      />
                      Stick this post to the front page
                    </label>
                  ) : null}
                  <label className="admin-publish-radio">
                    <input
                      type="radio"
                      name="post-visibility"
                      checked={visibilityDraft === "password"}
                      onChange={() => setVisibilityDraft("password")}
                    />
                    Password protected
                  </label>
                  {visibilityDraft === "password" ? (
                    <label className="admin-publish-password-field">
                      <span className="screen-reader-text">Password</span>
                      <input
                        type="text"
                        value={passwordDraft}
                        onChange={(event) => setPasswordDraft(event.target.value)}
                        placeholder="Password"
                      />
                    </label>
                  ) : null}
                  <label className="admin-publish-radio">
                    <input
                      type="radio"
                      name="post-visibility"
                      checked={visibilityDraft === "private"}
                      onChange={() => setVisibilityDraft("private")}
                    />
                    Private
                  </label>
                </fieldset>
                <div className="admin-publish-edit-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={applyVisibility}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className="admin-inline-link"
                    onClick={closePanel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </li>

          <li className={activePanel === "publish" ? "is-editing" : ""}>
            <div className="admin-publish-meta-row">
              <Calendar size={16} strokeWidth={1.75} aria-hidden />
              <span>
                Publish <strong>{publishLabel}</strong>
              </span>
              {activePanel !== "publish" ? (
                <button
                  type="button"
                  className="admin-inline-link"
                  onClick={() => openPanel("publish")}
                >
                  Edit
                </button>
              ) : null}
            </div>
            {activePanel === "publish" ? (
              <div className="admin-publish-edit-panel">
                <div className="admin-publish-datetime">
                  <select
                    value={publishDateDraft.month}
                    onChange={(event) =>
                      setPublishDateDraft((current) => ({
                        ...current,
                        month: Number(event.target.value),
                      }))
                    }
                    aria-label="Month"
                  >
                    {MONTH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={publishDateDraft.day}
                    onChange={(event) =>
                      setPublishDateDraft((current) => ({
                        ...current,
                        day: event.target.value,
                      }))
                    }
                    aria-label="Day"
                    className="admin-publish-date-part is-day"
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={publishDateDraft.year}
                    onChange={(event) =>
                      setPublishDateDraft((current) => ({
                        ...current,
                        year: event.target.value,
                      }))
                    }
                    aria-label="Year"
                    className="admin-publish-date-part is-year"
                  />
                  <span className="admin-publish-datetime-at">at</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={publishDateDraft.hour}
                    onChange={(event) =>
                      setPublishDateDraft((current) => ({
                        ...current,
                        hour: event.target.value,
                      }))
                    }
                    aria-label="Hour"
                    className="admin-publish-date-part is-hour"
                  />
                  <span className="admin-publish-datetime-colon">:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={publishDateDraft.minute}
                    onChange={(event) =>
                      setPublishDateDraft((current) => ({
                        ...current,
                        minute: event.target.value,
                      }))
                    }
                    aria-label="Minute"
                    className="admin-publish-date-part is-minute"
                  />
                </div>
                <div className="admin-publish-edit-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary"
                    onClick={applyPublishDate}
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    className="admin-inline-link"
                    onClick={closePanel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </li>
        </ul>

        <button
          type="button"
          className="admin-btn-secondary admin-publish-sync-btn"
          onClick={handleSyncExternal}
        >
          Sync From External Post
        </button>

        <label className="admin-publish-lock-toggle">
          <input
            type="checkbox"
            checked={settings.lockModifiedDate}
            onChange={(event) =>
              updateSettings((current) => ({
                ...current,
                lockModifiedDate: event.target.checked,
              }))
            }
          />
          <span
            className={`admin-publish-lock-switch${settings.lockModifiedDate ? " is-on" : ""}`}
            aria-hidden
          />
          Lock Modified Date
        </label>

        <div className={`admin-publish-seo-score is-${seoTone}`}>
          <BarChart2 size={16} strokeWidth={2} aria-hidden />
          <span>
            SEO: {seoScore} / 100
          </span>
        </div>

        <div className="admin-publish-footer">
          <button
            type="button"
            className="admin-media-delete-link admin-publish-trash"
            onClick={handleMoveToTrash}
          >
            Move to Trash
          </button>
          <button
            type="button"
            className="admin-btn-primary-inline"
            onClick={handlePublish}
          >
            {primaryActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
