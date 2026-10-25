"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { wajibStaf } from "@/lib/staf";
import { pesanGalat } from "@/lib/format";

export async function ubahModul(form: FormData) {
  const sb = await wajibStaf();
  const p = z.object({ kode: z.string().min(1), harga_bulanan: z.coerce.number().int().min(0) }).safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/konsol/modul?galat=${encodeURIComponent("Harga belum valid.")}`);
  const { error } = await sb.from("modul").update({ harga_bulanan: p.data.harga_bulanan, tersedia: form.get("tersedia") === "on" }).eq("kode", p.data.kode);
  redirect(error ? `/konsol/modul?galat=${encodeURIComponent(pesanGalat(error.message))}` : "/konsol/modul?ok=1");
}
