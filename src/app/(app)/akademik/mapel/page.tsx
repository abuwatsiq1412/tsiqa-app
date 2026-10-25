import { TombolKirim } from "@/components-form";
import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Kartu, PesanNotifikasi, input, tombol, tombolSekunder } from "@/components-ui";
import { tambahMapel, hapusMapel } from "../actions";

export default async function Mapel({ searchParams }: { searchParams: Promise<{ ok?: string; galat?: string }> }) {
  const { ok, galat } = await searchParams;
  const { sb } = await konteks();
  const { data } = await sb.from("mapel").select("id, nama").order("nama");
  return (
    <>
      <HeaderHalaman kategori="Akademik" judul="Mata Pelajaran" />
      <PesanNotifikasi ok={ok} galat={galat} />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <Kartu className="overflow-hidden !p-0">
          {(data ?? []).length === 0 ? <p className="px-5 py-10 text-center text-sm text-muted">Belum ada mata pelajaran.</p> : (
            <ul className="divide-y divide-line/70">
              {data!.map((m) => (
                <li key={m.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <span className="font-medium">{m.nama}</span>
                  <form action={hapusMapel}><input type="hidden" name="id" value={m.id} /><button className={tombolSekunder}>Hapus</button></form>
                </li>
              ))}
            </ul>
          )}
        </Kartu>
        <Kartu>
          <form action={tambahMapel} className="space-y-3">
            <input name="nama" required placeholder="Mis. Nahwu" className={input} />
            <TombolKirim className="w-full">Tambah</TombolKirim>
          </form>
        </Kartu>
      </div>
    </>
  );
}
