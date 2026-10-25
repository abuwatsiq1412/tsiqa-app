"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { konteks } from "@/lib/konteks";
import { pesanGalat } from "@/lib/format";

const q = encodeURIComponent;

export async function simpanKeringanan(form: FormData) {
  const { sb, pondokId } = await konteks();
  const p = z.object({
    santri_id: z.string().uuid("Pilih santri terlebih dahulu"),
    nominal: z.coerce.number().int().min(0, "Nominal tidak boleh negatif"),
    catatan: z.string().trim().optional(),
  }).safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/keuangan/keringanan?galat=${q(p.error.issues[0].message)}`);
  const { data, error } = await sb.from("keringanan_santri")
    .upsert({ pondok_id: pondokId, santri_id: p.data.santri_id, nominal: p.data.nominal, catatan: p.data.catatan || null }, { onConflict: "pondok_id,santri_id" }).select("santri_id");
  redirect(error || !data?.length ? `/keuangan/keringanan?galat=${q(pesanGalat(error?.message ?? "TIDAK_BERHAK"))}` : "/keuangan/keringanan?ok=1");
}

export async function hapusKeringanan(form: FormData) {
  const { sb } = await konteks();
  const { error } = await sb.from("keringanan_santri").delete().eq("santri_id", String(form.get("santri_id")));
  redirect(error ? `/keuangan/keringanan?galat=${q(pesanGalat(error.message))}` : "/keuangan/keringanan");
}
