"use client";

import { usePathname } from "next/navigation";
import { adminPageTitles } from "@/lib/admin/config";

export function AdminContentHeader() {
  const pathname = usePathname();
  const title = adminPageTitles[pathname] ?? "Administration";

  return (
    <div className="admin-content-header">
      <h1 className="admin-content-header-title">{title}</h1>
      <button type="button" className="admin-screen-options">
        Screen Options
      </button>
    </div>
  );
}
