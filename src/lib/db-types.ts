export type Peran = "admin" | "bendahara" | "staf_tu";

export interface Santri { id: string; pondok_id: string; nis: string; nama: string; nama_wali: string; no_wa_wali: string; status: "aktif" | "alumni" | "boyong" | "skorsing"; }
