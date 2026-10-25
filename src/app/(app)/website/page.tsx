import Link from "next/link";
import { TombolKirim } from "@/components-form";
import {
  HeaderHalaman,
  Ikon,
  Kartu,
  Lencana,
  PesanNotifikasi,
  tombolSekunder,
} from "@/components-ui";
import { konteks } from "@/lib/konteks";
import {
  DAFTAR_SEKSI_WEBSITE,
  DAFTAR_TEMA_WEBSITE,
  normalisasiPengaturanWebsite,
} from "@/lib/website";
import { simpanTampilanWebsite } from "./actions";

export default async function WebsiteDashboard({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const { ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: pondok }, { data: rawWeb }, { count: jmlTulisan }, { count: jmlGaleri }] =
    await Promise.all([
      sb.from("pondok").select("nama, kode, kota").eq("id", pondokId).maybeSingle(),
      sb.from("website_pengaturan").select("*").eq("pondok_id", pondokId).maybeSingle(),
      sb
        .from("website_tulisan")
        .select("id", { count: "exact", head: true })
        .eq("pondok_id", pondokId),
      sb
        .from("website_galeri")
        .select("id", { count: "exact", head: true })
        .eq("pondok_id", pondokId),
    ]);

  const namaPondok = pondok?.nama ?? "Pondok Pesantren";
  const kodePondok = pondok?.kode ?? "";
  const cfg = normalisasiPengaturanWebsite(
    pondokId,
    namaPondok,
    rawWeb as Record<string, unknown> | null
  );

  const jumlahSeksiAktif = Object.values(cfg.seksi_aktif).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Website Pondok (CMS)"
        judul="Tampilan, Tema & Seksi Website"
        deskripsi="Atur seksi apa saja yang ingin ditampilkan di website resmi pondok serta pilih tema warna."
        aksi={
          kodePondok ? (
            <Link
              href={`/p/${kodePondok}`}
              target="_blank"
              className={tombolSekunder}
            >
              <Ikon nama="gedung" className="h-4 w-4 text-emerald" />
              Lihat Website Publik (/p/{kodePondok})
            </Link>
          ) : null
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      {/* Ringkasan Cepat & Navigasi CMS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kartu varian="mint">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Status Website</span>
            <Lencana varian={cfg.aktif_publik ? "lunas" : "netral"}>
              {cfg.aktif_publik ? "Online Publik" : "Draft Internal"}
            </Lencana>
          </div>
          <div className="mt-2 truncate text-base font-extrabold text-ink">
            /p/{kodePondok}
          </div>
          <p className="mt-1 text-xs text-muted">
            {jumlahSeksiAktif} dari {DAFTAR_SEKSI_WEBSITE.length} seksi diaktifkan
          </p>
        </Kartu>

        <Link href="/website/profil" className="group block">
          <Kartu className="h-full transition group-hover:border-emerald/40">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>Profil & Unit</span>
              <Ikon nama="panah" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-2 text-base font-extrabold text-ink">
              {cfg.unit_pendidikan.length} Unit · {cfg.program_unggulan.length} Program
            </div>
            <p className="mt-1 text-xs text-muted">Edit sejarah, visi-misi & jenjang</p>
          </Kartu>
        </Link>

        <Link href="/website/tulisan" className="group block">
          <Kartu className="h-full transition group-hover:border-emerald/40">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>Berita & Pengumuman</span>
              <Ikon nama="panah" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-2 text-base font-extrabold text-ink">
              {jmlTulisan ?? 0} Publikasi
            </div>
            <p className="mt-1 text-xs text-muted">Tulis kabar kegiatan & maklumat</p>
          </Kartu>
        </Link>

        <Link href="/website/galeri" className="group block">
          <Kartu className="h-full transition group-hover:border-emerald/40">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>Galeri & Info PSB</span>
              <Ikon nama="panah" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
            <div className="mt-2 text-base font-extrabold text-ink">
              {jmlGaleri ?? 0} Foto · {cfg.psb_buka ? "PSB Buka" : "PSB Tutup"}
            </div>
            <p className="mt-1 text-xs text-muted">Dokumentasi & syarat santri baru</p>
          </Kartu>
        </Link>
      </div>

      <form action={simpanTampilanWebsite} className="space-y-6">
        {/* Sakelar Publik & Preset Tema */}
        <Kartu>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="text-base font-bold text-ink">1. Status Tayang & Tema Warna</h2>
              <p className="text-xs text-muted">
                Pilih nuansa warna yang paling mewakili identitas pesantren Anda.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-surface-soft px-3.5 py-2 text-xs font-semibold text-ink">
              <input
                type="checkbox"
                name="aktif_publik"
                value="1"
                defaultChecked={cfg.aktif_publik}
                className="h-4 w-4 rounded accent-emerald"
              />
              Tampilkan Website untuk Publik
            </label>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DAFTAR_TEMA_WEBSITE.map((t) => (
              <label
                key={t.kode}
                className="flex cursor-pointer flex-col justify-between rounded-xl border border-line bg-surface-soft/50 p-3.5 transition hover:border-emerald/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-ink">
                      <input
                        type="radio"
                        name="tema"
                        value={t.kode}
                        defaultChecked={cfg.tema === t.kode}
                        className="accent-emerald"
                      />
                      {t.nama}
                    </span>
                    <span className="flex items-center gap-1">
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: t.latar }}
                      />
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: t.aksen }}
                      />
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted">{t.ket}</p>
                </div>
              </label>
            ))}
          </div>
        </Kartu>

        {/* Sakelar Seksi Fleksibel */}
        <Kartu>
          <div className="border-b border-line pb-4">
            <h2 className="text-base font-bold text-ink">
              2. Susunan Seksi Halaman Website (Fleksibel)
            </h2>
            <p className="text-xs text-muted">
              Centang seksi yang ingin ditampilkan di halaman depan website pondok. Seksi yang tidak dicentang otomatis disembunyikan dari publik.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DAFTAR_SEKSI_WEBSITE.map((s) => (
              <label
                key={s.kode}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-surface-soft/40 p-3.5 transition hover:border-emerald/40"
              >
                <input
                  type="checkbox"
                  name="seksi"
                  value={s.kode}
                  defaultChecked={cfg.seksi_aktif[s.kode]}
                  className="mt-0.5 h-4 w-4 rounded accent-emerald"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-ink">{s.label}</div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{s.ket}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-5 flex justify-end border-t border-line pt-4">
            <TombolKirim>Simpan Pengaturan Tampilan & Seksi</TombolKirim>
          </div>
        </Kartu>
      </form>
    </div>
  );
}
