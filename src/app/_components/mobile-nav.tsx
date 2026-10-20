"use client";

import { useEffect, useState } from "react";
import { Icon } from "./icons";

export function MobileNav({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Tutup menu" : "Buka menu"}
        className="grid size-10 place-items-center rounded-full text-ink transition hover:bg-surface-soft"
      >
        <Icon name={open ? "x" : "menu"} className="size-5" />
      </button>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Menu utama"
          className="absolute inset-x-0 top-full border-b border-line bg-white px-5 pb-5 pt-2 shadow-lg"
        >
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-line/70 py-3.5 text-base font-medium text-ink no-underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="border-t border-line/70 pt-2">
              <span className="flex items-center justify-between py-2.5 text-sm font-medium text-muted/70">
                <span>Masuk ke Akun</span>
                <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[10px] text-muted">Segera Hadir</span>
              </span>
            </li>
            <li className="pt-1">
              <a
                href="https://wa.me/628197600441?text=Assalamu%E2%80%99alaikum%2C%20kami%20tertarik%20menjadi%20pondok%20pilot%20TSIQA.%20Mohon%20informasinya."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-center text-sm font-semibold text-white no-underline transition hover:bg-emerald"
              >
                <span>Daftar Pilot</span>
                <span className="rounded-full bg-emerald-pale/25 px-1.5 py-0.5 text-[10px] font-medium text-emerald-pale">Akses Awal</span>
              </a>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
