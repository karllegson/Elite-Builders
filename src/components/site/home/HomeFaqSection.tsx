import { Phone } from "lucide-react";
import { business } from "@/lib/site/config";

type Faq = { question: string; answer: string };

/**
 * FAQ: native <details>, so answers stay in the HTML, open/closed is announced to screen
 * readers, and Enter/Space toggle it with no JavaScript. First item starts open.
 */
export default function HomeFaqSection({ faqs }: { faqs: readonly Faq[] }) {
  return (
    <section className="section bg-white">
      <div className="site-container grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="reveal-up lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow">FAQ</p>
          <h2 className="section-title mt-4">Framing Contractor FAQ</h2>
          <p className="section-lede mt-5">
            Straight answers about our services, service areas, and what makes Elite Builders
            different.
          </p>

          <div className="bg-ink mt-8 rounded-3xl p-7 sm:p-8">
            <p className="font-display text-lg font-semibold text-white">Still have questions?</p>
            <p className="mt-1.5 text-[0.9375rem] text-white/75">Talk to a real person on our team.</p>
            <a href={business.phoneHref} className="btn btn-primary mt-6">
              <Phone size={16} aria-hidden />
              Call {business.phone}
            </a>
          </div>
        </div>

        <div className="border-t border-solid border-site-line">
          {faqs.map((faq, index) => (
            <details
              key={faq.question}
              className="faq-item faq-item--numbered group"
              open={index === 0}
            >
              <summary>
                <span className="faq-num font-display" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="faq-question">{faq.question}</span>
                <span className="faq-icon" aria-hidden />
              </summary>
              <p className="faq-answer">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
