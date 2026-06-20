"use client";

import { useMemo } from "react";
import { useServiceAreaParentOptions } from "@/hooks/useServiceAreaParentOptions";
import type { ServiceAreaPageAttributes } from "@/lib/admin/serviceAreaEditor";

type PageAttributesMetaboxProps = {
  attributes: ServiceAreaPageAttributes;
  onChange: (attributes: ServiceAreaPageAttributes) => void;
  excludeParentId?: string;
};

export function PageAttributesMetabox({
  attributes,
  onChange,
  excludeParentId,
}: PageAttributesMetaboxProps) {
  const { options: parentOptions, ready } = useServiceAreaParentOptions(excludeParentId);

  const selectedParentId = useMemo(() => {
    if (!attributes.parentId) {
      return "";
    }

    const match = parentOptions.find((option) => option.id === attributes.parentId);

    if (match) {
      return match.id;
    }

    return ready ? "" : attributes.parentId;
  }, [attributes.parentId, parentOptions, ready]);

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
              Parent
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
              <option value="">(no parent)</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className="admin-page-attributes-help">
            Choose <strong>(no parent)</strong> for a service area that appears in Sorting at{" "}
            <strong>/service-areas/your-slug</strong>. Choose a parent (e.g. Stockton, CA) to
            create a landing page at{" "}
            <strong>/service-areas/parent-slug/your-slug</strong> — it appears under that parent in
            Nested View only.
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
