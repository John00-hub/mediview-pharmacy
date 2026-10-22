import Link from "next/link";
import { Plus, Pencil, Archive } from "lucide-react";
import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";
import { RxBadge } from "@/components/ui";
import { ArchiveButton } from "./archive-button";

export const dynamic = "force-dynamic";

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireStaff(["ADMIN"]);
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const status = sp.status === "archived" ? "archived" : "active";

  const store = db();
  const [{ products }, brands, categories] = await Promise.all([
    store.listProducts({ query: q || undefined, pageSize: 1000, includeArchived: true }),
    store.listBrands(),
    store.listCategories(),
  ]);
  const filtered = products.filter((p) => p.status === status);
  const brandById = new Map(brands.map((b) => [b.id, b.name]));
  const catById = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[22px] font-bold text-brand-950">Products</h1>
        <Link href="/admin/products/new" className="btn-primary btn-sm">
          <Plus size={15} aria-hidden="true" /> Add product
        </Link>
      </div>

      <form method="get" className="mt-4 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="q">Search products</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search products…" className="field max-w-xs" />
        <input type="hidden" name="status" value={status} />
        <button type="submit" className="btn-quiet btn-sm">Search</button>
        <div className="ml-auto flex gap-1.5">
          {(["active", "archived"] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/products?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              aria-pressed={status === s}
              className={`rounded-xs border px-3 py-1.5 font-display text-[12.5px] font-semibold capitalize ${
                status === s ? "border-brand-700 bg-brand-700 text-white" : "border-line-strong bg-card text-ink-soft"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </form>

      <p className="mt-3 text-[13px] text-ink-faint">{filtered.length} products shown</p>

      <div className="card mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[13.5px]">
          <thead>
            <tr className="border-b border-line bg-surface/60 font-display text-[11.5px] tracking-[0.12em] text-ink-faint uppercase">
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-brand-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-[12px] text-ink-faint">
                    {[brandById.get(p.brandId ?? ""), p.strength, p.packSize, p.featured && "★ featured"].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-[11.5px] text-ink-faint">/p/{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{catById.get(p.primaryCategoryId) ?? "—"}</td>
                <td className="px-4 py-3"><RxBadge rxClass={p.rxClass} compact /></td>
                <td className="px-4 py-3 font-display text-[11.5px] font-semibold tracking-wide text-enquiry uppercase">On enquiry</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Link href={`/admin/products/${p.id}`} className="btn-quiet btn-sm" aria-label={`Edit ${p.name}`}>
                      <Pencil size={13} aria-hidden="true" /> Edit
                    </Link>
                    {p.status === "active" && <ArchiveButton id={p.id} name={p.name} />}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-soft">
                  No products match. <Link href="/admin/products/new" className="text-brand-700 underline underline-offset-4">Add one</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-ink-faint">
        <Archive size={12} aria-hidden="true" /> Archiving hides a product from the storefront without deleting its history — enquiry records keep their name snapshots.
      </p>
    </div>
  );
}
