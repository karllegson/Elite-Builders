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

export function usePublicServiceAreas() {
  const [areas, setAreas] = useState<PublicServiceArea[]>([]);
  const [ready, setReady] = useState(false);

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

export function usePublicServiceArea(slug: string) {
  const { areas, ready: listReady } = usePublicServiceAreas();
  const [directArea, setDirectArea] = useState<PublicServiceArea | null>(null);
  const [directReady, setDirectReady] = useState(false);

  useEffect(() => {
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
  }, [slug]);

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

export function usePublicServiceAreaSubPage(parentSlug: string, subPageSlug: string) {
  const [page, setPage] = useState<PublicServiceAreaSubPage | null>(null);
  const [ready, setReady] = useState(false);

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

  return { page, ready };
}
