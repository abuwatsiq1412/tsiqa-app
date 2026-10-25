import { supabaseAdmin } from "@/lib/supabase/admin";

export interface KesepakatanHarga {
  harga_khusus: number | null; // Rp per bulan (null = ikut rumus standar Core + Modul - Diskon)
  catatan_harga: string | null; // misal: "Harga khusus Pondok Pilot Gelombang 1"
}

/**
 * Mengambil kesepakatan harga khusus untuk satu pondok.
 * Membaca dari jejak_audit (tabel = 'kesepakatan_harga') menggunakan service role
 * agar langsung berfungsi tanpa wajib migrasi skema baru terlebih dahulu.
 */
export async function ambilKesepakatanHarga(pondokId: string): Promise<KesepakatanHarga> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { harga_khusus: null, catatan_harga: null };
  }
  try {
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("jejak_audit")
      .select("sesudah")
      .eq("pondok_id", pondokId)
      .eq("tabel", "kesepakatan_harga")
      .order("waktu", { ascending: false })
      .limit(1)
      .maybeSingle();

    const s = data?.sesudah as { harga_khusus?: number | null; catatan_harga?: string | null } | null;
    if (!s) return { harga_khusus: null, catatan_harga: null };
    const nominal = Number(s.harga_khusus ?? 0);
    return {
      harga_khusus: nominal > 0 ? nominal : null,
      catatan_harga: s.catatan_harga ? String(s.catatan_harga) : null,
    };
  } catch {
    return { harga_khusus: null, catatan_harga: null };
  }
}

/**
 * Mengambil peta kesepakatan harga khusus untuk seluruh pondok sekaligus (dipakai di /konsol).
 */
export async function ambilSemuaKesepakatanHarga(): Promise<Map<string, KesepakatanHarga>> {
  const peta = new Map<string, KesepakatanHarga>();
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return peta;
  try {
    const admin = supabaseAdmin();
    const { data } = await admin
      .from("jejak_audit")
      .select("pondok_id, sesudah, waktu")
      .eq("tabel", "kesepakatan_harga")
      .order("waktu", { ascending: false });

    for (const row of data ?? []) {
      const pid = String(row.pondok_id);
      if (peta.has(pid)) continue; // hanya ambil yang terbaru per pondok
      const s = row.sesudah as { harga_khusus?: number | null; catatan_harga?: string | null } | null;
      const nominal = Number(s?.harga_khusus ?? 0);
      peta.set(pid, {
        harga_khusus: nominal > 0 ? nominal : null,
        catatan_harga: s?.catatan_harga ? String(s.catatan_harga) : null,
      });
    }
  } catch {
    // abaikan bila gagal
  }
  return peta;
}

/**
 * Menyimpan kesepakatan harga khusus untuk satu pondok.
 * Bila hargaKhusus <= 0 atau null, maka kesepakatan khusus dihapus (kembali ke harga rumus standar).
 */
export async function simpanKesepakatanHarga(
  pondokId: string,
  hargaKhusus: number | null,
  catatanHarga: string | null,
  userId?: string | null
) {
  const admin = supabaseAdmin();
  const bersihNominal = hargaKhusus && hargaKhusus > 0 ? Math.round(hargaKhusus) : null;
  const bersihCatatan = catatanHarga?.trim() ? catatanHarga.trim() : null;

  await admin.from("jejak_audit").insert({
    pondok_id: pondokId,
    user_id: userId ?? null,
    aksi: "update",
    tabel: "kesepakatan_harga",
    sesudah: {
      harga_khusus: bersihNominal,
      catatan_harga: bersihCatatan,
    },
  });
}

const SATUAN = [
  "",
  "Satu",
  "Dua",
  "Tiga",
  "Empat",
  "Lima",
  "Enam",
  "Tujuh",
  "Delapan",
  "Sembilan",
  "Sepuluh",
  "Sebelas",
];

function ejaAngka(n: number): string {
  n = Math.floor(Math.abs(n));
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${ejaAngka(n - 10)} Belas`.trim();
  if (n < 100) return `${ejaAngka(Math.floor(n / 10))} Puluh ${ejaAngka(n % 10)}`.trim();
  if (n < 200) return `Seratus ${ejaAngka(n - 100)}`.trim();
  if (n < 1000) return `${ejaAngka(Math.floor(n / 100))} Ratus ${ejaAngka(n % 100)}`.trim();
  if (n < 2000) return `Seribu ${ejaAngka(n - 1000)}`.trim();
  if (n < 1_000_000) return `${ejaAngka(Math.floor(n / 1000))} Ribu ${ejaAngka(n % 1000)}`.trim();
  if (n < 1_000_000_000)
    return `${ejaAngka(Math.floor(n / 1_000_000))} Juta ${ejaAngka(n % 1_000_000)}`.trim();
  return `${ejaAngka(Math.floor(n / 1_000_000_000))} Miliar ${ejaAngka(n % 1_000_000_000)}`.trim();
}

/** Mengubah angka nominal menjadi teks terbilang Bahasa Indonesia (untuk Kwitansi & Invoice). */
export function terbilangRupiah(nominal: number): string {
  if (!nominal || nominal <= 0) return "Nol Rupiah";
  return `${ejaAngka(nominal).replace(/\s+/g, " ")} Rupiah`;
}
