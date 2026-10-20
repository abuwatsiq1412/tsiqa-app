"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Muncul halus saat masuk layar — SEKALI saja (tidak hilang lagi saat scroll naik).
 * Konten tetap terlihat tanpa JavaScript dan bagi pengguna "kurangi gerakan".
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [tersembunyi, setTersembunyi] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Yang sudah terlihat saat halaman dibuka tidak perlu dianimasikan.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setTersembunyi(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTersembunyi(false);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: tersembunyi ? "0ms" : `${delay}ms` }}
      className={`transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        tersembunyi ? "translate-y-5 opacity-0" : "translate-y-0 opacity-100"
      } ${className}`}
    >
      {children}
    </div>
  );
}
