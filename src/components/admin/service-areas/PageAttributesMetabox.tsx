"use client";

import { useMemo } from "react";
import { useServiceAreaParentOptions } from "@/hooks/useServiceAreaParentOptions";
import {
  SERVICE_AREA_SELF_PARENT_OPTION,
  type ServiceAreaPageAttributes,
} from "@/lib/admin/serviceAreaEditor";

type PageAttributesMetaboxProps = {
  attributes: ServiceAreaPageAttributes;
  onChange: (attributes: ServiceAreaPageAttributes) => void;
  excludeParentId?: string;
  pageSlug?: string;
};

export function PageAttributesMetabox({
  attributes,
  onChange,
  excludeParentId,
  pageSlug,
}: PageAttributesMetaboxProps) {
  const { options: parentOptions, ready } = useServiceAreaParentOptions(excludeParentId);

  const selectedParentId = useMemo(() => {
    if (!attributes.parentId) {
      return SERVICE_AREA_SELF_PARENT_OPTION;
    }

    const match = parentOptions.find((option) => option.id === attributes.parentId);

    if (match) {
      return match.id;
    }

    return ready ? SERVICE_AREA_SELF_PARENT_OPTION : attributes.parentId;
  }, [attributes.parentId, parentOptions, ready]);

  const selectedParentLabel = useMemo(() => {
    if (!attributes.parentId) {
      return null;
    }

    return parentOptions.find((option) => option.id === attributes.parentId)?.label ?? null;
  }, [attributes.parentId, parentOptions]);

  const slugPreview = pageSlug?.trim() || "your-slug";
  const isParentPage = !attributes.parentId;

  return (
    <div className="admin-metabox">
      <div className="admin-metabox-header">
        <span>Page Attributes</span>
        <span className="admin-metabox-toggle" aria-hidden>
          ▲
        </span>
      </div>
      <div className="admin-metabox-body">
        <div className="admin-page-attributes">
          <div className="admin-page-attributes-field">
            <label className="admin-page-attributes-label" htmlFor="service-area-parent">
              Parent page
            </label>
            <select
              id="service-area-parent"
              className="admin-page-attributes-select"
              value={selectedParentId}
              disabled={!ready}
              onChange={(event) =>
                onChange({
                  ...attributes,
                  parentId: event.target.value || null,
                })
              }
            >
              <option value={SERVICE_AREA_SELF_PARENT_OPTION}>
                This page is the parent
              </option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className="admin-page-attributes-help">
            {isParentPage ? (
              <>
                Leave <strong>This page is the parent</strong> selected when this service area
                should be its own top-level page at{" "}
                <strong>/service-areas/{slugPreview}</strong>. It appears in Sorting, not under
                another city.
              </>
            ) : (
              <>
                This is a sub-page under <strong>{selectedParentLabel ?? "the selected parent"}</strong>{" "}
                at <strong>/service-areas/parent-slug/{slugPreview}</strong>. It appears in Nested
                View only.
              </>
            )}
          </p>

          <div className="admin-page-attributes-field">
            <label className="admin-page-attributes-label" htmlFor="service-area-order">
              Order
            </label>
            <input
              id="service-area-order"
              type="number"
              className="admin-page-attributes-order"
              value={attributes.order}
              min={0}
              onChange={(event) =>
                onChange({
                  ...attributes,
                  order: Number.parseInt(event.target.value, 10) || 0,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
