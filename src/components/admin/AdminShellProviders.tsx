"use client";

import type { ReactNode } from "react";
import { AdminToastProvider } from "@/components/admin/toast/AdminToastProvider";

export function AdminShellProviders({ children }: { children: ReactNode }) {
  return <AdminToastProvider>{children}</AdminToastProvider>;
}
