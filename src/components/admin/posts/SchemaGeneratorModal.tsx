"use client";

import {
  Award,
  CirclePlus,
  Eye,
  FileStack,
  Import,
  Info,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  PostSchemaEditModal,
  PostSchemaViewModal,
} from "@/components/admin/posts/PostSchemaModals";
import { SchemaBuilderPanel } from "@/components/admin/posts/SchemaBuilderPanel";
import { createSchemaItemFromType, type SchemaItem } from "@/lib/admin/postSeo";
import {
  filterSchemaCatalog,
  SCHEMA_CATALOG,
  SCHEMA_IMPORT_SOURCES,
  SCHEMA_USER_TEMPLATES,
  schemaTypeInUse,
  type SchemaImportSource,
} from "@/lib/admin/schemaCatalog";

type SchemaGeneratorModalTab = "templates" | "import" | "custom";

type SchemaGeneratorModalProps = {
  isOpen: boolean;
  schemas: SchemaItem[];
  pageUrl: string;
  defaultHeadline: string;
  defaultDescription: string;
  onClose: () => void;
  onSchemasChange: (schemas: SchemaItem[]) => void;
};

export function SchemaGeneratorModal({
  isOpen,
  schemas,
  pageUrl,
  defaultHeadline,
  defaultDescription,
  onClose,
  onSchemasChange,
}: SchemaGeneratorModalProps) {
  const [activeTab, setActiveTab] = useState<SchemaGeneratorModalTab>("templates");
  const [catalogFilter, setCatalogFilter] = useState<"catalog" | "templates">(
    "catalog",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [importSource, setImportSource] =
    useState<SchemaImportSource>("URL / Online Page");
  const [importUrl, setImportUrl] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [editSchema, setEditSchema] = useState<SchemaItem | null>(null);
  const [viewSchema, setViewSchema] = useState<SchemaItem | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveTab("templates");
    setCatalogFilter("catalog");
    setSearchQuery("");
    setImportSource("URL / Online Page");
    setImportUrl("");
    setImportMessage("");
  }, [isOpen]);

  const availableItems = useMemo(() => {
    const source =
      catalogFilter === "catalog" ? SCHEMA_CATALOG : SCHEMA_USER_TEMPLATES;

    return filterSchemaCatalog(source, searchQuery);
  }, [catalogFilter, searchQuery]);

  if (!isOpen) {
    return null;
  }

  const handleUseSchema = (type: string) => {
    if (schemaTypeInUse(schemas, type)) {
      return;
    }

    onSchemasChange([
      ...schemas,
      createSchemaItemFromType(type, defaultHeadline, defaultDescription),
    ]);
  };

  const handleDeleteSchema = (id: string) => {
    onSchemasChange(schemas.filter((item) => item.id !== id));
  };

  const handleSaveSchema = (updated: SchemaItem) => {
    onSchemasChange(
      schemas.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  const handleImport = () => {
    if (!importUrl.trim()) {
      setImportMessage("Enter a page URL to import schema.");
      return;
    }

    onSchemasChange([
      ...schemas,
      createSchemaItemFromType(
        "WebPage",
        defaultHeadline,
        `Imported from ${importUrl.trim()}`,
      ),
    ]);
    setImportMessage("Schema imported and added to Schema in Use.");
    setImportUrl("");
  };

  return (
    <>
      <div className="admin-link-modal-backdrop" onClick={onClose}>
        <div
          className="admin-schema-generator-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="schema-generator-modal-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="admin-link-modal-header">
            <h2 id="schema-generator-modal-title">Schema Generator</h2>
            <button
              type="button"
              className="admin-link-modal-close"
              aria-label="Close"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="admin-schema-generator-modal-tabs">
            <button
              type="button"
              className={`admin-schema-generator-modal-tab${activeTab === "templates" ? " is-active" : ""}`}
              onClick={() => setActiveTab("templates")}
            >
              <FileStack size={15} strokeWidth={1.75} aria-hidden />
              Schema Templates
            </button>
            <button
              type="button"
              className={`admin-schema-generator-modal-tab${activeTab === "import" ? " is-active" : ""}`}
              onClick={() => setActiveTab("import")}
            >
              <Import size={15} strokeWidth={1.75} aria-hidden />
              Import
            </button>
            <button
              type="button"
              className={`admin-schema-generator-modal-tab${activeTab === "custom" ? " is-active" : ""}`}
              onClick={() => setActiveTab("custom")}
            >
              <PlusCircle size={15} strokeWidth={1.75} aria-hidden />
              Custom Schema
            </button>
            <span className="admin-schema-generator-modal-info" aria-hidden>
              <Info size={16} strokeWidth={1.75} />
            </span>
          </div>

          <div className="admin-schema-generator-modal-body">
            {activeTab === "templates" && (
              <>
                <section className="admin-schema-generator-modal-section">
                  <h3>Schema in Use</h3>
                  {schemas.length === 0 ? (
                    <p className="admin-seo-placeholder-copy">
                      No schema markup added yet.
                    </p>
                  ) : (
                    <ul className="admin-schema-list">
                      {schemas.map((item) => (
                        <li key={item.id} className="admin-schema-item">
                          <div className="admin-schema-item-label">
                            <Award size={16} strokeWidth={1.75} aria-hidden />
                            <span>{item.type}</span>
                          </div>
                          <div className="admin-schema-item-actions">
                            <button
                              type="button"
                              className="admin-schema-action"
                              aria-label={`Edit ${item.type} schema`}
                              onClick={() => setEditSchema(item)}
                            >
                              <Pencil size={15} strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              className="admin-schema-action"
                              aria-label={`Preview ${item.type} schema`}
                              onClick={() => setViewSchema(item)}
                            >
                              <Eye size={15} strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              className="admin-schema-action"
                              aria-label={`Delete ${item.type} schema`}
                              onClick={() => handleDeleteSchema(item.id)}
                            >
                              <Trash2 size={15} strokeWidth={1.75} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="admin-schema-generator-modal-section">
                  <div className="admin-schema-available-header">
                    <h3>Available Schema Types</h3>
                    <input
                      type="search"
                      className="admin-schema-available-search"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </div>

                  <div className="admin-schema-available-filters">
                    <label className="admin-schema-radio">
                      <input
                        type="radio"
                        name="schema-source"
                        checked={catalogFilter === "catalog"}
                        onChange={() => setCatalogFilter("catalog")}
                      />
                      <span>Schema Catalog</span>
                    </label>
                    <label className="admin-schema-radio">
                      <input
                        type="radio"
                        name="schema-source"
                        checked={catalogFilter === "templates"}
                        onChange={() => setCatalogFilter("templates")}
                      />
                      <span>Your Templates</span>
                    </label>
                  </div>

                  <div className="admin-schema-type-grid">
                    {availableItems.map((item) => {
                      const Icon = item.icon;
                      const inUse = schemaTypeInUse(schemas, item.type);

                      return (
                        <div key={item.type} className="admin-schema-type-card">
                          <div className="admin-schema-type-card-main">
                            <Icon size={16} strokeWidth={1.75} aria-hidden />
                            <span>{item.type}</span>
                          </div>
                          <button
                            type="button"
                            className="admin-schema-type-use"
                            disabled={inUse}
                            onClick={() => handleUseSchema(item.type)}
                          >
                            <CirclePlus size={14} strokeWidth={1.75} aria-hidden />
                            Use
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            )}

            {activeTab === "import" && (
              <section className="admin-schema-generator-modal-section">
                <label className="admin-link-field">
                  <span>Import Schema Code from</span>
                  <select
                    value={importSource}
                    onChange={(event) =>
                      setImportSource(event.target.value as SchemaImportSource)
                    }
                  >
                    {SCHEMA_IMPORT_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-link-field">
                  <span>Page URL</span>
                  <input
                    type="url"
                    placeholder="https://"
                    value={importUrl}
                    onChange={(event) => setImportUrl(event.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className="admin-btn-primary-inline"
                  onClick={handleImport}
                >
                  Import
                </button>

                {importMessage ? (
                  <p className="admin-schema-import-message">{importMessage}</p>
                ) : null}
              </section>
            )}

            {activeTab === "custom" && (
              <SchemaBuilderPanel
                defaultHeadline={defaultHeadline}
                defaultDescription={defaultDescription}
                onSaveForPost={(schema) => {
                  onSchemasChange([...schemas, schema]);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <PostSchemaEditModal
        isOpen={editSchema !== null}
        schema={editSchema}
        onClose={() => setEditSchema(null)}
        onSave={handleSaveSchema}
      />

      <PostSchemaViewModal
        isOpen={viewSchema !== null}
        schema={viewSchema}
        pageUrl={pageUrl}
        onClose={() => setViewSchema(null)}
      />
    </>
  );
}
