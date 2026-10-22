"use client";

import { useState } from "react";
import { Minus, Plus, MessageCircle, ClipboardList } from "lucide-react";
import type { Product } from "@/lib/types";
import { useBasket } from "./basket-provider";
import { waLink } from "@/lib/brand";

/**
 * Quantity stepper + Add to Enquiry + per-product WhatsApp deep link.
 * POM items additionally surface the prescription requirement before adding.
 */
export function AddToBasketPanel({ product, brandName }: { product: Product; brandName?: string | null }) {
  const { add } = useBasket();
  const [qty, setQty] = useState(1);
  const isPom = product.rxClass === "POM";

  return (
    <div className="space-y-3">
      {isPom && (
        <p className="rounded-sm border border-rx/30 bg-rx-soft px-3.5 py-2.5 text-[13.5px] leading-relaxed text-rx">
          <strong>Prescription-only medicine.</strong> You can add this to your enquiry, but it will
          only be supplied against a valid prescription verified by our pharmacist.{" "}
          <a href="/prescriptions" className="underline underline-offset-4">How prescriptions work</a>.
        </p>
      )}
      <div className="flex flex-wrap items-stretch gap-2.5">
        <div className="flex items-center rounded-sm border border-line-strong bg-card">
          <button
            type="button"
            className="px-3 py-2.5 text-ink-soft hover:text-brand-800 disabled:opacity-40"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span aria-live="polite" className="min-w-9 text-center font-display text-sm font-bold">
            {qty}
          </span>
          <button
            type="button"
            className="px-3 py-2.5 text-ink-soft hover:text-brand-800 disabled:opacity-40"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            disabled={qty >= 99}
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={() => {
            add({ productId: product.id, slug: product.slug, name: product.name, brand: brandName ?? null, rxClass: product.rxClass }, qty);
            setQty(1);
          }}
        >
          <ClipboardList size={16} aria-hidden="true" /> Add to Enquiry
        </button>
        <a
          href={waLink(`Hello Mediview Pharmacy, I would like to ask about: ${product.name}${product.strength ? ` (${product.strength})` : ""}. Is it available, and what is the current price?`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
          title="Ask about this item on WhatsApp"
        >
          <MessageCircle size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Ask on WhatsApp</span>
        </a>
      </div>
      <p className="text-[13px] text-ink-faint">
        Prices and availability are confirmed by our team when you submit your enquiry — we never
        publish estimated medicine prices.
      </p>
    </div>
  );
}
