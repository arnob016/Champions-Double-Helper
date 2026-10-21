import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamEditor } from "@/components/team/TeamEditor";

export const metadata: Metadata = { title: "Team editor", robots: { index: false } };

export default function TeamPage({ params }: PageProps<"/teams/[id]">) {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
      {params.then(({ id }) => (
        <TeamEditor id={id} />
      ))}
    </Suspense>
  );
}
