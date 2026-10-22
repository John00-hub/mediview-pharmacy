import { db } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { CatalogView } from "@/components/catalog";
import { parseCatalogParams } from "@/lib/catalog-params";

/** Demo data is mutable by the admin demo — always render fresh (production: ISR). */
export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Shop all products",
  description:
    "Browse the full Mediview Pharmacy catalogue — medicines, vitamins, devices and wellness essentials. Request current prices and availability by enquiry.",
  path: "/shop",
});

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseCatalogParams(sp);
  const store = db();
  const [{ products, total, pageSize }, categories, brands] = await Promise.all([
    store.listProducts({
      brandSlugs: filters.brands,
      forms: filters.form ? [filters.form] : undefined,
      sort: filters.sort || undefined,
      page: filters.page,
      pageSize: 24,
    }),
    store.listCategories(),
    store.listBrands(),
  ]);
  const brandById = new Map(brands.map((b) => [b.id, b.name]));
  const brandNames = new Map(products.map((p) => [p.id, p.brandId ? brandById.get(p.brandId) ?? "" : ""]));

  return (
    <CatalogView
      products={products}
      total={total}
      page={filters.page}
      pageSize={pageSize}
      categories={categories}
      brands={brands}
      brandNames={brandNames}
      filters={filters}
      basePath="/shop"
      heading="Shop all products"
      subheading="Everything publicly listed by Mediview Pharmacy, normalized and browsable. Prices are confirmed when you submit an enquiry."
    />
  );
}
