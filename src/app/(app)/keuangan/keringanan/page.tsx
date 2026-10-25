import { TombolKirim } from "@/components-form";
import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Ikon, Kartu, Label, Lencana, PesanNotifikasi, input, tombol, Kosong } from "@/components-ui";
import { rupiah } from "@/lib/format";
import { simpanKeringanan, hapusKeringanan } from "./actions";

export default async function Keringanan({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; galat?: string; ok?: string }>;
}) {
  const { q, galat, ok } = await searchParams;
  const { sb } = await konteks();
  const { data: daftar } = await sb
    .from("keringanan_santri")
    .select("santri_id, nominal, catatan");
  const ids = (daftar ?? []).map((d) => d.santri_id as string);
  const { data: nama } = ids.length
    ? await sb.from("santri").select("id, nama, nis").in("id", ids)
    : { data: [] };
  const peta = new Map((nama ?? []).map((s) => [s.id as string, s]));

  let hasil: { id: string; nama: string; nis: string }[] = [];
  if (q) {
    const { data } = await sb
      .from("santri")
      .select("id, nama, nis")
      .eq("status", "aktif")
      .ilike("nama", `%${q.replace(/[%_,()]/g, "")}%`)
      .order("nama")
      .limit(10);
    hasil = (data ?? []) as typeof hasil;
  }

  return (
    <>
      <HeaderHalaman
        judul="Keringanan & Beasiswa"
      />

      <PesanNotifikasi ok={ok ? "Tersimpan." : undefined} galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(24,38,34,0.03)]">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-5 py-3">Santri</th>
                <th className="px-4 py-3">Tarif Syahriyah Khusus</th>
                <th className="px-4 py-3">Keterangan / Alasan</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(daftar ?? []).map((d) => (
                <tr key={d.santri_id} className="transition hover:bg-surface-soft/60">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-ink">
                      {peta.get(d.santri_id)?.nama ?? "-"}
                    </div>
                    <div className="font-mono text-xs text-muted">
                      NIS {peta.get(d.santri_id)?.nis}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Lencana varian="mint" titik={false}>
                      { Number(d.nominal) === 0 ? "Gratis (Rp 0)" : `${rupiah(Number(d.nominal))} / bln` }
                    </Lencana>
                  </td>
                  <td className="px-4 py-3 text-muted">{d.catatan ?? "-"}</td>
                  <td className="px-5 py-3 text-right">
                    <form action={hapusKeringanan}>
                      <input type="hidden" name="santri_id" value={d.santri_id} />
                      <button className="text-xs font-medium text-muted transition hover:text-belum cursor-pointer">
                        Hapus
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(daftar ?? []).length === 0 && (
                <tr>
                  <td colSpan={4}><Kosong judul="Belum ada keringanan" isi="Santri dengan tarif khusus akan muncul di sini." /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Kartu>
          <h2 className="mb-1 text-base font-semibold text-ink">Atur keringanan</h2>
          <p className="mb-4 text-xs text-muted">
            Isi 0 untuk beasiswa penuh.
          </p>
          <form className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Ikon
                nama="cari"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              />
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari nama santri..."
                className={`${input} pl-9`}
              />
            </div>
            <TombolKirim>Cari</TombolKirim>
          </form>
          {q && (
            <form action={simpanKeringanan} className="space-y-3.5 border-t border-line pt-4">
              <label className="block">
                <Label>Pilih Santri</Label>
                <select name="santri_id" className={input}>
                  {hasil.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} · NIS {s.nis}
                    </option>
                  ))}
                </select>
              </label>
              {hasil.length === 0 && (
                <p className="text-xs text-belum">Santri tidak ditemukan.</p>
              )}
              <label className="block">
                <Label>Tarif Syahriyah Khusus / Bulan (Rp)</Label>
                <input name="nominal" type="number" min={0} required className={input} />
              </label>
              <label className="block">
                <Label>Keterangan</Label>
                <input
                  name="catatan"
                  placeholder="Yatim, adik-kakak, beasiswa tahfidz..."
                  className={input}
                />
              </label>
              <button className={`${tombol} w-full`} disabled={hasil.length === 0}>
                Simpan Keringanan
              </button>
            </form>
          )}
        </Kartu>
      </div>
    </>
  );
}

