"use client";

import { useEffect, useMemo, useState } from "react";
import { serviceAreas } from "@/lib/site/config";
import { buildLinkSnippet, type LinkInsertOptions } from "@/lib/admin/postEditor";

export type InsertLinkModalProps = {
  isOpen: boolean;
  initialLinkText: string;
  onClose: () => void;
  onInsert: (options: LinkInsertOptions) => void;
};

type ExistingContentItem = {
  title: string;
  type: string;
  url: string;
};

const existingContentItems: ExistingContentItem[] = serviceAreas.map((area) => ({
  title: area.city,
  type: "SERVICE AREA",
  url: area.href,
}));

export function InsertLinkModal({
  isOpen,
  initialLinkText,
  onClose,
  onInsert,
}: InsertLinkModalProps) {
  const [url, setUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [relNofollow, setRelNofollow] = useState(false);
  const [relSponsored, setRelSponsored] = useState(false);
  const [schemaAbout, setSchemaAbout] = useState(false);
  const [schemaMentions, setSchemaMentions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setUrl("");
    setLinkText(initialLinkText);
    setLinkTitle("");
    setOpenInNewTab(false);
    setRelNofollow(false);
    setRelSponsored(false);
    setSchemaAbout(false);
    setSchemaMentions(false);
    setSearchQuery("");
  }, [initialLinkText, isOpen]);

  const filteredContent = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return existingContentItems;
    }

    return existingContentItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = () => {
    if (!url.trim()) {
      return;
    }

    onInsert({
      url,
      linkText,
      linkTitle,
      openInNewTab,
      relNofollow,
      relSponsored,
    });
    onClose();
  };

  return (
    <div className="admin-link-modal-backdrop" onClick={onClose}>
      <div
        className="admin-link-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="insert-link-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-link-modal-header">
          <h2 id="insert-link-title">Insert/edit link</h2>
          <button
            type="button"
            className="admin-link-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="admin-link-modal-body">
          <label className="admin-link-field">
            <span>URL</span>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              autoFocus
            />
          </label>

          <label className="admin-link-field">
            <span>Link Text</span>
            <input
              type="text"
              value={linkText}
              onChange={(event) => setLinkText(event.target.value)}
            />
          </label>

          <label className="admin-link-field">
            <span>Link Title</span>
            <input
              type="text"
              value={linkTitle}
              onChange={(event) => setLinkTitle(event.target.value)}
            />
          </label>

          <label className="admin-link-checkbox">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(event) => setOpenInNewTab(event.target.checked)}
            />
            <span>Open link in a new tab</span>
          </label>

          <fieldset className="admin-link-fieldset">
            <legend>rel attributes</legend>
            <label className="admin-link-checkbox">
              <input
                type="checkbox"
                checked={relNofollow}
                onChange={(event) => setRelNofollow(event.target.checked)}
              />
              <span>rel=&quot;nofollow&quot;</span>
            </label>
            <label className="admin-link-checkbox">
              <input
                type="checkbox"
                checked={relSponsored}
                onChange={(event) => setRelSponsored(event.target.checked)}
              />
              <span>rel=&quot;sponsored&quot;</span>
            </label>
          </fieldset>

          <fieldset className="admin-link-fieldset">
            <legend>Use in Schema Markup</legend>
            <label className="admin-link-checkbox">
              <input
                type="checkbox"
                checked={schemaAbout}
                onChange={(event) => setSchemaAbout(event.target.checked)}
              />
              <span>about</span>
            </label>
            <label className="admin-link-checkbox">
              <input
                type="checkbox"
                checked={schemaMentions}
                onChange={(event) => setSchemaMentions(event.target.checked)}
              />
              <span>mentions</span>
            </label>
          </fieldset>

          <div className="admin-link-existing">
            <p className="admin-link-existing-title">Or link to existing content</p>
            <input
              type="search"
              className="admin-link-search"
              placeholder="Search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <ul className="admin-link-existing-list">
              {filteredContent.map((item) => (
                <li key={item.url}>
                  <button
                    type="button"
                    className="admin-link-existing-item"
                    onClick={() => {
                      setUrl(item.url);
                      if (!linkText.trim()) {
                        setLinkText(item.title);
                      }
                    }}
                  >
                    <span className="admin-link-existing-item-title">{item.title}</span>
                    <span className="admin-link-existing-item-type">{item.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="admin-link-modal-footer">
          <button type="button" className="admin-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="admin-btn-primary-inline"
            onClick={handleSubmit}
            disabled={!url.trim()}
          >
            Add Link
          </button>
        </div>
      </div>
    </div>
  );
}
