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
import { konteks } from "@/lib/konteks";
import type { GaleriWebsite } from "@/lib/website";
import { hapusGaleriWebsite, tambahGaleriWebsite } from "../actions";

export default async function WebsiteGaleriPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const { ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: pondok }, { data: galeri }] = await Promise.all([
    sb.from("pondok").select("kode").eq("id", pondokId).maybeSingle(),
    sb
      .from("website_galeri")
      .select("*")
      .eq("pondok_id", pondokId)
      .order("urutan")
      .order("created_at", { ascending: false }),
  ]);

  const daftar = (galeri ?? []) as GaleriWebsite[];

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Website Pondok (CMS)"
        judul="Galeri Dokumentasi Kegiatan"
        deskripsi="Tampilkan foto lingkungan asrama, masjid, pembelajaran, dan ekstrakurikuler santri."
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

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {daftar.length === 0 ? (
            <Kosong
              judul="Galeri Masih Kosong"
              isi="Tambahkan foto dokumentasi fasilitas atau kegiatan santri melalui formulir di samping."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {daftar.map((g) => (
                <Kartu key={g.id} className="overflow-hidden p-0">
                  <div className="aspect-video w-full overflow-hidden bg-surface-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.gambar_url}
                      alt={g.judul}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Lencana varian="mint" titik={false}>
                        {g.kategori}
                      </Lencana>
                      <form action={hapusGaleriWebsite}>
                        <input type="hidden" name="id" value={g.id} />
                        <button className="cursor-pointer text-xs font-medium text-muted transition hover:text-belum">
                          Hapus
                        </button>
                      </form>
                    </div>
                    <h3 className="mt-2 text-sm font-bold text-ink">{g.judul}</h3>
                    {g.keterangan && (
                      <p className="mt-1 text-xs text-muted">{g.keterangan}</p>
                    )}
                  </div>
                </Kartu>
              ))}
            </div>
          )}
        </div>

        <Kartu>
          <h2 className="mb-1 text-base font-bold text-ink">Tambah Foto Galeri</h2>
          <p className="mb-4 text-xs text-muted">
            Masukkan tautan gambar (URL foto publik dari Google Drive / Imgur / CDN pondok).
          </p>

          <form action={tambahGaleriWebsite} className="space-y-3.5">
            <label className="block">
              <Label>Judul Foto / Kegiatan *</Label>
              <input
                name="judul"
                required
                placeholder="Contoh: Kajian Kitab Kuning Ba'da Subuh"
                className={input}
              />
            </label>

            <label className="block">
              <Label>Kategori</Label>
              <input
                name="kategori"
                defaultValue="Kegiatan Santri"
                placeholder="Fasilitas / Asrama / Kegiatan Santri"
                className={input}
              />
            </label>

            <label className="block">
              <Label>URL Gambar (https://...) *</Label>
              <input
                name="gambar_url"
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                className={input}
              />
            </label>

            <label className="block">
              <Label>Keterangan Singkat (Opsional)</Label>
              <textarea
                name="keterangan"
                rows={2}
                placeholder="Suasana halaqah pagi di serambi masjid utama..."
                className={input}
              />
            </label>

            <TombolKirim className="w-full">Simpan ke Galeri</TombolKirim>
          </form>
        </Kartu>
      </div>
    </div>
  );
}
