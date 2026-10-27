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
    path.startsWith("/guru/masuk") ||
    path.startsWith("/guru/aktivasi")
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


  if (!terpasang) {
    return (
      <div
        className="inline-flex h-8 items-center rounded-lg border border-line/80 bg-surface-soft/60 p-0.5 text-muted opacity-50"
        aria-hidden="true"
      >
        <span className="h-7 w-7 rounded-md" />
        <span className="h-7 w-7 rounded-md" />
        <span className="h-7 w-7 rounded-md" />
      </div>
    );
  }

  const opsi: { nilai: TemaPilihan; label: string; judul: string; ikon: React.ReactNode }[] = [
    {
      nilai: "terang",
      label: "Terang",
      judul: "Mode Terang (Siang)",
      ikon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ),
    },
    {
      nilai: "gelap",
      label: "Malam",
      judul: "Mode Gelap (Malam)",
      ikon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ),
    },
    {
      nilai: "otomatis",
      label: "Sistem",
      judul: "Mengikuti Pengaturan Sistem",
      ikon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      ),
    },
  ];

  return (
    <div
      role="group"
      aria-label="Pilihan tema tampilan"
      className="inline-flex h-8 items-center rounded-lg border border-line/80 bg-surface-soft/60 p-0.5 text-muted transition-colors"
    >
      {opsi.map((item) => {
        const aktif = tema === item.nilai;
        return (
          <button
            key={item.nilai}
            type="button"
            onClick={() => gantiTema(item.nilai)}
            title={item.judul}
            aria-label={item.judul}
            aria-pressed={aktif}
            className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition duration-150 ${
              aktif
                ? "bg-surface text-ink font-semibold shadow-xs"
                : "text-muted hover:text-ink hover:bg-surface/50 font-normal"
            }`}
          >
            {item.ikon}
          </button>
        );
      })}
    </div>
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