"use client";

import { useMemo, useRef, useState } from "react";
import {
  filterPlaceholderGroups,
  formatSchemaPlaceholder,
  insertTextAtCursor,
  SCHEMA_PLACEHOLDER_GROUPS,
  SCHEMA_TEMPLATES,
  type SchemaGeneratorConfig,
  type SchemaTemplateId,
} from "@/lib/admin/postSchemaGenerator";

type PostSchemaGeneratorPanelProps = {
  config: SchemaGeneratorConfig;
  onChange: (config: SchemaGeneratorConfig) => void;
};

export function PostSchemaGeneratorPanel({
  config,
  onChange,
}: PostSchemaGeneratorPanelProps) {
  const jsonRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderSearch, setPlaceholderSearch] = useState("");

  const filteredGroups = useMemo(
    () => filterPlaceholderGroups(SCHEMA_PLACEHOLDER_GROUPS, placeholderSearch),
    [placeholderSearch],
  );

  const toggleTemplate = (id: SchemaTemplateId, checked: boolean) => {
    onChange({
      ...config,
      templates: {
        ...config.templates,
        [id]: checked,
      },
    });
  };

  const insertPlaceholder = (token: string) => {
    const textarea = jsonRef.current;

    if (!textarea) {
      return;
    }

    const nextValue = insertTextAtCursor(
      textarea,
      formatSchemaPlaceholder(token),
    );

    onChange({
      ...config,
      customJsonLd: nextValue,
    });
  };

  return (
    <div className="admin-metabox admin-schema-generator-panel">
      <div className="admin-metabox-header">
        <span>Elite Builders Schema</span>
        <span className="admin-metabox-toggle" aria-hidden>
          ▲
        </span>
      </div>

      <div className="admin-metabox-body admin-schema-generator-body">
        <section className="admin-schema-generator-section">
          <h3>Templates</h3>
          <div className="admin-schema-template-list">
            {SCHEMA_TEMPLATES.map((template) => (
              <label key={template.id} className="admin-schema-template-item">
                <input
                  type="checkbox"
                  checked={config.templates[template.id]}
                  onChange={(event) =>
                    toggleTemplate(template.id, event.target.checked)
                  }
                />
                <span>{template.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="admin-schema-generator-section">
          <h3>Custom JSON-LD</h3>
          <div className="admin-schema-json-mode">
            <label className="admin-schema-radio">
              <input
                type="radio"
                name="custom-json-mode"
                checked={config.customJsonMode === "add"}
                onChange={() =>
                  onChange({ ...config, customJsonMode: "add" })
                }
              />
              <span>Add to templates</span>
            </label>
            <label className="admin-schema-radio">
              <input
                type="radio"
                name="custom-json-mode"
                checked={config.customJsonMode === "override"}
                onChange={() =>
                  onChange({ ...config, customJsonMode: "override" })
                }
              />
              <span>Override templates (only output custom JSON)</span>
            </label>
          </div>
        </section>

        <section className="admin-schema-generator-section">
          <h3>Insert placeholder</h3>
          <input
            type="search"
            className="admin-schema-placeholder-search"
            placeholder="Search placeholders..."
            value={placeholderSearch}
            onChange={(event) => setPlaceholderSearch(event.target.value)}
          />

          <div className="admin-schema-placeholder-groups">
            {filteredGroups.map((group) => (
              <div key={group.label} className="admin-schema-placeholder-group">
                <div className="admin-schema-placeholder-group-label">
                  {group.label}
                </div>
                {group.placeholders.length > 0 ? (
                  <div className="admin-schema-placeholder-buttons">
                    {group.placeholders.map((placeholder) => (
                      <button
                        key={placeholder}
                        type="button"
                        className="admin-schema-placeholder-btn"
                        onClick={() => insertPlaceholder(placeholder)}
                      >
                        {placeholder}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <p className="admin-schema-placeholder-help">
            Click a button to insert that placeholder at your cursor position.
            Placeholders are replaced automatically when the schema is output.
          </p>
        </section>

        <section className="admin-schema-generator-section">
          <textarea
            ref={jsonRef}
            className="admin-schema-json-editor"
            rows={12}
            value={config.customJsonLd}
            onChange={(event) =>
              onChange({ ...config, customJsonLd: event.target.value })
            }
            spellCheck={false}
            aria-label="Custom JSON-LD"
          />
          <p className="admin-schema-json-help">
            Optional: Paste valid JSON here. Placeholders are supported.
          </p>
        </section>
      </div>
    </div>
  );
}
