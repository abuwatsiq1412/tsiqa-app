import { TombolKirim } from "@/components-form";
import { konteks } from "@/lib/konteks";
import { opsiPenempatan } from "@/lib/opsi";
import {
  HeaderHalaman,
  Ikon,
  Kartu,
  Label,
  PesanNotifikasi,
  input,
  tombol,
} from "@/components-ui";
import { tempatkan } from "./actions";

export default async function Penempatan({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    asal_kamar?: string;
    asal_diniyah?: string;
    asal_formal?: string;
    galat?: string;
    ok?: string;
  }>;
}) {
  const { q, asal_kamar, asal_diniyah, asal_formal, galat, ok } = await searchParams;
  const { sb } = await konteks();
  const o = await opsiPenempatan();

  let kueri = sb
    .from("santri")
    .select("id, nis, nama, kamar_id, kelas_diniyah_id, kelas_formal_id")
    .eq("status", "aktif")
    .order("nama")
    .limit(400);

  if (q) kueri = kueri.ilike("nama", `%${q.replace(/[%_,()]/g, "")}%`);
  if (asal_kamar) kueri = kueri.eq("kamar_id", asal_kamar);
  if (asal_diniyah) kueri = kueri.eq("kelas_diniyah_id", asal_diniyah);
  if (asal_formal) kueri = kueri.eq("kelas_formal_id", asal_formal);

  const { data } = await kueri;
  const nama = (l: { id: string; nama: string }[], id: string | null) =>
    l.find((x) => x.id === id)?.nama ?? "-";

  return (
    <>
      <HeaderHalaman
        judul="Penempatan Kamar & Kelas"
        deskripsi="Saring santri berdasarkan kamar atau kelas asal, centang santri yang ingin dipindahkan atau dinaikkan kelasnya, lalu pilih tujuan baru."
      />

      <PesanNotifikasi
        ok={ok ? `${ok} santri berhasil dipindahkan.` : undefined}
        galat={galat}
      />

      {/* Filter Pencarian & Kelas/Kamar Asal untuk mempermudah Kenaikan Kelas Massal */}
      <Kartu className="mb-5">
        <form method="GET" action="/penempatan" className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <Label>Cari Nama Santri</Label>
            <div className="relative">
              <Ikon
                nama="cari"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              />
              <input
                name="q"
                defaultValue={q}
                placeholder="Ketik nama..."
                className={`${input} pl-9`}
              />
            </div>
          </label>

          <label className="block">
            <Label>Filter Kamar Saat Ini</Label>
            <select name="asal_kamar" defaultValue={asal_kamar ?? ""} className={input}>
              <option value="">Semua Kamar</option>
              {o.kamar.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <Label>Filter Kelas Diniyah</Label>
            <select name="asal_diniyah" defaultValue={asal_diniyah ?? ""} className={input}>
              <option value="">Semua Diniyah</option>
              {o.diniyah.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <Label>Filter Kelas Formal</Label>
            <select name="asal_formal" defaultValue={asal_formal ?? ""} className={input}>
              <option value="">Semua Formal</option>
              {o.formal.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </label>

          <TombolKirim className="w-full justify-center">Tampilkan</TombolKirim>
        </form>
      </Kartu>

      <form action={tempatkan} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
                <tr>
                  <th className="w-12 px-5 py-3">Pilih</th>
                  <th className="px-4 py-3">Nama Santri</th>
                  <th className="px-4 py-3">Kamar Saat Ini</th>
                  <th className="px-4 py-3">Kelas Diniyah</th>
                  <th className="px-5 py-3">Kelas Formal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(data ?? []).map((s) => (
                  <tr key={s.id} className="transition hover:bg-surface-soft/60">
                    <td className="px-5 py-3">
                      <input
                        type="checkbox"
                        name="santri"
                        value={s.id}
                        defaultChecked={Boolean(asal_kamar || asal_diniyah || asal_formal)}
                        className="h-4 w-4 cursor-pointer rounded border-line accent-emerald"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink">{s.nama}</div>
                      <div className="font-mono text-xs text-muted">NIS {s.nis}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{nama(o.kamar, s.kamar_id)}</td>
                    <td className="px-4 py-3 text-muted">{nama(o.diniyah, s.kelas_diniyah_id)}</td>
                    <td className="px-5 py-3 text-muted">{nama(o.formal, s.kelas_formal_id)}</td>
                  </tr>
                ))}
                {(data ?? []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted">
                      Santri tidak ditemukan untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Kartu className="sticky top-22">
          <h2 className="mb-1 text-base font-semibold text-ink">Tujuan baru</h2>
          <p className="mb-4 text-xs text-muted">
            Pilihan &ldquo;Tidak diubah&rdquo; mempertahankan penempatan lama.
          </p>
          <div className="space-y-3.5">
            <label className="block">
              <Label>Kamar Asrama</Label>
              <select name="kamar" className={input}>
                <option value="">— Tidak diubah —</option>
                {o.kamar.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <Label>Kelas Diniyah</Label>
              <select name="diniyah" className={input}>
                <option value="">— Tidak diubah —</option>
                {o.diniyah.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <Label>Kelas Formal</Label>
              <select name="formal" className={input}>
                <option value="">— Tidak diubah —</option>
                {o.formal.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <Label>Keterangan Riwayat</Label>
              <input
                name="keterangan"
                placeholder="Mis. Kenaikan kelas ganjil"
                className={input}
              />
            </label>
            <button className={`${tombol} w-full`}>
              <Ikon nama="penempatan" className="h-4 w-4" />
              <span>Terapkan Penempatan</span>
            </button>
          </div>
        </Kartu>
      </form>
    </>
  );
}