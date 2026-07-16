"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, User } from "lucide-react";
import TeamHeadshotDevTools from "@/components/site/TeamHeadshotDevTools";
import { TeamHeadshotImage } from "@/components/site/TeamHeadshotImage";
import TeamMemberModal from "@/components/site/TeamMemberModal";
import type { TeamMember } from "@/lib/site/config";
import {
  cropToMemberOverrides,
  getDefaultCrop,
  type HeadshotCrop,
} from "@/lib/site/teamHeadshotCrop";

const isDev = process.env.NODE_ENV === "development";
const CROP_QUERY = "headshotCrop";

type TeamSectionProps = {
  members: TeamMember[];
};

function TeamAvatar({ member }: { member: TeamMember }) {
  if (member.imageSrc) {
    return (
      <TeamHeadshotImage
        member={member}
        frameClassName="size-20 ring-2 ring-white sm:size-36 sm:ring-4"
        sizes="(max-width: 640px) 80px, 144px"
      />
    );
  }

  if (member.isPlaceholder) {
    return (
      <div
        className="flex size-20 items-center justify-center rounded-full bg-brand-navy/10 text-brand-navy/35 ring-2 ring-white sm:size-36 sm:ring-4"
        aria-hidden
      >
        <User className="size-7 sm:size-12" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div
      className="flex size-20 items-center justify-center rounded-full bg-brand-navy text-lg font-semibold text-white ring-2 ring-white sm:size-36 sm:text-3xl sm:ring-4"
      aria-hidden
    >
      {member.initials}
    </div>
  );
}

function setCropQuery(enabled: boolean) {
  const url = new URL(window.location.href);
  if (enabled) {
    url.searchParams.set(CROP_QUERY, "1");
  } else {
    url.searchParams.delete(CROP_QUERY);
  }
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export default function TeamSection({ members }: TeamSectionProps) {
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);
  const [selectedCropId, setSelectedCropId] = useState(members[0]?.id ?? "");
  const [cropOverrides, setCropOverrides] = useState<Record<string, HeadshotCrop>>({});
  const [cropToolsOpen, setCropToolsOpen] = useState(false);

  useEffect(() => {
    if (!isDev) return;
    const params = new URLSearchParams(window.location.search);
    setCropToolsOpen(params.get(CROP_QUERY) === "1");
  }, []);

  const displayMembers = useMemo(() => {
    if (!isDev || !cropToolsOpen) {
      return members;
    }

    return members.map((member) => {
      const crop = cropOverrides[member.id];
      if (!crop) {
        return member;
      }

      return {
        ...member,
        ...cropToMemberOverrides(crop),
      };
    });
  }, [cropOverrides, cropToolsOpen, members]);

  const openCropTools = () => {
    setCropQuery(true);
    setCropToolsOpen(true);
  };

  const closeCropTools = () => {
    setCropQuery(false);
    setCropToolsOpen(false);
  };

  const firstName = (name: string) => name.split(" ")[0];

  return (
    <>
      <section id="team" className="scroll-mt-28 border-y border-solid border-brand-navy/10 bg-[#f5f8fd] py-14 sm:py-24">
        <div className="site-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-brand-blue">
              The Crew
            </p>
            <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-brand-navy sm:text-3xl">
              Meet the people on your job
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-site-text sm:text-base">
              Experienced, skilled, and committed to doing it right.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:mt-14 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-12">
            {displayMembers.map((member) => {
              const canOpenProfile = Boolean(member.profile) && !member.isPlaceholder;

              return (
                <li
                  key={member.id}
                  className={`group ${
                    cropToolsOpen && selectedCropId === member.id
                      ? "rounded-sm ring-2 ring-amber-400 ring-offset-2 ring-offset-[#f5f8fd]"
                      : ""
                  }`}
                >
                  <article className="flex h-full flex-col items-center text-center">
                    {cropToolsOpen && member.imageSrc ? (
                      <button
                        type="button"
                        className="cursor-pointer rounded-full shadow-[0_12px_28px_-16px_rgba(0,32,91,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        onClick={() => setSelectedCropId(member.id)}
                        aria-label={`Adjust crop for ${member.name}`}
                      >
                        <span className="block transition-transform duration-300 group-hover:scale-[1.02]">
                          <TeamAvatar member={member} />
                        </span>
                      </button>
                    ) : canOpenProfile ? (
                      <button
                        type="button"
                        className="cursor-pointer rounded-full shadow-[0_12px_28px_-16px_rgba(0,32,91,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                        onClick={() => setActiveMember(member)}
                        aria-label={`About ${member.name}`}
                      >
                        <span className="block transition-transform duration-300 group-hover:scale-[1.02]">
                          <TeamAvatar member={member} />
                        </span>
                      </button>
                    ) : (
                      <div className="rounded-full shadow-[0_12px_28px_-16px_rgba(0,32,91,0.45)]">
                        <span className="block">
                          <TeamAvatar member={member} />
                        </span>
                      </div>
                    )}

                    <span className="mt-4 block h-0.5 w-6 bg-brand-red sm:mt-5" aria-hidden />

                    <h3
                      className={`mt-3 font-display text-sm font-bold leading-snug tracking-tight sm:text-base ${
                        member.isPlaceholder ? "text-site-text-muted" : "text-brand-navy"
                      }`}
                    >
                      {member.name}
                    </h3>

                    <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-brand-blue sm:text-xs">
                      {member.role}
                    </p>

                    {canOpenProfile ? (
                      <button
                        type="button"
                        onClick={() => setActiveMember(member)}
                        className="mt-3 inline-flex items-center gap-0.5 text-[11px] font-semibold text-site-text transition-colors hover:text-brand-navy sm:mt-4 sm:text-xs"
                      >
                        About {firstName(member.name)}
                        <ArrowUpRight className="size-3.5 opacity-60" aria-hidden />
                      </button>
                    ) : (
                      <p className="mt-3 text-[11px] text-site-text-muted sm:mt-4 sm:text-xs">
                        Profile soon
                      </p>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>

          {isDev && !cropToolsOpen ? (
            <p className="mt-10 text-center">
              <button
                type="button"
                onClick={openCropTools}
                className="text-[11px] text-site-text-muted underline-offset-2 hover:text-site-text hover:underline"
              >
                Dev: adjust headshots
              </button>
            </p>
          ) : null}
        </div>
      </section>

      <TeamMemberModal member={activeMember} onClose={() => setActiveMember(null)} />

      {isDev && cropToolsOpen ? (
        <TeamHeadshotDevTools
          members={members}
          crops={Object.fromEntries(
            members
              .filter((member) => member.imageSrc)
              .map((member) => [
                member.id,
                cropOverrides[member.id] ?? getDefaultCrop(member),
              ]),
          )}
          selectedId={selectedCropId}
          onSelect={setSelectedCropId}
          onChange={(id, crop) => {
            setCropOverrides((current) => ({ ...current, [id]: crop }));
          }}
          onReset={(id) => {
            setCropOverrides((current) => {
              const next = { ...current };
              delete next[id];
              return next;
            });
          }}
          onSaved={(id, crop) => {
            setCropOverrides((current) => ({ ...current, [id]: crop }));
          }}
          onClose={closeCropTools}
        />
      ) : null}
    </>
  );
}
