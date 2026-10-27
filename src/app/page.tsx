import type { Metadata } from "next";
import Link from "next/link";
import { HeroMock } from "./_components/hero-mock";
import { Icon, type IconName } from "./_components/icons";
import { Logo } from "./_components/logo";
import { MobileNav } from "./_components/mobile-nav";
import { Pricing } from "./_components/pricing";
import { ProductTour } from "./_components/product-tour";
import { Reveal } from "./_components/reveal";
import { StarPattern } from "./_components/star-pattern";
import { ButtonLink, Eyebrow } from "./_components/ui";
import {
  CORE_HARGA_DASAR,
  EMAIL,
  WA_DISPLAY,
  rupiah,
  waLink,
} from "./_lib/pricing";

export const metadata: Metadata = {
  title: "TSIQA — Sistem Manajemen Pondok Pesantren",
  description:
    "Kelola santri, kamar, syahriah, dan kabar untuk wali santri dalam satu sistem. Mulai Rp59.000 per bulan, dengan Garansi Tsiqah uang kembali 30 hari.",
};

const NAV = [
  { href: "#masalah", label: "Mengapa TSIQA" },
  { href: "#fitur", label: "Fitur" },
  { href: "#harga", label: "Harga" },
  { href: "#garansi", label: "Garansi" },
  { href: "#faq", label: "FAQ" },
];

const WA_UMUM = waLink(
  "Assalamu’alaikum, saya ingin bertanya tentang TSIQA untuk pondok kami."
);
const WA_PILOT = waLink(
  "Assalamu’alaikum, kami tertarik menjadi pondok pilot TSIQA. Mohon informasinya."
);

/* Ukuran judul bagian & jarak antar bagian — responsif untuk HP & Desktop */
const H2 =
  "mt-1.5 text-[19px] font-bold leading-snug tracking-[-0.025em] sm:mt-2.5 sm:text-2xl lg:text-[30px] lg:leading-tight";
const SEKSI = "py-10 sm:py-14 md:py-20";
const WADAH = "mx-auto max-w-6xl px-4 sm:px-8";
const STICKY = "stick";

const MASALAH: {
  icon: IconName;
  judul: string;
  lama: string;
  baru: string;
}[] = [
  {
    icon: "users",
    judul: "Data santri, kamar, dan kelas",
    lama: "Tersebar di beberapa file Excel dan buku induk. Alumni bercampur dengan santri aktif.",
    baru: "Satu buku induk digital. Alumni tersimpan terpisah dan tidak memakan kuota.",
  },
  {
    icon: "wallet",
    judul: "Syahriah, cicilan, dan keringanan",
    lama: "Rekap manual di akhir bulan, kwitansi ditulis tangan, potongan yatim dihitung satu per satu.",
    baru: "Tagihan tercatat, pembayaran terekam, kwitansi tercetak, keringanan diatur per santri.",
  },
  {
    icon: "message",
    judul: "Kabar untuk wali santri",
    lama: "Mengetik pengingat satu per satu setiap awal bulan, lalu merekap siapa yang sudah membalas.",
    baru: "Pengingat WhatsApp 1-klik (gratis di Core), atau terjadwal otomatis dengan modul WhatsApp.",
  },
];

const PEMBEDA: { icon: IconName; judul: string; isi: string }[] = [
  {
    icon: "users",
    judul: "Alumni tidak memakan kuota",
    isi: "Kuota hanya menghitung santri aktif. Data alumni tetap tersimpan tanpa tambahan biaya.",
  },
  {
    icon: "heart",
    judul: "Keringanan yatim dan beasiswa",
    isi: "Atur potongan nominal atau persen per santri tanpa merusak rekap keuangan utama.",
  },
  {
    icon: "upload",
    judul: "Impor dari Excel",
    isi: "Unduh template, salin data lama, unggah. Sistem memeriksa NIS ganda dan data wali.",
  },
  {
    icon: "clock",
    judul: "Masa tenggang 7 hari",
    isi: "Terlambat memperpanjang langganan? Operasional pondok tidak langsung terkunci.",
  },
  {
    icon: "lock",
    judul: "Akses sesuai peran",
    isi: "Pengasuh, Kepala TU, Bendahara, dan Musyrif hanya melihat yang menjadi tugasnya.",
  },
  {
    icon: "download",
    judul: "Data milik pondok",
    isi: "Seluruh data dapat diekspor ke Excel kapan saja, termasuk setelah berhenti berlangganan.",
  },
];

