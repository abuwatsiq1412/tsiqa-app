"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./icons";
import { Badge, ButtonLink } from "./ui";
import {
  CORE_BLOK,
  CORE_HARGA_PER_BLOK,
  CORE_KUOTA_DASAR,
  DISKON_MODUL_BESAR_MIN,
  DISKON_MODUL_BESAR_PERSEN,
  DISKON_MODUL_SEDANG_MIN,
  DISKON_MODUL_SEDANG_PERSEN,
  KUOTA_MAX,
  KUOTA_MIN,
  KUOTA_STEP,
  MIN_SETUP_BIAYA,
  MODUL,
  PAKET,
  TARIF_SETUP_PER_SANTRI,
  hitungCore,
  hitungHarga,
  rupiah,
  waLink,
  type ModulId,
  type PaketId,
} from "../_lib/pricing";

type Pilihan = PaketId | "custom";
type Mode = "paket" | "custom";

function Baris({
  label,
  nilai,
  tebal = false,
  hijau = false,
}: {
  label: string;
  nilai: string;
  tebal?: boolean;
  hijau?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline gap-2 text-sm ${
        tebal ? "font-semibold text-ink" : "text-muted"
      } ${hijau ? "!text-emerald" : ""}`}
    >
      <span className="min-w-0 max-w-[62%] shrink-0 truncate">{label}</span>
      <span
        aria-hidden="true"
        className="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-line"
      />
      <span className={`shrink-0 ${tebal ? "text-ink" : "text-ink/80"}`}>
        {nilai}
      </span>
    </div>
  );
}

export function Pricing() {
  const awal = PAKET.find((p) => p.id === "administrasi")!;
  const [mode, setMode] = useState<Mode>("paket");
  const [pilihan, setPilihan] = useState<Pilihan>("administrasi");
  const [paketTerakhir, setPaketTerakhir] = useState<PaketId>("administrasi");
  const [kuota, setKuota] = useState<number>(awal.kuota);
  const [modul, setModul] = useState<ModulId[]>(awal.modul);
  const [tahunan, setTahunan] = useState(true);

  // Bar total untuk HP: tampil saat bagian harga terlihat tapi kwitansi belum.
  const bagianRef = useRef<HTMLDivElement>(null);
  const kwitansiRef = useRef<HTMLElement>(null);
  const [bagianTerlihat, setBagianTerlihat] = useState(false);
  const [kwitansiTerlihat, setKwitansiTerlihat] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const a = bagianRef.current;
    const b = kwitansiRef.current;
    if (!a || !b) return;
    const ioA = new IntersectionObserver(([e]) =>
      setBagianTerlihat(e.isIntersecting)
    );
    const ioB = new IntersectionObserver(([e]) =>
      setKwitansiTerlihat(e.isIntersecting)
    );
    ioA.observe(a);
    ioB.observe(b);
    return () => {
      ioA.disconnect();
      ioB.disconnect();
    };
  }, []);

  const hasil = useMemo(
    () => hitungHarga({ kuota, modul, tahunan }),
    [kuota, modul, tahunan]
  );

  const pilihPaket = (id: PaketId) => {
    const p = PAKET.find((x) => x.id === id)!;
    setPilihan(id);
    setPaketTerakhir(id);
    setKuota(p.kuota);
    setModul(p.modul);
  };

  const gantiMode = (m: Mode) => {
    if (m === mode) return;
    setMode(m);
    // Kembali ke paket: terapkan lagi paket terakhir yang dipilih.
    if (m === "paket") pilihPaket(paketTerakhir);
  };

  const ubahKuota = (n: number) => {
    setKuota(n);
    setPilihan("custom");
  };

  const toggleModul = (id: ModulId) => {
    setModul((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setPilihan("custom");
  };

  const namaPilihan =
    pilihan === "custom"
      ? "Pilihan sendiri"
      : `Paket ${PAKET.find((p) => p.id === pilihan)!.nama}`;

  const n = hasil.jumlahModul;

  const pesanWa =
    `Assalamu’alaikum, saya tertarik dengan TSIQA.\n\n` +
    `Simulasi saya (${namaPilihan}):\n` +
    `• Core hingga ${kuota} santri aktif\n` +
    `• Modul: ${
      hasil.terpilih.length
        ? hasil.terpilih.map((m) => m.nama).join(", ")
        : "tanpa modul tambahan"
    }\n` +
    `• Perkiraan ${rupiah(hasil.perBulan)} per bulan\n` +
    `• Pembayaran: ${
      tahunan
        ? `tahunan ${rupiah(hasil.perTahun)} (gratis 2 bulan)`
        : "bulanan"
    }\n\n` +
    `Mohon informasinya.`;

  const keKwitansi = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    kwitansiRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "center",
    });
  };

  const tampilBar = bagianTerlihat && !kwitansiTerlihat;

  return (
    <div ref={bagianRef} className="mt-8 grid items-start gap-6 lg:grid-cols-12">
      {/* ------------------------- Kiri: pilihan ------------------------ */}
      <div className="space-y-5 lg:col-span-7">
        <div
          role="group"
          aria-label="Cara memilih"
          className="inline-grid grid-cols-2 rounded-full border border-line bg-white p-1 text-sm font-semibold"
        >
          {(
            [
              ["paket", "Pilih paket", "layers"],
              ["custom", "Atur sendiri", "sliders"],
            ] as const
          ).map(([id, label, ikon]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => gantiMode(id)}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 transition-all duration-200 ${
                mode === id
                  ? "bg-ink text-white shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {ikon === "sliders" ? (
                <Icon name="sliders" className="size-4" />
              ) : (
                <Icon name="check" className="size-4" />
              )}
              {label}
            </button>
          ))}
        </div>

        {/* ----------------------- Mode: pilih paket -------------------- */}
        {mode === "paket" && (
          <div
            key="paket"
            role="group"
            aria-label="Pilih paket"
            className="animate-swap grid gap-3 sm:grid-cols-2"
          >
            {PAKET.map((p) => {
              const hargaPaket = hitungHarga({
                kuota: p.kuota,
                modul: p.modul,
                tahunan: false,
              });
              const harga = hargaPaket.perBulan;
              const on = pilihan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => pilihPaket(p.id)}
                  className={`lift relative flex flex-col rounded-2xl border p-4 text-left active:scale-[0.99] ${
                    p.sorot ? "bg-emerald-pale/25" : "bg-white"
                  } ${
                    on
                      ? "border-emerald shadow-[0_0_0_3px_rgba(15,118,110,0.14)]"
                      : p.sorot
                      ? "border-emerald/40"
                      : "border-line"
                  }`}
                >
                  <div className="flex min-h-6 items-center justify-between gap-2">
                    <span className="text-[15px] font-semibold text-ink">
                      {p.nama}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-5 shrink-0 place-items-center rounded-full border transition ${
                        on
                          ? "border-emerald bg-emerald text-white"
                          : "border-line bg-white text-transparent"
                      }`}
                    >
                      <Icon name="check" className="size-3" />
                    </span>
                  </div>
                  <div className="mt-1 h-[22px]">
                    {p.sorot && <Badge tone="gold">{p.sorot}</Badge>}
                  </div>
                  <p className="mt-2 text-[13px] leading-snug text-muted">
                    {p.untuk}
                  </p>
                  <p className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
                    {rupiah(harga)}
                    <span className="text-sm font-medium text-muted">
                      {" "}
                      /bulan
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    hingga {p.kuota} santri aktif
                  </p>
                  <p className="mt-1 text-xs font-medium text-emerald">
                    {rupiah(hargaPaket.perTahun)} / tahun, gratis 2 bulan
                  </p>
                  {hargaPaket.persenDiskon > 0 && (
                    <p className="mt-0.5 text-xs text-muted">
                      Sudah termasuk diskon modul {hargaPaket.persenDiskon}%
                    </p>
                  )}
                  <ul className="mt-3 space-y-1.5 border-t border-line pt-3">
                    {p.poin.map((x) => (
                      <li
                        key={x}
                        className="flex items-start gap-2 text-[13px] leading-snug text-ink/90"
                      >
                        <Icon
                          name="check"
                          className="mt-0.5 size-3.5 shrink-0 text-emerald"
                        />
                        {x}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        )}

        {/* ----------------------- Mode: atur sendiri ------------------- */}
        {mode === "custom" && (
          <div
            key="custom"
            className="animate-swap space-y-5 rounded-2xl border border-line bg-white p-5"
          >
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="kuota" className="text-sm font-semibold text-ink">
                  Santri aktif
                </label>
                <span className="rounded-full bg-emerald-pale px-3 py-1 text-sm font-semibold text-emerald">
                  hingga {kuota.toLocaleString("id-ID")} santri
                </span>
              </div>
              <input
                id="kuota"
                type="range"
                min={KUOTA_MIN}
                max={KUOTA_MAX}
                step={KUOTA_STEP}
                value={kuota}
                onChange={(e) => ubahKuota(Number(e.target.value))}
                aria-valuetext={`hingga ${kuota} santri aktif, Core ${rupiah(
                  hitungCore(kuota)
                )} per bulan`}
                className="h-2 w-full cursor-pointer accent-emerald"
              />
              <p className="mt-2 text-[13px] text-muted">
                Core {rupiah(hitungCore(kuota))}/bulan. Alumni tidak dihitung.
              </p>
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">
                  Modul tambahan ({n} dipilih)
                </p>
                <div className="flex gap-4 text-[13px] font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setModul(MODUL.map((m) => m.id));
                      setPilihan("custom");
                    }}
                    className="text-emerald hover:underline"
                  >
                    Pilih semua
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModul([]);
                      setPilihan("custom");
                    }}
                    className="text-muted hover:underline"
                  >
                    Kosongkan
                  </button>
                </div>
              </div>

              <p
                role="status"
                className={`mb-4 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[13px] font-medium ${
                  hasil.persenDiskon > 0
                    ? "bg-emerald-pale text-emerald"
                    : "bg-gold-pale text-gold-ink"
                }`}
              >
                <Icon name="sparkles" className="size-4 shrink-0" />
                {n >= DISKON_MODUL_BESAR_MIN
                  ? `Diskon ${DISKON_MODUL_BESAR_PERSEN}% aktif untuk modul tambahan Anda.`
                  : n >= DISKON_MODUL_SEDANG_MIN
                  ? `Diskon ${DISKON_MODUL_SEDANG_PERSEN}% aktif. Tambah sampai ${DISKON_MODUL_BESAR_MIN} modul untuk diskon ${DISKON_MODUL_BESAR_PERSEN}%.`
                  : `Ambil ${DISKON_MODUL_SEDANG_MIN}–${DISKON_MODUL_BESAR_MIN - 1} modul diskon ${DISKON_MODUL_SEDANG_PERSEN}%, ${DISKON_MODUL_BESAR_MIN} modul atau lebih diskon ${DISKON_MODUL_BESAR_PERSEN}%.`}
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {MODUL.map((m) => {
                  const on = modul.includes(m.id);
                  return (
                    <label key={m.id} className="relative block cursor-pointer">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggleModul(m.id)}
                        className="peer sr-only"
                      />
                      <div className="lift h-full rounded-xl border border-line bg-white p-4 peer-checked:border-emerald peer-checked:bg-emerald-pale/30 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                              <Icon
                                name={m.icon}
                                className="size-3.5 text-emerald"
                              />
                              {m.kategori}
                            </p>
                            <p className="mt-1 text-[15px] font-semibold text-ink">
                              {m.nama}
                            </p>
                          </div>
                          <span
                            aria-hidden="true"
                            className={`grid size-5 shrink-0 place-items-center rounded-md border transition ${
                              on
                                ? "border-emerald bg-emerald text-white"
                                : "border-line bg-white text-transparent"
                            }`}
                          >
                            <Icon name="check" className="size-3.5" />
                          </span>
                        </div>
                        <p className="mt-2 text-[13px] leading-relaxed text-muted">
                          {m.deskripsi}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-ink">
                          +{rupiah(m.harga)}
                          <span className="text-xs font-medium text-muted">
                            {" "}
                            /bulan
                          </span>
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------- Catatan kuota & setup ------------------- */}
        <div className="space-y-2 rounded-xl bg-surface-soft px-4 py-3 text-[13px] leading-relaxed text-muted">
          <p>
            <span className="font-semibold text-ink">Kuota santri aktif:</span>{" "}
            Core mencakup hingga {CORE_KUOTA_DASAR} santri aktif. Tambahan{" "}
            {rupiah(CORE_HARGA_PER_BLOK)}/bulan untuk setiap kelipatan{" "}
            {CORE_BLOK} santri. Alumni tidak dihitung.
          </p>
          <p>
            <span className="font-semibold text-ink">Catatan setup data santri:</span>{" "}
            input mandiri via template Excel gratis (Rp0). Jika dibantu tim TSIQA
            (terima beres & bimbingan admin), dikenakan {rupiah(TARIF_SETUP_PER_SANTRI)}/santri
            (minimum charge {rupiah(MIN_SETUP_BIAYA)}).
          </p>
        </div>
      </div>

      {/* ------------------------ Kanan: kwitansi ----------------------- */}
      <aside
        ref={kwitansiRef}
        id="kwitansi"
        aria-label="Ringkasan biaya"
        className="lg:sticky lg:top-24 lg:col-span-5"
      >
        <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_70px_-40px_rgba(24,38,34,0.45)]">
          <div className="h-1.5 bg-emerald" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Simulasi biaya
                </p>
                <h3 className="mt-1 truncate text-lg font-semibold text-ink">
                  {namaPilihan}
                </h3>
              </div>
              <div
                aria-hidden="true"
                className="grid size-16 shrink-0 -rotate-12 place-items-center rounded-full border-2 border-gold text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-gold-ink"
              >
                <span>
                  Garansi
                  <br />
                  30 hari
                </span>
              </div>
            </div>

            <div
              role="group"
              aria-label="Siklus pembayaran"
              className="mt-4 grid grid-cols-2 rounded-full bg-surface-soft p-1 text-[13px] font-semibold"
            >
              <button
                type="button"
                aria-pressed={!tahunan}
                onClick={() => setTahunan(false)}
                className={`rounded-full px-3 py-2 transition-all duration-200 ${
                  !tahunan ? "bg-white text-ink shadow-sm" : "text-muted"
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                aria-pressed={tahunan}
                onClick={() => setTahunan(true)}
                className={`rounded-full px-3 py-2 transition-all duration-200 ${
                  tahunan ? "bg-emerald text-white shadow-sm" : "text-muted"
                }`}
              >
                Tahunan · bayar 10 bulan (Gratis 2 bulan!)
              </button>
            </div>

            <div className="mt-5 space-y-2.5">
              <Baris
                label={`Core (≤ ${kuota} santri)`}
                nilai={rupiah(hasil.core)}
              />
              {n > 0 && (
                <>
                  <Baris
                    label={`Modul tambahan (${n})`}
                    nilai={rupiah(hasil.subtotalModul)}
                  />
                  <details className="group text-[13px]">
                    <summary className="flex w-fit cursor-pointer list-none items-center gap-1 font-semibold text-emerald [&::-webkit-details-marker]:hidden">
                      <Icon
                        name="plus"
                        className="size-3.5 transition-transform group-open:rotate-45"
                      />
                      Lihat rincian modul
                    </summary>
                    <ul className="mt-2 space-y-1.5 border-l-2 border-line pl-3">
                      {hasil.terpilih.map((m) => (
                        <li
                          key={m.id}
                          className="flex justify-between gap-3 text-muted"
                        >
                          <span className="truncate">{m.nama}</span>
                          <span className="shrink-0">{rupiah(m.harga)}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </>
              )}
              {hasil.persenDiskon > 0 && (
                <Baris
                  label={`Diskon modul ${hasil.persenDiskon}%`}
                  nilai={`−${rupiah(hasil.diskon)}`}
                  hijau
                />
              )}
              <div className="border-t border-dashed border-line pt-3">
                <Baris
                  label="Biaya per bulan"
                  nilai={rupiah(hasil.perBulan)}
                  tebal
                />
              </div>
              {tahunan && (
                <>
                  <Baris
                    label="Langganan 12 bulan (bayar 10)"
                    nilai={rupiah(hasil.perTahun)}
                  />
                  <p className="text-[13px] font-medium text-emerald">
                    Gratis 2 bulan, hemat {rupiah(hasil.hematTahunan)}.
                  </p>
                </>
              )}
            </div>

            <div className="mt-5 rounded-xl bg-forest p-4 text-white">
              <p className="text-[13px] text-emerald-pale">
                Total dibayar di awal
              </p>
              <p
                key={hasil.bayarAwal}
                className="animate-swap mt-1 text-3xl font-semibold tracking-tight"
              >
                {rupiah(hasil.bayarAwal)}
              </p>
              <p className="mt-1 text-xs text-white/70">
                {tahunan
                  ? "Langganan 10 bulan (gratis 2 bulan)"
                  : "Langganan bulan pertama"}
              </p>
            </div>

            <div className="mt-4 grid gap-2.5">
              <ButtonLink href={waLink(pesanWa)} variant="primary" className="w-full">
                Daftar Pilot dengan Paket Ini
                <Icon
                  name="arrow-right"
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                />
              </ButtonLink>
              <ButtonLink
                href={waLink(pesanWa)}
                variant="outline"
                className="w-full"
              >
                <Icon name="message" className="size-4 text-emerald" />
                Konsultasi Paket via WhatsApp
              </ButtonLink>
            </div>

            <p className="mt-3 text-center text-xs leading-relaxed text-muted">
              Garansi uang kembali 30 hari untuk biaya langganan. Biaya setup
              tidak termasuk. Modul bisa ditambah atau dimatikan kapan saja.
            </p>
          </div>
        </div>
      </aside>

      {/* ----------- Bar total yang menempel di bawah (khusus HP) -------- */}
      <div
        aria-hidden={!tampilBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden ${
          tampilBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">Total di awal</p>
            <p className="truncate text-lg font-semibold text-ink">
              {rupiah(hasil.bayarAwal)}
            </p>
          </div>
          <button
            type="button"
            tabIndex={tampilBar ? 0 : -1}
            onClick={keKwitansi}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-emerald px-5 text-sm font-semibold text-white transition active:scale-[0.97]"
          >
            Lihat rincian
            <Icon name="arrow-right" className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
