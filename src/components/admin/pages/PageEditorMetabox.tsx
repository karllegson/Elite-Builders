"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";

type PageEditorMetaboxProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function PageEditorMetabox({
  title,
  children,
  defaultOpen = true,
}: PageEditorMetaboxProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`admin-metabox admin-page-metabox${isOpen ? "" : " is-collapsed"}`}>
      <div className="admin-metabox-header admin-page-metabox-header">
        <span>{title}</span>
        <div className="admin-page-metabox-controls">
          <button
            type="button"
            className="admin-page-metabox-control"
            aria-label={`Move ${title} up`}
          >
            <ChevronUp size={14} aria-hidden />
          </button>
          <button
            type="button"
            className="admin-page-metabox-control"
            aria-label={`Move ${title} down`}
          >
            <ChevronDown size={14} aria-hidden />
          </button>
          <button
            type="button"
            className="admin-page-metabox-control"
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
            onClick={() => setIsOpen((current) => !current)}
          >
            <ChevronDown
              size={14}
              aria-hidden
              className={`admin-page-metabox-collapse${isOpen ? " is-open" : ""}`}
            />
          </button>
        </div>
      </div>
      {isOpen ? <div className="admin-metabox-body">{children}</div> : null}
    </div>
  );
}
