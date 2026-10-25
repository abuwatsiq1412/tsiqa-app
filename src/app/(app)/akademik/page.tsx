import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Kartu } from "@/components-ui";

export default async function Akademik() {
  const { sb } = await konteks();
  const [g, m, j, k] = await Promise.all(
    ["guru", "mapel", "jadwal", "kelas"].map((t) => sb.from(t).select("id", { count: "exact", head: true })),
  );
  const langkah = [
    { href: "/akademik/mapel", judul: "Mata pelajaran", n: m.count ?? 0, ket: "Daftar mapel yang diajarkan" },
    { href: "/akademik/guru", judul: "Guru", n: g.count ?? 0, ket: "Pengajar dan akun Portal Guru" },
    { href: "/akademik/jadwal", judul: "Jadwal", n: j.count ?? 0, ket: `Untuk ${k.count ?? 0} kelas` },
  ];
  return (
    <>
      <HeaderHalaman kategori="Akademik" judul="Akademik" deskripsi="Atur mapel, guru dan jadwal. Guru mengisi absensi dan nilai dari HP, rapor dibuka ke wali setelah Anda periksa." />
      <div className="grid gap-4 sm:grid-cols-3">
        {langkah.map((l) => (
          <Link key={l.href} href={l.href}>
            <Kartu className="h-full transition hover:border-emerald/40">
              <div className="text-xs font-medium text-muted">{l.judul}</div>
              <div className="mt-2 text-2xl font-bold tracking-tight">{l.n}</div>
              <div className="mt-1 text-xs text-muted">{l.ket}</div>
            </Kartu>
          </Link>
        ))}
      </div>
    </>
  );
}
