import { nomorWA, rupiah } from "@/lib/format";
import { tanggalLengkap } from "@/lib/waktu";

export interface DataPesan {
  namaWali: string; namaSantri: string; nis: string; noWa: string;
  namaPondok: string; namaBendahara?: string | null; rekening?: string | null;
  judul: string; kode: string; nominal: number; terbayar: number; jatuhTempo: string;
}

/** Tautan wa.me berisi pesan tagihan yang sopan. Dikirim manual oleh petugas sampai modul WhatsApp Gateway tersedia. */
export function linkWaTagihan(d: DataPesan): string {
  const sisa = Math.max(0, d.nominal - d.terbayar);
  const baris = [
    "Assalamu'alaikum warahmatullahi wabarakatuh.",
    `Yth. Bapak/Ibu *${d.namaWali}* (wali dari ananda *${d.namaSantri}*, NIS ${d.nis}),`,
    "",
    `Kami dari bagian keuangan *${d.namaPondok}* menyampaikan informasi administrasi santri:`,
    "",
    `• Rincian: ${d.judul}`,
    `• No. tagihan: ${d.kode}`,
    `• Total tagihan: ${rupiah(d.nominal)}`,
    d.terbayar > 0 ? `• Telah dibayar: ${rupiah(d.terbayar)}` : null,
    `• Sisa: *${rupiah(sisa)}*`,
    `• Jatuh tempo: ${tanggalLengkap(d.jatuhTempo)}`,
    "",
    d.rekening ? `Pembayaran dapat dilakukan tunai di kantor pondok atau melalui transfer ke: ${d.rekening}` : "Pembayaran dapat dilakukan tunai di kantor pondok.",
    "Apabila sudah membayar, mohon kirimkan bukti pembayaran melalui WhatsApp ini agar kami terbitkan kwitansinya.",
    "",
    "Jazakumullahu khairan atas perhatian Bapak/Ibu.",
    "Wassalamu'alaikum warahmatullahi wabarakatuh.",
    d.namaBendahara ? `\n${d.namaPondok}\n${d.namaBendahara}` : `\n${d.namaPondok}`,
  ];
  const pesan = baris.filter((b): b is string => b !== null).join("\n");
  return `https://wa.me/${nomorWA(d.noWa)}?text=${encodeURIComponent(pesan)}`;
}
