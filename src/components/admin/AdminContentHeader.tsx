"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminPageTitles } from "@/lib/admin/config";

const pageActions: Record<string, { href: string; label: string }> = {
  "/admin/posts": { href: "/admin/posts/new", label: "Add Post" },
};

export function AdminContentHeader() {
  const pathname = usePathname();
  const title = adminPageTitles[pathname] ?? "Administration";
  const action = pageActions[pathname];

  return (
    <div className="admin-content-header">
      <div className="admin-content-header-start">
        <h1 className="admin-content-header-title">{title}</h1>
        {action ? (
          <Link href={action.href} className="admin-page-title-action">
            {action.label}
          </Link>
        ) : null}
      </div>
      <button type="button" className="admin-screen-options">
        Screen Options
      </button>
    </div>
  );
}
