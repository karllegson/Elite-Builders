"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { adminPageTitles } from "@/lib/admin/config";
import { getFaqById } from "@/lib/admin/faqsData";

const pageActions: Record<string, { href: string; label: string }> = {
  "/admin/posts": { href: "/admin/posts/new", label: "Add Post" },
  "/admin/faqs": { href: "/admin/faqs/new", label: "Add New FAQ" },
};

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
    editFaqTitle !== null
      ? `Edit FAQ: ${editFaqTitle}`
      : (adminPageTitles[pathname] ?? "Administration");
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
