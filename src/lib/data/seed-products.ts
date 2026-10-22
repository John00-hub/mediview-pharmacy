import type { Brand, DoseForm, Product, RxClass } from "@/lib/types";

/**
 * DEMONSTRATION CATALOGUE — derived exclusively from products publicly listed
 * on the client's existing website (captured 21 Oct 2026; see
 * mediview-research/raw/home.html, cat53.html, presc.html, search_panadol.html
 * and homepage_products.csv in the research workspace).
 *
 * Cleaning rules applied (Intelligence Report §4.4):
 *  - Names normalized to title case; obvious typographic errors corrected
 *    ("SYROP"→Syrup, "INHALAR"→Inhaler, "PFIFER"→Pfizer, "ALBBENDAZOLE"→Albendazole).
 *    Corrections are documented and flagged for pharmacist review in production.
 *  - Strength/pack values are carried ONLY where stated in the source listing.
 *    Nothing is invented to fill gaps.
 *  - Duplicate source entries merged (e.g. two Tetley Super Fruit teas → one).
 *  - Claim-stuffed source entries EXCLUDED (e.g. the "Revive boosts…" item).
 *  - Controlled / prohibited-online items EXCLUDED entirely (alprazolam,
 *    codeine-class combinations such as Solpadine Max, tramadol).
 *  - rx_class set ONLY where unambiguous; every classification is subject to
 *    final sign-off by Mediview's Superintendent Pharmacist before production.
 *  - Descriptions are factual and claim-free. No indications, efficacy claims
 *    or medical advice are generated.
 */

interface SeedRow {
  name: string;
  brand?: string;
  generic?: string; // only where the generic name is unambiguous pharmaceutical knowledge
  form: DoseForm;
  strength?: string; // only as stated in the source listing
  pack?: string; // only as stated in the source listing
  cat: string; // category slug
  rx: RxClass;
  featured?: boolean;
  cold?: boolean;
  prof?: boolean; // professional use only (e.g. surgical sutures)
}

