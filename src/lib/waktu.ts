// Semua perhitungan "hari ini" memakai WIB agar tidak bergeser di server berzona UTC.
export const ZONA = "Asia/Jakarta";
const OFFSET = "+07:00";

/** YYYY-MM-DD menurut WIB. */
export const hariIni = (d: Date = new Date()) => new Intl.DateTimeFormat("sv-SE", { timeZone: ZONA }).format(d);
export const awalHari = (tgl: string) => new Date(`${tgl}T00:00:00${OFFSET}`).toISOString();
export const akhirHari = (tgl: string) => new Date(`${tgl}T23:59:59.999${OFFSET}`).toISOString();
export const tanggalValid = (s: string | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(`${s}T00:00:00${OFFSET}`).getTime());

export const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export const waktuLengkap = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) + " WIB";
export const tanggalLengkap = (s: string) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: ZONA, day: "numeric", month: "long", year: "numeric" }).format(new Date(s.length === 10 ? `${s}T00:00:00${OFFSET}` : s));
