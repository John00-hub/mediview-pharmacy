"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";
import { slugify } from "@/lib/data/seed-products";
import type { DoseForm, Product, RxClass, SiteContent } from "@/lib/types";

export type AdminActionResult = { ok: boolean; error?: string; fieldErrors?: Record<string, string> };

const RX_CLASSES: RxClass[] = ["OTC", "POM", "POM_OTC_WAIVER", "DEVICE", "GENERAL_RETAIL"];
const FORMS: DoseForm[] = [
  "tablet", "caplet", "capsule", "syrup", "suspension", "sachet", "cream", "ointment", "gel",
  "wash", "inhaler", "nasal-spray", "eye-drop", "mouthwash", "suppository", "injection",
  "device", "test-kit", "drink", "food", "other",
];

function isRx(v: string): v is RxClass { return (RX_CLASSES as string[]).includes(v); }
function isForm(v: string): v is DoseForm { return (FORMS as string[]).includes(v); }

export async function saveProductAction(input: {
  id?: string;
  slug?: string;
  name: string;
  brandName: string;
  genericName: string;
  doseForm: string;
  strength: string;
  packSize: string;
  categorySlug: string;
  rxClass: string;
  description: string;
  featured: boolean;
  coldChain: boolean;
  professionalUseOnly: boolean;
}): Promise<AdminActionResult> {
  try {
    await requireStaff(["ADMIN"]);
  } catch {
    return { ok: false, error: "Administrator role required." };
  }

  const name = input.name.trim();
  if (name.length < 2) return { ok: false, error: "Product name is required.", fieldErrors: { name: "Required" } };
  if (!isRx(input.rxClass)) return { ok: false, error: "Invalid prescription classification." };
  if (!isForm(input.doseForm)) return { ok: false, error: "Invalid product type." };

  const store = db();
  const category = await store.getCategoryBySlug(input.categorySlug);
  if (!category) return { ok: false, error: "Unknown category." };

  const brands = await store.listBrands();
  const brandName = input.brandName.trim();
  let brandId: string | null = null;
  if (brandName) {
    const existingBrand = brands.find((b) => b.name.toLowerCase() === brandName.toLowerCase());
    if (existingBrand) {
      brandId = existingBrand.id;
    } else {
      brandId = `brand-${slugify(brandName)}`;
      await store.upsertBrand({ id: brandId, slug: slugify(brandName), name: brandName });
    }
  }

  const slug = input.id && input.slug
    ? input.slug // slugs are STABLE — renames never change URLs (report §6.2 Principle 4)
    : slugify(`${name} ${input.strength} ${input.packSize}`.trim());

  const existing = input.id ? await store.getProductById(input.id) : null;

  const product: Product = {
    id: existing?.id ?? `prod-${slug}-${Date.now().toString(36)}`,
    slug: existing?.slug ?? slug,
    name,
    searchName: `${name} ${brandName} ${input.genericName} ${input.strength} ${input.packSize}`.toLowerCase(),
    brandId,
    genericName: input.genericName.trim() || null,
    doseForm: input.doseForm,
    strength: input.strength.trim() || null,
    packSize: input.packSize.trim() || null,
    primaryCategoryId: category.id,
    rxClass: input.rxClass,
    priceStatus: "ENQUIRY_ONLY",
    stockStatus: "UNKNOWN",
    coldChain: input.coldChain,
    description:
      input.description.trim() ||
      `${name}${brandName ? ` by ${brandName}` : ""}. Current price and availability are confirmed by our team when you submit an enquiry.`,
    professionalUseOnly: input.professionalUseOnly,
    featured: input.featured,
    status: existing?.status ?? "active",
    imageUrl: existing?.imageUrl ?? null,
    imageAlt: `${name}${input.strength ? ` ${input.strength}` : ""}${input.packSize ? ` — ${input.packSize}` : ""}`,
    updatedAt: new Date().toISOString(),
  };

  await store.upsertProduct(product);
  revalidatePath("/shop");
  revalidatePath(`/p/${product.slug}`);
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function archiveProductAction(id: string): Promise<AdminActionResult> {
  try {
    await requireStaff(["ADMIN"]);
  } catch {
    return { ok: false, error: "Administrator role required." };
  }
  await db().archiveProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { ok: true };
}

export async function saveCategoryAction(input: {
  id?: string;
  slug?: string;
  name: string;
  description: string;
  icon: string;
}): Promise<AdminActionResult> {
  try {
    await requireStaff(["ADMIN"]);
  } catch {
    return { ok: false, error: "Administrator role required." };
  }
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Category name is required." };
  const store = db();
  const categories = await store.listCategories();
  const slug = input.id && input.slug ? input.slug : slugify(name);
  const existing = input.id ? categories.find((c) => c.id === input.id) : undefined;
  await store.upsertCategory({
    id: existing?.id ?? `cat-${slug}`,
    slug: existing?.slug ?? slug,
    name,
    description: input.description.trim(),
    icon: input.icon || existing?.icon || "Package",
    sortOrder: existing?.sortOrder ?? categories.length + 1,
  });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { ok: true };
}

export async function reorderCategoriesAction(orderedIds: string[]): Promise<AdminActionResult> {
  try {
    await requireStaff(["ADMIN"]);
  } catch {
    return { ok: false, error: "Administrator role required." };
  }
  await db().reorderCategories(orderedIds);
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function saveContentAction(input: {
  announcementText: string;
  announcementEnabled: boolean;
  openingHours: string;
  openingHoursConfirmed: boolean;
  aboutHeadline: string;
  aboutBody: string;
  footerNote: string;
  featuredSlugs: string;
}): Promise<AdminActionResult> {
  try {
    await requireStaff(["ADMIN"]);
  } catch {
    return { ok: false, error: "Administrator role required." };
  }
  const store = db();
  const featuredIds: string[] = [];
  for (const slug of input.featuredSlugs.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8)) {
    const p = await store.getProductBySlug(slug);
    if (p) featuredIds.push(p.id);
  }
  const patch: Partial<SiteContent> = {
    announcement: { text: input.announcementText.trim().slice(0, 200), enabled: input.announcementEnabled },
    openingHours: { text: input.openingHours.trim().slice(0, 200), confirmed: input.openingHoursConfirmed },
    about: {
      headline: input.aboutHeadline.trim().slice(0, 120) || "About Mediview Pharmacy",
      body: input.aboutBody.trim().slice(0, 4000),
      pendingClientCopy: false,
    },
    footerNote: input.footerNote.trim().slice(0, 400),
    featuredProductIds: featuredIds,
  };
  await store.updateContent(patch);
  revalidatePath("/", "layout");
  return { ok: true };
}
