import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export const adalahStaf = cache(async function adalahStaf(): Promise<boolean> {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const { data } = await sb.from("staf_tsiqa").select("user_id").eq("user_id", user.id).maybeSingle();
  return !!data;
});

/** Dipakai di setiap halaman dan aksi konsol. RLS di database tetap menjadi penjaga terakhir. */
export async function wajibStaf() {
  if (!(await adalahStaf())) redirect("/hari-ini");
  return supabaseServer();
}
