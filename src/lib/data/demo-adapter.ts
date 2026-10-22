import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type {
  Brand,
  Category,
  Enquiry,
  EnquiryEvent,
  EnquiryStatus,
  Product,
  SiteContent,
  StaffUser,
} from "@/lib/types";
import type { CreateEnquiryInput, DataPort } from "./ports";
import { SEED_CATEGORIES } from "./seed-categories";
import { SEED_BRANDS, SEED_PRODUCTS } from "./seed-products";
import { SEED_CONTENT } from "./seed-content";

/**
 * ⚠ DEMONSTRATION ADAPTER — NOT A PRODUCTION BACKEND.
 * Persists to a local JSON file (.data/demo-store.json) so the customer →
 * staff → tracking journey is fully demonstrable in one environment.
 * It is NOT secure multi-tenant storage, has no auth beyond demo sessions,
 * and must never be pointed at production data. The production path is the
 * Supabase adapter (/supabase) behind the same DataPort interface.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "demo-store.json");

interface DemoStore {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  content: SiteContent;
  enquiries: Enquiry[];
  staff: StaffUser[];
  counters: { enquirySeq: number };
}

/** Demo-only staff accounts. Credentials are published on the demo login page. */
const DEMO_STAFF: (StaffUser & { password: string })[] = [
  { id: "staff-admin", name: "Adaeze Demo (Admin)", email: "admin@demo.mediview", role: "ADMIN", password: "demo-admin-2026" },
  { id: "staff-pharmacist", name: "Pharm. Bala Demo", email: "pharmacist@demo.mediview", role: "PHARMACIST", password: "demo-pharmacist-2026" },
  { id: "staff-sales", name: "Chidi Demo (Sales)", email: "sales@demo.mediview", role: "SALES", password: "demo-sales-2026" },
];

function initialStore(): DemoStore {
  return {
    products: SEED_PRODUCTS.map((p) => ({ ...p })),
    categories: SEED_CATEGORIES.map((c) => ({ ...c })),
    brands: SEED_BRANDS.map((b) => ({ ...b })),
    content: structuredClone(SEED_CONTENT),
    enquiries: [],
    staff: DEMO_STAFF.map(({ password: _pw, ...s }) => s),
    counters: { enquirySeq: 0 },
  };
}

let cache: DemoStore | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function load(): Promise<DemoStore> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as DemoStore;
    // Merge seeds forward: if new seed products were added since last write, include them.
    const known = new Set(parsed.products.map((p) => p.id));
    for (const p of SEED_PRODUCTS) if (!known.has(p.id)) parsed.products.push({ ...p });
    const knownCats = new Set(parsed.categories.map((c) => c.id));
    for (const c of SEED_CATEGORIES) if (!knownCats.has(c.id)) parsed.categories.push({ ...c });
    cache = parsed;
  } catch {
    cache = initialStore();
    await persist();
  }
  return cache;
}

async function persist(): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    if (!cache) return;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(cache, null, 1), "utf8");
  });
  return writeQueue;
}

async function mutate<T>(fn: (store: DemoStore) => T): Promise<T> {
  const store = await load();
  const result = fn(store);
  await persist();
  return result;
}

/* ── search utilities ─────────────────────────────────────────────────────── */

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

function scoreProduct(p: Product, q: string): number {
  const name = p.name.toLowerCase();
  if (name === q) return 1000;
  if (name.startsWith(q)) return 800;
  if (name.includes(q)) return 600;
  if (p.searchName.includes(q)) return 400;
  // token-level fuzzy (typo tolerance)
  const qTokens = q.split(/\s+/).filter(Boolean);
  const pTokens = p.searchName.split(/\s+/).filter((t) => t.length > 2);
  let score = 0;
  for (const qt of qTokens) {
    let best = 0;
    for (const pt of pTokens) {
      if (pt === qt) best = Math.max(best, 300);
      else if (pt.startsWith(qt) || qt.startsWith(pt)) best = Math.max(best, 200);
      else {
        const dist = levenshtein(qt.slice(0, 12), pt.slice(0, 12));
        const tolerance = qt.length <= 4 ? 1 : 2;
        if (dist <= tolerance) best = Math.max(best, 150 - dist * 20);
      }
    }
    score += best;
  }
  return score;
}

/* ── simple in-memory rate limiting (demo-grade; production uses WAF/edge) ── */

const hits = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

/* ── reference codes ──────────────────────────────────────────────────────── */

function nextRefCode(store: DemoStore): string {
  store.counters.enquirySeq += 1;
  const year = new Date().getFullYear();
  return `MVP-${year}-${String(store.counters.enquirySeq).padStart(4, "0")}`;
}

/* ── adapter ──────────────────────────────────────────────────────────────── */

