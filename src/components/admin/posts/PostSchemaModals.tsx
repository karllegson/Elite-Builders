"use client";

import { useEffect, useState } from "react";
import {
  type SchemaItem,
} from "@/lib/admin/postSeo";

type PostSchemaEditModalProps = {
  isOpen: boolean;
  schema: SchemaItem | null;
  onClose: () => void;
  onSave: (schema: SchemaItem) => void;
};

export function PostSchemaEditModal({
  isOpen,
  schema,
  onClose,
  onSave,
}: PostSchemaEditModalProps) {
  const [draft, setDraft] = useState<SchemaItem | null>(schema);

  useEffect(() => {
    if (isOpen) {
      setDraft(schema);
    }
  }, [isOpen, schema]);

  if (!isOpen || !draft) {
    return null;
  }

  return (
    <div className="admin-link-modal-backdrop" onClick={onClose}>
      <div
        className="admin-schema-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schema-edit-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-link-modal-header">
          <h2 id="schema-edit-title">Edit {draft.type} Schema</h2>
          <button
            type="button"
            className="admin-link-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="admin-schema-modal-body">
          <label className="admin-link-field">
            <span>Headline</span>
            <input
              type="text"
              value={draft.headline}
              onChange={(event) =>
                setDraft((current) =>
                  current ? { ...current, headline: event.target.value } : current,
                )
              }
            />
          </label>
          <label className="admin-link-field">
            <span>Description</span>
            <textarea
              rows={4}
              value={draft.description}
              onChange={(event) =>
                setDraft((current) =>
                  current
                    ? { ...current, description: event.target.value }
                    : current,
                )
              }
            />
          </label>
        </div>

        <div className="admin-link-modal-footer">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn-primary-inline"
            onClick={() => {
              onSave(draft);
              onClose();
            }}
          >
            Save Schema
          </button>
        </div>
      </div>
    </div>
  );
}

type PostSchemaViewModalProps = {
  isOpen: boolean;
  schema: SchemaItem | null;
  pageUrl: string;
  onClose: () => void;
};

export function PostSchemaViewModal({
  isOpen,
  schema,
  pageUrl,
  onClose,
}: PostSchemaViewModalProps) {
  if (!isOpen || !schema) {
    return null;
  }

  let jsonLd: Record<string, unknown>;

  if (schema.customJsonLd) {
    try {
      jsonLd = JSON.parse(schema.customJsonLd) as Record<string, unknown>;
    } catch {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": schema.type,
        headline: schema.headline,
        description: schema.description,
        url: pageUrl,
      };
    }
  } else {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": schema.type,
      headline: schema.headline,
      description: schema.description,
      url: pageUrl,
    };
  }

  return (
    <div className="admin-link-modal-backdrop" onClick={onClose}>
      <div
        className="admin-schema-modal admin-schema-view-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schema-view-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-link-modal-header">
          <h2 id="schema-view-title">{schema.type} Schema Preview</h2>
          <button
            type="button"
            className="admin-link-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="admin-schema-modal-body">
          <pre className="admin-schema-json">{JSON.stringify(jsonLd, null, 2)}</pre>
        </div>

        <div className="admin-link-modal-footer">
          <button type="button" className="admin-btn-primary-inline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
