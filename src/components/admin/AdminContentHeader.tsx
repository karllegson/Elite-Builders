"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminPageTitles } from "@/lib/admin/config";

const pageActions: Record<string, { href: string; label: string }[]> = {
  "/admin/posts": [{ href: "/admin/posts/new", label: "Add Post" }],
  "/admin/pages": [
    { href: "/admin/pages/new", label: "Add" },
    { href: "/admin/pages/new?mode=multiple", label: "Add Multiple" },
    { href: "/admin/pages/new?mode=link", label: "Add Link" },
  ],
  "/admin/pages/default": [{ href: "/admin/pages/new", label: "Add Page" }],
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
          <div className="admin-page-title-actions">
            {action.map((item) => (
              <Link key={item.label} href={item.href} className="admin-page-title-action">
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <button type="button" className="admin-screen-options">
        Screen Options
      </button>
    </div>
  );
}
