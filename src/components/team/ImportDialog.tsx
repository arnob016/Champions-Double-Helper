"use client";

import { useState } from "react";
import { importShowdown } from "@/lib/showdown";
import type { TeamMember } from "@/lib/types";
import { Modal } from "@/components/shared/Modal";

const EXAMPLE = `Garchomp @ Life Orb
Ability: Rough Skin
EVs: 4 HP / 252 Atk / 252 Spe
Jolly Nature
- Earthquake
- Dragon Claw
- Rock Slide
- Protect`;

export function ImportDialog({ onImport, onClose }: { onImport: (members: TeamMember[]) => void; onClose: () => void }) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const submit = () => {
    const res = importShowdown(text);
    setErrors(res.errors);
    if (res.members.length && !res.errors.length) onImport(res.members);
  };

  const preview = text.trim() ? importShowdown(text) : null;

  return (
    <Modal title="Import from Showdown" onClose={onClose} wide>
      <div className="space-y-3">
        <p className="text-sm text-slate-400">
          Paste a team in Showdown export format. Champions spreads (e.g. &quot;32 Atk / 32 Spe&quot;) are read as Stat Points directly; classic EV spreads (252/252/4) are
          converted at 8 EVs ≈ 1 SP. Level and IVs are ignored.
        </p>
        <textarea className="input h-72 font-mono text-xs" placeholder={EXAMPLE} value={text} onChange={(e) => setText(e.target.value)} />
        {errors.length > 0 && (
          <ul className="space-y-0.5 rounded-lg border border-amber-900 bg-amber-950/40 p-3 text-xs text-amber-200">
            {errors.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">{preview ? `${preview.members.length} Pokémon found` : ""}</span>
          <div className="flex gap-2">
            {errors.length > 0 && preview && preview.members.length > 0 && (
              <button className="btn btn-ghost" onClick={() => onImport(preview.members)}>
                Import anyway
              </button>
            )}
            <button className="btn btn-primary" disabled={!text.trim()} onClick={submit}>
              Import
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
