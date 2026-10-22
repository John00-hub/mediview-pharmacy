import { NextResponse } from "next/server";
import { trackEnquiryAction } from "@/app/enquiry/actions";

export const dynamic = "force-dynamic";

/** DEMO-ONLY harness: customer tracking lookup (ref + phone), same action as /track UI. */
export async function GET(req: Request) {
  if (process.env.DEMO_MODE === "false") return NextResponse.json({ error: "disabled" }, { status: 404 });
  const url = new URL(req.url);
  const result = await trackEnquiryAction({
    refCode: url.searchParams.get("ref") ?? "",
    phone: url.searchParams.get("phone") ?? "",
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
