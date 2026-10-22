import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { CatalogView } from "@/components/catalog";
import { Breadcrumbs } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";
import { parseCatalogParams } from "@/lib/catalog-params";

/** Demo data is mutable by the admin demo — always render fresh (production: ISR). */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await db().getCategoryBySlug(slug);
  if (!category) return {};
  return buildMetadata({
    title: category.name,
    description: category.description,
    path: `/c/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const filters = parseCatalogParams(sp);
  const store = db();
  const category = await store.getCategoryBySlug(slug);
  if (!category) notFound();

  const [{ products, total, pageSize }, categories, brands] = await Promise.all([
    store.listProducts({
      categorySlug: category.slug,
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
    <>
      <div className="container-page pt-8 lg:pt-10">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Shop", href: "/shop" }, { name: category.name }]} />
      </div>
      <CatalogView
        products={products}
        total={total}
        page={filters.page}
        pageSize={pageSize}
        categories={categories}
        brands={brands}
        brandNames={brandNames}
        activeCategory={category}
        filters={filters}
        basePath={`/c/${category.slug}`}
        heading={category.name}
        subheading={category.description}
        emptyMessage={`No ${category.name.toLowerCase()} products match these filters yet — try clearing filters or ask us directly; we stock more than we can list.`}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: category.name, path: `/c/${category.slug}` },
        ])}
      />
      {products.length > 0 && (
        <JsonLd data={itemListJsonLd(category.name, products.map((p) => ({ name: p.name, slug: p.slug })))} />
      )}
    </>
  );
}
