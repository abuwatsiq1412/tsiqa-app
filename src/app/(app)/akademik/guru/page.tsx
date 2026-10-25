import { TombolKirim } from "@/components-form";
import { konteks } from "@/lib/konteks";
import { daftarModul, modulAktif } from "@/lib/modul";
import { tampilNomor } from "@/lib/akun-wali";
import { HeaderHalaman, Kartu, Lencana, PesanNotifikasi, Ikon, input, tombol, tombolSekunder } from "@/components-ui";
import { tambahGuru, undangGuru, ubahStatusGuru } from "../actions";

export default async function Guru({ searchParams }: { searchParams: Promise<{ ok?: string; galat?: string }> }) {
  const { ok, galat } = await searchParams;
  const { sb } = await konteks();
  const portal = modulAktif(await daftarModul(), "portal_guru");
  const { data } = await sb.from("guru").select("id, nama, no_wa, aktif, user_id").order("nama");
  return (
    <>
      <HeaderHalaman kategori="Akademik" judul="Guru" deskripsi={portal ? "Undang guru lewat WhatsApp agar bisa mengisi absensi dan nilai dari HP." : "Aktifkan modul Portal Guru agar guru bisa mengisi absensi dan nilai sendiri."} />
      <PesanNotifikasi ok={ok} galat={galat} />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <Kartu className="overflow-hidden !p-0">
          {(data ?? []).length === 0 ? <p className="px-5 py-10 text-center text-sm text-muted">Belum ada guru.</p> : (
            <ul className="divide-y divide-line/70">
              {data!.map((g) => (
                <li key={g.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm font-semibold ${g.aktif ? "" : "text-muted line-through"}`}>{g.nama}</div>
                    <div className="text-xs text-muted">{tampilNomor(g.no_wa)}</div>
                  </div>
                  {portal && (g.user_id ? <Lencana varian="lunas">Sudah masuk</Lencana> : g.aktif ? (
                    <form action={undangGuru}><input type="hidden" name="id" value={g.id} /><button className={tombol}><Ikon nama="wa" className="h-4 w-4" />Undang</button></form>
                  ) : null)}
                  <form action={ubahStatusGuru}>
                    <input type="hidden" name="id" value={g.id} /><input type="hidden" name="aktif" value={g.aktif ? "0" : "1"} />
                    <button className={tombolSekunder}>{g.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </Kartu>
        <Kartu>
          <form action={tambahGuru} className="space-y-3">
            <input name="nama" required placeholder="Nama guru" className={input} />
            <input name="no_wa" required inputMode="tel" placeholder="Nomor WhatsApp, mis. 0812…" className={input} />
            <TombolKirim className="w-full">Tambah guru</TombolKirim>
          </form>
        </Kartu>
      </div>
    </>
  );
}
