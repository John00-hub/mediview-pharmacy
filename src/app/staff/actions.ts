"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/data";
import { rateLimit } from "@/lib/data/demo-adapter";
import { loginSchema } from "@/lib/validation";
import { clearSessionCookie, getStaffSession, requireStaff, setSessionCookie } from "@/lib/auth-demo";
import type { EnquiryStatus } from "@/lib/types";

export type StaffActionResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

export async function staffLoginAction(input: unknown): Promise<StaffActionResult> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`login:${ip}`, 8, 10 * 60_000)) {
    return { ok: false, error: "Too many login attempts. Please wait 10 minutes." };
  }
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "email");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please correct the highlighted fields.", fieldErrors };
  }
  const user = await db().validateLogin(parsed.data.email, parsed.data.password);
  if (!user) return { ok: false, error: "Invalid email or password." };
  await setSessionCookie(user);
  return { ok: true };
}

export async function staffLogoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/staff/login");
}

const VALID_STATUSES: EnquiryStatus[] = [
  "NEW", "UNDER_REVIEW", "AWAITING_PHARMACIST", "QUOTE_PREPARED", "AWAITING_CUSTOMER", "COMPLETED", "CLOSED",
];

export async function updateEnquiryStatusAction(enquiryId: string, status: string): Promise<StaffActionResult> {
  const actor = await requireStaff();
  if (!VALID_STATUSES.includes(status as EnquiryStatus)) return { ok: false, error: "Unknown status." };
  // Role rule: only pharmacist/admin may move an enquiry OUT of AWAITING_PHARMACIST
  // when it has POM lines — sales cannot bypass verification (directive §11/§12).
  const enquiry = await db().getEnquiryById(enquiryId);
  if (!enquiry) return { ok: false, error: "Enquiry not found." };
  const hasPom = enquiry.items.some((it) => it.productName && it.hasPrescription) || enquiry.status === "AWAITING_PHARMACIST";
  if (hasPom && !enquiry.pharmacistVerified && actor.role === "SALES" && status !== "AWAITING_PHARMACIST") {
    return {
      ok: false,
      error: "This enquiry contains prescription items awaiting pharmacist verification. Sales staff cannot advance it — a pharmacist must verify first.",
    };
  }
  await db().updateStatus(enquiryId, status as EnquiryStatus, actor);
  return { ok: true };
}

export async function addInternalNoteAction(enquiryId: string, text: string): Promise<StaffActionResult> {
  const actor = await requireStaff();
  const clean = text.trim().slice(0, 2000);
  if (!clean) return { ok: false, error: "Note is empty." };
  await db().addInternalNote(enquiryId, clean, actor);
  return { ok: true };
}

export async function pharmacistVerifyAction(enquiryId: string, verified: boolean): Promise<StaffActionResult> {
  try {
    // Hard role gate — enforced in the adapter as well (defense in depth).
    await requireStaff(["PHARMACIST", "ADMIN"]);
  } catch {
    return { ok: false, error: "Only a pharmacist or administrator may record prescription verification." };
  }
  const actor = (await getStaffSession())!;
  await db().setPharmacistVerified(enquiryId, verified, actor);
  return { ok: true };
}

export async function prepareQuoteAction(enquiryId: string, note: string): Promise<StaffActionResult> {
  const actor = await requireStaff();
  const enquiry = await db().getEnquiryById(enquiryId);
  if (!enquiry) return { ok: false, error: "Enquiry not found." };
  if (enquiry.status === "AWAITING_PHARMACIST" && !enquiry.pharmacistVerified && actor.role === "SALES") {
    return { ok: false, error: "Pharmacist verification is required before quoting this enquiry." };
  }
  await db().addQuote(enquiryId, null, note.trim().slice(0, 500), actor);
  return { ok: true };
}
