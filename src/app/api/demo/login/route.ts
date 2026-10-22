import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { rateLimit } from "@/lib/data/demo-adapter";
import { loginSchema } from "@/lib/validation";
import { setSessionCookie } from "@/lib/auth-demo";

export const dynamic = "force-dynamic";

/**
 * DEMO-ONLY test harness endpoint — mirrors the staff login server action so
 * the acceptance test (scripts/acceptance-test.mjs) can exercise the real auth
 * path over HTTP. Disabled when DEMO_MODE=false.
 */
export async function POST(req: Request) {
  if (process.env.DEMO_MODE === "false") return NextResponse.json({ error: "disabled" }, { status: 404 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`apilogin:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "rate-limited" }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const user = await db().validateLogin(parsed.data.email, parsed.data.password);
  if (!user) return NextResponse.json({ error: "invalid-credentials" }, { status: 401 });
  const res = NextResponse.json({ ok: true, user });
  await setSessionCookie(user);
  return res;
}
