import assert from "node:assert/strict";
import { terbilang, nomorWA } from "../src/lib/format";
import { hariIni, awalHari, akhirHari, tanggalValid } from "../src/lib/waktu";
import { linkWaTagihan } from "../src/modules/keuangan/wa";
import { bacaRentang, ringkasKas, type BarisKas } from "../src/modules/keuangan/laporan";

// --- terbilang
assert.equal(terbilang(0), "nol rupiah");
assert.equal(terbilang(1000), "seribu rupiah");
assert.equal(terbilang(2000), "dua ribu rupiah");
assert.equal(terbilang(111), "seratus sebelas rupiah");
assert.equal(terbilang(450_000), "empat ratus lima puluh ribu rupiah");
assert.equal(terbilang(1_250_000), "satu juta dua ratus lima puluh ribu rupiah");
assert.equal(terbilang(2_000_000_000), "dua miliar rupiah");

// --- nomor WA
assert.equal(nomorWA("0812-3456-7890"), "6281234567890");
assert.equal(nomorWA("+62 812 3456 7890"), "6281234567890");
assert.equal(nomorWA("81234567890"), "6281234567890");

// --- zona waktu: 01:00 WIB tanggal 19 = 18:00 UTC tanggal 18
assert.equal(hariIni(new Date("2026-10-18T18:00:00Z")), "2026-10-19");
assert.equal(hariIni(new Date("2026-10-19T16:59:00Z")), "2026-10-19");
assert.equal(hariIni(new Date("2026-10-19T17:00:00Z")), "2026-10-20");
assert.equal(awalHari("2026-10-19"), "2026-10-18T17:00:00.000Z");
assert.equal(akhirHari("2026-10-19"), "2026-10-19T16:59:59.999Z");
assert.ok(tanggalValid("2026-10-19") && !tanggalValid("2026-13-45") && !tanggalValid("19/10/2026") && !tanggalValid(undefined));

// --- rentang laporan
const hari = hariIni();
assert.deepEqual(bacaRentang(), { dari: hari, sampai: hari });
assert.deepEqual(bacaRentang("2026-10-10", "2026-10-05"), { dari: "2026-10-05", sampai: "2026-10-10" }, "tertukar dibetulkan");
assert.deepEqual(bacaRentang("ngawur", "juga"), { dari: hari, sampai: hari });
const r = bacaRentang("2020-01-01", "2026-10-19");
assert.ok((new Date(r.sampai).getTime() - new Date(r.dari).getTime()) / 86_400_000 <= 366, "rentang dibatasi 366 hari");

// --- ringkasan kas: yang dibatalkan tidak dihitung
const b = (nominal: number, metode: string, batal = false): BarisKas => ({ id: "x", tanggal: "", nomor: "", santri: "", nis: "", tagihan: "", metode, nominal, penerima: "", batal, alasan: batal ? "salah" : null });
const k = ringkasKas([b(200_000, "tunai"), b(450_000, "transfer"), b(999_000, "tunai", true), b(50_000, "tunai")]);
assert.equal(k.total, 700_000);
assert.equal(k.jumlah, 3);
assert.equal(k.dibatalkan, 1);
assert.deepEqual(k.perMetode, { tunai: 250_000, transfer: 450_000 });

// --- pesan WhatsApp
const dasar = { namaWali: "Abdullah", namaSantri: "Ahmad Fauzi", nis: "2026001", noWa: "0812-3456-7890", namaPondok: "Pondok Al-Hikmah", namaBendahara: "Ust. Rahman",
  rekening: "BSI 7123456789 a.n. Pondok Al-Hikmah", judul: "Syahriyah Oktober 2026", kode: "INV/202610/0001", nominal: 450_000, terbayar: 0, jatuhTempo: "2026-10-10" };
let u = new URL(linkWaTagihan(dasar));
assert.equal(u.hostname, "wa.me");
assert.equal(u.pathname, "/6281234567890");
let teks = u.searchParams.get("text")!;
for (const s of ["Abdullah", "Ahmad Fauzi", "2026001", "INV/202610/0001", "BSI 7123456789", "Pondok Al-Hikmah", "Ust. Rahman", "10 Oktober 2026"]) assert.ok(teks.includes(s), `pesan memuat: ${s}`);
assert.match(teks, /Sisa: \*Rp\s?450\.000\*/);
assert.ok(!teks.includes("Telah dibayar"), "tidak ada baris 'telah dibayar' bila belum ada pembayaran");
u = new URL(linkWaTagihan({ ...dasar, terbayar: 200_000, rekening: null, namaBendahara: null }));
teks = u.searchParams.get("text")!;
assert.match(teks, /Telah dibayar: Rp\s?200\.000/);
assert.match(teks, /Sisa: \*Rp\s?250\.000\*/);
assert.ok(!teks.includes("transfer ke"), "tanpa rekening, tidak menyebut transfer");
assert.ok(teks.includes("tunai di kantor pondok"));
// karakter khusus tidak merusak URL
u = new URL(linkWaTagihan({ ...dasar, namaWali: "Ibu & Bapak \"Zaid\" 100%" }));
assert.ok(u.searchParams.get("text")!.includes('Ibu & Bapak "Zaid" 100%'));

console.log("keuangan: semua pengujian lulus");
