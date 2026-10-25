import assert from "node:assert/strict";
import { hargaCore, perkiraanBulanan, statusAkses } from "../src/lib/harga";

// Angka dari proposal
assert.equal(hargaCore(100), 64_000);
assert.equal(hargaCore(150), 74_000);
assert.equal(hargaCore(200), 84_000);
assert.equal(hargaCore(350), 114_000);       // sesuai paket Lengkap
assert.equal(hargaCore(101), 74_000);        // sebagian blok dibulatkan ke atas
assert.equal(hargaCore(50), 64_000);

// Paket Hemat: Core saja, tahunan 11 bulan
assert.equal(perkiraanBulanan(100, "bulanan", []), 64_000);
assert.equal(perkiraanBulanan(100, "tahunan", []), 58_667);          // 704.000 / 12, dibulatkan
assert.ok(Math.abs(perkiraanBulanan(100, "tahunan", []) * 12 - 704_000) < 12);
// Administrasi & SPP: 64.000 + 90.000 diskon 10% = 145.000
assert.equal(perkiraanBulanan(100, "bulanan", [30_000, 30_000, 30_000]), 145_000);
// Favorit 200 santri: 84.000 + 155.000 diskon 15% = 215.750
assert.equal(perkiraanBulanan(200, "bulanan", [30_000, 30_000, 40_000, 25_000, 30_000]), 215_750);
// Lengkap 350 santri, 10 modul (250.000, diskon 15%) = 326.500
assert.equal(perkiraanBulanan(350, "bulanan", [30,30,30,40,25,25,20,20,15,15].map((x) => x * 1000)), 326_500);

const h = new Date("2026-10-19T03:00:00Z");
assert.equal(statusAkses("aktif", "2026-10-19", h), "aktif");
assert.equal(statusAkses("aktif", "2026-10-18", h), "tenggang");
assert.equal(statusAkses("aktif", "2026-10-12", h), "tenggang");
assert.equal(statusAkses("aktif", "2026-10-11", h), "terkunci");
assert.equal(statusAkses("percobaan", "2026-11-01", h), "percobaan");
assert.equal(statusAkses("berhenti", "2027-01-01", h), "berhenti");
console.log("harga: semua pengujian lulus");
