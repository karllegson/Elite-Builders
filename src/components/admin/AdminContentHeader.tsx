"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { adminPageTitles } from "@/lib/admin/config";
import { FORMS_OPEN_TEMPLATES_EVENT } from "@/lib/admin/formTemplates";
import { fetchFaqForEditAction } from "@/app/admin/(shell)/faqs/actions";

type PageActionLink = { type?: "link"; href: string; label: string };
type PageActionTrigger = { type: "trigger"; label: string; event: string };
type PageAction = PageActionLink | PageActionTrigger;

const pageActions: Record<string, PageAction[]> = {
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
  "/admin/forms": [
    {
      type: "trigger",
      label: "Add New",
      event: FORMS_OPEN_TEMPLATES_EVENT,
    },
  ],
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

function resolvePageAction(pathname: string): PageAction[] | undefined {
  if (pathname.startsWith("/admin/service-areas/") && pathname !== "/admin/service-areas/new") {
    const segment = pathname.split("/").pop();

    if (segment && segment !== "sorting" && segment !== "nested") {
      return [{ href: "/admin/service-areas/new", label: "Add New Service Area" }];
    }
  }

  return pageActions[pathname];
}

function isLinkAction(action: PageAction): action is PageActionLink {
  return action.type !== "trigger";
}

export function AdminContentHeader() {
  const pathname = usePathname();
  const faqEditId = useMemo(() => {
    const match = pathname.match(/^\/admin\/faqs\/([^/]+)$/);
    if (!match || match[1] === "new" || match[1] === "categories") {
      return null;
    }
    return match[1];
  }, [pathname]);
  const [editFaqMeta, setEditFaqMeta] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (!faqEditId) {
      return;
    }

    let cancelled = false;

    void fetchFaqForEditAction(faqEditId).then((result) => {
      if (!cancelled && result.faq) {
        setEditFaqMeta({ id: faqEditId, title: result.faq.title });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [faqEditId]);

  const title =
    faqEditId && editFaqMeta?.id === faqEditId
      ? `Edit FAQ: ${editFaqMeta.title}`
      : resolvePageTitle(pathname);
  const action = resolvePageAction(pathname);

  if (
    pathname === "/admin/forms/entries" ||
    /^\/admin\/forms\/[^/]+\/(edit|settings)(\/|$)/.test(pathname)
  ) {
    return null;
  }

  return (
    <div className="admin-content-header">
      <div className="admin-content-header-start">
        <h1 className="admin-content-header-title">{title}</h1>
        {action ? (
          <div className="admin-page-title-actions">
            {action.map((item) =>
              isLinkAction(item) ? (
                <Link key={item.label} href={item.href} className="admin-page-title-action">
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  className="admin-page-title-action"
                  onClick={() => window.dispatchEvent(new CustomEvent(item.event))}
                >
                  {item.label}
                </button>
              ),
            )}
          </div>
        ) : null}
      </div>
      <button type="button" className="admin-screen-options">
        Screen Options
      </button>
    </div>
  );
}
