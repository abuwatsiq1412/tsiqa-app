import { IkonW } from "@/components-wali-ikon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { muatGuru } from "@/lib/guru";
import { pesanGalat } from "@/lib/format";
import { simpanNilaiGuru } from "../../../actions";

export const metadata = { title: "Nilai" };
const JENIS = [["tugas", "Tugas"], ["uts", "UTS"], ["uas", "UAS"]] as const;

export default async function Nilai({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ j?: string; ok?: string; galat?: string }> }) {
  const { id } = await params;
  const { j, ok, galat } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const jenis = JENIS.some(([k]) => k === j) ? (j as string) : "tugas";
  const { sb } = await muatGuru();
  const { data, error } = await sb.rpc("roster_nilai", { p_jadwal: id, p_jenis: jenis });
  if (error) return <p className="py-10 text-center text-sm text-muted">{pesanGalat(error.message)}</p>;
  const santri = (data ?? []) as { santri_id: string; nis: string; nama: string; nilai: number | null }[];

  return (
    <div>
      <Link href="/guru" className="flex h-11 items-center text-sm font-bold text-emerald"><IkonW n="kiri" className="mr-1 h-5 w-5" />Jadwal</Link>
      <h1 className="text-2xl font-extrabold tracking-tight">Nilai</h1>
      <div role="tablist" className="mb-4 mt-3 flex gap-2">
        {JENIS.map(([k, l]) => (
          <Link key={k} role="tab" aria-selected={k === jenis} href={`/guru/nilai/${id}?j=${k}`} className={`flex h-10 items-center rounded-full px-4 text-[13px] font-bold ${k === jenis ? "bg-forest text-white" : "border border-line bg-white text-muted"}`}>{l}</Link>
        ))}
      </div>
      {ok && <p role="status" className="mb-3 rounded-xl bg-emerald-pale px-4 py-3 text-[13px] font-semibold text-emerald">Nilai tersimpan.</p>}
      {galat && <p role="alert" className="mb-3 rounded-xl bg-belum-bg px-4 py-3 text-[13px] font-medium text-belum">{galat}</p>}
      <form action={simpanNilaiGuru}>
        <input type="hidden" name="jadwal" value={id} /><input type="hidden" name="jenis" value={jenis} />
        <ul className="flex flex-col gap-2">
          {santri.map((s) => (
            <li key={s.santri_id} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3">
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{s.nama}</span><span className="text-xs text-muted">{s.nis}</span></span>
              <input name={`n_${s.santri_id}`} type="number" inputMode="decimal" min={0} max={100} step="0.1" defaultValue={s.nilai ?? ""} placeholder="–"
                className="h-12 w-20 rounded-xl border border-line text-center text-base font-bold outline-none focus:border-emerald focus:ring-2 focus:ring-emerald/20" />
            </li>
          ))}
        </ul>
        {santri.length > 0 && <button className="tekan sticky bottom-4 mt-4 h-[52px] w-full cursor-pointer rounded-2xl bg-emerald text-base font-bold text-white shadow-lg">Simpan nilai</button>}
      </form>
    </div>
  );
}
