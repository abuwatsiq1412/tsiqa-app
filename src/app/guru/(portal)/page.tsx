import Link from "next/link";
import { muatGuru, hariKe } from "@/lib/guru";
import { hariIni } from "@/lib/waktu";
import { HARI, jam } from "@/modules/akademik/hitung";

export const metadata = { title: "Jadwal" };
interface J { id: string; pondok: string; hari: number; jam_mulai: string; jam_selesai: string; kelas: string; mapel: string; jumlah_santri: number }

export default async function BerandaGuru() {
  const { sb } = await muatGuru();
  const { data } = await sb.rpc("jadwal_guru");
  const semua = (data ?? []) as J[];
  const hari = hariKe(hariIni());
  const hariIniList = semua.filter((j) => j.hari === hari);
  const lain = semua.filter((j) => j.hari !== hari);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-extrabold tracking-tight">Hari ini</h1>
        <p className="mb-3 mt-0.5 text-[13px] text-muted">{HARI[hari]}, {new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "long" }).format(new Date())}</p>
        {hariIniList.length === 0 ? <p className="rounded-2xl border border-dashed border-line py-8 text-center text-sm text-muted">Tidak ada jadwal mengajar hari ini.</p> : (
          <div className="flex flex-col gap-3">{hariIniList.map((j) => <Kartu key={j.id} j={j} utama />)}</div>
        )}
      </section>
      {lain.length > 0 && (
        <section>
          <h2 className="mb-2.5 text-base font-extrabold">Jadwal lainnya</h2>
          <div className="flex flex-col gap-2.5">{lain.map((j) => <Kartu key={j.id} j={j} />)}</div>
        </section>
      )}
    </div>
  );
}

function Kartu({ j, utama }: { j: J; utama?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><div className="truncate text-[15px] font-bold">{j.mapel}</div><div className="text-xs text-muted">{j.kelas} · {j.jumlah_santri} santri · {j.pondok}</div></div>
        <div className="text-right text-xs font-semibold text-muted">{!utama && <div>{HARI[j.hari]}</div>}{jam(j.jam_mulai)}–{jam(j.jam_selesai)}</div>
      </div>
      <div className="mt-3 flex gap-2">
        {utama && <Link href={`/guru/absen/${j.id}`} className="tekan flex h-11 flex-1 items-center justify-center rounded-xl bg-emerald text-sm font-bold text-white">Absen</Link>}
        <Link href={`/guru/nilai/${j.id}`} className="tekan flex h-11 flex-1 items-center justify-center rounded-xl border border-line text-sm font-bold text-forest">Nilai</Link>
      </div>
    </div>
  );
}
