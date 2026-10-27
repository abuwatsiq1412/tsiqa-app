"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AvatarInisial, Ikon, type NamaIkon } from "@/components-ui";
import { SakelarTema } from "@/components-tema";

export interface ItemMenu {
  href: string;
  label: string;
  ikon: NamaIkon;
  /** Sorot hanya bila alamat sama persis (bukan halaman di bawahnya). */
  persis?: boolean;
  /** Awalan alamat lain yang ikut menyorot menu ini. */
  juga?: string[];
}

export interface GrupMenu {
  judul: string;
  item: ItemMenu[];
  /** Grup modul: bisa dilipat. Terbuka otomatis bila berisi halaman yang sedang dibuka. */
  lipat?: boolean;
}

const LABEL_PERAN: Record<string, string> = {
  admin: "Admin Utama",
  bendahara: "Pengurus Modul",
  staf_tu: "Pengurus Modul",
  staf_tsiqa: "Tim TSIQA",
};

/** Dua tampilan, satu kerangka: aplikasi pondok (hijau) dan konsol TSIQA (gelap). */
type Mode = "pondok" | "konsol";

const TEMA: Record<Mode, {
  sidebar: string; garis: string; judulGrup: string; item: string; itemAktif: string; ikon: string;
  ikonAktif: string; penanda: string; logo: string; tombolIkon: string; nama: string; peran: string;
}> = {
  pondok: {
    sidebar: "bg-white border-line/80",
    garis: "border-line/70",
    judulGrup: "text-muted/90",
    item: "text-muted hover:bg-surface-soft hover:text-ink",
    itemAktif: "bg-emerald-pale font-medium text-emerald",
    ikon: "text-muted group-hover:text-ink",
    ikonAktif: "text-emerald",
    penanda: "bg-gold",
    logo: "bg-emerald text-white",
    tombolIkon: "text-muted hover:bg-surface-soft hover:text-ink",
    nama: "text-ink",
    peran: "text-muted",
  },
  konsol: {
    sidebar: "bg-forest border-forest-light",
    garis: "border-white/10",
    judulGrup: "text-white/50",
    item: "text-white/70 hover:bg-white/8 hover:text-white",
    itemAktif: "bg-white/12 font-medium text-white",
    ikon: "text-white/50 group-hover:text-white",
    ikonAktif: "text-white",
    penanda: "bg-gold-soft",
    logo: "bg-gold-soft text-forest",
    tombolIkon: "text-white/60 hover:bg-white/10 hover:text-white",
    nama: "text-white",
    peran: "text-white/55",
  },
};

interface KerangkaAppProps {
  mode?: Mode;
  anggota: { nama: string; peran: string };
  /** Hanya mode pondok. */
  pondok?: { nama: string; kode: string; kota?: string | null } | null;
  taAktif?: { nama: string; semester: string } | null;
  grup: GrupMenu[];
  adaKeuangan?: boolean;
  /** Kotak cari santri di bilah atas (mode pondok). */
  cari?: boolean;
  /** Tanggal Masehi dan Hijriah di bilah atas. */
  tanggal?: { masehi: string; masehiPendek: string; hijriah: string; hijriahPendek: string };
  /** Pita peringatan di atas konten (mis. langganan hampir habis). */
  peringatan?: { tingkat: "info" | "waspada" | "bahaya"; teks: string; tautan?: { href: string; label: string } } | null;
  /** Tautan kecil di dasar sidebar, mis. pindah ke aplikasi pondok. */
  tautanBawah?: { href: string; label: string };
  keluarAction: () => Promise<void>;
  children: ReactNode;
}

function aktifKah(path: string, m: ItemMenu) {
  if (path === m.href) return true;
  if (m.juga?.some((a) => path === a || path.startsWith(a + "/"))) return true;
  return !m.persis && path.startsWith(m.href + "/");
}


interface EntriPalet { label: string; href: string; grup: string; ikon: NamaIkon }

