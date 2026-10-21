"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

export interface ComboOption {
  value: string;
  label: string;
  hint?: ReactNode;
}

interface Props {
  options: ComboOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Custom ranking (e.g. fuzzy search). Defaults to a case-insensitive substring match. */
  search?: (query: string) => ComboOption[];
  /** Clear the input after picking (search-box style) instead of showing the picked label. */
  clearOnSelect?: boolean;
  autoFocus?: boolean;
  limit?: number;
  inputRef?: RefObject<HTMLInputElement | null>;
  /** Called on Enter with the raw text. Return true to take over (e.g. several names at once). */
  onSubmitQuery?: (query: string) => boolean;
  /** Called with pasted text. Return true to take over instead of inserting it. */
  onPasteText?: (text: string) => boolean;
  /** Backspace pressed while the box is empty. */
  onEmptyBackspace?: () => void;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  search,
  clearOnSelect,
  autoFocus,
  limit = 40,
  inputRef,
  onSubmitQuery,
  onPasteText,
  onEmptyBackspace,
}: Props) {
  const selectedLabel = options.find((o) => o.value === value)?.label ?? value ?? "";
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = (query ?? "").trim();
    if (!q) return options.slice(0, limit);
    if (search) return search(q).slice(0, limit);
    const lower = q.toLowerCase();
    const starts = options.filter((o) => o.label.toLowerCase().startsWith(lower));
    const contains = options.filter((o) => !o.label.toLowerCase().startsWith(lower) && o.label.toLowerCase().includes(lower));
    return [...starts, ...contains].slice(0, limit);
  }, [query, options, search, limit]);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const pick = (o: ComboOption) => {
    onChange(o.value);
    setQuery(clearOnSelect ? "" : null);
    setOpen(clearOnSelect ?? false);
    setActive(0);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        className="input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={query ?? (clearOnSelect ? "" : selectedLabel)}
        onFocus={(e) => {
          setOpen(true);
          e.target.select();
        }}
        onBlur={() => setTimeout(() => (setOpen(false), setQuery(clearOnSelect ? "" : null)), 120)}
        onPaste={(e) => {
          if (onPasteText?.(e.clipboardData.getData("text"))) {
            e.preventDefault();
            setQuery(clearOnSelect ? "" : null);
          }
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && query && onSubmitQuery?.(query)) {
            e.preventDefault();
            setQuery(clearOnSelect ? "" : null);
            setActive(0);
          } else if (e.key === "Enter" && open && results[active]) {
            e.preventDefault();
            pick(results[active]);
          } else if (e.key === "Backspace" && !query && onEmptyBackspace) {
            onEmptyBackspace();
          } else if (e.key === "Escape") {
            setOpen(false);
            setQuery(null);
            // second Esc leaves the box so page shortcuts work again
            if (!open || !query) e.currentTarget.blur();
          }
        }}
      />
      {open && results.length > 0 && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl"
        >
          {results.map((o, i) => (
            <li
              key={o.value}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(o);
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 text-sm ${
                i === active ? "bg-indigo-600/30" : ""
              } ${o.value === value ? "font-semibold text-indigo-300" : ""}`}
            >
              <span className="truncate">{o.label}</span>
              {o.hint && <span className="shrink-0 text-xs text-slate-400">{o.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
