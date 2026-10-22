"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, Minus, Plus, ClipboardList, ArrowRight, FileUp, ShieldAlert, ShoppingCart } from "lucide-react";
import { useBasket } from "./basket-provider";
import { ProductTile } from "./ProductTile";
import { prescriptionFileRules } from "@/lib/validation";
import type { DoseForm } from "@/lib/types";

/**
 * Enquiry basket manager — quantity, notes, per-item prescription declaration
 * and the DEMO prescription file field (metadata only; files are never
 * uploaded in the demo — directive §9).
 */
export function BasketManager({ doseForms }: { doseForms: Record<string, DoseForm> }) {
  const { lines, setQty, remove, setNote, setPrescription, clear, hydrated } = useBasket();
  const [fileError, setFileError] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading basket">
        {[0, 1].map((i) => (
          <div key={i} className="skeleton h-28 w-full" />
        ))}
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-4 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-sm bg-brand-50 text-brand-700">
          <ShoppingCart size={26} aria-hidden="true" />
        </span>
        <h2 className="font-display text-xl font-semibold text-ink">Your enquiry basket is empty</h2>
        <p className="max-w-md text-[14.5px] leading-relaxed text-ink-soft">
          Browse the catalogue and add the items you need — with quantities and notes.
          We’ll confirm current prices and availability before anything is final.
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <Link href="/shop" className="btn-primary">Browse products <ArrowRight size={15} aria-hidden="true" /></Link>
          <Link href="/prescriptions" className="btn-quiet">Prescription information</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[13.5px] text-ink-soft">
          {lines.length} {lines.length === 1 ? "item" : "items"} · prices confirmed on enquiry
        </p>
        <button type="button" onClick={clear} className="btn-ghost btn-sm text-rx hover:bg-rx-soft">
          <Trash2 size={14} aria-hidden="true" /> Clear basket
        </button>
      </div>

      <ul className="space-y-3">
        {lines.map((line) => {
          const isPom = line.rxClass === "POM";
          return (
            <li key={line.productId} className="card p-4">
              <div className="flex gap-4">
                <ProductTile
                  name={line.name}
                  form={doseForms[line.productId] ?? "other"}
                  brand={line.brand}
                  size="sm"
                  className="hidden h-24 w-20 shrink-0 sm:flex"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-[15px] font-semibold leading-snug text-ink">
                        <Link href={`/p/${line.slug}`} className="hover:text-brand-800 hover:underline underline-offset-4">
                          {line.name}
                        </Link>
                      </h3>
                      <p className="mt-0.5 text-[12.5px] text-ink-faint">
                        {[line.brand, isPom && "Prescription only"].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.productId)}
                      className="btn-ghost btn-sm -mt-1 -mr-2 px-2 text-ink-faint hover:text-rx"
                      aria-label={`Remove ${line.name} from basket`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {isPom && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-xs bg-rx-soft px-2.5 py-1.5 text-[12.5px] text-rx">
                      <ShieldAlert size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                      Pharmacist verification required before this item can be quoted or supplied.
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="flex items-center rounded-sm border border-line-strong bg-card">
                      <button
                        type="button"
                        className="px-2.5 py-1.5 text-ink-soft hover:text-brand-800"
                        onClick={() => setQty(line.productId, line.quantity - 1)}
                        aria-label={`Decrease quantity of ${line.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span aria-live="polite" className="min-w-8 text-center font-display text-[13.5px] font-bold">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-2.5 py-1.5 text-ink-soft hover:text-brand-800"
                        onClick={() => setQty(line.productId, line.quantity + 1)}
                        aria-label={`Increase quantity of ${line.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-display text-[12px] font-semibold tracking-wide text-enquiry uppercase">
                      Price on enquiry
                    </span>
                  </div>

                  <label className="mt-3 block">
                    <span className="field-label">Note for this item (optional)</span>
                    <input
                      type="text"
                      className="field"
                      maxLength={300}
                      placeholder="e.g. prefer the 28-pack, or call before delivering"
                      value={line.note}
                      onChange={(e) => setNote(line.productId, e.target.value)}
                    />
                  </label>

                  {/* Prescription declaration + DEMO-only synthetic file field */}
                  <div className="mt-3 rounded-sm border border-line bg-surface/60 p-3">
                    <label className="flex items-start gap-2.5 text-[13.5px] text-ink">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-brand-700"
                        checked={line.hasPrescription}
                        onChange={(e) =>
                          setPrescription(line.productId, e.target.checked, e.target.checked ? line.prescriptionFileName : null)
                        }
                      />
                      <span>
                        {isPom ? "I have a valid prescription for this medicine" : "I have a prescription or medical note to share (optional)"}
                      </span>
                    </label>

                    {line.hasPrescription && (
                      <div className="mt-3 space-y-2">
                        <label className="block">
                          <span className="field-label flex items-center gap-1.5">
                            <FileUp size={13} aria-hidden="true" /> Attach prescription (DEMO: synthetic files only)
                          </span>
                          <input
                            type="file"
                            accept={prescriptionFileRules.acceptedMime.join(",")}
                            className="field file:mr-3 file:rounded-xs file:border-0 file:bg-brand-700 file:px-3 file:py-1.5 file:font-display file:text-[12px] file:font-semibold file:text-white"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              setFileError(null);
                              if (!f) {
                                setPrescription(line.productId, true, null);
                                return;
                              }
                              if (!prescriptionFileRules.acceptedMime.includes(f.type as never)) {
                                setFileError("Accepted formats: JPEG, PNG or PDF.");
                                e.target.value = "";
                                return;
                              }
                              if (f.size > prescriptionFileRules.maxBytes) {
                                setFileError("File too large — maximum 8 MB.");
                                e.target.value = "";
                                return;
                              }
                              // DEMO: metadata only — the file itself is never transmitted or stored.
                              setPrescription(line.productId, true, f.name);
                            }}
                          />
                        </label>
                        {fileError && <p className="field-error">{fileError}</p>}
                        {line.prescriptionFileName && (
                          <p className="text-[12.5px] text-ink-soft">
                            Attached (name only, demo): <span className="font-medium">{line.prescriptionFileName}</span>
                          </p>
                        )}
                        <p className="rounded-xs bg-enquiry-soft px-2.5 py-2 text-[12px] leading-relaxed text-enquiry">
                          Demonstration notice: do not upload real patient prescriptions to this demo.
                          Files are not transmitted or stored — only the file name is recorded. In
                          production, uploads go to private storage, readable solely by pharmacist
                          roles via short-lived signed links.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-[16px] font-semibold text-ink">Ready to request prices?</h2>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            Next: your contact details and pickup/delivery preference. Takes about a minute.
          </p>
        </div>
        <Link href="/enquiry" className="btn-primary shrink-0">
          <ClipboardList size={16} aria-hidden="true" /> Continue to enquiry form <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
