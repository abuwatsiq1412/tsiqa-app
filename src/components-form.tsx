"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { tombol } from "@/components-ui";

/** Tombol kirim form: berubah jadi "Memproses…" dan terkunci selama permintaan berjalan (mencegah klik ganda). */
export function TombolKirim({ children, className = "", disabled = false }: { children: ReactNode; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending || disabled} aria-busy={pending} className={`${tombol} ${className}`}>
      {pending ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4 animate-spin" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9" /></svg>
          Memproses…
        </>
      ) : children}
    </button>
  );
}
