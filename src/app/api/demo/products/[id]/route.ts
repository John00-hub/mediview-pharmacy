import { NextResponse } from "next/server";
import { db } from "@/lib/data";
import { getStaffSession } from "@/lib/auth-demo";
import { saveProductAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

/** DEMO-ONLY harness: admin product edit — same action as the admin form (ADMIN role required). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (process.env.DEMO_MODE === "false") return NextResponse.json({ error: "disabled" }, { status: 404 });
  const user = await getStaffSession();
  if (!user) return NextResponse.json({ error: "not-authenticated" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const product = await db().getProductById(id);
  if (!product) return NextResponse.json({ error: "not-found" }, { status: 404 });
  const patch = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const brands = await db().listBrands();
  const categories = await db().listCategories();
  const result = await saveProductAction({
    id: product.id,
    slug: product.slug,
    name: String(patch.name ?? product.name),
    brandName: String(patch.brandName ?? brands.find((b) => b.id === product.brandId)?.name ?? ""),
    genericName: String(patch.genericName ?? product.genericName ?? ""),
    doseForm: String(patch.doseForm ?? product.doseForm),
    strength: String(patch.strength ?? product.strength ?? ""),
    packSize: String(patch.packSize ?? product.packSize ?? ""),
    categorySlug: String(
      patch.categorySlug ?? categories.find((c) => c.id === product.primaryCategoryId)?.slug ?? ""
    ),
    rxClass: String(patch.rxClass ?? product.rxClass),
    description: String(patch.description ?? product.description),
    featured: Boolean(patch.featured ?? product.featured),
    coldChain: Boolean(patch.coldChain ?? product.coldChain),
    professionalUseOnly: Boolean(patch.professionalUseOnly ?? product.professionalUseOnly),
  });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
