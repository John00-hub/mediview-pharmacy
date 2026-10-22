"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowUp, ArrowDown, Plus, Loader2, Pencil, X, Check } from "lucide-react";
import type { Category } from "@/lib/types";
import { CATEGORY_ICONS } from "@/components/ProductTile";
import { saveCategoryAction, reorderCategoriesAction } from "../../actions";

export function CategoriesManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState<Category[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function commit(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Failed");
      router.refresh();
    });
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    commit(() => reorderCategoriesAction(next.map((c) => c.id)));
  }

  return (
    <div className="max-w-3xl">
      {error && <p role="alert" className="mb-3 rounded-sm border border-rx/30 bg-rx-soft px-3.5 py-2.5 text-[13px] text-rx">{error}</p>}
      <ul className="card divide-y divide-line">
        {items.map((c, i) => {
          const Icon = CATEGORY_ICONS[c.icon as keyof typeof CATEGORY_ICONS];
          return (
            <li key={c.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button type="button" className="text-ink-faint hover:text-brand-800 disabled:opacity-30" disabled={i === 0 || pending} onClick={() => move(i, -1)} aria-label={`Move ${c.name} up`}>
                  <ArrowUp size={14} />
                </button>
                <button type="button" className="text-ink-faint hover:text-brand-800 disabled:opacity-30" disabled={i === items.length - 1 || pending} onClick={() => move(i, 1)} aria-label={`Move ${c.name} down`}>
                  <ArrowDown size={14} />
                </button>
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-brand-50 text-brand-700">
                {Icon ? <Icon size={17} aria-hidden="true" /> : null}
              </span>
              {editing === c.id ? (
                <CategoryEditor
                  category={c}
                  onCancel={() => setEditing(null)}
                  onSave={(data) => {
                    setEditing(null);
                    commit(() => saveCategoryAction({ id: c.id, slug: c.slug, ...data }));
                  }}
                />
              ) : (
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[14.5px] font-semibold text-ink">{c.name}</p>
                  <p className="truncate text-[12.5px] text-ink-faint">/c/{c.slug}</p>
                </div>
              )}
              {editing !== c.id && (
                <button type="button" className="btn-quiet btn-sm" onClick={() => { setEditing(c.id); setAdding(false); }} aria-label={`Edit ${c.name}`}>
                  <Pencil size={13} aria-hidden="true" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {adding ? (
        <div className="card mt-4 p-4">
          <CategoryEditor
            category={null}
            onCancel={() => setAdding(false)}
            onSave={(data) => {
              setAdding(false);
              commit(() => saveCategoryAction(data));
            }}
          />
        </div>
      ) : (
        <button type="button" className="btn-secondary btn-sm mt-4" onClick={() => { setAdding(true); setEditing(null); }}>
          <Plus size={15} aria-hidden="true" /> Add category
        </button>
      )}
      {pending && <p className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-faint"><Loader2 size={13} className="animate-spin" aria-hidden="true" /> Saving…</p>}
      <p className="mt-3 text-[12px] text-ink-faint">
        Order here drives the storefront navigation and category grid. Slugs are fixed after creation to protect URLs.
      </p>
    </div>
  );
}

function CategoryEditor({
  category,
  onSave,
  onCancel,
}: {
  category: Category | null;
  onSave: (data: { name: string; description: string; icon: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "Package");
  const icons = Object.keys(CATEGORY_ICONS);
  return (
    <div className="grid flex-1 gap-2.5 sm:grid-cols-[1fr_1.4fr_auto]">
      <label className="block">
        <span className="sr-only">Category name</span>
        <input className="field" value={name} maxLength={60} placeholder="Category name" onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block">
        <span className="sr-only">Description</span>
        <input className="field" value={description} maxLength={300} placeholder="Short customer-facing description" onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor={`icon-${category?.id ?? "new"}`}>Icon</label>
        <select id={`icon-${category?.id ?? "new"}`} className="field w-auto" value={icon} onChange={(e) => setIcon(e.target.value)}>
          {icons.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <button type="button" className="btn-primary btn-sm" disabled={!name.trim()} onClick={() => onSave({ name, description, icon })} aria-label="Save category">
          <Check size={14} aria-hidden="true" />
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={onCancel} aria-label="Cancel editing">
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
