import Link from "next/link";

type PagePlaceholderProps = {
  title: string;
  description?: string;
};

/** Temporary stub for core pages that haven't been built yet. */
export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="bg-gray-50">
      <div className="site-container flex flex-col items-start gap-4 py-24">
        <span className="rounded-full bg-brand-navy/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-navy">
          Coming Soon
        </span>
        <h1 className="text-4xl font-extrabold text-brand-navy">{title}</h1>
        <p className="max-w-2xl text-gray-600">
          {description ??
            "This page is under construction. In the meantime, request a free estimate and we'll get back to you within one business day."}
        </p>
        <Link
          href="/#estimate"
          className="mt-2 rounded-md bg-brand-red px-6 py-3 font-bold text-white transition-colors hover:bg-brand-red-dark"
        >
          Request a Free Estimate
        </Link>
      </div>
    </section>
  );
}
