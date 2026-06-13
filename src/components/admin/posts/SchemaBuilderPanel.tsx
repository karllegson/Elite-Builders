"use client";

import { Copy, ExternalLink, Info, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { createSchemaItemFromType, type SchemaItem } from "@/lib/admin/postSeo";
import {
  createDefaultSchemaBuilderState,
  createSchemaBuilderGroup,
  createSchemaBuilderProperty,
  formatSchemaBuilderJson,
  getSchemaBuilderType,
  type SchemaBuilderGroup,
  type SchemaBuilderProperty,
  type SchemaBuilderState,
} from "@/lib/admin/schemaBuilder";

type SchemaBuilderPanelProps = {
  defaultHeadline: string;
  defaultDescription: string;
  onSaveForPost: (schema: SchemaItem) => void;
};

type BuilderTab = "edit" | "validation";

function PropertyRow({
  property,
  onChange,
  onDuplicate,
  onDelete,
}: {
  property: SchemaBuilderProperty;
  onChange: (next: SchemaBuilderProperty) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="admin-schema-builder-property">
      <input
        type="text"
        className="admin-schema-builder-key"
        value={property.key}
        onChange={(event) =>
          onChange({ ...property, key: event.target.value })
        }
        aria-label="Property key"
      />
      <input
        type="text"
        className="admin-schema-builder-value"
        value={property.value}
        onChange={(event) =>
          onChange({ ...property, value: event.target.value })
        }
        aria-label="Property value"
      />
      <button
        type="button"
        className="admin-schema-builder-row-action"
        aria-label="Duplicate property"
        onClick={onDuplicate}
      >
        <Copy size={14} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        className="admin-schema-builder-row-action"
        aria-label="Delete property"
        onClick={onDelete}
      >
        <Trash2 size={14} strokeWidth={1.75} />
      </button>
    </div>
  );
}

function BuilderActions({
  onAddProperty,
  onAddGroup,
  onDelete,
}: {
  onAddProperty: () => void;
  onAddGroup: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="admin-schema-builder-actions">
      <button type="button" className="admin-schema-builder-action" onClick={onAddProperty}>
        <Plus size={14} strokeWidth={1.75} aria-hidden />
        Add Property
      </button>
      <button type="button" className="admin-schema-builder-action" onClick={onAddGroup}>
        <Plus size={14} strokeWidth={1.75} aria-hidden />
        Add Property Group
      </button>
      <button type="button" className="admin-schema-builder-action is-danger" onClick={onDelete}>
        <Trash2 size={14} strokeWidth={1.75} aria-hidden />
        Delete
      </button>
    </div>
  );
}

export function SchemaBuilderPanel({
  defaultHeadline,
  defaultDescription,
  onSaveForPost,
}: SchemaBuilderPanelProps) {
  const [activeTab, setActiveTab] = useState<BuilderTab>("edit");
  const [builderState, setBuilderState] = useState<SchemaBuilderState>(
    createDefaultSchemaBuilderState,
  );
  const [saveMessage, setSaveMessage] = useState("");

  const jsonCode = useMemo(
    () => formatSchemaBuilderJson(builderState),
    [builderState],
  );

  const googleTestUrl = useMemo(() => {
    const encoded = encodeURIComponent(jsonCode);

    return `https://search.google.com/test/rich-results?code=${encoded}`;
  }, [jsonCode]);

  const updateProperty = (
    properties: SchemaBuilderProperty[],
    id: string,
    next: SchemaBuilderProperty,
  ) => properties.map((item) => (item.id === id ? next : item));

  const handleAddProperty = () => {
    setBuilderState((current) => ({
      ...current,
      properties: [...current.properties, createSchemaBuilderProperty()],
    }));
  };

  const handleAddGroup = () => {
    setBuilderState((current) => ({
      ...current,
      groups: [...current.groups, createSchemaBuilderGroup()],
    }));
  };

  const handleClearRoot = () => {
    setBuilderState(createDefaultSchemaBuilderState());
  };

  const handleSaveTemplate = () => {
    setSaveMessage("Template saved locally for this session.");
  };

  const handleSaveForPost = () => {
    const type = getSchemaBuilderType(builderState);
    const json = formatSchemaBuilderJson(builderState);

    onSaveForPost(
      createSchemaItemFromType(
        type,
        defaultHeadline,
        defaultDescription,
        json,
      ),
    );
    setSaveMessage("Custom schema saved for this post.");
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(jsonCode);
    setSaveMessage("JSON-LD copied to clipboard.");
  };

  const renderGroup = (group: SchemaBuilderGroup) => (
    <div key={group.id} className="admin-schema-builder-group">
      <div className="admin-schema-builder-root">
        <input
          type="text"
          className="admin-schema-builder-root-input"
          value={group.label}
          onChange={(event) =>
            setBuilderState((current) => ({
              ...current,
              groups: current.groups.map((item) =>
                item.id === group.id
                  ? { ...item, label: event.target.value }
                  : item,
              ),
            }))
          }
          aria-label="Property group label"
        />
        <BuilderActions
          onAddProperty={() =>
            setBuilderState((current) => ({
              ...current,
              groups: current.groups.map((item) =>
                item.id === group.id
                  ? {
                      ...item,
                      properties: [
                        ...item.properties,
                        createSchemaBuilderProperty(),
                      ],
                    }
                  : item,
              ),
            }))
          }
          onAddGroup={handleAddGroup}
          onDelete={() =>
            setBuilderState((current) => ({
              ...current,
              groups: current.groups.filter((item) => item.id !== group.id),
            }))
          }
        />
      </div>

      {group.properties.map((property) => (
        <PropertyRow
          key={property.id}
          property={property}
          onChange={(next) =>
            setBuilderState((current) => ({
              ...current,
              groups: current.groups.map((item) =>
                item.id === group.id
                  ? {
                      ...item,
                      properties: updateProperty(item.properties, property.id, next),
                    }
                  : item,
              ),
            }))
          }
          onDuplicate={() =>
            setBuilderState((current) => ({
              ...current,
              groups: current.groups.map((item) => {
                if (item.id !== group.id) {
                  return item;
                }

                const index = item.properties.findIndex(
                  (entry) => entry.id === property.id,
                );
                const duplicate = createSchemaBuilderProperty(
                  property.key,
                  property.value,
                );
                const nextProperties = [...item.properties];
                nextProperties.splice(index + 1, 0, duplicate);

                return { ...item, properties: nextProperties };
              }),
            }))
          }
          onDelete={() =>
            setBuilderState((current) => ({
              ...current,
              groups: current.groups.map((item) =>
                item.id === group.id
                  ? {
                      ...item,
                      properties: item.properties.filter(
                        (entry) => entry.id !== property.id,
                      ),
                    }
                  : item,
              ),
            }))
          }
        />
      ))}

      <BuilderActions
        onAddProperty={() =>
          setBuilderState((current) => ({
            ...current,
            groups: current.groups.map((item) =>
              item.id === group.id
                ? {
                    ...item,
                    properties: [
                      ...item.properties,
                      createSchemaBuilderProperty(),
                    ],
                  }
                : item,
            ),
          }))
        }
        onAddGroup={handleAddGroup}
        onDelete={() =>
          setBuilderState((current) => ({
            ...current,
            groups: current.groups.filter((item) => item.id !== group.id),
          }))
        }
      />
    </div>
  );

  return (
    <div className="admin-schema-builder">
      <div className="admin-schema-builder-header">
        <h3>Schema Builder</h3>
      </div>

      <div className="admin-schema-builder-tabs">
        <button
          type="button"
          className={`admin-schema-builder-tab${activeTab === "edit" ? " is-active" : ""}`}
          onClick={() => setActiveTab("edit")}
        >
          Edit
        </button>
        <button
          type="button"
          className={`admin-schema-builder-tab${activeTab === "validation" ? " is-active" : ""}`}
          onClick={() => setActiveTab("validation")}
        >
          Code Validation
        </button>
        <span className="admin-schema-builder-info" aria-hidden>
          <Info size={16} strokeWidth={1.75} />
        </span>
      </div>

      {activeTab === "edit" ? (
        <div className="admin-schema-builder-edit">
          <div className="admin-schema-builder-root">
            <input
              type="text"
              className="admin-schema-builder-root-input"
              value={builderState.rootLabel}
              onChange={(event) =>
                setBuilderState((current) => ({
                  ...current,
                  rootLabel: event.target.value,
                }))
              }
              aria-label="Root label"
            />
            <BuilderActions
              onAddProperty={handleAddProperty}
              onAddGroup={handleAddGroup}
              onDelete={handleClearRoot}
            />
          </div>

          {builderState.properties.map((property) => (
            <PropertyRow
              key={property.id}
              property={property}
              onChange={(next) =>
                setBuilderState((current) => ({
                  ...current,
                  properties: updateProperty(current.properties, property.id, next),
                }))
              }
              onDuplicate={() =>
                setBuilderState((current) => {
                  const index = current.properties.findIndex(
                    (item) => item.id === property.id,
                  );
                  const duplicate = createSchemaBuilderProperty(
                    property.key,
                    property.value,
                  );
                  const nextProperties = [...current.properties];
                  nextProperties.splice(index + 1, 0, duplicate);

                  return { ...current, properties: nextProperties };
                })
              }
              onDelete={() =>
                setBuilderState((current) => ({
                  ...current,
                  properties: current.properties.filter(
                    (item) => item.id !== property.id,
                  ),
                }))
              }
            />
          ))}

          {builderState.groups.map(renderGroup)}

          <BuilderActions
            onAddProperty={handleAddProperty}
            onAddGroup={handleAddGroup}
            onDelete={handleClearRoot}
          />

          <div className="admin-schema-builder-footer">
            <button
              type="button"
              className="admin-btn-secondary"
              onClick={handleSaveTemplate}
            >
              Save as Template
            </button>
            <button
              type="button"
              className="admin-btn-primary-inline"
              onClick={handleSaveForPost}
            >
              Save for this Post
            </button>
          </div>
        </div>
      ) : (
        <div className="admin-schema-builder-validation">
          <div className="admin-schema-builder-validation-header">
            <h4>JSON-LD Code</h4>
            <div className="admin-schema-builder-validation-actions">
              <button
                type="button"
                className="admin-btn-secondary admin-schema-builder-copy"
                onClick={handleCopyJson}
              >
                <Copy size={14} strokeWidth={1.75} aria-hidden />
                Copy
              </button>
              <a
                href={googleTestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-secondary admin-schema-builder-copy"
              >
                <ExternalLink size={14} strokeWidth={1.75} aria-hidden />
                Test with Google
              </a>
            </div>
          </div>

          <p className="admin-schema-builder-validation-note">
            Note: Please save the post as a draft first to see the actual data.
          </p>

          <pre className="admin-schema-json admin-schema-builder-json">{jsonCode}</pre>
        </div>
      )}

      {saveMessage ? (
        <p className="admin-schema-import-message">{saveMessage}</p>
      ) : null}
    </div>
  );
}
