import type { HTMLAttributes, ReactNode } from "react";
import { ToastOk } from "@/components-toast";
import { cn } from "@/lib/utils";

// ==================== shadcn/ui Card Architecture ====================
export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "rounded-xl border border-line bg-surface text-ink shadow-(--shadow-kartu) transition-colors",
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-4 sm:p-5", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("font-semibold leading-none tracking-tight text-ink", className)} {...props} />
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-xs leading-relaxed text-muted sm:text-sm", className)} {...props} />
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 pt-0 sm:p-5 sm:pt-0", className)} {...props} />
);

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center p-4 pt-0 sm:p-5 sm:pt-0", className)} {...props} />
);

export type VarianKartu = "putih" | "forest" | "mint" | "soft";

const GAYA_KARTU: Record<VarianKartu, string> = {
  putih: "border border-line bg-surface text-ink shadow-(--shadow-kartu)",
  forest: "border border-forest-light bg-forest text-white shadow-[0_4px_16px_-4px_rgba(38,59,53,0.3)]",
  mint: "border border-emerald/20 bg-emerald-pale/60 text-ink",
  soft: "border border-line bg-surface-soft text-ink",
};

export const Kartu = ({
  children,
  className = "",
  varian = "putih",
}: {
  children: ReactNode;
  className?: string;
  varian?: VarianKartu;
}) => (
  <div className={cn("rounded-xl p-4 sm:p-5 transition-colors", GAYA_KARTU[varian], className)}>
    {children}
  </div>
);

export const input =
  "w-full min-h-9 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-muted/60 outline-none transition focus:border-emerald focus:ring-1 focus:ring-emerald/30 disabled:bg-surface-soft disabled:text-muted";

export const tombol =
  "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald px-3.5 py-1.5 text-sm font-medium text-on-brand shadow-xs transition hover:bg-emerald-hover active:scale-[0.99] disabled:opacity-50 cursor-pointer";

export const tombolSekunder =
  "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-soft hover:border-muted/30 active:scale-[0.99] disabled:opacity-50 cursor-pointer";

export const Label = ({ children }: { children: ReactNode }) => (
  <span className="mb-1.5 block text-xs font-medium text-muted">{children}</span>
);

