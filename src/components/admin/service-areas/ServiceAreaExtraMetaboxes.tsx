"use client";

import type { ServiceAreaExtraFields } from "@/lib/admin/serviceAreaEditor";

type ServiceAreaExtraMetaboxesProps = {
  fields: ServiceAreaExtraFields;
  onChange: (fields: ServiceAreaExtraFields) => void;
};

export function ServiceAreaExtraMetaboxes({
  fields,
  onChange,
}: ServiceAreaExtraMetaboxesProps) {
  return (
    <>
      <div className="admin-metabox">
        <div className="admin-metabox-header">
          <span>Map Embed</span>
          <span className="admin-metabox-toggle" aria-hidden>
            ▲
          </span>
        </div>
        <div className="admin-metabox-body">
          <textarea
            className="admin-map-embed-textarea"
            value={fields.mapEmbed}
            onChange={(event) =>
              onChange({ ...fields, mapEmbed: event.target.value })
            }
            rows={6}
            spellCheck={false}
            aria-label="Map embed iframe code"
          />
          <p className="admin-map-embed-help">
            Please paste the full iframe code for the map here.
          </p>
        </div>
      </div>

      <div className="admin-metabox">
        <div className="admin-metabox-header">
          <span>Archive Only</span>
          <span className="admin-metabox-toggle" aria-hidden>
            ▲
          </span>
        </div>
        <div className="admin-metabox-body">
          <label className="admin-service-area-checkbox">
            <input
              type="checkbox"
              checked={fields.archiveOnly}
              onChange={(event) =>
                onChange({ ...fields, archiveOnly: event.target.checked })
              }
            />
            <span>Make link inactive ( archive view only ).</span>
          </label>
        </div>
      </div>

      <div className="admin-metabox">
        <div className="admin-metabox-header">
          <span>Breadcrumbs Link</span>
          <span className="admin-metabox-toggle" aria-hidden>
            ▲
          </span>
        </div>
        <div className="admin-metabox-body">
          <label className="admin-service-area-checkbox">
            <input
              type="checkbox"
              checked={fields.breadcrumbsLinkInactive}
              onChange={(event) =>
                onChange({
                  ...fields,
                  breadcrumbsLinkInactive: event.target.checked,
                })
              }
            />
            <span>Make link inactive on breadcrumbs.</span>
          </label>
        </div>
      </div>
    </>
  );
}