const rows: SeedRow[] = [
  // ── Pain relief ────────────────────────────────────────────────────────────
  { name: "Panadol ActiFast Tablets", brand: "Panadol", generic: "paracetamol", form: "tablet", pack: "14 tablets", cat: "pain-relief", rx: "OTC", featured: true },
  { name: "Panadol ActiFast Tablets", brand: "Panadol", generic: "paracetamol", form: "tablet", pack: "20 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Panadol ActiFast Soluble Tablets", brand: "Panadol", generic: "paracetamol", form: "tablet", pack: "24 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Panadol Advance Tablets", brand: "Panadol", generic: "paracetamol", form: "tablet", pack: "16 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Panadol Extra Soluble Tablets", brand: "Panadol", form: "tablet", pack: "24 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Panadol Night Tablets", brand: "Panadol", form: "tablet", pack: "20 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Panadol Night Tablets (GSK)", brand: "Panadol", form: "tablet", pack: "24 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Panadol Sinus Caplets", brand: "Panadol", form: "caplet", pack: "24 caplets", cat: "pain-relief", rx: "OTC" },
  { name: "Advil Ibuprofen Tablets", brand: "Advil", generic: "ibuprofen", form: "tablet", strength: "200mg", pack: "24 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Excedrin Migraine Tablets (UK)", brand: "Excedrin", form: "tablet", pack: "24 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Tylenol PM Tablets (UK)", brand: "Tylenol", form: "tablet", pack: "24 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Aspirin Low Dose Tablets (Bayer)", brand: "Bayer", generic: "aspirin", form: "tablet", pack: "32 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Quality Plus Sinus & Headache Tablets", brand: "Quality Plus", form: "tablet", cat: "pain-relief", rx: "OTC" },
  { name: "Flexigo Joint Support Tablets", brand: "Flexigo", form: "tablet", pack: "30 tablets", cat: "pain-relief", rx: "OTC" },
  { name: "Depo-Medrol Injection", brand: "Depo-Medrol", generic: "methylprednisolone", form: "injection", strength: "80mg/2ml", cat: "pain-relief", rx: "POM" },

  // ── Cough, cold & flu ─────────────────────────────────────────────────────
  { name: "Vicks Sinex Micromist Nasal Spray", brand: "Vicks", form: "nasal-spray", cat: "cough-cold-flu", rx: "OTC", featured: true },
  { name: "Vicks Inhaler Nasal Stick", brand: "Vicks", form: "inhaler", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Vicks Cough Syrup", brand: "Vicks", form: "syrup", pack: "120ml", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Vicks VapoRub", brand: "Vicks", form: "ointment", pack: "100g", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Olbas Oil Adult", brand: "Olbas", form: "other", pack: "12ml", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Olbas Inhaler", brand: "Olbas", form: "inhaler", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Buttercup Original Cough Syrup", brand: "Buttercup", form: "syrup", pack: "75ml", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Buttercup Cough Syrup", brand: "Buttercup", form: "syrup", pack: "150ml", cat: "cough-cold-flu", rx: "OTC" },
  { name: "BronchoStop Cough Syrup", brand: "BronchoStop", form: "syrup", pack: "120ml", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Robitussin Chesty Cough Syrup", brand: "Robitussin", form: "syrup", pack: "100ml", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Day Nurse Liquid", brand: "Day Nurse", form: "drink", pack: "240ml", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Lemsip Cold & Flu Lemon Sachets", brand: "Lemsip", form: "sachet", pack: "5 sachets", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Kold Time 2-Way Inhaler", brand: "Kold Time", form: "inhaler", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Strepsils Sore Throat & Blocked Nose Lozenges", brand: "Strepsils", form: "other", pack: "36 lozenges", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Strepsils Sore Throat Pain Relief Lozenges", brand: "Strepsils", form: "other", pack: "24 lozenges", cat: "cough-cold-flu", rx: "OTC" },
  { name: "Panadol Coldflu Tablets", brand: "Panadol", form: "tablet", pack: "24 tablets", cat: "cough-cold-flu", rx: "OTC" },

  // ── Antimalarials (pharmacist-verified supply) ────────────────────────────
  { name: "Nimartem QS Tablets", brand: "Nimartem", form: "tablet", pack: "6 tablets", cat: "antimalarials", rx: "POM", featured: true },
  { name: "Comalart Plus Tablets", brand: "Comalart", form: "tablet", pack: "6 tablets", cat: "antimalarials", rx: "POM" },
  { name: "Paludose P Tablets", brand: "Paludose", form: "tablet", pack: "6 tablets", cat: "antimalarials", rx: "POM" },
  { name: "Paludrine Tablets", brand: "Paludrine", generic: "proguanil", form: "tablet", strength: "100mg", pack: "98 tablets", cat: "antimalarials", rx: "POM" },
  { name: "Paluther Injection", brand: "Paluther", form: "injection", strength: "80mg", cat: "antimalarials", rx: "POM" },
  { name: "BG Mal Suspension", brand: "BG", form: "suspension", pack: "60ml", cat: "antimalarials", rx: "POM" },
  { name: "BG Mal 560 Tablets", brand: "BG", form: "tablet", pack: "6 tablets", cat: "antimalarials", rx: "POM" },
  { name: "BG Vid Tablets", brand: "BG", form: "tablet", strength: "200mg", pack: "10 tablets", cat: "antimalarials", rx: "POM" },

  // ── Blood pressure & heart (prescription) ─────────────────────────────────
  { name: "Tenormin Tablets", brand: "Tenormin", generic: "atenolol", form: "tablet", strength: "50mg", cat: "blood-pressure-heart", rx: "POM" },
  { name: "Tenoretic Tablets", brand: "Tenoretic", form: "tablet", strength: "100/25mg", cat: "blood-pressure-heart", rx: "POM" },
  { name: "Tenoret Tablets", brand: "Tenoret", generic: "atenolol", form: "tablet", strength: "50mg", pack: "28 tablets", cat: "blood-pressure-heart", rx: "POM" },
  { name: "Tritace Tablets", brand: "Tritace", generic: "ramipril", form: "tablet", strength: "10mg", cat: "blood-pressure-heart", rx: "POM" },
  { name: "Zestril Tablets", brand: "Zestril", generic: "lisinopril", form: "tablet", strength: "10mg", cat: "blood-pressure-heart", rx: "POM" },
  { name: "Zestoretic Tablets", brand: "Zestoretic", form: "tablet", strength: "20mg", cat: "blood-pressure-heart", rx: "POM" },
  { name: "Natrixam Tablets", brand: "Natrixam", form: "tablet", strength: "1.5mg/10mg", pack: "30 tablets", cat: "blood-pressure-heart", rx: "POM" },
  { name: "Caduet Tablets", brand: "Caduet", form: "tablet", strength: "10mg/10mg", cat: "blood-pressure-heart", rx: "POM" },
  { name: "Simvastatin Tablets", generic: "simvastatin", form: "tablet", strength: "10mg", pack: "28 tablets", cat: "blood-pressure-heart", rx: "POM" },
  { name: "Dogrek Clopidogrel Tablets", brand: "Dogrek", generic: "clopidogrel", form: "tablet", strength: "75mg", pack: "28 tablets", cat: "blood-pressure-heart", rx: "POM", featured: true },
  { name: "Daflon Tablets", brand: "Daflon", form: "tablet", strength: "1000mg", pack: "30 tablets", cat: "blood-pressure-heart", rx: "POM" },

  // ── Diabetes care ─────────────────────────────────────────────────────────
  { name: "Amaryl Tablets", brand: "Amaryl", generic: "glimepiride", form: "tablet", strength: "2mg", cat: "diabetes-care", rx: "POM" },
  { name: "Apidra SoloStar Insulin", brand: "Apidra", generic: "insulin glulisine", form: "injection", pack: "5 pens", cat: "diabetes-care", rx: "POM", cold: true, featured: true },

  // ── Digestive & ulcer care ────────────────────────────────────────────────
  { name: "Gaviscon Double Action Tablets", brand: "Gaviscon", form: "tablet", pack: "48 tablets", cat: "digestive-ulcer-care", rx: "OTC" },
  { name: "Maalox Plus Suspension", brand: "Maalox", form: "suspension", cat: "digestive-ulcer-care", rx: "OTC" },
  { name: "Phillips' Milk of Magnesia Liquid", brand: "Phillips'", form: "drink", pack: "200ml", cat: "digestive-ulcer-care", rx: "OTC" },
  { name: "Dulcolax Coated Tablets", brand: "Dulcolax", generic: "bisacodyl", form: "tablet", strength: "5mg", pack: "30 tablets", cat: "digestive-ulcer-care", rx: "OTC" },
  { name: "Glycerin Suppositories (Adult)", form: "suppository", pack: "12 suppositories", cat: "digestive-ulcer-care", rx: "OTC" },
  { name: "Microlax Micro-Enema", brand: "Microlax", form: "other", cat: "digestive-ulcer-care", rx: "OTC" },
  { name: "Senokot Tablets", brand: "Senokot", generic: "senna", form: "tablet", cat: "digestive-ulcer-care", rx: "OTC" },
  { name: "Quality Plus Antidiarrheal Tablets", brand: "Quality Plus", form: "tablet", pack: "12 tablets", cat: "digestive-ulcer-care", rx: "OTC" },
  { name: "Cimetidine Tablets", generic: "cimetidine", form: "tablet", strength: "200mg", cat: "digestive-ulcer-care", rx: "POM" },
  { name: "Zeben Albendazole Tablets", brand: "Zeben", generic: "albendazole", form: "tablet", cat: "digestive-ulcer-care", rx: "OTC" },

  // ── Antibiotics (prescription only) ───────────────────────────────────────
  { name: "Cefuroxime Tablets", generic: "cefuroxime", form: "tablet", strength: "250mg", pack: "10 tablets", cat: "antibiotics", rx: "POM" },
  { name: "Levopharm Levofloxacin Tablets", brand: "Levopharm", generic: "levofloxacin", form: "tablet", strength: "500mg", cat: "antibiotics", rx: "POM" },
  { name: "Orelox Oral Suspension", brand: "Orelox", form: "suspension", strength: "40mg/5ml", pack: "50ml", cat: "antibiotics", rx: "POM" },
  { name: "BG Levo Cef Tablets", brand: "BG", form: "tablet", strength: "500mg", cat: "antibiotics", rx: "POM" },

  // ── Mother & baby ─────────────────────────────────────────────────────────
  { name: "Calpol Infant Suspension", brand: "Calpol", generic: "paracetamol", form: "suspension", pack: "100ml", cat: "mother-baby", rx: "OTC", featured: true },
  { name: "Calpol SixPlus Syrup", brand: "Calpol", generic: "paracetamol", form: "syrup", cat: "mother-baby", rx: "OTC" },
  { name: "Panadol Enfant Suspension", brand: "Panadol", form: "suspension", cat: "mother-baby", rx: "OTC" },
  { name: "CalCough Syrup (1 Year+)", brand: "CalCough", form: "syrup", pack: "125ml", cat: "mother-baby", rx: "OTC" },
  { name: "CalCough Children's Syrup — Blackcurrant", brand: "CalCough", form: "syrup", pack: "125ml", cat: "mother-baby", rx: "OTC" },
  { name: "Benylin Children's Dry Cough & Sore Throat Syrup", brand: "Benylin", form: "syrup", cat: "mother-baby", rx: "OTC" },
  { name: "Benylin Children's Night Syrup", brand: "Benylin", form: "syrup", pack: "125ml", cat: "mother-baby", rx: "OTC" },
  { name: "Calpol Saline Nasal Spray", brand: "Calpol", form: "nasal-spray", cat: "mother-baby", rx: "OTC" },
  { name: "Bonjela Teething Baby Sugar-Free Gel", brand: "Bonjela", form: "gel", cat: "mother-baby", rx: "OTC" },
  { name: "Haliborange Baby Multivitamin Liquid", brand: "Haliborange", form: "drink", cat: "mother-baby", rx: "OTC" },
  { name: "Vitane Drops", brand: "Vitane", form: "other", pack: "30ml", cat: "mother-baby", rx: "OTC" },
  { name: "Minavex Multivitamin Liquid", brand: "Minavex", form: "drink", pack: "200ml", cat: "mother-baby", rx: "OTC" },
  { name: "Healthy Kids Probiotic Chewables", form: "tablet", pack: "60 chewables", cat: "mother-baby", rx: "OTC" },
  { name: "SAM Cyproheptadine & Multivitamin Syrup", brand: "SAM", generic: "cyproheptadine", form: "syrup", pack: "200ml", cat: "mother-baby", rx: "OTC" },
  { name: "Mason Folic Acid Tablets", brand: "Mason", generic: "folic acid", form: "tablet", strength: "800mcg", pack: "100 tablets", cat: "mother-baby", rx: "OTC" },
  { name: "Vitalsprings Prenatal Care Mix", brand: "Vitalsprings", form: "capsule", pack: "30 capsules", cat: "mother-baby", rx: "OTC" },
  { name: "Pregvyta Capsules", brand: "Pregvyta", form: "capsule", pack: "30 capsules", cat: "mother-baby", rx: "OTC" },
  { name: "PregnaGain Plus", brand: "PregnaGain", form: "capsule", cat: "mother-baby", rx: "OTC" },

  // ── Skin care ─────────────────────────────────────────────────────────────
  { name: "Eurax Cream", brand: "Eurax", generic: "crotamiton", form: "cream", pack: "100g", cat: "skin-care", rx: "OTC" },
  { name: "Eurax Cream", brand: "Eurax", generic: "crotamiton", form: "cream", pack: "30g", cat: "skin-care", rx: "OTC" },
  { name: "Betadine Antiseptic Solution Spray", brand: "Betadine", form: "other", pack: "125ml", cat: "skin-care", rx: "OTC" },
  { name: "Betadine 10 Cream", brand: "Betadine", form: "cream", cat: "skin-care", rx: "OTC" },
  { name: "PanOxyl Acne Foaming Wash (UK)", brand: "PanOxyl", form: "wash", cat: "skin-care", rx: "OTC" },
  { name: "Aquasulf Cream", brand: "Aquasulf", form: "cream", cat: "skin-care", rx: "POM" },

  // ── Oral & dental care ────────────────────────────────────────────────────
  { name: "Listerine Naturals Enamel Protection Mouthwash", brand: "Listerine", form: "mouthwash", pack: "500ml", cat: "oral-dental-care", rx: "OTC" },
  { name: "Listerine Smart Rinse Zero Alcohol", brand: "Listerine", form: "mouthwash", pack: "250ml", cat: "oral-dental-care", rx: "OTC" },
  { name: "Oraldene Mouthwash", brand: "Oraldene", form: "mouthwash", pack: "200ml", cat: "oral-dental-care", rx: "OTC" },

  // ── Eye & ear care ────────────────────────────────────────────────────────
  { name: "Zovirax Aciclovir Eye Ointment", brand: "Zovirax", generic: "aciclovir", form: "ointment", cat: "eye-ear-care", rx: "POM" },
  { name: "Xalatan Eye Drops", brand: "Xalatan", generic: "latanoprost", form: "eye-drop", strength: "0.005%", cat: "eye-ear-care", rx: "POM", cold: true },

  // ── Vitamins & supplements ────────────────────────────────────────────────
  { name: "Puritan's Pride Vitamin C Tablets", brand: "Puritan's Pride", form: "tablet", strength: "1000mg", pack: "100 tablets", cat: "vitamins-supplements", rx: "OTC", featured: true },
  { name: "Puritan's Pride Magnesium Tablets", brand: "Puritan's Pride", form: "tablet", strength: "250mg", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Magnesium 200 Tablets", form: "tablet", strength: "200mg", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride NAC (N-Acetyl Cysteine)", brand: "Puritan's Pride", form: "capsule", strength: "600mg", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride Vitamin B12", brand: "Puritan's Pride", form: "capsule", strength: "1000mcg", pack: "30 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride B6 Tablets", brand: "Puritan's Pride", form: "tablet", strength: "100mg", pack: "100 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride Red Yeast Rice", brand: "Puritan's Pride", form: "capsule", strength: "600mg", pack: "60 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride BioCell Collagen II", brand: "Puritan's Pride", form: "capsule", strength: "500mg", pack: "60 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride Absorbable Calcium", brand: "Puritan's Pride", form: "capsule", strength: "600mg", pack: "60 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride Potassium Citrate", brand: "Puritan's Pride", form: "tablet", strength: "99mg", pack: "100 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride Probiotic Acidophilus", brand: "Puritan's Pride", form: "capsule", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride Sleep Complex Gummies", brand: "Puritan's Pride", form: "other", pack: "60 gummies", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Puritan's Pride Lutein (LutiGold)", brand: "Puritan's Pride", form: "capsule", strength: "20mg", pack: "30 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Mason Vitamin B12 Tablets", brand: "Mason", form: "tablet", strength: "50mcg", pack: "100 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Mason Vitamin B1 Tablets", brand: "Mason", form: "tablet", strength: "100mg", pack: "100 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Mason Vitamin E Softgels", brand: "Mason", form: "capsule", strength: "1000IU", pack: "50 softgels", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Mason Omega 3-6-9 Softgels", brand: "Mason", form: "capsule", pack: "60 softgels", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Mason Garlic Oil Softgels", brand: "Mason", form: "capsule", strength: "500mg", pack: "100 softgels", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Garlic 1000mg Tablets", form: "tablet", strength: "1000mg", pack: "100 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Odorless Garlic Extract", form: "capsule", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Mason Korean Ginseng", brand: "Mason", form: "capsule", strength: "1000mg", pack: "60 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Korean Ginseng Capsules", form: "capsule", strength: "518mg", pack: "100 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Mason Soya Lecithin Softgels", brand: "Mason", form: "capsule", strength: "1200mg", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Mason Cinnamon Capsules", brand: "Mason", form: "capsule", strength: "1000mg", pack: "100 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Cinnamon 1500mg Capsules", form: "capsule", strength: "1500mg", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Bioron B12 Capsules", brand: "Bioron", form: "capsule", pack: "30 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Centrum Silver Women 50+ Tablets", brand: "Centrum", form: "tablet", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Centrum Minis Men 50+ (UK)", brand: "Centrum", form: "tablet", pack: "160 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Centrum Rest & Rejuvenate (GSK)", brand: "Centrum", form: "tablet", pack: "50 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Nature's Way Alive! Men's 50+", brand: "Nature's Way", form: "tablet", pack: "50 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Nature's Way Alive! Women's Energy", brand: "Nature's Way", form: "tablet", pack: "50 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Nature's Bounty Hair Skin & Nails", brand: "Nature's Bounty", form: "tablet", pack: "150 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Nature's Bounty Hair Skin & Nails Gummies", brand: "Nature's Bounty", form: "other", pack: "80 gummies", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Seven Seas Cod Liver Oil Plus Omega-3", brand: "Seven Seas", form: "drink", pack: "150ml", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Haliborange Multivitamin (UK)", brand: "Haliborange", form: "tablet", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Ester-C Plus Vitamin D3", brand: "Ester-C", form: "tablet", strength: "1000mg", pack: "60 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Once Daily Multivitamin Tablets", form: "tablet", cat: "vitamins-supplements", rx: "OTC" },
  { name: "GainWoman 50+ Tablets", brand: "GainWoman", form: "tablet", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Allglobin Capsules", brand: "Allglobin", form: "capsule", pack: "30 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Vitaglobin Tonic", brand: "Vitaglobin", form: "drink", pack: "200ml", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Vitamix Eye Care Capsules", brand: "Vitamix", form: "capsule", pack: "30 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Lutein with Zeaxanthin Capsules", form: "capsule", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Chelated Calcium Magnesium Zinc", form: "tablet", cat: "vitamins-supplements", rx: "OTC" },
  { name: "CalciGain Tablets", brand: "CalciGain", form: "tablet", pack: "30 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "NeoCell Marine Collagen", brand: "NeoCell", form: "tablet", pack: "120 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Ginkgo Biloba Capsules", form: "capsule", strength: "120mg", pack: "100 capsules", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Vitamin K Tablets", form: "tablet", strength: "100mcg", pack: "100 tablets", cat: "vitamins-supplements", rx: "OTC" },
  { name: "Cranberry Gummies", form: "other", strength: "500mg", pack: "150 gummies", cat: "vitamins-supplements", rx: "OTC" },

  // ── Sexual wellness ───────────────────────────────────────────────────────
  { name: "Trojan Ultra Ribbed Condoms", brand: "Trojan", form: "device", cat: "sexual-wellness", rx: "GENERAL_RETAIL" },
  { name: "LifeStyles Sensation Condoms", brand: "LifeStyles", form: "device", cat: "sexual-wellness", rx: "GENERAL_RETAIL" },
  { name: "Microgynon FE Tablets", brand: "Microgynon", form: "tablet", pack: "28 tablets", cat: "sexual-wellness", rx: "POM_OTC_WAIVER", featured: true },
  { name: "Maca 500mg Capsules", form: "capsule", strength: "500mg", pack: "60 capsules", cat: "sexual-wellness", rx: "OTC" },
  { name: "Puritan's Pride Horny Goat Weed", brand: "Puritan's Pride", form: "capsule", strength: "1000mg", pack: "90 capsules", cat: "sexual-wellness", rx: "OTC" },
  { name: "FertilGain Tablets", brand: "FertilGain", form: "tablet", pack: "30 tablets", cat: "sexual-wellness", rx: "OTC" },
  { name: "Proxeed Men Plus Sachets", brand: "Proxeed", form: "sachet", cat: "sexual-wellness", rx: "OTC" },
  { name: "Titan Gel", brand: "Titan", form: "gel", cat: "sexual-wellness", rx: "GENERAL_RETAIL" },

  // ── Devices & diagnostics ─────────────────────────────────────────────────
  { name: "Omron M2 Basic Blood Pressure Monitor", brand: "Omron", form: "device", cat: "devices-diagnostics", rx: "DEVICE", featured: true },
  { name: "Omron M7 Intelli Blood Pressure Monitor", brand: "Omron", form: "device", cat: "devices-diagnostics", rx: "DEVICE" },
  { name: "Omron M1 Basic Blood Pressure Monitor", brand: "Omron", form: "device", cat: "devices-diagnostics", rx: "DEVICE" },
  { name: "OneTouch UltraSoft Lancets", brand: "OneTouch", form: "device", pack: "200 lancets", cat: "devices-diagnostics", rx: "DEVICE" },
  { name: "Accu-Chek Softclix Lancets", brand: "Accu-Chek", form: "device", pack: "200 lancets", cat: "devices-diagnostics", rx: "DEVICE" },
  { name: "Accu-Chek Active Test Strips", brand: "Accu-Chek", form: "test-kit", pack: "50 strips", cat: "devices-diagnostics", rx: "DEVICE" },
  { name: "Rossmax Glucose Test Strips", brand: "Rossmax", form: "test-kit", pack: "50 strips", cat: "devices-diagnostics", rx: "DEVICE" },
  { name: "OraQuick HIV Self Test (Oral)", brand: "OraQuick", form: "test-kit", cat: "devices-diagnostics", rx: "DEVICE" },
  { name: "ODC Contoured Lumbar Support Belt (XL)", brand: "ODC", form: "device", cat: "devices-diagnostics", rx: "DEVICE" },
  { name: "Arm Pouch Support", form: "device", cat: "devices-diagnostics", rx: "DEVICE" },
  { name: "Vicryl 3-0 Suture", brand: "Vicryl", form: "other", cat: "devices-diagnostics", rx: "DEVICE", prof: true },

  // ── Personal care & essentials ────────────────────────────────────────────
  { name: "Always Ultra Pink Sanitary Pads", brand: "Always", form: "other", cat: "personal-care", rx: "GENERAL_RETAIL" },
  { name: "Tetley Super Fruit & Vitamin C Tea", brand: "Tetley", form: "food", cat: "personal-care", rx: "GENERAL_RETAIL" },
  { name: "Twinings Pure Peppermint Tea", brand: "Twinings", form: "food", cat: "personal-care", rx: "GENERAL_RETAIL" },
  { name: "Lifegate Green Tea", brand: "Lifegate", form: "food", cat: "personal-care", rx: "GENERAL_RETAIL" },
  { name: "Qualitea Green Tea", brand: "Qualitea", form: "food", pack: "25 sachets", cat: "personal-care", rx: "GENERAL_RETAIL" },
  { name: "Mason Green Tea Slim", brand: "Mason", form: "capsule", pack: "60 capsules", cat: "personal-care", rx: "OTC" },
  { name: "Eco Slim Fast Tea", brand: "Eco", form: "food", cat: "personal-care", rx: "GENERAL_RETAIL" },
  { name: "Whey Isolate Protein Powder", form: "food", cat: "personal-care", rx: "GENERAL_RETAIL" },
];

/* ── derivation helpers ─────────────────────────────────────────────────── */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const FORM_LABEL: Record<DoseForm, string> = {
  tablet: "tablets", caplet: "caplets", capsule: "capsules", syrup: "syrup",
  suspension: "suspension", sachet: "sachets", cream: "cream", ointment: "ointment",
  gel: "gel", wash: "wash", inhaler: "inhaler", "nasal-spray": "nasal spray",
  "eye-drop": "eye drops", mouthwash: "mouthwash", suppository: "suppositories",
  injection: "injection", device: "device", "test-kit": "test kit",
  drink: "liquid", food: "product", other: "product",
};

const RX_COPY: Record<RxClass, string> = {
  OTC: "Available to order by enquiry.",
  POM: "Prescription-only medicine — a valid prescription is required and our pharmacist verifies every request before supply.",
  POM_OTC_WAIVER: "Family planning product supplied under pharmacist guidance.",
  DEVICE: "Medical device or diagnostic product.",
  GENERAL_RETAIL: "General retail product.",
};

function buildDescription(r: SeedRow): string {
  const parts: string[] = [];
  parts.push(
    `${r.brand ? r.brand + " " : ""}${r.name.replace(r.brand ? r.brand : "", "").trim() || r.name} — ${FORM_LABEL[r.form]}${r.strength ? ` (${r.strength})` : ""}${r.pack ? `, ${r.pack}` : ""}.`.replace(" — — ", " — ")
  );
  parts.push(RX_COPY[r.rx]);
  if (r.cold) parts.push("Cold-chain item — handled with temperature control for pickup or chilled delivery.");
  if (r.prof) parts.push("For use by healthcare professionals; a medical note may be required.");
  parts.push("Current price and availability are confirmed by our team when you submit an enquiry.");
  return parts.join(" ");
}

/** Deterministic pseudo-id so demo data is stable across restarts. */
function stableId(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "prod-" + (h >>> 0).toString(36);
}

const usedSlugs = new Map<string, number>();
function uniqueSlug(name: string, extras: string): string {
  const base = slugify(`${name} ${extras}`.trim()) || slugify(name);
  const n = usedSlugs.get(base) ?? 0;
  usedSlugs.set(base, n + 1);
  return n === 0 ? base : `${base}-${n + 1}`;
}

export const SEED_BRANDS: Brand[] = (() => {
  const names = Array.from(new Set(rows.map((r) => r.brand).filter(Boolean))) as string[];
  return names
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ id: `brand-${slugify(name)}`, slug: slugify(name), name }));
})();

