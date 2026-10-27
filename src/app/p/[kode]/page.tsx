import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { tanggal } from "@/lib/format";
import {
  normalisasiPengaturanWebsite,
  type GaleriWebsite,
  type TemaWebsite,
  type TulisanWebsite,
} from "@/lib/website";

const GAYA_TEMA: Record<
  TemaWebsite,
  {
    heroBg: string;
    aksenBg: string;
    aksenText: string;
    aksenPale: string;
    lencanaHero: string;
  }
> = {
  zamrud: {
    heroBg: "bg-[#182e28] text-white",
    aksenBg: "bg-[#0f766e] hover:bg-[#0d635c] text-white",
    aksenText: "text-[#0f766e]",
    aksenPale: "bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/20",
    lencanaHero: "bg-[#d4a359]/20 text-[#f3cf8a] border-[#d4a359]/30",
  },
  emas: {
    heroBg: "bg-[#292018] text-white",
    aksenBg: "bg-[#b45309] hover:bg-[#92400e] text-white",
    aksenText: "text-[#b45309]",
    aksenPale: "bg-[#b45309]/10 text-[#b45309] border-[#b45309]/20",
    lencanaHero: "bg-[#f59e0b]/20 text-[#fde68a] border-[#f59e0b]/30",
  },
  samudra: {
    heroBg: "bg-[#172554] text-white",
    aksenBg: "bg-[#1d4ed8] hover:bg-[#1e40af] text-white",
    aksenText: "text-[#1d4ed8]",
    aksenPale: "bg-[#1d4ed8]/10 text-[#1d4ed8] border-[#1d4ed8]/20",
    lencanaHero: "bg-sky-400/20 text-sky-200 border-sky-400/30",
  },
  klasik: {
    heroBg: "bg-[#0f172a] text-white",
    aksenBg: "bg-[#334155] hover:bg-[#1e293b] text-white",
    aksenText: "text-ink",
    aksenPale: "bg-surface-soft text-ink border-line",
    lencanaHero: "bg-white/15 text-white border-white/25",
  },
};

