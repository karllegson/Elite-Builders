"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminPageTitles } from "@/lib/admin/config";

const pageActions: Record<string, { href: string; label: string }> = {
  "/admin/posts": { href: "/admin/posts/new", label: "Add Post" },
  "/admin/service-areas": { href: "/admin/service-areas/new", label: "Add New Service Area" },
};

function resolvePageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/service-areas/") && pathname !== "/admin/service-areas/new") {
    const segment = pathname.split("/").pop();

    if (segment && segment !== "sorting" && segment !== "nested") {
      return "Edit Service Area";
    }
  }

  return adminPageTitles[pathname] ?? "Administration";
}

function resolvePageAction(pathname: string): { href: string; label: string } | undefined {
  if (pathname.startsWith("/admin/service-areas/") && pathname !== "/admin/service-areas/new") {
    const segment = pathname.split("/").pop();

    if (segment && segment !== "sorting" && segment !== "nested") {
      return { href: "/admin/service-areas/new", label: "Add New Service Area" };
    }
  }

  return pageActions[pathname];
}

export function AdminContentHeader() {
  const pathname = usePathname();
  const title = resolvePageTitle(pathname);
  const action = resolvePageAction(pathname);

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
