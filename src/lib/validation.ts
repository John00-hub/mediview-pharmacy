import { z } from "zod";

/** Nigerian phone: accepts 0703…, +234703…, 234703… — normalized to digits. */
const phoneSchema = z
  .string()
  .trim()
  .min(10, "Enter a valid contact number")
  .max(20, "Enter a valid contact number")
  .refine((v) => /^\+?[0-9\s\-()]{10,20}$/.test(v), "Enter a valid contact number");

export const enquiryFormSchema = z
  .object({
    customerName: z.string().trim().min(2, "Enter your full name").max(120),
    customerPhone: phoneSchema,
    customerEmail: z.union([z.literal(""), z.email("Enter a valid email address")]).optional(),
    contactPreference: z.enum(["WHATSAPP", "PHONE_CALL", "EMAIL"]),
    fulfilment: z.enum(["PICKUP", "DELIVERY"]),
    deliveryAddress: z.string().trim().max(500).optional(),
    additionalInfo: z.string().trim().max(1000).optional(),
    privacyAcknowledged: z.literal(true, {
      error: "You must acknowledge the privacy notice to submit an enquiry",
    }),
    items: z
      .array(
        z.object({
          productId: z.string().min(1),
          quantity: z.number().int().min(1).max(99),
          note: z.string().trim().max(300).optional(),
          hasPrescription: z.boolean().optional(),
          prescriptionFileName: z.string().max(200).optional(),
        })
      )
      .min(1, "Your enquiry basket is empty"),
  })
  .superRefine((data, ctx) => {
    if (data.fulfilment === "DELIVERY" && !data.deliveryAddress?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message: "Enter a delivery address or choose pickup",
      });
    }
    if (data.contactPreference === "EMAIL" && !data.customerEmail?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["customerEmail"],
        message: "An email address is required when email contact is preferred",
      });
    }
  });

export type EnquiryFormInput = z.input<typeof enquiryFormSchema>;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(6, "Enter your password"),
});

export const trackSchema = z.object({
  refCode: z
    .string()
    .trim()
    .regex(/^MVP-\d{4}-\d{4}$/i, "Reference numbers look like MVP-2026-0147"),
  phone: phoneSchema,
});

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  phone: phoneSchema.optional().or(z.literal("")),
  email: z.union([z.literal(""), z.email("Enter a valid email address")]).optional(),
  message: z.string().trim().min(10, "Please write at least a sentence").max(2000),
});

export const prescriptionFileRules = {
  acceptedMime: ["image/jpeg", "image/png", "application/pdf"] as const,
  maxBytes: 8 * 1024 * 1024,
  label: "JPEG, PNG or PDF up to 8 MB",
};
