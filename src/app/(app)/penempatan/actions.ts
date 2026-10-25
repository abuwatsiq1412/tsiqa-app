"use server";
import { redirect } from "next/navigation";
import { konteks } from "@/lib/konteks";
import { pesanGalat } from "@/lib/format";

const q = encodeURIComponent;
const uuid = /^[0-9a-f-]{36}$/;
const atauNull = (v: FormDataEntryValue | null) => (typeof v === "string" && uuid.test(v) ? v : null);

export async function tempatkan(form: FormData) {
  const { sb } = await konteks();
  const ids = form.getAll("santri").map(String).filter((x) => uuid.test(x));
  if (ids.length === 0) redirect(`/penempatan?galat=${q("Pilih setidaknya satu santri.")}`);
  const { data, error } = await sb.rpc("tempatkan_santri", {
    p_ids: ids, p_kamar: atauNull(form.get("kamar")), p_diniyah: atauNull(form.get("diniyah")), p_formal: atauNull(form.get("formal")),
    p_keterangan: String(form.get("keterangan") ?? "").trim() || null,
  });
  if (error) redirect(`/penempatan?galat=${q(pesanGalat(error.message))}`);
  redirect(`/penempatan?ok=${data}`);
}
