"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { konteks } from "@/lib/konteks";
import { pesanZod } from "@/lib/santri-schema";

const skema = z.object({
  kode: z.string().trim().min(1, "Kode wajib diisi"),
  nama: z.string().trim().min(1, "Nama wajib diisi"),
  jenis: z.enum(["putra", "putri"], { message: "Pilih putra atau putri" }),
  komplek: z.string().trim().optional(),
  musyrif: z.string().trim().optional(),
  kapasitas: z.coerce.number().int().min(1, "Kapasitas minimal 1").default(20),
});
const q = encodeURIComponent;

export async function tambahKamar(form: FormData) {
  const { sb, pondokId } = await konteks();
  const p = skema.safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/kamar?galat=${q(pesanZod(p.error))}`);
  const { error } = await sb.from("kamar").insert({ ...p.data, komplek: p.data.komplek || null, musyrif: p.data.musyrif || null, pondok_id: pondokId });
  if (error) redirect(`/kamar?galat=${q(error.code === "23505" ? "Kode kamar sudah dipakai." : "Kamar belum dapat disimpan.")}`);
  redirect("/kamar");
}

export async function hapusKamar(form: FormData) {
  const { sb } = await konteks();
  const { error } = await sb.from("kamar").delete().eq("id", String(form.get("id")));
  // santri yang menghuni otomatis menjadi "belum ditempatkan"
  redirect(error ? `/kamar?galat=${q("Kamar belum dapat dihapus.")}` : "/kamar");
}
