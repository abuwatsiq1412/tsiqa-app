"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { IkonW, Bintang, type NamaIkonW } from "@/components-wali-ikon";

// Lembar bawah & kabar singkat
export function LembarBawah({ judul, tutup, children }: { judul: string; tutup: () => void; children: ReactNode }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && tutup();
    document.addEventListener("keydown", k);
    const lama = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = lama; };
  }, [tutup]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button aria-label="Tutup" onClick={tutup} className="animate-pudar absolute inset-0 cursor-default bg-black/55" />
      <div role="dialog" aria-modal="true" aria-label={judul} className="animate-naik relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[28px] border-t border-line bg-surface px-5 pb-8 pt-3 text-ink shadow-sheet">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-ink">{judul}</h2>
          <button onClick={tutup} aria-label="Tutup" className="-mr-2.5 flex h-11 w-11 cursor-pointer items-center justify-center text-muted hover:text-ink">
            <IkonW n="tutup" className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function useKabar() {
  const [teks, setTeks] = useState("");
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tampil = (s: string) => {
    if (t.current) clearTimeout(t.current);
    setTeks(s);
    t.current = setTimeout(() => setTeks(""), 2200);
  };
  const node = teks ? (
    <div role="status" className="animate-muncul pointer-events-none fixed inset-x-5 bottom-24 z-[60] flex justify-center">
      <span className="rounded-full border border-line/30 bg-forest px-4.5 py-3 text-[13px] font-semibold text-white shadow-lg">{teks}</span>
    </div>
  ) : null;
  return { tampil, node };
}

// Navigasi bawah
const NAV: { href: string; label: string; ikon: NamaIkonW; juga?: string[] }[] = [
  { href: "/wali", label: "Beranda", ikon: "beranda" },
  { href: "/wali/tagihan", label: "Tagihan", ikon: "tagihan" },
  { href: "/wali/riwayat", label: "Riwayat", ikon: "riwayat", juga: ["/wali/kwitansi"] },
  { href: "/wali/rapor", label: "Rapor", ikon: "kwitansi" },
  { href: "/wali/akun", label: "Akun", ikon: "akun" },
];

