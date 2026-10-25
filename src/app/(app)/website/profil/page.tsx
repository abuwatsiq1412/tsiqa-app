import Link from "next/link";
import { TombolKirim } from "@/components-form";
import {
  HeaderHalaman,
  Ikon,
  Kartu,
  Label,
  PesanNotifikasi,
  input,
  tombolSekunder,
} from "@/components-ui";
import { konteks } from "@/lib/konteks";
import { normalisasiPengaturanWebsite } from "@/lib/website";
import { simpanProfilWebsite } from "../actions";

export default async function WebsiteProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const { ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: pondok }, { data: rawWeb }] = await Promise.all([
    sb.from("pondok").select("nama, kode").eq("id", pondokId).maybeSingle(),
    sb.from("website_pengaturan").select("*").eq("pondok_id", pondokId).maybeSingle(),
  ]);

  const namaPondok = pondok?.nama ?? "Pondok Pesantren";
  const cfg = normalisasiPengaturanWebsite(
    pondokId,
    namaPondok,
    rawWeb as Record<string, unknown> | null
  );

  // Siapkan 4 slot program & 4 slot unit agar mudah ditambah/dikosongkan
  const slotProgram = Array.from({ length: 4 }, (_, i) => cfg.program_unggulan[i] ?? { judul: "", deskripsi: "" });
  const slotUnit = Array.from({ length: 4 }, (_, i) => cfg.unit_pendidikan[i] ?? { nama: "", jenjang: "", deskripsi: "" });

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Website Pondok (CMS)"
        judul="Profil, Program & Unit Pendidikan"
        deskripsi="Kelola narasi utama halaman depan, visi-misi, program unggulan, dan daftar jenjang pendidikan."
        aksi={
          pondok?.kode ? (
            <Link href={`/p/${pondok.kode}`} target="_blank" className={tombolSekunder}>
              <Ikon nama="gedung" className="h-4 w-4 text-emerald" />
              Pratinjau Website
            </Link>
          ) : null
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      <form action={simpanProfilWebsite} className="space-y-6">
        {/* Hero & Sejarah/Tentang Kami */}
        <Kartu className="space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">1. Sambutan Utama (Hero) & Tentang Pondok</h2>
            <p className="text-xs text-muted">
              Teks ini tampil paling atas saat pengunjung membuka website pondok.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <label className="block">
              <Label>Slogan / Judul Utama Hero *</Label>
              <input
                name="slogan"
                defaultValue={cfg.slogan}
                required
                placeholder="Mencetak Generasi Qur'ani, Berakhlak Mulia & Berwawasan Luas"
                className={input}
              />
            </label>

            <label className="block">
              <Label>Deskripsi Singkat di Bawah Slogan</Label>
              <textarea
                name="subjudul_hero"
                rows={2}
                defaultValue={cfg.subjudul_hero}
                className={input}
              />
            </label>

            <label className="block">
              <Label>Profil & Sejarah Singkat Pondok (Tentang Kami)</Label>
              <textarea
                name="tentang_kami"
                rows={4}
                defaultValue={cfg.tentang_kami}
                className={input}
              />
            </label>
          </div>
        </Kartu>

        {/* Visi & Misi */}
        <Kartu className="space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">2. Visi & Misi Pesantren</h2>
            <p className="text-xs text-muted">
              Untuk Misi, tulis satu butir misi per baris.
            </p>
          </div>

          <label className="block">
            <Label>Visi Pondok</Label>
            <textarea name="visi" rows={2} defaultValue={cfg.visi} className={input} />
          </label>

          <label className="block">
            <Label>Butir Misi Pondok (Satu baris = satu poin misi)</Label>
            <textarea
              name="misi"
              rows={4}
              defaultValue={cfg.misi.join("\n")}
              className={input}
            />
          </label>
        </Kartu>

        {/* Program Unggulan */}
        <Kartu className="space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">3. Program Unggulan Pondok (Maksimal 4)</h2>
            <p className="text-xs text-muted">
              Kosongkan nama program bila slot tidak ingin ditampilkan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {slotProgram.map((p, idx) => (
              <div
                key={idx}
                className="space-y-2.5 rounded-xl border border-line bg-surface-soft/40 p-3.5"
              >
                <div className="text-xs font-bold text-emerald">Program #{idx + 1}</div>
                <label className="block">
                  <Label>Nama Program</Label>
                  <input
                    name={`prog_judul_${idx}`}
                    defaultValue={p.judul}
                    placeholder="Contoh: Tahfidzul Qur'an Bersanad"
                    className={input}
                  />
                </label>
                <label className="block">
                  <Label>Penjelasan Singkat</Label>
                  <textarea
                    name={`prog_ket_${idx}`}
                    rows={2}
                    defaultValue={p.deskripsi}
                    placeholder="Setoran dan muroja'ah harian terbimbing..."
                    className={input}
                  />
                </label>
              </div>
            ))}
          </div>
        </Kartu>

        {/* Unit Pendidikan */}
        <Kartu className="space-y-4">
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">4. Unit & Jenjang Pendidikan (Maksimal 4)</h2>
            <p className="text-xs text-muted">
              Tampilkan unit pendidikan yang ada di bawah naungan yayasan/pondok.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {slotUnit.map((u, idx) => (
              <div
                key={idx}
                className="space-y-2.5 rounded-xl border border-line bg-surface-soft/40 p-3.5"
              >
                <div className="text-xs font-bold text-emerald">Unit Pendidikan #{idx + 1}</div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="block">
                    <Label>Nama Unit / Lembaga</Label>
                    <input
                      name={`unit_nama_${idx}`}
                      defaultValue={u.nama}
                      placeholder="SMP / MTs Pesantren"
                      className={input}
                    />
                  </label>
                  <label className="block">
                    <Label>Jenjang / Keterangan</Label>
                    <input
                      name={`unit_jenjang_${idx}`}
                      defaultValue={u.jenjang}
                      placeholder="Setara SLTP (3 Tahun)"
                      className={input}
                    />
                  </label>
                </div>
                <label className="block">
                  <Label>Fokus Kurikulum</Label>
                  <textarea
                    name={`unit_ket_${idx}`}
                    rows={2}
                    defaultValue={u.deskripsi}
                    placeholder="Kurikulum nasional terpadu dengan kepesantrenan..."
                    className={input}
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-line pt-4">
            <TombolKirim>Simpan Profil, Program & Unit</TombolKirim>
          </div>
        </Kartu>
      </form>
    </div>
  );
}
