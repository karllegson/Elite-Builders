"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { adminPageTitles } from "@/lib/admin/config";
import { getFaqById } from "@/lib/admin/faqsData";

const pageActions: Record<string, { href: string; label: string }[]> = {
  "/admin/posts": [{ href: "/admin/posts/new", label: "Add Post" }],
  "/admin/pages": [
    { href: "/admin/pages/new", label: "Add" },
    { href: "/admin/pages/new?mode=multiple", label: "Add Multiple" },
    { href: "/admin/pages/new?mode=link", label: "Add Link" },
  ],
  "/admin/pages/default": [{ href: "/admin/pages/new", label: "Add Page" }],
  "/admin/service-areas": [
    { href: "/admin/service-areas/new", label: "Add New Service Area" },
  ],
  "/admin/faqs": [{ href: "/admin/faqs/new", label: "Add New FAQ" }],
  "/admin/reviews": [{ href: "/admin/reviews/new", label: "Add New Review" }],
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

function resolvePageAction(pathname: string): { href: string; label: string }[] | undefined {
  if (pathname.startsWith("/admin/service-areas/") && pathname !== "/admin/service-areas/new") {
    const segment = pathname.split("/").pop();

    if (segment && segment !== "sorting" && segment !== "nested") {
      return [{ href: "/admin/service-areas/new", label: "Add New Service Area" }];
    }
  }

  return pageActions[pathname];
}

export function AdminContentHeader() {
  const pathname = usePathname();
  const [editFaqTitle, setEditFaqTitle] = useState<string | null>(null);

  useEffect(() => {
    const match = pathname.match(/^\/admin\/faqs\/([^/]+)$/);
    if (!match || match[1] === "new" || match[1] === "categories") {
      setEditFaqTitle(null);
      return;
    }

    const faq = getFaqById(match[1]);
    setEditFaqTitle(faq?.title ?? null);
  }, [pathname]);

  const title =
    editFaqTitle !== null ? `Edit FAQ: ${editFaqTitle}` : resolvePageTitle(pathname);
  const action = resolvePageAction(pathname);

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