export function NavBawah() {
  const path = usePathname();
  const a = useSearchParams().get("a");
  return (
    <nav aria-label="Menu utama" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] print:hidden">
      <div className="mx-auto flex h-[72px] max-w-md gap-1 px-2.5 py-2">
        {NAV.map((n) => {
          const aktif = n.href === "/wali" ? path === "/wali" : path === n.href || path.startsWith(n.href + "/") || !!n.juga?.some((j) => path.startsWith(j));
          return (
            <Link key={n.href} href={a ? `${n.href}?a=${a}` : n.href} aria-current={aktif ? "page" : undefined}
              className={`tekan flex flex-1 flex-col items-center justify-center gap-0.5 ${aktif ? "text-emerald" : "text-muted"}`}>
              <span className={`flex h-[30px] w-[52px] items-center justify-center rounded-full transition-colors ${aktif ? "bg-emerald-pale" : ""}`}>
                <IkonW n={n.ikon} className="h-[22px] w-[22px]" />
              </span>
              <span className="text-xs font-bold">{n.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Kepala beranda: pilih ananda & kabar
export interface AnakRingkas { id: string; nama: string; pendek: string; inisial: string; sub: string }
export interface KabarItem { judul: string; isi: string; waktu: string; nada: "emas" | "hijau" | "merah" }

export function KepalaBeranda({ anak, aktifId, kabar }: { anak: AnakRingkas[]; aktifId: string; kabar: KabarItem[] }) {
  const path = usePathname();
  const [buka, setBuka] = useState<null | "anak" | "kabar">(null);
  const aktif = anak.find((x) => x.id === aktifId) ?? anak[0];
  const nada = { emas: "bg-gold-pale text-gold", hijau: "bg-emerald-pale text-emerald", merah: "bg-belum-bg text-belum" };

  return (
    <>
      <div className="flex items-center justify-between">
        <button onClick={() => anak.length > 1 && setBuka("anak")} aria-label="Ganti ananda" className="tekan flex cursor-pointer items-center gap-2.5 text-left">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-pale text-[15px] font-bold text-emerald">{aktif.inisial}</span>
          <span>
            <span className="block text-xs text-muted">Ananda</span>
            <span className="flex items-center gap-1 text-base font-bold text-ink">{aktif.pendek}{anak.length > 1 && <IkonW n="bawah" className="h-[18px] w-[18px]" />}</span>
          </span>
        </button>
        <button onClick={() => setBuka("kabar")} aria-label="Kabar terbaru" className="tekan relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-[14px] border border-line bg-surface text-ink">
          <IkonW n="lonceng" className="h-[22px] w-[22px]" />
          {kabar.length > 0 && <span className="absolute right-[11px] top-2.5 h-2 w-2 rounded-full border-2 border-surface bg-gold" />}
        </button>
      </div>

      {buka === "anak" && (
        <LembarBawah judul="Pilih ananda" tutup={() => setBuka(null)}>
          <div className="mt-3 flex flex-col gap-2.5">
            {anak.map((x) => (
              <Link key={x.id} href={`${path}?a=${x.id}`} onClick={() => setBuka(null)}
                className={`tekan flex items-center gap-3 rounded-2xl p-3.5 ${x.id === aktif.id ? "border-2 border-emerald bg-emerald-pale" : "border border-line bg-surface-soft/50"}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-pale text-sm font-bold text-emerald">{x.inisial}</span>
                <span className="flex-1"><span className="block text-[15px] font-bold text-ink">{x.nama}</span><span className="block text-xs text-muted">{x.sub}</span></span>
                {x.id === aktif.id && <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-emerald text-on-brand"><IkonW n="centang" className="h-4 w-4" /></span>}
              </Link>
            ))}
          </div>
        </LembarBawah>
      )}
      {buka === "kabar" && (
        <LembarBawah judul="Kabar terbaru" tutup={() => setBuka(null)}>
          <div className="mt-3 flex flex-col gap-2.5">
            {kabar.length === 0 && <p className="py-6 text-center text-sm text-muted">Belum ada kabar baru.</p>}
            {kabar.map((k, i) => (
              <div key={i} className="flex gap-3 rounded-2xl border border-line bg-surface-soft/60 p-3.5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${nada[k.nada]}`}>
                  <IkonW n={k.nada === "merah" ? "awas" : k.nada === "hijau" ? "centang" : "tagihan"} />
                </span>
                <span><span className="block text-sm font-bold text-ink">{k.judul}</span><span className="block text-[13px] leading-snug text-muted">{k.isi}</span><span className="mt-1 block text-xs text-muted">{k.waktu}</span></span>
              </div>
            ))}
          </div>
        </LembarBawah>
      )}
    </>
  );
}

// Kartu utama
export function HeroWali({ pondok, anak, total, chip, nada, children }: {
  pondok: string; anak: string; total: number; chip: string; nada: "emas" | "merah" | "hijau"; children?: ReactNode;
}) {
  const [tampil, setTampil] = useState(0);
  const [sembunyi, setSembunyi] = useState(false);

  useEffect(() => {
    try { if (localStorage.getItem("wali_sembunyi") === "1") setSembunyi(true); } catch {}
  }, []);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setTampil(total); return; }
    let raf = 0; const mulai = performance.now();
    const langkah = (t: number) => {
      const p = Math.min(1, (t - mulai) / 700);
      setTampil(Math.round(total * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(langkah);
    };
    raf = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  const ubah = () => setSembunyi((s) => { try { localStorage.setItem("wali_sembunyi", s ? "0" : "1"); } catch {} return !s; });
  const chipCls = { emas: "bg-gold-pale text-gold-ink", merah: "bg-belum-bg text-belum", hijau: "bg-emerald-pale text-emerald" }[nada];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line/40 bg-forest p-5 text-white shadow-[0_10px_24px_rgba(38,59,53,0.22)]">
      <Bintang className="pointer-events-none absolute -right-12 -top-12 h-[190px] w-[190px] opacity-30" />
      <div className="relative">
        <div className="text-xs font-medium text-white/80">{pondok} · wali dari {anak}</div>
        <div className="mt-[18px] flex items-center justify-between">
          <span className="text-[13px] text-white/80">Tagihan belum dibayar</span>
          <button onClick={ubah} aria-label="Tampilkan atau sembunyikan nominal" className="-my-2.5 -mr-2.5 flex h-11 w-11 cursor-pointer items-center justify-center text-white">
            <IkonW n={sembunyi ? "mata-coret" : "mata"} className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-0.5 text-[34px] font-extrabold leading-tight tracking-tight">
          {sembunyi ? "Rp ••••••" : "Rp" + tampil.toLocaleString("id-ID")}
        </div>
        <div className={`mt-3 inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${chipCls}`}>{chip}</div>
        <div className="mt-[18px] flex gap-2.5">{children}</div>
      </div>
    </div>
  );
}

// Cara bayar
export function CaraBayar({ nominal, untuk, rekening, wa, pesanWa, label = "Cara bayar", gaya = "terang" }: {
  nominal: string; untuk: string; rekening: string | null; wa: string | null; pesanWa: string; label?: string; gaya?: "terang" | "hijau";
}) {
  const [buka, setBuka] = useState(false);
  const kabar = useKabar();
  const salin = async () => {
    try { await navigator.clipboard.writeText(rekening ?? ""); kabar.tampil("Rekening disalin"); } catch { kabar.tampil("Salin manual dari layar"); }
  };
  const cls = gaya === "terang"
    ? "flex-1 border border-line bg-surface-soft text-ink"
    : "w-full bg-emerald text-on-brand";
  return (
    <>
      <button onClick={() => setBuka(true)} className={`tekan h-[46px] cursor-pointer rounded-[14px] text-sm font-bold ${cls}`}>{label}</button>
      {buka && (
        <LembarBawah judul="Cara bayar" tutup={() => setBuka(false)}>
          <div className="mt-1.5 text-[13px] text-muted">{untuk}</div>
          <div className="text-3xl font-extrabold tracking-tight text-ink">{nominal}</div>

          <div className="mt-4 rounded-[18px] border border-line bg-surface-soft p-4">
            <div className="text-xs text-muted">Transfer ke rekening resmi</div>
            {rekening ? (
              <div className="mt-1.5 flex items-center justify-between gap-2.5">
                <span className="text-[15px] font-bold leading-snug text-ink">{rekening}</span>
                <button onClick={salin} className="tekan flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-emerald bg-surface px-3.5 text-[13px] font-bold text-emerald">
                  <IkonW n="salin" className="h-4 w-4" />Salin
                </button>
              </div>
            ) : (
              <div className="mt-1.5 text-sm text-muted">Rekening belum diisi pondok. Tanyakan ke bendahara.</div>
            )}
          </div>

          <ol className="mt-[18px] flex flex-col gap-3">
            {["Transfer sesuai nominal tagihan.", "Ketuk “Sudah transfer” di rincian tagihan dan unggah buktinya.", "Tagihan lunas setelah dicek bendahara, kwitansi muncul di Riwayat."].map((t, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-emerald-pale text-xs font-extrabold text-emerald">{i + 1}</span>
                <span className="text-sm leading-snug text-ink">{t}</span>
              </li>
            ))}
          </ol>
          {wa && (
            <a href={`https://wa.me/${wa}?text=${encodeURIComponent(pesanWa)}`} target="_blank" rel="noopener"
              className="tekan mt-5 flex h-[50px] items-center justify-center gap-2 rounded-2xl bg-emerald text-[15px] font-bold text-on-brand">
              <IkonW n="wa" />Hubungi bendahara
            </a>
          )}
          <p className="mt-3 text-center text-xs text-muted">Bayar tunai? Langsung ke bendahara di kantor pondok.</p>
        </LembarBawah>
      )}
      {kabar.node}
    </>
  );
}

// Formulir "Sudah transfer" (foto dikecilkan di HP sebelum diunggah)
async function kecilkan(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size < 700_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const skala = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * skala); c.height = Math.round(bmp.height * skala);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.8));
    return blob ? new File([blob], "bukti.jpg", { type: "image/jpeg" }) : file;
  } catch { return file; }
}

export function FormKonfirmasi({ aksi, tagihanId, anakId, sisa, hari }: {
  aksi: (f: FormData) => Promise<void>; tagihanId: string; anakId: string; sisa: number; hari: string;
}) {
  const [nama, setNama] = useState("");
  const [kirim, setKirim] = useState(false);
  const berkas = useRef<File | null>(null);

  return (
    <form
      action={async (f: FormData) => {
        if (berkas.current) f.set("bukti", berkas.current);
        setKirim(true);
        await aksi(f);
        setKirim(false);
      }}
      className="flex flex-col gap-3.5"
    >
      <input type="hidden" name="tagihan" value={tagihanId} />
      <input type="hidden" name="a" value={anakId} />
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-muted">Nominal transfer (Rp)</span>
        <input name="nominal" type="number" inputMode="numeric" min={1} max={sisa} defaultValue={sisa} required
          className="h-[52px] w-full rounded-[14px] border border-line bg-surface-soft px-4 text-base font-bold text-ink outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-muted">Tanggal transfer</span>
        <input name="tanggal" type="date" max={hari} defaultValue={hari} required
          className="h-[52px] w-full rounded-[14px] border border-line bg-surface-soft px-4 text-base text-ink outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-muted">Bukti transfer (foto atau PDF)</span>
        <span className="flex min-h-[52px] cursor-pointer items-center gap-2.5 rounded-[14px] border border-dashed border-emerald/50 bg-emerald-pale/40 px-4 py-3 text-sm font-semibold text-emerald">
          <IkonW n="unggah" className="h-5 w-5 shrink-0" />
          <span className="truncate">{nama || "Pilih berkas"}</span>
          <input type="file" accept="image/*,application/pdf" required className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              berkas.current = await kecilkan(f);
              setNama(f.name);
            }} />
        </span>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-muted">Catatan (opsional)</span>
        <input name="catatan" maxLength={200} placeholder="Mis. transfer atas nama Bpk. Hasan"
          className="h-[52px] w-full rounded-[14px] border border-line bg-surface-soft px-4 text-base text-ink placeholder:text-muted/60 outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
      </label>
      <button disabled={kirim} className="tekan h-[50px] cursor-pointer rounded-2xl bg-emerald text-[15px] font-bold text-on-brand disabled:opacity-60">
        {kirim ? "Mengirim…" : "Kirim konfirmasi"}
      </button>
    </form>
  );
}

