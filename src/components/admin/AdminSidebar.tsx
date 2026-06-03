"use client";

import {
  FileText,
  Files,
  HelpCircle,
  Image,
  Images,
  LayoutDashboard,
  MapPin,
  Settings,
  Star,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  adminNavItems,
  adminSettingsNav,
  type AdminNavItem,
} from "@/lib/admin/config";

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-text": FileText,
  files: Files,
  images: Images,
  "map-pin": MapPin,
  "help-circle": HelpCircle,
  star: Star,
  image: Image,
  settings: Settings,
};

function NavLink({ item, currentPath }: { item: AdminNavItem; currentPath: string }) {
  const Icon = iconMap[item.icon] ?? LayoutDashboard;
  const isActive =
    item.href === "/admin"
      ? currentPath === "/admin"
      : currentPath.startsWith(item.href);
  const isSoon = item.phase > 1;

  return (
    <li>
      <a
        href={item.href}
        className={`admin-sidebar-link${isActive ? " is-active" : ""}${isSoon && !isActive ? " is-soon" : ""}`}
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden />
        <span>{item.label}</span>
      </a>
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
