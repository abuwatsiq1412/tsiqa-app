"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function BarProgresNavigasi() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Selesaikan loading saat rute atau query berubah
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intersep klik pada seluruh link internal <a> / <Link> untuk memicu progress bar seketika (0ms)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Abaikan hash, target="_blank", mailto/tel, dan link eksternal
      if (
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      // Pastikan link masih dalam domain yang sama
      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (targetUrl.origin !== currentUrl.origin) return;

        // Abaikan jika alamat sama persis dengan yang sedang dibuka
        if (targetUrl.pathname === currentUrl.pathname && targetUrl.search === currentUrl.search) {
          return;
        }

        // Mulai animasi loading instan (0ms)
        setLoading(true);
        setProgress(28);

        // Interval untuk memajukan progres secara dinamis sambil menunggu server
        const interval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 88) {
              clearInterval(interval);
              return prev;
            }
            return prev + (prev < 60 ? 15 : 6);
          });
        }, 120);

        // Batas waktu penyelamat bila navigasi batal / error
        setTimeout(() => {
          clearInterval(interval);
        }, 10000);
      } catch {
        // abaikan URL parsing error
      }
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-emerald via-emerald-hover to-teal-400 shadow-[0_0_8px_rgba(15,118,110,0.6)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
