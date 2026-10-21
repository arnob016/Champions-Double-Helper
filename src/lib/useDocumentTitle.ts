"use client";

import { useEffect } from "react";
import { SITE } from "./site";

/** Put client-only data (a team's name from localStorage) into the tab title. */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    if (title) document.title = `${title} · ${SITE.name}`;
  }, [title]);
}
