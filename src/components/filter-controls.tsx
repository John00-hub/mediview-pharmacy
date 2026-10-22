"use client";

import { useRouter } from "next/navigation";
import type { CatalogFilters } from "./catalog";

const FORM_OPTIONS = [
  ["", "All product types"],
  ["tablet", "Tablets & caplets"],
  ["capsule", "Capsules & softgels"],
  ["syrup", "Syrups & liquids"],
  ["cream", "Creams & ointments"],
  ["inhaler", "Inhalers & sprays"],
  ["injection", "Injections"],
  ["device", "Devices"],
  ["test-kit", "Test kits"],
  ["food", "Nutrition & teas"],
] as const;

/** GET-param filter controls; auto-navigate on change (progressive: plain form submit without JS). */
function asSort(v: unknown): "" | "name" | "newest" {
  const s = String(v ?? "");
  return s === "name" || s === "newest" ? s : "";
}

export function FilterControls({
  basePath,
  filters,
}: {
  basePath: string;
  filters: CatalogFilters;
}) {
  const router = useRouter();

  function navigate(next: Partial<CatalogFilters>) {
    const merged = { ...filters, ...next, page: 1 };
    const params = new URLSearchParams();
    if (merged.brands.length) params.set("brand", merged.brands.join(","));
    if (merged.form) params.set("form", merged.form);
    if (merged.sort) params.set("sort", merged.sort);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <form
      method="get"
      action={basePath}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        navigate({
          sort: asSort(data.get("sort")),
          form: String(data.get("form") ?? ""),
        });
      }}
    >
      <input type="hidden" name="brand" value={filters.brands.join(",")} />
      <label className="field-label" htmlFor="sort">Sort by</label>
      <select
        id="sort"
        name="sort"
        defaultValue={filters.sort}
        className="field mb-4"
        onChange={(e) => navigate({ sort: asSort(e.target.value) })}
      >
        <option value="">Featured first</option>
        <option value="name">Name A–Z</option>
      </select>

      <label className="field-label" htmlFor="form">Product type</label>
      <select
        id="form"
        name="form"
        defaultValue={filters.form}
        className="field"
        onChange={(e) => navigate({ form: e.target.value })}
      >
        {FORM_OPTIONS.map(([v, label]) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>

      <noscript>
        <button type="submit" className="btn-primary btn-sm mt-3 w-full">Apply</button>
      </noscript>
    </form>
  );
}
