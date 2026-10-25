export type StatusTagihan = "belum_bayar" | "cicilan" | "lunas";
export type Metode = "tunai" | "transfer" | "qris" | "online";

export interface Tagihan { id: string; santri_id: string; kode: string; judul: string; nominal: number; terbayar: number; sisa: number; jatuh_tempo: string; status: StatusTagihan; }
export interface Pembayaran { id: string; nomor_kwitansi: string; nominal: number; tanggal: string; metode: Metode; penerima_nama: string; dibatalkan_pada: string | null; }
