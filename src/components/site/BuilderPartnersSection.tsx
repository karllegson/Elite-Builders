import Image from "next/image";
import { builders, buildersIntro } from "@/lib/site/builders";

export default function BuilderPartnersSection() {
  return (
    <section className="border-y border-solid border-gray-100 bg-gray-50/80 py-16 sm:py-20">
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-site-accent">
            Builders We Work With
          </p>
          <h2 className="mt-3 text-3xl font-bold text-brand-navy sm:text-4xl">
            Trusted by Production Builders &amp; General Contractors
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500">{buildersIntro}</p>
        </div>

        <ul className="mx-auto mt-12 flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-8 sm:gap-x-14 lg:gap-x-16">
          {builders.map((builder) => (
            <li
              key={builder.name}
              className="group flex w-[9.5rem] flex-col items-center sm:w-[10.5rem]"
            >
              <div
                className={`flex w-full items-center justify-center px-2 transition-opacity group-hover:opacity-100 ${
                  builder.logoClassName ?? "h-14"
                }`}
              >
                <Image
                  src={builder.logo}
                  alt={builder.name}
                  width={builder.logoWidth ?? 180}
                  height={builder.logoHeight ?? 56}
                  className={`w-auto max-w-full object-contain opacity-90 transition-opacity group-hover:opacity-100 ${
                    builder.logoImageClassName ?? "max-h-12"
                  }`}
                />
              </div>
              <span className="mt-3 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-gray-400">
                {builder.category}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
