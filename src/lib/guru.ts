import { cache } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export const muatGuru = cache(async () => {
  const sb = await supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/guru/masuk");
  const { data: ids } = await sb.rpc("guru_saya");
  if (!ids || (ids as unknown[]).length === 0) redirect("/guru/masuk?galat=2");
  return { sb, user };
});

/** Nomor hari menurut WIB: 1 Senin … 7 Ahad. */
export function hariKe(tgl: string) {
  const d = new Date(`${tgl}T12:00:00Z`).getUTCDay();
  return d === 0 ? 7 : d;
}
