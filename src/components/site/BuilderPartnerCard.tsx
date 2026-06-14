import Image from "next/image";
import type { Builder } from "@/lib/site/builders";

export default function BuilderPartnerCard({ builder }: { builder: Builder }) {
  return (
    <li className="flex flex-col items-center justify-center rounded-xl border border-solid border-white/15 bg-white/5 px-5 py-6 text-center">
      <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white px-4 py-3">
        <Image
          src={builder.logo}
          alt={`${builder.name} logo`}
          width={200}
          height={64}
          className="max-h-12 w-auto max-w-full object-contain"
        />
      </div>
      <span className="mt-3 text-sm font-bold text-white">{builder.name}</span>
      <span className="mt-1 text-xs text-white/60">{builder.category}</span>
    </li>
  );
}
