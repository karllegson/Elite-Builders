import Link from "next/link";

export type SiteBreadcrumb = {
  label: string;
  href?: string;
};

type SitePageTitleBarProps = {
  title: string;
  breadcrumbs: SiteBreadcrumb[];
};

export function SitePageTitleBar({ title, breadcrumbs }: SitePageTitleBarProps) {
  return (
    <div className="site-page-title-bar">
      <h1 className="site-page-title-bar-heading">{title}</h1>
      <nav className="site-page-title-bar-breadcrumbs" aria-label="Breadcrumb">
        <ol className="site-page-title-bar-trail">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li key={`${item.label}-${index}`}>
                {index > 0 ? (
                  <span className="site-page-title-bar-sep" aria-hidden>
                    /{" "}
                  </span>
                ) : null}
                {item.href && !isLast ? (
                  <Link href={item.href}>{item.label}</Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
