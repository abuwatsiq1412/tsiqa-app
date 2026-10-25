import { IkonW } from "@/components-wali-ikon";
import Link from "next/link";
import { notFound } from "next/navigation";
import { muatGuru } from "@/lib/guru";
import { hariIni, tanggalValid, tanggalLengkap } from "@/lib/waktu";
import { FormAbsen } from "@/components-guru";

export const metadata = { title: "Absensi" };

export default async function Absen({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ t?: string }> }) {
  const { id } = await params;
  const { t } = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const tanggal = tanggalValid(t) && t <= hariIni() ? t : hariIni();
  const { sb } = await muatGuru();
  const { data, error } = await sb.rpc("roster_jadwal", { p_jadwal: id, p_tanggal: tanggal });
  if (error) notFound();
  const santri = (data ?? []) as { santri_id: string; nis: string; nama: string; status: "hadir" | "izin" | "sakit" | "alpa" | null }[];

  return (
    <div>
      <Link href="/guru" className="flex h-11 items-center text-sm font-bold text-emerald"><IkonW n="kiri" className="mr-1 h-5 w-5" />Jadwal</Link>
      <h1 className="text-2xl font-extrabold tracking-tight">Absensi</h1>
      <p className="mb-4 mt-0.5 text-[13px] text-muted">{tanggalLengkap(tanggal)}</p>
      {santri.length === 0 ? <p className="rounded-2xl border border-dashed border-line py-8 text-center text-sm text-muted">Belum ada santri di kelas ini.</p> : (
        <FormAbsen jadwal={id} tanggal={tanggal} santri={santri.map((s) => ({ id: s.santri_id, nama: s.nama, nis: s.nis, status: s.status }))} />
      )}
    </div>
  );
}
