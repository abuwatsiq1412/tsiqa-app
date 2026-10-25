import Link from "next/link";
import { TombolKirim } from "@/components-form";
import {
  HeaderHalaman,
  Ikon,
  Kartu,
  Kosong,
  Label,
  Lencana,
  PesanNotifikasi,
  input,
  tombolSekunder,
} from "@/components-ui";
import { tanggal } from "@/lib/format";
import { konteks } from "@/lib/konteks";
import type { TulisanWebsite } from "@/lib/website";
import { hapusTulisanWebsite, tambahTulisanWebsite } from "../actions";

export default async function WebsiteTulisanPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const { ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: pondok }, { data: tulisan }] = await Promise.all([
    sb.from("pondok").select("kode").eq("id", pondokId).maybeSingle(),
    sb
      .from("website_tulisan")
      .select("*")
      .eq("pondok_id", pondokId)
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const daftar = (tulisan ?? []) as TulisanWebsite[];
  const hariIni = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Website Pondok (CMS)"
        judul="Berita & Papan Pengumuman"
        deskripsi="Terbitkan kabar kegiatan santri, prestasi, atau maklumat resmi untuk wali santri & masyarakat."
        aksi={
          pondok?.kode ? (
            <Link href={`/p/${pondok.kode}`} target="_blank" className={tombolSekunder}>
              <Ikon nama="gedung" className="h-4 w-4 text-emerald" />
              Lihat di Website
            </Link>
          ) : null
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Daftar Tulisan */}
        <div className="space-y-4">
          {daftar.length === 0 ? (
            <Kosong
              judul="Belum Ada Berita atau Pengumuman"
              isi="Tulis berita kegiatan atau pengumuman resmi pertama Anda melalui formulir di samping."
            />
          ) : (
            daftar.map((t) => (
              <Kartu key={t.id} className="space-y-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Lencana
                      varian={t.jenis === "pengumuman" ? "cicilan" : "mint"}
                      titik={false}
                    >
                      {t.jenis === "pengumuman" ? "Pengumuman Resmi" : `Berita · ${t.kategori}`}
                    </Lencana>
                    {t.penting && (
                      <Lencana varian="belum" titik={false}>
                        Penting / Disematkan
                      </Lencana>
                    )}
                    <span className="text-xs text-muted">{tanggal(t.tanggal)}</span>
                  </div>

                  <form action={hapusTulisanWebsite}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="cursor-pointer text-xs font-medium text-muted transition hover:text-belum">
                      Hapus
                    </button>
                  </form>
                </div>

                <h3 className="text-base font-bold text-ink">{t.judul}</h3>
                {t.ringkasan && (
                  <p className="text-xs font-medium text-muted">{t.ringkasan}</p>
                )}
                <p className="line-clamp-3 whitespace-pre-line text-xs leading-relaxed text-muted">
                  {t.isi}
                </p>
              </Kartu>
            ))
          )}
        </div>

        {/* Form Terbitkan Baru */}
        <Kartu>
          <h2 className="mb-1 text-base font-bold text-ink">Terbitkan Tulisan Baru</h2>
          <p className="mb-4 text-xs text-muted">
            Pilih jenis &ldquo;Berita&rdquo; untuk kabar kegiatan atau &ldquo;Pengumuman&rdquo; untuk maklumat resmi.
          </p>

          <form action={tambahTulisanWebsite} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <Label>Jenis Publikasi</Label>
                <select name="jenis" defaultValue="berita" className={input}>
                  <option value="berita">Berita / Artikel</option>
                  <option value="pengumuman">Pengumuman</option>
                </select>
              </label>

              <label className="block">
                <Label>Tanggal</Label>
                <input
                  name="tanggal"
                  type="date"
                  defaultValue={hariIni}
                  className={input}
                />
              </label>
            </div>

            <label className="block">
              <Label>Judul *</Label>
              <input
                name="judul"
                required
                placeholder="Contoh: Wisuda Tahfidz 30 Juz Angkatan V"
                className={input}
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <Label>Kategori</Label>
                <input
                  name="kategori"
                  defaultValue="Kegiatan"
                  placeholder="Kegiatan / Prestasi / Kajian"
                  className={input}
                />
              </label>

              <label className="block">
                <Label>URL Foto Sampul (Opsional)</Label>
                <input
                  name="gambar_url"
                  type="url"
                  placeholder="https://..."
                  className={input}
                />
              </label>
            </div>

            <label className="block">
              <Label>Ringkasan Singkat (1 Kalimat)</Label>
              <input
                name="ringkasan"
                placeholder="Ringkasan untuk kartu halaman depan..."
                className={input}
              />
            </label>

            <label className="block">
              <Label>Isi Lengkap *</Label>
              <textarea
                name="isi"
                rows={5}
                required
                placeholder="Tulis isi lengkap berita atau pengumuman di sini..."
                className={input}
              />
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink">
              <input
                type="checkbox"
                name="penting"
                value="1"
                className="h-4 w-4 rounded accent-emerald"
              />
              Sematkan sebagai informasi utama (Penting)
            </label>

            <TombolKirim className="w-full">Terbitkan ke Website</TombolKirim>
          </form>
        </Kartu>
      </div>
    </div>
  );
}
