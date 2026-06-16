"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  Flag,
  Settings,
  ShieldCheck,
  Star,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";
import {
  FORM_SETTINGS_NAV,
  getFormSettingsHref,
  type FormSettingsSection,
} from "@/lib/admin/formSettings";

const ICONS: Record<FormSettingsSection, LucideIcon> = {
  "form-settings": Settings,
  confirmations: CheckCircle2,
  notifications: Flag,
  "personal-data": UserCircle2,
  akismet: ShieldCheck,
  "post-creation": Star,
};

type FormSettingsNavProps = {
  formId: number;
};

export function FormSettingsNav({ formId }: FormSettingsNavProps) {
  const pathname = usePathname();

  return (
    <nav className="admin-form-settings-nav" aria-label="Form settings">
      <ul className="admin-form-settings-nav-list">
        {FORM_SETTINGS_NAV.map((item) => {
          const href = getFormSettingsHref(formId, item.path);
          const isActive = pathname === href;
          const Icon = ICONS[item.section];

          return (
            <li key={item.section}>
              <Link
                href={href}
                className={`admin-form-settings-nav-link${isActive ? " is-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={16} aria-hidden />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
