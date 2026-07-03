import Link from "next/link";
import { Phone } from "lucide-react";
import { business } from "@/lib/site/config";

export function BlogEstimateWidget() {
  return (
    <aside className="blog-widget blog-estimate-widget">
      <div className="blog-estimate-widget-header">Request a Free Estimate</div>
      <div className="blog-estimate-widget-body">
        <p className="blog-estimate-widget-copy">
          Planning a remodel or new build? Tell us about your framing, siding, or
          deck needs and our team will follow up within one business day.
        </p>
        <Link href="/#estimate" className="blog-estimate-widget-primary">
          Request a Free Estimate
        </Link>
        <a href={business.phoneHref} className="blog-estimate-widget-phone">
          <Phone size={18} strokeWidth={2} aria-hidden />
          {business.phone}
        </a>
      </div>
    </aside>
  );
}
