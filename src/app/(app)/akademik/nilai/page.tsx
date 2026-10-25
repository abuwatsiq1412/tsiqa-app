import Link from "next/link";
import { konteks } from "@/lib/konteks";
import { HeaderHalaman, Kartu, Label, Lencana, PesanNotifikasi, input, tombol, tombolSekunder } from "@/components-ui";
import { BOBOT_BAWAAN, nilaiAkhir, type Bobot } from "@/modules/akademik/hitung";
import { simpanBobot, publikasiRapor, simpanCatatan } from "../actions";

export default async function NilaiRapor({ searchParams }: { searchParams: Promise<{ kelas?: string; ok?: string; galat?: string }> }) {
  const { kelas, ok, galat } = await searchParams;
  const { sb, pondokId } = await konteks();
  const [{ data: kls }, { data: bw }, { data: ta }, { data: mp }] = await Promise.all([
    sb.from("kelas").select("id, nama").order("nama"),
    sb.from("akademik_pengaturan").select("bobot_tugas, bobot_uts, bobot_uas, kkm").maybeSingle(),
    sb.from("tahun_ajaran").select("id, nama, semester").eq("aktif", true).maybeSingle(),
    sb.from("mapel").select("id, nama").order("nama"),
  ]);
  const bobot = (bw as Bobot | null) ?? BOBOT_BAWAAN;

  let santri: { id: string; nama: string }[] = [];
  const nilai = new Map<string, Record<string, { tugas?: number; uts?: number; uas?: number }>>();
  const rapor = new Map<string, { catatan: string | null; dipublikasi: boolean }>();
  if (kelas && ta) {
    const { data: ss } = await sb.from("santri").select("id, nama").eq("status", "aktif").or(`kelas_diniyah_id.eq.${kelas},kelas_formal_id.eq.${kelas}`).order("nama");
    santri = ss ?? [];
    const ids = santri.map((s) => s.id);
    if (ids.length) {
      const [{ data: nl }, { data: rc }] = await Promise.all([
        sb.from("nilai").select("santri_id, mapel_id, jenis, nilai").eq("tahun_ajaran_id", ta.id).in("santri_id", ids).limit(20000),
        sb.from("rapor_catatan").select("santri_id, catatan, dipublikasi").eq("tahun_ajaran_id", ta.id).in("santri_id", ids),
      ]);
      for (const n of nl ?? []) {
        const m = nilai.get(n.santri_id) ?? {}; const o = m[n.mapel_id] ?? {};
        o[n.jenis as "tugas" | "uts" | "uas"] = Number(n.nilai); m[n.mapel_id] = o; nilai.set(n.santri_id, m);
      }
      for (const r of rc ?? []) rapor.set(r.santri_id, { catatan: r.catatan, dipublikasi: r.dipublikasi });
    }
  }
  const mapelAda = (mp ?? []).filter((m) => santri.some((s) => nilai.get(s.id)?.[m.id]));
  const semuaBuka = santri.length > 0 && santri.every((s) => rapor.get(s.id)?.dipublikasi);

  return (
    <>
      <HeaderHalaman kategori="Akademik" judul="Nilai & Rapor" deskripsi={ta ? `Tahun ajaran ${ta.nama} (${ta.semester}). Nilai diisi guru; rapor baru terlihat wali setelah dibuka di sini.` : undefined} />
      <PesanNotifikasi ok={ok} galat={galat ?? (ta ? undefined : "Belum ada tahun ajaran aktif. Atur di Pengaturan.")} />

      <Kartu className="mb-5">
        <form action={simpanBobot} className="flex flex-wrap items-end gap-3">
          {([["bobot_tugas", "Bobot tugas %"], ["bobot_uts", "Bobot UTS %"], ["bobot_uas", "Bobot UAS %"], ["kkm", "Nilai minimal (KKM)"]] as const).map(([k, l]) => (
            <div key={k}><Label>{l}</Label><input name={k} type="number" min={0} max={100} defaultValue={bobot[k]} className={`${input} !w-28`} /></div>
          ))}
          <button className={tombolSekunder}>Simpan</button>
        </form>
      </Kartu>

      <form className="mb-4 flex gap-2">
        <select name="kelas" defaultValue={kelas ?? ""} className={`${input} !w-auto`}><option value="" disabled>Pilih kelas</option>{(kls ?? []).map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}</select>
        <button className={tombolSekunder}>Tampilkan</button>
      </form>

      {kelas && santri.length > 0 && (
        <>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">{santri.length} santri · rapor {semuaBuka ? "terbuka untuk wali" : "belum dibuka semua"}</span>
            <form action={publikasiRapor}>
              <input type="hidden" name="kelas" value={kelas} /><input type="hidden" name="buka" value={semuaBuka ? "0" : "1"} />
              <button className={semuaBuka ? tombolSekunder : tombol}>{semuaBuka ? "Tutup dari wali" : "Buka rapor untuk wali"}</button>
            </form>
          </div>
          <Kartu className="overflow-x-auto !p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-2.5 font-medium">Santri</th>
                {mapelAda.map((m) => <th key={m.id} className="px-3 font-medium">{m.nama}</th>)}
                <th className="px-3 font-medium">Catatan</th><th className="px-5 font-medium">Rapor</th>
              </tr></thead>
              <tbody className="divide-y divide-line/70">
                {santri.map((s) => (
                  <tr key={s.id} className="align-top">
                    <td className="px-5 py-2.5 font-medium">{s.nama}</td>
                    {mapelAda.map((m) => { const a = nilaiAkhir(nilai.get(s.id)?.[m.id] ?? {}, bobot); return (
                      <td key={m.id} className={`px-3 py-2.5 ${a !== null && a < bobot.kkm ? "font-semibold text-belum" : ""}`}>{a ?? "-"}</td>
                    ); })}
                    <td className="px-3 py-2">
                      <form action={simpanCatatan} className="flex gap-1.5">
                        <input type="hidden" name="santri" value={s.id} /><input type="hidden" name="kelas" value={kelas} />
                        <input name="catatan" defaultValue={rapor.get(s.id)?.catatan ?? ""} placeholder="Catatan wali kelas" maxLength={500} className={`${input} !w-48`} />
                        <button className={tombolSekunder}>Simpan</button>
                      </form>
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5">
                      {rapor.get(s.id)?.dipublikasi ? <Lencana varian="lunas">Terbuka</Lencana> : <Lencana varian="netral">Tertutup</Lencana>}{" "}
                      <Link href={`/akademik/nilai/rapor/${s.id}`} className="text-xs font-semibold text-emerald hover:underline">Cetak</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Kartu>
        </>
      )}
    </>
  );
}
