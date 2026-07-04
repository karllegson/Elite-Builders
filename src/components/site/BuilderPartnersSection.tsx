import BuilderMarquee from "@/components/site/BuilderMarquee";

export default function BuilderPartnersSection() {
  return (
    <section className="border-y border-solid border-gray-100 bg-white py-8 sm:py-12">
      <div className="site-container">
        <p className="text-center text-[10px] font-medium uppercase tracking-[0.16em] text-gray-500 sm:text-xs sm:tracking-[0.2em]">
          <span className="font-bold text-brand-blue">Trusted</span>
          {"\u00A0"}by leading builders &amp; general contractors
        </p>
      </div>

      <BuilderMarquee />
    </section>
  );
}
