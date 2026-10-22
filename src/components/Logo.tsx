import { BUSINESS } from "@/lib/brand";

/**
 * PROVISIONAL brand mark (Intelligence Report §11.1): deep-green pharmacy
 * cross + monogram, redrawn as vector because the client's original artwork
 * is hosted on the vendor platform. Replaceable via <Logo assetUrl=…> without
 * redesigning the interface.
 */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label={`${BUSINESS.name} logo`}
    >
      <rect x="1.5" y="1.5" width="45" height="45" rx="7" fill="#1e5b3f" />
      <rect x="1.5" y="1.5" width="45" height="45" rx="7" stroke="#143d2b" strokeWidth="3" />
      {/* cross */}
      <path d="M20.5 10.5h7v10h10v7h-10v10h-7v-10h-10v-7h10v-10Z" fill="#faf8f4" />
      {/* subtle M baseline */}
      <path d="M12 38.5h24" stroke="#96bda4" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={compact ? 34 : 40} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-bold tracking-tight text-brand-900 uppercase">
          Mediview
        </span>
        <span className="font-display text-[10px] font-semibold tracking-[0.22em] text-brand-700 uppercase">
          {compact ? "Pharmacy" : `Pharmacy · ${BUSINESS.tagline}`}
        </span>
      </span>
    </span>
  );
}
