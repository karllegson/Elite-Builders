"use client";

import {
  CalendarCheck,
  ClipboardList,
  FileText,
  Files,
  HelpCircle,
  Image,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Palette,
  Plug,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  adminNavItems,
  adminSettingsNav,
  type AdminNavItem,
} from "@/lib/admin/config";

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-text": FileText,
  image: Image,
  files: Files,
  "layout-grid": LayoutGrid,
  "clipboard-list": ClipboardList,
  "calendar-check": CalendarCheck,
  "map-pin": MapPin,
  "help-circle": HelpCircle,
  star: Star,
  search: Search,
  "sliders-horizontal": SlidersHorizontal,
  palette: Palette,
  plug: Plug,
  users: Users,
  wrench: Wrench,
  settings: Settings,
};

function isNavItemActive(item: AdminNavItem, currentPath: string) {
  if (item.href === "/admin") {
    return currentPath === "/admin";
  }

  if (item.children?.length) {
    return (
      currentPath === item.href || currentPath.startsWith(`${item.href}/`)
    );
  }

  return currentPath.startsWith(item.href);
}

function isSubNavItemActive(href: string, currentPath: string) {
  if (
    href === "/admin/posts" ||
    href === "/admin/service-areas" ||
    href === "/admin/pages" ||
    href === "/admin/faqs" ||
    href === "/admin/reviews"
  ) {
    return currentPath === href;
  }

  return currentPath.startsWith(href);
}

function NavLink({ item, currentPath }: { item: AdminNavItem; currentPath: string }) {
  const itemRef = useRef<HTMLLIElement>(null);
  const submenuRef = useRef<HTMLUListElement>(null);
  const hideTimeoutRef = useRef<number | undefined>(undefined);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [submenuStyle, setSubmenuStyle] = useState<CSSProperties>({});
  const Icon = iconMap[item.icon] ?? LayoutDashboard;
  const isActive = isNavItemActive(item, currentPath);
  const isSoon = item.phase > 1;
  const hasChildren = Boolean(item.children?.length);
  const childCount = item.children?.length ?? 0;

  const positionSubmenu = () => {
    if (!itemRef.current || !submenuRef.current) {
      return;
    }

    const itemRect = itemRef.current.getBoundingClientRect();
    const submenuHeight = submenuRef.current.offsetHeight;

    setSubmenuStyle({
      top: itemRect.top + itemRect.height / 2 - submenuHeight / 2,
      left: itemRect.right,
    });
  };

  const showSubmenu = () => {
    window.clearTimeout(hideTimeoutRef.current);

    if (!hasChildren || !itemRef.current) {
      return;
    }

    setSubmenuOpen(true);
  };

  useLayoutEffect(() => {
    if (!submenuOpen) {
      return;
    }

    positionSubmenu();

    window.addEventListener("scroll", positionSubmenu, true);
    window.addEventListener("resize", positionSubmenu);

    return () => {
      window.removeEventListener("scroll", positionSubmenu, true);
      window.removeEventListener("resize", positionSubmenu);
    };
  }, [submenuOpen, childCount]);

  const scheduleHideSubmenu = () => {
    window.clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = window.setTimeout(() => {
      setSubmenuOpen(false);
    }, 120);
  };

  return (
    <li
      ref={itemRef}
      className={
        hasChildren
          ? `admin-sidebar-item admin-sidebar-item-has-children${submenuOpen ? " is-submenu-open" : ""}`
          : "admin-sidebar-item"
      }
      onMouseEnter={showSubmenu}
      onMouseLeave={scheduleHideSubmenu}
      onFocus={showSubmenu}
      onBlur={scheduleHideSubmenu}
    >
      <a
        href={item.href}
        className={`admin-sidebar-link${isActive ? " is-active" : ""}${isSoon && !isActive ? " is-soon" : ""}`}
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden />
        <span>{item.label}</span>
      </a>
      {hasChildren ? (
        <ul
          ref={submenuRef}
          className={`admin-sidebar-submenu${submenuOpen ? " is-open" : ""}`}
          style={submenuStyle}
          aria-label={`${item.label} submenu`}
          onMouseEnter={showSubmenu}
          onMouseLeave={scheduleHideSubmenu}
        >
          {item.children!.map((child) => {
            const isChildActive = isSubNavItemActive(child.href, currentPath);

            return (
              <li key={child.href}>
                <a
                  href={child.href}
                  className={`admin-sidebar-submenu-link${isChildActive ? " is-active" : ""}`}
                >
                  {child.label}
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </li>
  );
}

export function AdminSidebar() {
  const currentPath = usePathname();

  return (
    <aside className="admin-sidebar">
      <ul className="admin-sidebar-nav">
        {adminNavItems.map((item) => (
          <NavLink key={item.href} item={item} currentPath={currentPath} />
        ))}
        <li className="admin-sidebar-separator" aria-hidden />
        <NavLink item={adminSettingsNav} currentPath={currentPath} />
      </ul>
      <div className="admin-sidebar-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Elite Builders IX" />
      </div>
    </aside>
  );
}
