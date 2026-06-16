import {
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  Gift,
  GraduationCap,
  HeartHandshake,
  Laptop,
  List,
  MessageCircle,
  Newspaper,
  Plus,
  ShoppingBag,
  ShoppingBasket,
  Smile,
  Trophy,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { FormTemplate, FormTemplateIcon } from "@/lib/admin/formTemplates";

const ICON_MAP: Record<FormTemplateIcon, LucideIcon> = {
  plus: Plus,
  message: MessageCircle,
  list: List,
  trophy: Trophy,
  "heart-hand": HeartHandshake,
  "shopping-bag": ShoppingBag,
  "shopping-basket": ShoppingBasket,
  "id-badge": UserCheck,
  calendar: Calendar,
  gift: Gift,
  newspaper: Newspaper,
  "file-dollar": FileText,
  smile: Smile,
  "user-check": UserCheck,
  laptop: Laptop,
  "file-signature": FileText,
  quote: MessageCircle,
  "credit-card": CreditCard,
  "graduation-cap": GraduationCap,
  briefcase: Briefcase,
};

type FormTemplatePreviewProps = {
  template: FormTemplate;
};

function PreviewLines({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={`admin-form-template-line${index === count - 1 ? " is-short" : ""}`}
        />
      ))}
    </>
  );
}

function PreviewRadios() {
  return (
    <div className="admin-form-template-radios">
      <span className="admin-form-template-radio is-filled" />
      <span className="admin-form-template-radio" />
      <span className="admin-form-template-radio" />
    </div>
  );
}

function PreviewStars() {
  return (
    <div className="admin-form-template-stars" aria-hidden>
      {"★★★★★"}
    </div>
  );
}

function PreviewButton({ accent }: { accent: FormTemplate["accent"] }) {
  if (!accent || accent === "none") {
    return null;
  }

  return <span className={`admin-form-template-btn admin-form-template-btn-${accent}`} />;
}

function PreviewBody({ template }: FormTemplatePreviewProps) {
  if (template.variant === "blank") {
    return (
      <div className="admin-form-template-blank">
        <Plus size={28} strokeWidth={1.5} aria-hidden />
      </div>
    );
  }

  return (
    <div className="admin-form-template-mock">
      <div className="admin-form-template-mock-icon">
        {(() => {
          const Icon = ICON_MAP[template.icon];
          return <Icon size={14} strokeWidth={2} aria-hidden />;
        })()}
      </div>
      <PreviewLines
        count={
          template.variant === "advanced-contact" ||
          template.variant === "employment" ||
          template.variant === "agency"
            ? 4
            : 3
        }
      />
      {template.variant === "contest" || template.variant === "webinar" ? <PreviewRadios /> : null}
      {template.variant === "survey" || template.variant === "testimonial" ? (
        <PreviewStars />
      ) : null}
      {template.variant === "signature" ? (
        <span className="admin-form-template-signature-line" />
      ) : null}
      {template.variant === "membership" || template.variant === "sponsorship" ? (
        <span className="admin-form-template-progress" />
      ) : null}
      <PreviewButton accent={template.accent} />
    </div>
  );
}

export function FormTemplatePreview({ template }: FormTemplatePreviewProps) {
  return (
    <div
      className="admin-form-template-preview"
      style={{ backgroundColor: template.bg }}
    >
      <PreviewBody template={template} />
    </div>
  );
}
