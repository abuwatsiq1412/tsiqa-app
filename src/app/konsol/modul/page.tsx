import { wajibStaf } from "@/lib/staf";
import {
  Kartu,
  HeaderHalaman,
  PesanNotifikasi,
  input,
  tombol,
  Lencana,
  Ikon,
} from "@/components-ui";
import { ubahModul } from "./actions";

export default async function KatalogModul({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; ok?: string }>;
}) {
  const { galat, ok } = await searchParams;
  const sb = await wajibStaf();
  const { data } = await sb.from("modul").select("*").order("urutan");

  return (
    <div className="space-y-6">
      <HeaderHalaman
        judul="Katalog & Harga"
        deskripsi="Perubahan harga langsung memengaruhi estimasi tagihan semua pondok."
      />

      {ok && <PesanNotifikasi tipe="sukses" pesan="Katalog modul berhasil diperbarui." />}
      {galat && <PesanNotifikasi tipe="error" pesan={galat} />}

      <Kartu className="!p-0 overflow-hidden">
        <div className="border-b border-line bg-surface-soft/60 px-5 py-3 text-xs font-medium text-muted">
          Modul
        </div>
        <ul className="divide-y divide-line">
          {(data ?? []).map((m) => (
            <li key={m.kode} className="transition-colors hover:bg-emerald-pale/20">
              <form action={ubahModul} className="flex flex-wrap items-center gap-4 px-5 py-4 text-sm">
                <input type="hidden" name="kode" value={m.kode} />
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{m.nama}</span>
                    <span className="font-mono text-xs text-muted">({m.kode})</span>
                    {m.tersedia ? (
                      <Lencana varian="lunas">Tersedia</Lencana>
                    ) : (
                      <Lencana varian="netral">Menyusul</Lencana>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5 capitalize">
                    Kategori: {m.kategori}
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    name="tersedia"
                    defaultChecked={m.tersedia}
                    className="h-4 w-4 rounded border-line text-emerald focus:ring-emerald/20"
                  />
                  Tersedia
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Rp</span>
                  <input
                    name="harga_bulanan"
                    type="number"
                    min={0}
                    step={1000}
                    defaultValue={Number(m.harga_bulanan)}
                    className={`${input} w-36 py-1.5`}
                  />
                  <span className="text-xs text-muted">/ bln</span>
                </div>

                <button className={tombol}>
                  <Ikon.Centang className="h-4 w-4" />
                  Simpan
                </button>
              </form>
            </li>
          ))}
        </ul>
      </Kartu>
    </div>
  );
}

