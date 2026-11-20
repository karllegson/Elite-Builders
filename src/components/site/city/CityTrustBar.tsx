import { BadgeCheck, CalendarCheck, MapPin, ShieldCheck } from "lucide-react";
import { ClientTodoNote } from "@/components/site/city/ClientTodoNote";
import { clientTodo } from "@/lib/site/cityPages";
import { business } from "@/lib/site/config";

const CSLB_LOOKUP_URL = `https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=${business.licenseNumber}`;

const items = [
  { icon: ShieldCheck, title: "Licensed & insured", detail: "California contractor" },
  {
    icon: BadgeCheck,
    title: business.license,
    detail: "Verify on CSLB",
    href: CSLB_LOOKUP_URL,
  },
  { icon: CalendarCheck, title: `Since ${business.foundedYear}`, detail: "Serving California" },
  { icon: MapPin, title: "Modesto office", detail: business.address.street },
] as const;

const ratingTodo = clientTodo(
  "Add the Google review rating here once there are real reviews (pulled from the Reviews module — never typed in).",
);

export function CityTrustBar({ showDrafts }: { showDrafts: boolean }) {
  return (
    <section aria-label="Why you can trust Elite Builders IX" className="border-b border-solid border-site-line bg-white">
      <div className="site-container py-6 sm:py-8">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-5 lg:grid-cols-4 lg:gap-8">
          {items.map((item) => {
            const Icon = item.icon;
            const body = (
              <>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-site-surface text-brand-navy sm:size-11">
                  <Icon size={20} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[0.9375rem] font-bold leading-tight text-brand-ink sm:text-base">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-site-text-muted sm:text-sm">
                    {item.detail}
                  </span>
                </span>
              </>
            );

            return (
              <li key={item.title}>
                {"href" in item ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl transition-colors hover:text-brand-blue"
                  >
                    {body}
                  </a>
                ) : (
                  <div className="flex items-center gap-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
        <ClientTodoNote todo={ratingTodo} show={showDrafts} className="mt-5" />
      </div>
    </section>
  );
}
