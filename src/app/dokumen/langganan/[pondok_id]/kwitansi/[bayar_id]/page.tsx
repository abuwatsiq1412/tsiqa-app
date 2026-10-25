import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { muatDataDokumenLangganan } from "../../muat-dokumen";
import { BarAlatDokumen } from "../../tombol-cetak";
import { rupiah, tanggalLengkap } from "@/lib/format";
import { terbilangRupiah } from "@/lib/harga-kesepakatan";

export const dynamic = "force-dynamic";

export default async function HalamanKwitansiLangganan({
  params,
}: {
  params: Promise<{ pondok_id: string; bayar_id: string }>;
}) {
  const { pondok_id: pondokId, bayar_id: bayarId } = await params;
  if (!/^[0-9a-f-]{36}$/.test(bayarId)) notFound();

  const data = await muatDataDokumenLangganan(pondokId);
  const db = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? supabaseAdmin()
    : await supabaseServer();

  const { data: bayar } = await db
    .from("pembayaran_langganan")
    .select("*")
    .eq("id", bayarId)
    .eq("pondok_id", pondokId)
    .maybeSingle();

  if (!bayar) notFound();

  const kembaliHref = data.staf ? `/konsol/pondok/${pondokId}` : "/modul";
  const nomorKwitansi = `KWT/TSIQA/${String(bayar.tanggal ?? "")
    .slice(0, 4)
    .replace(/[^0-9]/g, "") || new Date().getFullYear()}/${String(
    bayar.id
  )
    .slice(0, 8)
    .toUpperCase()}`;
  const jumlah = Number(bayar.jumlah ?? 0);
  const pimpinan =
    (data.pondok.nama_pimpinan as string | null)?.trim() || data.adminNama;

  return (
    <div className="min-h-screen bg-[#f4f2ec] pb-16 text-[#181713] print:bg-white print:pb-0">
      <style>{"@page { size: A4 portrait; margin: 10mm; }"}</style>
      <BarAlatDokumen
        pondokId={pondokId}
        aktif="kwitansi"
        kembaliHref={kembaliHref}
      />

      {/* Ukuran pas 1/2 Kertas A4 (A5 Landscape: ~190mm x 130mm) */}
      <main className="relative mx-auto mt-6 max-w-[200mm] overflow-hidden rounded-2xl border border-[#e3dfd4] bg-white px-6 py-5 shadow-sm print:mt-0 print:max-w-none print:rounded-none print:border print:border-[#d5d1c6] print:px-5 print:py-4 print:shadow-none">
        {/* KOP KWITANSI */}
        <header className="flex flex-col justify-between gap-3 border-b-2 border-[#047857] pb-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <img
              src="/logo-tsiqa.svg"
              alt="TSIQA"
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div>
              <img
                src="/tulisan-tsiqa.svg"
                alt="TSIQA"
                className="h-4 w-auto object-contain"
              />
              <p className="mt-0.5 text-[11px] font-medium text-[#525048]">
                Bukti Resmi Pembayaran Langganan Sistem Pondok Pesantren
              </p>
              <p className="text-[10px] text-[#6b685e]">
                WhatsApp Layanan Kemitraan: +62 823-7305-2600 · tsiqa.id
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block rounded bg-[#ecfdf5] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#047857] uppercase">
              Kwitansi Pembayaran Lunas
            </span>
            <p className="mt-1 font-mono text-xs font-semibold text-[#181713]">
              No: {nomorKwitansi}
            </p>
            <p className="text-[11px] text-[#6b685e]">
              Tanggal Bayar: {tanggalLengkap(String(bayar.tanggal))}
            </p>
          </div>
        </header>

        {/* ISI KWITANSI RINGKAS (A5 LANDSCAPE) */}
        <section className="mt-3.5 space-y-2 rounded-xl border border-[#e3dfd4] bg-[#faf9f5] px-4 py-3 text-xs">
          <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
            <span className="font-semibold text-[#6b685e]">
              Telah Terima Dari
            </span>
            <span className="font-display text-sm font-bold text-[#181713]">
              : {data.pondok.nama}
              {data.pondok.kota ? ` (${data.pondok.kota})` : ""} — Up.{" "}
              {pimpinan}
            </span>
          </div>

          <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
            <span className="font-semibold text-[#6b685e]">Uang Sejumlah</span>
            <span className="rounded border border-[#047857]/30 bg-[#ecfdf5] px-2.5 py-1 font-semibold text-[#065f46] italic">
              # {terbilangRupiah(jumlah)} #
            </span>
          </div>

          <div className="grid gap-1 sm:grid-cols-[150px_1fr]">
            <span className="font-semibold text-[#6b685e]">
              Untuk Pembayaran
            </span>
            <div className="space-y-0.5 text-[#181713]">
              <p className="font-semibold">
                : Langganan Sistem Informasi Pondok Pesantren TSIQA selama{" "}
                <span className="font-mono text-[#047857]">
                  {bayar.bulan} ({bayar.bulan === 12 ? "dua belas" : bayar.bulan}) bulan
                </span>
              </p>
              <p className="text-[11px] text-[#525048]">
                {bayar.catatan ? `Ref: ${bayar.catatan} · ` : ""}
                {(bayar.berakhir_baru || data.langganan?.berakhir) && (
                  <>
                    Aktif s/d:{" "}
                    <strong className="text-[#181713]">
                      {tanggalLengkap(
                        String(bayar.berakhir_baru ?? data.langganan?.berakhir)
                      )}
                    </strong>
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {/* NOMINAL & CAP LUNAS */}
        <section className="mt-3.5 flex items-end justify-between gap-4 border-t border-[#e3dfd4] pt-3">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-[#6b685e] uppercase">
              Total Nominal Diterima
            </p>
            <div className="mt-1 inline-block rounded-xl border-2 border-[#047857] bg-[#ecfdf5] px-4 py-1.5 font-mono text-xl font-bold text-[#047857]">
              {rupiah(jumlah)}
            </div>
          </div>

          <div className="text-right">
            <div className="mb-1.5 inline-flex -rotate-2 items-center gap-1.5 rounded border-2 border-[#047857] bg-[#ecfdf5] px-3 py-1 font-mono text-xs font-extrabold tracking-widest text-[#047857] uppercase">
              ✓ LUNAS TERVERIFIKASI
            </div>
            <p className="text-xs font-semibold text-[#181713] underline">
              Bagian Keuangan & Kemitraan TSIQA
            </p>
            <p className="text-[10px] text-[#6b685e]">
              ID: {String(bayar.id).slice(0, 13)}
            </p>
          </div>
        </section>
      </main>

      <div className="mx-auto mt-3 flex max-w-[200mm] items-center gap-2 px-4 text-[10px] text-[#6b685e] print:max-w-none print:px-0">
        <div className="flex-1 border-t border-dashed border-[#b5b0a2]" />
        <span>✂ Batas Potong Setengah Kertas A4 (A5 Landscape)</span>
        <div className="flex-1 border-t border-dashed border-[#b5b0a2]" />
      </div>
    </div>
  );
}
