import { z } from "zod";
import { nomorWA } from "@/lib/format";

const kosong = (v: unknown) => (typeof v === "string" && v.trim() === "" ? undefined : v);
const teksOpsional = z.preprocess(kosong, z.string().trim().optional());
const idOpsional = z.preprocess(kosong, z.string().uuid().optional());
const tanggalOpsional = z.preprocess(kosong, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus TTTT-BB-HH").optional());

export const santriSchema = z.object({
  nis: z.string().trim().min(1, "NIS wajib diisi"),
  nama: z.string().trim().min(1, "Nama wajib diisi"),
  panggilan: teksOpsional,
  jenis_kelamin: z.enum(["L", "P"], { message: "Jenis kelamin harus L atau P" }),
  tempat_tinggal: z.enum(["mukim", "kalong"], { message: "Harus mukim atau kalong" }).default("mukim"),
  tanggal_lahir: tanggalOpsional,
  tempat_lahir: teksOpsional,
  nama_ayah: teksOpsional,
  nama_ibu: teksOpsional,
  nama_wali: z.string().trim().min(1, "Nama wali wajib diisi"),
  hubungan_wali: teksOpsional,
  no_wa_wali: z.string().transform(nomorWA).pipe(z.string().regex(/^62[0-9]{8,13}$/, "Nomor WhatsApp wali belum valid")),
  alamat_asal: teksOpsional,
  kota_asal: teksOpsional,
  kamar_id: idOpsional,
  kelas_diniyah_id: idOpsional,
  kelas_formal_id: idOpsional,
  status: z.enum(["aktif", "alumni", "boyong", "skorsing"]).default("aktif"),
  catatan: teksOpsional,
});
export type SantriInput = z.infer<typeof santriSchema>;

export const pesanZod = (e: z.ZodError) => e.issues.map((i) => i.message).join("; ");
