"use client";

import {
  buildServiceAreaParentOptions,
  type ServiceAreaPageAttributes,
} from "@/lib/admin/serviceAreaEditor";

type PageAttributesMetaboxProps = {
  attributes: ServiceAreaPageAttributes;
  onChange: (attributes: ServiceAreaPageAttributes) => void;
};

export function PageAttributesMetabox({
  attributes,
  onChange,
}: PageAttributesMetaboxProps) {
  const parentOptions = buildServiceAreaParentOptions();

  return (
    <div className="admin-metabox">
      <div className="admin-metabox-header">
        <span>Page Attributes</span>
        <span className="admin-metabox-toggle" aria-hidden>
          ▲
        </span>
      </div>
      <div className="admin-metabox-body">
        <label className="admin-page-attributes-field">
          <span className="admin-page-attributes-label">Parent</span>
          <select
            value={attributes.parentId ?? ""}
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
        </label>

        <label className="admin-page-attributes-field">
          <span className="admin-page-attributes-label">Order</span>
          <input
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
        </label>
      </div>
    </div>
  );
}
