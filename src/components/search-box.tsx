"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Search, X, Loader2, CornerDownLeft, Package, FolderOpen } from "lucide-react";

interface Suggestion {
  label: string;
  href: string;
  kind: "product" | "category";
}

/**
 * Intelligent search (directive §10): debounced suggestions from /api/suggest,
 * typo-tolerant server matching, full keyboard navigation, real result URL
 * (/search?q=…), mobile-friendly sheet.
 */
export function SearchBox({
  variant = "header",
  autoFocus = false,
}: {
  variant?: "header" | "hero";
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // debounce → suggestions
  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        if (res.ok) setSuggestions((await res.json()) as Suggestion[]);
      } catch {
        /* aborted or offline — keep previous suggestions */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => clearTimeout(t);
  }, [value]);

  // outside click closes
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function submit(q?: string) {
    const query = (q ?? value).trim();
    if (!query) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === "Enter") {
      if (open && active >= 0 && suggestions[active]) {
        e.preventDefault();
        router.push(suggestions[active].href);
        setOpen(false);
      } else {
        e.preventDefault();
        submit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  }

  const hero = variant === "hero";
  return (
    <div ref={boxRef} className={`relative w-full ${hero ? "max-w-xl" : ""}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Search products by name, brand or medicine
        </label>
        <div
          className={`flex items-center gap-2 rounded-sm border bg-card transition-shadow ${
            hero ? "border-line-strong px-4 py-3 shadow-card" : "border-line-strong px-3 py-2"
          } focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100`}
        >
          <Search size={hero ? 20 : 17} className="shrink-0 text-brand-700" aria-hidden="true" />
          <input
            id={inputId}
            type="search"
            role="combobox"
            autoComplete="off"
            autoFocus={autoFocus}
            placeholder="Search Panadol, vitamin C, blood pressure monitor…"
            className={`w-full bg-transparent text-ink placeholder:text-ink-faint focus:outline-none ${
              hero ? "text-base" : "text-sm"
            } [&::-webkit-search-cancel-button]:appearance-none`}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            aria-expanded={open && suggestions.length > 0}
            aria-controls={`${inputId}-list`}
            aria-autocomplete="list"
          />
          {loading && <Loader2 size={15} className="animate-spin text-ink-faint" aria-hidden="true" />}
          {value && !loading && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setSuggestions([]);
              }}
              className="text-ink-faint hover:text-ink"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <button type="submit" className={`btn-primary ${hero ? "" : "btn-sm"} shrink-0`}>
            Search
          </button>
        </div>
      </form>

      {open && (value.trim().length >= 2 || suggestions.length > 0) && (
        <div
          id={`${inputId}-list`}
          role="listbox"
          aria-label="Search suggestions"
          className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-md border border-line bg-card shadow-lift"
        >
          {suggestions.length === 0 && !loading && value.trim().length >= 2 && (
            <p className="px-4 py-3 text-sm text-ink-soft">
              No matches yet — press <kbd className="rounded-xs border border-line-strong px-1">Enter</kbd> for full results.
            </p>
          )}
          {suggestions.map((s, i) => (
            <button
              key={s.href}
              type="button"
              role="option"
              aria-selected={i === active}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                i === active ? "bg-brand-50 text-brand-900" : "hover:bg-surface"
              }`}
              onMouseEnter={() => setActive(i)}
              onClick={() => {
                router.push(s.href);
                setOpen(false);
              }}
            >
              {s.kind === "category" ? (
                <FolderOpen size={16} className="text-brand-700" aria-hidden="true" />
              ) : (
                <Package size={16} className="text-brand-700" aria-hidden="true" />
              )}
              <span className="flex-1 truncate">{s.label}</span>
              {i === active && <CornerDownLeft size={13} className="text-ink-faint" aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
