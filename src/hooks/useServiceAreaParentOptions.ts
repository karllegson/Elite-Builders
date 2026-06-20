"use client";

import { useCallback, useEffect, useState } from "react";
import type { ServiceAreaParentOption } from "@/lib/admin/serviceAreaEditor";
import { buildServiceAreaParentOptions } from "@/lib/admin/serviceAreaEditor";
import { SERVICE_AREAS_CHANGED_EVENT } from "@/lib/admin/serviceAreasData";

export function useServiceAreaParentOptions(excludeId?: string) {
  const [options, setOptions] = useState<ServiceAreaParentOption[]>([]);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    setOptions(buildServiceAreaParentOptions(excludeId));
    setReady(true);
  }, [excludeId]);

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

  return { options, ready };
}
