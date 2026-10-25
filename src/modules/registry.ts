import type { NamaIkon } from "@/components-ui";

/**
 * Daftar modul berbayar dan menu yang dibawanya. Menu sebuah modul hanya muncul bila
 * modul itu aktif untuk pondok. Menambah modul baru = tambah satu entri di sini,
 * satu folder di src/app/(app)/<kode>, dan satu berkas migrasi.
 */
export interface MenuModul {
  label: string;
  href: string;
  ikon: NamaIkon;
  /** Sorot hanya bila alamat sama persis. */
  persis?: boolean;
}

export const MENU_MODUL: Record<string, MenuModul[]> = {
  keuangan: [
    { label: "Ringkasan", href: "/keuangan", ikon: "keuangan", persis: true },
    { label: "Tagihan", href: "/keuangan/tagihan", ikon: "tagihan" },
    { label: "Terima Bayar", href: "/keuangan/pembayaran", ikon: "kasir" },
    { label: "Laporan", href: "/keuangan/laporan", ikon: "laporan" },
    { label: "Keringanan", href: "/keuangan/keringanan", ikon: "keringanan" },
    { label: "Konfirmasi Transfer", href: "/keuangan/konfirmasi", ikon: "cek" },
  ],
  portal_wali: [
    { label: "Wali Santri", href: "/wali-santri", ikon: "pengguna" },
  ],
  akademik: [
    { label: "Ringkasan", href: "/akademik", ikon: "kelas", persis: true },
    { label: "Guru", href: "/akademik/guru", ikon: "pengguna" },
    { label: "Mata Pelajaran", href: "/akademik/mapel", ikon: "laporan" },
    { label: "Jadwal", href: "/akademik/jadwal", ikon: "kalender" },
    { label: "Absensi", href: "/akademik/absensi", ikon: "cek" },
    { label: "Nilai & Rapor", href: "/akademik/nilai", ikon: "tagihan" },
  ],
  tahfidz: [
    { label: "Setoran & Absen", href: "/tahfidz", ikon: "cek", persis: true },
    { label: "Kenaikan Juz", href: "/tahfidz/juz", ikon: "laporan" },
    { label: "Kelompok Halaqah", href: "/tahfidz/halaqah", ikon: "kelas" },
  ],
  perizinan: [
    { label: "Izin & Gerbang", href: "/perizinan", ikon: "kunci", persis: true },
    { label: "Laporan Keterlambatan", href: "/perizinan/keterlambatan", ikon: "kalender" },
    { label: "Disiplin & Pelanggaran", href: "/perizinan/pelanggaran", ikon: "peringatan" },
  ],
  website: [
    { label: "Tampilan & Seksi", href: "/website", ikon: "gedung", persis: true },
    { label: "Profil & Unit", href: "/website/profil", ikon: "santri" },
    { label: "Berita & Pengumuman", href: "/website/tulisan", ikon: "laporan" },
    { label: "Galeri Kegiatan", href: "/website/galeri", ikon: "kamar" },
    { label: "Info PSB & Kontak", href: "/website/pendaftaran", ikon: "wa" },
  ],
};


