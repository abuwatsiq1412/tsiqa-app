export const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

export const tanggal = (s: string | null | undefined) => {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(d);
};

export const tanggalLengkap = (s: string | null | undefined) => {
  if (!s) return "-";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(d);
};

/** 0812… / 812… / +62812… → 62812… */
export function nomorWA(input: string): string {
  const d = input.replace(/\D/g, "");
  if (d.startsWith("0")) return "62" + d.slice(1);
  if (d.startsWith("8")) return "62" + d;
  return d;
}

const SATUAN = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
function baca(n: number): string {
  if (n < 12) return SATUAN[n];
  if (n < 20) return baca(n - 10) + " belas";
  if (n < 100) return baca(Math.floor(n / 10)) + " puluh" + (n % 10 ? " " + baca(n % 10) : "");
  if (n < 200) return "seratus" + (n > 100 ? " " + baca(n - 100) : "");
  if (n < 1000) return baca(Math.floor(n / 100)) + " ratus" + (n % 100 ? " " + baca(n % 100) : "");
  if (n < 2000) return "seribu" + (n > 1000 ? " " + baca(n - 1000) : "");
  if (n < 1e6) return baca(Math.floor(n / 1e3)) + " ribu" + (n % 1e3 ? " " + baca(n % 1e3) : "");
  if (n < 1e9) return baca(Math.floor(n / 1e6)) + " juta" + (n % 1e6 ? " " + baca(n % 1e6) : "");
  return baca(Math.floor(n / 1e9)) + " miliar" + (n % 1e9 ? " " + baca(n % 1e9) : "");
}
export const terbilang = (n: number) => (n <= 0 ? "nol rupiah" : baca(Math.floor(n)) + " rupiah");

/** Pesan galat dari database → kalimat sopan untuk pengguna. */
export function pesanGalat(msg: string): string {
  const peta: Record<string, string> = {
    MELEBIHI_SISA_TAGIHAN: "Nominal melebihi sisa tagihan.",
    NOMINAL_TIDAK_VALID: "Nominal belum valid.",
    TIDAK_BERHAK: "Akun Anda belum memiliki izin untuk tindakan ini.",
    LANGGANAN_BERAKHIR: "Langganan telah berakhir. Silakan perpanjang untuk melanjutkan pencatatan.",
    KUOTA_SANTRI_PENUH: "Kuota santri aktif sudah penuh. Tambah kuota untuk melanjutkan.",
    ALASAN_WAJIB: "Mohon isi alasan pembatalan.",
    MODUL_TIDAK_AKTIF: "Fitur ini belum diaktifkan untuk pondok Anda. Lihat halaman Langganan.",
    ADMIN_TERAKHIR: "Pondok harus memiliki setidaknya satu admin aktif.",
    TAHUN_AJARAN_BELUM_AKTIF: "Belum ada tahun ajaran aktif. Atur di Pengaturan.",
    TUJUAN_KOSONG: "Pilih kamar atau kelas tujuan.",
    BULAN_TIDAK_VALID: "Jumlah bulan harus antara 1 dan 36.",
    SUDAH_DIBATALKAN: "Pembayaran ini sudah dibatalkan.",
    SUDAH_PUNYA_PONDOK: "Akun ini sudah terhubung ke sebuah pondok.",
    AKUN_WALI: "Akun wali santri tidak dapat dipakai untuk mendaftarkan pondok.",
    SUDAH_DIPROSES: "Konfirmasi ini sudah diproses.",
    SANTRI_TIDAK_DITEMUKAN: "Santri tidak ditemukan.",
    KONFIRMASI_TIDAK_DITEMUKAN: "Konfirmasi tidak ditemukan.",
    JADWAL_BENTROK: "Jadwal bentrok: guru atau kelas sudah terpakai di jam itu.",
    TANGGAL_TIDAK_VALID: "Tanggal absensi tidak valid.",
    GURU_TIDAK_DITEMUKAN: "Guru tidak ditemukan.",
    JENIS_TIDAK_VALID: "Jenis nilai tidak valid.",
    "row-level security": "Perubahan ditolak: akun Anda belum berhak, atau langganan pondok sudah berakhir.",
  };
  const k = Object.keys(peta).find((x) => msg.includes(x));
  return k ? peta[k] : "Terjadi kendala. Silakan coba lagi.";
}