const brandIdByName = new Map(SEED_BRANDS.map((b) => [b.name, b.id]));

export const SEED_PRODUCTS: Product[] = rows.map((r) => {
  const extras = [r.strength ?? "", r.pack ?? ""].join(" ");
  const slug = uniqueSlug(r.name, extras);
  const genericPart = r.generic ? ` (${r.generic})` : "";
  return {
    id: stableId(slug),
    slug,
    name: r.name,
    searchName: `${r.name}${genericPart} ${r.brand ?? ""} ${r.generic ?? ""} ${r.strength ?? ""} ${r.pack ?? ""}`.toLowerCase(),
    brandId: r.brand ? brandIdByName.get(r.brand) ?? null : null,
    genericName: r.generic ?? null,
    doseForm: r.form,
    strength: r.strength ?? null,
    packSize: r.pack ?? null,
    primaryCategoryId: `cat-${r.cat}`,
    rxClass: r.rx,
    priceStatus: "ENQUIRY_ONLY",
    stockStatus: "UNKNOWN",
    coldChain: r.cold ?? false,
    description: buildDescription(r),
    professionalUseOnly: r.prof ?? false,
    featured: r.featured ?? false,
    status: "active",
    imageUrl: null,
    imageAlt: `${r.name}${r.strength ? ` ${r.strength}` : ""}${r.pack ? ` — ${r.pack}` : ""}`,
    updatedAt: "2026-10-21T00:00:00.000Z",
  };
});
