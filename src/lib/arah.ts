import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Satu-satunya aturan "setelah masuk, ke mana?". Dipakai halaman masuk, middleware, dan layout.
 * Peran baru (wali, guru) cukup menambah satu cabang di sini.
 */
export async function tujuanSetelahLogin(sb: SupabaseClient, userId: string): Promise<string> {
  const { data: staf } = await sb.from("staf_tsiqa").select("user_id").eq("user_id", userId).maybeSingle();
  if (staf) return "/konsol";
  const { data: anggota } = await sb.from("anggota_pondok").select("id").eq("aktif", true).limit(1).maybeSingle();
  if (anggota) return "/hari-ini";
  const { data: wali } = await sb.from("wali_akun").select("id").limit(1).maybeSingle();
  if (wali) return "/wali";
  const { data: guru } = await sb.from("guru").select("id").eq("user_id", userId).limit(1).maybeSingle();
  return guru ? "/guru" : "/mulai";
}
