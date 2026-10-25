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
import { catatPelanggaranSantri, hapusPelanggaranSantri } from "../actions";

interface BarisPelanggaran {
  id: string;
  santri_id: string;
  nama_pelanggaran: string;
  kategori: "ringan" | "sedang" | "berat";
  poin: number;
  tanggal: string;
  tindakan: string | null;
  catatan: string | null;
}

export default async function BukuPelanggaranPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const { ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: santri }, { data: rawPelanggaran }] = await Promise.all([
    sb
      .from("santri")
      .select("id, nis, nama")
      .eq("pondok_id", pondokId)
      .eq("status", "aktif")
      .order("nama"),
    sb
      .from("catatan_pelanggaran")
      .select("*")
      .eq("pondok_id", pondokId)
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(150),
  ]);

  const petaSantri = new Map((santri ?? []).map((s) => [s.id, s]));
  const daftar = (rawPelanggaran ?? []) as BarisPelanggaran[];
  const hariIni = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Keamanan & Ketertiban Asrama"
        judul="Buku Disiplin & Catatan Pelanggaran"
        deskripsi="Catat pelanggaran tata tertib asrama beserta poin kedisiplinan dan tindakan pembinaan (ta'zir) santri."
        aksi={
          <Link href="/perizinan" className={tombolSekunder}>
            <Ikon nama="panah-kiri" className="h-4 w-4" />
            Pos Perizinan
          </Link>
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3.5">
          {daftar.length === 0 ? (
            <Kosong
              judul="Belum Ada Catatan Pelanggaran"
              isi="Buku pelanggaran masih bersih. Gunakan formulir di samping bila perlu mencatat pembinaan disiplin santri."
            />
          ) : (
            daftar.map((p) => {
              const s = petaSantri.get(p.santri_id);
              const varian =
                p.kategori === "berat"
                  ? "belum"
                  : p.kategori === "sedang"
                  ? "cicilan"
                  : "mint";
              return (
                <Kartu key={p.id} className="space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-ink">{s?.nama ?? "Santri"}</span>
                      <span className="text-xs text-muted">({s?.nis ?? "-"})</span>
                      <Lencana varian={varian}>
                        {p.kategori.toUpperCase()} · +{p.poin} Poin
                      </Lencana>
                      <span className="text-xs text-muted">{tanggal(p.tanggal)}</span>
                    </div>

                    <form action={hapusPelanggaranSantri}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="cursor-pointer text-xs text-muted hover:text-belum">
                        Hapus
                      </button>
                    </form>
                  </div>

                  <div className="text-xs font-semibold text-ink">
                    Pelanggaran: {p.nama_pelanggaran}
                  </div>
                  {p.tindakan && (
                    <div className="text-xs text-emerald">
                      Tindak Lanjut / Ta&apos;zir: {p.tindakan}
                    </div>
                  )}
                  {p.catatan && <p className="text-xs text-muted">{p.catatan}</p>}
                </Kartu>
              );
            })
          )}
        </div>

        <Kartu>
          <h2 className="mb-1 text-base font-bold text-ink">Catat Pembinaan / Pelanggaran</h2>
          <p className="mb-4 text-xs text-muted">
            Rekam pelanggaran tata tertib dan bentuk pembinaan yang diberikan.
          </p>

          <form action={catatPelanggaranSantri} className="space-y-3.5">
            <label className="block">
              <Label>Pilih Santri *</Label>
              <select name="santri_id" required className={input}>
                <option value="">— Pilih nama santri —</option>
                {(santri ?? []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nis})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <Label>Nama Pelanggaran Tata Tertib *</Label>
              <input
                name="nama_pelanggaran"
                required
                placeholder="Contoh: Terlambat jamaah Subuh / Membawa HP"
                className={input}
              />
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <Label>Tingkat</Label>
                <select name="kategori" defaultValue="ringan" className={input}>
                  <option value="ringan">Ringan</option>
                  <option value="sedang">Sedang</option>
                  <option value="berat">Berat</option>
                </select>
              </label>

              <label className="block">
                <Label>Poin Disiplin</Label>
                <input
                  name="poin"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={5}
                  className={input}
                />
              </label>
            </div>

            <label className="block">
              <Label>Tanggal Kejadian</Label>
              <input name="tanggal" type="date" defaultValue={hariIni} className={input} />
            </label>

            <label className="block">
              <Label>Bentuk Pembinaan / Ta&apos;zir</Label>
              <input
                name="tindakan"
                placeholder="Contoh: Muroja'ah 1 juz di serambi masjid"
                className={input}
              />
            </label>

            <label className="block">
              <Label>Catatan Tambahan (Opsional)</Label>
              <textarea
                name="catatan"
                rows={2}
                placeholder="Keterangan saksi atau kronologi singkat..."
                className={input}
              />
            </label>

            <TombolKirim className="w-full">Simpan Catatan Disiplin</TombolKirim>
          </form>
        </Kartu>
      </div>
    </div>
  );
}
