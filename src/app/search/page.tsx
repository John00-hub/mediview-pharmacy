import type { Metadata } from "next";
import { db } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { CatalogView } from "@/components/catalog";
import { parseCatalogParams } from "@/lib/catalog-params";
import { SearchBox } from "@/components/search-box";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search the Mediview Pharmacy catalogue by product name, brand or generic name.",
  path: "/search",
  noIndex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";
  const filters = parseCatalogParams(sp);
  const store = db();

  const [{ products, total, pageSize }, categories, brands] = await Promise.all([
    store.listProducts({
      query: q || undefined,
      brandSlugs: filters.brands,
      forms: filters.form ? [filters.form] : undefined,
      page: filters.page,
      pageSize: 24,
    }),
    store.listCategories(),
    store.listBrands(),
  ]);
  const brandById = new Map(brands.map((b) => [b.id, b.name]));
  const brandNames = new Map(products.map((p) => [p.id, p.brandId ? brandById.get(p.brandId) ?? "" : ""]));

  return (
    <div>
      <div className="border-b border-line bg-surface/60">
        <div className="container-page py-8">
          <h1 className="text-[26px] font-bold text-brand-950">
            {q ? <>Results for “<span className="text-brand-700">{q}</span>”</> : "Search the catalogue"}
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-soft">
            {q
              ? `${total} match${total === 1 ? "" : "es"} — typo-tolerant, searches brand, generic and product names.`
              : "Search by brand (Panadol), generic name (paracetamol) or product type."}
          </p>
          <div className="mt-5 max-w-xl">
            <SearchBox autoFocus={!q} />
          </div>
        </div>
      </div>
      <CatalogView
        products={products}
        total={total}
        page={filters.page}
        pageSize={pageSize}
        categories={categories}
        brands={brands}
        brandNames={brandNames}
        filters={filters}
        basePath="/search"
        heading={q ? `“${q}”` : "All products"}
        emptyMessage={
          q
            ? `Nothing matched “${q}”. Check the spelling, try the generic name, or ask us on WhatsApp — we stock more than we can list.`
            : undefined
        }
      />
    </div>
  );
}
