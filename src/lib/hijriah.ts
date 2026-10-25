import { hariIni } from "@/lib/waktu";

const BULAN = ["Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir", "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban", "Ramadan", "Syawal", "Zulkaidah", "Zulhijjah"];
const BULAN_PENDEK = ["Muh", "Saf", "Rab. Awal", "Rab. Akhir", "Jum. Awal", "Jum. Akhir", "Raj", "Sya", "Ram", "Syaw", "Zulk", "Zulh"];

export interface TanggalHeader { masehi: string; masehiPendek: string; hijriah: string; hijriahPendek: string }

const hijriFmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { timeZone: "UTC", day: "numeric", month: "numeric", year: "numeric" });

/** tgl = YYYY-MM-DD (WIB). geser = koreksi hari (−2…+2) bila pondok mengikuti penetapan yang berbeda dari hitungan Umm al-Qura. */
export function tanggalHijriah(tgl: string, geser = 0) {
  const d = new Date(`${tgl}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + geser);
  const p = Object.fromEntries(hijriFmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { hari: Number(p.day), bulan: Number(p.month), tahun: Number(p.year) };
}

export function tanggalHeader(geser = 0, tgl: string = hariIni()): TanggalHeader {
  const d = new Date(`${tgl}T12:00:00Z`);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { timeZone: "UTC", ...o }).format(d);
  const h = tanggalHijriah(tgl, geser);
  return {
    masehi: f({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    masehiPendek: f({ day: "numeric", month: "short" }),
    hijriah: `${h.hari} ${BULAN[h.bulan - 1]} ${h.tahun} H`,
    hijriahPendek: `${h.hari} ${BULAN_PENDEK[h.bulan - 1]} ${h.tahun}`,
  };
}
