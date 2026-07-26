"use client";

import { useEffect, useMemo, useState } from "react";
import type { TeamMember } from "@/lib/site/config";
import {
  cropToMemberOverrides,
  getDefaultCrop,
  type HeadshotCrop,
} from "@/lib/site/teamHeadshotCrop";

type TeamHeadshotDevToolsProps = {
  members: TeamMember[];
  crops: Record<string, HeadshotCrop>;
  selectedId: string;
  onSelect: (id: string) => void;
  onChange: (id: string, crop: HeadshotCrop) => void;
  onReset: (id: string) => void;
  onSaved: (id: string, crop: HeadshotCrop) => void;
  onClose: () => void;
};

function round(value: number, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export default function TeamHeadshotDevTools({
  members,
  crops,
  selectedId,
  onSelect,
  onChange,
  onReset,
  onSaved,
  onClose,
}: TeamHeadshotDevToolsProps) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const membersWithPhotos = useMemo(
    () => members.filter((member) => Boolean(member.imageSrc)),
    [members],
  );

  const selected = membersWithPhotos.find((member) => member.id === selectedId) ?? membersWithPhotos[0];
  const crop = selected ? crops[selected.id] ?? getDefaultCrop(selected) : null;

  useEffect(() => {
    if (!selected && membersWithPhotos[0]) {
      onSelect(membersWithPhotos[0].id);
    }
  }, [membersWithPhotos, onSelect, selected]);

  if (!selected || !crop) {
    return null;
  }

  const overrides = cropToMemberOverrides(crop);
  const snippet = [
    `id: "${selected.id}",`,
    `imageObjectPosition: "${overrides.imageObjectPosition}",`,
    `imageScale: ${overrides.imageScale},`,
  ].join("\n");

  const update = (patch: Partial<HeadshotCrop>) => {
    setSaveMessage(null);
    onChange(selected.id, { ...crop, ...patch });
  };

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const saveToConfig = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const response = await fetch("/api/dev/team-headshot-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          imageObjectPosition: overrides.imageObjectPosition,
          imageScale: overrides.imageScale,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Save failed.");
      }
      onSaved(selected.id, crop);
      setSaveMessage("Saved to config.ts");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[min(100vw-2rem,22rem)] rounded-xl border border-amber-400/80 bg-[#1d2327] text-white shadow-2xl">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300">
          Dev · Headshot crop
        </p>
        <button
          type="button"
          className="rounded px-2 py-0.5 text-xs text-white/80 hover:bg-white/10"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="space-y-3 p-3 text-sm">
        <label className="block space-y-1">
          <span className="text-xs text-white/70">Team member</span>
          <select
            className="w-full rounded-md border border-white/15 bg-black/30 px-2 py-1.5 text-sm"
            value={selected.id}
            onChange={(event) => onSelect(event.target.value)}
          >
            {membersWithPhotos.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.id})
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="flex justify-between text-xs text-white/70">
            Zoom <span>{crop.scale.toFixed(2)}×</span>
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={crop.scale}
            onChange={(event) => update({ scale: Number(event.target.value) })}
            className="w-full accent-amber-400"
          />
        </label>

        <label className="block space-y-1">
          <span className="flex justify-between text-xs text-white/70">
            Move left ← → right <span>{round(crop.x)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={crop.x}
            onChange={(event) => update({ x: Number(event.target.value) })}
            className="w-full accent-amber-400"
          />
        </label>

        <label className="block space-y-1">
          <span className="flex justify-between text-xs text-white/70">
            Move Y (0% = headroom) <span>{round(crop.y)}%</span>
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={crop.y}
            onChange={(event) => update({ y: Number(event.target.value) })}
            className="w-full accent-amber-400"
          />
        </label>

        <p className="text-[11px] leading-snug text-white/55">
          Move Y toward 0% to show space above the head. Higher Y crops toward the chest. Zoom in
          only after the framing looks right.
        </p>

        <pre className="overflow-x-auto rounded-md bg-black/40 p-2 text-[11px] leading-relaxed text-emerald-300">
          {snippet}
        </pre>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={saveToConfig}
            disabled={saving}
            className="flex-1 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-[#1d2327] hover:bg-amber-300 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save to config"}
          </button>
          <button
            type="button"
            onClick={copySnippet}
            className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() => onReset(selected.id)}
            className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white/90 hover:bg-white/10"
          >
            Reset
          </button>
        </div>

        {saveMessage ? (
          <p
            className={`text-[11px] ${
              saveMessage.includes("Saved") ? "text-emerald-300" : "text-red-300"
            }`}
          >
            {saveMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
