"use server";

import { headers } from "next/headers";
import { db } from "@/lib/data";
import { rateLimit } from "@/lib/data/demo-adapter";
import { enquiryFormSchema, trackSchema } from "@/lib/validation";
import type { Enquiry } from "@/lib/types";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

/**
 * Submit an enquiry. Server-side validation (zod), rate limiting and
 * re-verification that every productId exists and is orderable — never trust
 * the client basket.
 */
export async function submitEnquiryAction(input: unknown): Promise<ActionResult<{ refCode: string }>> {
  const ip = await clientIp();
  if (!rateLimit(`enquiry:${ip}`, 5, 10 * 60_000)) {
    return { ok: false, error: "Too many enquiries from this device. Please try again shortly or call us." };
  }

  const parsed = enquiryFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }

  const store = db();
  const items: { productId: string; quantity: number; note: string | null; hasPrescription: boolean; prescriptionFileName: string | null }[] = [];
  for (const it of parsed.data.items) {
    const product = await store.getProductById(it.productId);
    if (!product || product.status !== "active") continue; // silently drop stale lines
    items.push({
      productId: product.id,
      quantity: it.quantity,
      note: it.note || null,
      hasPrescription: Boolean(it.hasPrescription),
      prescriptionFileName: it.prescriptionFileName || null,
    });
  }
  if (items.length === 0) {
    return { ok: false, error: "Your basket is empty or its items are no longer listed." };
  }

  const enquiry = await store.createEnquiry({
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    customerEmail: parsed.data.customerEmail || null,
    contactPreference: parsed.data.contactPreference,
    fulfilment: parsed.data.fulfilment,
    deliveryAddress: parsed.data.fulfilment === "DELIVERY" ? parsed.data.deliveryAddress || null : null,
    additionalInfo: parsed.data.additionalInfo || null,
    items,
  });

  return { ok: true, data: { refCode: enquiry.refCode } };
}

/** Track an enquiry — requires reference AND matching phone (anti-enumeration). */
export async function trackEnquiryAction(input: unknown): Promise<ActionResult<{ enquiry: Enquiry }>> {
  const ip = await clientIp();
  if (!rateLimit(`track:${ip}`, 10, 60_000)) {
    return { ok: false, error: "Too many tracking attempts. Please wait a minute." };
  }
  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }
  const enquiry = await db().trackEnquiry(parsed.data.refCode, parsed.data.phone);
  if (!enquiry) {
    return {
      ok: false,
      error: "No enquiry matches that reference and phone number. Check both and try again.",
    };
  }
  return { ok: true, data: { enquiry } };
}