export function HeaderHalaman({
  kategori,
  judul,
  deskripsi,
  aksi,
}: {
  kategori?: string;
  judul: ReactNode;
  deskripsi?: ReactNode;
  aksi?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kategori && (
          <div className="mb-1 text-xs font-medium text-muted">
            {kategori}
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{judul}</h1>
        {deskripsi && <p className="mt-1 max-w-2xl text-xs sm:text-sm text-muted leading-relaxed">{deskripsi}</p>}
      </div>
      {aksi && <div className="flex flex-wrap items-center gap-2">{aksi}</div>}
    </div>
  );
}

export function Lencana({
  children,
  varian = "netral",
  titik = true,
}: {
  children: ReactNode;
  varian?: "lunas" | "cicilan" | "belum" | "mint" | "netral" | "gold";
  titik?: boolean;
}) {
  const peta = {
    lunas: "bg-lunas-bg text-lunas border-emerald/20",
    cicilan: "bg-cicilan-bg text-cicilan border-cicilan/15",
    belum: "bg-belum-bg text-belum border-belum/15",
    mint: "bg-emerald-pale text-emerald border-emerald/20",
    netral: "bg-surface-soft text-muted border-line",
    gold: "bg-gold-pale text-gold-ink border-gold-soft/50",
  };
  const warnaTitik = {
    lunas: "bg-emerald",
    cicilan: "bg-cicilan",
    belum: "bg-belum",
    mint: "bg-emerald",
    netral: "bg-muted",
    gold: "bg-gold",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${peta[varian]}`}
    >
      {titik && <span className={`h-1.5 w-1.5 rounded-full ${warnaTitik[varian]}`} />}
      {children}
    </span>
  );
}

export function AvatarInisial({
  nama,
  warna = "teal",
  ukuran = "md",
}: {
  nama: string;
  warna?: "teal" | "mint" | "forest" | "amber";
  ukuran?: "sm" | "md" | "lg";
}) {
  const inisial = (nama || "S")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "")
    .join("");
  const peta = {
    teal: "bg-emerald-pale text-emerald border border-emerald/20",
    mint: "bg-surface-soft text-forest border border-line",
    forest: "bg-forest text-white",
    amber: "bg-cicilan-bg text-cicilan border border-cicilan/15",
  };
  const dimensi =
    ukuran === "sm" ? "h-7 w-7 text-[11px]" : ukuran === "lg" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  return (
    <span
      className={`inline-flex ${dimensi} shrink-0 items-center justify-center rounded-full font-semibold ${peta[warna]}`}
    >
      {inisial || "S"}
    </span>
  );
}

export function PesanNotifikasi({
  ok,
  galat,
  tipe,
  pesan,
}: {
  ok?: ReactNode;
  galat?: ReactNode;
  tipe?: "sukses" | "error" | "peringatan" | "info";
  pesan?: ReactNode;
}) {
  const isiOk = ok || (tipe === "sukses" ? pesan : undefined);
  const isiGalat = galat || (tipe === "error" ? pesan : undefined);
  const isiPeringatan = tipe === "peringatan" ? pesan : undefined;
  const isiInfo = tipe === "info" ? pesan : undefined;

  if (!isiOk && !isiGalat && !isiPeringatan && !isiInfo) return null;

  return (
    <div className="mb-5 space-y-2 print:hidden">
      {isiOk && <ToastOk>{isiOk}</ToastOk>}
      {isiGalat && (
        <div className="flex items-center gap-2.5 rounded-xl border border-belum/20 bg-belum-bg/80 px-4 py-3 text-sm font-medium text-belum">
          <Ikon nama="peringatan" className="h-4 w-4 shrink-0" />
          <span>{isiGalat}</span>
        </div>
      )}
      {isiPeringatan && (
        <div className="flex items-center gap-2.5 rounded-xl border border-cicilan/25 bg-cicilan-bg/80 px-4 py-3 text-sm font-medium text-cicilan">
          <Ikon nama="peringatan" className="h-4 w-4 shrink-0" />
          <span>{isiPeringatan}</span>
        </div>
      )}
      {isiInfo && (
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-soft px-4 py-3 text-sm font-medium text-ink">
          <Ikon nama="hari-ini" className="h-4 w-4 shrink-0 text-emerald" />
          <span>{isiInfo}</span>
        </div>
      )}
    </div>
  );
}

export function BarProgres({
  nilai,
  maks,
  warna = "emerald",
  varian,
}: {
  nilai: number;
  maks: number;
  warna?: "emerald" | "amber" | "red";
  varian?: "emerald" | "peringatan" | "bahaya";
}) {
  const persen = maks > 0 ? Math.min(100, Math.round((nilai / maks) * 100)) : 0;
  const warnaAktif = varian === "peringatan" ? "amber" : varian === "bahaya" ? "red" : warna;
  const bar =
    warnaAktif === "red" || nilai > maks
      ? "bg-belum"
      : warnaAktif === "amber" || persen >= 85
      ? "bg-cicilan"
      : "bg-emerald";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-soft">
      <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${persen}%` }} />
    </div>
  );
}

export type NamaIkon =
  | "hari-ini"
  | "santri"
  | "kamar"
  | "kelas"
  | "penempatan"
  | "keuangan"
  | "tagihan"
  | "kasir"
  | "laporan"
  | "keringanan"
  | "modul"
  | "pengguna"
  | "pengaturan"
  | "konsol"
  | "cari"
  | "tambah"
  | "unduh"
  | "unggah"
  | "wa"
  | "cetak"
  | "cek"
  | "peringatan"
  | "panah"
  | "panah-kiri"
  | "keluar"
  | "gedung"
  | "koin"
  | "kalender"
  | "kunci"
  | "menu"
  | "sidebar";

