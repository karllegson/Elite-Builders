"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { TeamMember } from "@/lib/site/config";

type TeamMemberModalProps = {
  member: TeamMember | null;
  onClose: () => void;
};

function ModalPhoto({ member }: { member: TeamMember }) {
  if (member.imageSrc) {
    return (
      <Image
        src={member.imageSrc}
        alt={member.name}
        width={200}
        height={200}
        className="size-32 shrink-0 rounded-full object-cover ring-4 ring-white shadow-md sm:size-36"
      />
    );
  }

  return (
    <div
      className="flex size-32 shrink-0 items-center justify-center rounded-full bg-site-nav-cta text-3xl font-semibold text-white ring-4 ring-white shadow-md sm:size-36"
      aria-hidden
    >
      {member.initials}
    </div>
  );
}

export default function TeamMemberModal({ member, onClose }: TeamMemberModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const profile = member?.profile;

  useEffect(() => {
    if (!member) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [member, onClose]);

  if (!member || !profile) return null;

  const firstName = member.name.split(" ")[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close profile"
        className="absolute inset-0 bg-brand-navy/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-modal-title"
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-site-text-muted transition-colors hover:bg-gray-100 hover:text-site-text-dark"
        >
          <X size={22} aria-hidden />
        </button>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
          <div className="flex justify-center sm:justify-start">
            <ModalPhoto member={member} />
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h2
              id="team-member-modal-title"
              className="pr-8 text-2xl font-bold text-brand-navy sm:text-3xl"
            >
              {member.name}
            </h2>
            <p className="mt-1 text-base font-medium text-site-text-muted">{member.role}</p>

            {(profile.experience || profile.jobsDone) && (
              <dl className="mt-5 space-y-2">
                {profile.experience ? (
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <dt className="text-sm font-bold text-brand-red">Experience</dt>
                    <dd className="text-sm text-site-text">{profile.experience}</dd>
                  </div>
                ) : null}
                {profile.jobsDone ? (
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <dt className="text-sm font-bold text-brand-red">Jobs Done</dt>
                    <dd className="text-sm text-site-text">{profile.jobsDone}</dd>
                  </div>
                ) : null}
              </dl>
            )}
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-site-text sm:text-base">{profile.bio}</p>

        {profile.testimonial ? (
          <blockquote className="mt-6 rounded-xl bg-[#f5f8fd] px-5 py-5 sm:px-6">
            <p className="text-sm font-bold text-brand-navy sm:text-base">
              What Homeowners Say About {firstName}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-site-text sm:text-base">
              &ldquo;{profile.testimonial.quote}&rdquo;
            </p>
            <footer className="mt-3 text-sm font-medium text-site-text-muted">
              — {profile.testimonial.author}
            </footer>
          </blockquote>
        ) : null}
      </div>
    </div>
  );
}
