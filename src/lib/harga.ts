// Harga paket dasar (Core) & aturan diskon resmi TSIQA Cloud.
export const CORE_KUOTA_DASAR = 150;
export const CORE_HARGA_DASAR = 59_000;
export const CORE_BLOK = 100;
export const CORE_HARGA_PER_BLOK = 15_000; // +Rp15.000 per 100 santri aktif
export const BULAN_BAYAR_TAHUNAN = 11; // bayar 11 bulan untuk layanan 12 bulan (hemat 1 bulan)
export const BIAYA_SETUP_PENDAMPINGAN = 150_000; // Minimum charge pendampingan setup

export const hargaCore = (kuota: number) =>
  CORE_HARGA_DASAR +
  Math.max(0, Math.ceil((kuota - CORE_KUOTA_DASAR) / CORE_BLOK)) *
    CORE_HARGA_PER_BLOK;

/** Diskon bundling dalam persen bulat: 3-4 modul = 10, >=5 modul = 15. Satu-satunya aturan diskon. */
export const diskonPersen = (jumlahModul: number) =>
  jumlahModul >= 5 ? 15 : jumlahModul >= 3 ? 10 : 0;

/** Menghitung diskon bundling modul. */
export function hitungDiskonModul(hargaModul: number[]) {
  const jumlah = hargaModul.length;
  const subtotal = hargaModul.reduce((a, b) => a + b, 0);
  const persenDiskon = diskonPersen(jumlah) / 100;
  const nominalDiskon = Math.round(subtotal * persenDiskon);
  return {
    jumlah,
    subtotal,
    persenDiskon,
    nominalDiskon,
    totalSetelahDiskon: subtotal - nominalDiskon,
  };
}

/** Perkiraan tagihan per bulan (ekuivalen bulanan) untuk satu pondok. */
export function perkiraanBulanan(
  kuota: number,
  siklus: string,
  hargaModul: number[]
) {
  const { totalSetelahDiskon } = hitungDiskonModul(hargaModul);
  const bulanan = hargaCore(kuota) + totalSetelahDiskon;
  return siklus === "tahunan"
    ? Math.round((bulanan * BULAN_BAYAR_TAHUNAN) / 12)
    : bulanan;
}

export type StatusAkses =
  | "menunggu"
  | "percobaan"
  | "aktif"
  | "tenggang"
  | "terkunci"
  | "berhenti";

/** Status efektif: memperhitungkan verifikasi awal, tanggal berakhir, dan masa tenggang 7 hari. */
export function statusAkses(
  status: string | null,
  berakhir: string | null,
  hariIni = new Date(),
  siklus?: string | null
): StatusAkses {
  if (status === "menunggu" || (status === "berhenti" && siklus === "percobaan")) {
    return "menunggu";
  }
  if (!status || status === "berhenti") return "berhenti";
  if (!berakhir) return "terkunci";
  const sisa = Math.floor(
    (new Date(berakhir).getTime() -
      new Date(hariIni.toISOString().slice(0, 10)).getTime()) /
      86_400_000
  );
  if (sisa >= 0) return status === "percobaan" ? "percobaan" : "aktif";
  return sisa >= -7 ? "tenggang" : "terkunci";
}