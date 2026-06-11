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
        className="size-36 rounded-full object-cover ring-4 ring-white"
      />
    );
  }

  if (member.isPlaceholder) {
    return (
      <div
        className="flex size-36 items-center justify-center rounded-full bg-gray-200 text-gray-400 ring-4 ring-white"
        aria-hidden
      >
        <User size={48} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div
      className="flex size-36 items-center justify-center rounded-full bg-site-nav-cta text-3xl font-semibold text-white ring-4 ring-white"
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
      <section id="team" className="scroll-mt-28 bg-[#f5f8fd] py-24">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-site-text-dark sm:text-4xl">Meet Our Team</h2>
            <p className="mt-4 text-base leading-relaxed text-site-text">
              The people behind every frame — experienced, skilled, and committed to doing it right.
            </p>
          </div>

          <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((member) => (
              <li key={member.id}>
                <article className="flex h-full flex-col items-center rounded-2xl bg-white px-6 pb-6 pt-8 text-center shadow-md">
                  <TeamAvatar member={member} />
                  <h3
                    className={`mt-5 text-xl font-semibold ${
                      member.isPlaceholder ? "text-site-text-muted" : "text-site-text-dark"
                    }`}
                  >
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-site-nav-cta">{member.role}</p>
                  {member.isPlaceholder || !member.profile ? (
                    <p className="mt-6 w-full rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm text-site-text-muted">
                      Profile coming soon
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveMember(member)}
                      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-site-nav-cta px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-navy-light"
                    >
                      Read About {firstName(member.name)}
                      <ChevronRight size={16} aria-hidden />
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
