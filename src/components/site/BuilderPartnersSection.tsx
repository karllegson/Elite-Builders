import Image from "next/image";
import { builders, buildersIntro } from "@/lib/site/builders";

export default function BuilderPartnersSection() {
  return (
    <section className="border-y border-solid border-gray-100 bg-gray-50/80 py-10 sm:py-20">
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-brand-blue sm:text-sm sm:tracking-[0.18em]">
            Builders We Work With
          </p>
          <h2 className="mt-2 text-lg font-bold leading-snug text-brand-navy sm:mt-3 sm:text-3xl sm:leading-tight lg:text-4xl">
            Trusted by Production Builders &amp; General Contractors
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-gray-500 sm:mt-4 sm:text-base">{buildersIntro}</p>
        </div>

        <ul className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-5 sm:mt-12 sm:gap-x-14 sm:gap-y-8 lg:gap-x-16">
          {builders.map((builder) => (
            <li
              key={builder.name}
              className="group flex w-[7rem] flex-col items-center sm:w-[10.5rem]"
            >
              <div
                className={`flex w-full items-center justify-center px-1 transition-opacity group-hover:opacity-100 sm:px-2 ${
                  builder.logoClassName ?? "h-10 sm:h-14"
                }`}
              >
                <Image
                  src={builder.logo}
                  alt={builder.name}
                  width={builder.logoWidth ?? 180}
                  height={builder.logoHeight ?? 56}
                  className={`w-auto max-w-full object-contain opacity-90 transition-opacity group-hover:opacity-100 ${
                    builder.logoImageClassName ?? "max-h-8 sm:max-h-12"
                  }`}
                />
              </div>
              <span className="mt-2 text-center text-[10px] font-medium uppercase tracking-[0.1em] text-gray-500 sm:mt-3 sm:text-xs sm:tracking-[0.12em]">
                {builder.category}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
