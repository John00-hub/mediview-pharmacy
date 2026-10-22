import type { SiteContent } from "@/lib/types";

/**
 * Site content seed for the demo. Anything the client has NOT confirmed is
 * modelled with an explicit pending flag so the UI can label it honestly
 * (directive: "Do not manufacture missing business information").
 */
export const SEED_CONTENT: SiteContent = {
  announcement: {
    text: "Demonstration build by Midex Edits — not connected to the live pharmacy. No real orders are transmitted.",
    enabled: true,
  },
  about: {
    headline: "A Wuse 2 pharmacy, modernized",
    body: "Mediview Pharmacy serves the Wuse 2 community in Abuja from OBEJ Plaza, Plot 969 Aminu Crescent — beside the LG Showroom, adjacent to Eterna Oil. This website demonstrates how Mediview can extend that counter service online: browse the catalogue, build an enquiry, and let our pharmacist confirm prices, availability and any prescription requirements before you buy.\n\n[CLIENT COPY REQUIRED — establishment year, team introduction and Superintendent Pharmacist details to be supplied by Mediview Pharmacy and verified before production.]",
    pendingClientCopy: true,
  },
  openingHours: {
    text: "Opening hours pending confirmation by Mediview Pharmacy.",
    confirmed: false,
  },
  featuredProductIds: [],
  footerNote:
    "Demonstration platform built by Midex Edits. Business details shown are those published by Mediview Pharmacy's existing website. Prices are confirmed on enquiry — this demo never displays or collects payment.",
};
