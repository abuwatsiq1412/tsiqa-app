"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type TemaPilihan = "otomatis" | "terang" | "gelap";

export function adalahHalamanPublikTerang(path: string): boolean {
  return (
    path === "/" ||
    path === "/mulai" ||
    path === "/privasi" ||
    path === "/masuk" ||
    path === "/daftar" ||
    path === "/lupa-sandi" ||
    path === "/atur-sandi" ||
    path.startsWith("/p/") ||
    path.startsWith("/dokumen/") ||
    path.startsWith("/wali/masuk") ||
    path.startsWith("/wali/aktivasi") ||
    path.startsWith("/guru/masuk")
  );
}

/** Menjaga agar Landing Page TSIQA & Website Publik Pondok selalu Terang, sementara Dashboard mengikuti preferensi tema. */
export function PenjagaTemaRoute() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (adalahHalamanPublikTerang(pathname)) {
      document.documentElement.dataset.theme = "light";
      return;
    }
    const tersimpan = (localStorage.getItem("tema") as TemaPilihan) || "otomatis";
    terapkanTema(tersimpan);
  }, [pathname]);

  return null;
}

export function SakelarTema({ ringkas = false }: { ringkas?: boolean }) {
  const [tema, setTema] = useState<TemaPilihan>("otomatis");
  const [terpasang, setTerpasang] = useState(false);

  useEffect(() => {
    const tersimpan = (localStorage.getItem("tema") as TemaPilihan) || "otomatis";
    setTema(tersimpan);
    if (!adalahHalamanPublikTerang(window.location.pathname)) {
      terapkanTema(tersimpan);
    }
    setTerpasang(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (adalahHalamanPublikTerang(window.location.pathname)) return;
      const cur = localStorage.getItem("tema") || "otomatis";
      if (cur === "otomatis") terapkanTema("otomatis");
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const gantiTema = (baru: TemaPilihan) => {
    setTema(baru);
    localStorage.setItem("tema", baru);
    if (!adalahHalamanPublikTerang(window.location.pathname)) {
      terapkanTema(baru);
    }
  };

  const siklus = () => {
    if (tema === "terang") gantiTema("gelap");
    else if (tema === "gelap") gantiTema("otomatis");
    else gantiTema("terang");
  };

  if (!terpasang) {
    return (
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface-soft text-muted opacity-60"
        title="Ubah tema"
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const ikon =
    tema === "terang" ? (
      // Matahari
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gold">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    ) : tema === "gelap" ? (
      // Bulan
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ) : (
      // Komputer / Otomatis
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    );

  const label =
    tema === "terang" ? "Mode Terang" : tema === "gelap" ? "Mode Malam" : "Tema Otomatis";

  return (
    <button
      type="button"
      onClick={siklus}
      title={`${label} (Klik untuk beralih)`}
      aria-label={label}
      className={`group flex cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-surface-soft/60 px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-emerald/40 hover:bg-surface-soft active:scale-95`}
    >
      {ikon}
      {!ringkas && (
        <span className="hidden text-[11px] font-semibold text-muted group-hover:text-ink sm:inline">
          {tema === "terang" ? "Terang" : tema === "gelap" ? "Malam" : "Otomatis"}
        </span>
      )}
    </button>
  );
}

function terapkanTema(pilihan: TemaPilihan) {
  const gelap =
    pilihan === "gelap" ||
    (pilihan === "otomatis" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = gelap ? "dark" : "light";
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", gelap ? "#0e1613" : "#f8faf9");
    }
  }
}

