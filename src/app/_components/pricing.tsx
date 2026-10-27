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
      className={`flex items-baseline gap-2 text-xs sm:text-sm ${
        tebal ? "font-semibold text-ink" : "text-muted"
      } ${hijau ? "!text-emerald" : ""}`}
    >
      <span className="min-w-0 max-w-[65%] shrink-0 truncate">{label}</span>
      <span
        aria-hidden="true"
        className="min-w-3 flex-1 -translate-y-1 border-b border-dotted border-line"
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
        ? `tahunan ${rupiah(hasil.perTahun)} (gratis 1 bulan)`
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
    <div
      ref={bagianRef}
      className="mt-5 grid items-start gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-12"
    >
      {/* ------------------------- Kiri: pilihan ------------------------ */}
      <div className="space-y-4 sm:space-y-5 lg:col-span-7">
        <div
          role="group"
          aria-label="Cara memilih"
          className="grid w-full grid-cols-2 rounded-full border border-line bg-white p-1 text-xs font-semibold sm:inline-grid sm:w-auto sm:text-sm"
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
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3.5 py-2 transition-all duration-200 sm:gap-2 sm:px-5 ${
                mode === id
                  ? "bg-ink text-white shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
            >
              {ikon === "sliders" ? (
                <Icon name="sliders" className="size-3.5 sm:size-4" />
              ) : (
                <Icon name="check" className="size-3.5 sm:size-4" />
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
            className="animate-swap grid gap-2.5 sm:grid-cols-2 sm:gap-3"
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
                  className={`lift relative flex flex-col rounded-2xl border p-3.5 text-left active:scale-[0.99] sm:p-4 ${
                    p.sorot ? "bg-emerald-pale/25" : "bg-white"
                  } ${
                    on
                      ? "border-emerald shadow-[0_0_0_3px_rgba(15,118,110,0.14)]"
                      : p.sorot
                      ? "border-emerald/40"
                      : "border-line"
                  }`}
                >
                  <div className="flex min-h-5 items-center justify-between gap-2 sm:min-h-6">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-ink sm:text-[15px]">
                        {p.nama}
                      </span>
                      {p.sorot && <Badge tone="gold">{p.sorot}</Badge>}
                    </div>
                    <span
                      aria-hidden="true"
                      className={`grid size-4.5 shrink-0 place-items-center rounded-full border transition sm:size-5 ${
                        on
                          ? "border-emerald bg-emerald text-white"
                          : "border-line bg-white text-transparent"
                      }`}
                    >
                      <Icon name="check" className="size-2.5 sm:size-3" />
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs leading-snug text-muted sm:mt-2 sm:text-[13px]">
                    {p.untuk}
                  </p>
                  <p className="mt-2.5 text-lg font-semibold tracking-tight text-ink sm:mt-3 sm:text-[22px]">
                    {rupiah(harga)}
                    <span className="text-xs font-medium text-muted sm:text-sm">
                      {" "}
                      /bulan
                    </span>
                  </p>
                  <p className="text-[11px] text-muted sm:text-xs">
                    hingga {p.kuota} santri aktif
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-emerald sm:mt-1 sm:text-xs">
                    {rupiah(hargaPaket.perTahun)} / tahun (gratis 1 bulan)
                  </p>
                  {hargaPaket.persenDiskon > 0 && (
                    <p className="mt-0.5 text-[11px] text-muted sm:text-xs">
                      Termasuk diskon modul {hargaPaket.persenDiskon}%
                    </p>
                  )}
                  <ul className="mt-2.5 space-y-1 border-t border-line pt-2.5 sm:mt-3 sm:space-y-1.5 sm:pt-3">
                    {p.poin.map((x) => (
                      <li
                        key={x}
                        className="flex items-start gap-1.5 text-xs leading-snug text-ink/90 sm:gap-2 sm:text-[13px]"
                      >
                        <Icon
                          name="check"
                          className="mt-0.5 size-3 shrink-0 text-emerald sm:size-3.5"
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
            className="animate-swap space-y-4 rounded-2xl border border-line bg-white p-3.5 sm:space-y-5 sm:p-5"
          >
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label
                  htmlFor="kuota"
                  className="text-xs font-semibold text-ink sm:text-sm"
                >
                  Santri aktif
                </label>
                <span className="rounded-full bg-emerald-pale px-2.5 py-0.5 text-xs font-semibold text-emerald sm:px-3 sm:py-1 sm:text-sm">
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
              <p className="mt-1.5 text-xs text-muted sm:mt-2 sm:text-[13px]">
                Core {rupiah(hitungCore(kuota))}/bulan. Alumni tidak dihitung.
              </p>
            </div>

            <div>
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
                <p className="text-xs font-semibold text-ink sm:text-sm">
                  Modul tambahan ({n} dipilih)
                </p>
                <div className="flex gap-3 text-xs font-semibold sm:gap-4 sm:text-[13px]">
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
                className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium sm:mb-4 sm:px-3.5 sm:py-2.5 sm:text-[13px] ${
                  hasil.persenDiskon > 0
                    ? "bg-emerald-pale text-emerald"
                    : "bg-gold-pale text-gold-ink"
                }`}
              >
                <Icon name="sparkles" className="size-3.5 shrink-0 sm:size-4" />
                {n >= DISKON_MODUL_BESAR_MIN
                  ? `Diskon ${DISKON_MODUL_BESAR_PERSEN}% aktif untuk modul tambahan Anda.`
                  : n >= DISKON_MODUL_SEDANG_MIN
                  ? `Diskon ${DISKON_MODUL_SEDANG_PERSEN}% aktif. Tambah sampai ${DISKON_MODUL_BESAR_MIN} modul untuk diskon ${DISKON_MODUL_BESAR_PERSEN}%.`
                  : `Ambil ${DISKON_MODUL_SEDANG_MIN}–${
                      DISKON_MODUL_BESAR_MIN - 1
                    } modul diskon ${DISKON_MODUL_SEDANG_PERSEN}%, ${DISKON_MODUL_BESAR_MIN}+ modul diskon ${DISKON_MODUL_BESAR_PERSEN}%.`}
              </p>

              <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
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
                      <div className="lift h-full rounded-xl border border-line bg-white p-3 peer-checked:border-emerald peer-checked:bg-emerald-pale/30 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald sm:p-4">
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="min-w-0">
                            <p className="flex items-center gap-1 text-xs font-medium text-muted sm:gap-1.5">
                              <Icon
                                name={m.icon}
                                className="size-3 text-emerald sm:size-3.5"
                              />
                              {m.kategori}
                            </p>
                            <p className="mt-0.5 text-sm font-semibold text-ink sm:mt-1 sm:text-[15px]">
                              {m.nama}
                            </p>
                          </div>
                          <span
                            aria-hidden="true"
                            className={`grid size-4.5 shrink-0 place-items-center rounded-md border transition sm:size-5 ${
                              on
                                ? "border-emerald bg-emerald text-white"
                                : "border-line bg-white text-transparent"
                            }`}
                          >
                            <Icon name="check" className="size-3 sm:size-3.5" />
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted sm:mt-2 sm:text-[13px]">
                          {m.deskripsi}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-ink sm:mt-3 sm:text-sm">
                          +{rupiah(m.harga)}
                          <span className="text-[11px] font-medium text-muted sm:text-xs">
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
        <div className="space-y-1.5 rounded-xl bg-surface-soft px-3.5 py-2.5 text-xs leading-relaxed text-muted sm:space-y-2 sm:px-4 sm:py-3 sm:text-[13px]">
          <p>
            <span className="font-semibold text-ink">Kuota santri aktif:</span>{" "}
            Core mencakup hingga {CORE_KUOTA_DASAR} santri aktif. Tambahan{" "}
            {rupiah(CORE_HARGA_PER_BLOK)}/bulan untuk setiap kelipatan{" "}
            {CORE_BLOK} santri. Alumni tidak dihitung.
          </p>
          <p>
            <span className="font-semibold text-ink">
              Catatan setup data santri:
            </span>{" "}
            input mandiri via template Excel gratis (Rp0). Jika dibantu tim TSIQA
            (terima beres & bimbingan admin), dikenakan{" "}
            {rupiah(TARIF_SETUP_PER_SANTRI)}/santri (minimum charge{" "}
            {rupiah(MIN_SETUP_BIAYA)}).
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
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">
                  Simulasi biaya
                </p>
                <h3 className="mt-0.5 truncate text-base font-semibold text-ink sm:mt-1 sm:text-lg">
                  {namaPilihan}
                </h3>
              </div>
              <div
                aria-hidden="true"
                className="grid size-13 shrink-0 -rotate-12 place-items-center rounded-full border-2 border-gold text-center text-[9px] font-bold leading-tight text-gold-ink sm:size-16 sm:text-[11px]"
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
              className="mt-3.5 grid grid-cols-2 rounded-full bg-surface-soft p-1 text-xs font-semibold sm:mt-4 sm:text-[13px]"
            >
              <button
                type="button"
                aria-pressed={!tahunan}
                onClick={() => setTahunan(false)}
                className={`rounded-full px-2.5 py-1.5 transition-all duration-200 sm:px-3 sm:py-2 ${
                  !tahunan ? "bg-white text-ink shadow-sm" : "text-muted"
                }`}
              >
                Bulanan
              </button>
              <button
                type="button"
                aria-pressed={tahunan}
                onClick={() => setTahunan(true)}
                className={`rounded-full px-2.5 py-1.5 transition-all duration-200 sm:px-3 sm:py-2 ${
                  tahunan ? "bg-emerald text-white shadow-sm" : "text-muted"
                }`}
              >
                <span className="sm:hidden">Tahunan (Hemat 1 bln)</span>
                <span className="hidden sm:inline">
                  Tahunan · bayar 11 bulan
                </span>
              </button>
            </div>

            <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-2.5">
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
                  <details className="group text-xs sm:text-[13px]">
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
              <div className="border-t border-dashed border-line pt-2.5 sm:pt-3">
                <Baris
                  label="Biaya per bulan"
                  nilai={rupiah(hasil.perBulan)}
                  tebal
                />
              </div>
              {tahunan && (
                <>
                  <Baris
                    label="Langganan 12 bulan (bayar 11)"
                    nilai={rupiah(hasil.perTahun)}
                  />
                  <p className="text-xs font-medium text-emerald sm:text-[13px]">
                    Gratis 1 bulan, hemat {rupiah(hasil.hematTahunan)}.
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 rounded-xl bg-forest p-3.5 text-white sm:mt-5 sm:p-4">
              <p className="text-xs text-emerald-pale sm:text-[13px]">
                Total dibayar di awal
              </p>
              <p
                key={hasil.bayarAwal}
                className="animate-swap mt-0.5 text-2xl font-semibold tracking-tight sm:mt-1 sm:text-3xl"
              >
                {rupiah(hasil.bayarAwal)}
              </p>
              <p className="mt-0.5 text-[11px] text-white/70 sm:mt-1 sm:text-xs">
                {tahunan
                  ? "Langganan 11 bulan (gratis 1 bulan)"
                  : "Langganan bulan pertama"}
              </p>
            </div>

            <div className="mt-3.5 grid gap-2 sm:mt-4 sm:gap-2.5">
              <ButtonLink href="/daftar" variant="primary" className="w-full">
                Daftar dengan Paket Ini
                <Icon
                  name="arrow-right"
                  className="size-3.5 transition-transform group-hover:translate-x-0.5 sm:size-4"
                />
              </ButtonLink>
              <ButtonLink
                href={waLink(pesanWa)}
                variant="outline"
                className="w-full"
              >
                <Icon name="message" className="size-3.5 text-emerald sm:size-4" />
                Konsultasi Paket via WhatsApp
              </ButtonLink>
            </div>

            <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted sm:mt-3 sm:text-xs">
              Garansi uang kembali 30 hari untuk biaya langganan. Biaya setup
              tidak termasuk. Modul bisa ditambah atau dimatikan kapan saja.
            </p>
          </div>
        </div>
      </aside>

      {/* ----------- Bar total yang menempel di bawah (khusus HP) -------- */}
      <div
        aria-hidden={!tampilBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-2.5 backdrop-blur transition-transform duration-300 lg:hidden ${
          tampilBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted">Total di awal</p>
            <p className="truncate text-base font-semibold text-ink">
              {rupiah(hasil.bayarAwal)}
            </p>
          </div>
          <button
            type="button"
            tabIndex={tampilBar ? 0 : -1}
            onClick={keKwitansi}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-emerald px-4 text-xs font-semibold text-white transition active:scale-[0.97]"
          >
            Lihat rincian
            <Icon name="arrow-right" className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
