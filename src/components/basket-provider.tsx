"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Enquiry basket — client-side persistent state (localStorage), per the demo
 * architecture. In production the same shape is mirrored to Supabase for
 * signed-in customers; guests keep the local basket.
 */

export interface BasketLine {
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  rxClass: string;
  quantity: number;
  note: string;
  hasPrescription: boolean;
  prescriptionFileName: string | null;
}

interface BasketContextValue {
  lines: BasketLine[];
  count: number;
  add: (line: Omit<BasketLine, "quantity" | "note" | "hasPrescription" | "prescriptionFileName">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  setNote: (productId: string, note: string) => void;
  setPrescription: (productId: string, has: boolean, fileName?: string | null) => void;
  clear: () => void;
  hydrated: boolean;
  toast: string | null;
}

const BasketContext = createContext<BasketContextValue | null>(null);
const STORAGE_KEY = "mvp.enquiry-basket.v1";

export function BasketProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<BasketLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as BasketLine[]);
    } catch {
      /* corrupted state — start empty */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage full/blocked — basket lives in memory for this visit */
    }
  }, [lines, hydrated]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const add: BasketContextValue["add"] = useCallback(
    (base, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === base.productId);
        if (existing) {
          return prev.map((l) =>
            l.productId === base.productId
              ? { ...l, quantity: Math.min(99, l.quantity + qty) }
              : l
          );
        }
        return [
          ...prev,
          { ...base, quantity: qty, note: "", hasPrescription: false, prescriptionFileName: null },
        ];
      });
      flash(`${base.name} added to your enquiry`);
    },
    [flash]
  );

  const value = useMemo<BasketContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      hydrated,
      toast,
      add,
      remove: (productId) =>
        setLines((prev) => prev.filter((l) => l.productId !== productId)),
      setQty: (productId, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.productId !== productId)
            : prev.map((l) =>
                l.productId === productId ? { ...l, quantity: Math.min(99, qty) } : l
              )
        ),
      setNote: (productId, note) =>
        setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, note } : l))),
      setPrescription: (productId, has, fileName = null) =>
        setLines((prev) =>
          prev.map((l) =>
            l.productId === productId ? { ...l, hasPrescription: has, prescriptionFileName: fileName } : l
          )
        ),
      clear: () => setLines([]),
    }),
    [lines, hydrated, toast, add]
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used within <BasketProvider>");
  return ctx;
}
