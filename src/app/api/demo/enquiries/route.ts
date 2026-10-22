import { NextResponse } from "next/server";
import { submitEnquiryAction } from "@/app/enquiry/actions";

export const dynamic = "force-dynamic";

/** DEMO-ONLY harness: submits an enquiry through the exact server action the UI uses. */
export async function POST(req: Request) {
  if (process.env.DEMO_MODE === "false") return NextResponse.json({ error: "disabled" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const result = await submitEnquiryAction(body);
  return NextResponse.json(result, { status: result.ok ? 201 : 400 });
}
