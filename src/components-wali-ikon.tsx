// Ikon garis untuk Portal Wali (aman dipakai di komponen server maupun klien).
export type NamaIkonW =
  | "beranda" | "tagihan" | "riwayat" | "akun" | "kwitansi" | "wa" | "lonceng" | "mata" | "mata-coret"
  | "bawah" | "kanan" | "kiri" | "centang" | "jam" | "awas" | "salin" | "tutup" | "unduh" | "pasang" | "keluar" | "unggah";

const P: Record<NamaIkonW, React.ReactNode> = {
  beranda: <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
  tagihan: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
  riwayat: <path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4M12 8v4l3 2" />,
  akun: <><circle cx="12" cy="8" r="4" /><path d="M4 20c1-4 4-6 8-6s7 2 8 6" /></>,
  kwitansi: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  wa: <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-8l-5 4v-4H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />,
  lonceng: <path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4" />,
  mata: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  "mata-coret": <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.2-1M9.9 9.9a3 3 0 0 0 4.2 4.2" />,
  bawah: <path d="M6 9l6 6 6-6" />,
  kanan: <path d="M9 6l6 6-6 6" />,
  kiri: <path d="M15 6l-6 6 6 6" />,
  centang: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  jam: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  awas: <><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17v.5" /></>,
  salin: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  tutup: <path d="M6 6l12 12M18 6L6 18" />,
  unduh: <path d="M12 4v11M7.5 11 12 15.5 16.5 11M5 20h14" />,
  pasang: <><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M12 8v6M9.5 11.5 12 14l2.5-2.5" /></>,
  keluar: <path d="M10 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M15 8l4 4-4 4M19 12H9" />,
  unggah: <path d="M12 16V5M7.5 9 12 4.5 16.5 9M5 20h14" />,
};

export function IkonW({ n, className = "h-5 w-5" }: { n: NamaIkonW; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {P[n]}
    </svg>
  );
}

/** Motif bintang delapan titik, hiasan halus untuk kartu hijau tua. */
export function Bintang({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" stroke="#f1dba0" strokeWidth="0.8" className={className} aria-hidden>
      <rect x="22" y="22" width="56" height="56" />
      <rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="28" />
      <rect x="36" y="36" width="28" height="28" />
      <rect x="36" y="36" width="28" height="28" transform="rotate(45 50 50)" />
    </svg>
  );
}
