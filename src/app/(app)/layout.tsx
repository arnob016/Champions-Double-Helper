import type { ReactNode } from "react";

/** Centred working area for the team builder and battle screens. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl px-4 py-4">{children}</div>;
}
