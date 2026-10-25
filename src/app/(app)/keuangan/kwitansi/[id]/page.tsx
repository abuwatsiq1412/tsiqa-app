import { notFound } from "next/navigation";
import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { rupiah, terbilang } from "@/lib/format";
import { waktuLengkap } from "@/lib/waktu";
import { TombolCetak } from "@/components-cetak";
import { PesanNotifikasi, tombolSekunder, Ikon } from "@/components-ui";

const huruf = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default async function Kwitansi({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ format?: string; baru?: string }>;
}) {
  const { id } = await params;
  const { format = "a5", baru } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { sb } = await konteks();
  const { data: b } = await sb.from("pembayaran").select("*").eq("id", id).maybeSingle();
  if (!b) notFound();
  const [{ data: t }, { data: s }, { data: p }] = await Promise.all([
    sb.from("tagihan").select("judul, kode, nominal, terbayar, sisa").eq("id", b.tagihan_id).single(),
    sb.from("santri").select("nama, nis, nama_wali").eq("id", b.santri_id).single(),
    sb.from("pondok").select("nama, alamat, kota, telepon, nama_bendahara").eq("id", b.pondok_id).single(),
  ]);
  if (!t || !s || !p) notFound();

  const struk = format === "struk";
  const rangkap2 = format === "rangkap2";
  const a5Tunggal = !struk && !rangkap2;
  const batal = !!b.dibatalkan_pada;
  const sisa = Number(t.sisa);

  const LembarKwitansiA5 = ({ labelLembar }: { labelLembar?: string }) => (
    <div className="relative mx-auto w-full max-w-[200mm] rounded-xl border border-line bg-white px-6 py-4 text-[#181713] shadow-sm print:max-w-none print:rounded-none print:border print:border-[#d5d1c6] print:px-5 print:py-3.5 print:shadow-none">
      {batal && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-5xl font-bold tracking-widest text-belum/20 -rotate-12">
          DIBATALKAN
        </div>
      )}

      {/* Header Kop Pondok + Nomor Kwitansi (Horizontal Compact) */}
      <div className="flex items-start justify-between gap-4 border-b-2 border-emerald pb-2.5">
        <div>
          <div className="text-base font-extrabold tracking-tight text-emerald sm:text-lg">
            {p.nama}
          </div>
          {(p.alamat || p.kota || p.telepon) && (
            <div className="text-[11px] text-muted">
              {p.alamat}
              {p.kota ? `${p.alamat ? ", " : ""}${p.kota}` : ""}
              {p.telepon ? ` · Telp. ${p.telepon}` : ""}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1.5">
            {labelLembar && (
              <span className="rounded border border-line bg-surface-soft px-2 py-0.5 text-[10px] font-semibold text-muted">
                {labelLembar}
              </span>
            )}
            <span className="rounded bg-emerald-pale px-2 py-0.5 text-[11px] font-bold tracking-wider text-emerald uppercase">
              Kwitansi Pembayaran
            </span>
          </div>
          <div className="mt-1 font-mono text-xs font-semibold text-ink">
            No. {b.nomor_kwitansi}
          </div>
        </div>
      </div>

      {/* Isi Kwitansi A5 Landscape */}
      <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-[135px_1fr]">
        <div className="font-medium text-muted">Telah terima dari</div>
        <div className="text-ink">
          : <strong>{s.nama_wali || `Wali dari ${s.nama}`}</strong>{" "}
          <span className="text-muted">
            (Santri: <strong className="text-ink">{s.nama}</strong> · NIS {s.nis})
          </span>
        </div>

        <div className="font-medium text-muted">Terbilang</div>
        <div className="rounded bg-surface-soft/80 px-2.5 py-1 font-medium text-ink italic">
          # {huruf(terbilang(Number(b.nominal)))} #
        </div>

        <div className="font-medium text-muted">Untuk pembayaran</div>
        <div className="text-ink">
          : <strong>{t.judul}</strong>{" "}
          <span className="font-mono text-[11px] text-muted">({t.kode})</span>
        </div>

        <div className="font-medium text-muted">Metode & Sisa</div>
        <div className="text-ink">
          : {huruf(b.metode)} · Sisa tagihan:{" "}
          <strong className={sisa === 0 ? "text-emerald" : "text-ink"}>
            {rupiah(sisa)}
            {sisa === 0 ? " (LUNAS)" : ""}
          </strong>
        </div>
      </div>

      {/* Footer: Kotak Nominal di Kiri + Tanda Tangan di Kanan */}
      <div className="mt-3.5 flex items-end justify-between gap-4 border-t border-line pt-2.5 text-xs">
        <div>
          <div className="text-[10px] font-semibold tracking-wider text-muted uppercase">
            Jumlah Diterima
          </div>
          <div className="mt-1 inline-block rounded-lg border-2 border-emerald bg-emerald-pale/60 px-4 py-1.5 font-mono text-lg font-extrabold text-emerald">
            {rupiah(Number(b.nominal))}
          </div>
          {batal && (
            <div className="mt-1 text-[11px] font-semibold text-belum">
              Dibatalkan: {b.alasan_batal}
            </div>
          )}
        </div>

        <div className="text-right">
          <div className="text-[11px] text-muted">{waktuLengkap(b.tanggal)}</div>
          <div className="text-[11px] text-muted">Petugas Penerima,</div>
          <div className="h-8" />
          <div className="font-semibold text-ink underline">{b.penerima_nama}</div>
          {p.nama_bendahara && (
            <div className="text-[10px] text-muted">Bendahara: {p.nama_bendahara}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <style>
        {struk
          ? "@page { size: 80mm auto; margin: 3mm; }"
          : "@page { size: A4 portrait; margin: 10mm; }"}
      </style>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 print:hidden">
        <Link href={`/keuangan/tagihan/${b.tagihan_id}`} className={tombolSekunder}>
          <Ikon.PanahKiri className="h-4 w-4" />
          Kembali ke Tagihan
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border border-line bg-white p-1 text-xs">
            <Link
              href="?format=a5"
              className={`rounded px-3 py-1.5 font-medium transition ${
                a5Tunggal ? "bg-emerald text-white shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              A5 Landscape (1/2 A4)
            </Link>
            <Link
              href="?format=rangkap2"
              className={`rounded px-3 py-1.5 font-medium transition ${
                rangkap2 ? "bg-emerald text-white shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              2 Rangkap (1 Lembar A4)
            </Link>
            <Link
              href="?format=struk"
              className={`rounded px-3 py-1.5 font-medium transition ${
                struk ? "bg-emerald text-white shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              Struk Thermal 80mm
            </Link>
          </div>
          <TombolCetak />
        </div>
      </div>

      {baru && !batal && (
        <div className="print:hidden">
          <PesanNotifikasi
            tipe="sukses"
            pesan="Pembayaran berhasil dicatat ke dalam buku kas. Kwitansi siap dicetak (ukuran 1/2 A4 / A5 Landscape)."
          />
        </div>
      )}

      {struk ? (
        <div className="mx-auto w-[80mm] border border-line bg-white p-4 text-[12px] leading-snug shadow-sm print:border-0 print:p-0 print:shadow-none">
          <div className="text-center">
            <div className="text-sm font-bold text-ink">{p.nama}</div>
            {p.alamat && (
              <div className="text-muted">
                {p.alamat}
                {p.kota ? `, ${p.kota}` : ""}
              </div>
            )}
            {p.telepon && <div className="text-muted">Telp. {p.telepon}</div>}
          </div>
          <div className="my-2 border-t border-dashed border-line" />
          <div className="text-center font-bold tracking-wide text-ink">
            KWITANSI{batal ? " (DIBATALKAN)" : ""}
          </div>
          <div className="text-center font-mono text-[11px] text-muted">{b.nomor_kwitansi}</div>
          <div className="my-2 border-t border-dashed border-line" />
          <div className="text-muted">{waktuLengkap(b.tanggal)}</div>
          <div>
            Santri: <b className="text-ink">{s.nama}</b> ({s.nis})
          </div>
          <div>
            Wali: <span className="text-ink">{s.nama_wali}</span>
          </div>
          <div>
            Untuk: <span className="text-ink">{t.judul}</span>
          </div>
          <div className="my-2 border-t border-dashed border-line" />
          <div className="flex justify-between text-sm font-bold text-ink">
            <span>Dibayar</span>
            <span>{rupiah(Number(b.nominal))}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Metode</span>
            <span className="text-ink">{huruf(b.metode)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Sisa Tagihan</span>
            <span className="text-ink">{rupiah(sisa)}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted italic">
            {huruf(terbilang(Number(b.nominal)))}
          </div>
          <div className="my-2 border-t border-dashed border-line" />
          <div className="text-center text-muted">
            Penerima: <span className="font-medium text-ink">{b.penerima_nama}</span>
          </div>
          {batal && (
            <div className="mt-1 text-center font-semibold text-belum">
              Dibatalkan: {b.alasan_batal}
            </div>
          )}
          <div className="mt-2 text-center text-[11px] text-muted">
            Terima kasih. Jazakumullahu khairan.
          </div>
        </div>
      ) : rangkap2 ? (
        <div className="space-y-4 print:space-y-3">
          <LembarKwitansiA5 labelLembar="Lembar 1 · Untuk Wali Santri" />
          <div className="mx-auto flex max-w-[200mm] items-center gap-2 text-[10px] text-muted print:max-w-none">
            <div className="flex-1 border-t border-dashed border-muted/60" />
            <span>✂ Potong di sini (Setengah Kertas A4 / A5 Landscape)</span>
            <div className="flex-1 border-t border-dashed border-muted/60" />
          </div>
          <LembarKwitansiA5 labelLembar="Lembar 2 · Arsip Bendahara Pondok" />
        </div>
      ) : (
        <div className="space-y-3">
          <LembarKwitansiA5 />
          <div className="mx-auto flex max-w-[200mm] items-center gap-2 text-[10px] text-muted print:flex print:max-w-none">
            <div className="flex-1 border-t border-dashed border-muted/50" />
            <span>✂ Batas Potong Setengah Kertas A4 (A5 Landscape)</span>
            <div className="flex-1 border-t border-dashed border-muted/50" />
          </div>
        </div>
      )}
    </div>
  );
}
