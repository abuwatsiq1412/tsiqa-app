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
import { hariIni } from "@/lib/waktu";
import { simpanSetoranMassal } from "./actions";

interface BarisSetoran {
  santri_id: string;
  status: "hadir" | "izin" | "sakit" | "alpa";
  tambah_hafalan: string | null;
  ulang_hafalan: string | null;
}

export default async function TahfidzSetoranPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string;
    galat?: string;
    halaqah?: string;
    tanggal?: string;
  }>;
}) {
  const { ok, galat, halaqah: filterHalaqah, tanggal: filterTanggal } = await searchParams;
  const { sb, pondokId } = await konteks();

  // Gunakan helper hariIni() berzona waktu WIB agar halaqah Subuh tidak mundur ke tanggal kemarin
  const tglHariIni = hariIni();
  const tglAktif = filterTanggal || tglHariIni;

  const [
    { data: daftarHalaqah },
    { data: daftarAnggota },
    { data: semuaSantri },
    { data: setoranHariIni },
  ] = await Promise.all([
    sb.from("tahfidz_halaqah").select("id, nama, pengampu, target").eq("pondok_id", pondokId).order("nama"),
    sb.from("tahfidz_anggota").select("santri_id, halaqah_id").eq("pondok_id", pondokId),
    sb
      .from("santri")
      .select("id, nis, nama")
      .eq("pondok_id", pondokId)
      .eq("status", "aktif")
      .order("nama"),
    sb
      .from("tahfidz_setoran")
      .select("santri_id, status, tambah_hafalan, ulang_hafalan")
      .eq("pondok_id", pondokId)
      .eq("tanggal", tglAktif),
  ]);

  const halaqahList = daftarHalaqah ?? [];
  const halaqahAktif =
    filterHalaqah ?? (halaqahList.length > 0 ? halaqahList[0].id : "semua");

  const petaHalaqahSantri = new Map<string, string>(
    (daftarAnggota ?? []).map((a) => [a.santri_id, a.halaqah_id])
  );
  const petaSetoran = new Map<string, BarisSetoran>(
    ((setoranHariIni ?? []) as BarisSetoran[]).map((s) => [s.santri_id, s])
  );

  const santriTampil = (semuaSantri ?? []).filter((s) => {
    if (halaqahAktif === "semua") return true;
    return petaHalaqahSantri.get(s.id) === halaqahAktif;
  });

  const infoHalaqah = halaqahList.find((h) => h.id === halaqahAktif);

  return (
    <div className="space-y-6">
      <HeaderHalaman
        kategori="Tahfidz & Muroja'ah Al-Qur'an"
        judul="Setoran & Absen Harian"
        deskripsi="Isi tambah hafalan atau ulang hafalan (muroja'ah) dengan cepat. Kosongkan kolom hafalan bila santri tidak menambah atau mengulang hari ini."
        aksi={
          <div className="flex flex-wrap gap-2">
            <Link href="/tahfidz/juz" className={tombolSekunder}>
              <Ikon nama="laporan" className="h-4 w-4 text-emerald" />
              Kenaikan Juz
            </Link>
            <Link href="/tahfidz/halaqah" className={tombolSekunder}>
              <Ikon nama="kelas" className="h-4 w-4 text-emerald" />
              Kelompok Halaqah
            </Link>
          </div>
        }
      />

      <PesanNotifikasi ok={ok} galat={galat} />

      {/* Filter Halaqah & Tanggal */}
      <Kartu>
        <form method="GET" action="/tahfidz" className="flex flex-wrap items-end gap-3.5">
          <label className="block flex-1 min-w-[220px]">
            <Label>Pilih Kelompok Halaqah</Label>
            <select name="halaqah" defaultValue={halaqahAktif} className={input}>
              {halaqahList.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nama} {h.pengampu ? `— ${h.pengampu}` : ""}
                </option>
              ))}
              <option value="semua">Semua Santri Aktif ({(semuaSantri ?? []).length})</option>
            </select>
          </label>

          <label className="block w-48">
            <Label>Tanggal Halaqah</Label>
            <input name="tanggal" type="date" defaultValue={tglAktif} className={input} />
          </label>

          <button className="h-10 cursor-pointer rounded-xl bg-emerald-pale px-4 text-xs font-bold text-emerald transition hover:bg-emerald hover:text-on-brand">
            Tampilkan Daftar
          </button>
        </form>

        {infoHalaqah && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-xs text-muted">
            <Lencana varian="mint" titik={false}>
              {infoHalaqah.nama}
            </Lencana>
            {infoHalaqah.pengampu && <span>Pengampu: <strong className="text-ink">{infoHalaqah.pengampu}</strong></span>}
            {infoHalaqah.target && <span>· Target: <strong className="text-ink">{infoHalaqah.target}</strong></span>}
          </div>
        )}
      </Kartu>

      {santriTampil.length === 0 ? (
        <Kosong
          judul="Belum Ada Santri di Halaqah Ini"
          isi="Atur pembagian santri ke dalam kelompok halaqah melalui menu Kelompok Halaqah, atau pilih 'Semua Santri Aktif'."
        />
      ) : (
        <form action={simpanSetoranMassal}>
          <input type="hidden" name="tanggal" value={tglAktif} />
          <input type="hidden" name="halaqah_id" value={halaqahAktif} />

          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
            <div className="hidden border-b border-line bg-surface-soft/70 px-4 py-3 text-xs font-semibold text-muted md:grid md:grid-cols-[1.2fr_144px_1fr_1fr] md:gap-3">
              <div>Santri</div>
              <div>Kehadiran</div>
              <div>Tambah Hafalan (Ziyadah)</div>
              <div>Ulang Hafalan (Muroja&apos;ah)</div>
            </div>

            <div className="divide-y divide-line">
              {santriTampil.map((s) => {
                const row = petaSetoran.get(s.id);
                return (
                  <div
                    key={s.id}
                    className="space-y-2.5 p-4 transition hover:bg-surface-soft/40 md:grid md:grid-cols-[1.2fr_144px_1fr_1fr] md:items-center md:gap-3 md:space-y-0 md:px-4 md:py-2.5"
                  >
                    <input type="hidden" name="santri_id" value={s.id} />

                    <div className="flex items-center justify-between gap-2 md:block">
                      <div>
                        <div className="font-semibold text-ink">{s.nama}</div>
                        <div className="text-xs text-muted">NIS {s.nis}</div>
                      </div>
                    </div>

                    <div>
                      <span className="mb-1 block text-xs font-medium text-muted md:hidden">Kehadiran</span>
                      <select
                        name={`status_${s.id}`}
                        defaultValue={row?.status ?? "hadir"}
                        aria-label={`Kehadiran ${s.nama}`}
                        className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink outline-none focus:border-emerald md:h-9 md:px-2.5"
                      >
                        <option value="hadir">Hadir</option>
                        <option value="izin">Izin</option>
                        <option value="sakit">Sakit</option>
                        <option value="alpa">Alpa</option>
                      </select>
                    </div>

                    <div>
                      <span className="mb-1 block text-xs font-medium text-muted md:hidden">Tambah Hafalan (Ziyadah)</span>
                      <input
                        name={`tambah_${s.id}`}
                        defaultValue={row?.tambah_hafalan ?? ""}
                        placeholder="Mis. An-Naba 1-20 / Hal 42"
                        className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-xs text-ink placeholder:text-muted/55 outline-none focus:border-emerald md:h-9"
                      />
                    </div>

                    <div>
                      <span className="mb-1 block text-xs font-medium text-muted md:hidden">Ulang Hafalan (Muroja&apos;ah)</span>
                      <input
                        name={`ulang_${s.id}`}
                        defaultValue={row?.ulang_hafalan ?? ""}
                        placeholder="Mis. Juz 30 / Al-Mulk"
                        className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-xs text-ink placeholder:text-muted/55 outline-none focus:border-emerald md:h-9"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface/95 px-5 py-3.5 backdrop-blur">
              <span className="text-xs text-muted">
                Menampilkan <strong className="text-ink">{santriTampil.length}</strong> santri pada tanggal{" "}
                <strong className="text-ink">{tglAktif}</strong>.
              </span>
              <TombolKirim>Simpan Setoran & Absensi</TombolKirim>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}