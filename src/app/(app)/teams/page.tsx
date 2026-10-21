import type { Metadata } from "next";
import { Suspense } from "react";
import { TeamsHome } from "@/components/team/TeamsHome";

export const metadata: Metadata = {
  title: "Your teams",
  description: "Build, import and manage your Pokémon Champions doubles teams.",
};

export default function TeamsPage({ searchParams }: PageProps<"/teams">) {
  return (
    <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
      {/* /teams?import=1 (from the landing page) opens the Showdown import straight away */}
      {searchParams.then((sp) => (
        <TeamsHome openImport={sp.import === "1"} />
      ))}
    </Suspense>
  );
}
