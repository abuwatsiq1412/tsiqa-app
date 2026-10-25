"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ikon, type NamaIkon } from "@/components-ui";

export interface ItemMenu {
  href: string;
  label: string;
  ikon: NamaIkon;
  cocok?: (path: string) => boolean;
}

export interface GrupMenu {
  judul: string;
  item: ItemMenu[];
}

export function NavigasiSamping({ grup }: { grup: GrupMenu[] }) {
  const path = usePathname();

  return (
    <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
      {grup.map((g) => (
        <div key={g.judul}>
          <div className="mb-1.5 px-3 text-xs font-medium text-muted">
            {g.judul}
          </div>
          <div className="space-y-0.5">
            {g.item.map((m) => {
              const aktif =
                path === m.href ||
                (m.href !== "/konsol" && m.href !== "/keuangan" && path.startsWith(m.href + "/")) ||
                (m.href === "/keuangan" && path === "/keuangan");
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                    aktif
                      ? "bg-emerald-pale font-semibold text-emerald"
                      : "font-medium text-muted hover:bg-surface-soft hover:text-ink"
                  }`}
                >
                  {aktif && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-emerald" />
                  )}
                  <Ikon
                    nama={m.ikon}
                    className={`h-4 w-4 shrink-0 transition ${
                      aktif ? "text-emerald" : "text-muted/80 group-hover:text-ink"
                    }`}
                  />
                  <span className="truncate">{m.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
