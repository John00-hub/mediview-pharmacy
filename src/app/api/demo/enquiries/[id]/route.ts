import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { getStaffSession } from "@/lib/auth-demo";
import {
  updateEnquiryStatusAction,
  pharmacistVerifyAction,
  prepareQuoteAction,
  addInternalNoteAction,
} from "@/app/staff/actions";

export const dynamic = "force-dynamic";

/**
 * DEMO-ONLY harness for staff operations — routes to the SAME server actions
 * the dashboard UI invokes (role gates apply identically via session cookie).
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.DEMO_MODE === "false") return NextResponse.json({ error: "disabled" }, { status: 404 });
  const user = await getStaffSession();
  if (!user) return NextResponse.json({ error: "not-authenticated" }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const op = String(body.op ?? "status");

  let result;
  switch (op) {
    case "status":
      result = await updateEnquiryStatusAction(id, String(body.status ?? ""));
      break;
    case "verify":
      result = await pharmacistVerifyAction(id, Boolean(body.verified));
      break;
    case "quote":
      result = await prepareQuoteAction(id, String(body.note ?? ""));
      break;
    case "note":
      result = await addInternalNoteAction(id, String(body.text ?? ""));
      break;
    default:
      result = { ok: false, error: "unknown-op" };
  }
  const enquiry = result.ok ? await db().getEnquiryById(id) : null;
  return NextResponse.json({ ...result, enquiry }, { status: result.ok ? 200 : 403 });
}
