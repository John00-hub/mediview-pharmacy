import type {
  Brand,
  Category,
  Enquiry,
  EnquiryStatus,
  Product,
  SiteContent,
  StaffRole,
  StaffUser,
} from "@/lib/types";

/**
 * DataPort — the single interface the application consumes.
 * Two implementations exist:
 *   1. DemoFileAdapter  (server-side JSON persistence, demo only)
 *   2. SupabaseAdapter  (production; maps 1:1 onto /supabase/schema.sql)
 * Swapping adapters must never require touching UI code (directive §4).
 */
export interface CatalogPort {
  listCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  listBrands(): Promise<Brand[]>;
  listProducts(opts?: {
    categorySlug?: string;
    brandSlugs?: string[];
    forms?: string[];
    rxClasses?: string[];
    query?: string;
    sort?: "name" | "newest";
    page?: number;
    pageSize?: number;
    featuredOnly?: boolean;
    includeArchived?: boolean;
  }): Promise<{ products: Product[]; total: number; page: number; pageSize: number }>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getRelatedProducts(product: Product, limit?: number): Promise<Product[]>;
  suggest(search: string, limit?: number): Promise<{ label: string; href: string; kind: "product" | "category" }[]>;
  // Admin mutations
  upsertProduct(product: Product): Promise<Product>;
  archiveProduct(id: string): Promise<void>;
  upsertBrand(brand: Brand): Promise<Brand>;
  upsertCategory(category: Category): Promise<Category>;
  reorderCategories(orderedIds: string[]): Promise<void>;
  updateContent(content: Partial<SiteContent>): Promise<SiteContent>;
  getContent(): Promise<SiteContent>;
}

export interface EnquiryPort {
  createEnquiry(input: CreateEnquiryInput): Promise<Enquiry>;
  listEnquiries(filter?: { status?: EnquiryStatus }): Promise<Enquiry[]>;
  getEnquiryById(id: string): Promise<Enquiry | null>;
  /** Tracking lookup requires ref + phone match — never ref alone (directive §13). */
  trackEnquiry(refCode: string, phone: string): Promise<Enquiry | null>;
  updateStatus(id: string, status: EnquiryStatus, actor: StaffUser): Promise<Enquiry>;
  addInternalNote(id: string, text: string, actor: StaffUser): Promise<Enquiry>;
  /** Only PHARMACIST/ADMIN may set this; enforced server-side (directive §11/§12). */
  setPharmacistVerified(id: string, verified: boolean, actor: StaffUser): Promise<Enquiry>;
  addQuote(id: string, itemId: string | null, note: string, actor: StaffUser): Promise<Enquiry>;
}

export interface CreateEnquiryInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  contactPreference: "WHATSAPP" | "PHONE_CALL" | "EMAIL";
  fulfilment: "PICKUP" | "DELIVERY";
  deliveryAddress?: string | null;
  additionalInfo?: string | null;
  items: {
    productId: string;
    quantity: number;
    note?: string | null;
    hasPrescription?: boolean;
    prescriptionFileName?: string | null; // metadata only in demo
  }[];
}

export interface StaffPort {
  listStaff(): Promise<StaffUser[]>;
  validateLogin(email: string, password: string): Promise<StaffUser | null>;
}

export interface DataPort extends CatalogPort, EnquiryPort, StaffPort {
  readonly kind: "demo-file" | "supabase";
}

export const canApproveAsPharmacist = (role: StaffRole) =>
  role === "PHARMACIST" || role === "ADMIN";
