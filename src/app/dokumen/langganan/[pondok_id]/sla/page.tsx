import { muatDataDokumenLangganan } from "../muat-dokumen";
import { BarAlatDokumen } from "../tombol-cetak";
import { rupiah, tanggalLengkap } from "@/lib/format";
import { BULAN_BAYAR_TAHUNAN } from "@/lib/harga";

export const dynamic = "force-dynamic";

export default async function HalamanSlaLangganan({
  params,
}: {
  params: Promise<{ pondok_id: string }>;
}) {
  const { pondok_id: pondokId } = await params;
  const data = await muatDataDokumenLangganan(pondokId);

  const kembaliHref = data.staf ? `/konsol/pondok/${pondokId}` : "/modul";
  const nomorSla = `SLA/TSIQA/${new Date().getFullYear()}/${String(
    data.pondok.kode ?? "PDK"
  ).toUpperCase()}`;
  const tanggalCetak = tanggalLengkap(new Date().toISOString().slice(0, 10));
  const pimpinan =
    (data.pondok.nama_pimpinan as string | null)?.trim() || data.adminNama;

  return (
    <div className="min-h-screen bg-[#f4f2ec] pb-16 text-[#181713] print:bg-white print:pb-0">
      <BarAlatDokumen
        pondokId={pondokId}
        aktif="sla"
        kembaliHref={kembaliHref}
      />

      <main className="mx-auto mt-6 max-w-4xl rounded-2xl border border-[#e3dfd4] bg-white p-6 shadow-sm sm:p-10 print:mt-0 print:max-w-none print:rounded-none print:border-0 print:p-6 print:shadow-none">
        {/* KOP PIAGAM */}
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
                Piagam Kesepakatan Layanan & Jaminan Amanah Data (SLA)
              </p>
              <p className="text-[11px] text-[#6b685e]">
                Dokumen Pegangan Resmi Yayasan & Pengurus Pondok Pesantren
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block rounded-md bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#047857] uppercase">
              Piagam Garansi Tsiqah
            </span>
            <p className="mt-1.5 font-mono text-xs font-semibold text-[#181713]">
              No: {nomorSla}
            </p>
            <p className="text-xs text-[#6b685e]">Tanggal: {tanggalCetak}</p>
          </div>
        </header>

        {/* PARA PIHAK */}
        <section className="mt-6 rounded-xl border border-[#e3dfd4] bg-[#faf9f5] p-4 text-xs leading-relaxed text-[#383630]">
          <p>
            Lembar Kesepakatan Layanan (<em>Service Level Agreement</em>) ini
            diterbitkan sebagai komitmen tertulis antara{" "}
            <strong>Manajemen Layanan TSIQA</strong> (&ldquo;Penyedia
            Sistem&rdquo;) dengan{" "}
            <strong>{data.pondok.nama}</strong>
            {data.pondok.kota ? ` (${data.pondok.kota})` : ""} yang diwakili oleh{" "}
            <strong>{pimpinan}</strong> (&ldquo;Mitra Pondok Pesantren&rdquo;)
            untuk menjamin keamanan, kemandirian data, dan kepastian biaya
            selama masa penggunaan sistem.
          </p>
        </section>

        {/* PASAL-PASAL SLA */}
        <section className="mt-6 space-y-4 text-xs leading-relaxed text-[#2b2923]">
          <div className="rounded-xl border border-[#e3dfd4] p-4">
            <h2 className="font-bold text-[#047857] uppercase">
              Pasal 1 · Kedaulatan & Kepemilikan Data Pondok
            </h2>
            <p className="mt-1.5">
              1. Seluruh data santri, wali santri, ustadz/guru, nilai akademik,
              catatan tahfizh, dan transaksi keuangan yang diinput ke dalam
              TSIQA adalah{" "}
              <strong>100% hak milik penuh {data.pondok.nama}</strong>.
              <br />
              2. TSIQA menjaga kerahasiaan data menggunakan isolasi basis data{" "}
              <em>Row-Level Security (RLS)</em> sehingga data antar-pondok
              terpisah secara ketat dan tidak pernah diperjualbelikan atau
              dibagikan kepada pihak ketiga mana pun.
              <br />
              3. Mitra Pondok Pesantren berhak mengunduh/mengekspor seluruh
              datanya kapan saja dalam format standar (Excel/CSV/PDF).
            </p>
          </div>

          <div className="rounded-xl border border-[#e3dfd4] p-4">
            <h2 className="font-bold text-[#047857] uppercase">
              Pasal 2 · Garansi 30 Hari Uang Kembali Utuh
            </h2>
            <p className="mt-1.5">
              1. Setiap pondok pesantren mendapatkan masa coba gratis 14 hari
              sebelum memutuskan berlangganan.
              <br />
              2. Setelah melakukan pembayaran langganan pertama, apabila dalam{" "}
              <strong>30 (tiga puluh) hari kalender</strong> pihak pondok merasa
              sistem tidak sesuai dengan kebutuhan operasional, TSIQA menjamin{" "}
              <strong>pengembalian dana 100% utuh tanpa potongan</strong>{" "}
              disertai bantuan ekspor seluruh data yang telah diinput.
            </p>
          </div>

          <div className="rounded-xl border border-[#e3dfd4] p-4">
            <h2 className="font-bold text-[#047857] uppercase">
              Pasal 3 · Perlindungan Masa Tenggang & Keamanan Data Saat Berhenti
            </h2>
            <p className="mt-1.5">
              1. Apabila masa aktif langganan berakhir dan belum diperpanjang,
              sistem memberikan{" "}
              <strong>Masa Tenggang 7 (tujuh) hari penuh</strong> di mana
              seluruh fitur tetap berjalan normal agar operasional pondok tidak
              terganggu mendadak.
              <br />
              2. Setelah masa tenggang lewat, akun beralih ke{" "}
              <strong>Mode Baca & Unduh</strong>: pengurus tidak dapat menambah
              input baru sementara waktu, namun seluruh data lama tetap utuh,
              aman, dan dapat dilihat/diunduh kapan pun.
            </p>
          </div>

          <div className="rounded-xl border border-[#e3dfd4] p-4">
            <h2 className="font-bold text-[#047857] uppercase">
              Pasal 4 · Rincian Kesepakatan Biaya Kemitraan
            </h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-[#faf9f5] p-3">
                <p className="text-[11px] text-[#6b685e]">Kuota & Modul Aktif</p>
                <p className="mt-0.5 font-semibold text-[#181713]">
                  Core ({data.kuota} santri) + {data.modulAktif.length} Modul
                </p>
              </div>
              <div className="rounded-lg bg-[#faf9f5] p-3">
                <p className="text-[11px] text-[#6b685e]">
                  Biaya Bulanan Efektif
                </p>
                <p className="mt-0.5 font-mono text-sm font-bold text-[#181713]">
                  {rupiah(data.bulananEfektif)} / bln
                </p>
              </div>
              <div className="rounded-lg bg-[#ecfdf5] p-3">
                <p className="text-[11px] text-[#065f46]">
                  Biaya Tahunan ({BULAN_BAYAR_TAHUNAN} Bulan · Gratis 1 Bulan)
                </p>
                <p className="mt-0.5 font-mono text-sm font-bold text-[#047857]">
                  {rupiah(data.tahunanEfektif)} / thn
                </p>
              </div>
            </div>
            {data.kesepakatan.catatan_harga && (
              <p className="mt-2 text-xs text-[#065f46]">
                <strong>Catatan Kesepakatan Khusus:</strong>{" "}
                {data.kesepakatan.catatan_harga}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-[#e3dfd4] p-4">
            <h2 className="font-bold text-[#047857] uppercase">
              Pasal 5 · Pendampingan & Dukungan Teknis
            </h2>
            <p className="mt-1.5">
              TSIQA menyediakan bantuan migrasi data awal santri dari Excel,
              panduan penggunaan untuk pengurus/ustadz, pembaruan fitur berkala,
              serta jalur komunikasi pendampingan langsung melalui WhatsApp
              Resmi <strong>+62 823-7305-2600</strong> tanpa biaya tambahan.
            </p>
          </div>
        </section>

        {/* TANDA TANGAN */}
        <footer className="mt-8 grid grid-cols-2 gap-8 border-t border-[#e3dfd4] pt-6 text-xs">
          <div>
            <p className="text-[#6b685e]">Pihak Mitra Pondok Pesantren,</p>
            <p className="font-semibold text-[#181713]">{data.pondok.nama}</p>
            <div className="h-16" />
            <p className="font-semibold text-[#181713] underline">{pimpinan}</p>
            <p className="text-[11px] text-[#6b685e]">
              Pimpinan / Pengurus Pondok
            </p>
          </div>

          <div className="text-right">
            <p className="text-[#6b685e]">Pihak Penyedia Sistem,</p>
            <p className="font-semibold text-[#181713]">
              Manajemen Layanan TSIQA
            </p>
            <div className="flex h-16 items-center justify-end">
              <span className="inline-block rounded border border-[#047857]/40 bg-[#ecfdf5] px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-[#047857] uppercase">
                GARANSI AMANAH TSIQA
              </span>
            </div>
            <p className="font-semibold text-[#181713] underline">
              Tim Kemitraan TSIQA
            </p>
            <p className="text-[11px] text-[#6b685e]">tsiqa.id</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