export default async function WebsitePublikPondok({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  const sb = supabaseAdmin();

  const { data: pondok } = await sb
    .from("pondok")
    .select("*")
    .eq("kode", kode.toLowerCase())
    .maybeSingle();

  if (!pondok) notFound();

  const [
    { data: rawWeb },
    { data: rawTulisan },
    { data: rawGaleri },
    { count: jmlSantri },
    { count: jmlKamar },
    { count: jmlKelas },
  ] = await Promise.all([
    sb.from("website_pengaturan").select("*").eq("pondok_id", pondok.id).maybeSingle(),
    sb
      .from("website_tulisan")
      .select("*")
      .eq("pondok_id", pondok.id)
      .eq("terbit", true)
      .order("penting", { ascending: false })
      .order("tanggal", { ascending: false })
      .limit(12),
    sb
      .from("website_galeri")
      .select("*")
      .eq("pondok_id", pondok.id)
      .order("urutan")
      .order("created_at", { ascending: false })
      .limit(8),
    sb
      .from("santri")
      .select("id", { count: "exact", head: true })
      .eq("pondok_id", pondok.id)
      .eq("status", "aktif"),
    sb
      .from("kamar")
      .select("id", { count: "exact", head: true })
      .eq("pondok_id", pondok.id),
    sb
      .from("kelas")
      .select("id", { count: "exact", head: true })
      .eq("pondok_id", pondok.id),
  ]);

  const cfg = normalisasiPengaturanWebsite(
    pondok.id,
    pondok.nama,
    rawWeb as Record<string, unknown> | null
  );

  if (!cfg.aktif_publik) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 text-center text-ink">
        <div className="max-w-md rounded-2xl border border-line bg-surface p-8 shadow-sm">
          <h1 className="text-xl font-extrabold">{pondok.nama}</h1>
          <p className="mt-2 text-sm text-muted">
            Halaman website resmi sedang dalam pembaruan konten oleh pengurus pondok.
          </p>
        </div>
      </div>
    );
  }

  const t = GAYA_TEMA[cfg.tema] ?? GAYA_TEMA.zamrud;
  const semuaTulisan = (rawTulisan ?? []) as TulisanWebsite[];
  const daftarPengumuman = semuaTulisan.filter((x) => x.jenis === "pengumuman");
  const daftarBerita = semuaTulisan.filter((x) => x.jenis === "berita");
  const daftarGaleri = (rawGaleri ?? []) as GaleriWebsite[];

  const noWa = (cfg.wa_admin_web || pondok.telepon || "").replace(/\D/g, "");
  const tautanDaftar =
    cfg.psb_tautan_daftar ||
    (noWa
      ? `https://wa.me/${noWa.startsWith("0") ? "62" + noWa.slice(1) : noWa}?text=${encodeURIComponent(
          `Assalamu'alaikum, saya ingin menanyakan informasi pendaftaran santri baru di ${pondok.nama}.`
        )}`
      : "#pendaftaran");

  return (
    <div className="min-h-screen bg-ivory text-ink selection:bg-emerald-pale selection:text-emerald">
      {/* Bilah Navigasi Atas */}
      <header className="sticky top-0 z-30 border-b border-line/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <a href="#" className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald/25 bg-[#f4f9f7] p-1.5 shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pondok.logo_url || "/logo-tsiqa.svg"}
                alt={pondok.nama}
                className="h-full w-full object-contain"
              />
            </span>
            <div>
              <div className="text-sm font-extrabold tracking-tight text-ink sm:text-base">
                {pondok.nama}
              </div>
              <div className="text-[11px] text-muted">
                {pondok.kota || "Lembaga Pendidikan Islam & Pesantren"}
                {pondok.nspp ? ` · NSPP ${pondok.nspp}` : ""}
              </div>
            </div>
          </a>

          <nav className="hidden items-center gap-5 text-xs font-semibold text-muted md:flex">
            {cfg.seksi_aktif.profil && (
              <a href="#profil" className="transition hover:text-ink">
                Profil & Visi
              </a>
            )}
            {cfg.seksi_aktif.unit && (
              <a href="#unit" className="transition hover:text-ink">
                Unit Pendidikan
              </a>
            )}
            {cfg.seksi_aktif.berita && (
              <a href="#kabar" className="transition hover:text-ink">
                Berita & Kabar
              </a>
            )}
            {cfg.seksi_aktif.galeri && daftarGaleri.length > 0 && (
              <a href="#galeri" className="transition hover:text-ink">
                Galeri
              </a>
            )}
            {cfg.seksi_aktif.pendaftaran && (
              <a href="#pendaftaran" className="transition hover:text-ink">
                Pendaftaran
              </a>
            )}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/wali/masuk"
              className="hidden rounded-xl border border-line bg-surface-soft px-3 py-2 text-xs font-semibold text-ink transition hover:border-emerald/40 sm:inline-flex"
            >
              Portal Wali
            </Link>
            {cfg.seksi_aktif.pendaftaran && (
              <a
                href="#pendaftaran"
                className={`inline-flex items-center rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs transition ${t.aksenBg}`}
              >
                Info PSB
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Utama */}
      <section className={`relative overflow-hidden py-16 sm:py-24 ${t.heroBg}`}>
        <div className="mx-auto max-w-6xl px-4 sm:px-8">
          <div className="max-w-3xl space-y-5">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold ${t.lencanaHero}`}
            >
              <span>Website Resmi Pondok Pesantren</span>
              {pondok.kota ? <span>· {pondok.kota}</span> : null}
            </span>

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {cfg.slogan}
            </h1>

            <p className="text-sm leading-relaxed text-white/80 sm:text-base">
              {cfg.subjudul_hero}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {cfg.seksi_aktif.pendaftaran && (
                <a
                  href="#pendaftaran"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-extrabold text-[#182e28] shadow-sm transition hover:bg-white/90 sm:text-sm"
                >
                  Pendaftaran Santri Baru (PSB)
                </a>
              )}
              {cfg.seksi_aktif.profil && (
                <a
                  href="#profil"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-xs font-semibold text-white transition hover:bg-white/15 sm:text-sm"
                >
                  Kenali Pondok Kami
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Statistik Otomatis Pondok */}
      {cfg.seksi_aktif.statistik && (
        <section className="border-b border-line bg-surface py-8">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-8">
            <div className="rounded-2xl border border-line bg-surface-soft/50 p-4 text-center">
              <div className={`text-2xl font-extrabold sm:text-3xl ${t.aksenText}`}>
                {jmlSantri ?? 0}+
              </div>
              <div className="mt-0.5 text-xs font-medium text-muted">Santri Mukim & Aktif</div>
            </div>
            <div className="rounded-2xl border border-line bg-surface-soft/50 p-4 text-center">
              <div className={`text-2xl font-extrabold sm:text-3xl ${t.aksenText}`}>
                {cfg.unit_pendidikan.length}
              </div>
              <div className="mt-0.5 text-xs font-medium text-muted">Unit Pendidikan</div>
            </div>
            <div className="rounded-2xl border border-line bg-surface-soft/50 p-4 text-center">
              <div className={`text-2xl font-extrabold sm:text-3xl ${t.aksenText}`}>
                {jmlKamar ?? 0}
              </div>
              <div className="mt-0.5 text-xs font-medium text-muted">Asrama & Komplek Kamar</div>
            </div>
            <div className="rounded-2xl border border-line bg-surface-soft/50 p-4 text-center">
              <div className={`text-2xl font-extrabold sm:text-3xl ${t.aksenText}`}>
                {jmlKelas ?? 0}
              </div>
              <div className="mt-0.5 text-xs font-medium text-muted">Rombel Kelas & Halaqah</div>
            </div>
          </div>
        </section>
      )}

      {/* Papan Pengumuman Penting */}
      {cfg.seksi_aktif.pengumuman && daftarPengumuman.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-8">
          <div className="rounded-2xl border border-emerald/25 bg-emerald-pale/35 p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-emerald">
                Maklumat & Pengumuman Resmi Pondok
              </h2>
              <span className="text-xs text-muted">Terbaru</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {daftarPengumuman.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-line bg-surface p-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
                    <span className="font-semibold text-emerald">Pengumuman</span>
                    <span>{tanggal(p.tanggal)}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-ink">{p.judul}</h3>
                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted">
                    {p.isi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Profil, Visi & Misi */}
      {cfg.seksi_aktif.profil && (
        <section id="profil" className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${t.aksenPale}`}
              >
                Tentang Pesantren
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Mengenal {pondok.nama}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted">
                {cfg.tentang_kami}
              </p>
              {pondok.nama_pimpinan && (
                <div className="rounded-xl border border-line bg-surface p-4">
                  <div className="text-xs text-muted">Pengasuh / Pimpinan Pondok</div>
                  <div className="mt-0.5 text-sm font-bold text-ink">
                    {pondok.nama_pimpinan}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 lg:col-span-6">
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-xs">
                <div className={`text-xs font-semibold ${t.aksenText}`}>
                  Visi Pesantren
                </div>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-ink">
                  &ldquo;{cfg.visi}&rdquo;
                </p>

                <div
                  className={`mt-6 text-xs font-semibold ${t.aksenText}`}
                >
                  Misi Pendidikan & Pembinaan
                </div>
                <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-muted sm:text-sm">
                  {cfg.misi.map((butir, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${t.aksenPale}`}
                      >
                        {i + 1}
                      </span>
                      <span>{butir}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Program Unggulan */}
      {cfg.seksi_aktif.program && cfg.program_unggulan.length > 0 && (
        <section className="border-y border-line bg-surface-soft/50 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <div className="mb-8 max-w-2xl">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${t.aksenPale}`}
              >
                Pilar Pembinaan
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
                Program Unggulan Santri
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cfg.program_unggulan.map((prog, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-line bg-surface p-5 shadow-xs"
                >
                  <div
                    className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs font-extrabold ${t.aksenPale}`}
                  >
                    0{i + 1}
                  </div>
                  <h3 className="text-base font-bold text-ink">{prog.judul}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                    {prog.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Unit & Jenjang Pendidikan */}
      {cfg.seksi_aktif.unit && cfg.unit_pendidikan.length > 0 && (
        <section id="unit" className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <div className="mb-8 max-w-2xl">
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${t.aksenPale}`}
            >
              Lembaga & Kurikulum
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
              Unit & Jenjang Pendidikan
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cfg.unit_pendidikan.map((u, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-xs"
              >
                <div>
                  <span
                    className={`inline-block rounded-md border px-2.5 py-0.5 text-[11px] font-semibold ${t.aksenPale}`}
                  >
                    {u.jenjang}
                  </span>
                  <h3 className="mt-2.5 text-base font-bold text-ink">{u.nama}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                    {u.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Berita & Artikel Kegiatan */}
      {cfg.seksi_aktif.berita && (
        <section id="kabar" className="border-t border-line bg-surface-soft/40 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <div className="mb-8">
              <span
                className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${t.aksenPale}`}
              >
                Kabar Pondok
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
                Berita & Kegiatan Santri Terbaru
              </h2>
            </div>

            {daftarBerita.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-muted">
                Belum ada berita kegiatan yang diterbitkan.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {daftarBerita.map((b) => (
                  <article
                    key={b.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xs"
                  >
                    {b.gambar_url && (
                      <div className="aspect-video w-full overflow-hidden bg-surface-soft">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.gambar_url}
                          alt={b.judul}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
                        <span className={`font-semibold ${t.aksenText}`}>{b.kategori}</span>
                        <span>{tanggal(b.tanggal)}</span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-ink">{b.judul}</h3>
                      <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-muted">
                        {b.ringkasan || b.isi}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Galeri Foto */}
      {cfg.seksi_aktif.galeri && daftarGaleri.length > 0 && (
        <section id="galeri" className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <div className="mb-8">
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${t.aksenPale}`}
            >
              Dokumentasi
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
              Galeri Kehidupan & Fasilitas Pondok
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {daftarGaleri.map((g) => (
              <div
                key={g.id}
                className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs"
              >
                <div className="aspect-4/3 w-full overflow-hidden bg-surface-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.gambar_url}
                    alt={g.judul}
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-3.5">
                  <div className="text-[11px] font-semibold text-muted">{g.kategori}</div>
                  <div className="mt-0.5 text-xs font-bold text-ink">{g.judul}</div>
                  {g.keterangan && (
                    <p className="mt-1 text-[11px] text-muted">{g.keterangan}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Informasi Pendaftaran (PSB / PPDB) */}
      {cfg.seksi_aktif.pendaftaran && (
        <section id="pendaftaran" className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <div className={`rounded-3xl p-6 sm:p-10 ${t.heroBg}`}>
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${t.lencanaHero}`}
                >
                  {cfg.psb_buka ? cfg.psb_gelombang : "Pendaftaran Ditutup Sementara"}
                </span>
                <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
                  {cfg.psb_judul}
                </h2>
                <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
                  {cfg.psb_biaya_ringkas}
                </p>

                <div className="pt-2">
                  <div className="mb-2 text-xs font-semibold text-white/90">
                    Persyaratan Pendaftaran:
                  </div>
                  <ul className="space-y-1.5 text-xs text-white/85 sm:text-sm">
                    {cfg.psb_syarat.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-amber-300">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl bg-surface p-6 text-ink shadow-lg lg:col-span-5">
                <h3 className="text-base font-extrabold text-ink">
                  Konsultasi & Pendaftaran Santri Baru
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Hubungi panitia Penerimaan Santri Baru (PSB) {pondok.nama} untuk mendapatkan panduan pendaftaran dan jadwal tes seleksi.
                </p>

                <div className="mt-5 space-y-2.5">
                  <a
                    href={tautanDaftar}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-xs font-extrabold transition sm:text-sm ${t.aksenBg}`}
                  >
                    {cfg.psb_tautan_daftar
                      ? "Isi Formulir Pendaftaran Online"
                      : "Hubungi Panitia PSB via WhatsApp"}
                  </a>

                  {pondok.alamat && (
                    <div className="rounded-xl border border-line bg-surface-soft p-3 text-xs text-muted">
                      <strong className="block text-ink">Sekretariat Pendaftaran:</strong>
                      {pondok.alamat}
                      {pondok.kota ? `, ${pondok.kota}` : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer & Kontak */}
      <footer className="border-t border-line bg-surface py-10 text-xs text-muted">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-8">
          <div className="space-y-1">
            <div className="text-sm font-extrabold text-ink">{pondok.nama}</div>
            <div>
              {pondok.alamat || pondok.kota || "Lembaga Pendidikan Pesantren"}
              {pondok.telepon ? ` · Telp/WA: ${pondok.telepon}` : ""}
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              {cfg.alamat_peta_url && (
                <a
                  href={cfg.alamat_peta_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald hover:underline"
                >
                  Google Maps Lokasi
                </a>
              )}
              {cfg.instagram_url && (
                <a
                  href={cfg.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald hover:underline"
                >
                  Instagram
                </a>
              )}
              {cfg.youtube_url && (
                <a
                  href={cfg.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald hover:underline"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/wali/masuk"
              className="rounded-lg border border-line px-3 py-1.5 font-semibold text-ink hover:bg-surface-soft"
            >
              Portal Wali Santri
            </Link>
            <Link
              href="/guru/masuk"
              className="rounded-lg border border-line px-3 py-1.5 font-semibold text-ink hover:bg-surface-soft"
            >
              Portal Asatidz
            </Link>
            <Link
              href="/masuk"
              className="rounded-lg border border-line px-3 py-1.5 font-semibold text-muted hover:text-ink"
            >
              Login Pengurus
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
