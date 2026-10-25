import ExcelJS from "exceljs";
import assert from "node:assert/strict";
import { buatTemplate, bacaExcel, KOLOM } from "../src/lib/impor-santri";

const peta = {
  kamar: new Map([["a-01", "11111111-1111-4111-8111-111111111111"]]),
  diniyah: new Map([["w1", "22222222-2222-4222-8222-222222222222"]]),
  formal: new Map([["7a", "33333333-3333-4333-8333-333333333333"]]),
};

async function main() {
  // 1. template apa adanya: satu baris contoh yang valid
  let r = await bacaExcel(await buatTemplate(), peta, new Set());
  assert.equal(r.galat.length, 0, JSON.stringify(r.galat));
  assert.equal(r.baris.length, 1);
  assert.equal(r.baris[0].data.no_wa_wali, "6281234567890");
  assert.equal(r.baris[0].data.kamar_id, "11111111-1111-4111-8111-111111111111");

  // 2. berkas dengan berbagai kesalahan
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Santri");
  ws.addRow(KOLOM.map((k) => k.judul));
  ws.addRow(["001", "Ahmad", "l", "", new Date("2012-05-14"), "Wali A", "0812-3456-7890", "Bandung", "A-01", "", ""]);   // ok (L kecil, tanggal Date, mukim default)
  ws.addRow(["002", "Aisyah", "P", "kalong", "2013-01-02", "Wali B", "+62 813 1111 2222", "", "", "W1", "7A"]);          // ok
  ws.addRow(["003", "Salah WA", "L", "", "", "Wali C", "0812", "", "", "", ""]);                                          // WA salah
  ws.addRow(["001", "Dobel", "L", "", "", "Wali D", "081234567891", "", "", "", ""]);                                    // NIS dobel di berkas
  ws.addRow(["005", "Sudah Ada", "L", "", "", "Wali E", "081234567892", "", "", "", ""]);                               // NIS sudah ada di DB
  ws.addRow(["006", "Kamar Hantu", "L", "", "", "Wali F", "081234567893", "", "Z-99", "", ""]);                          // kamar tak ada
  ws.addRow(["007", "JK Salah", "X", "", "", "Wali G", "081234567894", "", "", "", ""]);                                 // JK salah
  ws.addRow(["", "", "", "", "", "", "", "", "", "", ""]);                                                               // baris kosong: diabaikan
  ws.addRow(["008", "Tgl Salah", "L", "", "14/05/2012", "Wali H", "081234567895", "", "", "", ""]);                      // format tanggal salah
  r = await bacaExcel(Buffer.from(await wb.xlsx.writeBuffer()), peta, new Set(["005"]));

  assert.deepEqual(r.baris.map((b) => b.data.nis), ["001", "002"]);
  assert.equal(r.baris[0].data.tanggal_lahir, "2012-05-14");
  assert.equal(r.baris[0].data.tempat_tinggal, "mukim");
  assert.equal(r.baris[1].data.no_wa_wali, "6281311112222");
  assert.equal(r.baris[1].data.tempat_tinggal, "kalong");
  assert.deepEqual(r.galat.map((g) => g.nomor), [4, 5, 6, 7, 8, 10]);
  assert.match(r.galat[0].pesan, /WhatsApp/);
  assert.match(r.galat[1].pesan, /dua kali/);
  assert.match(r.galat[2].pesan, /sudah terdaftar/);
  assert.match(r.galat[3].pesan, /tidak ditemukan/);
  assert.match(r.galat[4].pesan, /L atau P/);
  assert.match(r.galat[5].pesan, /tanggal/i);

  // 3. berkas rusak
  await assert.rejects(() => bacaExcel(Buffer.from("bukan excel"), peta, new Set()));
  console.log("impor: semua pengujian lulus");
}
main().catch((e) => { console.error(e); process.exit(1); });
