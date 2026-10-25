"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Kabar berhasil: muncul di pojok, hilang sendiri, dan parameter ?ok dibuang dari alamat agar tidak muncul lagi saat dimuat ulang. */
export function ToastOk({ children }: { children: ReactNode }) {
  const [tampil, setTampil] = useState(true);
  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      if (u.searchParams.has("ok")) { u.searchParams.delete("ok"); window.history.replaceState(window.history.state, "", u); }
    } catch {}
    const t = setTimeout(() => setTampil(false), 4500);
    return () => clearTimeout(t);
  }, []);
  if (!tampil) return null;
  return (
    <div role="status" className="animate-toast fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-2.5 rounded-xl bg-forest px-4 py-3 text-sm font-medium text-white shadow-[0_16px_36px_-12px_rgba(38,59,53,0.6)] print:hidden">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-gold-soft" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      <span>{children}</span>
      <button onClick={() => setTampil(false)} aria-label="Tutup" className="-mr-1 ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-white/70 hover:text-white"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></button>
    </div>
  );
}
