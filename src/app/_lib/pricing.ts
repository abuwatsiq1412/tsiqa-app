import type { IconName } from "../_components/icons";

/* ------------------------------------------------------------------ */
/*  Kontak                                                             */
/* ------------------------------------------------------------------ */
export const WA_NUMBER = "628197600441";
export const WA_DISPLAY = "+62 819-7600-441";
export const EMAIL = "abuwatsiq1412@gmail.com";

export function waLink(text: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

/* ------------------------------------------------------------------ */
/*  Aturan harga resmi TSIQA (Model Bersih & Transparan)               */
/* ------------------------------------------------------------------ */
export const CORE_KUOTA_DASAR = 100;
export const CORE_HARGA_DASAR = 59_000;
export const CORE_BLOK = 50;
export const CORE_HARGA_PER_BLOK = 10_000;
export const BULAN_BAYAR_TAHUNAN = 10; // Bayar 10 bulan, gratis 2 bulan
export const TARIF_SETUP_PER_SANTRI = 1_000; // Opsional, di luar paket dan di luar simulasi (hanya untuk catatan)

// Diskon add-on, dihitung dari subtotal modul (bukan Core).
export const DISKON_MODUL_SEDANG_MIN = 3; // 3-4 modul
export const DISKON_MODUL_SEDANG_PERSEN = 10;
export const DISKON_MODUL_BESAR_MIN = 5; // 5 modul atau lebih
export const DISKON_MODUL_BESAR_PERSEN = 15;

export const KUOTA_MIN = 100;
export const KUOTA_MAX = 1000;
export const KUOTA_STEP = 50;

export type ModulId =
  | "spp"
  | "wa"
  | "portal-wali"
  | "akademik"
  | "portal-guru"
  | "tahfidz"
  | "perizinan"
  | "ppdb"
  | "kas-dapur"
  | "poskestren";

export interface Modul {
  id: ModulId;
  kategori: string;
  nama: string;
  deskripsi: string;
  harga: number; // per bulan
  icon: IconName;
}

export const MODUL: Modul[] = [
  {
    id: "spp",
    kategori: "Keuangan",
    nama: "SPP & Kasir Pondok",
    deskripsi:
      "Tagihan bulanan atau bebas, catat pembayaran, kartu SPP, kwitansi, dan laporan kas harian.",
    harga: 20_000,
    icon: "wallet",
  },
  {
    id: "wa",
    kategori: "Komunikasi",
    nama: "WhatsApp Auto-Bot",
    deskripsi:
      "Pengiriman tagihan massal terjadwal via API resmi, notifikasi kepulangan, dan bot respon otomatis.",
    harga: 20_000,
    icon: "message",
  },
  {
    id: "portal-wali",
    kategori: "Portal",
    nama: "Portal Wali Santri",
    deskripsi: "Wali melihat tagihan, rapor, dan izin ananda langsung dari HP via PWA ringan.",
    harga: 20_000,
    icon: "users",
  },
  {
    id: "akademik",
    kategori: "Akademik",
    nama: "Akademik & E-Rapor",
    deskripsi:
      "Kurikulum diniyah dan formal, jadwal, absensi kelas, ledger nilai, cetak rapor semester.",
    harga: 30_000,
    icon: "book",
  },
  {
    id: "portal-guru",
    kategori: "Portal",
    nama: "Portal Guru & Asatidz",
    deskripsi: "Ustadz mengisi absensi dan nilai langsung dari HP.",
    harga: 15_000,
    icon: "award",
  },
  {
    id: "tahfidz",
    kategori: "Keagamaan",
    nama: "Tahfidz & Muroja'ah",
    deskripsi: "Setoran harian, target juz, ziyadah dan muroja'ah terstruktur serta laporan hafalan.",
    harga: 15_000,
    icon: "sparkles",
  },
  {
    id: "perizinan",
    kategori: "Ketertiban",
    nama: "Perizinan & Keamanan Asrama",
    deskripsi:
      "Izin keluar dan pulang, keterlambatan kembali, buku tamu, riwayat pelanggaran santri.",
    harga: 10_000,
    icon: "shield",
  },
  {
    id: "ppdb",
    kategori: "Penerimaan",
    nama: "PPDB / PSB Online",
    deskripsi: "Pendaftaran santri baru online, verifikasi berkas, pengumuman seleksi otomatis.",
    harga: 15_000,
    icon: "calendar",
  },
  {
    id: "kas-dapur",
    kategori: "Operasional",
    nama: "Kas Operasional & Dapur",
    deskripsi: "Arus kas yayasan, belanja logistik dapur, laporan buku kas harian.",
    harga: 10_000,
    icon: "home",
  },
  {
    id: "poskestren",
    kategori: "Kesehatan",
    nama: "Poskestren",
    deskripsi: "Rekam kesehatan santri, riwayat obat dan alergi, laporan kondisi ke orang tua.",
    harga: 10_000,
    icon: "medical",
  },
];

export type PaketId = "perintis" | "administrasi" | "terpadu" | "lengkap";

export interface Paket {
  id: PaketId;
  nama: string;
  untuk: string;
  kuota: number;
  modul: ModulId[];
  poin: string[];
  sorot?: string;
}

export const PAKET: Paket[] = [
  {
    id: "perintis",
    nama: "Perintis",
    untuk: "Mulai merapikan data pondok.",
    kuota: 100,
    modul: [],
    poin: [
      "Buku induk santri, kamar, dan kelas",
      "Alumni gratis, tidak memakan kuota",
      "Pengingat WhatsApp 1-klik (gratis)",
      "Impor data dari Excel",
    ],
  },
  {
    id: "administrasi",
    nama: "Administrasi",
    untuk: "Tagihan tertib, wali santri terinformasi.",
    kuota: 100,
    modul: ["spp", "wa", "portal-wali"],
    poin: [
      "Semua fitur Perintis",
      "SPP & Kasir dengan kwitansi",
      "WhatsApp Auto-Bot Gateway",
      "Portal Wali Santri PWA",
    ],
  },
  {
    id: "terpadu",
    nama: "Terpadu",
    untuk: "Administrasi dan kegiatan akademik berjalan bersama.",
    kuota: 200,
    modul: ["spp", "wa", "portal-wali", "akademik", "portal-guru"],
    poin: [
      "Kuota hingga 200 santri aktif",
      "Semua fitur Administrasi",
      "Akademik & E-Rapor (jadwal & nilai)",
      "Portal Guru & Asatidz",
    ],
    sorot: "Favorit",
  },
  {
    id: "lengkap",
    nama: "Lengkap",
    untuk: "Seluruh kebutuhan pondok dalam satu sistem.",
    kuota: 350,
    modul: [
      "spp",
      "wa",
      "portal-wali",
      "akademik",
      "portal-guru",
      "tahfidz",
      "perizinan",
      "ppdb",
      "kas-dapur",
      "poskestren",
    ],
    poin: [
      "Kuota hingga 350 santri aktif",
      "Semua fitur Terpadu",
      "Tahfidz, Perizinan, dan Poskestren",
      "PPDB Online, Kas Operasional & Dapur",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Perhitungan: Core + modul, dengan diskon add-on                    */
/* ------------------------------------------------------------------ */
export function hitungCore(kuota: number): number {
  const blokTambahan = Math.max(
    0,
    Math.ceil((kuota - CORE_KUOTA_DASAR) / CORE_BLOK)
  );
  return CORE_HARGA_DASAR + blokTambahan * CORE_HARGA_PER_BLOK;
}

export function persenDiskonModul(jumlahModul: number): number {
  if (jumlahModul >= DISKON_MODUL_BESAR_MIN) return DISKON_MODUL_BESAR_PERSEN;
  if (jumlahModul >= DISKON_MODUL_SEDANG_MIN) return DISKON_MODUL_SEDANG_PERSEN;
  return 0;
}

export interface HasilHarga {
  core: number;
  terpilih: Modul[];
  jumlahModul: number;
  subtotalModul: number;
  persenDiskon: number;
  diskon: number;
  perBulan: number;
  perTahun: number;
  hematTahunan: number;
  bayarAwal: number;
}

export function hitungHarga(input: {
  kuota: number;
  modul: ModulId[];
  tahunan: boolean;
}): HasilHarga {
  const core = hitungCore(input.kuota);
  const terpilih = MODUL.filter((m) => input.modul.includes(m.id));
  const subtotalModul = terpilih.reduce((acc, m) => acc + m.harga, 0);
  const persenDiskon = persenDiskonModul(terpilih.length);
  const diskon = Math.round((subtotalModul * persenDiskon) / 100);
  const perBulan = core + subtotalModul - diskon;
  const perTahun = perBulan * BULAN_BAYAR_TAHUNAN;
  const bayarAwal = input.tahunan ? perTahun : perBulan;

  return {
    core,
    terpilih,
    jumlahModul: terpilih.length,
    subtotalModul,
    persenDiskon,
    diskon,
    perBulan,
    perTahun,
    hematTahunan: perBulan * 2, // Hemat 2 bulan
    bayarAwal,
  };
}

export function rupiah(angka: number): string {
  return "Rp" + Math.round(angka).toLocaleString("id-ID");
}

export const HARGA_PAKET_UMUM = hitungHarga({
  kuota: 100,
  modul: PAKET.find((p) => p.id === "administrasi")!.modul,
  tahunan: false,
}).perBulan;
