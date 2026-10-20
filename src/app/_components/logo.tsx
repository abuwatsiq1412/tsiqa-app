/**
 * LOGO SEMENTARA (placeholder).
 * Saat logo final siap, cukup ganti isi <LogoMark /> di bawah ini
 * (atau ganti dengan <Image src="/logo.svg" ... />). Semua tempat lain otomatis ikut.
 */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0f766e" />
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      >
        <rect x="9.5" y="9.5" width="13" height="13" />
        <rect
          x="9.5"
          y="9.5"
          width="13"
          height="13"
          transform="rotate(45 16 16)"
        />
      </g>
    </svg>
  );
}

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span
        className={`text-[19px] font-bold tracking-[-0.03em] ${
          inverse ? "text-white" : "text-ink"
        }`}
      >
        TSIQA
      </span>
    </span>
  );
}
