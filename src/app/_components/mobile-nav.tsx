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
              <a
                href="/masuk"
                onClick={() => setOpen(false)}
                className="block py-3 text-base font-medium text-ink no-underline hover:text-emerald"
              >
                Masuk
              </a>
            </li>
            <li className="pt-1">
              <a
                href="/daftar"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center rounded-full bg-ink py-2.5 text-center text-sm font-semibold text-white no-underline transition hover:bg-emerald"
              >
                Daftar Pondok
              </a>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
