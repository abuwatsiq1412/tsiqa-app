import { TombolKirim } from "@/components-form";
import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Kartu, Label, Lencana, PesanNotifikasi, input, tombol, Kosong } from "@/components-ui";
import { tambahKelas, hapusKelas } from "./actions";

export default async function Kelas({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const { galat } = await searchParams;
  const { sb } = await konteks();
  const [{ data: kelas }, { data: santri }] = await Promise.all([
    sb.from("kelas").select("*").order("jenis").order("kode"),
    sb.from("santri").select("kelas_diniyah_id, kelas_formal_id").eq("status", "aktif"),
  ]);
  const jumlah = new Map<string, number>();
  (santri ?? []).forEach((s) =>
    [s.kelas_diniyah_id, s.kelas_formal_id].forEach(
      (id) => id && jumlah.set(id, (jumlah.get(id) ?? 0) + 1)
    )
  );

  return (
    <>
      <HeaderHalaman
        judul="Kelas"
      />

      <PesanNotifikasi galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(24,38,34,0.03)]">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-5 py-3">Kode & Nama Kelas</th>
                <th className="px-4 py-3">Jalur Pendidikan</th>
                <th className="px-4 py-3">Wali Kelas / Mustahiq</th>
                <th className="px-4 py-3">Jumlah Santri</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(kelas ?? []).map((k) => (
                <tr key={k.id} className="transition hover:bg-surface-soft/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-surface-soft px-2 py-0.5 font-mono text-xs font-semibold text-ink">
                        {k.kode}
                      </span>
                      <span className="font-semibold text-ink">{k.nama}</span>
                    </div>
                    {k.tingkat && (
                      <div className="mt-0.5 text-xs text-muted">Tingkat: {k.tingkat}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Lencana varian={k.jenis === "diniyah" ? "mint" : "netral"} titik={false}>
                      {k.jenis === "diniyah" ? "Diniyah" : "Formal"}
                    </Lencana>
                  </td>
                  <td className="px-4 py-3 text-muted">{k.wali_kelas ?? "-"}</td>
                  <td className="px-4 py-3 font-medium text-ink">{jumlah.get(k.id) ?? 0} santri</td>
                  <td className="px-5 py-3 text-right">
                    <form action={hapusKelas}>
                      <input type="hidden" name="id" value={k.id} />
                      <button className="text-xs font-medium text-muted transition hover:text-belum cursor-pointer">
                        Hapus
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {(kelas ?? []).length === 0 && (
                <tr>
                  <td colSpan={5}><Kosong judul="Belum ada kelas" isi="Tambahkan kelas pertama lewat formulir di samping." /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Kartu>
          <h2 className="mb-3 text-sm font-semibold text-ink">Tambah kelas</h2>
          <form action={tambahKelas} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <Label>Kode *</Label>
                <input name="kode" placeholder="W-1 / 7A" required className={input} />
              </label>
              <label className="block">
                <Label>Jenis</Label>
                <select name="jenis" className={input}>
                  <option value="diniyah">Diniyah</option>
                  <option value="formal">Formal</option>
                </select>
              </label>
            </div>
            <label className="block">
              <Label>Nama kelas *</Label>
              <input name="nama" placeholder="Wustha 1 / VII-A" required className={input} />
            </label>
            <label className="block">
              <Label>Tingkat / Marhalah</Label>
              <input name="tingkat" placeholder="Ula, Wustha, MTs, MA..." className={input} />
            </label>
            <label className="block">
              <Label>Wali kelas / Mustahiq</Label>
              <input name="wali_kelas" placeholder="Ust. Abdullah" className={input} />
            </label>
            <TombolKirim className="w-full">Tambah Kelas</TombolKirim>
          </form>
        </Kartu>
      </div>
    </>
  );
}