export function Ikon({ nama, className = "h-4 w-4" }: { nama: NamaIkon; className?: string }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.85,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };
  switch (nama) {
    case "hari-ini":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "santri":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "kamar":
      return (
        <svg {...props}>
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 9h1m4 0h1m-6 4h1m4 0h1m-5 8v-5h4v5" />
        </svg>
      );
    case "kelas":
      return (
        <svg {...props}>
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      );
    case "penempatan":
      return (
        <svg {...props}>
          <path d="M16 3h5v5" />
          <path d="M8 3H3v5" />
          <path d="M21 3l-7 7" />
          <path d="M3 3l7 7" />
          <path d="M12 14v7" />
          <path d="M9 18l3 3 3-3" />
        </svg>
      );
    case "keuangan":
      return (
        <svg {...props}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <path d="M6 15h4" />
        </svg>
      );
    case "tagihan":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2 2-2V4a2 2 0 0 0-2-2z" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="14" y2="13" />
        </svg>
      );
    case "kasir":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M14.5 9.5a2.5 2.5 0 0 0-2.5-1.5h-1a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4h-1a2.5 2.5 0 0 1-2.5-1.5" />
          <line x1="12" y1="6.5" x2="12" y2="17.5" />
        </svg>
      );
    case "laporan":
      return (
        <svg {...props}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "keringanan":
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "modul":
      return (
        <svg {...props}>
          <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
          <path d="M12 11l8-4.5" />
          <path d="M12 11v9" />
          <path d="M12 11L4 6.5" />
        </svg>
      );
    case "pengguna":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case "pengaturan":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "konsol":
      return (
        <svg {...props}>
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      );
    case "cari":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "tambah":
      return (
        <svg {...props}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "unduh":
      return (
        <svg {...props}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      );
    case "unggah":
      return (
        <svg {...props}>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      );
    case "wa":
      return (
        <svg {...props}>
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      );
    case "cetak":
      return (
        <svg {...props}>
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      );
    case "cek":
      return (
        <svg {...props}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "peringatan":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "panah":
      return (
        <svg {...props}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      );
    case "panah-kiri":
      return (
        <svg {...props}>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      );
    case "keluar":
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      );
    case "gedung":
      return (
        <svg {...props}>
          <path d="M4 22h16" />
          <path d="M4 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
          <path d="M16 10h4a2 2 0 0 1 2 2v10" />
          <path d="M8 6h2" />
          <path d="M8 10h2" />
          <path d="M8 14h2" />
          <path d="M8 18h2" />
        </svg>
      );
    case "koin":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6v12M8 10h8M8 14h6" />
        </svg>
      );
    case "kalender":
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "kunci":
      return (
        <svg {...props}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      );
    case "sidebar":
      return (
        <svg {...props}>
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 3v18" />
        </svg>
      );
  }
}

// Subcomponents helper untuk kemudahan dan kejelasan kode
Ikon.Centang = ({ className }: { className?: string }) => <Ikon nama="cek" className={className} />;
Ikon.PanahKiri = ({ className }: { className?: string }) => <Ikon nama="panah-kiri" className={className} />;
Ikon.Koin = ({ className }: { className?: string }) => <Ikon nama="koin" className={className} />;
Ikon.Gedung = ({ className }: { className?: string }) => <Ikon nama="gedung" className={className} />;
Ikon.Kalender = ({ className }: { className?: string }) => <Ikon nama="kalender" className={className} />;
Ikon.Santri = ({ className }: { className?: string }) => <Ikon nama="santri" className={className} />;
Ikon.Kuitansi = ({ className }: { className?: string }) => <Ikon nama="tagihan" className={className} />;
Ikon.Modul = ({ className }: { className?: string }) => <Ikon nama="modul" className={className} />;
Ikon.Pengguna = ({ className }: { className?: string }) => <Ikon nama="pengguna" className={className} />;
Ikon.Kunci = ({ className }: { className?: string }) => <Ikon nama="kunci" className={className} />;



/** Keadaan kosong: satu kalimat jelas + satu ajakan bertindak. */
export function Kosong({ judul, isi, aksi }: { judul: string; isi?: string; aksi?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-pale text-emerald shadow-[0_0_28px_6px_rgba(15,118,110,0.18)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true"><path d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M8 10h8M8 14h5" /></svg>
      </span>
      <div className="text-sm font-bold text-ink">{judul}</div>
      {isi && <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">{isi}</p>}
      {aksi && <div className="mt-4">{aksi}</div>}
    </div>
  );
}
