import { TombolKirim } from "@/components-form";
import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { BarProgres, HeaderHalaman, Ikon, Kartu, Label, Lencana, PesanNotifikasi, input, tombol, tombolSekunder, Kosong } from "@/components-ui";
import { rupiah } from "@/lib/format";
import { waktuLengkap, tanggalLengkap } from "@/lib/waktu";
import { ambilKas, bacaRentang, ringkasKas } from "@/modules/keuangan/laporan";
import { batalkanBayar } from "../actions";

const NAMA_METODE: Record<string, string> = {
  tunai: "Tunai",
  transfer: "Transfer Bank",
  qris: "QRIS",
  online: "Online",
};

export default async function Laporan({
  searchParams,
}: {
  searchParams: Promise<{ dari?: string; sampai?: string; galat?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const { dari, sampai } = bacaRentang(sp.dari, sp.sampai);
  const { sb, peran } = await konteks();
  const baris = await ambilKas(sb, dari, sampai);
  const r = ringkasKas(baris);
  const boleh = peran === "admin" || peran === "bendahara";
  const balik = `/keuangan/laporan?dari=${dari}&sampai=${sampai}`;

  return (
    <>
      <HeaderHalaman
        judul="Laporan Kas"
        deskripsi={
          dari === sampai
            ? tanggalLengkap(dari)
            : `${tanggalLengkap(dari)} – ${tanggalLengkap(sampai)}`
        }
        aksi={
          <Link
            href={`/keuangan/laporan/ekspor?dari=${dari}&sampai=${sampai}`}
            className={tombolSekunder}
            prefetch={false}
          >
            <Ikon nama="unduh" className="h-3.5 w-3.5 text-emerald" />
            <span>Ekspor Excel</span>
          </Link>
        }
      />

      <PesanNotifikasi ok={sp.ok} galat={sp.galat} />

      {/* Filter Rentang Tanggal */}
      <Kartu className="mb-6 !p-3.5 print:hidden">
        <form className="flex flex-wrap items-end gap-3">
          <label className="block">
            <Label>Dari Tanggal</Label>
            <input name="dari" type="date" defaultValue={dari} className={`${input} w-44`} />
          </label>
          <label className="block">
            <Label>Sampai Tanggal</Label>
            <input name="sampai" type="date" defaultValue={sampai} className={`${input} w-44`} />
          </label>
          <TombolKirim>Tampilkan Laporan</TombolKirim>
        </form>
      </Kartu>

      {/* Kartu Ringkasan Kas: Hero Deep Forest + Proporsi Metode */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kartu varian="forest" className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-pale/85">Total Kas Masuk Bersih</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-pale">
              {r.jumlah} transaksi sah
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold tracking-tight text-white">{rupiah(r.total)}</div>
          <div className="mt-2 text-xs text-emerald-pale/75">
            {r.dibatalkan > 0
              ? `${r.dibatalkan} transaksi dibatalkan, tidak dihitung`
              : "Tidak ada yang dibatalkan"}
          </div>
        </Kartu>

        {Object.entries(r.perMetode).map(([m, n]) => (
          <Kartu key={m} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>Metode {NAMA_METODE[m] ?? m}</span>
                <span className="font-semibold text-ink">
                  {r.total > 0 ? `${Math.round((n / r.total) * 100)}%` : "0%"}
                </span>
              </div>
              <div className="mt-1.5 text-xl font-bold text-ink">{rupiah(n)}</div>
            </div>
            <div className="mt-3">
              <BarProgres nilai={n} maks={r.total || 1} />
            </div>
          </Kartu>
        ))}
      </div>

      {/* Tabel Jurnal Transaksi */}
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(24,38,34,0.03)]">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
            <tr>
              <th className="px-5 py-3">Waktu</th>
              <th className="px-4 py-3">No. Kwitansi</th>
              <th className="px-4 py-3">Santri</th>
              <th className="px-4 py-3">Untuk Tagihan</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3">Penerima</th>
              <th className="px-5 py-3 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {baris.map((b) => (
              <tr
                key={b.id}
                className={
                  b.batal
                    ? "bg-surface-soft/40 text-muted line-through"
                    : "transition hover:bg-surface-soft/60"
                }
              >
                <td className="px-5 py-3 text-xs text-muted">
                  {waktuLengkap(b.tanggal).replace(" WIB", "")}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/keuangan/kwitansi/${b.id}`}
                    className="font-mono text-xs font-semibold text-emerald hover:underline"
                  >
                    {b.nomor}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-ink">{b.santri}</td>
                <td className="px-4 py-3 text-muted">{b.tagihan}</td>
                <td className="px-4 py-3">
                  <Lencana varian={b.batal ? "belum" : "mint"} titik={false}>
                    {NAMA_METODE[b.metode] ?? b.metode}
                  </Lencana>
                </td>
                <td className="px-4 py-3 text-muted">{b.penerima}</td>
                <td className="px-5 py-3 text-right font-semibold text-ink">
                  {rupiah(b.nominal)}
                </td>
              </tr>
            ))}
            {baris.length === 0 && (
              <tr>
                <td colSpan={7}><Kosong judul="Belum ada transaksi" isi="Coba ubah rentang tanggal." /></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {boleh && baris.some((b) => !b.batal) && (
        <Kartu varian="soft" className="mt-5 !p-4 print:hidden">
          <details className="text-sm">
            <summary className="cursor-pointer font-semibold text-muted hover:text-ink">
              Batalkan pembayaran salah catat
            </summary>
            <form action={batalkanBayar} className="mt-3 flex flex-wrap items-center gap-2.5">
              <input type="hidden" name="balik" value={balik} />
              <select name="id" className={`${input} w-80`}>
                {baris
                  .filter((b) => !b.batal)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nomor} · {b.santri} · {rupiah(b.nominal)}
                    </option>
                  ))}
              </select>
              <input
                name="alasan"
                required
                placeholder="Tulis alasan pembatalan (wajib untuk audit)..."
                className={`${input} max-w-xs flex-1`}
              />
              <button className="rounded-lg border border-belum/30 bg-belum-bg px-4 py-2 text-xs font-semibold text-belum transition hover:bg-belum hover:text-white cursor-pointer">
                Batalkan Transaksi
              </button>
            </form>
          </details>
        </Kartu>
      )}
    </>
  );
}