// Akun: notifikasi, pasang aplikasi, keluar, service worker
export function DaftarSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/wali/sw.js", { scope: "/wali/" }).catch(() => {});
  }, []);
  return null;
}

const b64 = (s: string) => {
  const p = "=".repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + p).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export function PushToggle({ kunci, simpan, hapus }: {
  kunci: string | null;
  simpan: (s: { endpoint: string; p256dh: string; auth: string }) => Promise<void>;
  hapus: (endpoint: string) => Promise<void>;
}) {
  const [aktif, setAktif] = useState(false);
  const [siap, setSiap] = useState(false);
  const kabar = useKabar();
  const dukung = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && !!kunci;

  useEffect(() => {
    if (!dukung) return;
    navigator.serviceWorker.ready.then((r) => r.pushManager.getSubscription()).then((s) => { setAktif(!!s); setSiap(true); }).catch(() => setSiap(true));
  }, [dukung]);

  const ubah = async () => {
    if (!dukung) { kabar.tampil("Perangkat ini belum mendukung notifikasi"); return; }
    try {
      const reg = await navigator.serviceWorker.ready;
      const ada = await reg.pushManager.getSubscription();
      if (ada) {
        await hapus(ada.endpoint); await ada.unsubscribe(); setAktif(false); kabar.tampil("Notifikasi dimatikan");
      } else {
        if ((await Notification.requestPermission()) !== "granted") { kabar.tampil("Izin notifikasi ditolak"); return; }
        const s = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(kunci!) });
        const j = s.toJSON();
        await simpan({ endpoint: s.endpoint, p256dh: j.keys?.p256dh ?? "", auth: j.keys?.auth ?? "" });
        setAktif(true); kabar.tampil("Notifikasi diaktifkan");
      }
    } catch { kabar.tampil("Belum berhasil, coba lagi"); }
  };

  return (
    <>
      <div className="flex items-center gap-3 border-b border-line/70 px-4 py-3.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-soft text-emerald"><IkonW n="lonceng" /></span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-ink">Notifikasi tagihan</span>
          <span className="block text-xs text-muted">{dukung ? "Kabar tagihan baru dan pembayaran" : "Belum tersedia di perangkat ini"}</span>
        </span>
        <button role="switch" aria-checked={aktif} aria-label="Notifikasi tagihan" onClick={ubah} disabled={!siap && dukung}
          className="relative h-11 w-[52px] cursor-pointer disabled:opacity-50">
          <span className={`absolute left-0 top-2 h-7 w-[52px] rounded-full transition-colors ${aktif ? "bg-emerald" : "bg-line"}`} />
          <span className={`absolute top-[11px] h-[22px] w-[22px] rounded-full bg-surface shadow transition-all ${aktif ? "left-[27px]" : "left-[3px]"}`} />
        </button>
      </div>
      {kabar.node}
    </>
  );
}

