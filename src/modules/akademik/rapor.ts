import type { SupabaseClient } from "@supabase/supabase-js";
import { BOBOT_BAWAAN, nilaiAkhir, type Bobot } from "./hitung";

export interface BarisRapor { mapel: string; tugas?: number; uts?: number; uas?: number; akhir: number | null }
export interface Rapor {
  ta: { id: string; nama: string; semester: string } | null;
  bobot: Bobot; baris: BarisRapor[]; catatan: string | null; dipublikasi: boolean;
  absen: { hadir: number; izin: number; sakit: number; alpa: number };
}

/** Rapor satu santri untuk tahun ajaran aktif. Hak akses ditentukan RLS pada sesi `sb`. */
export async function muatRapor(sb: SupabaseClient, santriId: string, pondokId: string): Promise<Rapor> {
  const { data: ta } = await sb.from("tahun_ajaran").select("id, nama, semester").eq("pondok_id", pondokId).eq("aktif", true).maybeSingle();
  const kosong = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
  if (!ta) return { ta: null, bobot: BOBOT_BAWAAN, baris: [], catatan: null, dipublikasi: false, absen: kosong };

  const [{ data: bw }, { data: nl }, { data: mp }, { data: rc }, { data: ab }] = await Promise.all([
    sb.from("akademik_pengaturan").select("bobot_tugas, bobot_uts, bobot_uas, kkm").eq("pondok_id", pondokId).maybeSingle(),
    sb.from("nilai").select("mapel_id, jenis, nilai").eq("santri_id", santriId).eq("tahun_ajaran_id", ta.id),
    sb.from("mapel").select("id, nama").eq("pondok_id", pondokId),
    sb.from("rapor_catatan").select("catatan, dipublikasi").eq("santri_id", santriId).eq("tahun_ajaran_id", ta.id).maybeSingle(),
    sb.from("absensi").select("status").eq("santri_id", santriId).gte("tanggal", (await tanggalMulai(sb, ta.id)) ?? "2000-01-01").limit(20000),
  ]);
  const bobot = (bw as Bobot | null) ?? BOBOT_BAWAAN;
  const nama = new Map((mp ?? []).map((m) => [m.id as string, m.nama as string]));
  const per = new Map<string, { tugas?: number; uts?: number; uas?: number }>();
  for (const n of nl ?? []) {
    const o = per.get(n.mapel_id as string) ?? {};
    o[n.jenis as "tugas" | "uts" | "uas"] = Number(n.nilai);
    per.set(n.mapel_id as string, o);
  }
  const baris = [...per.entries()].map(([id, o]) => ({ mapel: nama.get(id) ?? "-", ...o, akhir: nilaiAkhir(o, bobot) })).sort((a, b) => a.mapel.localeCompare(b.mapel));
  const absen = { ...kosong };
  for (const a of ab ?? []) absen[a.status as keyof typeof absen]++;
  return { ta, bobot, baris, catatan: (rc?.catatan as string | null) ?? null, dipublikasi: !!rc?.dipublikasi, absen };
}

async function tanggalMulai(sb: SupabaseClient, taId: string) {
  const { data } = await sb.from("tahun_ajaran").select("mulai").eq("id", taId).maybeSingle();
  return (data?.mulai as string | null) ?? null;
}
