import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../_components/logo";
import { EMAIL, WA_DISPLAY } from "../_lib/pricing";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — TSIQA",
  description: "Bagaimana TSIQA mengelola data pondok dan data santri.",
};

const BAGIAN: { judul: string; isi: string[] }[] = [
  {
    judul: "1. Data yang kami kelola",
    isi: [
      "Data pengurus pondok yang mendaftar (nama, kontak, dan akun masuk).",
      "Data yang dimasukkan pondok ke dalam sistem, seperti data santri, wali santri, kamar, kelas, tagihan, dan pembayaran.",
    ],
  },
  {
    judul: "2. Siapa pemilik data",
    isi: [
      "Data santri dan wali santri adalah milik pondok. TSIQA hanya mengelolanya atas nama pondok untuk menjalankan layanan.",
      "Kami tidak menjual atau menyewakan data pondok kepada pihak lain.",
    ],
  },
  {
    judul: "3. Penggunaan data",
    isi: [
      "Data digunakan semata-mata untuk menjalankan fitur yang diaktifkan pondok, memberikan dukungan, dan memperbaiki kendala teknis.",
      "Pengiriman pesan WhatsApp hanya dilakukan atas perintah pengurus pondok atau jadwal yang diatur pondok.",
    ],
  },
  {
    judul: "4. Akses dan keamanan",
    isi: [
      "Akses ke data dibatasi berdasarkan peran pengguna di dalam pondok (misalnya Pengasuh, Kepala TU, Bendahara, Musyrif).",
      "Kami menerapkan langkah pengamanan yang wajar untuk melindungi data, namun tidak ada sistem yang sepenuhnya bebas risiko. Pondok bertanggung jawab menjaga kerahasiaan kata sandi akun masing-masing.",
    ],
  },
  {
    judul: "5. Ekspor, penyimpanan, dan penghapusan",
    isi: [
      "Pondok dapat mengekspor seluruh data ke Excel kapan saja.",
      "Jika pondok berhenti berlangganan, data disimpan selama 90 hari agar dapat diunduh, kemudian dihapus.",
      "Pondok dapat meminta penghapusan data lebih awal dengan menghubungi kami.",
    ],
  },
  {
    judul: "6. Perubahan kebijakan",
    isi: [
      "TSIQA masih dalam akses awal. Kebijakan ini dapat diperbarui seiring berkembangnya layanan, dan perubahan penting akan kami sampaikan kepada pengguna terdaftar.",
    ],
  },
];

export default function PrivasiPage() {
  return (
    <div className="min-h-screen bg-ivory text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-[68px] max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="TSIQA, beranda" className="no-underline">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted no-underline hover:text-ink"
          >
            ← Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-14 sm:px-8 md:py-20">
        <h1 className="text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
          Kebijakan Privasi
        </h1>
        <p className="mt-3 text-sm text-muted">
          Terakhir diperbarui: 20 Oktober 2026
        </p>
        <p className="mt-6 text-base leading-relaxed text-muted">
          TSIQA menyimpan data yang berkaitan dengan anak-anak dan keluarga,
          sehingga kami menganggap amanah ini serius. Berikut ringkasan cara
          kami mengelola data.
        </p>

        <div className="mt-10 space-y-9">
          {BAGIAN.map((b) => (
            <section key={b.judul}>
              <h2 className="text-lg font-semibold">{b.judul}</h2>
              <ul className="mt-3 space-y-2.5">
                {b.isi.map((t) => (
                  <li
                    key={t}
                    className="text-[15px] leading-relaxed text-muted"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold">Pertanyaan tentang data?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Hubungi kami di{" "}
            <a
              href={`mailto:${EMAIL}`}
              className="font-semibold text-emerald underline underline-offset-4"
            >
              {EMAIL}
            </a>{" "}
            atau WhatsApp {WA_DISPLAY}.
          </p>
        </div>
      </main>
    </div>
  );
}
