/**
 * Verified business information — Intelligence Report §2.
 * ONLY facts published by the client's own current website are used here.
 * Items the client must confirm (hours, branches, licence numbers) are
 * explicitly modelled as "pending" — never fabricated.
 */

export const BUSINESS = {
  name: "Mediview Pharmacy",
  tagline: "Wellness & Lifestyle",
  domain: "mediviewpharmacy.com",
  address: {
    line1: "OBEJ Plaza, Plot 969 Aminu Crescent",
    line2: "Wuse 2, F.C.T. Abuja, Nigeria",
    landmarks: "Beside LG Showroom, Wuse 2 — adjacent to Eterna Oil",
  },
  phone: "+234 704 878 1219",
  phoneHref: "tel:+2347048781219",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2347048781219",
  email: "info@mediviewpharmacy.com",
  /**
   * Opening hours are NOT published on the current website (report §2.3).
   * The UI renders this as a pending-confirmation placeholder, not a guess.
   */
  openingHours: null as null | string,
  /**
   * PCN premises/e-pharmacy licence details were not displayed on the existing
   * site (report §12.2). Under the Electronic Pharmacy Regulations 2026 the
   * licence number and PCN mark must appear on the homepage once issued.
   * The UI reserves the slot and shows a compliance-pending note.
   */
  pcnLicence: null as null | string,
  socialAccounts: [] as { label: string; url: string }[], // client-owned accounts pending — never vendor links
} as const;

export function waLink(message?: string): string {
  const base = `https://wa.me/${BUSINESS.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mapsQuery(): string {
  return encodeURIComponent(
    `${BUSINESS.name} ${BUSINESS.address.line1} ${BUSINESS.address.line2}`
  );
}
