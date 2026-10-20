import Link from "next/link";
import type { ReactNode } from "react";

/* ------------------------------ Tombol ------------------------------ */
type Variant = "primary" | "dark" | "outline" | "onDark" | "outlineOnDark";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-emerald text-white shadow-sm hover:-translate-y-0.5 hover:bg-emerald-hover hover:shadow-[0_14px_26px_-10px_rgba(15,118,110,0.65)] focus-visible:outline-emerald",
  dark: "bg-ink text-white hover:-translate-y-0.5 hover:bg-forest hover:shadow-lg focus-visible:outline-ink",
  outline:
    "border border-line bg-white text-ink hover:-translate-y-0.5 hover:border-emerald/50 hover:bg-emerald-pale/40 hover:shadow-md focus-visible:outline-emerald",
  onDark:
    "bg-white text-forest hover:-translate-y-0.5 hover:bg-emerald-pale hover:shadow-lg focus-visible:outline-white",
  outlineOnDark:
    "border border-white/30 text-white hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-white",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const cls = `group inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold no-underline transition-all duration-200 active:scale-[0.98] sm:h-12 ${VARIANT[variant]} ${className}`;
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/* ------------------------------ Badge ------------------------------- */
type Tone = "lunas" | "cicilan" | "belum" | "netral" | "gold";

const TONE: Record<Tone, string> = {
  lunas: "bg-lunas-bg text-lunas",
  cicilan: "bg-cicilan-bg text-cicilan",
  belum: "bg-belum-bg text-belum",
  netral: "bg-surface-soft text-muted",
  gold: "bg-gold-pale text-gold-ink",
};

export function Badge({
  tone = "netral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[tone]}`}
    >
      {children}
    </span>
  );
}

/* ----------------------- Bingkai jendela aplikasi ------------------- */
export function WindowFrame({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_80px_-35px_rgba(24,38,34,0.4)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-soft px-4 py-2.5">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
        </div>
        <p className="min-w-0 flex-1 truncate text-xs font-medium text-muted">
          {title}
        </p>
        <span className="shrink-0 rounded-full bg-gold-pale px-2.5 py-0.5 text-[11px] font-semibold text-gold-ink">
          Tampilan ilustrasi
        </span>
      </div>
      {children}
    </div>
  );
}

/* --------------------------- Tipografi kecil ------------------------ */
export function Eyebrow({
  children,
  onDark = false,
}: {
  children: ReactNode;
  onDark?: boolean;
}) {
  return (
    <p
      className={`text-[13px] font-semibold uppercase tracking-[0.14em] ${
        onDark ? "text-emerald-pale" : "text-emerald"
      }`}
    >
      {children}
    </p>
  );
}
