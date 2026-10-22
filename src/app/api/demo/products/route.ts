import { NextResponse } from "next/server";
import { db } from "@/lib/data";

export const dynamic = "force-dynamic";

/** DEMO-ONLY harness: resolve product ids for scripted tests (public catalogue fields only). */
export async function GET(req: Request) {
  if (process.env.DEMO_MODE === "false") return NextResponse.json({ error: "disabled" }, { status: 404 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const { products } = await db().listProducts({ query: q || undefined, pageSize: 10 });
  return NextResponse.json(
    products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      rxClass: p.rxClass,
      category: p.primaryCategoryId,
    }))
  );
}
