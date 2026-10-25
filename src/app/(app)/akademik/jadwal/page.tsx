import { TombolKirim } from "@/components-form";
import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Kartu, PesanNotifikasi, input, tombol, tombolSekunder } from "@/components-ui";
import { HARI, jam } from "@/modules/akademik/hitung";
import { tambahJadwal, hapusJadwal } from "../actions";

export default async function Jadwal({ searchParams }: { searchParams: Promise<{ ok?: string; galat?: string; kelas?: string }> }) {
  const { ok, galat, kelas } = await searchParams;
  const { sb } = await konteks();
  const [{ data: kls }, { data: mp }, { data: gr }, { data: jd }] = await Promise.all([
    sb.from("kelas").select("id, nama").order("nama"),
    sb.from("mapel").select("id, nama").order("nama"),
    sb.from("guru").select("id, nama").eq("aktif", true).order("nama"),
    (kelas ? sb.from("jadwal").select("id, hari, jam_mulai, jam_selesai, kelas_id, mapel_id, guru_id").eq("kelas_id", kelas) : sb.from("jadwal").select("id, hari, jam_mulai, jam_selesai, kelas_id, mapel_id, guru_id"))
      .order("hari").order("jam_mulai"),
  ]);
  const nk = new Map((kls ?? []).map((x) => [x.id, x.nama])), nm = new Map((mp ?? []).map((x) => [x.id, x.nama]));
  const { data: semuaGuru } = await sb.from("guru").select("id, nama");
  const ng = new Map((semuaGuru ?? []).map((x) => [x.id, x.nama]));
  const lengkap = (kls?.length ?? 0) > 0 && (mp?.length ?? 0) > 0 && (gr?.length ?? 0) > 0;

  return (
    <>
      <HeaderHalaman kategori="Akademik" judul="Jadwal Pelajaran" />
      <PesanNotifikasi ok={ok} galat={galat} />
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_330px]">
        <div>
          <form className="mb-3 flex gap-2">
            <select name="kelas" defaultValue={kelas ?? ""} className={`${input} !w-auto`}>
              <option value="">Semua kelas</option>
              {(kls ?? []).map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
            <button className={tombolSekunder}>Tampilkan</button>
          </form>
          <Kartu className="overflow-hidden !p-0">
            {(jd ?? []).length === 0 ? <p className="px-5 py-10 text-center text-sm text-muted">Belum ada jadwal.</p> : (
              <ul className="divide-y divide-line/70">
                {jd!.map((j) => (
                  <li key={j.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <span className="w-24 shrink-0"><b>{HARI[j.hari]}</b><br /><span className="text-xs text-muted">{jam(j.jam_mulai)}–{jam(j.jam_selesai)}</span></span>
                    <span className="min-w-0 flex-1 truncate"><b>{nm.get(j.mapel_id)}</b> · {nk.get(j.kelas_id)}<br /><span className="text-xs text-muted">{ng.get(j.guru_id)}</span></span>
                    <form action={hapusJadwal}><input type="hidden" name="id" value={j.id} /><button className={tombolSekunder}>Hapus</button></form>
                  </li>
                ))}
              </ul>
            )}
          </Kartu>
        </div>
        <Kartu>
          {lengkap ? (
            <form action={tambahJadwal} className="space-y-3">
              <select name="kelas_id" required className={input} defaultValue={kelas ?? ""}><option value="" disabled>Kelas</option>{kls!.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}</select>
              <select name="mapel_id" required className={input} defaultValue=""><option value="" disabled>Mata pelajaran</option>{mp!.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}</select>
              <select name="guru_id" required className={input} defaultValue=""><option value="" disabled>Guru</option>{gr!.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}</select>
              <select name="hari" className={input}>{HARI.slice(1).map((h, i) => <option key={h} value={i + 1}>{h}</option>)}</select>
              <div className="flex gap-2"><input name="jam_mulai" type="time" required className={input} /><input name="jam_selesai" type="time" required className={input} /></div>
              <TombolKirim className="w-full">Tambah jadwal</TombolKirim>
            </form>
          ) : <p className="text-sm text-muted">Lengkapi dulu kelas, mata pelajaran, dan guru.</p>}
        </Kartu>
      </div>
    </>
  );
}
