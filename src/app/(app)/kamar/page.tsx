import { TombolKirim } from "@/components-form";
import { konteks } from "@/lib/konteks";
import { BarProgres, HeaderHalaman, Kartu, Label, Lencana, PesanNotifikasi, input, tombol, Kosong } from "@/components-ui";
import { tambahKamar, hapusKamar } from "./actions";

export default async function Kamar({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const { galat } = await searchParams;
  const { sb } = await konteks();
  const [{ data: kamar }, { data: huni }] = await Promise.all([
    sb.from("kamar").select("*").order("kode"),
    sb.from("santri").select("kamar_id").eq("status", "aktif").not("kamar_id", "is", null),
  ]);
  const hunian = new Map<string, number>();
  (huni ?? []).forEach((s) => hunian.set(s.kamar_id, (hunian.get(s.kamar_id) ?? 0) + 1));

  return (
    <>
      <HeaderHalaman
        judul="Kamar"
      />

      <PesanNotifikasi galat={galat} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(24,38,34,0.03)]">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-5 py-3">Kode & Nama Kamar</th>
                <th className="px-4 py-3">Asrama</th>
                <th className="px-4 py-3">Musyrif / Pendamping</th>
                <th className="px-4 py-3 w-48">Keterisian</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(kamar ?? []).map((k) => {
                const n = hunian.get(k.id) ?? 0;
                const penuh = n > k.kapasitas;
                return (
                  <tr key={k.id} className="transition hover:bg-surface-soft/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-surface-soft px-2 py-0.5 font-mono text-xs font-semibold text-ink">
                          {k.kode}
                        </span>
                        <span className="font-semibold text-ink">{k.nama}</span>
                      </div>
                      {k.komplek && (
                        <div className="mt-0.5 text-xs text-muted">Komplek: {k.komplek}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Lencana varian={k.jenis === "putra" ? "mint" : "netral"} titik={false}>
                        {k.jenis === "putra" ? "Putra" : "Putri"}
                      </Lencana>
                    </td>
                    <td className="px-4 py-3 text-muted">{k.musyrif || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="mb-1 flex justify-between text-xs">
                        <span className={penuh ? "font-semibold text-belum" : "font-medium text-ink"}>
                          {n} / {k.kapasitas} santri
                        </span>
                      </div>
                      <BarProgres nilai={n} maks={k.kapasitas} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <form action={hapusKamar}>
                        <input type="hidden" name="id" value={k.id} />
                        <button className="text-xs font-medium text-muted transition hover:text-belum cursor-pointer">
                          Hapus
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
              {(kamar ?? []).length === 0 && (
                <tr>
                  <td colSpan={5}><Kosong judul="Belum ada kamar" isi="Tambahkan kamar pertama lewat formulir di samping." /></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Kartu>
          <h2 className="mb-3 text-sm font-semibold text-ink">Tambah kamar</h2>
          <form action={tambahKamar} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <Label>Kode *</Label>
                <input name="kode" placeholder="A-01" required className={input} />
              </label>
              <label className="block">
                <Label>Jenis</Label>
                <select name="jenis" className={input}>
                  <option value="putra">Putra</option>
                  <option value="putri">Putri</option>
                </select>
              </label>
            </div>
            <label className="block">
              <Label>Nama kamar *</Label>
              <input name="nama" placeholder="Al-Farabi 1" required className={input} />
            </label>
            <label className="block">
              <Label>Komplek / gedung</Label>
              <input name="komplek" placeholder="Gedung Utara" className={input} />
            </label>
            <label className="block">
              <Label>Musyrif / musyrifah</Label>
              <input name="musyrif" placeholder="Ust. Ahmad" className={input} />
            </label>
            <label className="block">
              <Label>Kapasitas santri</Label>
              <input name="kapasitas" type="number" min={1} defaultValue={20} className={input} />
            </label>
            <TombolKirim className="w-full">Tambah Kamar</TombolKirim>
          </form>
        </Kartu>
      </div>
    </>
  );
}

