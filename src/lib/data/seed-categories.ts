import type { Category } from "@/lib/types";

/**
 * Normalized category taxonomy — Intelligence Report §4.1.
 * Descriptions are factual and claim-free; none invent services or medical advice.
 */
export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-pain-relief",
    slug: "pain-relief",
    name: "Pain Relief",
    description:
      "Everyday analgesics and pain-management products, from paracetamol tablets to topical relief. Ask our pharmacist for guidance on the right option for you.",
    icon: "Bandage",
    sortOrder: 1,
  },
  {
    id: "cat-cough-cold-flu",
    slug: "cough-cold-flu",
    name: "Cough, Cold & Flu",
    description:
      "Cough syrups, inhalers, nasal sprays, throat lozenges and cold relief for adults and children.",
    icon: "Thermometer",
    sortOrder: 2,
  },
  {
    id: "cat-antimalarials",
    slug: "antimalarials",
    name: "Antimalarials",
    description:
      "Antimalarial treatments supplied with pharmacist verification. Malaria testing is available — speak to our team before starting any treatment.",
    icon: "Microscope",
    sortOrder: 3,
  },
  {
    id: "cat-blood-pressure-heart",
    slug: "blood-pressure-heart",
    name: "Blood Pressure & Heart",
    description:
      "Prescription cardiovascular medicines and home monitoring devices. Long-term medication? Ask about keeping your regular refill list.",
    icon: "HeartPulse",
    sortOrder: 4,
  },
  {
    id: "cat-diabetes-care",
    slug: "diabetes-care",
    name: "Diabetes Care",
    description:
      "Diabetes medicines, glucose meters, test strips and lancets. Cold-chain items such as insulin are handled with care for pickup or chilled delivery.",
    icon: "Droplets",
    sortOrder: 5,
  },
  {
    id: "cat-digestive-ulcer-care",
    slug: "digestive-ulcer-care",
    name: "Digestive & Ulcer Care",
    description:
      "Antacids, ulcer-care medicines, laxatives and digestive relief products.",
    icon: "Soup",
    sortOrder: 6,
  },
  {
    id: "cat-antibiotics",
    slug: "antibiotics",
    name: "Antibiotics (Prescription)",
    description:
      "Antibiotics are prescription-only medicines. A valid prescription is required and our pharmacist verifies every request before supply.",
    icon: "Pill",
    sortOrder: 7,
  },
  {
    id: "cat-mother-baby",
    slug: "mother-baby",
    name: "Mother & Baby",
    description:
      "Children's medicines, infant care, teething relief and prenatal supplements for mothers.",
    icon: "Baby",
    sortOrder: 8,
  },
  {
    id: "cat-skin-care",
    slug: "skin-care",
    name: "Skin Care",
    description:
      "Dermatological creams, antiseptics, acne care and first-aid skin products.",
    icon: "Hand",
    sortOrder: 9,
  },
  {
    id: "cat-oral-dental-care",
    slug: "oral-dental-care",
    name: "Oral & Dental Care",
    description: "Mouthwashes, oral rinses and everyday dental hygiene products.",
    icon: "Smile",
    sortOrder: 10,
  },
  {
    id: "cat-eye-ear-care",
    slug: "eye-ear-care",
    name: "Eye & Ear Care",
    description:
      "Eye drops, ointments and ear care. Prescription eye medicines are supplied only with pharmacist verification.",
    icon: "Eye",
    sortOrder: 11,
  },
  {
    id: "cat-vitamins-supplements",
    slug: "vitamins-supplements",
    name: "Vitamins & Supplements",
    description:
      "Multivitamins, minerals, omega oils, probiotics and wellness supplements from trusted brands.",
    icon: "Leaf",
    sortOrder: 12,
  },
  {
    id: "cat-sexual-wellness",
    slug: "sexual-wellness",
    name: "Sexual Wellness",
    description:
      "Family planning, condoms, fertility supplements and wellness products, handled with discretion.",
    icon: "HeartHandshake",
    sortOrder: 13,
  },
  {
    id: "cat-devices-diagnostics",
    slug: "devices-diagnostics",
    name: "Devices & Diagnostics",
    description:
      "Blood-pressure monitors, glucose meters, test strips, lancets and home test kits.",
    icon: "Stethoscope",
    sortOrder: 14,
  },
  {
    id: "cat-personal-care",
    slug: "personal-care",
    name: "Personal Care & Essentials",
    description:
      "Everyday personal care, nutrition, wellness teas and household health essentials.",
    icon: "ShoppingBasket",
    sortOrder: 15,
  },
];
