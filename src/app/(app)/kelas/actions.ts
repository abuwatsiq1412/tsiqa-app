"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { konteks } from "@/lib/konteks";
import { pesanZod } from "@/lib/santri-schema";

const skema = z.object({
  kode: z.string().trim().min(1, "Kode wajib diisi"),
  nama: z.string().trim().min(1, "Nama wajib diisi"),
  jenis: z.enum(["diniyah", "formal"], { message: "Pilih diniyah atau formal" }),
  tingkat: z.string().trim().optional(),
  wali_kelas: z.string().trim().optional(),
});
const q = encodeURIComponent;

export async function tambahKelas(form: FormData) {
  const { sb, pondokId } = await konteks();
  const p = skema.safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/kelas?galat=${q(pesanZod(p.error))}`);
  const { error } = await sb.from("kelas").insert({ ...p.data, tingkat: p.data.tingkat || null, wali_kelas: p.data.wali_kelas || null, pondok_id: pondokId });
  if (error) redirect(`/kelas?galat=${q(error.code === "23505" ? "Kode kelas sudah dipakai." : "Kelas belum dapat disimpan.")}`);
  redirect("/kelas");
}

export async function hapusKelas(form: FormData) {
  const { sb } = await konteks();
  const { error } = await sb.from("kelas").delete().eq("id", String(form.get("id")));
  redirect(error ? `/kelas?galat=${q("Kelas belum dapat dihapus.")}` : "/kelas");
}
