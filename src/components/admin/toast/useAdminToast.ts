"use client";

import { useContext } from "react";
import { AdminToastContext } from "@/components/admin/toast/AdminToastProvider";

export function useAdminToast() {
  const context = useContext(AdminToastContext);

  if (!context) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }

  return context;
}
