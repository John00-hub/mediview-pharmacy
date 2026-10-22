import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { rateLimit } from "@/lib/data/demo-adapter";

export const dynamic = "force-dynamic";

/** Search suggestions endpoint — debounced calls from <SearchBox/>. */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`suggest:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80) ?? "";
  if (q.trim().length < 2) return NextResponse.json([]);
  const results = await db().suggest(q, 6);
  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
