import { muatWali, pilihAnak } from "@/lib/wali";
import { muatRapor } from "@/modules/akademik/rapor";

export const metadata = { title: "Rapor" };

export default async function RaporWali({ searchParams }: { searchParams: Promise<{ a?: string }> }) {
  const { a } = await searchParams;
  const { sb, anak } = await muatWali();
  const aktif = pilihAnak(anak, a);
  if (!aktif) return null;
  const r = await muatRapor(sb, aktif.id, aktif.pondok_id);
  const total = r.absen.hadir + r.absen.izin + r.absen.sakit + r.absen.alpa;

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Rapor</h1>
      <p className="mb-4 mt-0.5 text-[13px] text-muted">{aktif.nama}{r.ta ? ` · ${r.ta.nama} (${r.ta.semester})` : ""}</p>

      {!r.dipublikasi ? (
        <p className="rounded-2xl border border-dashed border-line px-5 py-10 text-center text-sm leading-relaxed text-muted">Rapor belum dibuka oleh pondok. Anda akan melihatnya di sini setelah tersedia.</p>
      ) : (
        <div className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-2xl border border-line bg-white">
            {r.baris.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted">Belum ada nilai.</p> : (
              <ul className="divide-y divide-line/70">
                {r.baris.map((b) => (
                  <li key={b.mapel} className="flex items-center gap-3 px-4 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold">{b.mapel}</span>
                      <span className="text-xs text-muted">Tugas {b.tugas ?? "-"} · UTS {b.uts ?? "-"} · UAS {b.uas ?? "-"}</span>
                    </span>
                    <span className={`text-xl font-extrabold ${b.akhir !== null && b.akhir < r.bobot.kkm ? "text-belum" : "text-forest"}`}>{b.akhir ?? "-"}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-2xl border border-line bg-white p-4">
            <h2 className="text-sm font-extrabold">Kehadiran</h2>
            <div className="mt-2 grid grid-cols-4 gap-2 text-center">
              {([["Hadir", r.absen.hadir], ["Izin", r.absen.izin], ["Sakit", r.absen.sakit], ["Alpa", r.absen.alpa]] as const).map(([l, n]) => (
                <div key={l} className="rounded-xl bg-surface-soft py-2.5"><div className="text-lg font-extrabold">{n}</div><div className="text-[11px] text-muted">{l}</div></div>
              ))}
            </div>
            {total > 0 && <p className="mt-2.5 text-xs text-muted">Kehadiran {Math.round((r.absen.hadir / total) * 100)}% dari {total} pertemuan.</p>}
          </section>
          {r.catatan && <section className="rounded-2xl bg-gold-pale/70 p-4 text-sm leading-relaxed text-gold-ink"><b>Catatan wali kelas:</b> {r.catatan}</section>}
        </div>
      )}
    </div>
  );
}