const JANJI: { icon: IconName; judul: string; isi: string }[] = [
  {
    icon: "wallet",
    judul: "Uang kembali 30 hari",
    isi: "Jika dalam 30 hari pertama pondok merasa belum cocok, biaya langganan pertama kami kembalikan penuh.",
  },
  {
    icon: "download",
    judul: "Data tetap milik pondok",
    isi: "Ekspor seluruh data ke Excel kapan saja. Setelah berhenti berlangganan, data tersimpan 90 hari sebelum dihapus.",
  },
  {
    icon: "message",
    judul: "Kendala ditangani maksimal 2 hari kerja",
    isi: "Laporkan lewat WhatsApp. Setiap kendala kami tangani paling lambat dalam 2 hari kerja.",
  },
];

const SYARAT = [
  "Garansi uang kembali berlaku satu kali per pondok, hanya untuk biaya langganan. Biaya setup tidak dikembalikan.",
  "Setelah 30 hari, berhenti berlangganan tidak mengembalikan sisa periode. Layanan tetap berjalan sampai periode berakhir.",
  "Harga terkunci selama periode langganan yang sedang berjalan.",
  "Pondok yang berhenti lalu kembali berlangganan tidak mendapat garansi uang kembali lagi.",
];

const FAQ = [
  {
    q: "Mengapa TSIQA dibanding aplikasi lain begitu terjangkau?",
    a: "TSIQA disusun modular. Pondok cukup memulai dari Core (Rp59.000 per bulan untuk 150 santri aktif) dan menyalakan modul hanya saat dibutuhkan, sehingga tidak membayar fitur yang belum terpakai. Mengambil 3–4 modul mendapat diskon 10%, dan 5 modul atau lebih mendapat diskon 15%. Bayar tahunan cukup 11 bulan (gratis 1 bulan).",
  },
  {
    q: "Aplikasinya masih akses awal. Apakah aman dipakai?",
    a: "Pendaftaran dan login sudah dapat dipakai, tetapi TSIQA masih terus dikembangkan dan beberapa fitur akan bertambah. Karena itu kami menyiapkan Garansi Tsiqah: uang kembali 30 hari, data dapat diekspor kapan saja, dan kendala ditangani maksimal 2 hari kerja. Masukan pondok pilot langsung memengaruhi arah pengembangan.",
  },
  {
    q: "Apakah biaya setup wajib?",
    a: "Tidak wajib dan tidak termasuk dalam harga langganan. Jika admin pondok mengisi sendiri memakai template Excel, biaya setup Rp0. Jika ingin dibantu, tim kami menyiapkan database, mengimpor data santri dari Excel atau buku lama sampai tuntas, dan melatih admin TU lewat Zoom atau WhatsApp, dengan biaya Rp1.000 per santri (minimum charge Rp150.000).",
  },
  {
    q: "Apakah alumni ikut memakan kuota santri aktif?",
    a: "Tidak. Kuota hanya menghitung santri berstatus aktif. Data alumni tetap tersimpan di buku induk tanpa menambah tagihan.",
  },
  {
    q: "Bagaimana jika pondok belum memakai modul WhatsApp Auto-Bot?",
    a: "Pengingat WhatsApp 1-klik sudah tersedia gratis di paket Core. Modul WhatsApp Auto-Bot (Rp20.000 per bulan) hanya diperlukan jika pondok ingin pengiriman massal yang terjadwal dan berjalan otomatis.",
  },
  {
    q: "Bagaimana dengan santri yatim atau penerima beasiswa?",
    a: "Modul keuangan menyediakan fitur Keringanan dan Beasiswa. Bendahara dapat menetapkan potongan nominal atau persen untuk santri tertentu tanpa merusak rekap pembukuan utama.",
  },
  {
    q: "Data pondok sebenarnya milik siapa?",
    a: "Milik pondok. Seluruh data dapat diekspor ke Excel kapan saja. Jika pondok berhenti berlangganan, data tetap kami simpan selama 90 hari sebelum dihapus, sehingga ada waktu cukup untuk mengunduhnya.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-ivory text-ink selection:bg-emerald-pale selection:text-emerald">
      <a
        href="#konten"
        className="sr-only z-[60] rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Lewati ke konten
      </a>

      {/* ============================ NAVBAR ============================ */}
      <header className="sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" aria-label="TSIQA, beranda" className="no-underline">
              <Logo />
            </Link>
            <nav
              aria-label="Navigasi utama"
              className="hidden items-center gap-1 lg:flex"
            >
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-muted no-underline transition-all duration-200 hover:bg-surface-soft hover:text-ink"
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/masuk"
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink no-underline transition hover:bg-surface-soft sm:inline-flex"
            >
              Masuk
            </Link>
            <Link
              href="/daftar"
              className="group inline-flex h-8.5 items-center gap-1.5 rounded-full bg-ink px-3.5 text-xs font-semibold text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald hover:shadow-[0_12px_24px_-10px_rgba(15,118,110,0.6)] active:scale-[0.97] sm:h-10 sm:px-5 sm:text-sm"
            >
              <span>Daftar Pondok</span>
              <Icon
                name="arrow-right"
                className="size-3 transition-transform group-hover:translate-x-0.5 sm:size-3.5"
              />
            </Link>
            <MobileNav links={NAV} />
          </div>
        </div>
      </header>

      <main id="konten">
        {/* ============================= HERO ============================ */}
        <section className="relative overflow-hidden bg-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_80%_at_70%_20%,#000_20%,transparent_75%)]"
          >
            <StarPattern id="pola-hero" className="text-emerald opacity-[0.07]" />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-28 bg-linear-to-b from-emerald-pale/60 to-transparent sm:h-32"
          />

          <div
            className={`relative ${WADAH} grid items-center gap-6 pb-8 pt-5 sm:gap-10 sm:pb-12 sm:pt-7 md:pb-16 md:pt-9 lg:grid-cols-12`}
          >
            <div className="lg:col-span-6">
              <h1
                className="animate-rise text-[22px] font-bold leading-[1.2] tracking-[-0.03em] text-ink sm:text-4xl sm:leading-[1.12] lg:text-[44px]"
                style={{ animationDelay: "80ms" }}
              >
                Administrasi pondok yang{" "}
                <span className="bg-[linear-gradient(transparent_64%,var(--color-gold-soft)_64%)]">
                  tertib
                </span>
                , dari tagihan syahriah hingga kabar untuk wali santri.
              </h1>

              <p
                className="animate-rise mt-3 max-w-[33rem] text-[13.5px] leading-relaxed text-muted sm:mt-4 sm:text-[17px]"
                style={{ animationDelay: "160ms" }}
              >
                Catat santri, kamar, dan pembayaran dalam satu sistem, lalu
                kirim pengingat ke wali santri lewat WhatsApp. Mulai{" "}
                <strong className="font-semibold text-ink">
                  {rupiah(CORE_HARGA_DASAR)}
                </strong>{" "}
                per bulan untuk 150 santri aktif.
              </p>

              <div
                className="animate-rise mt-4 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-4"
                style={{ animationDelay: "240ms" }}
              >
                <ButtonLink href="/daftar">
                  Daftar Pondok
                  <Icon
                    name="arrow-right"
                    className="size-3.5 transition-transform group-hover:translate-x-0.5 sm:size-4"
                  />
                </ButtonLink>
                <ButtonLink href={WA_PILOT} variant="outline">
                  <Icon name="message" className="size-3.5 text-emerald sm:size-4" />
                  Tanya lewat WhatsApp
                </ButtonLink>
              </div>

              <p
                className="animate-rise mt-3.5 text-xs text-muted sm:mt-5 sm:text-sm"
                style={{ animationDelay: "320ms" }}
              >
                Dilindungi{" "}
                <a
                  href="#garansi"
                  className="font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-emerald"
                >
                  Garansi Tsiqah
                </a>
                : uang kembali 30 hari.
              </p>
            </div>

            <div
              className="animate-rise lg:col-span-6"
              style={{ animationDelay: "200ms" }}
            >
              <HeroMock />
            </div>
          </div>
        </section>

        {/* ========================== MENGAPA TSIQA ====================== */}
        <section id="masalah" className={`border-t border-line bg-white ${SEKSI}`}>
          <div className={WADAH}>
            <Reveal>
              <div className="max-w-2xl">
                <Eyebrow>Mengapa TSIQA</Eyebrow>
                <h2 className={H2}>
                  Tiga pekerjaan yang paling menyita waktu pengurus.
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted sm:mt-3 sm:text-base">
                  Waktu ustadz dan pengurus sebaiknya kembali untuk mendidik
                  santri. TSIQA merapikan tiga pekerjaan administrasi yang
                  paling sering berulang setiap bulan.
                </p>
              </div>
            </Reveal>

            <div className="mt-5 grid gap-3 sm:mt-7 sm:gap-4 md:grid-cols-3">
              {MASALAH.map((m, i) => (
                <Reveal key={m.judul} delay={i * 80} className="h-full">
                  <article className="lift flex h-full flex-col rounded-2xl border border-line bg-ivory p-3.5 sm:p-5">
                    <div className="flex items-center gap-2.5 sm:block">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-pale text-emerald sm:size-9">
                        <Icon name={m.icon} className="size-4 sm:size-[18px]" />
                      </span>
                      <h3 className="text-[15px] font-semibold sm:mt-4 sm:text-[17px]">
                        {m.judul}
                      </h3>
                    </div>
                    <div className="mt-3 flex flex-1 flex-col gap-2 sm:mt-4 sm:gap-3">
                      <div className="rounded-xl border border-line bg-white p-2.5 sm:p-3.5">
                        <p className="text-xs font-medium text-muted">
                          Cara lama
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted sm:mt-1.5 sm:text-[14.5px]">
                          {m.lama}
                        </p>
                      </div>
                      <div className="flex-1 rounded-xl border border-emerald/25 bg-emerald-pale/40 p-2.5 sm:p-3.5">
                        <p className="text-xs font-medium text-emerald">
                          Dengan TSIQA
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-ink sm:mt-1.5 sm:text-[14.5px]">
                          {m.baru}
                        </p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================= FITUR ============================ */}
        <section id="fitur" className={`border-t border-line bg-ivory ${SEKSI}`}>
          <div className={WADAH}>
            <Reveal>
              <div className="max-w-2xl">
                <Eyebrow>Fitur inti</Eyebrow>
                <h2 className={H2}>
                  Mengikuti alur kerja pesantren, bukan aplikasi kantor yang
                  rumit.
                </h2>
              </div>
            </Reveal>
            <div className="mt-5 sm:mt-7">
              <ProductTour />
            </div>
          </div>
        </section>

        {/* ============================ PEMBEDA =========================== */}
        <section
          id="pembeda"
          className={`relative overflow-hidden bg-forest text-white ${SEKSI}`}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_90%_at_15%_0%,#000_10%,transparent_70%)]"
          >
            <StarPattern id="pola-pembeda" className="text-white opacity-[0.07]" />
          </div>
          <div className={`relative ${WADAH}`}>
            <Reveal>
              <div className="max-w-2xl">
                <Eyebrow onDark>Dirancang untuk pesantren</Eyebrow>
                <h2 className={H2}>
                  Hal-hal kecil yang membuat pengurus pondok merasa dimengerti.
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/75 sm:mt-3 sm:text-base">
                  Enam hal yang kami rancang khusus untuk cara kerja pondok,
                  bukan sekadar fitur pelengkap.
                </p>
              </div>
            </Reveal>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-3 lg:grid-cols-3">
              {PEMBEDA.map((p, i) => (
                <Reveal key={p.judul} delay={(i % 3) * 80} className="h-full">
                  <article className="lift-dark h-full rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 sm:p-5">
                    <span className="grid size-8 place-items-center rounded-xl bg-white/10 text-emerald-pale sm:size-9">
                      <Icon name={p.icon} className="size-4 sm:size-[18px]" />
                    </span>
                    <h3 className="mt-2.5 text-[13.5px] font-semibold leading-snug sm:mt-4 sm:text-[17px]">
                      {p.judul}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-white/75 sm:mt-1.5 sm:text-[14.5px]">
                      {p.isi}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================= HARGA ============================ */}
        <section id="harga" className={`bg-ivory ${SEKSI}`}>
          <div className={WADAH}>
            <Reveal>
              <div className="max-w-2xl">
                <Eyebrow>Harga</Eyebrow>
                <h2 className={H2}>
                  Harga yang jelas. Bayar sesuai kebutuhan pondok.
                </h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted sm:mt-3 sm:text-base">
                  Core {rupiah(CORE_HARGA_DASAR)} per bulan untuk 150 santri
                  aktif, lalu tambah modul yang dibutuhkan saja. Ambil 3–4 modul
                  diskon 10%, 5 modul atau lebih diskon 15%. Bayar tahunan
                  cukup 11 bulan, gratis 1 bulan.
                </p>
              </div>
            </Reveal>
            <Pricing />
          </div>
        </section>

        {/* ============================ GARANSI =========================== */}
        <section id="garansi" className={`border-t border-line bg-white ${SEKSI}`}>
          <div className={`${WADAH} grid gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-12`}>
            <div className="lg:col-span-6">
              <div className="relative">
                <h2 className={`${H2} !mt-0 pr-16 sm:pr-24`}>
                  Kami ingin Anda
                  <br />
                  mencoba dengan tenang.
                </h2>
                <div
                  aria-hidden="true"
                  className="absolute right-0 top-0 grid size-13 -rotate-6 place-items-center rounded-full border-2 border-gold text-center text-[9px] font-bold leading-tight text-gold-ink sm:right-1 sm:size-[68px] sm:border-[2.5px] sm:text-[11px]"
                >
                  <span>
                    Garansi
                    <br />
                    Tsiqah
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted sm:mt-3 sm:text-base">
                <em className="not-italic font-semibold text-ink">Tsiqah</em>{" "}
                berarti dapat dipercaya. Tiga janji berikut berlaku untuk setiap
                pondok, dengan syarat yang kami tulis terang-terangan.
              </p>

              <div className="mt-4 rounded-2xl border border-line bg-surface-soft p-3.5 sm:mt-5 sm:p-5">
                <h3 className="text-xs font-medium text-muted">
                  Syarat singkat
                </h3>
                <ul className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
                  {SYARAT.map((s) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 text-xs leading-relaxed text-ink sm:gap-2.5 sm:text-[14px]"
                    >
                      <Icon
                        name="check"
                        className="mt-0.5 size-3.5 shrink-0 text-emerald sm:mt-1 sm:size-4"
                      />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 sm:gap-3 lg:col-span-6">
              {JANJI.map((j, i) => (
                <Reveal key={j.judul} delay={i * 80} className="flex flex-1">
                  <article className="lift flex w-full items-start gap-3 rounded-2xl border border-line bg-ivory px-3.5 py-3 sm:items-center sm:gap-4 sm:px-5 sm:py-4">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gold-pale text-gold-ink sm:size-11">
                      <Icon name={j.icon} className="size-4 sm:size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-medium text-gold-ink">
                        Janji {i + 1}
                      </p>
                      <h3 className="mt-0.5 text-sm font-semibold sm:text-[17px]">
                        {j.judul}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted sm:mt-1.5 sm:text-[14.5px]">
                        {j.isi}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ============================= PILOT ============================ */}
        <section id="pilot" className="border-t border-line bg-ivory py-8 sm:py-12 md:py-16">
          <div className={WADAH}>
            <Reveal>
              <div className="grid items-center gap-4 rounded-2xl border border-line bg-white p-4 sm:gap-6 sm:rounded-3xl sm:p-8 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-7">
                  <Eyebrow>Program Pondok Pilot</Eyebrow>
                  <h2 className="mt-1.5 text-lg font-bold leading-snug tracking-[-0.025em] sm:mt-2.5 sm:text-2xl">
                    Tumbuh bersama pondok pertama kami.
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-muted sm:mt-3 sm:text-[15px]">
                    TSIQA masih dalam akses awal, dan kami ingin membangunnya
                    bersama pesantren yang benar-benar memakainya. Pondok pilot
                    mendapat pendampingan langsung dari pengembang lewat
                    WhatsApp, dan masukannya menentukan fitur mana yang kami
                    kerjakan berikutnya. Garansi Tsiqah berlaku penuh.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:gap-3 lg:col-span-5 lg:items-end">
                  <ButtonLink href={WA_PILOT} className="w-full sm:w-auto">
                    <Icon name="message" className="size-3.5 sm:size-4" />
                    Jadi pondok pilot
                  </ButtonLink>
                  <p className="text-xs text-muted sm:text-sm">
                    Slot terbatas untuk 10 pondok pertama program pilot
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============================== FAQ ============================= */}
        <section id="faq" className={`border-t border-line bg-white ${SEKSI}`}>
          <div className={`${WADAH} grid gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-14`}>
            <div className={`lg:col-span-4 ${STICKY}`}>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className={H2}>
                Pertanyaan yang sering diajukan pengurus pondok.
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted sm:mt-3 sm:text-base">
                Belum menemukan jawabannya? Tanyakan langsung, kami balas lewat
                WhatsApp.
              </p>
              <div className="mt-3.5 sm:mt-5">
                <ButtonLink href={WA_UMUM} variant="outline">
                  <Icon name="message" className="size-3.5 text-emerald sm:size-4" />
                  Tanya lewat WhatsApp
                </ButtonLink>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-ivory p-3.5 sm:mt-5 sm:p-4">
                <p className="text-xs font-medium text-muted">
                  Hubungi langsung
                </p>
                <ul className="mt-2.5 space-y-2.5 text-xs sm:mt-3 sm:space-y-3 sm:text-sm">
                  <li>
                    <span className="block text-[11px] text-muted sm:text-xs">
                      WhatsApp
                    </span>
                    <a
                      href={WA_UMUM}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-ink no-underline transition-colors hover:text-emerald"
                    >
                      {WA_DISPLAY}
                    </a>
                  </li>
                  <li>
                    <span className="block text-[11px] text-muted sm:text-xs">
                      Email
                    </span>
                    <a
                      href={`mailto:${EMAIL}`}
                      className="break-all font-semibold text-ink no-underline transition-colors hover:text-emerald"
                    >
                      {EMAIL}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2 lg:col-span-8">
              {FAQ.map((f, i) => (
                <details
                  key={f.q}
                  name="faq"
                  open={i === 0}
                  className="group rounded-xl border border-line bg-ivory transition-colors duration-200 hover:border-emerald/40 open:bg-white open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2.5 px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-ink sm:gap-3 sm:px-4 sm:py-3 sm:text-[14.5px] [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-white text-muted transition-all duration-200 group-open:rotate-45 group-open:bg-emerald group-open:text-white sm:size-6">
                      <Icon name="plus" className="size-3 sm:size-3.5" />
                    </span>
                  </summary>
                  <p className="px-3.5 pb-3 text-xs leading-relaxed text-muted sm:px-4 sm:pb-4 sm:text-[14px]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ========================== PENUTUP CTA ========================= */}
        <section className="relative overflow-hidden bg-forest py-10 text-white sm:py-14 md:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 [mask-image:radial-gradient(ellipse_60%_100%_at_85%_100%,#000_10%,transparent_70%)]"
          >
            <StarPattern id="pola-cta" className="text-white opacity-[0.07]" />
          </div>
          <div className={`relative ${WADAH} text-center`}>
            <Reveal>
              <h2 className="mx-auto max-w-2xl text-xl font-bold leading-snug tracking-[-0.025em] sm:text-3xl sm:leading-tight">
                TSIQA, sistem yang layak dipercaya.
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-[13.5px] leading-relaxed text-white/75 sm:mt-3 sm:text-base">
                Mulai dari Core {rupiah(CORE_HARGA_DASAR)} per bulan, dengan
                garansi uang kembali 30 hari.
              </p>
              <div className="mt-5 flex flex-col justify-center gap-2.5 sm:mt-6 sm:flex-row sm:gap-3">
                <ButtonLink href="/daftar" variant="onDark">
                  Daftar Pondok
                  <Icon
                    name="arrow-right"
                    className="size-3.5 transition-transform group-hover:translate-x-0.5 sm:size-4"
                  />
                </ButtonLink>
                <ButtonLink href={WA_UMUM} variant="outlineOnDark">
                  <Icon name="message" className="size-3.5 sm:size-4" />
                  Tanya lewat WhatsApp
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ============================= FOOTER ============================ */}
      <footer className="border-t border-line bg-ivory py-8 sm:py-10">
        <div className={`${WADAH} grid gap-6 sm:gap-8 md:grid-cols-12`}>
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-2.5 max-w-xs text-xs leading-relaxed text-muted sm:mt-3 sm:text-sm">
              Sistem manajemen pondok pesantren. Berasal dari kata{" "}
              <em className="not-italic font-semibold text-ink">tsiqah</em>:
              dapat dipercaya.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:col-span-7 md:grid-cols-7">
            <div className="md:col-span-3">
              <p className="text-xs font-semibold text-ink sm:text-sm">
                Halaman
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted sm:mt-3 sm:space-y-2 sm:text-sm">
                <li>
                  <Link href="/daftar" className="no-underline hover:text-ink">
                    Daftar Pondok
                  </Link>
                </li>
                <li>
                  <Link href="/masuk" className="no-underline hover:text-ink">
                    Masuk ke Sistem
                  </Link>
                </li>
                <li>
                  <Link href="/privasi" className="no-underline hover:text-ink">
                    Kebijakan Privasi
                  </Link>
                </li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <p className="text-xs font-semibold text-ink sm:text-sm">
                Kontak
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted sm:mt-3 sm:space-y-2 sm:text-sm">
                <li>
                  <a
                    href={WA_UMUM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline hover:text-ink"
                  >
                    WhatsApp {WA_DISPLAY}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="break-all no-underline hover:text-ink"
                  >
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className={`${WADAH} mt-6 border-t border-line pt-4 text-[11px] text-muted sm:mt-8 sm:pt-5 sm:text-xs`}
        >
          © 2026 TSIQA · Akses Awal (Beta). Tampilan aplikasi pada halaman ini
          adalah ilustrasi.
        </div>
      </footer>
    </div>
  );
}
