import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Kartu, input, tombolSekunder } from "@/components-ui";
import { hariIni } from "@/lib/waktu";

export default async function RekapAbsensi({ searchParams }: { searchParams: Promise<{ kelas?: string; bulan?: string }> }) {
  const { kelas, bulan = hariIni().slice(0, 7) } = await searchParams;
  const { sb } = await konteks();
  const { data: kls } = await sb.from("kelas").select("id, nama").order("nama");
  const ok = /^\d{4}-\d{2}$/.test(bulan);
  let baris: { id: string; nama: string; h: number; i: number; s: number; a: number }[] = [];
  if (kelas && ok) {
    const [y, m] = bulan.split("-").map(Number);
    const akhir = new Date(y, m, 1).toISOString().slice(0, 10);
    const { data: ss } = await sb.from("santri").select("id, nama").eq("status", "aktif").or(`kelas_diniyah_id.eq.${kelas},kelas_formal_id.eq.${kelas}`).order("nama");
    const { data: ab } = await sb.from("absensi").select("santri_id, status, jadwal!inner(kelas_id)").eq("jadwal.kelas_id", kelas).gte("tanggal", `${bulan}-01`).lt("tanggal", akhir).limit(20000);
    const cacah = new Map<string, Record<string, number>>();
    for (const r of ab ?? []) { const c = cacah.get(r.santri_id) ?? {}; c[r.status] = (c[r.status] ?? 0) + 1; cacah.set(r.santri_id, c); }
    baris = (ss ?? []).map((s) => { const c = cacah.get(s.id) ?? {}; return { id: s.id, nama: s.nama, h: c.hadir ?? 0, i: c.izin ?? 0, s: c.sakit ?? 0, a: c.alpa ?? 0 }; });
  }
  return (
    <>
      <HeaderHalaman kategori="Akademik" judul="Rekap Absensi" deskripsi="Dihitung dari absensi yang diisi guru per pertemuan." />
      <form className="mb-4 flex flex-wrap gap-2">
        <select name="kelas" defaultValue={kelas ?? ""} className={`${input} !w-auto`}><option value="" disabled>Pilih kelas</option>{(kls ?? []).map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}</select>
        <input name="bulan" type="month" defaultValue={bulan} className={`${input} !w-auto`} />
        <button className={tombolSekunder}>Tampilkan</button>
      </form>
      <Kartu className="overflow-hidden !p-0">
        {baris.length === 0 ? <p className="px-5 py-10 text-center text-sm text-muted">{kelas ? "Belum ada santri di kelas ini." : "Pilih kelas untuk melihat rekap."}</p> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line text-left text-xs text-muted"><th className="px-5 py-2.5 font-medium">Santri</th><th className="px-3 font-medium">Hadir</th><th className="px-3 font-medium">Izin</th><th className="px-3 font-medium">Sakit</th><th className="px-3 font-medium">Alpa</th><th className="px-5 text-right font-medium">Kehadiran</th></tr></thead>
            <tbody className="divide-y divide-line/70">
              {baris.map((b) => { const t = b.h + b.i + b.s + b.a; return (
                <tr key={b.id}><td className="px-5 py-2.5 font-medium">{b.nama}</td><td className="px-3">{b.h}</td><td className="px-3">{b.i}</td><td className="px-3">{b.s}</td><td className={`px-3 ${b.a ? "font-semibold text-belum" : ""}`}>{b.a}</td><td className="px-5 text-right">{t ? Math.round((b.h / t) * 100) + "%" : "-"}</td></tr>
              ); })}
            </tbody>
          </table>
        )}
      </Kartu>
    </>
  );
}
