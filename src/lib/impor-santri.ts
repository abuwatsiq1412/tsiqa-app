import ExcelJS from "exceljs";
import { santriSchema, pesanZod, type SantriInput } from "@/lib/santri-schema";

export const KOLOM = [
  { kunci: "nis", judul: "NIS", lebar: 12 },
  { kunci: "nama", judul: "Nama Lengkap", lebar: 28 },
  { kunci: "jenis_kelamin", judul: "Jenis Kelamin (L/P)", lebar: 18 },
  { kunci: "tempat_tinggal", judul: "Mukim/Kalong", lebar: 14 },
  { kunci: "tanggal_lahir", judul: "Tanggal Lahir (TTTT-BB-HH)", lebar: 24 },
  { kunci: "nama_wali", judul: "Nama Wali", lebar: 24 },
  { kunci: "no_wa_wali", judul: "No. WhatsApp Wali", lebar: 20 },
  { kunci: "kota_asal", judul: "Kota Asal", lebar: 16 },
  { kunci: "kamar", judul: "Kode Kamar", lebar: 12 },
  { kunci: "kelas_diniyah", judul: "Kode Kelas Diniyah", lebar: 18 },
  { kunci: "kelas_formal", judul: "Kode Kelas Formal", lebar: 18 },
] as const;

export async function buatTemplate(): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Santri");
  ws.columns = KOLOM.map((k) => ({ header: k.judul, key: k.kunci, width: k.lebar }));
  ws.getRow(1).font = { bold: true };
  ws.addRow({
    nis: "2026001",
    nama: "Ahmad Fauzi",
    jenis_kelamin: "L",
    tempat_tinggal: "mukim",
    tanggal_lahir: "2012-05-14",
    nama_wali: "Abdullah",
    no_wa_wali: "081234567890",
    kota_asal: "Bandung",
    kamar: "A-01",
    kelas_diniyah: "W1",
    kelas_formal: "7A",
  });
  const info = wb.addWorksheet("Petunjuk");
  [
    "Isi data mulai baris 2 pada lembar Santri. Hapus baris contoh sebelum mengunggah.",
    "Kolom wajib: NIS, Nama Lengkap, Jenis Kelamin, Nama Wali, No. WhatsApp Wali.",
    "Jenis Kelamin: L atau P. Mukim/Kalong: tulis mukim atau kalong (kosong = mukim).",
    "No. WhatsApp boleh diawali 0, 8, atau 62 (spasi/tanda hubung akan dibersihkan otomatis).",
    "Kode Kamar dan Kode Kelas harus sama dengan yang sudah ada di menu Kamar dan Kelas (boleh dikosongkan).",
    "Baris dengan NIS yang sudah terdaftar akan dilewati.",
  ].forEach((t) => info.addRow([t]));
  info.getColumn(1).width = 110;
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export interface HasilBaca {
  baris: { nomor: number; data: SantriInput }[];
  galat: { nomor: number; pesan: string }[];
}

type Peta = { kamar: Map<string, string>; diniyah: Map<string, string>; formal: Map<string, string> };

function teks(v: ExcelJS.CellValue): string {
  if (v == null) return "";
  if (v instanceof Date) {
    // Hindari pergeseran mundur 1 hari akibat timezone lokal saat membaca objek Date Excel
    const koreksi = new Date(v.getTime() - v.getTimezoneOffset() * 60000);
    return koreksi.toISOString().slice(0, 10);
  }
  if (typeof v === "object") {
    if ("text" in v && typeof v.text === "string") return v.text.trim();
    if ("result" in v && v.result != null) return String(v.result).trim();
    if ("richText" in v) return v.richText.map((r) => r.text).join("").trim();
  }
  return String(v).trim();
}

/** Sanitasi format tanggal DD/MM/YYYY atau DD-MM-YYYY dari Excel EMIS/Dapodik ke YYYY-MM-DD */
function normalisasiTanggal(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const m = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(s);
  if (m) {
    const hh = m[1].padStart(2, "0");
    const bb = m[2].padStart(2, "0");
    return `${m[3]}-${bb}-${hh}`;
  }
  return s;
}

/** Sanitasi nomor WA dari spasi, strip, titik, atau tanda + (ambil nomor pertama bila ditulis ganda) */
function bersihkanWa(raw: string): string {
  if (!raw) return "";
  const pertama = raw.split(/[\/,;]/)[0] ?? raw;
  return pertama.replace(/[^0-9]/g, "");
}

export async function bacaExcel(
  buf: Buffer | ArrayBuffer,
  peta: Peta,
  nisAda: Set<string>
): Promise<HasilBaca> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf as ExcelJS.Buffer);
  const ws = wb.getWorksheet("Santri") ?? wb.worksheets[0];
  const hasil: HasilBaca = { baris: [], galat: [] };
  if (!ws) return hasil;

  const lihat = new Set<string>();
  ws.eachRow({ includeEmpty: false }, (row, nomor) => {
    if (nomor === 1) return;
    const sel = (i: number) => teks(row.getCell(i + 1).value);
    const mentah: Record<string, string> = {};
    KOLOM.forEach((k, i) => (mentah[k.kunci] = sel(i)));
    if (Object.values(mentah).every((x) => x === "")) return;

    const galat: string[] = [];
    const cari = (nilai: string, p: Map<string, string>, label: string) => {
      if (!nilai) return undefined;
      const id = p.get(nilai.toLowerCase());
      if (!id) galat.push(`${label} "${nilai}" tidak ditemukan`);
      return id;
    };
    const kamar_id = cari(mentah.kamar, peta.kamar, "Kode kamar");
    const kelas_diniyah_id = cari(mentah.kelas_diniyah, peta.diniyah, "Kode kelas diniyah");
    const kelas_formal_id = cari(mentah.kelas_formal, peta.formal, "Kode kelas formal");

    const parsed = santriSchema.safeParse({
      nis: mentah.nis.trim(),
      nama: mentah.nama.trim(),
      jenis_kelamin: mentah.jenis_kelamin.toUpperCase(),
      tempat_tinggal: mentah.tempat_tinggal.toLowerCase() || "mukim",
      tanggal_lahir: normalisasiTanggal(mentah.tanggal_lahir),
      nama_wali: mentah.nama_wali.trim(),
      no_wa_wali: bersihkanWa(mentah.no_wa_wali),
      kota_asal: mentah.kota_asal.trim(),
      kamar_id,
      kelas_diniyah_id,
      kelas_formal_id,
    });
    if (!parsed.success) galat.push(pesanZod(parsed.error));
    else if (nisAda.has(parsed.data.nis)) galat.push(`NIS ${parsed.data.nis} sudah terdaftar`);
    else if (lihat.has(parsed.data.nis)) galat.push(`NIS ${parsed.data.nis} muncul dua kali di berkas`);

    if (galat.length || !parsed.success) hasil.galat.push({ nomor, pesan: galat.join("; ") });
    else {
      lihat.add(parsed.data.nis);
      hasil.baris.push({ nomor, data: parsed.data });
    }
  });
  return hasil;
}