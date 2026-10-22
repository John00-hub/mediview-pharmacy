/**
 * Domain types — mirror the normalized product model from
 * MEDIVIEW_DIGITAL_MODERNIZATION_INTELLIGENCE_REPORT.md §4.4 and the
 * PostgreSQL schema in /supabase/schema.sql.
 */

export type RxClass =
  | "OTC"
  | "POM" // prescription-only — pharmacist verification required
  | "POM_OTC_WAIVER" // POM with OTC waiver (e.g. family planning, per PCN E-Pharmacy Regs 2026)
  | "DEVICE"
  | "GENERAL_RETAIL";
// NOTE: CONTROLLED_PROHIBITED_ONLINE exists in the database schema but is
// deliberately absent from all demo seed data and public flows — controlled
// medicines may not be sold online (PCN Electronic Pharmacy Regulations 2026).

export type DoseForm =
  | "tablet"
  | "caplet"
  | "capsule"
  | "syrup"
  | "suspension"
  | "sachet"
  | "cream"
  | "ointment"
  | "gel"
  | "wash"
  | "inhaler"
  | "nasal-spray"
  | "eye-drop"
  | "mouthwash"
  | "suppository"
  | "injection"
  | "device"
  | "test-kit"
  | "drink"
  | "food"
  | "other";

export type EnquiryStatus =
  | "NEW"
  | "UNDER_REVIEW"
  | "AWAITING_PHARMACIST"
  | "QUOTE_PREPARED"
  | "AWAITING_CUSTOMER"
  | "COMPLETED"
  | "CLOSED";

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  UNDER_REVIEW: "Under Review",
  AWAITING_PHARMACIST: "Awaiting Pharmacist",
  QUOTE_PREPARED: "Quote Prepared",
  AWAITING_CUSTOMER: "Awaiting Customer",
  COMPLETED: "Completed",
  CLOSED: "Closed",
};

/** Customer-facing status groupings for the tracking screen. */
export const ENQUIRY_STATUS_CUSTOMER_HINT: Record<EnquiryStatus, string> = {
  NEW: "Your enquiry has been received by the pharmacy.",
  UNDER_REVIEW: "Our team is reviewing the items you requested.",
  AWAITING_PHARMACIST: "A pharmacist is verifying prescription items before pricing.",
  QUOTE_PREPARED: "Your quote is ready — we will contact you on your preferred channel.",
  AWAITING_CUSTOMER: "We've sent you a quote and are waiting for your confirmation.",
  COMPLETED: "This enquiry has been fulfilled. Thank you.",
  CLOSED: "This enquiry was closed. Contact us if you still need these items.",
};

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide icon name resolved by <CategoryIcon/>
  sortOrder: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string; // normalized display name (title case — never ALL CAPS)
  searchName: string; // lowercased searchable string incl. generic name
  brandId: string | null;
  genericName: string | null; // only where unambiguous from source data
  doseForm: DoseForm;
  strength: string | null; // ONLY as stated on the source listing — never invented
  packSize: string | null; // ONLY as stated on the source listing
  primaryCategoryId: string;
  rxClass: RxClass;
  priceStatus: "ENQUIRY_ONLY"; // the demo never publishes prices (directive §7)
  stockStatus: "UNKNOWN"; // no verified stock feed exists (report §4.4)
  coldChain: boolean;
  description: string; // factual, claim-free; pharmacist-reviewed in production
  professionalUseOnly: boolean;
  featured: boolean;
  status: "active" | "archived";
  imageUrl: string | null; // demo: null → designed placeholder tile; prod: Supabase Storage
  imageAlt: string;
  updatedAt: string;
}

export interface EnquiryItem {
  productId: string;
  productName: string;
  quantity: number;
  note: string | null;
  hasPrescription: boolean; // customer declared a prescription is available
  prescriptionFileName: string | null; // demo stores METADATA ONLY — never the file
}

export interface EnquiryEvent {
  id: string;
  at: string;
  actor: string; // "customer" | staff display name
  type:
    | "SUBMITTED"
    | "STATUS_CHANGED"
    | "QUOTE_ADDED"
    | "NOTE_ADDED"
    | "PHARMACIST_REVIEW";
  detail: string;
}

export interface Enquiry {
  id: string;
  refCode: string; // e.g. MVP-2026-0147
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  contactPreference: "WHATSAPP" | "PHONE_CALL" | "EMAIL";
  fulfilment: "PICKUP" | "DELIVERY";
  deliveryAddress: string | null;
  additionalInfo: string | null;
  privacyAcknowledged: boolean;
  status: EnquiryStatus;
  pharmacistVerified: boolean; // only PHARMACIST/ADMIN roles may set true
  internalNotes: { at: string; author: string; text: string }[];
  items: EnquiryItem[];
  events: EnquiryEvent[];
  createdAt: string;
  updatedAt: string;
}

export type StaffRole = "ADMIN" | "PHARMACIST" | "SALES";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
}

export interface SiteContent {
  announcement: { text: string; enabled: boolean };
  about: { headline: string; body: string; pendingClientCopy: boolean };
  openingHours: { text: string; confirmed: boolean };
  featuredProductIds: string[];
  footerNote: string;
}

export interface TrackResult {
  enquiry: Enquiry;
}
