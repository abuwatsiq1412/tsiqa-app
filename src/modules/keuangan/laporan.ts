import type { SupabaseClient } from "@supabase/supabase-js";
import { akhirHari, awalHari, hariIni, tanggalValid } from "@/lib/waktu";

export interface BarisKas {
  id: string; tanggal: string; nomor: string; santri: string; nis: string; tagihan: string;
  metode: string; nominal: number; penerima: string; batal: boolean; alasan: string | null;
}

/** Rentang dari query string; default hari ini (WIB), dibatasi 366 hari. */
export function bacaRentang(dari?: string, sampai?: string) {
  const hari = hariIni();
  let a = tanggalValid(dari) ? dari : hari;
  let b = tanggalValid(sampai) ? sampai : a;
  if (b < a) [a, b] = [b, a];
  const lebih = (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000 > 366;
  if (lebih) a = hariIni(new Date(new Date(b).getTime() - 366 * 86_400_000));
  return { dari: a, sampai: b };
}

export async function ambilKas(sb: SupabaseClient, dari: string, sampai: string): Promise<BarisKas[]> {
  const { data } = await sb.from("pembayaran")
    .select("id, tanggal, nomor_kwitansi, santri_id, tagihan_id, metode, nominal, penerima_nama, dibatalkan_pada, alasan_batal")
    .gte("tanggal", awalHari(dari)).lte("tanggal", akhirHari(sampai)).order("tanggal").limit(5000);
  const baris = data ?? [];
  const sid = [...new Set(baris.map((b) => b.santri_id as string))];
  const tid = [...new Set(baris.map((b) => b.tagihan_id as string))];
  const [{ data: s }, { data: t }] = await Promise.all([
    sid.length ? sb.from("santri").select("id, nama, nis").in("id", sid) : { data: [] },
    tid.length ? sb.from("tagihan").select("id, judul").in("id", tid) : { data: [] },
  ]);
  const ps = new Map((s ?? []).map((x) => [x.id as string, x])), pt = new Map((t ?? []).map((x) => [x.id as string, x.judul as string]));
  return baris.map((b) => ({
    id: b.id, tanggal: b.tanggal, nomor: b.nomor_kwitansi, santri: ps.get(b.santri_id)?.nama ?? "-", nis: ps.get(b.santri_id)?.nis ?? "",
    tagihan: pt.get(b.tagihan_id) ?? "-", metode: b.metode, nominal: Number(b.nominal), penerima: b.penerima_nama,
    batal: !!b.dibatalkan_pada, alasan: b.alasan_batal,
  }));
}

export function ringkasKas(baris: BarisKas[]) {
  const sah = baris.filter((b) => !b.batal);
  const perMetode: Record<string, number> = {};
  sah.forEach((b) => (perMetode[b.metode] = (perMetode[b.metode] ?? 0) + b.nominal));
  return { total: sah.reduce((a, b) => a + b.nominal, 0), jumlah: sah.length, dibatalkan: baris.length - sah.length, perMetode };
}
