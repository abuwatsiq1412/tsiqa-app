import { notFound } from "next/navigation";
import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { TombolCetak } from "@/components-cetak";
import { muatRapor } from "@/modules/akademik/rapor";
import { tombolSekunder, Ikon } from "@/components-ui";

export default async function CetakRapor({ params }: { params: Promise<{ santri: string }> }) {
  const { santri: id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { sb, pondokId } = await konteks();
  const [{ data: s }, { data: p }] = await Promise.all([
    sb.from("santri").select("nama, nis").eq("id", id).maybeSingle(),
    sb.from("pondok").select("nama, alamat, kota").eq("id", pondokId).single(),
  ]);
  if (!s) notFound();
  const r = await muatRapor(sb, id, pondokId);
  const totalHadir = r.absen.hadir + r.absen.izin + r.absen.sakit + r.absen.alpa;

  return (
    <div className="space-y-4">
      <style>{"@page { size: A4; margin: 15mm; }"}</style>
      <div className="flex items-center justify-between border-b border-line pb-4 print:hidden">
        <Link href="/akademik/nilai" className={tombolSekunder}><Ikon nama="panah-kiri" className="h-4 w-4" />Kembali</Link>
        <TombolCetak />
      </div>
      <article className="mx-auto max-w-[780px] bg-white p-8 text-sm print:p-0">
        <div className="text-center"><div className="text-lg font-bold">{p?.nama}</div>{p?.alamat && <div className="text-xs text-muted">{p.alamat}{p.kota ? `, ${p.kota}` : ""}</div>}</div>
        <div className="my-4 border-t-2 border-ink" />
        <div className="text-center font-bold tracking-wide">LAPORAN HASIL BELAJAR</div>
        <dl className="mt-4 grid grid-cols-[120px_1fr] gap-y-1"><dt className="text-muted">Nama</dt><dd className="font-semibold">{s.nama}</dd><dt className="text-muted">NIS</dt><dd>{s.nis}</dd><dt className="text-muted">Tahun ajaran</dt><dd>{r.ta ? `${r.ta.nama} (${r.ta.semester})` : "-"}</dd></dl>
        <table className="mt-5 w-full border-collapse text-sm">
          <thead><tr className="bg-surface-soft text-left"><th className="border border-line px-3 py-2">Mata pelajaran</th><th className="border border-line px-3 py-2 text-center">Tugas</th><th className="border border-line px-3 py-2 text-center">UTS</th><th className="border border-line px-3 py-2 text-center">UAS</th><th className="border border-line px-3 py-2 text-center">Akhir</th></tr></thead>
          <tbody>{r.baris.length === 0 ? <tr><td colSpan={5} className="border border-line px-3 py-6 text-center text-muted">Belum ada nilai.</td></tr> : r.baris.map((b) => (
            <tr key={b.mapel}><td className="border border-line px-3 py-2">{b.mapel}</td><td className="border border-line px-3 py-2 text-center">{b.tugas ?? "-"}</td><td className="border border-line px-3 py-2 text-center">{b.uts ?? "-"}</td><td className="border border-line px-3 py-2 text-center">{b.uas ?? "-"}</td><td className="border border-line px-3 py-2 text-center font-bold">{b.akhir ?? "-"}</td></tr>
          ))}</tbody>
        </table>
        <p className="mt-3 text-xs text-muted">Bobot: tugas {r.bobot.bobot_tugas}%, UTS {r.bobot.bobot_uts}%, UAS {r.bobot.bobot_uas}%. Nilai minimal {r.bobot.kkm}.</p>
        <p className="mt-4"><b>Kehadiran:</b> hadir {r.absen.hadir}, izin {r.absen.izin}, sakit {r.absen.sakit}, alpa {r.absen.alpa}{totalHadir ? ` (${Math.round((r.absen.hadir / totalHadir) * 100)}%)` : ""}</p>
        {r.catatan && <p className="mt-3"><b>Catatan wali kelas:</b> {r.catatan}</p>}
      </article>
    </div>
  );
}
