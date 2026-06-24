export function ServiceAreaFaqEmpty() {
  return (
    <section
      data-quick-link-id="faq"
      className="service-area-faq-empty"
      aria-labelledby="service-area-faq-heading"
    >
      <h2 id="service-area-faq-heading" className="sr-only">
        FAQ
      </h2>
      <p className="service-area-faq-empty__message" role="status">
        No FAQs found.
      </p>
      <hr className="service-area-faq-empty__divider" />
    </section>
  );
}
