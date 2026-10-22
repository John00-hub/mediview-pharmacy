import Link from "next/link";
import { PackageX } from "lucide-react";
import type { Brand, Category, Product } from "@/lib/types";
import { ProductCard, Pagination } from "./ui";
import { SearchBox } from "./search-box";
import { FilterControls } from "./filter-controls";

export interface CatalogFilters {
  brands: string[];
  form: string;
  sort: "" | "name" | "newest";
  page: number;
}

/**
 * Server-rendered catalogue grid + GET-based filters.
 * Shared by /shop, /c/[slug] and /search so filtering behaviour is identical
 * everywhere (no duplicated logic — directive §19).
 */
export function CatalogView({
  products,
  total,
  page,
  pageSize,
  categories,
  brands,
  brandNames,
  activeCategory,
  filters,
  basePath,
  heading,
  subheading,
  emptyMessage,
}: {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  categories: Category[];
  brands: Brand[];
  brandNames: Map<string, string>;
  activeCategory?: Category | null;
  filters: CatalogFilters;
  basePath: string;
  heading: string;
  subheading?: string;
  emptyMessage?: string;
}) {
  const usedBrands = brands.filter(
    (b) => products.some((p) => p.brandId === b.id) || filters.brands.includes(b.slug)
  );
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const brandHref = (slug: string, on: boolean) => {
    const next = on ? filters.brands.filter((b) => b !== slug) : [...filters.brands, slug];
    const params = new URLSearchParams();
    if (next.length) params.set("brand", next.join(","));
    if (filters.form) params.set("form", filters.form);
    if (filters.sort) params.set("sort", filters.sort);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="container-page py-8 lg:py-10">
      <header className="mb-8">
        <h1 className="text-[28px] font-bold text-brand-950 sm:text-[34px]">{heading}</h1>
        {subheading && (
          <p className="mt-2.5 max-w-3xl text-[15.5px] leading-relaxed text-ink-soft">{subheading}</p>
        )}
        <p className="mt-3 text-[13.5px] text-ink-faint" aria-live="polite">
          {total} {total === 1 ? "product" : "products"}
          {total > pageSize && ` · page ${page} of ${totalPages}`}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside aria-label="Filters" className="lg:sticky lg:top-28 lg:self-start">
          <details className="card open:pb-4" open>
            <summary className="cursor-pointer list-none px-4 py-3.5 font-display text-[14px] font-semibold text-ink">
              Filters & sorting
            </summary>
            <div className="px-4">
              <FilterControls basePath={basePath} filters={filters} />
            </div>

            <div className="px-4">
              <p className="field-label mt-4">Categories</p>
              <ul className="space-y-1 text-[13.5px]">
                <li>
                  <Link
                    href="/shop"
                    className={!activeCategory ? "font-semibold text-brand-800" : "text-ink-soft hover:text-brand-800"}
                  >
                    All products
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/c/${c.slug}`}
                      className={
                        activeCategory?.id === c.id
                          ? "font-semibold text-brand-800"
                          : "text-ink-soft hover:text-brand-800"
                      }
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {usedBrands.length > 0 && (
                <>
                  <p className="field-label mt-5">Brand</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {usedBrands.slice(0, 18).map((b) => {
                      const on = filters.brands.includes(b.slug);
                      return (
                        <li key={b.id}>
                          <Link
                            href={brandHref(b.slug, on)}
                            aria-pressed={on}
                            className={`inline-block rounded-xs border px-2 py-1 text-[12px] transition-colors ${
                              on
                                ? "border-brand-700 bg-brand-700 text-white"
                                : "border-line-strong bg-card text-ink-soft hover:border-brand-500"
                            }`}
                          >
                            {b.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  {filters.brands.length > 0 && (
                    <Link
                      href={basePath}
                      className="mt-2 inline-block text-[12.5px] text-brand-700 underline underline-offset-4"
                    >
                      Clear all filters
                    </Link>
                  )}
                </>
              )}
            </div>
          </details>
        </aside>

        <div>
          <div className="mb-6 lg:hidden">
            <SearchBox />
          </div>
          {products.length === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
              <PackageX size={34} className="text-ink-faint" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold text-ink">No products match</h2>
              <p className="max-w-sm text-[14.5px] text-ink-soft">
                {emptyMessage ??
                  "Try removing a filter, or search for the generic name of your medicine."}
              </p>
              <div className="mt-2 flex gap-2">
                <Link href={basePath} className="btn-secondary btn-sm">
                  Clear filters
                </Link>
                <Link href="/contact" className="btn-quiet btn-sm">
                  Ask us directly
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} brandName={brandNames.get(p.id) ?? null} />
              ))}
            </div>
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath={basePath}
            searchParams={{
              brand: filters.brands.join(",") || undefined,
              form: filters.form || undefined,
              sort: filters.sort || undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}
