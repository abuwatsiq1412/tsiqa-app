import { TombolKirim } from "@/components-form";
import { konteks } from "@/lib/konteks";
import {
  HeaderHalaman,
  Ikon,
  Kartu,
  Label,
  Lencana,
  PesanNotifikasi,
  input,
  tombol,
  tombolSekunder,
} from "@/components-ui";
import { tanggalHeader } from "@/lib/hijriah";
import { simpanPondok, tambahTahunAjaran, aktifkanTahunAjaran } from "./actions";

export default async function Pengaturan({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; ok?: string }>;
}) {
  const { galat, ok } = await searchParams;
  const { sb, pondokId, peran } = await konteks();
  const [{ data: p }, { data: ta }] = await Promise.all([
    sb.from("pondok").select("*").eq("id", pondokId).single(),
    sb.from("tahun_ajaran").select("*").order("nama", { ascending: false }).order("semester"),
  ]);
  const admin = peran === "admin";
  const F = ({ n, l, t = "text", placeholder }: { n: string; l: string; t?: string; placeholder?: string }) => (
    <label className="block">
      <Label>{l}</Label>
      <input
        name={n}
        type={t}
        placeholder={placeholder}
        defaultValue={p?.[n] ?? ""}
        disabled={!admin}
        className={input}
      />
    </label>
  );

  return (
    <div className="space-y-6">
      <HeaderHalaman
        judul="Pengaturan Pondok"
        deskripsi="Kelola identitas pondok, tahun ajaran aktif, dan cadangan arsip data mandiri."
      />

      <PesanNotifikasi
        ok={ok ? "Perubahan pengaturan berhasil disimpan." : undefined}
        galat={galat}
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Kartu>
            <div className="mb-4 border-b border-line pb-3">
              <h2 className="text-base font-semibold text-ink">Profil Pondok</h2>
              <p className="text-xs text-muted">
                Tampil di kop kwitansi, pesan WhatsApp, dan bagian bawah Website Pondok.
              </p>
            </div>
            <form action={simpanPondok} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <F n="nama" l="Nama pondok" />
              <F n="nspp" l="NSPP" placeholder="Mis. 510032..." />
              <F n="alamat" l="Alamat" />
              <F n="kota" l="Kota" />
              <F n="telepon" l="Telepon" />
              <F n="email" l="Email" t="email" />
              <F n="nama_pimpinan" l="Pimpinan / pengasuh" />
              <F n="nama_bendahara" l="Bendahara" />
              {p && "geser_hijriah" in p && (
                <label className="block sm:col-span-2">
                  <Label>Penyesuaian tanggal Hijriah (Sidang Isbat / Rukyat)</Label>
                  <select name="geser_hijriah" defaultValue={String(p.geser_hijriah ?? 0)} disabled={!admin} className={`${input} sm:!w-72`}>
                    {[-2, -1, 0, 1, 2].map((g) => (
                      <option key={g} value={g}>{g === 0 ? "Sesuai hitungan (Umm al-Qura)" : `${g > 0 ? "+" : ""}${g} hari`}</option>
                    ))}
                  </select>
                  <span className="mt-1 block text-xs text-muted">Sekarang tampil: {tanggalHeader(Number(p.geser_hijriah ?? 0)).hijriah}. Ubah bila pondok mengikuti penetapan yang berbeda sehari.</span>
                </label>
              )}
              {admin && (
                <div className="sm:col-span-2 pt-1">
                  <TombolKirim>Simpan</TombolKirim>
                </div>
              )}
            </form>
          </Kartu>

          {admin && (
            <Kartu varian="mint">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl space-y-1">
                  <div className="flex items-center gap-2">
                    <Ikon nama="kunci" className="h-4 w-4 text-emerald" />
                    <h2 className="text-base font-bold text-ink">
                      Cadangan & Ekspor Data Mandiri Pondok
                    </h2>
                  </div>
                  <p className="text-xs leading-relaxed text-muted">
                    Unduh salinan lengkap seluruh data milik <strong className="text-ink">{p?.nama ?? "pondok Anda"}</strong> (Data Induk Santri, Kamar, Kelas, Tagihan, Riwayat Pembayaran Kas, dan Nilai Akademik). File dijamin terisolasi hanya berisi data pondok Anda sendiri dan tetap dapat diunduh kapan saja.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href="/pengaturan/backup?format=xlsx"
                    download
                    className={tombol}
                  >
                    <Ikon nama="unduh" className="h-4 w-4" />
                    Unduh Backup Excel (.xlsx)
                  </a>
                  <a
                    href="/pengaturan/backup?format=json"
                    download
                    className={tombolSekunder}
                  >
                    <Ikon nama="unduh" className="h-4 w-4" />
                    Arsip JSON (.json)
                  </a>
                </div>
              </div>
            </Kartu>
          )}
        </div>

        <Kartu>
          <div className="mb-4 border-b border-line pb-3">
            <h2 className="text-base font-semibold text-ink">Tahun Ajaran</h2>
            <p className="text-xs text-muted">
              Dipakai untuk riwayat penempatan dan kenaikan kelas.
            </p>
          </div>
          <ul className="mb-5 divide-y divide-line text-sm">
            {(ta ?? []).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2.5">
                <div>
                  <span className="font-semibold text-ink">{t.nama}</span>
                  <span className="ml-1.5 capitalize text-xs text-muted">· {t.semester}</span>
                </div>
                {t.aktif ? (
                  <Lencana varian="lunas">Aktif</Lencana>
                ) : (
                  <form action={aktifkanTahunAjaran}>
                    <input type="hidden" name="id" value={t.id} />
                    <button className="rounded-md bg-surface-soft px-2.5 py-1 text-xs font-semibold text-emerald transition hover:bg-emerald-pale cursor-pointer">
                      Jadikan Aktif
                    </button>
                  </form>
                )}
              </li>
            ))}
            {(ta ?? []).length === 0 && (
              <li className="py-4 text-center text-xs text-muted">Belum ada tahun ajaran.</li>
            )}
          </ul>

          <form action={tambahTahunAjaran} className="space-y-3 border-t border-line pt-4">
            <div className="text-xs font-medium text-muted">
              Periode baru
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <Label>Tahun Ajaran</Label>
                <input name="nama" placeholder="2026/2027" required className={input} />
              </label>
              <label className="block">
                <Label>Semester</Label>
                <select name="semester" className={input}>
                  <option value="ganjil">Ganjil</option>
                  <option value="genap">Genap</option>
                </select>
              </label>
            </div>
            <TombolKirim className="w-full">Tambah</TombolKirim>
          </form>
        </Kartu>
      </div>
    </div>
  );
}


