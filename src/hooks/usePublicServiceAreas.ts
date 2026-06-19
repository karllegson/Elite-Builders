"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SERVICE_AREAS_CHANGED_EVENT } from "@/lib/admin/serviceAreasData";
import {
  getPublicServiceAreasFallback,
  getPublicServiceAreasFromStore,
  type PublicServiceArea,
} from "@/lib/site/serviceAreasPublic";

function loadPublicServiceAreas(): PublicServiceArea[] {
  if (typeof window === "undefined") {
    return getPublicServiceAreasFallback();
  }

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

export function usePublicServiceAreas() {
  const [areas, setAreas] = useState<PublicServiceArea[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setAreas(loadPublicServiceAreas());
    setReady(true);
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
  const { areas, ready } = usePublicServiceAreas();

  const area = useMemo(
    () => (ready ? areas.find((item) => item.slug === slug) ?? null : null),
    [areas, ready, slug],
  );

  return { area, ready };
}