export function PasangAplikasi() {
  const [prompt, setPrompt] = useState<(Event & { prompt: () => Promise<void> }) | null>(null);
  const kabar = useKabar();
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPrompt(e as Event & { prompt: () => Promise<void> }); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  return (
    <>
      <button onClick={() => (prompt ? prompt.prompt() : kabar.tampil("Buka menu browser, lalu pilih “Tambahkan ke layar utama”"))}
        className="tekan flex w-full cursor-pointer items-center gap-3 border-b border-line/70 px-4 py-3.5 text-left">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-soft text-emerald"><IkonW n="pasang" /></span>
        <span className="flex-1"><span className="block text-sm font-semibold text-ink">Pasang di layar utama</span><span className="block text-xs text-muted">Buka seperti aplikasi biasa</span></span>
        <IkonW n="kanan" className="h-4 w-4 text-muted" />
      </button>
      {kabar.node}
    </>
  );
}

export function TombolKeluar({ aksi }: { aksi: () => Promise<void> }) {
  return (
    <form action={aksi} onSubmit={() => navigator.serviceWorker?.controller?.postMessage("bersihkan")}>
      <button className="tekan flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-line bg-surface text-sm font-bold text-belum">
        <IkonW n="keluar" className="h-[18px] w-[18px]" />Keluar
      </button>
    </form>
  );
}