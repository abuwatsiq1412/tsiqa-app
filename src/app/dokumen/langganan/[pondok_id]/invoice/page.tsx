import { muatDataDokumenLangganan } from "../muat-dokumen";
import { BarAlatDokumen } from "../tombol-cetak";
import { rupiah, tanggalLengkap } from "@/lib/format";
import { terbilangRupiah } from "@/lib/harga-kesepakatan";
import { BULAN_BAYAR_TAHUNAN } from "@/lib/harga";

export const dynamic = "force-dynamic";

export default async function HalamanInvoiceLangganan({
  params,
}: {
  params: Promise<{ pondok_id: string }>;
}) {
  const { pondok_id: pondokId } = await params;
  const data = await muatDataDokumenLangganan(pondokId);

  const kembaliHref = data.staf ? `/konsol/pondok/${pondokId}` : "/modul";
  const nomorDokumen = `INV/TSIQA/${new Date().getFullYear()}/${String(
    data.pondok.kode ?? "PDK"
  ).toUpperCase()}`;
  const tanggalCetak = tanggalLengkap(new Date().toISOString().slice(0, 10));
  const pimpinan =
    (data.pondok.nama_pimpinan as string | null)?.trim() || data.adminNama;

  return (
    <div className="min-h-screen bg-[#f4f2ec] pb-16 text-[#181713] print:bg-white print:pb-0">
      <BarAlatDokumen
        pondokId={pondokId}
        aktif="invoice"
        kembaliHref={kembaliHref}
      />

      <main className="mx-auto mt-6 max-w-4xl rounded-2xl border border-[#e3dfd4] bg-white p-6 shadow-sm sm:p-10 print:mt-0 print:max-w-none print:rounded-none print:border-0 print:p-6 print:shadow-none">
        {/* KOP SURAT TSIQA */}
        <header className="flex flex-col justify-between gap-4 border-b-2 border-[#047857] pb-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <img
              src="/logo-tsiqa.svg"
              alt="TSIQA"
              className="h-12 w-12 shrink-0 object-contain"
            />
            <div>
              <img
                src="/tulisan-tsiqa.svg"
                alt="TSIQA"
                className="h-5 w-auto object-contain"
              />
              <p className="mt-1 text-xs font-medium text-[#525048]">
                Sistem Informasi & Tata Kelola Pondok Pesantren Amanah
              </p>
              <p className="text-[11px] text-[#6b685e]">
                Layanan Kemitraan Pesantren · WhatsApp Resmi: +62 823-7305-2600
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block rounded-md border border-[#047857]/30 bg-[#ecfdf5] px-2.5 py-1 text-xs font-semibold text-[#047857]">
              Surat Penawaran & Tagihan
            </span>
            <p className="mt-1.5 font-mono text-xs font-semibold text-[#181713]">
              No: {nomorDokumen}
            </p>
            <p className="text-xs text-[#6b685e]">Tanggal: {tanggalCetak}</p>
          </div>
        </header>

        {/* TUJUAN SURAT */}
        <section className="mt-6 grid gap-4 rounded-xl border border-[#e3dfd4] bg-[#faf9f5] p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[#6b685e]">
              Kepada Yth. Pimpinan / Pengurus
            </p>
            <p className="mt-1 font-display text-lg font-bold text-[#181713]">
              {data.pondok.nama}
            </p>
            <p className="mt-0.5 text-xs text-[#525048]">
              Up. {pimpinan}
              {data.pondok.kota ? ` · ${data.pondok.kota}` : ""}
            </p>
            {data.pondok.telepon && (
              <p className="mt-0.5 font-mono text-xs text-[#6b685e]">
                Kontak: {data.pondok.telepon}
              </p>
            )}
          </div>

          <div className="sm:text-right">
            <p className="text-xs font-medium text-[#6b685e]">
              Identitas Sistem Pondok
            </p>
            <p className="mt-1 text-xs text-[#181713]">
              Kode Pondok:{" "}
              <span className="font-mono font-semibold">{data.pondok.kode}</span>
            </p>
            <p className="mt-0.5 text-xs text-[#181713]">
              Kapasitas Kuota:{" "}
              <span className="font-mono font-semibold">
                {data.kuota} santri aktif
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[#181713]">
              Status Saat Ini:{" "}
              <span className="font-semibold capitalize">{data.akses}</span>
            </p>
          </div>
        </section>

        {/* RINCIAN PAKET & MODUL */}
        <section className="mt-6">
          <h2 className="text-xs font-semibold text-[#525048]">
            1. Rincian Komponen Layanan Aktif
          </h2>
          <div className="mt-2.5 overflow-hidden rounded-xl border border-[#e3dfd4]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e3dfd4] bg-[#f4f2ec] text-xs font-medium text-[#525048]">
                <tr>
                  <th className="px-4 py-2.5">Komponen Layanan</th>
                  <th className="px-4 py-2.5">Keterangan</th>
                  <th className="px-4 py-2.5 text-right">Biaya Bulanan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3dfd4]">
                <tr>
                  <td className="px-4 py-3 font-semibold text-[#181713]">
                    TSIQA Core (Fondasi Administrasi)
                  </td>
                  <td className="px-4 py-3 text-[#525048]">
                    Buku Induk Santri, Kamar & Kelas, Keuangan Dasar, Kwitansi,
                    Multi-Pengurus (Kuota {data.kuota} santri aktif)
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-[#181713]">
                    {rupiah(data.biayaCore)}
                  </td>
                </tr>

                {data.modulAktif.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-2.5 text-[#6b685e] italic"
                    >
                      Belum ada modul tambahan (Add-On) yang dipilih
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[#6b685e]">
                      Rp0
                    </td>
                  </tr>
                ) : (
                  data.modulAktif.map((m) => (
                    <tr key={String(m.kode)}>
                      <td className="px-4 py-2.5 font-medium text-[#181713]">
                        + Modul {m.nama}
                      </td>
                      <td className="px-4 py-2.5 text-[#525048]">
                        Kategori {m.kategori}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-[#181713]">
                        {rupiah(Number(m.harga_bulanan))}
                      </td>
                    </tr>
                  ))
                )}

                {data.diskon.persenDiskon > 0 && (
                  <tr className="bg-[#ecfdf5]/50 text-[#047857]">
                    <td colSpan={2} className="px-4 py-2.5 font-medium">
                      Potongan Paket Modul ({data.diskon.jumlah} modul aktif
                      · Diskon {Math.round(data.diskon.persenDiskon * 100)}%)
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">
                      −{rupiah(data.diskon.nominalDiskon)}
                    </td>
                  </tr>
                )}

                <tr className="bg-[#faf9f5] font-semibold">
                  <td colSpan={2} className="px-4 py-3 text-[#181713]">
                    Total Tarif Standar per Bulan
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      data.kesepakatan.harga_khusus !== null
                        ? "text-[#6b685e] line-through"
                        : "text-sm font-bold text-[#181713]"
                    }`}
                  >
                    {rupiah(data.bulananStandar)}
                  </td>
                </tr>

                {data.kesepakatan.harga_khusus !== null && (
                  <tr className="bg-[#ecfdf5] text-[#047857]">
                    <td colSpan={2} className="px-4 py-3">
                      <p className="font-bold">
                        Harga Kesepakatan Khusus Kemitraan Pondok
                      </p>
                      {data.kesepakatan.catatan_harga && (
                        <p className="mt-0.5 text-[11px] text-[#065f46]">
                          Catatan Kesepakatan: {data.kesepakatan.catatan_harga}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm font-bold">
                      {rupiah(data.bulananEfektif)} / bln
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* PILIHAN SIKLUS PEMBAYARAN */}
        <section className="mt-6">
          <h2 className="text-xs font-semibold text-[#525048]">
            2. Pilihan Siklus Pembayaran
          </h2>
          <div className="mt-2.5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e3dfd4] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#181713]">
                  Opsi A · Siklus Bulanan
                </span>
                <span className="rounded bg-[#f4f2ec] px-2 py-0.5 text-[10px] font-semibold text-[#525048]">
                  Fleksibel
                </span>
              </div>
              <p className="mt-2 font-mono text-2xl font-bold text-[#181713]">
                {rupiah(data.bulananEfektif)}
                <span className="text-xs font-normal text-[#6b685e]">
                  {" "}
                  / bulan
                </span>
              </p>
              <p className="mt-1 text-[11px] text-[#6b685e] italic">
                Terbilang: {terbilangRupiah(data.bulananEfektif)}
              </p>
              <p className="mt-2 text-xs text-[#525048]">
                Diperpanjang setiap bulan sesuai modul yang aktif digunakan.
              </p>
            </div>

            <div className="rounded-xl border-2 border-[#047857] bg-[#ecfdf5]/40 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#047857]">
                  Opsi B · Siklus Tahunan (12 Bulan)
                </span>
                <span className="rounded bg-[#047857] px-2 py-0.5 text-[10px] font-semibold text-white">
                  Bayar {BULAN_BAYAR_TAHUNAN} Bulan · Gratis 1 Bulan
                </span>
              </div>
              <p className="mt-2 font-mono text-2xl font-bold text-[#047857]">
                {rupiah(data.tahunanEfektif)}
                <span className="text-xs font-normal text-[#065f46]">
                  {" "}
                  / tahun
                </span>
              </p>
              <p className="mt-1 text-[11px] text-[#065f46] italic">
                Terbilang: {terbilangRupiah(data.tahunanEfektif)}
              </p>
              <p className="mt-2 text-xs font-medium text-[#065f46]">
                Hemat langsung{" "}
                <span className="font-mono font-bold">
                  {rupiah(data.hematTahunan)}
                </span>{" "}
                (1 bulan gratis penuh) untuk masa aktif 12 bulan.
              </p>
            </div>
          </div>
        </section>

        {/* PROSEDUR KONFIRMASI & GARANSI */}
        <section className="mt-6 grid gap-4 rounded-xl border border-[#e3dfd4] bg-[#faf9f5] p-4 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold text-[#181713]">
              Prosedur Pembayaran & Aktivasi
            </h3>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-[#525048]">
              <li>
                Pilih siklus pembayaran yang disepakati (Bulanan atau Tahunan).
              </li>
              <li>
                Konfirmasi melalui WhatsApp Resmi TSIQA di{" "}
                <strong className="font-mono text-[#181713]">
                  0823-7305-2600
                </strong>{" "}
                untuk informasi rekening transfer resmi kemitraan.
              </li>
              <li>
                Setelah pembayaran diterima, Admin TSIQA mengaktifkan masa
                langganan dan menerbitkan <strong>Kwitansi Resmi Lunas</strong>{" "}
                yang dapat diunduh langsung dari aplikasi pondok.
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#181713]">
              Komitmen & Garansi Amanah TSIQA
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[#525048]">
              <li>
                <strong>Garansi 30 Hari Uang Kembali 100%:</strong> Jika dalam
                30 hari pertama pondok merasa sistem tidak cocok, dana
                dikembalikan utuh tanpa potongan.
              </li>
              <li>
                <strong>Hak Milik Data Penuh:</strong> Seluruh data santri &
                keuangan adalah milik pondok dan dapat diekspor kapan saja.
              </li>
              <li>
                <strong>Bebas Biaya Setup:</strong> Pendampingan awal dan
                migrasi data santri dari Excel dibantu gratis.
              </li>
            </ul>
          </div>
        </section>

        {/* TANDA TANGAN */}
        <footer className="mt-8 grid grid-cols-2 gap-8 border-t border-[#e3dfd4] pt-6 text-xs">
          <div>
            <p className="text-[#6b685e]">Mengetahui / Menyetujui,</p>
            <p className="font-semibold text-[#181713]">
              Pimpinan / Pengurus {data.pondok.nama}
            </p>
            <div className="h-16" />
            <p className="font-semibold text-[#181713] underline">{pimpinan}</p>
            <p className="text-[11px] text-[#6b685e]">Pihak Pondok Pesantren</p>
          </div>

          <div className="text-right">
            <p className="text-[#6b685e]">Diterbitkan secara resmi oleh,</p>
            <p className="font-semibold text-[#181713]">
              Tim Kemitraan & Layanan TSIQA
            </p>
            <div className="flex h-16 items-center justify-end">
              <span className="inline-block rounded border border-[#047857]/40 bg-[#ecfdf5] px-3 py-1 font-mono text-[11px] font-semibold text-[#047857]">
                Dokumen Resmi Terverifikasi
              </span>
            </div>
            <p className="font-semibold text-[#181713] underline">
              Manajemen Kemitraan TSIQA
            </p>
            <p className="text-[11px] text-[#6b685e]">tsiqa.id</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
