"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchPublicServiceAreaBySlugAction,
  fetchPublicServiceAreaSubPageAction,
  fetchPublicServiceAreasAction,
} from "@/app/admin/(shell)/service-areas/actions";
import { SERVICE_AREAS_CHANGED_EVENT } from "@/lib/admin/serviceAreasData";
import {
  getPublicServiceAreasFallback,
  getPublicServiceAreasFromStore,
  findPublicServiceAreaSubPage,
  type PublicServiceArea,
  type PublicServiceAreaSubPage,
} from "@/lib/site/serviceAreasPublic";

function loadPublicServiceAreasFromBrowser(): PublicServiceArea[] {
  try {
    const areas = getPublicServiceAreasFromStore();

    if (areas.length > 0) {
      return areas;
    }
  } catch {
    // Fall back to static site config when local storage is unavailable.
  }

  return getPublicServiceAreasFallback();
}

async function loadPublicServiceAreas(): Promise<PublicServiceArea[]> {
  const fromServer = await fetchPublicServiceAreasAction();

  if (fromServer.length > 0) {
    return fromServer;
  }

  if (typeof window !== "undefined") {
    return loadPublicServiceAreasFromBrowser();
  }

  return getPublicServiceAreasFallback();
}

/** All published areas. `initialAreas` is the server-loaded list, so links render in the first HTML. */
export function usePublicServiceAreas(initialAreas?: PublicServiceArea[]) {
  const [areas, setAreas] = useState<PublicServiceArea[]>(initialAreas ?? []);
  const [ready, setReady] = useState(initialAreas !== undefined);

  const refresh = useCallback(() => {
    void loadPublicServiceAreas().then((nextAreas) => {
      setAreas(nextAreas);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    refresh();

    const handleChange = () => {
      refresh();
    };

    window.addEventListener(SERVICE_AREAS_CHANGED_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(SERVICE_AREAS_CHANGED_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [refresh]);

  return { areas, ready };
}

/**
 * One published city / service page. `initialArea` is the copy the server already
 * loaded, so the page renders in the first HTML response (what search engines read).
 */
export function usePublicServiceArea(slug: string, initialArea?: PublicServiceArea | null) {
  const hasInitial = initialArea !== undefined;
  const { areas, ready: listReady } = usePublicServiceAreas();
  const [directArea, setDirectArea] = useState<PublicServiceArea | null>(initialArea ?? null);
  const [directReady, setDirectReady] = useState(hasInitial);

  useEffect(() => {
    if (hasInitial) {
      return;
    }

    let cancelled = false;

    void fetchPublicServiceAreaBySlugAction(slug).then((fromServer) => {
      if (!cancelled) {
        setDirectArea(fromServer);
        setDirectReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [hasInitial, slug]);

  const area = useMemo(() => {
    if (directArea) {
      return directArea;
    }

    if (!listReady) {
      return null;
    }

    return areas.find((item) => item.slug === slug) ?? null;
  }, [areas, directArea, listReady, slug]);

  return { area, ready: directReady || listReady };
}

/**
 * One published sub-page. `initialPage` is the server-loaded copy (see usePublicServiceArea).
 * `live: false` keeps `initialPage` as-is (editor previews of drafts the store won't return).
 */
export function usePublicServiceAreaSubPage(
  parentSlug: string,
  subPageSlug: string,
  initialPage?: PublicServiceAreaSubPage | null,
  { live = true }: { live?: boolean } = {},
) {
  const hasInitial = initialPage !== undefined;
  const [page, setPage] = useState<PublicServiceAreaSubPage | null>(initialPage ?? null);
  const [ready, setReady] = useState(hasInitial);

  const refresh = useCallback(() => {
    void fetchPublicServiceAreaSubPageAction(parentSlug, subPageSlug).then((fromServer) => {
      if (fromServer) {
        setPage(fromServer);
        setReady(true);
        return;
      }

      try {
        setPage(findPublicServiceAreaSubPage(parentSlug, subPageSlug));
      } catch {
        setPage(null);
      }

      setReady(true);
    });
  }, [parentSlug, subPageSlug]);

  useEffect(() => {
    if (!live) {
      return;
    }

    if (!hasInitial) {
      refresh();
    }

    const handleChange = () => {
      refresh();
    };

    window.addEventListener(SERVICE_AREAS_CHANGED_EVENT, handleChange);
    window.addEventListener("storage", handleChange);

    return () => {
      window.removeEventListener(SERVICE_AREAS_CHANGED_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, [hasInitial, live, refresh]);

  return { page, ready };
}
