"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, User } from "lucide-react";
import TeamHeadshotDevTools from "@/components/site/TeamHeadshotDevTools";
import TeamMemberModal from "@/components/site/TeamMemberModal";
import SectionIntro from "@/components/site/SectionIntro";
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

/** Full-bleed portrait card — the headshots are waist-up portraits on a matching wall. */
function TeamPortraitCard({
  member,
  index,
  onOpen,
  selected,
}: {
  member: TeamMember;
  index: number;
  onOpen?: () => void;
  selected?: boolean;
}) {
  const firstName = member.name.split(" ")[0];

  return (
    <article
      className={`group relative isolate aspect-[3/4] overflow-hidden rounded-2xl bg-brand-ink shadow-[0_16px_32px_-20px_rgba(7,21,48,0.5)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_44px_-20px_rgba(7,21,48,0.6)] ${
        selected ? "ring-4 ring-amber-400" : ""
      }`}
    >
      {member.imageSrc ? (
        <Image
          src={member.imageSrc}
          alt={member.name}
          fill
          quality={85}
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 220px"
          className="-z-20 object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          style={{ objectPosition: "50% 12%" }}
        />
      ) : (
        <div
          className="bg-blueprint absolute inset-0 -z-20 flex items-center justify-center font-display text-4xl font-bold text-white/25"
          aria-hidden
        >
          {member.isPlaceholder ? <User className="size-10" strokeWidth={1.25} /> : member.initials}
        </div>
      )}

      {/* Legibility gradient + subtle brand tint on hover */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-3/5 bg-gradient-to-t from-brand-ink via-brand-ink/60 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-brand-navy/0 transition-colors duration-500 group-hover:bg-brand-navy/15"
        aria-hidden
      />

      <span
        className="absolute left-3 top-3 font-display text-[0.625rem] font-semibold tracking-[0.18em] text-white/80"
        aria-hidden
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {onOpen ? (
        <span
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-brand-red"
          aria-hidden
        >
          <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:rotate-45" />
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
        <span
          className="block h-0.5 w-6 bg-brand-red transition-all duration-500 group-hover:w-10"
          aria-hidden
        />
        <h3 className="mt-2 font-display text-sm font-bold leading-tight text-white sm:text-base">
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className="text-left after:absolute after:inset-0 after:rounded-2xl focus:outline-none focus-visible:after:ring-4 focus-visible:after:ring-brand-sky"
              aria-label={`${member.name}, ${member.role} — read profile`}
            >
              {member.name}
            </button>
          ) : (
            member.name
          )}
        </h3>
        <p className="mt-1 text-[0.5625rem] font-semibold uppercase leading-snug tracking-[0.14em] text-white/70 sm:text-[0.625rem]">
          {member.role}
        </p>
        {onOpen ? (
          <p className="mt-2 hidden text-xs font-medium text-white/0 transition-colors duration-300 group-hover:text-white/90 sm:block">
            Meet {firstName} →
          </p>
        ) : null}
      </div>
    </article>
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

  return (
    <>
      <section id="team" className="section scroll-mt-28 bg-site-surface">
        <div className="site-container">
          <SectionIntro
            eyebrow="The Crew"
            title="Meet the people on your job"
            lede="Experienced, skilled, and committed to doing it right."
          />

          <ul className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-3 sm:mt-14 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
            {displayMembers.map((member, index) => {
              const canOpenProfile = Boolean(member.profile) && !member.isPlaceholder;
              const inCropMode = cropToolsOpen && Boolean(member.imageSrc);

              return (
                <li key={member.id}>
                  <TeamPortraitCard
                    member={member}
                    index={index}
                    selected={cropToolsOpen && selectedCropId === member.id}
                    onOpen={
                      inCropMode
                        ? () => setSelectedCropId(member.id)
                        : canOpenProfile
                          ? () => setActiveMember(member)
                          : undefined
                    }
                  />
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
