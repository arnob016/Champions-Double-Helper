import type { Metadata } from "next";
import { Suspense } from "react";
import { BattleView } from "@/components/battle/BattleView";

export const metadata: Metadata = { title: "Battle", robots: { index: false } };

export default function BattlePage({ params }: PageProps<"/battle/[teamId]">) {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
      {params.then(({ teamId }) => (
        <BattleView teamId={teamId} />
      ))}
    </Suspense>
  );
}
