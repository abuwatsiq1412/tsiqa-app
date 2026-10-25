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
import { aturAnggotaHalaqah, hapusHalaqah, tambahHalaqah } from "../actions";

export default async function TahfidzHalaqahPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; galat?: string }>;
}) {
  const { ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();

  const [{ data: halaqah }, { data: anggota }, { data: santri }] = await Promise.all([
    sb
      .from("tahfidz_halaqah")
      .select("id, nama, pengampu, target")
      .eq("pondok_id", pondokId)
      .order("nama"),
    sb.from("tahfidz_anggota").select("santri_id, halaqah_id").eq("pondok_id", pondokId),
    sb
      .from("santri")
      .select("id, nis, nama")
      .eq("pondok_id", pondokId)
      .eq("status", "aktif")
      .order("nama"),
  ]);

  const daftarHalaqah = halaqah ?? [];
  const petaHalaqah = new Map(daftarHalaqah.map((h) => [h.id, h.nama]));
  const petaAnggota = new Map((anggota ?? []).map((a) => [a.santri_id, a.halaqah_id]));

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Tahfidz & Muroja'ah Al-Qur'an"
        judul="Kelompok Halaqah Tahfidz"
        deskripsi="Bagi santri ke dalam kelompok halaqah agar pencatatan setoran harian lebih cepat per ustadz pengampu."
        aksi={
          <Link href="/tahfidz" className={tombolSekunder}>
            <Ikon nama="panah-kiri" className="h-4 w-4" />
            Setoran & Absen
          </Link>
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Daftar Kelompok Halaqah */}
          {daftarHalaqah.length === 0 ? (
            <Kosong
              judul="Belum Ada Kelompok Halaqah"
              isi="Buat kelompok halaqah pertama melalui formulir di sebelah kanan."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {daftarHalaqah.map((h) => {
                const jml = (anggota ?? []).filter((a) => a.halaqah_id === h.id).length;
                return (
                  <Kartu key={h.id} className="flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-ink">{h.nama}</h3>
                        <Lencana varian="mint" titik={false}>
                          {jml} Santri
                        </Lencana>
                      </div>
                      <div className="mt-1 text-xs text-muted">
                        Pengampu: <strong className="text-ink">{h.pengampu || "-"}</strong>
                      </div>
                      {h.target && (
                        <div className="mt-0.5 text-xs text-muted">
                          Target: {h.target}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-line pt-2.5">
                      <Link
                        href={`/tahfidz?halaqah=${h.id}`}
                        className="text-xs font-semibold text-emerald hover:underline"
                      >
                        Buka Setoran →
                      </Link>
                      <form action={hapusHalaqah}>
                        <input type="hidden" name="id" value={h.id} />
                        <button className="cursor-pointer text-xs text-muted hover:text-belum">
                          Hapus
                        </button>
                      </form>
                    </div>
                  </Kartu>
                );
              })}
            </div>
          )}

          {/* Penempatan Santri ke Halaqah */}
          {daftarHalaqah.length > 0 && (santri ?? []).length > 0 && (
            <Kartu>
              <h3 className="mb-1 text-base font-bold text-ink">
                Tempatkan / Pindahkan Santri ke Halaqah
              </h3>
              <p className="mb-4 text-xs text-muted">
                Centang santri di bawah lalu pilih kelompok halaqah tujuannya.
              </p>

              <form action={aturAnggotaHalaqah} className="space-y-4">
                <div className="flex flex-wrap items-end gap-3">
                  <label className="block flex-1 min-w-[220px]">
                    <Label>Pindahkan ke Halaqah *</Label>
                    <select name="halaqah_id" required className={input}>
                      {daftarHalaqah.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.nama} {h.pengampu ? `(${h.pengampu})` : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TombolKirim>Simpan Penempatan Halaqah</TombolKirim>
                </div>

                <div className="max-h-80 overflow-y-auto rounded-xl border border-line divide-y divide-line">
                  {(santri ?? []).map((s) => {
                    const idHalaqah = petaAnggota.get(s.id);
                    const namaHalaqah = idHalaqah ? petaHalaqah.get(idHalaqah) : null;
                    return (
                      <label
                        key={s.id}
                        className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs transition hover:bg-surface-soft/60"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            name="santri_id"
                            value={s.id}
                            className="h-4 w-4 rounded accent-emerald"
                          />
                          <span className="font-semibold text-ink">{s.nama}</span>
                          <span className="text-muted">({s.nis})</span>
                        </div>
                        <span className="text-[11px] font-medium text-muted">
                          {namaHalaqah ?? "Belum masuk halaqah"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </form>
            </Kartu>
          )}
        </div>

        {/* Form Tambah Halaqah Baru */}
        <Kartu>
          <h2 className="mb-1 text-base font-bold text-ink">Buat Halaqah Baru</h2>
          <p className="mb-4 text-xs text-muted">
            Tambahkan kelompok halaqah beserta ustadz/muhaffizh pengampunya.
          </p>

          <form action={tambahHalaqah} className="space-y-3.5">
            <label className="block">
              <Label>Nama Halaqah *</Label>
              <input
                name="nama"
                required
                placeholder="Contoh: Halaqah Abu Bakar Ash-Shiddiq"
                className={input}
              />
            </label>

            <label className="block">
              <Label>Ustadz / Muhaffizh Pengampu</Label>
              <input
                name="pengampu"
                placeholder="Contoh: Ust. Fauzan, Al-Hafizh"
                className={input}
              />
            </label>

            <label className="block">
              <Label>Target / Fokus (Opsional)</Label>
              <input
                name="target"
                placeholder="Contoh: Juz 28–30 / Tahfidz Reguler"
                className={input}
              />
            </label>

            <TombolKirim className="w-full">Tambah Halaqah</TombolKirim>
          </form>
        </Kartu>
      </div>
    </div>
  );
}
