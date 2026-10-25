import { TombolKirim } from "@/components-form";
import Link from "next/link";
import { konteks } from "@/lib/konteks";
import {
  AvatarInisial,
  HeaderHalaman,
  Ikon,
  Kartu,
  Label,
  Lencana,
  PesanNotifikasi,
  input,
  tombol,
  tombolSekunder,
} from "@/components-ui";
import { rupiah, tanggal } from "@/lib/format";
import type { Santri } from "@/lib/db-types";
import type { Tagihan } from "@/modules/keuangan/types";
import { catatBayar } from "../actions";

export default async function Pembayaran({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; santri?: string; galat?: string }>;
}) {
  const { q, santri: dipilih, galat } = await searchParams;
  const { sb } = await konteks();

  let hasil: Santri[] = [];
  if (q) {
    const { data } = await sb
      .from("santri")
      .select("id, pondok_id, nis, nama, nama_wali, no_wa_wali, status")
      .eq("status", "aktif")
      .or(`nama.ilike.%${q.replace(/[%_,()]/g, "")}%,nis.ilike.%${q.replace(/[%_,()]/g, "")}%`)
      .order("nama")
      .limit(10);
    hasil = (data ?? []) as Santri[];
  } else {
    const { data } = await sb
      .from("santri")
      .select("id, pondok_id, nis, nama, nama_wali, no_wa_wali, status")
      .eq("status", "aktif")
      .order("nama")
      .limit(8);
    hasil = (data ?? []) as Santri[];
  }

  let santriAktif: Santri | null = null;
  let tagihan: Tagihan[] = [];
  if (dipilih && /^[0-9a-f-]{36}$/.test(dipilih)) {
    const [{ data: sData }, { data: tData }] = await Promise.all([
      sb
        .from("santri")
        .select("id, pondok_id, nis, nama, nama_wali, no_wa_wali, status")
        .eq("id", dipilih)
        .maybeSingle(),
      sb
        .from("tagihan")
        .select("*")
        .eq("santri_id", dipilih)
        .neq("status", "lunas")
        .order("jatuh_tempo"),
    ]);
    santriAktif = (sData as Santri | null) ?? null;
    tagihan = (tData ?? []) as Tagihan[];
  }
  const balik = dipilih ? `/keuangan/pembayaran?santri=${dipilih}` : "/keuangan/pembayaran";

  return (
    <>
      <HeaderHalaman
        judul="Terima Pembayaran"
        aksi={
          <Link href="/keuangan/laporan" className={tombolSekunder}>
            <Ikon nama="laporan" className="h-3.5 w-3.5" />
            <span>Laporan Kas</span>
          </Link>
        }
      />

      <PesanNotifikasi galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[380px_1fr]">
        {/* Kolom Kiri: Pencarian & Pemilihan Santri */}
        <Kartu className="!p-0 overflow-hidden">
          <div className="border-b border-line p-4">
            <Label>1. Cari & Pilih Santri</Label>
            <form className="mt-1 flex gap-2">
              <div className="relative flex-1">
                <Ikon
                  nama="cari"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Ketik nama atau NIS..."
                  className={`${input} pl-9`}
                />
              </div>
              <TombolKirim>Cari</TombolKirim>
            </form>
          </div>

          <ul className="divide-y divide-line text-sm">
            {hasil.map((s) => {
              const aktif = s.id === dipilih;
              return (
                <li key={s.id}>
                  <Link
                    href={`/keuangan/pembayaran?${q ? `q=${encodeURIComponent(q)}&` : ""}santri=${s.id}`}
                    className={`flex items-center justify-between gap-3 px-4 py-3 transition ${
                      aktif ? "bg-emerald-pale/80 font-semibold text-emerald" : "hover:bg-surface-soft"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AvatarInisial nama={s.nama} warna={aktif ? "forest" : "teal"} />
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink">{s.nama}</div>
                        <div className="text-xs text-muted">
                          NIS {s.nis} · Wali: {s.nama_wali}
                        </div>
                      </div>
                    </div>
                    <Ikon
                      nama="panah"
                      className={`h-4 w-4 shrink-0 ${aktif ? "text-emerald" : "text-muted/50"}`}
                    />
                  </Link>
                </li>
              );
            })}
            {hasil.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-muted">
                Santri tidak ditemukan.
              </li>
            )}
          </ul>
        </Kartu>

        {/* Kolom Kanan: Form Kasir Pembayaran */}
        {!dipilih ? (
          <Kartu varian="soft" className="flex min-h-[280px] flex-col items-center justify-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald shadow-xs">
              <Ikon nama="kasir" className="h-5 w-5" />
            </span>
            <h2 className="mt-3 text-base font-semibold text-ink">Pilih santri</h2>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Tagihan yang belum lunas akan tampil di sini.
            </p>
          </Kartu>
        ) : tagihan.length === 0 ? (
          <Kartu varian="mint" className="space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald">
              <Ikon nama="cek" className="h-5 w-5" />
              <span>Tidak Ada Tunggakan Tagihan</span>
            </div>
            <p className="text-sm text-ink">
              Santri <b>{santriAktif?.nama}</b> tidak memiliki tagihan yang belum lunas saat ini.
            </p>
          </Kartu>
        ) : (
          <Kartu className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
              <div>
                <div className="text-xs font-medium text-emerald">
                  2. Input Pembayaran Kasir
                </div>
                <h2 className="mt-0.5 text-lg font-bold text-ink">{santriAktif?.nama}</h2>
                <p className="text-xs text-muted">
                  NIS {santriAktif?.nis} · Wali: {santriAktif?.nama_wali}
                </p>
              </div>
              <Lencana varian="cicilan">{tagihan.length} Tagihan Belum Lunas</Lencana>
            </div>

            <form action={catatBayar} className="space-y-4">
              <input type="hidden" name="balik" value={balik} />
              <label className="block">
                <Label>Pilih Tagihan yang Dibayar</Label>
                <select name="tagihan" className={input}>
                  {tagihan.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.judul} ({t.kode}) — Sisa {rupiah(t.sisa)} · Tempo {tanggal(t.jatuh_tempo)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <Label>Nominal Diterima (Rp)</Label>
                  <input
                    name="nominal"
                    type="number"
                    min={1}
                    defaultValue={tagihan[0]?.sisa}
                    required
                    className={`${input} font-semibold`}
                  />
                </label>
                <label className="block">
                  <Label>Metode Pembayaran</Label>
                  <select name="metode" className={input}>
                    <option value="tunai">Tunai</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="qris">QRIS</option>
                  </select>
                </label>
              </div>

              <div className="pt-2">
                <button className={`${tombol} w-full py-2.5`}>
                  <Ikon nama="cetak" className="h-4 w-4" />
                  <span>Catat Pembayaran & Buka Kwitansi</span>
                </button>
              </div>
            </form>
          </Kartu>
        )}
      </div>
    </>
  );
}

