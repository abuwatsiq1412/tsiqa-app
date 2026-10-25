export interface Bobot { bobot_tugas: number; bobot_uts: number; bobot_uas: number; kkm: number }
export const BOBOT_BAWAAN: Bobot = { bobot_tugas: 30, bobot_uts: 30, bobot_uas: 40, kkm: 70 };
export const HARI = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Ahad"];
export const jam = (t: string) => t.slice(0, 5);

/** Nilai akhir berbobot. Komponen yang belum ada tidak dihitung (bobot dinormalkan). */
export function nilaiAkhir(n: { tugas?: number; uts?: number; uas?: number }, b: Bobot): number | null {
  const k: [number | undefined, number][] = [[n.tugas, b.bobot_tugas], [n.uts, b.bobot_uts], [n.uas, b.bobot_uas]];
  const ada = k.filter(([v]) => v !== undefined);
  const bobot = ada.reduce((s, [, w]) => s + w, 0);
  if (!ada.length || bobot === 0) return null;
  return Math.round((ada.reduce((s, [v, w]) => s + (v as number) * w, 0) / bobot) * 10) / 10;
}
