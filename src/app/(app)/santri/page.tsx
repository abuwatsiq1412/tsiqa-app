import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { AvatarInisial, HeaderHalaman, Ikon, Kartu, Lencana, PesanNotifikasi, input, tombol, tombolSekunder, Kosong } from "@/components-ui";

const STATUS = ["aktif", "alumni", "boyong", "skorsing"];

export default async function Santri({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; ok?: string }>;
}) {
  const { q, status = "aktif", ok } = await searchParams;
  const { sb } = await konteks();

  let kueri = sb
    .from("santri")
    .select(
      "id, nis, nama, jenis_kelamin, tempat_tinggal, nama_wali, no_wa_wali, status, kamar_id, kelas_diniyah_id",
      { count: "exact" }
    )
    .order("nama")
    .limit(100);
  if (STATUS.includes(status)) kueri = kueri.eq("status", status);
  if (q)
    kueri = kueri.or(
      `nama.ilike.%${q.replace(/[%_,()]/g, "")}%,nis.ilike.%${q.replace(/[%_,()]/g, "")}%`
    );

  const [{ data, count }, { data: lg }, { count: aktif }, { data: kamar }, { data: kelas }] =
    await Promise.all([
      kueri,
      sb.from("langganan").select("kuota_santri").maybeSingle(),
      sb.from("santri").select("id", { count: "exact", head: true }).eq("status", "aktif"),
      sb.from("kamar").select("id, nama"),
      sb.from("kelas").select("id, nama"),
    ]);

  const namaKamar = new Map((kamar ?? []).map((k) => [k.id as string, k.nama as string]));
  const namaKelas = new Map((kelas ?? []).map((k) => [k.id as string, k.nama as string]));
  const jmlAktif = aktif ?? 0;
  const kuota = lg?.kuota_santri ?? 100;

  return (
    <>
      <HeaderHalaman
        judul="Santri"
        aksi={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-line bg-surface-soft/60 p-0.5">
              <a
                href="/santri/ekspor"
                className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-white hover:text-ink"
                title="Unduh data Excel"
              >
                <Ikon nama="unduh" className="h-3.5 w-3.5" />
                <span>Ekspor</span>
              </a>
              <Link
                href="/santri/impor"
                className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-muted transition hover:bg-white hover:text-ink"
                title="Unggah file Excel"
              >
                <Ikon nama="unggah" className="h-3.5 w-3.5" />
                <span>Impor</span>
              </Link>
            </div>
            <Link href="/santri/baru" className={tombol}>
              <Ikon nama="tambah" className="h-3.5 w-3.5" />
              <span>Tambah Santri</span>
            </Link>
          </div>
        }
      />

      <PesanNotifikasi ok={ok ? "Data santri berhasil disimpan." : undefined} />

      {/* Baris Filter Ramping & Status Kuota */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <form className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
          <div className="relative min-w-[200px] flex-1">
            <Ikon
              nama="cari"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari nama atau NIS..."
              className={`${input} pl-8.5`}
            />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <select name="status" defaultValue={status} className={`${input} !w-auto`}>
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
              <option value="semua">Semua Status</option>
            </select>
            <button className={tombolSekunder}>Terapkan</button>
            {(q || status !== "aktif") && (
              <Link href="/santri" className="px-2 py-1 text-xs text-muted hover:text-ink">
                Reset
              </Link>
            )}
          </div>
        </form>

        <div className="flex items-center gap-2 text-xs text-muted shrink-0">
          <span>Kuota</span>
          <span className="font-semibold text-ink">
            {jmlAktif} / {kuota}
          </span>
        </div>
      </div>

      {/* Tabel Direktori Santri */}
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-[0_1px_2px_rgba(24,38,34,0.03)]">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-surface-soft/70 text-left text-xs font-medium text-muted">
            <tr>
              <th className="px-5 py-3">Santri</th>
              <th className="px-4 py-3">Kamar & kelas</th>
              <th className="px-4 py-3">Wali</th>
              <th className="px-5 py-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(data ?? []).map((s) => (
              <tr key={s.id} className="group transition hover:bg-surface-soft/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <AvatarInisial nama={s.nama} warna={s.jenis_kelamin === "L" ? "teal" : "mint"} />
                    <div className="min-w-0">
                      <Link href={`/santri/${s.id}`} className="font-semibold text-ink hover:text-emerald hover:underline">
                        {s.nama}
                      </Link>
                      <div className="text-xs text-muted">
                        {s.nis} · {s.jenis_kelamin === "L" ? "Putra" : "Putri"} · {s.tempat_tinggal === "mukim" ? "Mukim" : "Kalong"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-ink">{(s.kamar_id && namaKamar.get(s.kamar_id)) || <span className="text-muted">Belum ada kamar</span>}</div>
                  <div className="text-xs text-muted">{(s.kelas_diniyah_id && namaKelas.get(s.kelas_diniyah_id)) || "Belum ada kelas"}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-ink">{s.nama_wali}</div>
                  <div className="text-xs text-muted">+{s.no_wa_wali}</div>
                </td>
                <td className="px-5 py-3 text-right">
                  {s.status === "aktif" ? (
                    <span className="text-xs text-muted">Aktif</span>
                  ) : (
                    <Lencana varian={s.status === "skorsing" ? "belum" : "netral"}>
                      {s.status[0].toUpperCase() + s.status.slice(1)}
                    </Lencana>
                  )}
                </td>
              </tr>
            ))}
            {(data ?? []).length === 0 && (
              <tr>
                <td colSpan={4}>
                  {q || status !== "aktif" ? (
                    <Kosong judul="Tidak ada santri yang cocok" isi="Coba kata kunci atau filter lain." />
                  ) : (
                    <Kosong judul="Belum ada santri" isi="Impor dari Excel atau tambah satu per satu."
                      aksi={<div className="flex justify-center gap-2"><Link href="/santri/impor" className={tombolSekunder}>Impor Excel</Link><Link href="/santri/baru" className={tombol}>Tambah Santri</Link></div>} />
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>
          Menampilkan {(data ?? []).length} dari {count ?? 0} santri
        </span>
        {(count ?? 0) > 100 && <span>100 teratas, gunakan pencarian untuk mempersempit.</span>}
      </div>
    </>
  );
}

