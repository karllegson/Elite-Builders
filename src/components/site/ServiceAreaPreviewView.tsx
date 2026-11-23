"use client";

import { useMemo, useSyncExternalStore } from "react";
import { ServiceAreaCityView } from "@/components/site/ServiceAreaCityView";
import { ServiceAreaSubPageView } from "@/components/site/ServiceAreaSubPageView";
import {
  getServiceAreaPreviewSnapshot,
  parseServiceAreaPreview,
  subscribeServiceAreaPreview,
} from "@/lib/admin/serviceAreaPreview";
import { toPublicServiceArea, toPublicServiceAreaSubPage } from "@/lib/site/serviceAreasPublic";

function PreviewMessage({ children }: { children: React.ReactNode }) {
  return <p className="site-container py-24 text-sm text-site-text-muted">{children}</p>;
}

/** Renders the service-area editor's Preview (see serviceAreaPreview.ts) with the public page layout. */
export function ServiceAreaPreviewView() {
  // Stored in the browser, so the server render is "loading" (undefined).
  // Clicking Preview again in the editor updates this tab.
  const raw = useSyncExternalStore(
    subscribeServiceAreaPreview,
    getServiceAreaPreviewSnapshot,
    () => undefined,
  );
  const payload = useMemo(() => (raw === undefined ? null : parseServiceAreaPreview(raw)), [raw]);

  if (raw === undefined) {
    return <PreviewMessage>Loading preview…</PreviewMessage>;
  }

  if (!payload) {
    return (
      <PreviewMessage>
        Nothing to preview. Open a service area in the dashboard and click Preview.
      </PreviewMessage>
    );
  }

  const { record, parent, savedAt } = payload;
  const isLive = record.status === "published" && !record.hidden && !record.unused;
  const banner = (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      <strong>Preview</strong>
      {isLive
        ? " of unsaved changes. Visitors see the last saved version."
        : " of a draft. This page isn't live; visitors can't see it yet."}
    </div>
  );

  if (record.parentId) {
    const page = parent
      ? toPublicServiceAreaSubPage(record, parent, [record, parent], { preview: true })
      : null;

    if (!page || !parent) {
      return (
        <PreviewMessage>
          This sub-page&apos;s parent page wasn&apos;t found, so it can&apos;t be previewed.
        </PreviewMessage>
      );
    }

    return (
      <>
        {banner}
        <ServiceAreaSubPageView
          key={savedAt}
          parentSlug={parent.slug}
          subPageSlug={record.slug}
          initialPage={page}
          preview
        />
      </>
    );
  }

  const area = toPublicServiceArea(record, [record], { preview: true });

  if (!area) {
    return <PreviewMessage>This page can&apos;t be previewed.</PreviewMessage>;
  }

  return (
    <>
      {banner}
      <ServiceAreaCityView key={savedAt} citySlug={record.slug} initialArea={area} />
    </>
  );
}
