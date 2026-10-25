"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { konteks } from "@/lib/konteks";
import { pesanGalat } from "@/lib/format";

export async function simpanPengaturanKeuangan(form: FormData) {
  const { sb, pondokId } = await konteks();
  const p = z.object({ syahriyah_default: z.coerce.number().int().min(0, "Syahriyah tidak boleh negatif"), rekening_resmi: z.string().trim().optional() }).safeParse(Object.fromEntries(form.entries()));
  if (!p.success) redirect(`/keuangan/pengaturan?galat=${encodeURIComponent(p.error.issues[0].message)}`);
  const { data, error } = await sb.from("keuangan_pengaturan").upsert({ pondok_id: pondokId, syahriyah_default: p.data.syahriyah_default, rekening_resmi: p.data.rekening_resmi || null }, { onConflict: "pondok_id" }).select("pondok_id");
  redirect(error || !data?.length ? `/keuangan/pengaturan?galat=${encodeURIComponent(pesanGalat(error?.message ?? "TIDAK_BERHAK"))}` : "/keuangan/pengaturan?ok=1");
}
