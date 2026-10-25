"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { konteks } from "@/lib/konteks";
import { pesanGalat } from "@/lib/format";
import { pesanZod } from "@/lib/santri-schema";

const q = encodeURIComponent;
const opsi = z.string().trim().transform((v) => v || null);

export async function simpanPondok(form: FormData) {
  const { sb, pondokId } = await konteks();
  const p = z.object({
    nama: z.string().trim().min(1, "Nama pondok wajib diisi"),
    nspp: opsi, alamat: opsi, kota: opsi, telepon: opsi, email: opsi, nama_pimpinan: opsi, nama_bendahara: opsi,
    geser_hijriah: z.coerce.number().int().min(-2).max(2).optional(),
  }).safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/pengaturan?galat=${q(pesanZod(p.error))}`);
  const { data, error } = await sb.from("pondok").update(p.data).eq("id", pondokId).select("id");
  if (error || !data?.length) redirect(`/pengaturan?galat=${q(error ? pesanGalat(error.message) : pesanGalat("TIDAK_BERHAK"))}`);
  redirect("/pengaturan?ok=1");
}

export async function tambahTahunAjaran(form: FormData) {
  const { sb, pondokId } = await konteks();
  const p = z.object({
    nama: z.string().trim().regex(/^\d{4}\/\d{4}$/, "Format tahun ajaran: 2026/2027"),
    semester: z.enum(["ganjil", "genap"]),
  }).safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/pengaturan?galat=${q(pesanZod(p.error))}`);
  const { error } = await sb.from("tahun_ajaran").insert({ ...p.data, pondok_id: pondokId });
  redirect(error ? `/pengaturan?galat=${q(error.code === "23505" ? "Tahun ajaran dan semester itu sudah ada." : pesanGalat(error.message))}` : "/pengaturan");
}

export async function aktifkanTahunAjaran(form: FormData) {
  const { sb } = await konteks();
  const { error } = await sb.rpc("aktifkan_tahun_ajaran", { p_id: String(form.get("id")) });
  redirect(error ? `/pengaturan?galat=${q(pesanGalat(error.message))}` : "/pengaturan");
}
