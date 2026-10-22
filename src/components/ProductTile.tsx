import {
  Pill,
  Milk,
  SprayCan,
  TubeLotion,
  Eye,
  Stethoscope,
  TestTubes,
  Syringe,
  Baby,
  Leaf,
  Soup,
  Thermometer,
  ShoppingBasket,
  HeartHandshake,
  Bandage,
  Smile,
  HeartPulse,
  Droplets,
  Microscope,
  Hand,
  Package,
} from "lucide-react";
import type { DoseForm } from "@/lib/types";

const FORM_ICON: Record<DoseForm, typeof Pill> = {
  tablet: Pill,
  caplet: Pill,
  capsule: Pill,
  syrup: Milk,
  suspension: Milk,
  sachet: Soup,
  cream: TubeLotion,
  ointment: TubeLotion,
  gel: TubeLotion,
  wash: SprayCan,
  inhaler: SprayCan,
  "nasal-spray": SprayCan,
  "eye-drop": Eye,
  mouthwash: Smile,
  suppository: Package,
  injection: Syringe,
  device: Stethoscope,
  "test-kit": TestTubes,
  drink: Soup,
  food: ShoppingBasket,
  other: Package,
};

export const CATEGORY_ICONS = {
  Bandage,
  Thermometer,
  Microscope,
  HeartPulse,
  Droplets,
  Soup,
  Pill,
  Baby,
  Hand,
  Smile,
  Eye,
  Leaf,
  HeartHandshake,
  Stethoscope,
  ShoppingBasket,
} as const;

/**
 * Designed product placeholder — the demo does not hotlink the legacy vendor
 * images or fake product photography (report §13 demo data policy). Renders a
 * calm editorial tile: dose-form line icon + initials, ready to be swapped for
 * real pack-shot photography after the client photo session.
 */
export function ProductTile({
  name,
  form,
  brand,
  className = "",
  size = "md",
}: {
  name: string;
  form: DoseForm;
  brand?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = FORM_ICON[form] ?? Package;
  const initials = (brand || name)
    .split(/\s+/)
    .filter((w) => /[A-Za-z0-9]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  const iconSize = size === "lg" ? 44 : size === "sm" ? 22 : 32;
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center overflow-hidden rounded-sm border border-line bg-gradient-to-b from-card to-surface ${className}`}
    >
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, #143d2b 0 1px, transparent 1px 9px)",
      }} />
      <div className="flex flex-col items-center gap-2 text-brand-700">
        <Icon size={iconSize} strokeWidth={1.4} />
        <span className="font-display text-[11px] font-bold tracking-[0.2em] text-ink-faint uppercase">
          {initials}
        </span>
      </div>
      <span className="absolute bottom-1.5 right-2 font-display text-[9px] tracking-wider text-ink-faint/70 uppercase">
        Photo pending
      </span>
    </div>
  );
}