/** Pencarian cepat (Ctrl/Cmd + K): lompat ke menu mana pun, atau cari santri dengan mengetik nama. */
function PaletPerintah({ grup, tutup }: { grup: GrupMenu[]; tutup: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const semua: EntriPalet[] = [
    ...grup.flatMap((g) => g.item.map((m) => ({ label: m.label, href: m.href, grup: g.judul, ikon: m.ikon }))),
    { label: "Tambah santri", href: "/santri/baru", grup: "Aksi", ikon: "tambah" as NamaIkon },
  ];
  const kata = q.trim().toLowerCase();
  const hasil: EntriPalet[] = [
    ...semua.filter((e) => !kata || e.label.toLowerCase().includes(kata) || e.grup.toLowerCase().includes(kata)),
    ...(kata ? [{ label: `Cari santri “${q.trim()}”`, href: `/santri?q=${encodeURIComponent(q.trim())}`, grup: "Santri", ikon: "cari" as NamaIkon }] : []),
  ];
  const pergi = (e?: EntriPalet) => { if (e) { tutup(); router.push(e.href); } };

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[14vh]" role="dialog" aria-label="Pencarian cepat">
      <button aria-label="Tutup" onClick={tutup} className="absolute inset-0 cursor-default bg-ink/40" />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-(--shadow-angkat)">
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Ikon nama="cari" className="h-4 w-4 shrink-0 text-muted" />
          <input
            ref={ref} value={q} placeholder="Ketik menu atau nama santri…"
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, hasil.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); pergi(hasil[idx]); }
              else if (e.key === "Escape") tutup();
            }}
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted/60"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {hasil.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">Tidak ada yang cocok.</li>}
          {hasil.map((e, i) => (
            <li key={e.href + e.label}>
              <button onClick={() => pergi(e)} onMouseEnter={() => setIdx(i)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${i === idx ? "bg-emerald-pale text-emerald" : "text-ink"}`}>
                <Ikon nama={e.ikon} className="h-4 w-4 shrink-0 opacity-80" />
                <span className="flex-1 truncate font-medium">{e.label}</span>
                <span className="text-xs text-muted">{e.grup}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const IkonMenu = ({ tutup = false }: { tutup?: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    {tutup ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
  </svg>
);

export function KerangkaApp({
  mode = "pondok",
  anggota,
  pondok,
  taAktif,
  grup,
  adaKeuangan = false,
  cari = mode === "pondok",
  tanggal,
  peringatan,
  tautanBawah,
  keluarAction,
  children,
}: KerangkaAppProps) {
  const path = usePathname();
  const t = TEMA[mode];
  const [terlipat, setTerlipat] = useState(false); // desktop: hanya ikon
  const [laci, setLaci] = useState(false); // HP: sidebar sebagai laci
  const [buka, setBuka] = useState<Record<string, boolean>>({}); // grup modul yang dilipat/dibuka
  const [palet, setPalet] = useState(false);
  const grupAktif = grup.find((g) => g.item.some((m) => aktifKah(path, m)))?.judul;

  useEffect(() => {
    if (!cari) return;
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalet((v) => !v); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [cari]);

  useEffect(() => {
    try {
      if (localStorage.getItem("tsiqa_sidebar_terlipat") === "true") setTerlipat(true);
    } catch {}
  }, []);

  // Laci tertutup setiap pindah halaman.
  useEffect(() => { setLaci(false); setPalet(false); }, [path]);

  const ubahTerlipat = () =>
    setTerlipat((prev) => {
      try { localStorage.setItem("tsiqa_sidebar_terlipat", String(!prev)); } catch {}
      return !prev;
    });

  // Di laci HP, sidebar selalu tampil penuh.
  const ringkas = terlipat && !laci;

  return (
    <div className="flex min-h-screen bg-ivory text-ink">
      {laci && (
        <button
          aria-label="Tutup menu"
          onClick={() => setLaci(false)}
          className="fixed inset-0 z-30 bg-ink/40 lg:hidden print:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex shrink-0 flex-col border-r transition-all duration-200 ease-in-out print:hidden lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${t.sidebar} ${
          laci ? "translate-x-0 shadow-xl" : "-translate-x-full"
        } ${ringkas ? "w-60 lg:w-16" : "w-60"}`}
      >
        <div className={`flex items-center border-b p-3.5 ${t.garis} ${ringkas ? "justify-center" : "justify-between"}`}>
          <Link
            href={mode === "konsol" ? "/konsol" : "/hari-ini"}
            className="flex items-center gap-2.5 transition hover:opacity-90"
            title="TSIQA"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald/25 bg-[#f4f9f7] p-1 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-tsiqa.svg" alt="TSIQA" className="h-full w-full object-contain" />
            </span>
            {!ringkas && (
              <span className="flex items-center gap-1.5">
                <span className={`text-base font-bold tracking-tight ${t.nama}`}>TSIQA</span>
                {mode === "konsol" ? (
                  <span className="rounded bg-white/12 px-1.5 py-0.5 text-[10px] font-semibold text-gold-soft">Konsol</span>
                ) : (
                  <span className="rounded bg-emerald-pale px-1.5 py-0.5 text-[10px] font-semibold text-emerald">Cloud</span>
                )}
              </span>
            )}
          </Link>
          {!ringkas && (
            <>
              <button
                onClick={ubahTerlipat}
                title="Ciutkan menu"
                className={`hidden cursor-pointer rounded-lg p-1.5 transition lg:block ${t.tombolIkon}`}
              >
                <Ikon nama="sidebar" className="h-4 w-4" />
              </button>
              <button
                onClick={() => setLaci(false)}
                title="Tutup menu"
                className={`cursor-pointer rounded-lg p-1.5 transition lg:hidden ${t.tombolIkon}`}
              >
                <IkonMenu tutup />
              </button>
            </>
          )}
        </div>

        {!ringkas && mode === "pondok" && pondok && (
          <div className={`border-b px-4 py-2.5 ${t.garis}`}>
            <div className="truncate text-xs font-semibold text-ink">{pondok.nama}</div>
            <div className="mt-0.5 flex items-center justify-between text-[11px] text-muted">
              <span className="truncate">{pondok.kota || pondok.kode}</span>
              {taAktif && <span className="font-medium text-emerald">{taAktif.nama}</span>}
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
          {grup.map((g, gIdx) => {
            const terbuka = !g.lipat || ringkas || (buka[g.judul] ?? g.judul === grupAktif);
            return (
              <div key={g.judul}>
                {!ringkas ? (
                  g.lipat ? (
                    <button
                      onClick={() => setBuka((b) => ({ ...b, [g.judul]: !terbuka }))}
                      aria-expanded={terbuka}
                      className={`mb-1 flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1 text-xs font-semibold ${t.judulGrup} hover:text-ink`}
                    >
                      <span>{g.judul}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`h-3.5 w-3.5 transition-transform ${terbuka ? "" : "-rotate-90"}`} aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                  ) : (
                    <div className={`mb-1 px-2.5 text-xs font-semibold ${t.judulGrup}`}>{g.judul}</div>
                  )
                ) : (
                  gIdx > 0 && <div className={`mx-1 my-2 border-t ${t.garis}`} />
                )}
                {terbuka && (
                  <div className="space-y-0.5">
                    {g.item.map((m) => {
                      const aktif = aktifKah(path, m);
                      return (
                        <Link
                          key={m.href}
                          href={m.href}
                          title={ringkas ? m.label : undefined}
                          className={`group relative flex items-center rounded-lg text-sm transition duration-150 active:scale-[0.98] ${
                            ringkas ? "mx-auto h-10 w-10 justify-center" : "gap-2.5 px-3 py-2"
                          } ${aktif ? t.itemAktif : t.item}`}
                        >
                          {aktif && <span className={`absolute bottom-1.5 left-0 top-1.5 w-1 rounded-r-full ${t.penanda}`} />}
                          <Ikon nama={m.ikon} className={`h-4 w-4 shrink-0 transition ${aktif ? t.ikonAktif : t.ikon}`} />
                          {!ringkas && <span className="truncate">{m.label}</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {tautanBawah && !ringkas && (
          <div className={`border-t px-3 pt-3 ${t.garis}`}>
            <Link
              href={tautanBawah.href}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition duration-150 active:scale-[0.98] ${t.item}`}
            >
              <span>{tautanBawah.label}</span>
              <Ikon nama="panah" className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        <div className={`border-t p-2.5 ${t.garis}`}>
          {ringkas ? (
            <div className="flex flex-col items-center gap-2">
              <div title={`${anggota.nama} · ${LABEL_PERAN[anggota.peran] ?? anggota.peran}`}>
                <AvatarInisial nama={anggota.nama} warna={mode === "konsol" ? "amber" : "teal"} />
              </div>
              <form action={keluarAction}>
                <button type="submit" title="Keluar" className={`cursor-pointer rounded-lg p-2 transition ${t.tombolIkon}`}>
                  <Ikon nama="keluar" className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <AvatarInisial nama={anggota.nama} warna={mode === "konsol" ? "amber" : "teal"} />
              <div className="min-w-0 flex-1">
                <div className={`truncate text-xs font-semibold ${t.nama}`}>{anggota.nama}</div>
                <div className={`truncate text-[11px] ${t.peran}`}>{LABEL_PERAN[anggota.peran] ?? anggota.peran}</div>
              </div>
              <form action={keluarAction}>
                <button type="submit" title="Keluar" className={`cursor-pointer rounded-lg p-1.5 transition ${t.tombolIkon}`}>
                  <Ikon nama="keluar" className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-line/70 bg-white/90 px-4 backdrop-blur-md sm:px-8 print:hidden">
          <div className="flex max-w-sm flex-1 items-center gap-2">
            <button
              onClick={() => setLaci(true)}
              title="Buka menu"
              className="shrink-0 cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink lg:hidden"
            >
              <IkonMenu />
            </button>
            {terlipat && (
              <button
                onClick={ubahTerlipat}
                title="Lebarkan menu"
                className="hidden shrink-0 cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-surface-soft hover:text-ink lg:block"
              >
                <Ikon nama="sidebar" className="h-4 w-4" />
              </button>
            )}
            {cari ? (
              <button
                onClick={() => setPalet(true)}
                className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg border border-line bg-surface-soft/60 px-3 text-left text-xs text-muted transition hover:border-muted/30 hover:bg-surface"
              >
                <Ikon nama="cari" className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">Cari menu atau santri…</span>
                <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] font-semibold sm:inline">Ctrl K</kbd>
              </button>
            ) : (
              <span className="text-sm font-semibold text-ink">{mode === "konsol" ? "Konsol TSIQA" : ""}</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs">
            {tanggal && (
              <div className="text-right leading-tight" title={`${tanggal.masehi} · ${tanggal.hijriah}`}>
                <div className="hidden text-xs font-medium text-ink sm:block">{tanggal.masehi}</div>
                <div className="hidden text-[11px] text-gold-ink sm:block">{tanggal.hijriah}</div>
                <div className="text-[11px] font-medium text-ink sm:hidden">{tanggal.masehiPendek}</div>
                <div className="text-[10px] text-gold-ink sm:hidden">{tanggal.hijriahPendek}</div>
              </div>
            )}
            {adaKeuangan && (
              <Link
                href="/keuangan/pembayaran"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald/20 bg-emerald-pale/60 px-2.5 text-xs font-medium text-emerald transition hover:bg-emerald hover:text-white"
              >
                <Ikon nama="kasir" className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Terima Bayar</span>
              </Link>
            )}
            <SakelarTema />
            <span className="hidden rounded-md border border-line bg-surface-soft px-2 py-1 text-xs font-medium text-muted sm:inline">
              {LABEL_PERAN[anggota.peran] ?? anggota.peran}
            </span>
          </div>
        </header>

        {peringatan && (
          <div
            className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2 text-xs sm:px-8 print:hidden ${
              peringatan.tingkat === "bahaya"
                ? "border-belum/20 bg-belum-bg text-belum"
                : peringatan.tingkat === "waspada"
                ? "border-cicilan/20 bg-cicilan-bg text-cicilan"
                : "border-line bg-surface-soft text-ink"
            }`}
          >
            <span className="font-medium">{peringatan.teks}</span>
            {peringatan.tautan && (
              <a href={peringatan.tautan.href} className="font-semibold underline underline-offset-2">
                {peringatan.tautan.label}
              </a>
            )}
          </div>
        )}

        {palet && <PaletPerintah grup={grup} tutup={() => setPalet(false)} />}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-7 print:max-w-none print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
