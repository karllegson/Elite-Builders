"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronRight, User } from "lucide-react";
import TeamMemberModal from "@/components/site/TeamMemberModal";
import type { TeamMember } from "@/lib/site/config";

type TeamSectionProps = {
  members: TeamMember[];
};

function TeamAvatar({ member }: { member: TeamMember }) {
  if (member.imageSrc) {
    return (
      <Image
        src={member.imageSrc}
        alt={member.name}
        width={160}
        height={160}
        className="size-20 rounded-full object-cover ring-2 ring-white sm:size-36 sm:ring-4"
      />
    );
  }

  if (member.isPlaceholder) {
    return (
      <div
        className="flex size-20 items-center justify-center rounded-full bg-gray-200 text-gray-400 ring-2 ring-white sm:size-36 sm:ring-4"
        aria-hidden
      >
        <User className="size-7 sm:size-12" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div
      className="flex size-20 items-center justify-center rounded-full bg-site-nav-cta text-lg font-semibold text-white ring-2 ring-white sm:size-36 sm:text-3xl sm:ring-4"
      aria-hidden
    >
      {member.initials}
    </div>
  );
}

export default function TeamSection({ members }: TeamSectionProps) {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const firstName = (name: string) => name.split(" ")[0];

  return (
    <>
      <section id="team" className="scroll-mt-28 bg-[#f5f8fd] py-12 sm:py-24">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-lg font-bold leading-snug text-site-text-dark sm:text-3xl sm:leading-tight lg:text-4xl">
              Meet Our Team
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-site-text sm:mt-4 sm:text-base">
              The people behind every frame — experienced, skilled, and committed to doing it right.
            </p>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-8 lg:grid-cols-4">
            {members.map((member) => (
              <li key={member.id}>
                <article className="flex h-full flex-col items-center rounded-xl bg-white px-2 pb-3 pt-4 text-center shadow-md sm:rounded-2xl sm:px-6 sm:pb-6 sm:pt-8">
                  <TeamAvatar member={member} />
                  <h3
                    className={`mt-2 text-sm font-semibold leading-tight sm:mt-5 sm:text-xl ${
                      member.isPlaceholder ? "text-site-text-muted" : "text-site-text-dark"
                    }`}
                  >
                    {member.name}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-medium leading-snug text-site-nav-cta sm:mt-1 sm:text-sm">
                    {member.role}
                  </p>
                  {member.isPlaceholder || !member.profile ? (
                    <p className="mt-3 w-full rounded-lg border border-dashed border-gray-300 px-2 py-1.5 text-[10px] leading-snug text-site-text-muted sm:mt-6 sm:px-4 sm:py-3 sm:text-sm">
                      Profile coming soon
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveMember(member)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-site-nav-cta px-2 py-2 text-[10px] font-medium leading-tight text-white transition-colors hover:bg-brand-navy-light sm:mt-6 sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
                    >
                      <span className="sm:hidden">Read More</span>
                      <span className="hidden sm:inline">Read About {firstName(member.name)}</span>
                      <ChevronRight className="size-3 shrink-0 sm:size-4" aria-hidden />
                    </button>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <TeamMemberModal member={activeMember} onClose={() => setActiveMember(null)} />
    </>
  );
}