export const demoAdapter: DataPort = {
  kind: "demo-file",

  async listCategories() {
    const s = await load();
    return [...s.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async getCategoryBySlug(slug) {
    const s = await load();
    return s.categories.find((c) => c.slug === slug) ?? null;
  },

  async listBrands() {
    const s = await load();
    return [...s.brands].sort((a, b) => a.name.localeCompare(b.name));
  },

  async listProducts(opts = {}) {
    const s = await load();
    let items = s.products.filter((p) => (opts.includeArchived ? true : p.status === "active"));
    if (opts.featuredOnly) items = items.filter((p) => p.featured);
    if (opts.categorySlug) {
      const cat = s.categories.find((c) => c.slug === opts.categorySlug);
      if (!cat) return { products: [], total: 0, page: 1, pageSize: opts.pageSize ?? 24 };
      items = items.filter((p) => p.primaryCategoryId === cat.id);
    }
    if (opts.brandSlugs?.length) {
      const ids = new Set(s.brands.filter((b) => opts.brandSlugs!.includes(b.slug)).map((b) => b.id));
      items = items.filter((p) => p.brandId && ids.has(p.brandId));
    }
    if (opts.forms?.length) items = items.filter((p) => opts.forms!.includes(p.doseForm));
    if (opts.rxClasses?.length) items = items.filter((p) => opts.rxClasses!.includes(p.rxClass));
    if (opts.query && opts.query.trim()) {
      const q = opts.query.trim().toLowerCase();
      items = items
        .map((p) => ({ p, score: scoreProduct(p, q) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p);
    } else if (opts.sort === "name") {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      items = [...items].sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
    }
    const pageSize = opts.pageSize ?? 24;
    const page = Math.max(1, opts.page ?? 1);
    const start = (page - 1) * pageSize;
    return { products: items.slice(start, start + pageSize), total: items.length, page, pageSize };
  },

  async getProductBySlug(slug) {
    const s = await load();
    return s.products.find((p) => p.slug === slug && p.status === "active") ?? null;
  },

  async getProductById(id) {
    const s = await load();
    return s.products.find((p) => p.id === id) ?? null;
  },

  async getRelatedProducts(product, limit = 4) {
    const s = await load();
    const sameCat = s.products.filter(
      (p) => p.id !== product.id && p.status === "active" && p.primaryCategoryId === product.primaryCategoryId
    );
    const pick = [...sameCat].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, limit);
    if (pick.length < limit) {
      const brandMatch = s.products.filter(
        (p) =>
          !pick.some((x) => x.id === p.id) &&
          p.id !== product.id &&
          p.status === "active" &&
          product.brandId &&
          p.brandId === product.brandId
      );
      pick.push(...brandMatch.slice(0, limit - pick.length));
    }
    return pick;
  },

  async suggest(search, limit = 6) {
    const s = await load();
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const productHits = s.products
      .filter((p) => p.status === "active")
      .map((p) => ({ p, score: scoreProduct(p, q) }))
      .filter((x) => x.score >= 120)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit - 1)
      .map((x) => ({ label: x.p.name, href: `/p/${x.p.slug}`, kind: "product" as const }));
    const catHits = s.categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 1)
      .map((c) => ({ label: c.name, href: `/c/${c.slug}`, kind: "category" as const }));
    return [...catHits, ...productHits].slice(0, limit);
  },

  async upsertProduct(product) {
    return mutate((s) => {
      const idx = s.products.findIndex((p) => p.id === product.id);
      const next = { ...product, updatedAt: new Date().toISOString() };
      if (idx >= 0) s.products[idx] = next;
      else s.products.push(next);
      return next;
    });
  },

  async archiveProduct(id) {
    return mutate((s) => {
      const p = s.products.find((x) => x.id === id);
      if (p) {
        p.status = "archived";
        p.updatedAt = new Date().toISOString();
      }
    });
  },

  async upsertBrand(brand) {
    return mutate((s) => {
      const idx = s.brands.findIndex((b) => b.id === brand.id);
      if (idx >= 0) s.brands[idx] = brand;
      else s.brands.push(brand);
      return brand;
    });
  },

  async upsertCategory(category) {
    return mutate((s) => {
      const idx = s.categories.findIndex((c) => c.id === category.id);
      if (idx >= 0) s.categories[idx] = category;
      else s.categories.push(category);
      return category;
    });
  },

  async reorderCategories(orderedIds) {
    return mutate((s) => {
      orderedIds.forEach((id, i) => {
        const c = s.categories.find((x) => x.id === id);
        if (c) c.sortOrder = i + 1;
      });
    });
  },

  async getContent() {
    const s = await load();
    return s.content;
  },

  async updateContent(patch) {
    return mutate((s) => {
      s.content = { ...s.content, ...patch };
      return s.content;
    });
  },

  async createEnquiry(input: CreateEnquiryInput) {
    return mutate((s) => {
      const now = new Date().toISOString();
      const refCode = nextRefCode(s);
      const items = input.items.map((it) => {
        const product = s.products.find((p) => p.id === it.productId);
        return {
          productId: it.productId,
          productName: product?.name ?? "Unknown item",
          quantity: it.quantity,
          note: it.note ?? null,
          hasPrescription: Boolean(it.hasPrescription),
          prescriptionFileName: it.prescriptionFileName ?? null,
        };
      });
      const needsPharmacist = items.some((it) => {
        const p = s.products.find((x) => x.id === it.productId);
        return p?.rxClass === "POM" || it.hasPrescription;
      });
      const enquiry: Enquiry = {
        id: `enq-${refCode.toLowerCase()}`,
        refCode,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail ?? null,
        contactPreference: input.contactPreference,
        fulfilment: input.fulfilment,
        deliveryAddress: input.deliveryAddress ?? null,
        additionalInfo: input.additionalInfo ?? null,
        privacyAcknowledged: true,
        status: needsPharmacist ? "AWAITING_PHARMACIST" : "NEW",
        pharmacistVerified: false,
        internalNotes: [],
        items,
        events: [
          {
            id: `evt-${refCode}-1`,
            at: now,
            actor: "customer",
            type: "SUBMITTED",
            detail: `Enquiry submitted with ${items.length} item(s) — ${input.fulfilment.toLowerCase()}.`,
          },
          ...(needsPharmacist
            ? ([{
                id: `evt-${refCode}-2`,
                at: now,
                actor: "system",
                type: "STATUS_CHANGED",
                detail: "Prescription-only items detected — routed for pharmacist verification.",
              }] as EnquiryEvent[])
            : []),
        ],
        createdAt: now,
        updatedAt: now,
      };
      s.enquiries.unshift(enquiry);
      return enquiry;
    });
  },

  async listEnquiries(filter) {
    const s = await load();
    const items = filter?.status ? s.enquiries.filter((e) => e.status === filter.status) : s.enquiries;
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getEnquiryById(id) {
    const s = await load();
    return s.enquiries.find((e) => e.id === id) ?? null;
  },

  async trackEnquiry(refCode, phone) {
    const s = await load();
    const normalize = (v: string) => v.replace(/[^\d]/g, "");
    return (
      s.enquiries.find(
        (e) =>
          e.refCode.toLowerCase() === refCode.trim().toLowerCase() &&
          normalize(e.customerPhone).endsWith(normalize(phone).slice(-10)) &&
          normalize(phone).length >= 10
      ) ?? null
    );
  },

  async updateStatus(id, status: EnquiryStatus, actor: StaffUser) {
    return mutate((s) => {
      const e = s.enquiries.find((x) => x.id === id);
      if (!e) throw new Error("Enquiry not found");
      const now = new Date().toISOString();
      const prev = e.status;
      e.status = status;
      e.updatedAt = now;
      e.events.push({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: now,
        actor: actor.name,
        type: "STATUS_CHANGED",
        detail: `Status changed: ${prev} → ${status}.`,
      });
      return e;
    });
  },

  async addInternalNote(id, text, actor) {
    return mutate((s) => {
      const e = s.enquiries.find((x) => x.id === id);
      if (!e) throw new Error("Enquiry not found");
      const now = new Date().toISOString();
      e.internalNotes.push({ at: now, author: actor.name, text });
      e.updatedAt = now;
      e.events.push({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: now,
        actor: actor.name,
        type: "NOTE_ADDED",
        detail: "Internal note added.",
      });
      return e;
    });
  },

  async setPharmacistVerified(id, verified, actor) {
    if (actor.role !== "PHARMACIST" && actor.role !== "ADMIN") {
      throw new Error("Only a pharmacist or administrator may record prescription verification.");
    }
    return mutate((s) => {
      const e = s.enquiries.find((x) => x.id === id);
      if (!e) throw new Error("Enquiry not found");
      const now = new Date().toISOString();
      e.pharmacistVerified = verified;
      e.updatedAt = now;
      if (verified && e.status === "AWAITING_PHARMACIST") e.status = "UNDER_REVIEW";
      e.events.push({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: now,
        actor: actor.name,
        type: "PHARMACIST_REVIEW",
        detail: verified
          ? "Pharmacist verification recorded for prescription items."
          : "Pharmacist verification withdrawn.",
      });
      return e;
    });
  },

  async addQuote(id, _itemId, note, actor) {
    return mutate((s) => {
      const e = s.enquiries.find((x) => x.id === id);
      if (!e) throw new Error("Enquiry not found");
      const now = new Date().toISOString();
      e.status = "QUOTE_PREPARED";
      e.updatedAt = now;
      e.events.push({
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: now,
        actor: actor.name,
        type: "QUOTE_ADDED",
        detail: note || "Quote prepared for customer.",
      });
      return e;
    });
  },

  async listStaff() {
    const s = await load();
    return s.staff;
  },

  async validateLogin(email, password) {
    const match = DEMO_STAFF.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!match) return null;
    const { password: _pw, ...user } = match;
    return user;
  },
};
