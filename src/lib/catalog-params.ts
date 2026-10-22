import type { CatalogFilters } from "@/components/catalog";

type SP = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] ?? "" : v ?? "";
}

export function parseCatalogParams(sp: SP): CatalogFilters {
  const brandRaw = first(sp.brand);
  const page = Math.max(1, parseInt(first(sp.page) || "1", 10) || 1);
  const sortRaw = first(sp.sort);
  return {
    brands: brandRaw ? brandRaw.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10) : [],
    form: first(sp.form).slice(0, 30),
    sort: sortRaw === "name" ? "name" : sortRaw === "newest" ? "newest" : "",
    page,
  };
}
